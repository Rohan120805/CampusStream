import { GoogleGenerativeAI } from '@google/generative-ai';
import Video from '../models/video.model.js';

// Initialize Gemini AI with API version v1
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Download document content from Cloudinary (placeholder)
 */
const getDocumentContent = async (documentUrl) => {
    try {
        // For PDFs and other documents, we'll just return a placeholder
        // In production, you'd want to extract text from PDFs using a library
        return `[Document: ${documentUrl}]`;
    } catch (error) {
        console.error('Error fetching document:', error);
        return '';
    }
};

/**
 * Build context from video data
 */
const buildContext = async (video) => {
    let context = `Video Title: ${video.title}\n\n`;
    
    if (video.description) {
        context += `Description: ${video.description}\n\n`;
    }
    
    context += `Subject: ${video.subject}\n`;
    context += `Unit: ${video.unit}\n`;
    context += `Year: ${video.year}\n\n`;
    
    if (video.topics && video.topics.length > 0) {
        context += `Topics: ${video.topics.join(', ')}\n\n`;
    }
    
    if (video.transcript) {
        context += `Video Transcript:\n${video.transcript}\n\n`;
    }
    
    if (video.summary) {
        context += `Video Summary:\n${video.summary}\n\n`;
    }
    
    if (video.documents && video.documents.length > 0) {
        context += `Associated Documents:\n`;
        video.documents.forEach(doc => {
            context += `- ${doc.name} (${doc.type})\n`;
        });
        context += '\n';
    }
    
    return context;
};

/**
 * Chat with AI about the video
 */
export const chatWithVideo = async (req, res) => {
    try {
        console.log('🤖 AI Chat Request:', { videoId: req.body.videoId, message: req.body.message?.substring(0, 50) + '...' });
        
        const { videoId, message, conversationHistory } = req.body;

        if (!message || !videoId) {
            console.log('❌ Missing required fields');
            return res.status(400).json({
                success: false,
                message: 'Video ID and message are required'
            });
        }
        
        // Check if GEMINI_API_KEY is available
        if (!process.env.GEMINI_API_KEY) {
            console.error('❌ GEMINI_API_KEY not found in environment variables!');
            return res.status(500).json({
                success: false,
                message: 'AI service is not properly configured. Please contact administrator.'
            });
        }
        
        console.log('✅ GEMINI_API_KEY is configured');

        // Fetch video with all details
        const video = await Video.findById(videoId)
            .populate('uploadedBy', 'name role');

        if (!video) {
            return res.status(404).json({
                success: false,
                message: 'Video not found'
            });
        }

        // Build context from video data
        const context = await buildContext(video);

        // Initialize Gemini model (using basic flash model)
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

        // Build conversation with context
        let prompt = `You are an AI teaching assistant for CampusStream, an educational video platform. You have access to the following lecture information:\n\n${context}\n\n`;
        prompt += `Your role is to:\n`;
        prompt += `1. Answer questions about the lecture content\n`;
        prompt += `2. Provide summaries when asked\n`;
        prompt += `3. Generate quiz questions to test understanding\n`;
        prompt += `4. Explain concepts from the lecture in detail\n`;
        prompt += `5. Be helpful, educational, and encouraging\n\n`;
        
        // Add conversation history if exists
        if (conversationHistory && conversationHistory.length > 0) {
            prompt += `Previous conversation:\n`;
            conversationHistory.forEach(msg => {
                prompt += `${msg.role === 'user' ? 'Student' : 'AI'}: ${msg.content}\n`;
            });
            prompt += '\n';
        }
        
        prompt += `Student: ${message}\nAI:`;

        // Generate response
        console.log('🚀 Generating AI response...');
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const aiMessage = response.text();
        
        console.log('✅ AI response generated successfully');

        res.status(200).json({
            success: true,
            data: {
                message: aiMessage,
                context: {
                    hasTranscript: !!video.transcript,
                    hasDocuments: video.documents?.length > 0,
                    documentCount: video.documents?.length || 0
                }
            }
        });
    } catch (error) {
        console.error('❌ Error in AI chat:', error);
        console.error('   Error name:', error.name);
        console.error('   Error message:', error.message);
        console.error('   Error stack:', error.stack);
        
        res.status(500).json({
            success: false,
            message: 'Error processing chat message: ' + error.message,
            error: error.message
        });
    }
};

/**
 * Generate quiz questions based on video content
 */
