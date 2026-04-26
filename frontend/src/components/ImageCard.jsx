import { useState } from 'react';
import { Trash2, ZoomIn } from 'lucide-react';
import api from '../api/axios';
import toast from 'react-hot-toast';

function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export default function ImageCard({ image, onDeleted }) {
  const [deleting, setDeleting] = useState(false);
  const [lightbox, setLightbox] = useState(false);

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (!window.confirm(`Delete "${image.name}"?`)) return;
    setDeleting(true);
    try {
      await api.delete(`/images/${image._id}`);
      toast.success('Image deleted');
      onDeleted(image._id);
    } catch {
      toast.error('Failed to delete image');
    } finally {
      setDeleting(false);
    }
  };

  // ✅ FIXED IMAGE SOURCE (Cloudinary + fallback)
  const imgSrc =
    image.url ||
    `https://dobby-assignment-qeyw.onrender.com/uploads/${image.filename}`;

  return (
    <>
      <div className="image-card" id={`image-${image._id}`}>
        <img
          src={imgSrc}
          alt={image.name}
          className="image-thumb"
          loading="lazy"
        />

        <div className="image-overlay">
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => setLightbox(true)}
            style={{ gap: 6 }}
          >
            <ZoomIn size={14} /> View
          </button>

          <button
            id={`delete-image-${image._id}`}
            className="btn btn-danger btn-sm"
            onClick={handleDelete}
            disabled={deleting}
            style={{ gap: 6, marginLeft: 6 }}
          >
            {deleting ? (
              <span className="spinner" style={{ width: 12, height: 12 }} />
            ) : (
              <>
                <Trash2 size={12} /> Delete
              </>
            )}
          </button>
        </div>

        <div className="image-info">
          <span className="image-name" title={image.name}>
            {image.name}
          </span>
          <span className="image-size">{formatBytes(image.size)}</span>
        </div>
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div
          className="modal-overlay"
          onClick={() => setLightbox(false)}
          style={{ alignItems: 'center' }}
        >
          <div
            style={{
              maxWidth: '90vw',
              maxHeight: '90vh',
              position: 'relative',
            }}
          >
            <img
              src={imgSrc}
              alt={image.name}
              style={{
                maxWidth: '90vw',
                maxHeight: '85vh',
                borderRadius: 'var(--radius-lg)',
                display: 'block',
              }}
            />
            <div
              style={{
                textAlign: 'center',
                marginTop: 12,
                color: '#fff',
                fontWeight: 600,
              }}
            >
              {image.name}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
