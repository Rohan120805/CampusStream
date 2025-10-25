import express from 'express';
import { 
    uploadVideo, 
    getAllVideos, 
    getVideoById, 
    updateVideo, 
    deleteVideo,
    toggleLike,
    getMyVideos
} from '../controllers/video.controller.js';
import { authenticate } from '../middleware/auth.js';
import { uploadVideoWithThumbnail, handleUploadError } from '../middleware/upload.js';

const router = express.Router();

// Public routes
router.get('/', getAllVideos);
router.get('/:id', authenticate, getVideoById);

// Protected routes
router.post('/', authenticate, uploadVideoWithThumbnail, handleUploadError, uploadVideo);
router.get('/user/my-videos', authenticate, getMyVideos);
router.put('/:id', authenticate, updateVideo);
router.delete('/:id', authenticate, deleteVideo);
router.post('/:id/like', authenticate, toggleLike);

export default router;