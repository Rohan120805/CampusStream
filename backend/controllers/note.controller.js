import Note from '../models/note.model.js';
import Video from '../models/video.model.js';

/**
 * Create a new note
 */
export const createNote = async (req, res) => {
    try {
        const { videoId, content, timestamp } = req.body;
        const userId = req.userId;

        const video = await Video.findById(videoId);

        if (!video) {
            return res.status(404).json({
                success: false,
                message: 'Video not found'
            });
        }

        const note = await Note.create({
            user: userId,
            video: videoId,
            content,
            timestamp
        });

        res.status(201).json({
            success: true,
            message: 'Note created successfully',
            data: note
        });
    } catch (error) {
        console.error('Error creating note:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating note',
            error: error.message
        });
    }
};

/**
 * Get all notes for a video by current user
 */
export const getNotesByVideo = async (req, res) => {
    try {
        const { videoId } = req.params;
        const userId = req.userId;

        const notes = await Note.find({
            video: videoId,
            user: userId
        }).sort({ timestamp: 1 });

        res.status(200).json({
            success: true,
            data: notes
        });
    } catch (error) {
        console.error('Error fetching notes:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching notes',
            error: error.message
        });
    }
};

/**
 * Update a note
 */
export const updateNote = async (req, res) => {
    try {
        const { id } = req.params;
        const { content, timestamp } = req.body;
        const userId = req.userId;

        const note = await Note.findOne({ _id: id, user: userId });

        if (!note) {
            return res.status(404).json({
                success: false,
                message: 'Note not found or you do not have permission'
            });
        }

        if (content !== undefined) note.content = content;
        if (timestamp !== undefined) note.timestamp = timestamp;

        await note.save();

        res.status(200).json({
            success: true,
            message: 'Note updated successfully',
            data: note
        });
    } catch (error) {
        console.error('Error updating note:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating note',
            error: error.message
        });
    }
};

/**
 * Delete a note
 */
export const deleteNote = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.userId;

        const note = await Note.findOneAndDelete({ _id: id, user: userId });

        if (!note) {
            return res.status(404).json({
                success: false,
                message: 'Note not found or you do not have permission'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Note deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting note:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting note',
            error: error.message
        });
    }
};

/**
 * Get all notes by current user
 */
export const getAllUserNotes = async (req, res) => {
    try {
        const userId = req.userId;

        const notes = await Note.find({ user: userId })
            .populate('video', 'title thumbnailUrl')
            .sort({ updatedAt: -1 });

        res.status(200).json({
            success: true,
            data: notes
        });
    } catch (error) {
        console.error('Error fetching user notes:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching user notes',
            error: error.message
        });
    }
};
