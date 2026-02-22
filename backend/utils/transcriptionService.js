import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Generate transcript for a video
 * Note: Automatic transcription is disabled. Users can manually upload transcripts.
 */
export const generateTranscript = async (videoFileName) => {
    console.log('⚠️ Automatic transcription is disabled. Users can manually upload transcripts.');
    return ''; // Return empty string - manual transcription only
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
