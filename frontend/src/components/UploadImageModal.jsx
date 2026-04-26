import { useState, useRef } from 'react';
import { X, UploadCloud, Image as ImageIcon } from 'lucide-react';
import api from '../api/axios';
import toast from 'react-hot-toast';

export default function UploadImageModal({ folderId, onClose, onUploaded }) {
  const [name, setName] = useState('');
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef();

  const handleFile = (f) => {
    if (!f) return;
    setFile(f);
    if (!name) setName(f.name.replace(/\.[^.]+$/, ''));
    const url = URL.createObjectURL(f);
    setPreview(url);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) { toast.error('Please select an image'); return; }
    if (!name.trim()) { toast.error('Please enter a name'); return; }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('name', name.trim());
      formData.append('folder', folderId);
      formData.append('image', file);

      const res = await api.post('/images', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('Image uploaded!');
      onUploaded(res.data.image);
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title">Upload Image</h2>
          <button className="btn btn-ghost btn-icon" onClick={onClose} id="close-upload-modal">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {/* Drop zone */}
            <div
              id="drop-zone"
              className={`drop-zone ${dragging ? 'dragging' : ''}`}
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileRef.current.click()}
            >
              {preview ? (
                <img src={preview} alt="preview" className="preview-thumb" style={{ margin: '0 auto' }} />
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                  <UploadCloud size={32} style={{ color: 'var(--color-text-dim)' }} />
                  <div style={{ fontWeight: 600 }}>Drop image here</div>
                  <div className="text-sm text-muted">or click to browse</div>
                  <div className="text-xs text-muted">JPEG, PNG, GIF, WEBP, SVG (max 10 MB)</div>
                </div>
              )}
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={(e) => handleFile(e.target.files[0])}
            />

            {file && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', background: 'var(--color-surface-2)', borderRadius: 'var(--radius-sm)', fontSize: '0.82rem' }}>
                <ImageIcon size={14} />
                <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{file.name}</span>
                <span className="text-muted">{(file.size / 1024).toFixed(1)} KB</span>
              </div>
            )}

            <div className="input-group">
              <label htmlFor="img-name">Image name</label>
              <input
                id="img-name"
                type="text"
                className="input-field"
                placeholder="e.g. Campaign Banner"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button
              id="upload-submit"
              type="submit"
              className="btn btn-primary"
              disabled={loading || !file}
            >
              {loading ? <><span className="spinner" /> Uploading…</> : 'Upload'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
