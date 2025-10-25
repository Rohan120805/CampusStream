import mongoose from "mongoose";

const playlistSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Playlist name is required'],
        trim: true,
        maxlength: [100, 'Name cannot exceed 100 characters']
    },
    description: {
        type: String,
        maxlength: [500, 'Description cannot exceed 500 characters'],
        default: ''
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    videos: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Video'
    }],
    subject: {
        type: String,
        default: ''
    },
    semester: {
        type: String,
        enum: ['1', '2', '3', '4', '5', '6', '7', '8', ''],
        default: ''
    },
    isPublic: {
        type: Boolean,
        default: true
    },
    isSyllabusBased: {
        type: Boolean,
        default: false
    },
    thumbnailUrl: {
        type: String,
        default: ''
    }
}, { 
    timestamps: true 
});

// Index for faster queries
playlistSchema.index({ createdBy: 1 });
playlistSchema.index({ subject: 1, semester: 1 });

// Virtual for video count
playlistSchema.virtual('videoCount').get(function() {
    return this.videos.length;
});

export default mongoose.model("Playlist", playlistSchema);