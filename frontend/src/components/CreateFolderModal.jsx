import { useState } from 'react';
import { X, FolderPlus } from 'lucide-react';
import api from '../api/axios';
import toast from 'react-hot-toast';

export default function CreateFolderModal({ parentId, onClose, onCreated }) {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    try {
      const res = await api.post('/folders', {
        name: name.trim(),
        parent: parentId || undefined,
      });
      toast.success('Folder created!');
      onCreated(res.data.folder);
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create folder');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title flex items-center gap-2">
            <FolderPlus size={20} style={{ color: 'var(--color-primary)' }} />
            New Folder
          </h2>
          <button className="btn btn-ghost btn-icon" onClick={onClose} id="close-folder-modal">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="input-group">
              <label htmlFor="folder-name">Folder name</label>
              <input
                id="folder-name"
                type="text"
                className="input-field"
                placeholder="e.g. Campaigns"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
                required
              />
            </div>
            {parentId && (
              <p className="text-sm text-muted">
                This folder will be created inside the current folder.
              </p>
            )}
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button
              id="create-folder-submit"
              type="submit"
              className="btn btn-primary"
              disabled={loading || !name.trim()}
            >
              {loading ? <span className="spinner" /> : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
