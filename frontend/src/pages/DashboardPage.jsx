import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  FolderPlus, UploadCloud, Home, ChevronRight,
  Folder, Image as ImageIcon, HardDrive, RefreshCw
} from 'lucide-react';
import Navbar from '../components/Navbar';
import FolderCard from '../components/FolderCard';
import ImageCard from '../components/ImageCard';
import CreateFolderModal from '../components/CreateFolderModal';
import UploadImageModal from '../components/UploadImageModal';
import api from '../api/axios';
import toast from 'react-hot-toast';

export default function DashboardPage() {
  const { folderId } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState(null);   // { folder?, breadcrumb?, children, images }
  const [rootFolders, setRootFolders] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [showUpload, setShowUpload] = useState(false);

  const fetchRoot = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/folders');
      setRootFolders(res.data.folders);
      setData(null);
    } catch {
      toast.error('Failed to load folders');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchFolder = useCallback(async (id) => {
    setLoading(true);
    try {
      const res = await api.get(`/folders/${id}`);
      setData(res.data);
    } catch {
      toast.error('Failed to load folder');
      navigate('/');
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    if (folderId) {
      fetchFolder(folderId);
    } else {
      fetchRoot();
    }
  }, [folderId, fetchRoot, fetchFolder]);

  const refresh = () => {
    if (folderId) fetchFolder(folderId);
    else fetchRoot();
  };

  // Handlers
  const handleFolderCreated = (newFolder) => {
    if (folderId) {
      setData((prev) => ({
        ...prev,
        children: [newFolder, ...(prev?.children || [])].sort((a, b) => a.name.localeCompare(b.name)),
      }));
    } else {
      setRootFolders((prev) => [newFolder, ...prev].sort((a, b) => a.name.localeCompare(b.name)));
    }
  };

  const handleFolderDeleted = (id) => {
    if (folderId) {
      setData((prev) => ({ ...prev, children: prev.children.filter((f) => f._id !== id) }));
    } else {
      setRootFolders((prev) => prev.filter((f) => f._id !== id));
    }
  };

  const handleImageUploaded = (newImage) => {
    setData((prev) => ({ ...prev, images: [newImage, ...(prev?.images || [])] }));
    // Refresh to update folder size
    setTimeout(() => fetchFolder(folderId), 500);
  };

  const handleImageDeleted = (id) => {
    setData((prev) => ({ ...prev, images: prev.images.filter((img) => img._id !== id) }));
    setTimeout(() => fetchFolder(folderId), 500);
  };

  const isRoot = !folderId;
  const folders = isRoot ? rootFolders : (data?.children || []);
  const images = data?.images || [];
  const currentFolder = data?.folder;
  const breadcrumb = data?.breadcrumb || [];

  return (
    <div className="app-layout">
      <Navbar />

      <main className="main-content">
        {/* Breadcrumb */}
        <div className="breadcrumb">
          <div className="breadcrumb-item">
            <span
              className="breadcrumb-link"
              onClick={() => navigate('/')}
              id="breadcrumb-home"
              style={{ display: 'flex', alignItems: 'center', gap: 4 }}
            >
              <Home size={14} /> My Drive
            </span>
          </div>
          {breadcrumb.map((crumb, i) => (
            <div key={crumb.id} className="breadcrumb-item">
              <ChevronRight size={14} className="breadcrumb-sep" />
              {i === breadcrumb.length - 1 ? (
                <span className="breadcrumb-current">{crumb.name}</span>
              ) : (
                <span
                  className="breadcrumb-link"
                  onClick={() => navigate(`/folder/${crumb.id}`)}
                  id={`breadcrumb-${crumb.id}`}
                >
                  {crumb.name}
                </span>
              )}
            </div>
          ))}
        </div>

        {/* Page Header */}
        <div className="page-header">
          <div>
            <h1 className="page-title">
              {isRoot ? 'My Drive' : currentFolder?.name || '…'}
            </h1>
            {currentFolder && (
              <p className="page-subtitle">
                Total size:{' '}
                <span style={{ color: 'var(--color-accent)', fontWeight: 600 }}>
                  {currentFolder.totalSizeFormatted}
                </span>
              </p>
            )}
          </div>

          <div className="page-actions">
            <button
              id="refresh-btn"
              className="btn btn-ghost btn-sm"
              onClick={refresh}
              title="Refresh"
            >
              <RefreshCw size={15} />
            </button>
            <button
              id="new-folder-btn"
              className="btn btn-secondary"
              onClick={() => setShowCreateFolder(true)}
            >
              <FolderPlus size={16} /> New Folder
            </button>
            {folderId && (
              <button
                id="upload-image-btn"
                className="btn btn-primary"
                onClick={() => setShowUpload(true)}
              >
                <UploadCloud size={16} /> Upload Image
              </button>
            )}
          </div>
        </div>

        {/* Stats */}
        {!isRoot && data && (
          <div className="stats-bar">
            <div className="stat-pill">
              <Folder size={14} className="stat-pill-icon" />
              <span className="stat-pill-value">{folders.length}</span>
              <span className="stat-pill-label">Sub-folders</span>
            </div>
            <div className="stat-pill">
              <ImageIcon size={14} className="stat-pill-icon" />
              <span className="stat-pill-value">{images.length}</span>
              <span className="stat-pill-label">Images</span>
            </div>
            <div className="stat-pill">
              <HardDrive size={14} className="stat-pill-icon" />
              <span className="stat-pill-value">{currentFolder?.totalSizeFormatted}</span>
              <span className="stat-pill-label">Total size</span>
            </div>
          </div>
        )}

        {/* Loading skeleton */}
        {loading && (
          <div className="grid">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="skeleton" style={{ height: 140, borderRadius: 'var(--radius-lg)' }} />
            ))}
          </div>
        )}

        {/* Folders Section */}
        {!loading && (
          <>
            {folders.length > 0 && (
              <div className="section">
                <div className="section-title">
                  <Folder size={13} /> Folders
                </div>
                <div className="grid">
                  {folders.map((folder) => (
                    <FolderCard
                      key={folder._id}
                      folder={folder}
                      onClick={() => navigate(`/folder/${folder._id}`)}
                      onDeleted={handleFolderDeleted}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Images Section (only inside a folder) */}
            {folderId && images.length > 0 && (
              <div className="section">
                <div className="section-title">
                  <ImageIcon size={13} /> Images
                </div>
                <div className="image-grid">
                  {images.map((img) => (
                    <ImageCard key={img._id} image={img} onDeleted={handleImageDeleted} />
                  ))}
                </div>
              </div>
            )}

            {/* Empty state */}
            {folders.length === 0 && (isRoot || images.length === 0) && (
              <div className="empty-state">
                <div className="empty-icon">
                  {isRoot ? <Folder size={28} /> : <ImageIcon size={28} />}
                </div>
                <div className="empty-title">
                  {isRoot ? 'No folders yet' : 'This folder is empty'}
                </div>
                <div className="empty-desc">
                  {isRoot
                    ? 'Create your first folder to get started organising your media.'
                    : 'Create sub-folders or upload images to this folder.'}
                </div>
                <button
                  className="btn btn-primary"
                  onClick={() => setShowCreateFolder(true)}
                  style={{ marginTop: 8 }}
                >
                  <FolderPlus size={15} /> New Folder
                </button>
              </div>
            )}

            {/* Images empty state */}
            {folderId && folders.length > 0 && images.length === 0 && (
              <div className="section">
                <div className="section-title">
                  <ImageIcon size={13} /> Images
                </div>
                <div className="empty-state" style={{ padding: '32px 24px' }}>
                  <div className="empty-icon">
                    <ImageIcon size={24} />
                  </div>
                  <div className="empty-title">No images yet</div>
                  <button className="btn btn-primary btn-sm" onClick={() => setShowUpload(true)}>
                    <UploadCloud size={13} /> Upload Image
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* Modals */}
      {showCreateFolder && (
        <CreateFolderModal
          parentId={folderId || null}
          onClose={() => setShowCreateFolder(false)}
          onCreated={handleFolderCreated}
        />
      )}
      {showUpload && folderId && (
        <UploadImageModal
          folderId={folderId}
          onClose={() => setShowUpload(false)}
          onUploaded={handleImageUploaded}
        />
      )}
    </div>
  );
}
