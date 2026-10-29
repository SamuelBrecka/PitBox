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
    <header className="bg-white/85 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-30">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <Link to={isAuthenticated ? '/garage' : '/'} className="flex items-center space-x-2.5 group cursor-pointer">
            <div className="w-8 h-8 rounded-lg bg-pitbox-steel/10 flex items-center justify-center group-hover:bg-pitbox-steel/15 transition-colors duration-200">
              <Wrench className="w-4 h-4 text-pitbox-steel" />
            </div>
            <span className="text-lg font-bold tracking-tight text-slate-900">PitBox</span>
          </Link>
        </div>

        <nav className="flex items-center space-x-3">
          {isAuthenticated ? (
            <>
              <Link
                to="/garage"
                className="flex items-center space-x-1.5 text-sm font-medium text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-full hover:bg-slate-100 transition-colors duration-200 cursor-pointer"
              >
                <LayoutDashboard className="w-4 h-4 text-pitbox-steel" />
                <span>My Garage</span>
              </Link>
              <div className="hidden sm:flex items-center space-x-1.5 text-xs text-slate-600 bg-slate-100 px-3 py-1.5 rounded-full">
                <UserIcon className="w-3.5 h-3.5 text-slate-400" />
                <span className="font-medium">{user?.fullName}</span>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="flex items-center space-x-1 text-sm font-medium text-slate-500 hover:text-slate-900 px-3 py-1.5 rounded-full hover:bg-slate-100 transition-colors duration-200 cursor-pointer"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="text-sm font-medium text-slate-600 hover:text-slate-900 px-3.5 py-1.5 rounded-full hover:bg-slate-100 transition-colors duration-200 cursor-pointer"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="text-sm font-medium bg-pitbox-steel text-white px-4 py-1.5 rounded-full hover:bg-pitbox-steel/90 transition-colors duration-200 cursor-pointer"
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
