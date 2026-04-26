import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import {
  Layers, FolderOpen, Image, Shield, Zap, Users,
  ArrowRight, ChevronRight, HardDrive, Lock, Sparkles, LogOut
} from 'lucide-react';
import './LandingPage.css';

const features = [
  {
    icon: <FolderOpen size={22} />,
    title: 'Nested Folders',
    desc: 'Organise media into unlimited nested folders — just like Google Drive, but yours.',
    color: '#6c63ff',
  },
  {
    icon: <Image size={22} />,
    title: 'Image Uploads',
    desc: 'Upload JPEG, PNG, GIF, WEBP and more. Drag-and-drop supported out of the box.',
    color: '#00d4aa',
  },
  {
    icon: <HardDrive size={22} />,
    title: 'Folder Size Tracking',
    desc: 'Every folder shows its total size — calculated recursively across all nested levels.',
    color: '#f39c12',
  },
  {
    icon: <Shield size={22} />,
    title: 'Private & Secure',
    desc: 'JWT-based auth with bcrypt hashing. Your files are only ever visible to you.',
    color: '#ff4d6d',
  },
  {
    icon: <Zap size={22} />,
    title: 'Lightning Fast',
    desc: 'React + Vite frontend with optimistic UI updates keeps everything instant.',
    color: '#a78bfa',
  },
  {
    icon: <Sparkles size={22} />,
    title: 'AI-Ready (MCP)',
    desc: 'Connect Claude Desktop via MCP and manage your media with natural language.',
    color: '#38bdf8',
  },
];

