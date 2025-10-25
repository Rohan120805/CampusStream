import Playlist from '../models/playlist.model.js';
import User from '../models/user.model.js';
import Video from '../models/video.model.js';

/**
 * Create a new playlist
 */
export const createPlaylist = async (req, res) => {
    try {
        const { name, description, subject, semester, isPublic, isSyllabusBased } = req.body;

        const playlist = await Playlist.create({
            name,
            description,
            subject,
            semester,
            isPublic: isPublic !== undefined ? isPublic : true,
            isSyllabusBased: isSyllabusBased || false,
            createdBy: req.userId
        });

        // Add to user's playlists
        await User.findByIdAndUpdate(req.userId, {
            $push: { playlists: playlist._id }
        });

        await playlist.populate('createdBy', 'name picture');

        res.status(201).json({
            success: true,
            message: 'Playlist created successfully',
            data: playlist
        });
    } catch (error) {
        console.error('Error creating playlist:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating playlist',
            error: error.message
        });
    }
};

/**
 * Get all playlists
 */
export const getAllPlaylists = async (req, res) => {
    try {
        const { page = 1, limit = 12, subject, semester, search } = req.query;

        const query = { isPublic: true };
        
        if (subject) query.subject = subject;
        if (semester) query.semester = semester;
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        const playlists = await Playlist.find(query)
            .populate('createdBy', 'name picture')
            .populate('videos', 'title thumbnailUrl duration')
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort({ createdAt: -1 });

        const count = await Playlist.countDocuments(query);

        res.status(200).json({
            success: true,
            data: playlists,
            totalPages: Math.ceil(count / limit),
            currentPage: parseInt(page),
            totalPlaylists: count
        });
    } catch (error) {
        console.error('Error fetching playlists:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching playlists',
            error: error.message
        });
    }
};

/**
 * Get a single playlist by ID
 */
export const getPlaylistById = async (req, res) => {
    try {
        const { id } = req.params;

        const playlist = await Playlist.findById(id)
            .populate('createdBy', 'name email picture')
            .populate({
                path: 'videos',
                populate: { path: 'uploadedBy', select: 'name picture' }
            });

        if (!playlist) {
            return res.status(404).json({
                success: false,
                message: 'Playlist not found'
            });
        }

        // Check if playlist is public or belongs to user
        if (!playlist.isPublic && playlist.createdBy._id.toString() !== req.userId.toString()) {
            return res.status(403).json({
                success: false,
                message: 'You do not have permission to view this playlist'
            });
        }

        res.status(200).json({
            success: true,
            data: playlist
        });
    } catch (error) {
        console.error('Error fetching playlist:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching playlist',
            error: error.message
        });
    }
};

/**
 * Update playlist
 */
export const updatePlaylist = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, subject, semester, isPublic } = req.body;

        const playlist = await Playlist.findById(id);

        if (!playlist) {
            return res.status(404).json({
                success: false,
                message: 'Playlist not found'
            });
        }

        // Check ownership
        if (playlist.createdBy.toString() !== req.userId.toString()) {
            return res.status(403).json({
                success: false,
                message: 'You do not have permission to update this playlist'
            });
        }

        // Update fields
        if (name) playlist.name = name;
        if (description !== undefined) playlist.description = description;
        if (subject) playlist.subject = subject;
        if (semester) playlist.semester = semester;
        if (isPublic !== undefined) playlist.isPublic = isPublic;

        await playlist.save();

        res.status(200).json({
            success: true,
            message: 'Playlist updated successfully',
            data: playlist
        });
    } catch (error) {
        console.error('Error updating playlist:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating playlist',
            error: error.message
        });
    }
};

/**
 * Delete playlist
 */
export const deletePlaylist = async (req, res) => {
    try {
        const { id } = req.params;

        const playlist = await Playlist.findById(id);

        if (!playlist) {
            return res.status(404).json({
                success: false,
                message: 'Playlist not found'
            });
        }

        // Check ownership
        if (playlist.createdBy.toString() !== req.userId.toString()) {
            return res.status(403).json({
                success: false,
                message: 'You do not have permission to delete this playlist'
            });
        }

        // Remove from user's playlists
        await User.findByIdAndUpdate(playlist.createdBy, {
            $pull: { playlists: playlist._id }
        });

        await Playlist.findByIdAndDelete(id);

        res.status(200).json({
            success: true,
            message: 'Playlist deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting playlist:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting playlist',
            error: error.message
        });
    }
};

