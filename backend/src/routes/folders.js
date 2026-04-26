const express = require('express');
const { body, validationResult } = require('express-validator');
const Folder = require('../models/Folder');
const Image = require('../models/Image');
const { protect } = require('../middleware/auth');
const {
  getDescendantFolderIds,
  getFolderTotalSize,
  formatBytes,
} = require('../utils/folderUtils');

const router = express.Router();

// GET /api/folders — list root folders (parent = null)
router.get('/', protect, async (req, res) => {
  try {
    const folders = await Folder.find({ owner: req.user._id, parent: null }).sort({ name: 1 });

    const foldersWithSize = await Promise.all(
      folders.map(async (folder) => {
        const totalSize = await getFolderTotalSize(folder._id, req.user._id);
        return {
          ...folder.toObject(),
          totalSize,
          totalSizeFormatted: formatBytes(totalSize),
        };
      })
    );

    res.json({ success: true, folders: foldersWithSize });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/folders/:id — get single folder with children and images
router.get('/:id', protect, async (req, res) => {
  try {
    const folder = await Folder.findOne({
      _id: req.params.id,
      owner: req.user._id,
    });

    if (!folder) {
      return res.status(404).json({ success: false, message: 'Folder not found.' });
    }

    // Breadcrumb path
    const breadcrumb = [];
    let current = folder;
    while (current) {
      breadcrumb.unshift({ id: current._id, name: current.name });
      if (current.parent) {
        current = await Folder.findById(current.parent);
      } else {
        current = null;
      }
    }

    // Children folders with sizes
    const children = await Folder.find({
      parent: folder._id,
      owner: req.user._id,
    }).sort({ name: 1 });

    const childrenWithSize = await Promise.all(
      children.map(async (child) => {
        const totalSize = await getFolderTotalSize(child._id, req.user._id);
        return {
          ...child.toObject(),
          totalSize,
          totalSizeFormatted: formatBytes(totalSize),
        };
      })
    );

    // Images directly inside this folder
    const images = await Image.find({
      folder: folder._id,
      owner: req.user._id,
    }).sort({ createdAt: -1 });

    // Total size for this folder
    const totalSize = await getFolderTotalSize(folder._id, req.user._id);

    res.json({
      success: true,
      folder: {
        ...folder.toObject(),
        totalSize,
        totalSizeFormatted: formatBytes(totalSize),
      },
      breadcrumb,
      children: childrenWithSize,
      images,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/folders — create folder
router.post(
  '/',
  protect,
  [body('name').trim().notEmpty().withMessage('Folder name is required')],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    try {
      const { name, parent } = req.body;

      // Validate parent belongs to owner
      if (parent) {
        const parentFolder = await Folder.findOne({
          _id: parent,
          owner: req.user._id,
        });
        if (!parentFolder) {
          return res
            .status(404)
            .json({ success: false, message: 'Parent folder not found.' });
        }
      }

      const folder = await Folder.create({
        name,
        parent: parent || null,
        owner: req.user._id,
      });

      res.status(201).json({ success: true, folder });
    } catch (err) {
      if (err.code === 11000) {
        return res.status(409).json({
          success: false,
          message: 'A folder with this name already exists here.',
        });
      }
      res.status(500).json({ success: false, message: err.message });
    }
  }
);

// DELETE /api/folders/:id — delete folder and all its descendants + images
router.delete('/:id', protect, async (req, res) => {
  try {
    const folder = await Folder.findOne({
      _id: req.params.id,
      owner: req.user._id,
    });

    if (!folder) {
      return res.status(404).json({ success: false, message: 'Folder not found.' });
    }

    const descendantIds = await getDescendantFolderIds(folder._id, req.user._id);
    const allIds = [folder._id, ...descendantIds];

    // Delete all images in these folders
    const fs = require('fs');
    const path = require('path');
    const Image = require('../models/Image');
    const imagesToDelete = await Image.find({ folder: { $in: allIds } });
    for (const img of imagesToDelete) {
      const filePath = path.join(__dirname, '../../uploads', img.filename);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }
    await Image.deleteMany({ folder: { $in: allIds } });

    // Delete all folders
    await Folder.deleteMany({ _id: { $in: allIds } });

    res.json({ success: true, message: 'Folder deleted successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
