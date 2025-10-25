import React, { useState, useRef, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { aiService, ChatMessage, QuizQuestion } from '../../services/ai.service';
import { BackgroundGradient } from '../ui/background-gradient';
import { Button } from '../ui/button';
import { 
  MessageCircle, 
  Send, 
  Sparkles, 
  BookOpen, 
  Brain,
  X,
  Minimize2,
  Maximize2,
  RotateCcw,
  Lightbulb
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Scrollbar styles
const scrollbarStyles = `
  .chat-scroll::-webkit-scrollbar {
    width: 6px;
  }
  .chat-scroll::-webkit-scrollbar-track {
    background: #1e293b;
    border-radius: 3px;
  }
  .chat-scroll::-webkit-scrollbar-thumb {
    background: #7c3aed;
    border-radius: 3px;
  }
  .chat-scroll::-webkit-scrollbar-thumb:hover {
    background: #9333ea;
  }
  .chat-scroll {
    scrollbar-width: thin;
    scrollbar-color: #7c3aed #1e293b;
  }
`;

interface AIChatbotProps {
  videoId: string;
}

interface QuizState {
  questions: QuizQuestion[];
  currentQuestion: number;
  userAnswers: number[];
  showResults: boolean;
  score: number;
}

export const AIChatbot: React.FC<AIChatbotProps> = ({ videoId }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [message, setMessage] = useState('');
  const [conversation, setConversation] = useState<ChatMessage[]>([]);
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizState, setQuizState] = useState<QuizState | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Simple markdown renderer
  const renderMarkdown = (text: string) => {
    let html = text;
    
    // Bold: **text** or __text__
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-purple-300">$1</strong>');
    html = html.replace(/__(.*?)__/g, '<strong class="font-semibold text-purple-300">$1</strong>');
    
    // Italic: *text* or _text_
    html = html.replace(/\*(.*?)\*/g, '<em class="italic text-blue-300">$1</em>');
    html = html.replace(/_(.*?)_/g, '<em class="italic text-blue-300">$1</em>');
    
    // Inline code: `code`
    html = html.replace(/`([^`]+)`/g, '<code class="bg-slate-900 px-1 py-0.5 rounded text-xs text-green-300">$1</code>');
    
    // Headers
    html = html.replace(/^### (.*$)/gm, '<h3 class="text-sm font-bold mb-1 mt-2">$1</h3>');
    html = html.replace(/^## (.*$)/gm, '<h2 class="text-base font-bold mb-2 mt-2">$1</h2>');
    html = html.replace(/^# (.*$)/gm, '<h1 class="text-lg font-bold mb-2 mt-2">$1</h1>');
    
    // Line breaks
    html = html.replace(/\n/g, '<br/>');
    
    return html;
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [conversation]);

  // Chat mutation
  const chatMutation = useMutation({
    mutationFn: ({ message, history }: { message: string; history: ChatMessage[] }) =>
      aiService.chatWithVideo(videoId, message, history),
    onSuccess: (data) => {
      setConversation((prev) => [
        ...prev,
        { role: 'assistant', content: data.message },
      ]);
    },
    onError: (error: any) => {
      console.error('Chat error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to get AI response. Please try again.';
      setConversation((prev) => [
        ...prev,
        { role: 'assistant', content: `❌ Error: ${errorMessage}` },
      ]);
    },
  });

  // Quiz mutation
  const quizMutation = useMutation({
    mutationFn: () => aiService.generateQuiz(videoId, 'medium', 5),
    onSuccess: (data) => {
      setQuizState({
        questions: data.quiz.questions,
        currentQuestion: 0,
        userAnswers: [],
        showResults: false,
        score: 0,
      });
      setShowQuiz(true);
    },
    onError: (error: any) => {
      console.error('Quiz generation error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to generate quiz. Please try again.';
      setConversation((prev) => [
        ...prev,
        { role: 'assistant', content: `❌ Error: ${errorMessage}` },
      ]);
    },
  });

  // Summary mutation
  const summaryMutation = useMutation({
    mutationFn: () => aiService.getLectureSummary(videoId, 'detailed'),
    onSuccess: (data) => {
      setConversation((prev) => [
        ...prev,
        { role: 'assistant', content: data.summary },
      ]);
    },
    onError: (error: any) => {
      console.error('Summary generation error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to generate summary. Please try again.';
      setConversation((prev) => [
        ...prev,
        { role: 'assistant', content: `❌ Error: ${errorMessage}` },
      ]);
    },
  });

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || chatMutation.isPending) return;

    const userMessage: ChatMessage = { role: 'user', content: message };
    setConversation((prev) => [...prev, userMessage]);
    
    chatMutation.mutate({ message, history: conversation });
    setMessage('');
  };

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'summary':
        setConversation((prev) => [
          ...prev,
          { role: 'user', content: 'Give me a detailed summary of this lecture' },
        ]);
        summaryMutation.mutate();
        break;
      case 'quiz':
        setConversation((prev) => [
          ...prev,
          { role: 'user', content: 'Generate a quiz for me' },
        ]);
        quizMutation.mutate();
        break;
      case 'explain':
        setMessage('Can you explain the main concepts in this lecture?');
        break;
      case 'keypoints':
        setConversation((prev) => [
          ...prev,
          { role: 'user', content: 'What are the key points from this lecture?' },
        ]);
        chatMutation.mutate({
          message: 'What are the key points from this lecture?',
          history: conversation,
        });
        break;
    }
  };

  const handleQuizAnswer = (answerIndex: number) => {
    if (!quizState) return;

    const newAnswers = [...quizState.userAnswers, answerIndex];
    const nextQuestion = quizState.currentQuestion + 1;

    if (nextQuestion < quizState.questions.length) {
      setQuizState({
        ...quizState,
        userAnswers: newAnswers,
        currentQuestion: nextQuestion,
      });
    } else {
      // Calculate score
      const score = quizState.questions.reduce((acc, q, idx) => {
        return acc + (newAnswers[idx] === q.correctAnswer ? 1 : 0);
      }, 0);

      setQuizState({
        ...quizState,
        userAnswers: newAnswers,
        showResults: true,
        score,
      });
    }
  };

  const resetQuiz = () => {
    setShowQuiz(false);
    setQuizState(null);
  };

  if (!isOpen) {
    return (
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 p-4 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full shadow-2xl hover:shadow-purple-500/50 transition-all"
      >
        <Sparkles size={28} className="text-white" />
      </motion.button>
    );
  }

  return (
    <AnimatePresence>
      <style>{scrollbarStyles}</style>
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.8, y: 20 }}
        className={`fixed ${isMinimized ? 'bottom-6 right-6' : 'bottom-6 right-6'} z-50 ${
          isMinimized ? 'w-80' : 'w-96'
        } ${isMinimized ? 'h-16' : 'h-[600px]'} transition-all duration-300`}
      >
        <BackgroundGradient className="h-full flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-slate-700 flex items-center justify-between bg-gradient-to-r from-purple-600/20 to-blue-600/20">
            <div className="flex items-center gap-2">
              <Sparkles className="text-purple-400" size={20} />
              <h3 className="font-semibold text-white">AI Teaching Assistant</h3>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-1 hover:bg-slate-700 rounded transition-colors"
              >
                {isMinimized ? <Maximize2 size={18} /> : <Minimize2 size={18} />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-slate-700 rounded transition-colors"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Quick Actions */}
              {conversation.length === 0 && !showQuiz && (
                <div className="p-4 space-y-2">
                  <p className="text-sm text-gray-400 mb-3">
                    👋 Hi! I'm your AI teaching assistant. I can help you with:
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handleQuickAction('summary')}
                      className="p-3 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm text-left flex items-center gap-2 transition-colors"
                      disabled={summaryMutation.isPending}
                    >
                      <BookOpen size={16} className="text-blue-400" />
                      <span>Get Summary</span>
                    </button>
                    <button
                      onClick={() => handleQuickAction('quiz')}
                      className="p-3 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm text-left flex items-center gap-2 transition-colors"
                      disabled={quizMutation.isPending}
                    >
                      <Brain size={16} className="text-purple-400" />
                      <span>Take Quiz</span>
                    </button>
                    <button
                      onClick={() => handleQuickAction('keypoints')}
                      className="p-3 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm text-left flex items-center gap-2 transition-colors"
                    >
                      <Lightbulb size={16} className="text-yellow-400" />
                      <span>Key Points</span>
                    </button>
                    <button
                      onClick={() => handleQuickAction('explain')}
                      className="p-3 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm text-left flex items-center gap-2 transition-colors"
                    >
                      <MessageCircle size={16} className="text-green-400" />
                      <span>Ask Question</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Messages or Quiz */}
              <div 
                className="flex-1 overflow-y-auto p-4 space-y-4 chat-scroll" 
                style={{ 
                  maxHeight: 'calc(600px - 180px)',
                  scrollBehavior: 'smooth'
                }}
              >
                {showQuiz && quizState ? (
                  <div className="space-y-4">
                    {!quizState.showResults ? (
                      <>
                        <div className="text-sm text-gray-400">
                          Question {quizState.currentQuestion + 1} of {quizState.questions.length}
                        </div>
                        <div className="bg-slate-800 rounded-lg p-4">
                          <p className="text-white mb-4">
                            {quizState.questions[quizState.currentQuestion].question}
                          </p>
                          <div className="space-y-2">
                            {quizState.questions[quizState.currentQuestion].options.map(
                              (option, idx) => (
                                <button
                                  key={idx}
                                  onClick={() => handleQuizAnswer(idx)}
                                  className="w-full p-3 text-left bg-slate-900 hover:bg-purple-600/20 border border-slate-700 hover:border-purple-500 rounded-lg transition-all"
                                >
                                  <span className="font-semibold mr-2">
                                    {String.fromCharCode(65 + idx)}.
                                  </span>
                                  {option}
                                </button>
                              )
                            )}
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="bg-slate-800 rounded-lg p-4">
                        <div className="text-center mb-4">
                          <div className="text-3xl font-bold text-purple-400 mb-2">
                            {quizState.score}/{quizState.questions.length}
                          </div>
                          <p className="text-gray-400">
                            You got {Math.round((quizState.score / quizState.questions.length) * 100)}% correct!
                          </p>
                        </div>
                        <div className="space-y-4">
                          {quizState.questions.map((q, idx) => (
                            <div key={idx} className="bg-slate-900 rounded-lg p-3">
                              <p className="text-sm mb-2">{q.question}</p>
                              <p className="text-xs text-gray-400 mb-1">
                                Your answer: {q.options[quizState.userAnswers[idx]]}
                                {quizState.userAnswers[idx] === q.correctAnswer ? (
                                  <span className="text-green-400 ml-2">✓ Correct</span>
                                ) : (
                                  <span className="text-red-400 ml-2">✗ Wrong</span>
                                )}
                              </p>
                              {quizState.userAnswers[idx] !== q.correctAnswer && (
                                <p className="text-xs text-purple-400">
                                  Correct: {q.options[q.correctAnswer]}
                                </p>
                              )}
                              <p className="text-xs text-gray-500 mt-2">{q.explanation}</p>
                            </div>
                          ))}
                        </div>
                        <button
                          onClick={resetQuiz}
                          className="w-full mt-4 p-2 bg-purple-600 hover:bg-purple-700 rounded-lg flex items-center justify-center gap-2 transition-colors"
                        >
                          <RotateCcw size={16} />
                          Back to Chat
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <>
                    {conversation.map((msg, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[80%] p-3 rounded-lg ${
                            msg.role === 'user'
                              ? 'bg-purple-600 text-white'
                              : 'bg-slate-800 text-gray-200'
                          }`}
                        >
                          {msg.role === 'assistant' ? (
                            <div 
                              className="text-sm prose prose-invert prose-sm max-w-none"
                              dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.content) }}
                            />
                          ) : (
                            <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                          )}
                        </div>
                      </motion.div>
                    ))}
                    {(chatMutation.isPending || summaryMutation.isPending || quizMutation.isPending) && (
                      <div className="flex justify-start">
                        <div className="bg-slate-800 p-3 rounded-lg">
                          <div className="flex gap-1">
                            <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" />
                            <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce delay-100" />
                            <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce delay-200" />
                          </div>
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </>
                )}
              </div>

              {/* Input */}
              {!showQuiz && (
                <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-700">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Ask anything about this lecture..."
                      className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-purple-500"
                      disabled={chatMutation.isPending}
                    />
                    <button
                      type="submit"
                      disabled={!message.trim() || chatMutation.isPending}
                      className="p-2 bg-purple-600 hover:bg-purple-700 disabled:bg-slate-700 disabled:cursor-not-allowed rounded-lg transition-colors"
                    >
                      <Send size={18} />
                    </button>
                  </div>
                </form>
              )}
            </>
          )}
        </BackgroundGradient>
      </motion.div>
    </AnimatePresence>
  );
};

export default AIChatbot;
