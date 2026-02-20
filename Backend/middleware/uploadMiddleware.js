const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
// On Vercel, the filesystem is read-only except for /tmp
const uploadsDir = process.env.VERCEL
    ? path.join('/tmp', 'uploads')
    : path.join(__dirname, '..', 'uploads');

try {
    if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
    }
} catch (err) {
    console.error('Failed to create uploads directory:', err);
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = path.extname(file.originalname);
        cb(null, file.fieldname + '-' + uniqueSuffix + ext);
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

module.exports = { uploadProfileDocs, uploadsDir };
