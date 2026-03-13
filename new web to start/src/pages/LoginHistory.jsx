import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Clock, User, Shield, CheckCircle, XCircle, LogOut, Search, Filter } from 'lucide-react';

const LoginHistory = () => {
  const { isAdmin, user } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      // Load from localStorage
      const stored = localStorage.getItem('chamunda_login_history');
      if (stored) {
        setHistory(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading history:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success':
        return <CheckCircle size={16} className="text-success" />;
      case 'failed':
        return <XCircle size={16} className="text-error" />;
      case 'logout':
        return <LogOut size={16} className="text-warning" />;
      default:
        return <Clock size={16} className="text-text-secondary" />;
    }
  };

  const getRoleBadge = (role) => {
    if (role === 'admin') {
      return <span className="px-2 py-1 bg-accent/20 text-accent text-xs rounded-full">Admin</span>;
    }
    if (role === 'staff') {
      return <span className="px-2 py-1 bg-success/20 text-success text-xs rounded-full">Staff</span>;
    }
    if (role === 'unknown') {
      return <span className="px-2 py-1 bg-error/20 text-error text-xs rounded-full">Failed</span>;
    }
    return null;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const filteredHistory = history.filter(entry => {
    if (filter !== 'all' && entry.status !== filter) return false;
    if (searchTerm && !entry.username?.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !entry.name?.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    return true;
  });

  const stats = {
    total: history.length,
    success: history.filter(h => h.status === 'success').length,
    failed: history.filter(h => h.status === 'failed').length,
    logouts: history.filter(h => h.status === 'logout').length
  };

  if (!isAdmin()) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Shield size={48} className="text-error mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">Access Denied</h2>
          <p className="text-text-secondary">Only administrators can view login history.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Login History</h1>
          <p className="text-text-secondary mt-1">Track all login activities and security events</p>
        </div>
        <div className="text-sm text-text-secondary">
          Logged in as: <span className="text-accent">{user?.name}</span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/20 rounded-lg">
              <Clock size={20} className="text-primary" />
            </div>
            <div>
              <p className="text-text-secondary text-sm">Total Events</p>
              <p className="text-2xl font-bold text-white">{stats.total}</p>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-success/20 rounded-lg">
              <CheckCircle size={20} className="text-success" />
            </div>
            <div>
              <p className="text-text-secondary text-sm">Successful</p>
              <p className="text-2xl font-bold text-success">{stats.success}</p>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-error/20 rounded-lg">
              <XCircle size={20} className="text-error" />
            </div>
            <div>
              <p className="text-text-secondary text-sm">Failed</p>
              <p className="text-2xl font-bold text-error">{stats.failed}</p>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-warning/20 rounded-lg">
              <LogOut size={20} className="text-warning" />
            </div>
            <div>
              <p className="text-text-secondary text-sm">Logouts</p>
              <p className="text-2xl font-bold text-warning">{stats.logouts}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
            <input
              type="text"
              placeholder="Search by username or name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input w-full pl-10"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={18} className="text-text-secondary" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="input py-2"
            >
              <option value="all">All Events</option>
              <option value="success">Successful Logins</option>
              <option value="failed">Failed Attempts</option>
              <option value="logout">Logouts</option>
            </select>
          </div>
        </div>
      </div>

      {/* History Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left p-4 text-text-secondary font-medium">Status</th>
                <th className="text-left p-4 text-text-secondary font-medium">User</th>
                <th className="text-left p-4 text-text-secondary font-medium">Name</th>
                <th className="text-left p-4 text-text-secondary font-medium">Role</th>
                <th className="text-left p-4 text-text-secondary font-medium">Date & Time</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-text-secondary">
                    Loading...
                  </td>
                </tr>
              ) : filteredHistory.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-text-secondary">
                    No login history found
                  </td>
                </tr>
              ) : (
                filteredHistory.map((entry, index) => (
                  <tr key={index} className="border-b border-white/5 hover:bg-white/5">
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(entry.status)}
                        <span className="text-sm capitalize text-white">{entry.status}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <User size={16} className="text-text-secondary" />
                        <span className="text-white">{entry.username || 'Unknown'}</span>
                      </div>
                    </td>
                    <td className="p-4 text-white">{entry.name || '-'}</td>
                    <td className="p-4">{getRoleBadge(entry.role)}</td>
                    <td className="p-4 text-text-secondary text-sm">
                      {formatDate(entry.loginTime || entry.timestamp)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default LoginHistory;

