const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');

// Set up storage config for multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './uploads');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

// File filter for multer
const fileFilter = (req, file, cb) => {
  // Accept images only
  if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
    return cb(new Error('Only image files are allowed!'), false);
  }
  cb(null, true);
};

// Initialize multer
const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// POST /api/addimage
router.post('/addimage', upload.single('img'), (req, res) => {
  try {
    req.body = {}
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    res.json({ 
      success: true,
      path: req.file.filename,
      message: 'File uploaded successfully'
    });
  } catch (e) {
    console.error('Upload error:', e);
    res.status(500).json({ 
      success: false,
      error: e.message || 'Internal server error'
    });
  }
});

module.exports = router;
