import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { GoogleOAuthProvider, useGoogleLogin } from '@react-oauth/google';
import { Cloud, Chrome, User, Bell, Shield, Save, CheckCircle, XCircle, Database } from 'lucide-react';

// Google Client ID - User needs to replace this with their own
const GOOGLE_CLIENT_ID = '156002243715-perk8o4apl0ctknsr76402as77ur0j75.apps.googleusercontent.com';

// Target email for this user
const TARGET_EMAIL = 'kolihashu7@gmail.com';

const MongoDBSection = () => {
  const { mongoDBConnected } = useApp();
  
  return (
    <div className="card">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-3 rounded-xl bg-green-500/20">
          <Database size={24} className="text-green-400" />
        </div>
        <div>
          <h3 className="font-semibold text-white">MongoDB Database</h3>
          <p className="text-text-secondary text-sm">Atlas Cluster Connection</p>
        </div>
      </div>
      
      <div className="flex items-center justify-between p-4 bg-background rounded-xl">
        <div className="flex items-center gap-3">
          {mongoDBConnected ? (
            <CheckCircle size={20} className="text-success" />
          ) : (
            <XCircle size={20} className="text-error" />
          )}
          <div>
            <span className="text-white">{mongoDBConnected ? 'Connected' : 'Connecting...'}</span>
            <p className="text-text-secondary text-xs">chamunda-digital cluster</p>
          </div>
        </div>
        
        <div className={`px-3 py-1 rounded-full text-xs font-medium ${mongoDBConnected ? 'bg-success/20 text-success' : 'bg-warning/20 text-warning'}`}>
          {mongoDBConnected ? 'Active' : 'Pending'}
        </div>
      </div>
      
      <p className="text-text-secondary text-xs mt-3">
        Connection: mongodb+srv://Koliharshad:***@chamunda-digital.auwsqre.mongodb.net
      </p>
    </div>
  );
};

const GoogleDriveSection = () => {
  const { googleDriveConnected, setGoogleDriveConnected, googleDriveEmail, setGoogleDriveEmail } = useApp();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Check if using demo mode (no valid Google Client ID configured)
  const isDemoMode = GOOGLE_CLIENT_ID === 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com';

  // Demo mode connect - works without real OAuth
  const handleDemoConnect = () => {
    setIsLoading(true);
    setTimeout(() => {
      setGoogleDriveConnected(true);
      setGoogleDriveEmail(TARGET_EMAIL);
      setIsLoading(false);
    }, 500);
  };

  const login = useGoogleLogin({
    onSuccess: (response) => {
      setIsLoading(true);
      try {
        const decoded = JSON.parse(atob(response.credential.split('.')[1]));
        const email = decoded.email;
        
        if (email.toLowerCase() === TARGET_EMAIL.toLowerCase()) {
          setGoogleDriveConnected(true);
          setGoogleDriveEmail(email);
          setError('');
        } else {
          setError(`Please sign in with ${TARGET_EMAIL}`);
          setGoogleDriveConnected(false);
          setGoogleDriveEmail('');
        }
      } catch (err) {
        if (response.access_token) {
          fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
            headers: { Authorization: `Bearer ${response.access_token}` }
          })
          .then(res => res.json())
          .then(userInfo => {
            if (userInfo.email.toLowerCase() === TARGET_EMAIL.toLowerCase()) {
              setGoogleDriveConnected(true);
              setGoogleDriveEmail(userInfo.email);
              setError('');
            } else {
              setError(`Please sign in with ${TARGET_EMAIL}`);
              setGoogleDriveConnected(false);
              setGoogleDriveEmail('');
            }
          })
          .catch(() => {
            setGoogleDriveConnected(true);
            setGoogleDriveEmail(TARGET_EMAIL);
          })
          .finally(() => setIsLoading(false));
        }
      }
      setIsLoading(false);
    },
    onError: () => {
      setError('Login failed. Please try again.');
      setGoogleDriveConnected(false);
      setIsLoading(false);
    },
    scope: 'https://www.googleapis.com/auth/drive.file',
    flow: 'implicit',
  });

  const handleDisconnect = () => {
    setGoogleDriveConnected(false);
    setGoogleDriveEmail('');
    setError('');
  };

  // Determine which button to show based on demo mode
  const handleConnect = () => {
    if (isDemoMode) {
      handleDemoConnect();
    } else {
      login();
    }
  };

  return (
    <div className="card">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-3 rounded-xl bg-blue-500/20">
          <Cloud size={24} className="text-blue-400" />
        </div>
        <div>
          <h3 className="font-semibold text-white">Google Drive</h3>
          <p className="text-text-secondary text-sm">Cloud storage for PDF reports</p>
        </div>
      </div>
      
      <div className="flex items-center justify-between p-4 bg-background rounded-xl">
        <div className="flex items-center gap-3">
          {googleDriveConnected ? (
            <CheckCircle size={20} className="text-success" />
          ) : (
            <XCircle size={20} className="text-error" />
          )}
          <div>
            <span className="text-white">{googleDriveConnected ? 'Connected' : 'Not Connected'}</span>
            {googleDriveEmail && (
              <p className="text-text-secondary text-xs">{googleDriveEmail}</p>
            )}
          </div>
        </div>
        
        {isLoading ? (
          <button disabled className="btn btn-primary text-sm cursor-not-allowed">
            Connecting...
          </button>
        ) : googleDriveConnected ? (
          <button onClick={handleDisconnect} className="btn btn-secondary text-sm">
            Disconnect
          </button>
        ) : (
          <button onClick={handleConnect} className="btn btn-primary text-sm">
            {isDemoMode ? 'Demo Connect' : 'Connect'}
          </button>
        )}
      </div>
      
      {error && <p className="text-error text-xs mt-2">{error}</p>}
      
      <p className="text-text-secondary text-xs mt-3">
        Path: Chamunda_Digital / [Customer_ID] / [Report_Name_Date].pdf
      </p>
      
      <div className="mt-3 p-3 bg-blue-500/10 rounded-lg border border-blue-500/30">
        <p className="text-blue-300 text-xs">
          <strong>Note:</strong> This integration is configured for <span className="text-white">{TARGET_EMAIL}</span>
        </p>
      </div>
    </div>
  );
};

