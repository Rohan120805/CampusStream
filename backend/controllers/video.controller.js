import Video from '../models/video.model.js';
import User from '../models/user.model.js';
import { uploadToGCS, deleteFromGCS } from '../config/gcs.js';
import path from 'path';

/**
 * Upload a new video
 */
export const uploadVideo = async (req, res) => {
    try {
        const { title, description, subject, topics, tags, semester } = req.body;
        
        if (!req.files || !req.files.video) {
            return res.status(400).json({
                success: false,
                message: 'Video file is required'
            });
        }

        const videoFile = req.files.video[0];
        const thumbnailFile = req.files.thumbnail ? req.files.thumbnail[0] : null;

        // Generate unique filename
        const timestamp = Date.now();
        const videoFileName = `videos/${req.userId}_${timestamp}${path.extname(videoFile.originalname)}`;
        
        // Upload video to GCS
        const videoUrl = await uploadToGCS(
            videoFile.buffer,
            videoFileName,
            videoFile.mimetype
        );

        // Upload thumbnail if provided
        let thumbnailUrl = '';
        if (thumbnailFile) {
            const thumbnailFileName = `thumbnails/${req.userId}_${timestamp}${path.extname(thumbnailFile.originalname)}`;
            thumbnailUrl = await uploadToGCS(
                thumbnailFile.buffer,
                thumbnailFileName,
                thumbnailFile.mimetype
            );
        }

        // Create video document
        const video = await Video.create({
            title,
            description,
            videoUrl,
            thumbnailUrl,
            uploadedBy: req.userId,
            subject,
            topics: topics ? topics.split(',').map(t => t.trim()) : [],
            tags: tags ? tags.split(',').map(t => t.trim()) : [],
            semester,
            fileName: videoFileName
        });

        // Add video to user's uploaded videos
        await User.findByIdAndUpdate(req.userId, {
            $push: { uploadedVideos: video._id }
        });

        // Populate uploaded by user info
        await video.populate('uploadedBy', 'name email picture');

        res.status(201).json({
            success: true,
            message: 'Video uploaded successfully',
            data: video
        });
    } catch (error) {
        console.error('Error uploading video:', error);
        res.status(500).json({
            success: false,
            message: 'Error uploading video',
            error: error.message
        });
    }
};

/**
 * Get all videos with filtering and pagination
 */
export const getAllVideos = async (req, res) => {
    try {
        const { 
            page = 1, 
            limit = 12, 
            subject, 
            semester, 
            search,
            sortBy = 'createdAt',
            order = 'desc'
        } = req.query;

        const query = { isPublic: true, isApproved: true };
        
        if (subject) query.subject = subject;
        if (semester) query.semester = semester;
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { tags: { $in: [new RegExp(search, 'i')] } }
            ];
        }

        const sortOrder = order === 'asc' ? 1 : -1;
        const sortOptions = { [sortBy]: sortOrder };

        const videos = await Video.find(query)
            .populate('uploadedBy', 'name picture')
            .select('-transcript')
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort(sortOptions);

        const count = await Video.countDocuments(query);

        res.status(200).json({
            success: true,
            data: videos,
            totalPages: Math.ceil(count / limit),
            currentPage: parseInt(page),
            totalVideos: count
        });
    } catch (error) {
        console.error('Error fetching videos:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching videos',
            error: error.message
        });
    }
};

/**
 * Get a single video by ID
 */
export const getVideoById = async (req, res) => {
    try {
        const { id } = req.params;

        const video = await Video.findById(id)
            .populate('uploadedBy', 'name email picture department role');

        if (!video) {
            return res.status(404).json({
                success: false,
                message: 'Video not found'
            });
        }

        // Increment view count
        video.views += 1;
        await video.save();

        res.status(200).json({
            success: true,
            data: video
        });
    } catch (error) {
        console.error('Error fetching video:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching video',
            error: error.message
        });
    }
};

/**
 * Update video details
 */
export const updateVideo = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, subject, topics, tags, semester } = req.body;

        const video = await Video.findById(id);

        if (!video) {
            return res.status(404).json({
                success: false,
                message: 'Video not found'
            });
        }

        // Check if user is the owner
        if (video.uploadedBy.toString() !== req.userId.toString()) {
            return res.status(403).json({
                success: false,
                message: 'You do not have permission to update this video'
            });
        }

        // Update fields
        if (title) video.title = title;
        if (description) video.description = description;
        if (subject) video.subject = subject;
        if (topics) video.topics = topics.split(',').map(t => t.trim());
        if (tags) video.tags = tags.split(',').map(t => t.trim());
        if (semester) video.semester = semester;

        await video.save();

        res.status(200).json({
            success: true,
            message: 'Video updated successfully',
            data: video
        });
    } catch (error) {
        console.error('Error updating video:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating video',
            error: error.message
        });
    }
};

/**
 * Delete a video
 */
export const deleteVideo = async (req, res) => {
    try {
        const { id } = req.params;

        const video = await Video.findById(id);

        if (!video) {
            return res.status(404).json({
                success: false,
                message: 'Video not found'
            });
        }

        // Check if user is the owner
        if (video.uploadedBy.toString() !== req.userId.toString()) {
            return res.status(403).json({
                success: false,
                message: 'You do not have permission to delete this video'
            });
        }

        // Delete from GCS
        try {
            await deleteFromGCS(video.fileName);
            if (video.thumbnailUrl) {
                const thumbnailFileName = video.thumbnailUrl.split('/').pop();
                await deleteFromGCS(`thumbnails/${thumbnailFileName}`);
            }
        } catch (gcsError) {
            console.error('Error deleting from GCS:', gcsError);
        }

        // Remove from user's uploaded videos
        await User.findByIdAndUpdate(video.uploadedBy, {
            $pull: { uploadedVideos: video._id }
        });

        // Delete video document
        await Video.findByIdAndDelete(id);

        res.status(200).json({
            success: true,
            message: 'Video deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting video:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting video',
            error: error.message
        });
    }
};

/**
 * Like/Unlike a video
 */
export const toggleLike = async (req, res) => {
    try {
        const { id } = req.params;

        const video = await Video.findById(id);

        if (!video) {
            return res.status(404).json({
                success: false,
                message: 'Video not found'
            });
        }

        const likeIndex = video.likes.indexOf(req.userId);

        if (likeIndex > -1) {
            // Unlike
            video.likes.splice(likeIndex, 1);
        } else {
            // Like
            video.likes.push(req.userId);
        }

        await video.save();

        res.status(200).json({
            success: true,
            message: likeIndex > -1 ? 'Video unliked' : 'Video liked',
            data: {
                likes: video.likes.length,
                isLiked: likeIndex === -1
            }
        });
    } catch (error) {
        console.error('Error toggling like:', error);
        res.status(500).json({
            success: false,
            message: 'Error toggling like',
            error: error.message
        });
    }
};

/**
 * Get videos by current user
 */
export const getMyVideos = async (req, res) => {
    try {
        const videos = await Video.find({ uploadedBy: req.userId })
            .sort({ createdAt: -1 })
            .select('-transcript');

        res.status(200).json({
            success: true,
            data: videos,
            count: videos.length
        });
    } catch (error) {
        console.error('Error fetching my videos:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching videos',
            error: error.message
        });
    }
};