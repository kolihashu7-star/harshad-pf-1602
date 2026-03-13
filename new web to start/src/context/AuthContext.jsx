import React, { createContext, useContext, useState, useEffect } from 'react';
import { Eye, EyeOff, LogIn, Shield, User, Clock, AlertTriangle } from 'lucide-react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Simple hash function for password encoding (not secure for production, but adds obfuscation)
const hashPassword = (password) => {
  // Using base64 encoding with salt for basic obfuscation
  const salt = 'chamunda_secure_';
  return btoa(salt + password + salt);
};

// User credentials with hashed passwords
const USERS = {
  admin: {
    username: 'admin',
    passwordHash: hashPassword('poonam@1995'),
    role: 'admin',
    name: 'Admin User',
    permissions: ['read', 'write', 'delete', 'manage_users', 'settings']
  },
  staff: {
    username: 'harshad',
    passwordHash: hashPassword('Harshad@1602'),
    role: 'staff',
    name: 'Harshad (Staff)',
    permissions: ['read', 'write']
  }
};

// Login history storage
const getLoginHistory = () => {
  const history = localStorage.getItem('chamunda_login_history');
  return history ? JSON.parse(history) : [];
};

const saveLoginHistory = (entry) => {
  const history = getLoginHistory();
  history.unshift(entry); // Add to beginning
  // Keep only last 100 entries
  const trimmed = history.slice(0, 100);
  localStorage.setItem('chamunda_login_history', JSON.stringify(trimmed));
};

// Failed login attempts tracking
const getFailedAttempts = () => {
  const attempts = localStorage.getItem('chamunda_failed_attempts');
  return attempts ? JSON.parse(attempts) : {};
};

const recordFailedAttempt = (username) => {
  const attempts = getFailedAttempts();
  const now = Date.now();
  
  if (!attempts[username]) {
    attempts[username] = { count: 0, lockUntil: null, attempts: [] };
  }
  
  attempts[username].count += 1;
  attempts[username].attempts.push(now);
  
  // Keep only last 5 attempts
  attempts[username].attempts = attempts[username].attempts.slice(-5);
  
  // Lock after 5 failed attempts for 15 minutes
  if (attempts[username].count >= 5) {
    attempts[username].lockUntil = now + (15 * 60 * 1000); // 15 minutes
  }
  
  localStorage.setItem('chamunda_failed_attempts', JSON.stringify(attempts));
};

const clearFailedAttempts = (username) => {
  const attempts = getFailedAttempts();
  delete attempts[username];
  localStorage.setItem('chamunda_failed_attempts', JSON.stringify(attempts));
};

const isAccountLocked = (username) => {
  const attempts = getFailedAttempts();
  if (attempts[username] && attempts[username].lockUntil) {
    const now = Date.now();
    if (attempts[username].lockUntil > now) {
      return true;
    } else {
      // Lock expired, reset
      clearFailedAttempts(username);
      return false;
    }
  }
  return false;
};

