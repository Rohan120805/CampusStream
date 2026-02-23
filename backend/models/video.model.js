import mongoose from "mongoose";

const videoSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Video title is required'],
        trim: true,
        maxlength: [200, 'Title cannot exceed 200 characters']
    },
    description: {
        type: String,
        default: '',
        maxlength: [2000, 'Description cannot exceed 2000 characters']
    },
    videoUrl: {
        type: String,
        required: true
    },
    thumbnailUrl: {
        type: String,
        default: ''
    },
    duration: {
        type: Number, // in seconds
        default: 0
    },
    uploadedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    subject: {
        type: String,
        required: [true, 'Subject is required'],
        trim: true
    },
    topics: [{
        type: String,
        trim: true
    }],
    tags: [{
        type: String,
        trim: true,
        lowercase: true
    }],
    semester: {
        type: String,
        enum: ['1', '2'],
        default: '1'
    },
    year: {
        type: String,
        enum: ['1st Year', '2nd Year', '3rd Year', '4th Year'],
        required: [true, 'Year is required']
    },
    unit: {
        type: String,
        enum: ['CO1', 'CO2', 'CO3', 'CO4', 'CO5'],
        required: [true, 'Unit is required'],
        trim: true
    },
    documents: [{
        name: {
            type: String,
            required: true
        },
        url: {
            type: String,
            required: true
        },
        type: {
            type: String,
            enum: ['pdf', 'pptx', 'docx', 'ppt', 'doc'],
            required: true
        },
        size: {
            type: Number,
            required: true
        },
        fileName: {
            type: String,
            required: true
        },
        uploadedAt: {
            type: Date,
            default: Date.now
        }
    }],
    views: {
        type: Number,
        default: 0
    },
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    transcript: {
        type: String,
        default: ''
    },
    transcriptUrl: {
        type: String,
        default: ''
    },
    summary: {
        type: String,
        default: ''
    },
    // Video Chapters/Timestamps
    chapters: [{
        title: {
            type: String,
            required: true
        },
        timestamp: {
            type: Number, // in seconds
            required: true
        },
        description: {
            type: String,
            default: ''
        }
    }],
    // User Engagement
    bookmarkedBy: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    watchLaterBy: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    shares: {
        type: Number,
        default: 0
    },
    isPublic: {
        type: Boolean,
        default: true
    },
    isApproved: {
        type: Boolean,
        default: true
    },
    fileName: {
        type: String,
        required: true
    }
}, { 
    timestamps: true 
});

// Indexes for better query performance
videoSchema.index({ subject: 1, semester: 1 });
videoSchema.index({ subject: 1, unit: 1 });
videoSchema.index({ year: 1, semester: 1 });
videoSchema.index({ uploadedBy: 1 });
videoSchema.index({ tags: 1 });
videoSchema.index({ createdAt: -1 });

// Virtual for like count
videoSchema.virtual('likeCount').get(function() {
    return this.likes.length;
});

export default mongoose.model("Video", videoSchema);