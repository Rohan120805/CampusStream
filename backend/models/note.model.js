import mongoose from "mongoose";

const noteSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    video: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Video',
        required: true
    },
    content: {
        type: String,
        required: [true, 'Note content is required'],
        maxlength: [5000, 'Note cannot exceed 5000 characters']
    },
    timestamp: {
        type: Number, // video timestamp in seconds
        required: true,
        min: 0
    },
    isPrivate: {
        type: Boolean,
        default: true
    }
}, { 
    timestamps: true 
});

// Index for faster queries
noteSchema.index({ user: 1, video: 1 });
noteSchema.index({ video: 1, timestamp: 1 });

export default mongoose.model("Note", noteSchema);
