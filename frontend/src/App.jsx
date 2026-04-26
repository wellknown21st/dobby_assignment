import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import DashboardPage from './pages/DashboardPage';
import LandingPage from './pages/LandingPage';
import { Layers } from 'lucide-react';
import './index.css';
import './App.css';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-screen">
        <div style={{
          width: 48, height: 48,
          background: 'linear-gradient(135deg, var(--color-primary), #8b5cf6)',
          borderRadius: 12,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff',
          animation: 'float 2s ease-in-out infinite'
        }}>
          <Layers size={24} />
        </div>
        <div style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
          Loading…
        </div>
      </div>
    );
  }

  return user ? children : <Navigate to="/login" replace />;
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;

  // 🔥 redirect logged-in users to dashboard
  return user ? <Navigate to="/dashboard" replace /> : children;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: 'var(--color-surface)',
              color: 'var(--color-text)',
              border: '1px solid var(--color-border)',
              borderRadius: '10px',
              fontSize: '0.875rem',
            },
            success: { iconTheme: { primary: '#2ecc71', secondary: '#fff' } },
            error: { iconTheme: { primary: '#ff4d6d', secondary: '#fff' } },
          }}
        />

        <Routes>

          {/* ✅ Landing Page as root */}
          <Route path="/" element={<LandingPage />} />

          {/* Auth */}
          <Route
            path="/login"
            element={<PublicRoute><LoginPage /></PublicRoute>}
          />
          <Route
            path="/signup"
            element={<PublicRoute><SignupPage /></PublicRoute>}
          />

          {/* ✅ Dashboard moved here */}
          <Route
            path="/dashboard"
            element={<ProtectedRoute><DashboardPage /></ProtectedRoute>}
          />

          <Route
            path="/folder/:folderId"
            element={<ProtectedRoute><DashboardPage /></ProtectedRoute>}
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />

        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
