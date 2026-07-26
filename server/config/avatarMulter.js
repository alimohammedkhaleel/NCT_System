const multer = require('multer');
const path = require('path');
const fs = require('fs');

// On Vercel (serverless), only /tmp is writable. Use it when VERCEL env is set.
const uploadDir = process.env.VERCEL
  ? '/tmp/uploads/avatars'
  : path.join(__dirname, '../uploads/avatars');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename with timestamp and user ID
    const timestamp = Date.now();
    const ext = path.extname(file.originalname);
    const filename = `avatar-${req.user.id}-${timestamp}${ext}`;
    cb(null, filename);
  }
});

// File filter - only images
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only image files (JPEG, PNG, GIF, WebP) are allowed'), false);
  }
};

// Create multer instance with limits
const avatarUpload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 2 * 1024 * 1024 // 2MB
  }
});

module.exports = avatarUpload;
