import express from 'express';
import { 
    uploadVideo, 
    getAllVideos, 
    getVideoById, 
    updateVideo, 
    deleteVideo,
    toggleLike,
    getMyVideos,
    updateTranscription,
    getTranscript
} from '../controllers/video.controller.js';
import { authenticate } from '../middleware/auth.js';
import { uploadVideoComplete, handleUploadError, uploadTranscript } from '../middleware/upload.js';

const router = express.Router();

// Public routes
router.get('/', getAllVideos);
router.get('/:id', authenticate, getVideoById);

// Protected routes
router.post('/', authenticate, uploadVideoComplete, handleUploadError, uploadVideo);
router.get('/user/my-videos', authenticate, getMyVideos);
router.put('/:id', authenticate, updateVideo);
router.delete('/:id', authenticate, deleteVideo);
router.post('/:id/like', authenticate, toggleLike);
router.get('/:id/transcript', authenticate, getTranscript);
router.put('/:id/transcript', authenticate, uploadTranscript, updateTranscription);

export default router;