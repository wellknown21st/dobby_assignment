import { useState } from 'react';
import { Folder, Trash2, ChevronRight, HardDrive } from 'lucide-react';
import api from '../api/axios';
import toast from 'react-hot-toast';

export default function FolderCard({ folder, onClick, onDeleted }) {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (!window.confirm(`Delete "${folder.name}" and all its contents? This cannot be undone.`)) return;
    setDeleting(true);
    try {
      await api.delete(`/folders/${folder._id}`);
      toast.success('Folder deleted');
      onDeleted(folder._id);
    } catch {
      toast.error('Failed to delete folder');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div
      className="folder-card"
      onClick={onClick}
      id={`folder-${folder._id}`}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick()}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div className="folder-icon-wrap">
          <Folder size={24} />
        </div>
        <div className="folder-actions" onClick={(e) => e.stopPropagation()}>
          <button
            id={`delete-folder-${folder._id}`}
            className="btn btn-ghost btn-icon"
            onClick={handleDelete}
            disabled={deleting}
            title="Delete folder"
            style={{ color: 'var(--color-danger)' }}
          >
            {deleting ? <span className="spinner" style={{ width: 14, height: 14 }} /> : <Trash2 size={14} />}
          </button>
        </div>
      </div>

      <div className="folder-name">{folder.name}</div>

      <div className="folder-meta">
        <div className="size-chip">
          <HardDrive size={11} />
          {folder.totalSizeFormatted}
        </div>
        <ChevronRight size={14} />
      </div>
    </div>
  );
}
