import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Layers, LogOut, Home } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : '?';

  return (
    <nav className="navbar">
      <div
        className="navbar-brand"
        style={{ cursor: 'pointer' }}
        onClick={() => navigate('/')}
        id="nav-home"
      >
        <div className="navbar-brand-icon">
          <Layers size={18} />
        </div>
        Dobby Ads
      </div>

      <div className="navbar-actions">
        <button
          id="nav-dashboard"
          className="btn btn-ghost btn-sm"
          onClick={() => navigate('/')}
          style={{ gap: 6 }}
        >
          <Home size={15} /> Drive
        </button>

        <div className="user-pill">
          <div className="user-avatar">{initials}</div>
          <span className="user-name">{user?.name}</span>
        </div>

        <button
          id="logout-btn"
          className="btn btn-secondary btn-sm"
          onClick={handleLogout}
          style={{ gap: 6 }}
        >
          <LogOut size={15} /> Logout
        </button>
      </div>
    </nav>
  );
}
