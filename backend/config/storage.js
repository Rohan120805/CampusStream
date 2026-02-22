import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env') });

// Configure Cloudinary
const isCloudinaryConfigured = process.env.CLOUDINARY_CLOUD_NAME && 
                               process.env.CLOUDINARY_API_KEY && 
                               process.env.CLOUDINARY_API_SECRET;

if (isCloudinaryConfigured) {
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
        secure: true
    });
    console.log('✅ Cloudinary configured successfully');
} else {
    console.warn('⚠️  Cloudinary not configured. File uploads will not work.');
    console.warn('   Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET');
}

/**
 * Upload file to Cloudinary
 * @param {Buffer} fileBuffer - File buffer
 * @param {string} folder - Destination folder (videos/thumbnails/documents/transcripts)
 * @param {string} resourceType - Resource type ('video', 'image', 'raw')
 * @returns {Promise<string>} - Public URL of uploaded file
 */
export const uploadToCloudinary = async (fileBuffer, folder, resourceType = 'auto') => {
    if (!isCloudinaryConfigured) {
        throw new Error('Cloudinary is not configured. Please set up Cloudinary credentials.');
    }
    
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder: `campusstream/${folder}`,
                resource_type: resourceType,
                ...(resourceType === 'video' && {
                    chunk_size: 6000000, // 6MB chunks for large videos
                    eager_async: true,
                    eager: [
                        { quality: 'auto', fetch_format: 'auto' }
                    ]
                })
            },
            (error, result) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(result.secure_url);
                }
            }
        );

        uploadStream.end(fileBuffer);
    });
};

/**
 * Delete file from Cloudinary
 * @param {string} publicUrl - Public URL of the file to delete
 * @param {string} resourceType - Resource type ('video', 'image', 'raw')
 */
export const deleteFromCloudinary = async (publicUrl, resourceType = 'video') => {
    if (!isCloudinaryConfigured) {
        console.warn('Cloudinary not configured, skipping file deletion');
        return;
    }
    
    try {
        // Extract public_id from URL
        // URL format: https://res.cloudinary.com/{cloud_name}/{resource_type}/upload/{version}/{public_id}.{format}
        const urlParts = publicUrl.split('/');
        const uploadIndex = urlParts.findIndex(part => part === 'upload');
        
        if (uploadIndex === -1) {
            console.error('Invalid Cloudinary URL format');
            return;
        }
        
        // Get everything after 'upload/' and before the file extension
        const pathAfterUpload = urlParts.slice(uploadIndex + 2).join('/');
        const publicId = pathAfterUpload.substring(0, pathAfterUpload.lastIndexOf('.'));
        
        await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
        console.log(`File deleted successfully: ${publicId}`);
    } catch (error) {
        console.error(`Error deleting file from Cloudinary:`, error);
        throw error;
    }
};

/**
 * Get optimized URL for video streaming
 * @param {string} publicUrl - Original Cloudinary URL
 * @param {Object} options - Transformation options
 */
export const getOptimizedUrl = (publicUrl, options = {}) => {
    if (!publicUrl || !publicUrl.includes('cloudinary.com')) {
        return publicUrl;
    }
    
    // Default optimizations
    const defaultOptions = {
        quality: 'auto',
        fetch_format: 'auto',
        ...options
    };
    
    // For videos, add streaming optimizations
    if (publicUrl.includes('/video/')) {
        defaultOptions.streaming_profile = 'hd';
    }
    
    return publicUrl;
};

export { cloudinary };
