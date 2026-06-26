import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, Menu, X, LogOut, User as UserIcon, LayoutDashboard, ShieldAlert } from 'lucide-react';

const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  const navLinks = user
    ? [
        { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
        ...(user.role === 'admin'
          ? [{ name: 'Admin Control', path: '/admin', icon: ShieldAlert }]
          : []),
      ]
    : [
        { name: 'Home', path: '/' },
      ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-white/5 bg-[#0c0b13]/85 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-safety-500 to-rose-700 shadow-lg shadow-rose-500/20">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <span className="font-outfit text-xl font-bold tracking-tight text-white">
              Guard<span className="text-safety-500">Her</span>
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive(link.path)
                      ? 'bg-safety-500/10 text-safety-400 border border-safety-500/20'
                      : 'text-gray-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {Icon && <Icon className="h-4 w-4" />}
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </div>

          {/* User Auth Buttons */}
          <div className="hidden md:flex items-center space-x-3">
            {user ? (
              <div className="flex items-center space-x-4">
                <Link
                  to="/profile"
                  className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-medium border border-white/10 bg-white/5 text-gray-300 hover:text-white transition-colors ${
                    isActive('/profile') ? 'border-safety-500/30 text-safety-400 bg-safety-500/5' : ''
                  }`}
                >
                  <UserIcon className="h-3.5 w-3.5" />
                  <span>{user.name}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-rose-400 border border-rose-500/20 hover:bg-rose-500/10 hover:text-rose-300 transition-all cursor-pointer"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="glow-btn rounded-xl bg-gradient-to-r from-safety-500 to-rose-600 px-4 py-2 text-sm font-semibold text-white shadow-md hover:from-safety-600 hover:to-rose-700 transition-all"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <div className="flex md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-white/5 bg-[#0c0b13] px-2 py-3 space-y-1">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-lg text-base font-medium ${
                isActive(link.path)
                  ? 'bg-safety-500/10 text-safety-400'
                  : 'text-gray-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <span>{link.name}</span>
            </Link>
          ))}
          <div className="border-t border-white/5 pt-4 pb-2 px-4 space-y-2">
            {user ? (
              <div className="flex flex-col space-y-3">
                <Link
                  to="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center space-x-2 text-sm text-gray-300 hover:text-white"
                >
                  <UserIcon className="h-4 w-4 text-safety-400" />
                  <span>Profile Settings</span>
                </Link>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="flex items-center space-x-2 text-sm text-rose-400 hover:text-rose-300"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Log Out</span>
                </button>
              </div>
            ) : (
              <div className="flex flex-col space-y-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center px-4 py-2 text-base font-medium text-gray-300 hover:text-white"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center bg-gradient-to-r from-safety-500 to-rose-600 px-4 py-2 text-base font-medium text-white rounded-lg"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