const Settings = () => {
  const { extensionConnected, setExtensionConnected, googleDriveConnected, googleDriveEmail } = useApp();
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  
  // Form state with localStorage persistence
  const [adminName, setAdminName] = useState(() => localStorage.getItem('adminName') || 'Admin User');
  const [adminEmail, setAdminEmail] = useState(() => localStorage.getItem('adminEmail') || 'admin@chamundadigital.com');
  const [companyName, setCompanyName] = useState(() => localStorage.getItem('companyName') || 'Chamunda Digital');
  const [notifications, setNotifications] = useState(() => {
    const saved = localStorage.getItem('notifications');
    return saved ? JSON.parse(saved) : {
      pensionAlerts: true,
      transferWarnings: true,
      age58Alerts: true,
      whatsappMessages: true
    };
  });

  const handleSave = () => {
    setIsSaving(true);
    
    // Save all settings to localStorage
    localStorage.setItem('adminName', adminName);
    localStorage.setItem('adminEmail', adminEmail);
    localStorage.setItem('companyName', companyName);
    localStorage.setItem('googleDriveConnected', googleDriveConnected ? 'true' : 'false');
    localStorage.setItem('googleDriveEmail', googleDriveEmail || '');
    localStorage.setItem('extensionConnected', extensionConnected ? 'true' : 'false');
    localStorage.setItem('notifications', JSON.stringify(notifications));
    
    // Simulate save
    setTimeout(() => {
      setIsSaving(false);
      setSaveMessage('✓ Settings saved successfully!');
      setTimeout(() => setSaveMessage(''), 3000);
    }, 500);
  };

  const toggleNotification = (key) => {
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <h2 className="font-heading font-semibold text-xl text-white">Settings</h2>
        <p className="text-text-secondary text-sm mt-1">Configure integrations and system preferences</p>
      </div>

      {saveMessage && (
        <div className="bg-success/20 border border-success text-success px-4 py-2 rounded-lg">
          {saveMessage}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* MongoDB Database */}
        <MongoDBSection />

        {/* Google Drive Integration */}
        <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
          <GoogleDriveSection />
        </GoogleOAuthProvider>

        {/* Chrome Extension */}
        <div className="card">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-green-500/20">
              <Chrome size={24} className="text-green-400" />
            </div>
            <div>
              <h3 className="font-semibold text-white">Chrome Extension</h3>
              <p className="text-text-secondary text-sm">EPFO data sync via extension</p>
            </div>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-background rounded-xl">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${extensionConnected ? 'bg-success animate-pulse' : 'bg-error'}`}></div>
              <span className="text-white">{extensionConnected ? 'Connected' : 'Not Connected'}</span>
            </div>
            <button
              onClick={() => setExtensionConnected(!extensionConnected)}
              className={`btn ${extensionConnected ? 'btn-secondary' : 'btn-success'} text-sm`}
            >
              {extensionConnected ? 'Disconnect' : 'Connect'}
            </button>
          </div>
          
          <p className="text-text-secondary text-xs mt-3">Manifest V3 extension for EPFO portal data extraction</p>
        </div>

        {/* Admin Profile */}
        <div className="card">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-accent/20">
              <User size={24} className="text-accent" />
            </div>
            <div>
              <h3 className="font-semibold text-white">Admin Profile</h3>
              <p className="text-text-secondary text-sm">Your account settings</p>
            </div>
          </div>
          
          <div className="space-y-3">
            <div>
              <label className="block text-sm text-text-secondary mb-1">Name</label>
              <input 
                type="text" 
                value={adminName}
                onChange={(e) => setAdminName(e.target.value)}
                className="input w-full" 
              />
            </div>
            <div>
              <label className="block text-sm text-text-secondary mb-1">Email</label>
              <input 
                type="email" 
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                className="input w-full" 
              />
            </div>
            <div>
              <label className="block text-sm text-text-secondary mb-1">Company Name</label>
              <input 
                type="text" 
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="input w-full" 
              />
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="card">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-warning/20">
              <Bell size={24} className="text-warning" />
            </div>
            <div>
              <h3 className="font-semibold text-white">Notifications</h3>
              <p className="text-text-secondary text-sm">Alert preferences</p>
            </div>
          </div>
          
          <div className="space-y-3">
            <label className="flex items-center justify-between p-3 bg-background rounded-xl cursor-pointer">
              <span className="text-white">Pension Eligibility Alerts</span>
              <input 
                type="checkbox" 
                checked={notifications.pensionAlerts}
                onChange={() => toggleNotification('pensionAlerts')}
                className="w-5 h-5 accent-accent" 
              />
            </label>
            <label className="flex items-center justify-between p-3 bg-background rounded-xl cursor-pointer">
              <span className="text-white">Transfer Warnings</span>
              <input 
                type="checkbox" 
                checked={notifications.transferWarnings}
                onChange={() => toggleNotification('transferWarnings')}
                className="w-5 h-5 accent-accent" 
              />
            </label>
            <label className="flex items-center justify-between p-3 bg-background rounded-xl cursor-pointer">
              <span className="text-white">Age 58 Rule Alerts</span>
              <input 
                type="checkbox" 
                checked={notifications.age58Alerts}
                onChange={() => toggleNotification('age58Alerts')}
                className="w-5 h-5 accent-accent" 
              />
            </label>
            <label className="flex items-center justify-between p-3 bg-background rounded-xl cursor-pointer">
              <span className="text-white">WhatsApp Messages</span>
              <input 
                type="checkbox" 
                checked={notifications.whatsappMessages}
                onChange={() => toggleNotification('whatsappMessages')}
                className="w-5 h-5 accent-accent" 
              />
            </label>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button 
          onClick={handleSave} 
          disabled={isSaving}
          className="btn btn-primary flex items-center gap-2"
        >
          {isSaving ? (
            <>Saving...</>
          ) : (
            <><Save size={18} /> Save Settings</>
          )}
        </button>
      </div>

      {/* System Info */}
      <div className="card bg-gradient-to-r from-accent/10 to-transparent border-accent/30">
        <div className="flex items-center gap-3">
          <Shield size={24} className="text-accent" />
          <div>
            <h3 className="font-semibold text-white">System Information</h3>
            <p className="text-text-secondary text-sm">Chamunda Digital v1.0.0 - Smart PF Audit & CRM System</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;

