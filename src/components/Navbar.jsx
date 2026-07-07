import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Film, Ticket, User, LogOut, Menu, X, ShieldCheck, Home, MapPin } from 'lucide-react';

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/login'); };
  const isActive = (path) => location.pathname === path;

  if (!user) return null;

  return (
    <nav className="sticky top-0 z-50 bg-gray-800/95 backdrop-blur-md border-b border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to={isAdmin ? '/admin' : '/'} className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-brand rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
              <Film className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white">Find<span className="text-brand">Seat</span></span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {isAdmin ? (
              <>
                <NavLink to="/admin" active={isActive('/admin')} icon={<Home size={16}/>}>Dashboard</NavLink>
                <NavLink to="/admin/movies" active={isActive('/admin/movies')} icon={<Film size={16}/>}>Movies</NavLink>
                <NavLink to="/admin/cinemas" active={isActive('/admin/cinemas')} icon={<MapPin size={16}/>}>Cinemas</NavLink>
                <NavLink to="/admin/shows" active={isActive('/admin/shows')} icon={<Ticket size={16}/>}>Shows</NavLink>
                <NavLink to="/admin/bookings" active={isActive('/admin/bookings')} icon={<Ticket size={16}/>}>Bookings</NavLink>
                <NavLink to="/admin/users" active={isActive('/admin/users')} icon={<User size={16}/>}>Users</NavLink>
              </>
            ) : (
              <>
                <NavLink to="/" active={isActive('/')} icon={<Home size={16}/>}>Movies</NavLink>
                <NavLink to="/my-bookings" active={isActive('/my-bookings')} icon={<Ticket size={16}/>}>My Tickets</NavLink>
              </>
            )}
          </div>

          {/* User Menu */}
          <div className="hidden md:flex items-center gap-3">
            {isAdmin && <span className="badge bg-brand/20 text-brand border border-brand/30"><ShieldCheck size={12}/> Admin</span>}
            <div className="flex items-center gap-2 bg-gray-700 px-3 py-1.5 rounded-lg">
              <div className="w-7 h-7 bg-brand/20 rounded-full flex items-center justify-center">
                <User size={14} className="text-brand" />
              </div>
              <span className="text-sm text-gray-200 font-medium">{user.name}</span>
            </div>
            <button onClick={handleLogout} className="flex items-center gap-1.5 text-gray-200 hover:text-brand transition-colors text-sm px-3 py-1.5 rounded-lg hover:bg-gray-700">
              <LogOut size={16} /> Logout
            </button>
          </div>

          {/* Mobile Toggle */}
          <button className="md:hidden text-gray-200 hover:text-white" onClick={() => setOpen(!open)}>
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {open && (
          <div className="md:hidden py-4 border-t border-gray-700 animate-fade-in space-y-1">
            {isAdmin ? (
              <>
                <MobileLink to="/admin" onClick={() => setOpen(false)}>Dashboard</MobileLink>
                <MobileLink to="/admin/movies" onClick={() => setOpen(false)}>Movies</MobileLink>
                <MobileLink to="/admin/cinemas" onClick={() => setOpen(false)}>Cinemas</MobileLink>
                <MobileLink to="/admin/shows" onClick={() => setOpen(false)}>Shows</MobileLink>
                <MobileLink to="/admin/bookings" onClick={() => setOpen(false)}>Bookings</MobileLink>
                <MobileLink to="/admin/users" onClick={() => setOpen(false)}>Users</MobileLink>
              </>
            ) : (
              <>
                <MobileLink to="/" onClick={() => setOpen(false)}>Movies</MobileLink>
                <MobileLink to="/my-bookings" onClick={() => setOpen(false)}>My Tickets</MobileLink>
              </>
            )}
            <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-red-400 hover:bg-gray-700 rounded-lg flex items-center gap-2">
              <LogOut size={16} /> Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}

const NavLink = ({ to, active, icon, children }) => (
  <Link to={to} className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${active ? 'bg-brand text-white' : 'text-gray-200 hover:text-white hover:bg-gray-700'}`}>
    {icon}{children}
  </Link>
);

const MobileLink = ({ to, onClick, children }) => (
  <Link to={to} onClick={onClick} className="block px-4 py-2 text-gray-200 hover:text-white hover:bg-gray-700 rounded-lg transition-colors">
    {children}
  </Link>
);

