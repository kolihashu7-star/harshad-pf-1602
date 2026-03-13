import React, { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext();

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

// Local storage keys
const STORAGE_KEYS = {
  customers: 'chamunda_customers',
  settings: 'chamunda_settings',
  auditResults: 'chamunda_audit_results',
  whatsappMessages: 'chamunda_whatsapp_messages',
  customerCounter: 'chamunda_customer_counter'
};

// Sample customer data
const sampleCustomers = [
  {
    id: 'CD-000001',
    name: 'Rajesh Kumar',
    mobile: '9876543210',
    uan: '101234567890',
    memberId: 'MH/123456',
    fatherName: 'Suresh Kumar',
    dob: '1990-05-15',
    doj: '2015-03-01',
    doe: '2023-08-15',
    lastContributionMonth: '2023-07',
    passbookBalance: 245000,
    companyName: 'Tech Solutions Pvt Ltd',
    form19Status: 'Settled',
    form10CStatus: 'Settled',
    panLinked: true,
    bankVerified: true,
    kycComplete: true,
    serviceYears: 8.5,
    memberIds: ['MH/123456', 'MH/789012', 'DL/345678'],
    transfers: ['MH/123456', 'MH/789012'],
    pensionEligible: false,
    age: 33,
    epsDeducted: true,
    contributions: [
      { month: '2023-01', amount: 1800 },
      { month: '2023-02', amount: 1800 },
      { month: '2023-03', amount: 1800 },
      { month: '2023-04', amount: 1800 },
      { month: '2023-05', amount: 1800 },
      { month: '2023-06', amount: 1800 },
      { month: '2023-07', amount: 1800 },
    ],
    form31History: [
      { type: 'Illness', settlementDate: '2023-01-15', amount: 50000 }
    ]
  },
  {
    id: 'CD-000002',
    name: 'Priya Sharma',
    mobile: '9876543211',
    uan: '101234567891',
    memberId: 'MH/234567',
    fatherName: 'Madan Lal Sharma',
    dob: '1988-12-20',
    doj: '2018-06-01',
    doe: '',
    lastContributionMonth: '2024-01',
    passbookBalance: 180000,
    companyName: 'Digital Services Ltd',
    form19Status: 'Not Settled',
    form10CStatus: 'Pending',
    panLinked: true,
    bankVerified: true,
    kycComplete: true,
    serviceYears: 5.5,
    memberIds: ['MH/234567'],
    transfers: [],
    pensionEligible: false,
    age: 35,
    epsDeducted: true,
    contributions: [
      { month: '2023-07', amount: 1500 },
      { month: '2023-08', amount: 1500 },
      { month: '2023-09', amount: 1500 },
      { month: '2023-10', amount: 1500 },
      { month: '2023-11', amount: 1500 },
      { month: '2023-12', amount: 1500 },
      { month: '2024-01', amount: 1500 },
    ],
    form31History: []
  },
  {
    id: 'CD-000003',
    name: 'Amit Patel',
    mobile: '9876543212',
    uan: '101234567892',
    memberId: 'GJ/345678',
    fatherName: 'Bhavesh Patel',
    dob: '1966-03-10',
    doj: '2010-01-15',
    doe: '',
    lastContributionMonth: '2024-01',
    passbookBalance: 520000,
    companyName: 'Manufacturing Co',
    form19Status: 'Not Settled',
    form10CStatus: 'Not Settled',
    panLinked: true,
    bankVerified: false,
    kycComplete: true,
    serviceYears: 14,
    memberIds: ['GJ/345678', 'MH/456789'],
    transfers: ['GJ/345678'],
    pensionEligible: true,
    age: 58,
    epsDeducted: true,
    contributions: [
      { month: '2023-07', amount: 2500 },
      { month: '2023-08', amount: 2500 },
      { month: '2023-09', amount: 2500 },
      { month: '2023-10', amount: 2500 },
      { month: '2023-11', amount: 2500 },
      { month: '2023-12', amount: 2500 },
      { month: '2024-01', amount: 2500 },
    ],
    form31History: [
      { type: 'Illness', settlementDate: '2023-11-01', amount: 75000 }
    ]
  },
  {
    id: 'CD-000004',
    name: 'Sneha Iyer',
    mobile: '9876543213',
    uan: '101234567893',
    memberId: 'TN/567890',
    fatherName: 'Ramaswamy Iyer',
    dob: '1995-08-25',
    doj: '2020-09-01',
    doe: '2023-12-31',
    lastContributionMonth: '2023-11',
    passbookBalance: 95000,
    companyName: 'IT Services Corp',
    form19Status: 'Pending',
    form10CStatus: 'Pending',
    panLinked: false,
    bankVerified: true,
    kycComplete: false,
    serviceYears: 3.3,
    memberIds: ['TN/567890'],
    transfers: [],
    pensionEligible: false,
    age: 28,
    epsDeducted: true,
    contributions: [
      { month: '2023-01', amount: 1200 },
      { month: '2023-02', amount: 1200 },
      { month: '2023-03', amount: 1200 },
      { month: '2023-04', amount: 1200 },
      { month: '2023-05', amount: 1200 },
      { month: '2023-06', amount: 1200 },
      { month: '2023-07', amount: 1200 },
      { month: '2023-08', amount: 1200 },
      { month: '2023-09', amount: 1200 },
      { month: '2023-10', amount: 1200 },
      { month: '2023-11', amount: 1200 },
    ],
    form31History: []
  },
  {
    id: 'CD-000005',
    name: 'Vijay Malhotra',
    mobile: '9876543214',
    uan: '101234567894',
    memberId: 'DL/678901',
    fatherName: 'Prem Nath Malhotra',
    dob: '1975-11-12',
    doj: '2008-04-01',
    doe: '',
    lastContributionMonth: '2024-01',
    passbookBalance: 680000,
    companyName: 'Construction Ltd',
    form19Status: 'Not Settled',
    form10CStatus: 'Not Settled',
    panLinked: true,
    bankVerified: true,
    kycComplete: true,
    serviceYears: 15.8,
    memberIds: ['DL/678901', 'HR/789012', 'UP/890123'],
    transfers: ['DL/678901', 'HR/789012'],
    pensionEligible: true,
    age: 48,
    epsDeducted: false,
    contributions: [
      { month: '2023-07', amount: 3000 },
      { month: '2023-08', amount: 3000 },
      { month: '2023-09', amount: 3000 },
      { month: '2023-10', amount: 3000 },
      { month: '2023-11', amount: 3000 },
      { month: '2023-12', amount: 3000 },
      { month: '2024-01', amount: 3000 },
    ],
    form31History: [
      { type: 'General', settlementDate: '2022-06-15', amount: 100000 },
      { type: 'Illness', settlementDate: '2023-09-01', amount: 80000 }
    ]
  }
];

// Load data from localStorage
const loadFromStorage = (key, defaultValue) => {
  try {
    const stored = localStorage.getItem(key);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error(`Error loading ${key}:`, error);
  }
  return defaultValue;
};

// Save data to localStorage
const saveToStorage = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Error saving ${key}:`, error);
  }
};

export const AppProvider = ({ children }) => {
  // Load initial data from localStorage or use defaults
  const [customers, setCustomers] = useState(() => 
    loadFromStorage(STORAGE_KEYS.customers, sampleCustomers)
  );
  
  const [customerIdCounter, setCustomerIdCounter] = useState(() => {
    const stored = loadFromStorage(STORAGE_KEYS.customerCounter, 6);
    // If using stored customers, update counter based on max ID
    const storedCustomers = loadFromStorage(STORAGE_KEYS.customers, []);
    if (storedCustomers.length > 0) {
      const maxId = Math.max(...storedCustomers.map(c => parseInt(c.id.replace('CD-', '')) || 0));
      return Math.max(maxId + 1, stored);
    }
    return stored;
  });
  
  const [searchQuery, setSearchQuery] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mongoDBConnected, setMongoDBConnected] = useState(false);
  const [adminRules, setAdminRules] = useState(() => 
    loadFromStorage(STORAGE_KEYS.settings, {
      tdsLimit: 50000,
      serviceGapDays: 60,
      advanceGapDays: 60,
      pensionYears: 9.5,
      messageTemplates: {
        english: {
          welcome: "Welcome to Chamunda Digital! Your PF audit is complete. Total Balance: ₹{balance}",
          advanceEligible: "Your PF advance is eligible! Submit Form 31 for withdrawal.",
          form10D: "Congratulations! You are eligible for monthly pension. Apply for Form 10D.",
          lowBalance: "Your withdrawable balance is low. Consider waiting for more contributions.",
          kycAlert: "Please complete your Bank KYC to enable smooth withdrawals."
        },
        hindi: {
          welcome: "चमुण्डा डिजिटल में आपका स्वागत है! आपका PF ऑडिट पूरा हुआ। कुल बैलेंस: ₹{balance}",
          advanceEligible: "आपका PF एडवांस पात्र है! निकासी के लिए Form 31 जमा करें।",
          form10D: "बधाई हो! आप मासिक पेंशन के लिए पात्र हैं। Form 10D के लिए आवेदन करें।",
          lowBalance: "आपकी निकासी योग्य राशि कम है। अधिक योगदान की प्रतीक्षा करें।",
          kycAlert: "सुचारू निकासी के लिए कृपया अपना बैंक KYC पूरा करें।"
        }
      }
    })
  );
  
  const [auditResults, setAuditResults] = useState(() => 
    loadFromStorage(STORAGE_KEYS.auditResults, [])
  );
  const [whatsappMessages, setWhatsappMessages] = useState(() => 
    loadFromStorage(STORAGE_KEYS.whatsappMessages, [])
  );
  const [googleDriveConnected, setGoogleDriveConnected] = useState(false);
  const [googleDriveEmail, setGoogleDriveEmail] = useState('');
  const [extensionConnected, setExtensionConnected] = useState(false);

  // Auto-save customers when they change
  useEffect(() => {
    saveToStorage(STORAGE_KEYS.customers, customers);
    // Also save counter
    const maxId = customers.length > 0 
      ? Math.max(...customers.map(c => parseInt(c.id.replace('CD-', '')) || 0))
      : 0;
    setCustomerIdCounter(maxId + 1);
    saveToStorage(STORAGE_KEYS.customerCounter, maxId + 1);
  }, [customers]);

  // Auto-save settings
  useEffect(() => {
    saveToStorage(STORAGE_KEYS.settings, adminRules);
  }, [adminRules]);

  // Auto-save audit results
  useEffect(() => {
    saveToStorage(STORAGE_KEYS.auditResults, auditResults);
  }, [auditResults]);

  // Auto-save WhatsApp messages
  useEffect(() => {
    saveToStorage(STORAGE_KEYS.whatsappMessages, whatsappMessages);
  }, [whatsappMessages]);

  // Generate new customer ID
  const generateCustomerId = () => {
    const id = `CD-${String(customerIdCounter).padStart(6, '0')}`;
    setCustomerIdCounter(prev => {
      const newValue = prev + 1;
      saveToStorage(STORAGE_KEYS.customerCounter, newValue);
      return newValue;
    });
    return id;
  };

  // Add new customer
  const addCustomer = (customer) => {
    const newCustomer = {
      ...customer,
      id: generateCustomerId()
    };
    
    setCustomers(prev => {
      const updated = [...prev, newCustomer];
      saveToStorage(STORAGE_KEYS.customers, updated);
      return updated;
    });
    
    return newCustomer;
  };

  // Update customer
  const updateCustomer = (id, updates) => {
    setCustomers(prev => {
      const updated = prev.map(c => c.id === id ? { ...c, ...updates } : c);
      saveToStorage(STORAGE_KEYS.customers, updated);
      return updated;
    });
  };

  // Delete customer
  const deleteCustomer = (id) => {
    setCustomers(prev => {
      const updated = prev.filter(c => c.id !== id);
      saveToStorage(STORAGE_KEYS.customers, updated);
      return updated;
    });
  };

  // Search customers
  const searchCustomers = (query) => {
    const lowerQuery = query.toLowerCase();
    return customers.filter(c => 
      c.name.toLowerCase().includes(lowerQuery) ||
      c.mobile.includes(query) ||
      c.uan.includes(query) ||
      c.id.toLowerCase().includes(lowerQuery)
    );
  };

  // Update admin rules
  const updateAdminRules = (rules) => {
    setAdminRules(prev => {
      const updated = { ...prev, ...rules };
      saveToStorage(STORAGE_KEYS.settings, updated);
      return updated;
    });
  };

  // Add audit result
  const addAuditResult = (result) => {
    const newResult = { ...result, timestamp: new Date().toISOString() };
    setAuditResults(prev => {
      const updated = [...prev, newResult];
      saveToStorage(STORAGE_KEYS.auditResults, updated);
      return updated;
    });
  };

  // Add WhatsApp message
  const addWhatsappMessage = (message) => {
    const newMessage = { ...message, timestamp: new Date().toISOString() };
    setWhatsappMessages(prev => {
      const updated = [...prev, newMessage];
      saveToStorage(STORAGE_KEYS.whatsappMessages, updated);
      return updated;
    });
  };

  const value = {
    customers,
    setCustomers,
    searchQuery,
    setSearchQuery,
    sidebarOpen,
    setSidebarOpen,
    mongoDBConnected,
    adminRules,
    setAdminRules,
    auditResults,
    setAuditResults,
    whatsappMessages,
    setWhatsappMessages,
    googleDriveConnected,
    setGoogleDriveConnected,
    googleDriveEmail,
    setGoogleDriveEmail,
    extensionConnected,
    setExtensionConnected,
    generateCustomerId,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    searchCustomers,
    updateAdminRules,
    addAuditResult,
    addWhatsappMessage
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