const steps = [
  { n: '01', title: 'Create an account', desc: 'Sign up in seconds — no credit card required.' },
  { n: '02', title: 'Build your folder tree', desc: 'Create root folders and nest them as deep as you need.' },
  { n: '03', title: 'Upload your images', desc: 'Drop images into any folder. Size is tracked automatically.' },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const { user, loading, logout } = useAuth();

  // Treat user as logged-in if we have a token even while auth is still verifying
  const hasToken = !!localStorage.getItem('token');
  const isLoggedIn = user || (!loading && hasToken) || (loading && hasToken);

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
  };

  return (
    <div className="landing">
      {/* ── Navbar ── */}
      <header className="landing-nav">
        <div className="landing-nav-inner">
          <div className="landing-logo">
            <div className="landing-logo-icon"><Layers size={20} /></div>
            <span>Dobby Ads</span>
          </div>
          <div className="landing-nav-links">
            <a href="#features">Features</a>
            <a href="#how">How it works</a>
          </div>
          <div className="landing-nav-cta">
            {isLoggedIn ? (
              <>
                <button
                  id="nav-go-drive"
                  className="btn btn-secondary"
                  onClick={() => navigate('/')}
                >
                  Open My Drive <ArrowRight size={15} />
                </button>
                <button
                  id="nav-logout"
                  className="btn btn-ghost"
                  onClick={handleLogout}
                  style={{ gap: 6, display: 'flex', alignItems: 'center' }}
                >
                  <LogOut size={15} /> Logout
                </button>
              </>
            ) : (
              <>
                <button className="btn btn-ghost" onClick={() => navigate('/login')} id="nav-login">
                  Log in
                </button>
                <button className="btn btn-primary" onClick={() => navigate('/signup')} id="nav-signup">
                  Get started <ArrowRight size={15} />
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="hero">
        <div className="hero-glow hero-glow-1" />
        <div className="hero-glow hero-glow-2" />

        <div className="hero-badge">
          <Sparkles size={13} /> MCP-enabled · AI-ready
        </div>

        <h1 className="hero-title">
          Your media.<br />
          <span className="hero-gradient">Organised, forever.</span>
        </h1>

        <p className="hero-sub">
          A private media drive with unlimited nested folders, recursive size tracking,
          and Claude Desktop integration — built for creators who mean business.
        </p>

        <div className="hero-actions">
          {isLoggedIn ? (
            <button className="btn btn-primary hero-btn" onClick={() => navigate('/')} id="hero-go-drive">
              Open My Drive <ArrowRight size={17} />
            </button>
          ) : (
            <>
              <button className="btn btn-primary hero-btn" onClick={() => navigate('/signup')} id="hero-signup">
                Start for free <ArrowRight size={17} />
              </button>
              <button className="btn btn-secondary hero-btn" onClick={() => navigate('/login')} id="hero-login">
                Sign in
              </button>
            </>
          )}
        </div>

        {/* Mock UI Preview */}
        <div className="hero-preview">
          <div className="preview-bar">
            <span className="dot dot-red" /><span className="dot dot-yellow" /><span className="dot dot-green" />
            <span className="preview-url">dobby-ads · My Drive</span>
          </div>
          <div className="preview-body">
            <div className="preview-sidebar">
              <div className="preview-sidebar-item active"><FolderOpen size={13} /> My Drive</div>
              <div className="preview-sidebar-item"><HardDrive size={13} /> Storage</div>
              <div className="preview-sidebar-item"><Users size={13} /> Account</div>
            </div>
            <div className="preview-main">
              <div className="preview-section-label">FOLDERS</div>
              <div className="preview-folders">
                {['Campaigns', 'Brand Assets', 'Social Media'].map((name, i) => (
                  <div key={i} className="preview-folder-card">
                    <FolderOpen size={16} style={{ color: '#6c63ff' }} />
                    <span>{name}</span>
                    <span className="preview-size">{['2.4 MB', '8.1 MB', '1.7 MB'][i]}</span>
                  </div>
                ))}
              </div>
              <div className="preview-section-label" style={{ marginTop: 12 }}>IMAGES</div>
              <div className="preview-images">
                {['#6c63ff44', '#00d4aa33', '#f39c1233', '#ff4d6d33'].map((bg, i) => (
                  <div key={i} className="preview-img-thumb" style={{ background: bg }}>
                    <Image size={14} style={{ color: '#fff', opacity: 0.6 }} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="section-wrap" id="features">
        <div className="section-label-pill">Features</div>
        <h2 className="section-heading">Everything you need,<br />nothing you don't</h2>
        <p className="section-sub">Built lean with the exact stack required — Node.js, React, MongoDB — plus a bonus MCP layer.</p>

        <div className="features-grid">
          {features.map((f, i) => (
            <div key={i} className="feature-card" style={{ '--accent': f.color }}>
              <div className="feature-icon" style={{ background: f.color + '22', color: f.color }}>
                {f.icon}
              </div>
              <h3 className="feature-title">{f.title}</h3>
              <p className="feature-desc">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="section-wrap alt-bg" id="how">
        <div className="section-label-pill">How it works</div>
        <h2 className="section-heading">Up and running<br />in three steps</h2>

        <div className="steps">
          {steps.map((s, i) => (
            <div key={i} className="step">
              <div className="step-number">{s.n}</div>
              {i < steps.length - 1 && <div className="step-connector" />}
              <h3 className="step-title">{s.title}</h3>
              <p className="step-desc">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── MCP Callout ── */}
      <section className="mcp-section section-wrap">
        <div className="mcp-card">
          <div className="mcp-glow" />
          <div className="mcp-badge"><Sparkles size={12} /> Bonus Feature</div>
          <h2 className="mcp-title">Talk to your drive with Claude</h2>
          <p className="mcp-desc">
            The included MCP server lets Claude Desktop control your folders and images through
            natural language. Just say the word.
          </p>
          <div className="mcp-examples">
            {[
              '"Create a folder called Campaigns inside Projects"',
              '"List all images in the Summer 2024 folder"',
              '"What is the total size of Brand Assets?"',
            ].map((ex, i) => (
              <div key={i} className="mcp-example">
                <ChevronRight size={13} style={{ color: 'var(--color-primary)', flexShrink: 0 }} />
                <span>{ex}</span>
              </div>
            ))}
          </div>
          <div className="mcp-tools">
            {['list_folders', 'create_folder', 'list_images', 'get_folder_info', 'delete_folder'].map((t) => (
              <span key={t} className="mcp-tool-badge">{t}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="cta-section">
        <div className="cta-glow" />
        <Lock size={32} style={{ color: 'var(--color-primary)', opacity: 0.6 }} />
        <h2 className="cta-title">Your media. Private. Organised.</h2>
        <p className="cta-sub">Create an account and start uploading in under a minute.</p>
        {isLoggedIn ? (
          <button className="btn btn-primary hero-btn" onClick={() => navigate('/dashboard')} id="cta-drive">
            Open My Drive <ArrowRight size={17} />
          </button>
        ) : (
          <button className="btn btn-primary hero-btn" onClick={() => navigate('/signup')} id="cta-signup">
            Get started free <ArrowRight size={17} />
          </button>
        )}
      </section>

      {/* ── Footer ── */}
      <footer className="landing-footer">
        <div className="landing-logo" style={{ opacity: 0.5 }}>
          <div className="landing-logo-icon" style={{ width: 26, height: 26 }}><Layers size={14} /></div>
          <span style={{ fontSize: '0.9rem' }}>Dobby Ads</span>
        </div>
        <p style={{ color: 'var(--color-text-dim)', fontSize: '0.8rem' }}>
          Built with Node.js · React · MongoDB
        </p>
      </footer>
    </div>
  );
}
