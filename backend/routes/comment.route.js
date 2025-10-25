import express from 'express';
import { 
    createComment, 
    getVideoComments, 
    updateComment, 
    deleteComment,
    toggleLike
} from '../controllers/comment.controller.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// All comment routes require authentication
router.post('/', authenticate, createComment);
router.get('/video/:videoId', authenticate, getVideoComments);
router.put('/:id', authenticate, updateComment);
router.delete('/:id', authenticate, deleteComment);
router.post('/:id/like', authenticate, toggleLike);

export default router;