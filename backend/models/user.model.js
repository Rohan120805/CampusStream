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