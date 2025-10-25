import multer from 'multer';
import path from 'path';

// Configure multer for memory storage
const storage = multer.memoryStorage();

// File filter for videos
const videoFileFilter = (req, file, cb) => {
    const allowedTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/avi', 'video/quicktime'];
    
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only video files are allowed (MP4, WebM, OGG, AVI, MOV).'), false);
    }
};

// File filter for images (thumbnails)
const imageFileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only image files are allowed (JPEG, PNG, WebP).'), false);
    }
};

// File filter for documents (PDF, PPTX, DOCX)
const documentFileFilter = (req, file, cb) => {
    const allowedTypes = [
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation', // pptx
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // docx
        'application/msword', // doc
        'application/vnd.ms-powerpoint' // ppt
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid document type. Only PDF, PPTX, and DOCX files are allowed.'), false);
    }
};

// Upload middleware for videos
export const uploadVideo = multer({
    storage: storage,
    fileFilter: videoFileFilter,
    limits: {
        fileSize: 500 * 1024 * 1024 // 500MB limit
    }
}).single('video');

// Upload middleware for thumbnails
export const uploadThumbnail = multer({
    storage: storage,
    fileFilter: imageFileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    }
}).single('thumbnail');

// Upload middleware for multiple files
export const uploadVideoWithThumbnail = multer({
    storage: storage,
    limits: {
        fileSize: 500 * 1024 * 1024
    }
}).fields([
    { name: 'video', maxCount: 1 },
    { name: 'thumbnail', maxCount: 1 }
]);

// Upload middleware for complete video upload (video + thumbnail + documents)
export const uploadVideoComplete = multer({
    storage: storage,
    limits: {
        fileSize: 500 * 1024 * 1024 // 500MB max per file
    },
    fileFilter: (req, file, cb) => {
        // Allow video files
        if (file.fieldname === 'video') {
            const allowedTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/avi', 'video/quicktime'];
            if (allowedTypes.includes(file.mimetype)) {
                return cb(null, true);
            }
            return cb(new Error('Invalid video type. Only MP4, WebM, OGG, AVI, MOV are allowed.'), false);
        }
        
        // Allow image files for thumbnails
        if (file.fieldname === 'thumbnail') {
            const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
            if (allowedTypes.includes(file.mimetype)) {
                return cb(null, true);
            }
            return cb(new Error('Invalid thumbnail type. Only JPEG, PNG, WebP are allowed.'), false);
        }
        
        // Allow document files
        if (file.fieldname === 'documents') {
            const allowedTypes = [
                'application/pdf',
                'application/vnd.openxmlformats-officedocument.presentationml.presentation',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'application/msword',
                'application/vnd.ms-powerpoint'
            ];
            if (allowedTypes.includes(file.mimetype)) {
                return cb(null, true);
            }
            return cb(new Error('Invalid document type. Only PDF, PPTX, DOCX are allowed.'), false);
        }
        
        cb(new Error('Unexpected field'), false);
    }
}).fields([
    { name: 'video', maxCount: 1 },
    { name: 'thumbnail', maxCount: 1 },
    { name: 'documents', maxCount: 10 } // Allow up to 10 documents
]);

// Upload middleware for transcript only
export const uploadTranscript = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit for transcript
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['text/plain', 'application/octet-stream'];
        if (allowedTypes.includes(file.mimetype) || file.originalname.endsWith('.txt')) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only TXT files are allowed.'), false);
        }
    }
}).single('transcript');

// Error handling middleware for multer
export const handleUploadError = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                success: false,
                message: 'File too large. Maximum size is 500MB for videos and 5MB for images.'
            });
        }
        return res.status(400).json({
            success: false,
            message: `Upload error: ${err.message}`
        });
    } else if (err) {
        return res.status(400).json({
            success: false,
            message: err.message
        });
    }
    next();
};