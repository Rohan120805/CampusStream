import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ⚠️ CRITICAL: Load .env FIRST, before any other imports that use env variables
dotenv.config({ path: path.join(__dirname, '../.env') });

// Debug: Check if environment variables are loaded
console.log('🔧 Environment Configuration Check:');
console.log('  AUTH0_DOMAIN:', process.env.AUTH0_DOMAIN || '❌ NOT SET');
console.log('  AUTH0_AUDIENCE:', process.env.AUTH0_AUDIENCE || '❌ NOT SET');
console.log('  AUTH0_ISSUER:', process.env.AUTH0_ISSUER || '❌ NOT SET');
console.log('  GCS_PROJECT_ID:', process.env.GCS_PROJECT_ID ? '✅ Set' : '⚠️ Not set');
console.log('  MONGO_URI:', process.env.MONGO_URI ? '✅ Set' : '❌ NOT SET');
console.log('');

// NOW import modules that depend on environment variables
import { connectDB } from './config/db.js';
import authRoutes from './routes/auth.route.js';
import videoRoutes from './routes/video.route.js';
import playlistRoutes from './routes/playlist.route.js';
import commentRoutes from './routes/comment.route.js';
// Import and initialize GCS after env is loaded
import './config/gcs.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/videos', videoRoutes);
app.use('/api/playlists', playlistRoutes);
app.use('/api/comments', commentRoutes);

// Health check
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', message: 'Server is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal Server Error'
    });
});

// Start server
app.listen(PORT, () => {
    connectDB();
    console.log(`Server is running on http://localhost:${PORT}`);
});