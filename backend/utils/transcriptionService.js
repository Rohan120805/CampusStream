import Groq from 'groq-sdk';
import { uploadToCloudinary } from '../config/storage.js';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

/**
 * Transform a Cloudinary video URL to a low-bitrate audio URL.
 * Uses Cloudinary URL transformations to extract audio as MP3 at 32kbps.
 * A 60-minute lecture at 32kbps mono is approximately 14MB (under Groq's 25MB limit).
 */
export const getAudioUrl = (videoUrl) => {
    const url = new URL(videoUrl);
    const pathParts = url.pathname.split('/');
    const uploadIndex = pathParts.indexOf('upload');

    if (uploadIndex === -1) {
        throw new Error('Invalid Cloudinary video URL format');
    }

    // Insert audio transformation right after 'upload'
    pathParts.splice(uploadIndex + 1, 0, 'f_mp3,br_32k');

    // Change file extension to .mp3
    const lastPart = pathParts[pathParts.length - 1];
    pathParts[pathParts.length - 1] = lastPart.replace(/\.[^.]+$/, '.mp3');

    url.pathname = pathParts.join('/');
    return url.toString();
};

/**
 * Generate transcript from a video URL using Groq Whisper.
 * 1. Construct low-bitrate audio URL via Cloudinary transformation
 * 2. Download the audio file
 * 3. Send to Groq Whisper large-v3
 * 4. Return transcript text
 */
export const generateTranscript = async (videoUrl) => {
    console.log('Starting transcript generation for:', videoUrl);

    // Step 1: Get audio URL
    const audioUrl = getAudioUrl(videoUrl);
    console.log('Audio URL:', audioUrl);

    // Step 2: Download audio
    const response = await fetch(audioUrl);
    if (!response.ok) {
        throw new Error(`Failed to download audio: ${response.status} ${response.statusText}`);
    }

    const audioBuffer = Buffer.from(await response.arrayBuffer());
    console.log(`Audio downloaded: ${(audioBuffer.length / 1024 / 1024).toFixed(2)} MB`);

    // Step 3: Check size limit (25MB for Groq Whisper)
    if (audioBuffer.length > 25 * 1024 * 1024) {
        throw new Error(
            'Audio file is too large for transcription (>25MB). ' +
            'Try uploading a shorter video or manually upload a transcript.'
        );
    }

    // Step 4: Send to Groq Whisper
    const file = new File([audioBuffer], 'audio.mp3', { type: 'audio/mpeg' });
    const transcription = await groq.audio.transcriptions.create({
        file: file,
        model: 'whisper-large-v3',
        language: 'en',
    });

    console.log('Transcript generated successfully');
    return transcription.text;
};

/**
 * Generate summary from transcript using Groq LLM.
 */
export const generateSummary = async (transcript) => {
    try {
        if (!transcript || transcript.trim().length === 0) {
            return '';
        }

        console.log('Generating summary using Groq...');

        const prompt = `Please provide a concise summary of the following video transcript.
Focus on the main topics, key points, and important concepts discussed.
Keep the summary brief (3-5 sentences).

Transcript:
${transcript}

Summary:`;

        const completion = await groq.chat.completions.create({
            model: 'llama-3.3-70b-versatile',
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.5,
            max_tokens: 1024,
        });

        const summary = completion.choices[0].message.content;
        console.log('Summary generated successfully');
        return summary;
    } catch (error) {
        console.error('Error generating summary:', error);
        return '';
    }
};

/**
 * Process video transcription end-to-end:
 * generate transcript from video URL, upload it to Cloudinary, then generate summary.
 */
export const processVideoTranscription = async (video) => {
    try {
        console.log('Starting transcription for video:', video._id);

        const transcript = await generateTranscript(video.videoUrl);

        if (transcript) {
            video.transcript = transcript;

            // Upload transcript text to Cloudinary as a raw file
            try {
                const transcriptBuffer = Buffer.from(transcript, 'utf-8');
                const transcriptUrl = await uploadToCloudinary(transcriptBuffer, 'transcripts', 'raw');
                video.transcriptUrl = transcriptUrl;
                console.log('Transcript uploaded to Cloudinary:', transcriptUrl);
            } catch (uploadError) {
                console.error('Failed to upload transcript to Cloudinary:', uploadError.message);
            }

            try {
                const summary = await generateSummary(transcript);
                if (summary) {
                    video.summary = summary;
                }
            } catch (summaryError) {
                console.error('Summary failed, but transcript saved:', summaryError.message);
            }

            await video.save();
            console.log('Transcription completed and saved for video:', video._id);
        } else {
            console.log('No transcript generated');
        }
    } catch (error) {
        console.error('Error in transcription:', error);
        throw error;
    }
};
