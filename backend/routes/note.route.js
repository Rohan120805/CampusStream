import express from 'express';
import { authenticate } from '../middleware/auth.js';
import {
    createNote,
    getNotesByVideo,
    updateNote,
    deleteNote,
    getAllUserNotes
} from '../controllers/note.controller.js';

const router = express.Router();

// Note routes
router.post('/', authenticate, createNote);
router.get('/video/:videoId', authenticate, getNotesByVideo);
router.get('/user', authenticate, getAllUserNotes);
router.put('/:id', authenticate, updateNote);
router.delete('/:id', authenticate, deleteNote);

export default router;