/**
 * Add video to playlist
 */
export const addVideoToPlaylist = async (req, res) => {
    try {
        const { id } = req.params;
        const { videoId } = req.body;

        const playlist = await Playlist.findById(id);

        if (!playlist) {
            return res.status(404).json({
                success: false,
                message: 'Playlist not found'
            });
        }

        // Check ownership
        if (playlist.createdBy.toString() !== req.userId.toString()) {
            return res.status(403).json({
                success: false,
                message: 'You do not have permission to modify this playlist'
            });
        }

        // Check if video exists
        const video = await Video.findById(videoId);
        if (!video) {
            return res.status(404).json({
                success: false,
                message: 'Video not found'
            });
        }

        // Check if video already in playlist
        if (playlist.videos.includes(videoId)) {
            return res.status(400).json({
                success: false,
                message: 'Video already in playlist'
            });
        }

        playlist.videos.push(videoId);
        await playlist.save();

        await playlist.populate('videos', 'title thumbnailUrl duration');

        res.status(200).json({
            success: true,
            message: 'Video added to playlist',
            data: playlist
        });
    } catch (error) {
        console.error('Error adding video to playlist:', error);
        res.status(500).json({
            success: false,
            message: 'Error adding video to playlist',
            error: error.message
        });
    }
};

/**
 * Remove video from playlist
 */
export const removeVideoFromPlaylist = async (req, res) => {
    try {
        const { id, videoId } = req.params;

        const playlist = await Playlist.findById(id);

        if (!playlist) {
            return res.status(404).json({
                success: false,
                message: 'Playlist not found'
            });
        }

        // Check ownership
        if (playlist.createdBy.toString() !== req.userId.toString()) {
            return res.status(403).json({
                success: false,
                message: 'You do not have permission to modify this playlist'
            });
        }

        playlist.videos = playlist.videos.filter(v => v.toString() !== videoId);
        await playlist.save();

        res.status(200).json({
            success: true,
            message: 'Video removed from playlist',
            data: playlist
        });
    } catch (error) {
        console.error('Error removing video from playlist:', error);
        res.status(500).json({
            success: false,
            message: 'Error removing video from playlist',
            error: error.message
        });
    }
};

/**
 * Get user's playlists
 */
export const getMyPlaylists = async (req, res) => {
    try {
        const playlists = await Playlist.find({ createdBy: req.userId })
            .populate('videos', 'title thumbnailUrl duration')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            data: playlists,
            count: playlists.length
        });
    } catch (error) {
        console.error('Error fetching my playlists:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching playlists',
            error: error.message
        });
    }
};

/**
 * Get playlists grouped by subject
 */
export const getPlaylistsBySubject = async (req, res) => {
    try {
        // Get all unique subjects from videos
        const subjects = await Video.distinct('subject', { 
            isPublic: true, 
            isApproved: true 
        });

        const playlistsBySubject = [];

        for (const subject of subjects) {
            if (!subject || subject.trim() === '') continue;

            // Get all unique years for this subject
            const years = await Video.distinct('year', {
                subject,
                isPublic: true,
                isApproved: true
            });

            for (const year of years) {
                if (!year || year.trim() === '') continue;

                // Get videos for this subject and year
                const videos = await Video.find({
                    subject,
                    year,
                    isPublic: true,
                    isApproved: true
                })
                .select('_id title thumbnailUrl views createdAt uploadedBy unit')
                .populate('uploadedBy', 'name picture')
                .sort({ createdAt: -1 })
                .limit(50);

                if (videos.length > 0) {
                    playlistsBySubject.push({
                        id: `${subject}-${year}`.replace(/\s+/g, '-').toLowerCase(),
                        name: `${subject} - ${year}`,
                        subject,
                        year,
                        description: `All ${subject} lectures for ${year}`,
                        videoCount: videos.length,
                        videos: videos,
                        thumbnailUrl: videos[0]?.thumbnailUrl || '',
                        isAutoGenerated: true
                    });
                }
            }
        }

        // Sort by subject name and year
        playlistsBySubject.sort((a, b) => {
            if (a.subject === b.subject) {
                return a.year.localeCompare(b.year);
            }
            return a.subject.localeCompare(b.subject);
        });

        res.status(200).json({
            success: true,
            data: playlistsBySubject,
            count: playlistsBySubject.length
        });
    } catch (error) {
        console.error('Error fetching playlists by subject:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching playlists by subject',
            error: error.message
        });
    }
};