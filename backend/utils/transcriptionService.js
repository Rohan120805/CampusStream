import speech from '@google-cloud/speech';
import { GoogleGenerativeAI } from '@google/generative-ai';
import ffmpeg from 'fluent-ffmpeg';
import { Storage } from '@google-cloud/storage';
import path from 'path';
import { promises as fs } from 'fs';
import os from 'os';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Set FFmpeg path explicitly (Windows)
if (process.platform === 'win32') {
    // Try common installation paths
    const ffmpegPaths = [
        'C:\\Program Files\\ffmpeg\\bin\\ffmpeg.exe',
        'C:\\ffmpeg\\bin\\ffmpeg.exe',
        process.env.FFMPEG_PATH
    ];
    
    for (const ffmpegPath of ffmpegPaths) {
        if (ffmpegPath) {
            try {
                ffmpeg.setFfmpegPath(ffmpegPath);
                console.log('✅ FFmpeg path set to:', ffmpegPath);
                break;
            } catch (err) {
                // Continue to next path
            }
        }
    }
}

// Initialize Google Cloud Speech client
const speechClient = new speech.SpeechClient({
    keyFilename: path.join(__dirname, '../../', process.env.GCS_KEY_FILE)
});

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Initialize Google Cloud Storage
const storage = new Storage({
    keyFilename: path.join(__dirname, '../../', process.env.GCS_KEY_FILE),
    projectId: process.env.GCS_PROJECT_ID
});

/**
 * Extract audio from video and save to temporary file
 */
const extractAudioFromVideo = (videoPath, outputPath) => {
    return new Promise((resolve, reject) => {
        ffmpeg(videoPath)
            .output(outputPath)
            .audioCodec('libmp3lame')
            .audioChannels(1)
            .audioFrequency(16000)
            .format('mp3')
            .on('end', () => {
                console.log('✅ Audio extracted successfully');
                resolve(outputPath);
            })
            .on('error', (err) => {
                console.error('❌ Error extracting audio:', err);
                reject(err);
            })
            .run();
    });
};

/**
 * Download video from GCS to temporary file
 */
const downloadVideoFromGCS = async (videoFileName) => {
    try {
        const bucketName = process.env.GCS_BUCKET_NAME;
        
        // Create temporary file path
        const tempVideoPath = path.join(os.tmpdir(), `video_${Date.now()}_${path.basename(videoFileName)}`);
        
        console.log('📥 Downloading video from GCS...');
        await storage.bucket(bucketName).file(videoFileName).download({
            destination: tempVideoPath
        });
        
        console.log('✅ Video downloaded to:', tempVideoPath);
        return tempVideoPath;
    } catch (error) {
        console.error('❌ Error downloading video from GCS:', error);
        throw error;
    }
};

/**
 * Transcribe audio using Google Speech-to-Text
 */
const transcribeAudio = async (audioPath) => {
    try {
        console.log('🎤 Starting transcription...');
        
        // Read the audio file
        const audioBytes = await fs.readFile(audioPath);
        
        const request = {
            audio: {
                content: audioBytes.toString('base64')
            },
            config: {
                encoding: 'MP3',
                sampleRateHertz: 16000,
                languageCode: 'en-US',
                enableAutomaticPunctuation: true,
                enableWordTimeOffsets: false,
                model: 'default'
            }
        };

        // For longer audio, use longRunningRecognize
        const audioSizeInMB = audioBytes.length / (1024 * 1024);
        
        if (audioSizeInMB > 10) {
            console.log('📊 Large audio file detected, using long-running recognition...');
            // Upload audio to GCS for long-running recognition
            const bucket = storage.bucket(process.env.GCS_BUCKET_NAME);
            const tempAudioFile = `temp-audio/${Date.now()}.mp3`;
            await bucket.file(tempAudioFile).save(audioBytes);
            
            const gcsUri = `gs://${process.env.GCS_BUCKET_NAME}/${tempAudioFile}`;
            
            const [operation] = await speechClient.longRunningRecognize({
                audio: { uri: gcsUri },
                config: request.config
            });
            
            const [response] = await operation.promise();
            
            // Clean up temp audio file
            await bucket.file(tempAudioFile).delete();
            
            const transcription = response.results
                .map(result => result.alternatives[0].transcript)
                .join('\n');
            
            return transcription;
        } else {
            // Use regular recognition for smaller files
            const [response] = await speechClient.recognize(request);
            
            const transcription = response.results
                .map(result => result.alternatives[0].transcript)
                .join('\n');
            
            return transcription;
        }
    } catch (error) {
        console.error('❌ Error transcribing audio:', error);
        throw error;
    }
};

/**
 * Generate transcript for a video
 */
export const generateTranscript = async (videoFileName) => {
    let tempVideoPath = null;
    let tempAudioPath = null;
    
    try {
        console.log('🎬 Starting transcript generation for:', videoFileName);
        
        // Download video from GCS
        tempVideoPath = await downloadVideoFromGCS(videoFileName);
        
        // Extract audio
        tempAudioPath = path.join(os.tmpdir(), `audio_${Date.now()}.mp3`);
        await extractAudioFromVideo(tempVideoPath, tempAudioPath);
        
        // Transcribe audio
        const transcript = await transcribeAudio(tempAudioPath);
        
        console.log('✅ Transcript generated successfully');
        console.log('📝 Transcript length:', transcript.length, 'characters');
        return transcript;
    } catch (error) {
        console.error('❌ Error generating transcript:', error);
        return ''; // Return empty string on error
    } finally {
        // Clean up temporary files
        try {
            if (tempVideoPath) await fs.unlink(tempVideoPath);
            if (tempAudioPath) await fs.unlink(tempAudioPath);
            console.log('🧹 Cleaned up temporary files');
        } catch (cleanupError) {
            console.error('⚠️ Error cleaning up temporary files:', cleanupError);
        }
    }
};

/**
 * Generate summary from transcript using Gemini API
 */
export const generateSummary = async (transcript) => {
    try {
        if (!transcript || transcript.trim().length === 0) {
            return '';
        }
        
        console.log('🤖 Generating summary using Gemini AI...');
        
        const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
        
        const prompt = `Please provide a concise summary of the following video transcript. 
Focus on the main topics, key points, and important concepts discussed.
Keep the summary brief (3-5 sentences).

Transcript:
${transcript}

Summary:`;
        
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const summary = response.text();
        
        console.log('✅ Summary generated successfully');
        return summary;
    } catch (error) {
        console.error('❌ Error generating summary:', error);
        return '';
    }
};

/**
 * Process video in background - generate transcript and summary
 */
export const processVideoTranscription = async (video) => {
    try {
        console.log('🚀 Starting background transcription for video:', video._id);
        
        // Generate transcript
        const transcript = await generateTranscript(video.fileName);
        
        if (transcript) {
            // Update video with transcript
            video.transcript = transcript;
            
            // Generate summary
            const summary = await generateSummary(transcript);
            if (summary) {
                video.summary = summary;
            }
            
            await video.save();
            console.log('✅ Video transcription completed and saved');
        } else {
            console.log('⚠️ No transcript generated');
        }
    } catch (error) {
        console.error('❌ Error in background transcription:', error);
    }
};
