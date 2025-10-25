import express from 'express';
import { chatWithVideo, generateQuiz, getLectureSummary } from '../controllers/ai.controller.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// All AI routes require authentication
router.post('/chat', authenticate, chatWithVideo);
router.post('/quiz', authenticate, generateQuiz);
router.get('/summary', authenticate, getLectureSummary);

export default router;
