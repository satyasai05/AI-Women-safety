import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  ShieldAlert, 
  Camera, 
  MapPin, 
  MessageSquare, 
  FileText, 
  User, 
  Settings, 
  Activity 
} from 'lucide-react';

const Sidebar = () => {
  const { user } = useAuth();
  
  const userMenu = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'AI Safety Scan', path: '/detection', icon: Camera },
    { name: 'Safe Navigation', path: '/map', icon: MapPin },
    { name: 'AI SafeChat', path: '/chat', icon: MessageSquare },
    { name: 'File Incident', path: '/incidents', icon: FileText },
    { name: 'Profile & Contacts', path: '/profile', icon: User }
  ];

  const adminMenu = [
    { name: 'Admin Dashboard', path: '/admin', icon: ShieldAlert }
  ];

  return (
    <aside className="w-64 hidden lg:flex flex-col border-r border-white/5 bg-[#0c0b13] min-h-[calc(100vh-4rem)] p-4 space-y-6">
      
      {/* User Information Summary */}
      <div className="flex items-center space-x-3 p-2 rounded-xl bg-white/5 border border-white/5">
        <div className="h-10 w-10 rounded-lg bg-gradient-to-tr from-safety-500/20 to-rose-500/20 border border-safety-500/30 flex items-center justify-center text-safety-400 font-bold font-outfit">
          {user?.name ? user.name[0].toUpperCase() : 'U'}
        </div>
        <div className="flex flex-col min-w-0">
          <span className="text-sm font-semibold text-white truncate">{user?.name}</span>
          <span className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">
            {user?.role || 'User'}
          </span>
        </div>
      </div>

      {/* Main Navigation links */}
      <div className="flex-1 flex flex-col space-y-1">
        <span className="text-[10px] text-gray-500 font-bold tracking-wider uppercase px-2 mb-2">
          Safety Suite
        </span>
        
        {userMenu.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-safety-500/20 to-rose-500/5 text-safety-400 border border-safety-500/20 shadow-sm'
                  : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
              }`
            }
          >
            <item.icon className="h-4.5 w-4.5" />
            <span>{item.name}</span>
          </NavLink>
        ))}

        {user?.role === 'admin' && (
          <>
            <span className="text-[10px] text-gray-500 font-bold tracking-wider uppercase px-2 mt-6 mb-2">
              System Admin
            </span>
            {adminMenu.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-safety-500/20 to-rose-500/5 text-safety-400 border border-safety-500/20 shadow-sm'
                      : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
                  }`
                }
              >
                <item.icon className="h-4.5 w-4.5" />
                <span>{item.name}</span>
              </NavLink>
            ))}
          </>
        )}
      </div>

      {/* Footer statistics indicator */}
      <div className="p-3 rounded-xl bg-safety-500/5 border border-safety-500/10 flex items-center space-x-3">
        <Activity className="h-5 w-5 text-safety-400 animate-pulse flex-shrink-0" />
        <div className="flex flex-col min-w-0">
          <span className="text-[11px] font-semibold text-safety-300">Active Shielding</span>
          <span className="text-[9px] text-gray-400 truncate">Device location synced</span>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
