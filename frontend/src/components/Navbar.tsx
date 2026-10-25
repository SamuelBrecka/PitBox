import React from 'react';
import { Wrench, LogOut, User as UserIcon, LayoutDashboard } from 'lucide-react';
import { Link, useNavigate } from '../router/Router';
import { useAuth } from '../context/AuthContext';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="bg-pitbox-steel text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Link to={isAuthenticated ? '/garage' : '/'} className="flex items-center space-x-3 group">
            <div className="bg-white/10 p-2 rounded-lg group-hover:bg-white/20 transition">
              <Wrench className="w-6 h-6 text-pitbox-seafoam" />
            </div>
            <span className="text-xl font-bold tracking-tight">PitBox</span>
          </Link>
          <span className="text-xs bg-pitbox-glacier/30 text-pitbox-seafoam px-2 py-0.5 rounded-full border border-pitbox-glacier/40 font-mono">
            v0.1.0
          </span>
        </div>

        <nav className="flex items-center space-x-4">
          {isAuthenticated ? (
            <>
              <Link
                to="/garage"
                className="flex items-center space-x-1 text-sm font-medium text-slate-100 hover:text-white px-3 py-1.5 rounded-md hover:bg-white/10 transition"
              >
                <LayoutDashboard className="w-4 h-4 text-pitbox-seafoam" />
                <span>My Garage</span>
              </Link>
              <div className="flex items-center space-x-2 text-sm bg-white/10 px-3 py-1.5 rounded-md border border-white/15">
                <UserIcon className="w-4 h-4 text-pitbox-seafoam" />
                <span className="font-medium text-slate-100">{user?.fullName}</span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-1 text-sm font-medium text-slate-200 hover:text-white px-2.5 py-1.5 rounded-md hover:bg-white/10 transition"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="text-sm font-medium text-slate-100 hover:text-white px-3 py-1.5 rounded-md hover:bg-white/10 transition"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="text-sm font-medium bg-pitbox-seafoam text-pitbox-dark px-3.5 py-1.5 rounded-md hover:bg-white transition shadow-sm"
              >
                Create Account
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};
