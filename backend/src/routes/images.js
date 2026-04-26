const express = require('express');
const { body, validationResult } = require('express-validator');
const Image = require('../models/Image');
const Folder = require('../models/Folder');
const { protect } = require('../middleware/auth');
const upload = require('../utils/upload');
const cloudinary = require('../config/cloudinary');

const router = express.Router();

// POST /api/images — upload image
router.post(
  '/',
  protect,
  upload.single('image'),
  [body('name').trim().notEmpty().withMessage('Image name is required')],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Image file is required.',
      });
    }

    try {
      const { name, folder: folderId } = req.body;

      // Verify folder belongs to user
      const folder = await Folder.findOne({
        _id: folderId,
        owner: req.user._id,
      });

      if (!folder) {
        return res.status(404).json({
          success: false,
          message: 'Folder not found.',
        });
      }

      const image = await Image.create({
        name,
        url: req.file.path,         // Cloudinary URL
        public_id: req.file.filename,
        size: req.file.size,
        folder: folderId,
        owner: req.user._id,
      });

      res.status(201).json({ success: true, image });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
);

// DELETE /api/images/:id
router.delete('/:id', protect, async (req, res) => {
  try {
    const image = await Image.findOne({
      _id: req.params.id,
      owner: req.user._id,
    });

    if (!image) {
      return res.status(404).json({
        success: false,
        message: 'Image not found.',
      });
    }

    // Delete from Cloudinary
    if (image.public_id) {
      await cloudinary.uploader.destroy(image.public_id);
    }

    await Image.deleteOne({ _id: image._id });

    res.json({
      success: true,
      message: 'Image deleted successfully.',
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
