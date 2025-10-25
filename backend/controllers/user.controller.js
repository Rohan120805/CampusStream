import User from '../models/user.model.js';
import Video from '../models/video.model.js';

/**
 * Get user profile with statistics
 */
export const getUserProfile = async (req, res) => {
    try {
        const { id } = req.params;
        
        const user = await User.findById(id)
            .populate('uploadedVideos', 'title thumbnailUrl views likes createdAt')
            .populate('followers', 'name picture email')
            .populate('following', 'name picture email')
            .select('-watchHistory');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Calculate total views across all videos
        const totalViews = user.uploadedVideos.reduce((sum, video) => sum + (video.views || 0), 0);
        
        // Calculate total likes across all videos
        const totalLikes = user.uploadedVideos.reduce((sum, video) => sum + (video.likes?.length || 0), 0);

        const stats = {
            totalUploads: user.uploadedVideos.length,
            totalViews,
            totalLikes,
            totalFollowers: user.followers.length,
            totalFollowing: user.following.length,
            bookmarksCount: user.bookmarks.length,
            watchLaterCount: user.watchLater.length
        };

        res.status(200).json({
            success: true,
            data: {
                user,
                stats
            }
        });
    } catch (error) {
        console.error('Error fetching user profile:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching user profile',
            error: error.message
        });
    }
};

/**
 * Follow/Unfollow a user
 */
export const toggleFollow = async (req, res) => {
    try {
        const { id } = req.params; // user to follow/unfollow
        const currentUserId = req.userId;

        if (id === currentUserId.toString()) {
            return res.status(400).json({
                success: false,
                message: 'You cannot follow yourself'
            });
        }

        const userToFollow = await User.findById(id);
        const currentUser = await User.findById(currentUserId);

        if (!userToFollow) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const isFollowing = currentUser.following.includes(id);

        if (isFollowing) {
            // Unfollow
            currentUser.following.pull(id);
            userToFollow.followers.pull(currentUserId);
        } else {
            // Follow
            currentUser.following.push(id);
            userToFollow.followers.push(currentUserId);
        }

        await currentUser.save();
        await userToFollow.save();

        res.status(200).json({
            success: true,
            message: isFollowing ? 'Unfollowed successfully' : 'Followed successfully',
            data: {
                isFollowing: !isFollowing,
                followersCount: userToFollow.followers.length
            }
        });
    } catch (error) {
        console.error('Error toggling follow:', error);
        res.status(500).json({
            success: false,
            message: 'Error toggling follow',
            error: error.message
        });
    }
};

/**
 * Bookmark/Unbookmark a video
 */
export const toggleBookmark = async (req, res) => {
    try {
        const { videoId } = req.params;
        const userId = req.userId;

        const user = await User.findById(userId);
        const video = await Video.findById(videoId);

        if (!video) {
            return res.status(404).json({
                success: false,
                message: 'Video not found'
            });
        }

        const isBookmarked = user.bookmarks.includes(videoId);

        if (isBookmarked) {
            // Remove bookmark
            user.bookmarks.pull(videoId);
            video.bookmarkedBy.pull(userId);
        } else {
            // Add bookmark
            user.bookmarks.push(videoId);
            video.bookmarkedBy.push(userId);
        }

        await user.save();
        await video.save();

        res.status(200).json({
            success: true,
            message: isBookmarked ? 'Bookmark removed' : 'Video bookmarked',
            data: {
                isBookmarked: !isBookmarked
            }
        });
    } catch (error) {
        console.error('Error toggling bookmark:', error);
        res.status(500).json({
            success: false,
            message: 'Error toggling bookmark',
            error: error.message
        });
    }
};

/**
 * Add/Remove video from watch later
 */
export const toggleWatchLater = async (req, res) => {
    try {
        const { videoId } = req.params;
        const userId = req.userId;

        const user = await User.findById(userId);
        const video = await Video.findById(videoId);

        if (!video) {
            return res.status(404).json({
                success: false,
                message: 'Video not found'
            });
        }

        const isInWatchLater = user.watchLater.includes(videoId);

        if (isInWatchLater) {
            // Remove from watch later
            user.watchLater.pull(videoId);
            video.watchLaterBy.pull(userId);
        } else {
            // Add to watch later
            user.watchLater.push(videoId);
            video.watchLaterBy.push(userId);
        }

        await user.save();
        await video.save();

        res.status(200).json({
            success: true,
            message: isInWatchLater ? 'Removed from watch later' : 'Added to watch later',
            data: {
                isInWatchLater: !isInWatchLater
            }
        });
    } catch (error) {
        console.error('Error toggling watch later:', error);
        res.status(500).json({
            success: false,
            message: 'Error toggling watch later',
            error: error.message
        });
    }
};

