import express from 'express';
import { 
    createPlaylist, 
    getAllPlaylists, 
    getPlaylistById, 
    updatePlaylist, 
    deletePlaylist,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    getMyPlaylists
} from '../controllers/playlist.controller.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/', getAllPlaylists);
router.get('/:id', authenticate, getPlaylistById);

// Protected routes
router.post('/', authenticate, createPlaylist);
router.get('/user/my-playlists', authenticate, getMyPlaylists);
router.put('/:id', authenticate, updatePlaylist);
router.delete('/:id', authenticate, deletePlaylist);
router.post('/:id/videos', authenticate, addVideoToPlaylist);
router.delete('/:id/videos/:videoId', authenticate, removeVideoFromPlaylist);

export default router;