import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';

import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import MovieDetail from './pages/MovieDetail';
import BookingPage from './pages/BookingPage';
import MyBookings from './pages/MyBookings';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminMovies from './pages/admin/AdminMovies';
import AdminCinemas from './pages/admin/AdminCinemas';
import AdminShows from './pages/admin/AdminShows';
import AdminBookings from './pages/admin/AdminBookings';
import AdminUsers from './pages/admin/AdminUsers';
import ValidateTicket from './pages/ValidateTicket';
import NotFound from './pages/NotFound';
import Navbar from './components/Navbar';

// ── Protected Route wrapper ────────────────────────────────────────────────
const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin" />
    </div>
  );
  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly && user.role !== 'admin') return <Navigate to="/" replace />;
  return children;
};

// ── All routes ─────────────────────────────────────────────────────────────
const AppRoutes = () => {
  const { user } = useAuth();
  return (
    <>
      <Navbar />
      <Routes>
        {/* Auth routes — redirect logged-in users */}
        <Route path="/login"    element={user ? <Navigate to={user.role === 'admin' ? '/admin' : '/'} replace /> : <Login />} />
        <Route path="/register" element={user ? <Navigate to="/" replace /> : <Register />} />

        {/* Public validation route */}
        <Route path="/validate/:bookingId" element={<ValidateTicket />} />

        {/* Protected user routes */}
        <Route path="/"            element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/movies/:id"  element={<ProtectedRoute><MovieDetail /></ProtectedRoute>} />
        <Route path="/book/:showId" element={<ProtectedRoute><BookingPage /></ProtectedRoute>} />
        <Route path="/my-bookings" element={<ProtectedRoute><MyBookings /></ProtectedRoute>} />

        {/* Protected admin routes */}
        <Route path="/admin"          element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/movies"   element={<ProtectedRoute adminOnly><AdminMovies /></ProtectedRoute>} />
        <Route path="/admin/cinemas"  element={<ProtectedRoute adminOnly><AdminCinemas /></ProtectedRoute>} />
        <Route path="/admin/shows"    element={<ProtectedRoute adminOnly><AdminShows /></ProtectedRoute>} />
        <Route path="/admin/bookings" element={<ProtectedRoute adminOnly><AdminBookings /></ProtectedRoute>} />
        <Route path="/admin/users"    element={<ProtectedRoute adminOnly><AdminUsers /></ProtectedRoute>} />

        {/* 404 — show proper page instead of silent redirect */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: { background: '#fff', color: '#111', border: '1px solid #eee' },
            success: { iconTheme: { primary: '#e50914', secondary: '#fff' } },
            error: { duration: 5000 },
          }}
        />
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
