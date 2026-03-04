const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Detect if running in serverless environment (Vercel, etc.)
const isServerless = process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME;

let storage;

if (isServerless) {
  // Use memory storage for serverless environments
  // Files are processed but not persisted to disk
  storage = multer.memoryStorage();
} else {
  // Use disk storage for local/traditional server environments
  const uploadsDir = path.join(__dirname, '../uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
      // Generate unique filename with user ID
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, `profile-${req.user._id}-${uniqueSuffix}${path.extname(file.originalname)}`);
    }
  });
}

// File filter for images only
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'), false);
  }
};

// Upload middleware
const uploadProfileImage = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  }
});

module.exports = { uploadProfileImage };