const getRemainingLockTime = (username) => {
  const attempts = getFailedAttempts();
  if (attempts[username] && attempts[username].lockUntil) {
    const remaining = attempts[username].lockUntil - Date.now();
    if (remaining > 0) {
      return Math.ceil(remaining / 60000); // minutes
    }
  }
  return 0;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loginHistory, setLoginHistory] = useState([]);
  const [loginError, setLoginError] = useState(null);

  useEffect(() => {
    // Check for stored session
    const storedUser = localStorage.getItem('chamunda_user');
    const storedToken = localStorage.getItem('chamunda_token');
    
    if (storedUser && storedToken) {
      try {
        // Verify token is not expired
        const userData = JSON.parse(storedUser);
        const tokenData = JSON.parse(atob(storedToken));
        
        if (tokenData.expiresAt > Date.now()) {
          setUser(userData);
        } else {
          // Token expired, clear session
          localStorage.removeItem('chamunda_user');
          localStorage.removeItem('chamunda_token');
        }
      } catch (e) {
        localStorage.removeItem('chamunda_user');
        localStorage.removeItem('chamunda_token');
      }
    }
    
    // Load login history
    setLoginHistory(getLoginHistory());
    setLoading(false);
  }, []);

  const generateToken = (userData) => {
    const tokenData = {
      userId: userData.username,
      role: userData.role,
      createdAt: Date.now(),
      expiresAt: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
    };
    return btoa(JSON.stringify(tokenData));
  };

  const login = (username, password) => {
    return new Promise((resolve, reject) => {
      setLoginError(null);
      
      // Check if account is locked
      if (isAccountLocked(username)) {
        const remaining = getRemainingLockTime(username);
        recordFailedAttempt(username);
        reject(new Error(`Account locked. Try again in ${remaining} minutes.`));
        return;
      }

      // Find user
      const userKey = Object.keys(USERS).find(key => 
        USERS[key].username.toLowerCase() === username.toLowerCase()
      );
      
      if (!userKey) {
        recordFailedAttempt(username);
        setLoginError('Invalid username or password');
        reject(new Error('Invalid username or password'));
        return;
      }

      const userRecord = USERS[userKey];
      
      // Verify password
      if (username.toLowerCase() === userRecord.username.toLowerCase() && 
          hashPassword(password) === userRecord.passwordHash) {
        
        // Clear failed attempts
        clearFailedAttempts(username);
        
        // Generate session token
        const token = generateToken(userRecord);
        
        const userData = {
          username: userRecord.username,
          role: userRecord.role,
          name: userRecord.name,
          permissions: userRecord.permissions,
          loginTime: new Date().toISOString(),
          lastActivity: Date.now()
        };
        
        // Save session
        setUser(userData);
        localStorage.setItem('chamunda_user', JSON.stringify(userData));
        localStorage.setItem('chamunda_token', token);
        
        // Record successful login
        const loginEntry = {
          username: userRecord.username,
          role: userRecord.role,
          name: userRecord.name,
          loginTime: new Date().toISOString(),
          status: 'success',
          ipAddress: 'local'
        };
        saveLoginHistory(loginEntry);
        setLoginHistory(prev => [loginEntry, ...prev].slice(0, 100));
        
        resolve(userData);
      } else {
        recordFailedAttempt(username);
        setLoginError('Invalid username or password');
        
        // Record failed login attempt
        const failedEntry = {
          username: username,
          role: 'unknown',
          name: 'Unknown',
          loginTime: new Date().toISOString(),
          status: 'failed',
          ipAddress: 'local'
        };
        saveLoginHistory(failedEntry);
        
        reject(new Error('Invalid username or password'));
      }
    });
  };

  const logout = () => {
    // Record logout
    if (user) {
      const logoutEntry = {
        username: user.username,
        role: user.role,
        name: user.name,
        loginTime: new Date().toISOString(),
        status: 'logout',
        ipAddress: 'local'
      };
      saveLoginHistory(logoutEntry);
      setLoginHistory(prev => [logoutEntry, ...prev].slice(0, 100));
    }
    
    setUser(null);
    localStorage.removeItem('chamunda_user');
    localStorage.removeItem('chamunda_token');
  };

  const refreshActivity = () => {
    if (user) {
      setUser(prev => ({
        ...prev,
        lastActivity: Date.now()
      }));
    }
  };

  // Check session timeout (30 minutes of inactivity)
  useEffect(() => {
    if (!user) return;

    const checkActivity = setInterval(() => {
      const inactivityTime = Date.now() - (user.lastActivity || 0);
      if (inactivityTime > 30 * 60 * 1000) { // 30 minutes
        logout();
      }
    }, 60000); // Check every minute

    return () => clearInterval(checkActivity);
  }, [user]);

  const isAdmin = () => user?.role === 'admin';
  const isStaff = () => user?.role === 'staff';
  const canDelete = () => user?.role === 'admin';
  const canAdd = () => user?.role === 'admin' || user?.role === 'staff';
  const hasPermission = (permission) => user?.permissions?.includes(permission);

  const value = {
    user,
    loading,
    loginHistory,
    loginError,
    login,
    logout,
    refreshActivity,
    isAdmin,
    isStaff,
    canDelete,
    canAdd,
    hasPermission,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