export const generateQuiz = async (req, res) => {
    try {
        console.log('📝 Quiz Generation Request:', { videoId: req.body.videoId, difficulty: req.body.difficulty, count: req.body.questionCount });
        
        const { videoId, difficulty = 'medium', questionCount = 5 } = req.body;

        if (!videoId) {
            return res.status(400).json({
                success: false,
                message: 'Video ID is required'
            });
        }
        
        // Check if GEMINI_API_KEY is available
        if (!process.env.GEMINI_API_KEY) {
            console.error('❌ GEMINI_API_KEY not found in environment variables!');
            return res.status(500).json({
                success: false,
                message: 'AI service is not properly configured. Please contact administrator.'
            });
        }

        // Fetch video
        const video = await Video.findById(videoId);

        if (!video) {
            return res.status(404).json({
                success: false,
                message: 'Video not found'
            });
        }

        if (!video.transcript) {
            return res.status(400).json({
                success: false,
                message: 'Video transcript not available. Cannot generate quiz.'
            });
        }

        // Build context
        const context = await buildContext(video);

        // Initialize Gemini model (using basic flash model)
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

        const prompt = `Based on the following lecture content, generate ${questionCount} multiple-choice quiz questions at ${difficulty} difficulty level.

${context}

Generate questions in the following JSON format:
{
  "questions": [
    {
      "question": "Question text here?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": 0,
      "explanation": "Brief explanation of why this is correct"
    }
  ]
}

Make sure questions:
- Test understanding of key concepts
- Are clear and unambiguous
- Have one definitively correct answer
- Include plausible distractors
- Cover different topics from the lecture

Return ONLY valid JSON, no additional text.`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const quizText = response.text();

        // Parse JSON response
        let quizData;
        try {
            // Clean the response - remove markdown code blocks if present
            const cleanedText = quizText
                .replace(/```json\n?/g, '')
                .replace(/```\n?/g, '')
                .trim();
            quizData = JSON.parse(cleanedText);
        } catch (parseError) {
            console.error('Error parsing quiz JSON:', parseError);
            return res.status(500).json({
                success: false,
                message: 'Error generating quiz format',
                error: parseError.message
            });
        }

        res.status(200).json({
            success: true,
            data: {
                quiz: quizData,
                videoTitle: video.title,
                subject: video.subject,
                unit: video.unit
            }
        });
    } catch (error) {
        console.error('Error generating quiz:', error);
        res.status(500).json({
            success: false,
            message: 'Error generating quiz',
            error: error.message
        });
    }
};

/**
 * Get lecture summary
 */
export const getLectureSummary = async (req, res) => {
    try {
        console.log('📚 Summary Request:', { videoId: req.query.videoId, summaryType: req.query.summaryType });
        
        const { videoId, summaryType = 'brief' } = req.query;

        if (!videoId) {
            return res.status(400).json({
                success: false,
                message: 'Video ID is required'
            });
        }
        
        // Check if GEMINI_API_KEY is available
        if (!process.env.GEMINI_API_KEY) {
            console.error('❌ GEMINI_API_KEY not found in environment variables!');
            return res.status(500).json({
                success: false,
                message: 'AI service is not properly configured. Please contact administrator.'
            });
        }

        const video = await Video.findById(videoId);

        if (!video) {
            return res.status(404).json({
                success: false,
                message: 'Video not found'
            });
        }

        // If video already has a summary and requesting brief, return it
        if (summaryType === 'brief' && video.summary) {
            return res.status(200).json({
                success: true,
                data: {
                    summary: video.summary,
                    type: 'brief',
                    cached: true
                }
            });
        }

        if (!video.transcript) {
            return res.status(400).json({
                success: false,
                message: 'Video transcript not available. Cannot generate summary.'
            });
        }

        // Generate new summary
        const context = await buildContext(video);
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

        let prompt = '';
        if (summaryType === 'detailed') {
            prompt = `Provide a detailed summary of this lecture with key points, main concepts, and important details:\n\n${context}`;
        } else {
            prompt = `Provide a brief, concise summary (3-5 sentences) of this lecture:\n\n${context}`;
        }

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const summary = response.text();

        res.status(200).json({
            success: true,
            data: {
                summary,
                type: summaryType,
                cached: false
            }
        });
    } catch (error) {
        console.error('Error generating summary:', error);
        res.status(500).json({
            success: false,
            message: 'Error generating summary',
            error: error.message
        });
    }
};
