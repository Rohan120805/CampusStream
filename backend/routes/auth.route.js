import express from 'express';
import { 
    getProfile, 
    updateProfile
} from '../controllers/auth.controller.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Get current user profile
router.get('/me', authenticate, getProfile);

// Update user profile
router.put('/profile', authenticate, updateProfile);

export default router;