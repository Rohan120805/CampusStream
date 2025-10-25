import express from 'express';
import { authenticate } from '../middleware/auth.js';
import {
    getUserProfile,
    toggleFollow,
    toggleBookmark,
    toggleWatchLater,
    getBookmarks,
    getWatchLater,
    getWatchHistory,
    updateWatchPosition,
    getWatchPosition,
    clearWatchHistory
} from '../controllers/user.controller.js';

const router = express.Router();

// User profile routes
router.get('/profile/:id', authenticate, getUserProfile);

// Social features
router.post('/follow/:id', authenticate, toggleFollow);

// Bookmark routes
router.post('/bookmark/:videoId', authenticate, toggleBookmark);
router.get('/bookmarks', authenticate, getBookmarks);

// Watch later routes
router.post('/watch-later/:videoId', authenticate, toggleWatchLater);
router.get('/watch-later', authenticate, getWatchLater);

// Watch history routes
router.get('/watch-history', authenticate, getWatchHistory);
router.post('/watch-position/:videoId', authenticate, updateWatchPosition);
router.get('/watch-position/:videoId', authenticate, getWatchPosition);
router.delete('/watch-history', authenticate, clearWatchHistory);

export default router;
