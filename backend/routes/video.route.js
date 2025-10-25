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
    getTranscript,
    getAllSubjects,
    getRelatedVideos,
    incrementShareCount,
    updateChapters
} from '../controllers/video.controller.js';
import { authenticate } from '../middleware/auth.js';
import { uploadVideoComplete, handleUploadError, uploadTranscript } from '../middleware/upload.js';

const router = express.Router();

// Public routes (specific routes MUST come before :id route)
router.get('/', getAllVideos);
router.get('/subjects/all', getAllSubjects);

// Protected routes
router.post('/', authenticate, uploadVideoComplete, handleUploadError, uploadVideo);
router.get('/user/my-videos', authenticate, getMyVideos);

// Dynamic ID routes (these must come AFTER specific routes)
router.get('/:id', authenticate, getVideoById);
router.get('/:id/related', authenticate, getRelatedVideos);
router.put('/:id', authenticate, updateVideo);
router.delete('/:id', authenticate, deleteVideo);
router.post('/:id/like', authenticate, toggleLike);
router.post('/:id/share', authenticate, incrementShareCount);
router.put('/:id/chapters', authenticate, updateChapters);
router.get('/:id/transcript', authenticate, getTranscript);
router.put('/:id/transcript', authenticate, uploadTranscript, updateTranscription);

export default router;