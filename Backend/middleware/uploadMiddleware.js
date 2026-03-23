const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Configure Cloudinary explicitly with credentials from environment
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dpwtohaz0',
    api_key: process.env.CLOUDINARY_API_KEY || '555746737368663',
    api_secret: process.env.CLOUDINARY_API_SECRET || 'QicpAD2347iApB_NxirYDsuEz6U'
});

// Use Cloudinary as the primary storage
const storage = new CloudinaryStorage({
    cloudinary,
    params: (req, file) => {
        const folder = process.env.CLOUDINARY_FOLDER || 'uploads';
        const isPdf = file.mimetype === 'application/pdf' || file.originalname.toLowerCase().endsWith('.pdf');
        const ext = path.extname(file.originalname).replace('.', '').toLowerCase();

        return {
            folder,
            resource_type: isPdf ? 'raw' : 'image',
            format: ext || undefined,
            public_id: `${file.fieldname}-${Date.now()}-${Math.round(Math.random() * 1e9)}`
        };
    }
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp|pdf/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
        cb(null, true);
    } else {
        cb(new Error('Only image files (jpeg, jpg, png, gif, webp) and PDF are allowed'));
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Upload handler for profile documents
const uploadProfileDocs = upload.fields([
    { name: 'profilePhoto', maxCount: 1 },
    { name: 'aadhaarPhoto', maxCount: 1 },
    { name: 'panCardPhoto', maxCount: 1 }
]);

module.exports = { uploadProfileDocs };
