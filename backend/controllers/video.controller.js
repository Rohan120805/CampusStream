import Video from '../models/video.model.js';
import User from '../models/user.model.js';
import { uploadToCloudinary, deleteFromCloudinary } from '../config/storage.js';
import { processVideoTranscription, generateTranscript, generateSummary } from '../utils/transcriptionService.js';
import path from 'path';

/**
 * Upload a new video
 */
export const uploadVideo = async (req, res) => {
    try {
        const { title, description, subject, topics, tags, semester, year, unit } = req.body;
        
        if (!req.files || !req.files.video) {
            return res.status(400).json({
                success: false,
                message: 'Video file is required'
            });
        }

        // Validate required fields
        if (!year) {
            return res.status(400).json({
                success: false,
                message: 'Year is required'
            });
        }

        if (!unit) {
            return res.status(400).json({
                success: false,
                message: 'Unit is required (CO1-CO5)'
            });
        }

        const videoFile = req.files.video[0];
        const thumbnailFile = req.files.thumbnail ? req.files.thumbnail[0] : null;
        const documentFiles = req.files.documents || [];

        // Upload video to Cloudinary
        console.log('📤 Uploading video to Cloudinary...');
        const videoUrl = await uploadToCloudinary(
            videoFile.buffer,
            'videos',
            'video'
        );
        console.log('✅ Video uploaded:', videoUrl);
        
        // Extract filename from Cloudinary URL for reference
        const timestamp = Date.now();
        const videoFileName = `videos/${req.userId}_${timestamp}${path.extname(videoFile.originalname)}`;

        // Upload thumbnail if provided
        let thumbnailUrl = '';
        if (thumbnailFile) {
            console.log('📤 Uploading thumbnail to Cloudinary...');
            thumbnailUrl = await uploadToCloudinary(
                thumbnailFile.buffer,
                'thumbnails',
                'image'
            );
            console.log('✅ Thumbnail uploaded:', thumbnailUrl);
        }

        // Upload documents if provided
        const uploadedDocuments = [];
        if (documentFiles.length > 0) {
            console.log(`📤 Uploading ${documentFiles.length} document(s) to Cloudinary...`);
            
            for (let i = 0; i < documentFiles.length; i++) {
                const docFile = documentFiles[i];
                const docFileName = `documents/${req.userId}_${timestamp}_${i}${path.extname(docFile.originalname)}`;
                
                const docUrl = await uploadToCloudinary(
                    docFile.buffer,
                    'documents',
                    'raw'
                );

                // Determine file type from mimetype
                let fileType = 'pdf';
                if (docFile.mimetype.includes('presentation')) {
                    fileType = 'pptx';
                } else if (docFile.mimetype.includes('wordprocessing') || docFile.mimetype.includes('msword')) {
                    fileType = 'docx';
                } else if (docFile.mimetype.includes('ms-powerpoint')) {
                    fileType = 'ppt';
                }

                uploadedDocuments.push({
                    name: docFile.originalname,
                    url: docUrl,
                    type: fileType,
                    size: docFile.size,
                    fileName: docFileName
                });

                console.log(`✅ Document ${i + 1} uploaded:`, docFile.originalname);
            }
        }

        // Create video document
        const video = await Video.create({
            title,
            description,
            videoUrl,
            thumbnailUrl,
            uploadedBy: req.userId,
            subject,
            unit,
            year,
            topics: topics ? topics.split(',').map(t => t.trim()) : [],
            tags: tags ? tags.split(',').map(t => t.trim()) : [],
            semester,
            documents: uploadedDocuments,
            fileName: videoFileName
        });

        // Add video to user's uploaded videos
        await User.findByIdAndUpdate(req.userId, {
            $push: { uploadedVideos: video._id }
        });

        // Populate uploaded by user info
        await video.populate('uploadedBy', 'name email picture');

        console.log('✅ Video document created in MongoDB');

        // Note: Automatic transcription is disabled. Users can manually upload transcripts.
        console.log('ℹ️ Automatic transcription is disabled. Users can manually upload transcripts via the edit video page.');

        res.status(201).json({
            success: true,
            message: 'Video uploaded successfully. You can add a transcript later.',
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
            unit,
            year,
            search,
            sortBy = 'createdAt',
            order = 'desc'
        } = req.query;

        const query = { isPublic: true, isApproved: true };
        
        if (subject) query.subject = subject;
        if (semester) query.semester = semester;
        if (unit) query.unit = unit;
        if (year) query.year = year;
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
        const { title, description, subject, topics, tags, semester, year, unit } = req.body;

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
        if (unit) video.unit = unit;
        if (year) video.year = year;
        if (topics) {
            // Handle both string and array formats
            video.topics = Array.isArray(topics) 
                ? topics 
                : topics.split(',').map(t => t.trim());
        }
        if (tags) {
            // Handle both string and array formats
            video.tags = Array.isArray(tags) 
                ? tags 
                : tags.split(',').map(t => t.trim());
        }
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

        // Delete from Cloudinary
        try {
            await deleteFromCloudinary(video.videoUrl, 'video');
            if (video.thumbnailUrl) {
                await deleteFromCloudinary(video.thumbnailUrl, 'image');
            }
            // Delete all associated documents
            if (video.documents && video.documents.length > 0) {
                for (const doc of video.documents) {
                    await deleteFromCloudinary(doc.url, 'raw');
                }
                console.log(`✅ Deleted ${video.documents.length} document(s) from Cloudinary`);
            }
        } catch (cloudinaryError) {
            console.error('Error deleting from Cloudinary:', cloudinaryError);
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

/**
 * Update video transcription
 */
export const updateTranscription = async (req, res) => {
    try {
        const { id } = req.params;
        const { transcript } = req.body;
        const transcriptFile = req.file;

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

        // If file is uploaded, store it
        if (transcriptFile) {
            const transcriptUrl = await uploadToCloudinary(
                transcriptFile.buffer,
                'transcripts',
                'raw'
            );

            video.transcriptUrl = transcriptUrl;
            video.transcript = transcriptFile.buffer.toString('utf-8');
        } else if (transcript) {
            // If text is provided, update it
            video.transcript = transcript;
        }

        await video.save();

        res.status(200).json({
            success: true,
            message: 'Transcription updated successfully',
            data: {
                transcript: video.transcript,
                transcriptUrl: video.transcriptUrl
            }
        });
    } catch (error) {
        console.error('Error updating transcription:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating transcription',
            error: error.message
        });
    }
};

/**
 * Get video transcript
 */
export const getTranscript = async (req, res) => {
    try {
        const { id } = req.params;

        const video = await Video.findById(id).select('transcript transcriptUrl');

        if (!video) {
            return res.status(404).json({
                success: false,
                message: 'Video not found'
            });
        }

        res.status(200).json({
            success: true,
            data: {
                transcript: video.transcript,
                transcriptUrl: video.transcriptUrl
            }
        });
    } catch (error) {
        console.error('Error fetching transcript:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching transcript',
            error: error.message
        });
    }
};

/**
 * Generate transcript automatically using AI (Groq Whisper)
 */
export const generateVideoTranscript = async (req, res) => {
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
                message: 'You do not have permission to generate a transcript for this video'
            });
        }

        if (!video.videoUrl) {
            return res.status(400).json({
                success: false,
                message: 'Video URL not available'
            });
        }

        // Generate transcript
        console.log('Generating transcript for video:', id);
        const transcript = await generateTranscript(video.videoUrl);

        if (!transcript) {
            return res.status(500).json({
                success: false,
                message: 'Failed to generate transcript'
            });
        }

        video.transcript = transcript;

        // Generate summary from transcript
        try {
            const summary = await generateSummary(transcript);
            if (summary) {
                video.summary = summary;
            }
        } catch (summaryError) {
            console.error('Summary generation failed (transcript still saved):', summaryError.message);
        }

        await video.save();

        res.status(200).json({
            success: true,
            message: 'Transcript generated successfully',
            data: {
                transcript: video.transcript,
                summary: video.summary
            }
        });
    } catch (error) {
        console.error('Error generating transcript:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Error generating transcript',
            error: error.message
        });
    }
};

