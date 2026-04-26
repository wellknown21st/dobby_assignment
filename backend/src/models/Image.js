const mongoose = require('mongoose');

const imageSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Image name is required'],
      trim: true,
      maxlength: [200, 'Image name cannot exceed 200 characters'],
    },
    filename: {
      type: String,
      required: true,
    },
    mimetype: {
      type: String,
      required: true,
    },
    size: {
      type: Number,
      required: true,
    },
    folder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Folder',
      required: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Image', imageSchema);
