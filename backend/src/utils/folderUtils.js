const Folder = require('../models/Folder');
const Image = require('../models/Image');

/**
 * Recursively collect all descendant folder IDs for a given folder.
 */
async function getDescendantFolderIds(folderId, ownerId) {
  const children = await Folder.find({ parent: folderId, owner: ownerId }).select('_id');
  let ids = children.map((c) => c._id);
  for (const child of children) {
    const grandChildren = await getDescendantFolderIds(child._id, ownerId);
    ids = ids.concat(grandChildren);
  }
  return ids;
}

/**
 * Calculate the total size (in bytes) of all images inside a folder
 * and all its nested descendants.
 */
async function getFolderTotalSize(folderId, ownerId) {
  const descendantIds = await getDescendantFolderIds(folderId, ownerId);
  const allFolderIds = [folderId, ...descendantIds];

  const result = await Image.aggregate([
    { $match: { folder: { $in: allFolderIds }, owner: ownerId } },
    { $group: { _id: null, total: { $sum: '$size' } } },
  ]);

  return result.length > 0 ? result[0].total : 0;
}

/**
 * Format bytes to human readable string.
 */
function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

module.exports = { getDescendantFolderIds, getFolderTotalSize, formatBytes };
