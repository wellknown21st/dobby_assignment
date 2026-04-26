const express = require('express');
const path = require('path');
const fs = require('fs');
const { body, validationResult } = require('express-validator');
const Image = require('../models/Image');
const Folder = require('../models/Folder');
const { protect } = require('../middleware/auth');
const upload = require('../utils/upload');

const router = express.Router();

// POST /api/images — upload an image to a folder
router.post(
  '/',
  protect,
  upload.single('image'),
  [body('name').trim().notEmpty().withMessage('Image name is required')],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // Clean up uploaded file if validation fails
      if (req.file) fs.unlinkSync(req.file.path);
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: 'Image file is required.' });
    }

    try {
      const { name, folder: folderId } = req.body;

      if (!folderId) {
        fs.unlinkSync(req.file.path);
        return res
          .status(400)
          .json({ success: false, message: 'Folder ID is required.' });
      }

      // Verify folder belongs to owner
      const folder = await Folder.findOne({
        _id: folderId,
        owner: req.user._id,
      });
      if (!folder) {
        fs.unlinkSync(req.file.path);
        return res
          .status(404)
          .json({ success: false, message: 'Folder not found.' });
      }

      const image = await Image.create({
        name,
        filename: req.file.filename,
        mimetype: req.file.mimetype,
        size: req.file.size,
        folder: folderId,
        owner: req.user._id,
      });

      res.status(201).json({ success: true, image });
    } catch (err) {
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      res.status(500).json({ success: false, message: err.message });
    }
  }
);

// DELETE /api/images/:id — delete an image
router.delete('/:id', protect, async (req, res) => {
  try {
    const image = await Image.findOne({
      _id: req.params.id,
      owner: req.user._id,
    });

    if (!image) {
      return res.status(404).json({ success: false, message: 'Image not found.' });
    }

    const filePath = path.join(__dirname, '../../uploads', image.filename);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    await Image.deleteOne({ _id: image._id });

    res.json({ success: true, message: 'Image deleted successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
