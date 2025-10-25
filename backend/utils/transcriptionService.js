 import videoIntelligence from '@google-cloud/video-intelligence';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Storage } from '@google-cloud/storage';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Google Cloud Video Intelligence client
const videoClient = new videoIntelligence.VideoIntelligenceServiceClient({
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
 * Transcribe video using Google Video Intelligence API (designed for videos!)
 */
const transcribeVideoDirectly = async (videoFileName) => {
    try {
        console.log('🎬 Starting transcription using Video Intelligence API...');
        
        const gcsUri = `gs://${process.env.GCS_BUCKET_NAME}/${videoFileName}`;
        console.log('📹 Video URI:', gcsUri);
        
        const request = {
            inputUri: gcsUri,
            features: ['SPEECH_TRANSCRIPTION'],
            videoContext: {
                speechTranscriptionConfig: {
                    languageCode: 'en-US',
                    enableAutomaticPunctuation: true,
                }
            }
        };

        console.log('🚀 Starting video analysis...');
        
        // Start the long-running operation
        const [operation] = await videoClient.annotateVideo(request);
        
        console.log('⏳ Transcription in progress... This may take several minutes.');
        console.log('📊 Operation name:', operation.name);
        
        // Wait for the operation to complete
        const [operationResult] = await operation.promise();
        
        console.log('✅ Video analysis completed!');
        
        // Get transcription results
        const transcriptionResult = operationResult.annotationResults[0];
        
        if (!transcriptionResult.speechTranscriptions || transcriptionResult.speechTranscriptions.length === 0) {
            console.log('⚠️ No speech detected in video');
            return '';
        }
        
        // Combine all transcription alternatives
        const transcription = transcriptionResult.speechTranscriptions
            .map(speechTranscription => {
                return speechTranscription.alternatives[0].transcript;
            })
            .join(' ');
        
        console.log('✅ Transcription extracted successfully');
        console.log('📝 Transcript length:', transcription.length, 'characters');
        
        return transcription;
    } catch (error) {
        console.error('❌ Error transcribing video:', error);
        console.error('Error details:', error.message);
        throw error;
    }
};

/**
 * Generate transcript for a video (NO FFMPEG REQUIRED - Pure GCP Solution!)
 */
export const generateTranscript = async (videoFileName) => {
    try {
        console.log('🎬 Starting transcript generation for:', videoFileName);
        console.log('📹 Using GCP Video Intelligence API (designed for videos!)');
        
        // Transcribe video directly from GCS
        const transcript = await transcribeVideoDirectly(videoFileName);
        
        console.log('✅ Transcript generated successfully');
        console.log('📝 Transcript length:', transcript.length, 'characters');
        return transcript;
    } catch (error) {
        console.error('❌ Error generating transcript:', error);
        return ''; // Return empty string on error
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
        
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
        
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
            console.log('✅ Transcript saved to video');
            
            // Generate summary (don't block saving if this fails)
            try {
                const summary = await generateSummary(transcript);
                if (summary) {
                    video.summary = summary;
                    console.log('✅ Summary saved to video');
                }
            } catch (summaryError) {
                console.error('⚠️ Failed to generate summary, but transcript was saved:', summaryError.message);
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
