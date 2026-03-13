import React from 'react';
import { NavLink } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  Search,
  Settings,
  FileText,
  MessageSquare,
  Shield,
  Cloud,
  ChevronLeft,
  ChevronRight,
  History
} from 'lucide-react';

const Sidebar = () => {
  const { sidebarOpen, setSidebarOpen } = useApp();
  const { isAdmin, user } = useAuth();

  const menuItems = [
    { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/customers', icon: Users, label: 'Customers' },
    { path: '/audit', icon: Search, label: 'Smart Audit' },
    { path: '/admin', icon: Shield, label: 'Admin Panel' },
    { path: '/reports', icon: FileText, label: 'Reports' },
    { path: '/whatsapp', icon: MessageSquare, label: 'WhatsApp CRM' },
    { path: '/settings', icon: Settings, label: 'Settings' },
  ];

  // Add Login History only for admin
  const adminMenuItems = [
    { path: '/login-history', icon: History, label: 'Login History', adminOnly: true },
  ];

  const allItems = [...menuItems, ...adminMenuItems];

  return (
    <aside
      className={`fixed left-0 top-0 h-full bg-surface border-r border-white/10 transition-all duration-300 z-50 ${
        sidebarOpen ? 'w-[260px]' : 'w-[80px]'
      }`}
    >
      {/* Logo Section */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-white/10">
        {sidebarOpen && (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent to-success flex items-center justify-center">
              <span className="text-white font-bold text-lg">CD</span>
            </div>
            <div>
              <h1 className="font-heading font-bold text-white text-lg">Chamunda</h1>
              <p className="text-[10px] text-text-secondary">Smart PF Audit</p>
            </div>
          </div>
        )}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center hover:bg-accent transition-colors"
        >
          {sidebarOpen ? (
            <ChevronLeft size={18} className="text-white" />
          ) : (
            <ChevronRight size={18} className="text-white" />
          )}
        </button>
      </div>

      {/* Navigation Menu */}
      <nav className="p-3 space-y-1">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                isActive
                  ? 'bg-gradient-to-r from-accent/20 to-transparent border-l-3 border-accent text-white'
                  : 'text-text-secondary hover:bg-white/5 hover:text-white'
              }`
            }
          >
            <item.icon size={20} />
            {sidebarOpen && (
              <span className="font-medium text-sm">{item.label}</span>
            )}
          </NavLink>
        ))}

        {/* Admin-only items */}
        {isAdmin() && adminMenuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                isActive
                  ? 'bg-gradient-to-r from-accent/20 to-transparent border-l-3 border-accent text-white'
                  : 'text-text-secondary hover:bg-white/5 hover:text-white'
              }`
            }
          >
            <item.icon size={20} />
            {sidebarOpen && (
              <span className="font-medium text-sm">{item.label}</span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User Info */}
      {sidebarOpen && user && (
        <div className="px-4 py-2 border-t border-white/10">
          <div className="bg-background rounded-xl p-3">
            <p className="text-xs text-text-secondary">Logged in as</p>
            <p className="text-sm font-medium text-white">{user.name}</p>
            <span className={`inline-block mt-1 px-2 py-0.5 text-xs rounded-full ${
              user.role === 'admin' ? 'bg-accent/20 text-accent' : 'bg-success/20 text-success'
            }`}>
              {user.role === 'admin' ? 'Admin' : 'Staff'}
            </span>
          </div>
        </div>
      )}

      {/* Connection Status */}
      <div className="absolute bottom-4 left-0 right-0 px-4">
        <div className="bg-background rounded-xl p-3 space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-success animate-pulse"></div>
            {sidebarOpen && (
              <span className="text-xs text-text-secondary">System Online</span>
            )}
          </div>
          {sidebarOpen && (
            <div className="flex items-center gap-2">
              <Cloud size={14} className="text-text-secondary" />
              <span className="text-xs text-text-secondary">Google Drive Ready</span>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;

