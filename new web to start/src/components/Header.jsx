import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import {
  Search,
  Bell,
  RefreshCw,
  User,
  Menu,
  X,
  LogOut,
  Shield,
  Users
} from 'lucide-react';

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { searchQuery, setSearchQuery, googleDriveConnected, extensionConnected } = useApp();
  const { user, logout, isAdmin } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  // Get saved profile from localStorage
  const adminName = localStorage.getItem('adminName') || 'Admin User';
  const adminEmail = localStorage.getItem('adminEmail') || 'admin@chamundadigital.com';

  const getPageTitle = () => {
    const titles = {
      '/': 'Dashboard',
      '/customers': 'Customer Management',
      '/audit': 'Smart Audit',
      '/admin': 'Admin Panel',
      '/reports': 'Reports & PDF',
      '/whatsapp': 'WhatsApp CRM',
      '/settings': 'Settings'
    };
    return titles[location.pathname] || 'Chamunda Digital';
  };

  const notifications = [
    { id: 1, title: 'Pension Alert', message: 'CD-000003 eligible for Form 10D', time: '2 min ago', type: 'success' },
    { id: 2, title: 'Transfer Warning', message: 'CD-000001 has untransferred IDs', time: '1 hour ago', type: 'warning' },
    { id: 3, title: 'Age Rule Alert', message: 'CD-000003 - EPS still deducted at age 58', time: '2 hours ago', type: 'error' },
  ];

  return (
    <header className="fixed top-0 right-0 left-[260px] h-16 bg-surface/80 backdrop-blur-md border-b border-white/10 z-40 px-6 flex items-center justify-between">
      {/* Page Title */}
      <div className="flex items-center gap-4">
        <h2 className="font-heading font-semibold text-xl text-white">
          {getPageTitle()}
        </h2>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" size={18} />
          <input
            type="text"
            placeholder="Search by Name, Mobile, UAN, ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input pl-10 pr-4 py-2 w-72 bg-background"
          />
        </div>

        {/* Sync Button */}
        <button
          className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
            extensionConnected
              ? 'bg-success/20 text-success hover:bg-success/30'
              : 'bg-secondary text-text-secondary hover:bg-accent/20 hover:text-accent'
          }`}
        >
          <RefreshCw size={18} className={extensionConnected ? '' : 'animate-spin-slow'} />
          <span className="text-sm font-medium">Sync</span>
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-xl bg-secondary hover:bg-accent/20 transition-colors"
          >
            <Bell size={20} className="text-text-secondary" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-accent rounded-full"></span>
          </button>

          {showNotifications && (
            <div className="absolute right-0 top-12 w-80 bg-surface rounded-xl shadow-hover border border-white/10 overflow-hidden animate-fadeIn">
              <div className="p-4 border-b border-white/10">
                <h3 className="font-semibold text-white">Notifications</h3>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className="p-4 border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer"
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-2 h-2 mt-2 rounded-full ${
                          notif.type === 'success' ? 'bg-success' :
                          notif.type === 'warning' ? 'bg-warning' : 'bg-error'
                        }`}
                      ></div>
                      <div>
                        <p className="text-sm font-medium text-white">{notif.title}</p>
                        <p className="text-xs text-text-secondary mt-1">{notif.message}</p>
                        <p className="text-xs text-text-secondary mt-2">{notif.time}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Profile */}
        <div className="relative">
          <button
            onClick={() => setShowProfile(!showProfile)}
            className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 transition-colors"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent to-warning flex items-center justify-center">
              <User size={18} className="text-white" />
            </div>
            <div className="text-left hidden lg:block">
              <p className="text-sm font-medium text-white">{user?.name || 'User'}</p>
              <p className="text-xs text-text-secondary">{isAdmin() ? 'Admin' : 'Staff'}</p>
            </div>
          </button>

          {showProfile && (
            <div className="absolute right-0 top-14 w-64 bg-surface rounded-xl shadow-hover border border-white/10 overflow-hidden animate-fadeIn">
              <div className="p-4 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent to-success flex items-center justify-center">
                    <User size={20} className="text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-white">{user?.name || 'User'}</p>
                    <div className="flex items-center gap-1 mt-0.5">
                      {isAdmin() ? (
                        <Shield size={12} className="text-accent" />
                      ) : (
                        <Users size={12} className="text-success" />
                      )}
                      <p className="text-xs text-text-secondary">{isAdmin() ? 'Administrator' : 'Staff Member'}</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-2">
                <button 
                  onClick={() => navigate('/settings')}
                  className="w-full text-left px-4 py-2 text-sm text-text-secondary hover:bg-white/5 rounded-lg transition-colors"
                >
                  Profile Settings
                </button>
                <button 
                  onClick={() => { logout(); navigate('/login'); }}
                  className="w-full text-left px-4 py-2 text-sm text-error hover:bg-error/10 rounded-lg transition-colors flex items-center gap-2"
                >
                  <LogOut size={16} />
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;

