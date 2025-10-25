import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    auth0Id: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        match: [/@klh\.edu\.in$/, 'Only KLH email addresses are allowed']
    },
    name: {
        type: String,
        required: true
    },
    picture: {
        type: String,
        default: ''
    },
    role: {
        type: String,
        enum: ['user'],
        default: 'user'
    },
    department: {
        type: String,
        default: ''
    },
    uploadedVideos: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Video'
    }],
    playlists: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Playlist'
    }],
    // Social Features
    followers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    following: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    // Watch Features
    bookmarks: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Video'
    }],
    watchLater: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Video'
    }],
    watchHistory: [{
        video: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Video'
        },
        lastWatchedPosition: {
            type: Number, // in seconds
            default: 0
        },
        lastWatchedAt: {
            type: Date,
            default: Date.now
        }
    }],
    isActive: {
        type: Boolean,
        default: true
    }
}, { 
    timestamps: true 
});

// Index for faster queries
userSchema.index({ email: 1, auth0Id: 1 });

export default mongoose.model("User", userSchema);