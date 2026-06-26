import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#0c0b13]">
        <div className="relative h-16 w-16">
          <div className="absolute inset-0 rounded-full border-4 border-t-safety-500 border-white/5 animate-spin"></div>
          <div className="absolute inset-2 rounded-full border-4 border-b-rose-500 border-transparent animate-pulse"></div>
        </div>
      </div>
    );
  }

  if (!user) {
    // Redirect to login but save original location
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (adminOnly && user.role !== 'admin') {
    // Redirect standard users to dashboard
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;
