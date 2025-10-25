import { Storage } from '@google-cloud/storage';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Check if GCS credentials are configured
const isGCSConfigured = process.env.GCS_KEY_FILE && 
                        process.env.GCS_PROJECT_ID && 
                        process.env.GCS_BUCKET_NAME;

let storage = null;
let bucket = null;

// Initialize Google Cloud Storage only if configured
if (isGCSConfigured) {
    const keyFilePath = path.join(__dirname, '../../', process.env.GCS_KEY_FILE);
    
    // Check if key file exists
    if (fs.existsSync(keyFilePath)) {
        storage = new Storage({
            projectId: process.env.GCS_PROJECT_ID,
            keyFilename: keyFilePath
        });
        bucket = storage.bucket(process.env.GCS_BUCKET_NAME);
        console.log('✅ Google Cloud Storage initialized');
    } else {
        console.warn('⚠️  GCS key file not found. File uploads will not work.');
    }
} else {
    console.warn('⚠️  Google Cloud Storage not configured. File uploads will not work.');
}

/**
 * Upload file to Google Cloud Storage
 * @param {Buffer} fileBuffer - File buffer
 * @param {string} filename - Destination filename
 * @param {string} mimetype - File mimetype
 * @returns {Promise<string>} - Public URL of uploaded file
 */
export const uploadToGCS = async (fileBuffer, filename, mimetype) => {
    if (!bucket) {
        throw new Error('Google Cloud Storage is not configured. Please set up GCS credentials.');
    }
    
    const blob = bucket.file(filename);
    const blobStream = blob.createWriteStream({
        resumable: false,
        metadata: {
            contentType: mimetype,
            cacheControl: 'public, max-age=31536000',
        }
    });

    return new Promise((resolve, reject) => {
        blobStream.on('error', (err) => {
            reject(err);
        });

        blobStream.on('finish', async () => {
            // Make the file public
            await blob.makePublic();
            const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
            resolve(publicUrl);
        });

        blobStream.end(fileBuffer);
    });
};

/**
 * Delete file from Google Cloud Storage
 * @param {string} filename - Filename to delete
 */
export const deleteFromGCS = async (filename) => {
    if (!bucket) {
        console.warn('GCS not configured, skipping file deletion');
        return;
    }
    
    try {
        await bucket.file(filename).delete();
        console.log(`File ${filename} deleted successfully`);
    } catch (error) {
        console.error(`Error deleting file ${filename}:`, error);
        throw error;
    }
};

/**
 * Get signed URL for private file access
 * @param {string} filename - Filename
 * @param {number} expiresIn - Expiration time in seconds
 */
export const getSignedUrl = async (filename, expiresIn = 3600) => {
    if (!bucket) {
        throw new Error('Google Cloud Storage is not configured');
    }
    
    const options = {
        version: 'v4',
        action: 'read',
        expires: Date.now() + expiresIn * 1000,
    };

    const [url] = await bucket.file(filename).getSignedUrl(options);
    return url;
};

export { storage, bucket };