/**
 * Get all unique subjects from videos in the database
 */
export const getAllSubjects = async (req, res) => {
    try {
        const subjects = await Video.distinct('subject', { 
            isPublic: true, 
            isApproved: true 
        });
        
        // Sort subjects alphabetically
        const sortedSubjects = subjects.filter(s => s && s.trim()).sort();
        
        res.status(200).json({
            success: true,
            data: sortedSubjects
        });
    } catch (error) {
        console.error('Error fetching subjects:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching subjects',
            error: error.message
        });
    }
};

/**
 * Get related videos based on subject, unit, and year
 */
export const getRelatedVideos = async (req, res) => {
    try {
        const { id } = req.params;
        const { limit = 6 } = req.query;

        const currentVideo = await Video.findById(id);

        if (!currentVideo) {
            return res.status(404).json({
                success: false,
                message: 'Video not found'
            });
        }

        // Find videos with same subject, unit, or year (excluding current video)
        const relatedVideos = await Video.find({
            _id: { $ne: id },
            isPublic: true,
            isApproved: true,
            $or: [
                { subject: currentVideo.subject, unit: currentVideo.unit },
                { subject: currentVideo.subject, year: currentVideo.year },
                { subject: currentVideo.subject }
            ]
        })
            .populate('uploadedBy', 'name picture')
            .select('-transcript')
            .limit(parseInt(limit))
            .sort({ views: -1 });

        res.status(200).json({
            success: true,
            data: relatedVideos
        });
    } catch (error) {
        console.error('Error fetching related videos:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching related videos',
            error: error.message
        });
    }
};

/**
 * Increment share count
 */
export const incrementShareCount = async (req, res) => {
    try {
        const { id } = req.params;

        const video = await Video.findByIdAndUpdate(
            id,
            { $inc: { shares: 1 } },
            { new: true }
        );

        if (!video) {
            return res.status(404).json({
                success: false,
                message: 'Video not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Share count updated',
            data: {
                shares: video.shares
            }
        });
    } catch (error) {
        console.error('Error incrementing share count:', error);
        res.status(500).json({
            success: false,
            message: 'Error incrementing share count',
            error: error.message
        });
    }
};

/**
 * Add or update video chapters
 */
export const updateChapters = async (req, res) => {
    try {
        const { id } = req.params;
        const { chapters } = req.body;

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

        video.chapters = chapters;
        await video.save();

        res.status(200).json({
            success: true,
            message: 'Chapters updated successfully',
            data: video.chapters
        });
    } catch (error) {
        console.error('Error updating chapters:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating chapters',
            error: error.message
        });
    }
};