/**
 * Get user's bookmarked videos
 */
export const getBookmarks = async (req, res) => {
    try {
        const userId = req.userId;

        const user = await User.findById(userId)
            .populate({
                path: 'bookmarks',
                populate: {
                    path: 'uploadedBy',
                    select: 'name picture'
                }
            });

        res.status(200).json({
            success: true,
            data: user.bookmarks
        });
    } catch (error) {
        console.error('Error fetching bookmarks:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching bookmarks',
            error: error.message
        });
    }
};

/**
 * Get user's watch later videos
 */
export const getWatchLater = async (req, res) => {
    try {
        const userId = req.userId;

        const user = await User.findById(userId)
            .populate({
                path: 'watchLater',
                populate: {
                    path: 'uploadedBy',
                    select: 'name picture'
                }
            });

        res.status(200).json({
            success: true,
            data: user.watchLater
        });
    } catch (error) {
        console.error('Error fetching watch later videos:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching watch later videos',
            error: error.message
        });
    }
};

/**
 * Get user's watch history
 */
export const getWatchHistory = async (req, res) => {
    try {
        const userId = req.userId;

        const user = await User.findById(userId)
            .populate({
                path: 'watchHistory.video',
                populate: {
                    path: 'uploadedBy',
                    select: 'name picture'
                }
            })
            .select('watchHistory');

        // Sort by most recently watched
        const sortedHistory = user.watchHistory.sort((a, b) => 
            new Date(b.lastWatchedAt) - new Date(a.lastWatchedAt)
        );

        res.status(200).json({
            success: true,
            data: sortedHistory
        });
    } catch (error) {
        console.error('Error fetching watch history:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching watch history',
            error: error.message
        });
    }
};

/**
 * Update watch position for a video
 */
export const updateWatchPosition = async (req, res) => {
    try {
        const { videoId } = req.params;
        const { position } = req.body;
        const userId = req.userId;

        const user = await User.findById(userId);
        const video = await Video.findById(videoId);

        if (!video) {
            return res.status(404).json({
                success: false,
                message: 'Video not found'
            });
        }

        // Find existing watch history entry
        const historyIndex = user.watchHistory.findIndex(
            h => h.video.toString() === videoId
        );

        if (historyIndex > -1) {
            // Update existing entry
            user.watchHistory[historyIndex].lastWatchedPosition = position;
            user.watchHistory[historyIndex].lastWatchedAt = new Date();
        } else {
            // Create new entry
            user.watchHistory.push({
                video: videoId,
                lastWatchedPosition: position,
                lastWatchedAt: new Date()
            });
        }

        await user.save();

        res.status(200).json({
            success: true,
            message: 'Watch position updated',
            data: {
                position
            }
        });
    } catch (error) {
        console.error('Error updating watch position:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating watch position',
            error: error.message
        });
    }
};

/**
 * Get watch position for a video
 */
export const getWatchPosition = async (req, res) => {
    try {
        const { videoId } = req.params;
        const userId = req.userId;

        const user = await User.findById(userId).select('watchHistory');

        const historyEntry = user.watchHistory.find(
            h => h.video.toString() === videoId
        );

        res.status(200).json({
            success: true,
            data: {
                position: historyEntry ? historyEntry.lastWatchedPosition : 0,
                lastWatchedAt: historyEntry ? historyEntry.lastWatchedAt : null
            }
        });
    } catch (error) {
        console.error('Error fetching watch position:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching watch position',
            error: error.message
        });
    }
};

/**
 * Clear watch history
 */
export const clearWatchHistory = async (req, res) => {
    try {
        const userId = req.userId;

        await User.findByIdAndUpdate(userId, {
            $set: { watchHistory: [] }
        });

        res.status(200).json({
            success: true,
            message: 'Watch history cleared'
        });
    } catch (error) {
        console.error('Error clearing watch history:', error);
        res.status(500).json({
            success: false,
            message: 'Error clearing watch history',
            error: error.message
        });
    }
};
