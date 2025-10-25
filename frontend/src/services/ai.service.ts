import api from '../lib/api';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export interface Quiz {
  questions: QuizQuestion[];
}

export const aiService = {
  chatWithVideo: async (videoId: string, message: string, conversationHistory: ChatMessage[]) => {
    const { data } = await api.post('/ai/chat', {
      videoId,
      message,
      conversationHistory,
    });
    return data.data;
  },

  generateQuiz: async (videoId: string, difficulty: string = 'medium', questionCount: number = 5) => {
    const { data } = await api.post('/ai/quiz', {
      videoId,
      difficulty,
      questionCount,
    });
    return data.data;
  },

  getLectureSummary: async (videoId: string, summaryType: 'brief' | 'detailed' = 'brief') => {
    const { data } = await api.get('/ai/summary', {
      params: { videoId, summaryType },
    });
    return data.data;
  },
};

export default aiService;
