import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { LogIn, User, Lock, Eye, EyeOff, Shield, Users, LockKeyhole } from 'lucide-react';

const Login = () => {
  const { login, loginError } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [attempts, setAttempts] = useState(0);

  useEffect(() => {
    if (loginError) {
      setError(loginError);
      setAttempts(prev => prev + 1);
    }
  }, [loginError]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(username, password);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      {/* Professional Background with animated gradient */}
      <div className="fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-accent/30 to-transparent rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-success/30 to-transparent rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-radial from-primary/10 to-transparent rounded-full blur-3xl"></div>
        
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px]"></div>
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-accent via-success to-accent bg-size-200 animate-gradient p-[2px]">
            <div className="w-full h-full rounded-2xl bg-surface flex items-center justify-center">
              <span className="text-white font-bold text-2xl">CD</span>
            </div>
          </div>
          <h1 className="font-heading font-bold text-3xl text-white mt-6 tracking-tight">
            Chamunda Digital
          </h1>
          <p className="text-text-secondary mt-2 font-medium">Smart PF Audit & CRM System</p>
        </div>

        {/* Login Card */}
        <div className="card p-8 relative backdrop-blur-sm bg-surface/80">
          {/* Card Header */}
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="p-2 bg-accent/20 rounded-lg">
              <LockKeyhole size={24} className="text-accent" />
            </div>
            <h2 className="font-heading font-semibold text-xl text-white">
              Secure Login
            </h2>
          </div>

          {error && (
            <div className="bg-error/20 border border-error/50 text-error px-4 py-3 rounded-lg mb-4 text-sm flex items-center gap-2">
              <AlertTriangle size={16} />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm text-text-secondary mb-2 font-medium">Username</label>
              <div className="relative">
                <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="input w-full pl-10 bg-background/50"
                  placeholder="Enter your username"
                  required
                  autoComplete="username"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-text-secondary mb-2 font-medium">Password</label>
              <div className="relative">
                <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input w-full pl-10 pr-10 bg-background/50"
                  placeholder="Enter your password"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Security Notice */}
            <div className="flex items-center gap-2 text-xs text-text-secondary">
              <Shield size={14} className="text-success" />
              <span>Your session is secured with encryption</span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full flex items-center justify-center gap-2 py-3 text-base font-medium"
            >
              {loading ? (
                <span className="animate-spin">⟳</span>
              ) : (
                <LogIn size={20} />
              )}
              {loading ? 'Authenticating...' : 'Sign In'}
            </button>
          </form>

          {/* Security Info */}
          <div className="mt-6 pt-6 border-t border-white/10">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2 text-xs text-text-secondary">
                <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
                <span>256-bit Encryption</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-text-secondary">
                <div className="w-2 h-2 bg-accent rounded-full animate-pulse"></div>
                <span>Secure Session</span>
              </div>
            </div>
          </div>

          {/* Login Attempts Warning */}
          {attempts > 0 && attempts < 3 && (
            <div className="mt-4 p-2 bg-warning/10 border border-warning/30 rounded-lg">
              <p className="text-warning text-xs text-center">
                {attempts} failed attempt{attempts > 1 ? 's' : ''}. Account locks after 5 failed attempts.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-text-secondary text-xs">
            © 2024 Chamunda Digital. All rights reserved.
          </p>
          <p className="text-text-secondary text-xs mt-1">
            Protected by enterprise-grade security
          </p>
        </div>
      </div>
    </div>
  );
};

// Add AlertTriangle to imports if not present - fallback
const AlertTriangle = ({ size = 16, className = '' }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
    className={className}
  >
    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
    <line x1="12" y1="9" x2="12" y2="13"/>
    <line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>
);

export default Login;

