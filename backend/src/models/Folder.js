const mongoose = require('mongoose');

const folderSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Folder name is required'],
      trim: true,
      maxlength: [200, 'Folder name cannot exceed 200 characters'],
    },
    parent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Folder',
      default: null,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

// Compound index so each owner can't have duplicate folder names under same parent
folderSchema.index({ name: 1, parent: 1, owner: 1 }, { unique: true });

module.exports = mongoose.model('Folder', folderSchema);
