import Comment from '../models/comment.model.js';
import Video from '../models/video.model.js';

/**
 * Create a new comment
 */
export const createComment = async (req, res) => {
    try {
        const { videoId, text, parentComment, isQuestion } = req.body;

        // Check if video exists
        const video = await Video.findById(videoId);
        if (!video) {
            return res.status(404).json({
                success: false,
                message: 'Video not found'
            });
        }

        // If replying to a comment, check if parent exists
        if (parentComment) {
            const parent = await Comment.findById(parentComment);
            if (!parent) {
                return res.status(404).json({
                    success: false,
                    message: 'Parent comment not found'
                });
            }
        }

        const comment = await Comment.create({
            videoId,
            userId: req.userId,
            text,
            parentComment: parentComment || null,
            isQuestion: isQuestion || false,
            isAnswer: parentComment ? true : false
        });

        await comment.populate('userId', 'name picture');

        res.status(201).json({
            success: true,
            message: 'Comment created successfully',
            data: comment
        });
    } catch (error) {
        console.error('Error creating comment:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating comment',
            error: error.message
        });
    }
};

/**
 * Get all comments for a video
 */
export const getVideoComments = async (req, res) => {
    try {
        const { videoId } = req.params;
        const { page = 1, limit = 20, type } = req.query;

        const query = { videoId, parentComment: null };
        
        if (type === 'questions') {
            query.isQuestion = true;
        }

        const comments = await Comment.find(query)
            .populate('userId', 'name picture role')
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort({ createdAt: -1 });

        // Get replies for each comment
        const commentsWithReplies = await Promise.all(
            comments.map(async (comment) => {
                const replies = await Comment.find({ parentComment: comment._id })
                    .populate('userId', 'name picture role')
                    .sort({ createdAt: 1 });
                
                return {
                    ...comment.toObject(),
                    replies
                };
            })
        );

        const count = await Comment.countDocuments(query);

        res.status(200).json({
            success: true,
            data: commentsWithReplies,
            totalPages: Math.ceil(count / limit),
            currentPage: parseInt(page),
            totalComments: count
        });
    } catch (error) {
        console.error('Error fetching comments:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching comments',
            error: error.message
        });
    }
};

/**
 * Update a comment
 */
export const updateComment = async (req, res) => {
    try {
        const { id } = req.params;
        const { text } = req.body;

        const comment = await Comment.findById(id);

        if (!comment) {
            return res.status(404).json({
                success: false,
                message: 'Comment not found'
            });
        }

        // Check ownership
        if (comment.userId.toString() !== req.userId.toString()) {
            return res.status(403).json({
                success: false,
                message: 'You do not have permission to update this comment'
            });
        }

        comment.text = text;
        comment.isEdited = true;
        await comment.save();

        await comment.populate('userId', 'name picture');

        res.status(200).json({
            success: true,
            message: 'Comment updated successfully',
            data: comment
        });
    } catch (error) {
        console.error('Error updating comment:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating comment',
            error: error.message
        });
    }
};

/**
 * Delete a comment
 */
export const deleteComment = async (req, res) => {
    try {
        const { id } = req.params;

        const comment = await Comment.findById(id);

        if (!comment) {
            return res.status(404).json({
                success: false,
                message: 'Comment not found'
            });
        }

        // Check ownership
        if (comment.userId.toString() !== req.userId.toString()) {
            return res.status(403).json({
                success: false,
                message: 'You do not have permission to delete this comment'
            });
        }

        // Delete all replies first
        await Comment.deleteMany({ parentComment: id });

        // Delete the comment
        await Comment.findByIdAndDelete(id);

        res.status(200).json({
            success: true,
            message: 'Comment deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting comment:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting comment',
            error: error.message
        });
    }
};

/**
 * Like/Unlike a comment
 */
export const toggleLike = async (req, res) => {
    try {
        const { id } = req.params;

        const comment = await Comment.findById(id);

        if (!comment) {
            return res.status(404).json({
                success: false,
                message: 'Comment not found'
            });
        }

        const likeIndex = comment.likes.indexOf(req.userId);

        if (likeIndex > -1) {
            // Unlike
            comment.likes.splice(likeIndex, 1);
        } else {
            // Like
            comment.likes.push(req.userId);
        }

        await comment.save();

        res.status(200).json({
            success: true,
            message: likeIndex > -1 ? 'Comment unliked' : 'Comment liked',
            data: {
                likes: comment.likes.length,
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