// MongoDB Connection Utility
// Uses localStorage as fallback when server is unavailable

const API_BASE_URL = '/api';

// Sample customer data for initial load
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
  }
];

class MongoDBClient {
  constructor() {
    this.isConnected = false;
    this.useServer = false;
    if (typeof global !== 'undefined' && !global.customerData) {
      global.customerData = [];
    }
  }

  async connect() {
    try {
      // Try to connect to server first
      const response = await fetch(`${API_BASE_URL}/health`, { 
        method: 'GET',
        signal: AbortSignal.timeout(3000) 
      });
      if (response.ok) {
        this.isConnected = true;
        this.useServer = true;
        console.log('MongoDB: Connected to MongoDB Atlas via server');
        return true;
      }
    } catch (error) {
      console.log('MongoDB: Server not available, using localStorage fallback');
    }
    
    // Fallback to localStorage
    console.log('MongoDB: Using localStorage for data persistence');
    const hasData = this.loadFromStorage();
    if (!hasData) {
      global.customerData = [...sampleCustomers];
      this.saveToStorage();
      console.log('MongoDB: Initialized with sample data');
    }
    this.isConnected = true;
    return true;
  }

  loadFromStorage() {
    const storedCustomers = localStorage.getItem('mongodb_customers');
    if (storedCustomers) {
      try {
        global.customerData = JSON.parse(storedCustomers);
        console.log('MongoDB: Loaded', global.customerData.length, 'customers from localStorage');
        return true;
      } catch (e) {
        console.error('Error parsing stored customers:', e);
      }
    }
    return false;
  }

  saveToStorage() {
    if (global.customerData) {
      localStorage.setItem('mongodb_customers', JSON.stringify(global.customerData));
    }
  }

  // Customer operations
  async getCustomers() {
    if (this.useServer) {
      try {
        const response = await fetch(`${API_BASE_URL}/customers`);
        if (!response.ok) throw new Error('Failed to fetch customers');
        return await response.json();
      } catch (error) {
        console.error('Error fetching customers from server:', error);
      }
    }
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(global.customerData || []);
      }, 50);
    });
  }

  async addCustomer(customer) {
    if (this.useServer) {
      try {
        const response = await fetch(`${API_BASE_URL}/customers`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(customer)
        });
        if (!response.ok) throw new Error('Failed to add customer');
        return await response.json();
      } catch (error) {
        console.error('Error adding customer to server:', error);
      }
    }
    return new Promise((resolve) => {
      setTimeout(() => {
        if (!global.customerData) global.customerData = [];
        global.customerData.push(customer);
        this.saveToStorage();
        resolve(customer);
      }, 50);
    });
  }

  async updateCustomer(id, updates) {
    if (this.useServer) {
      try {
        const response = await fetch(`${API_BASE_URL}/customers/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updates)
        });
        if (!response.ok) throw new Error('Failed to update customer');
        return await response.json();
      } catch (error) {
        console.error('Error updating customer on server:', error);
      }
    }
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (!global.customerData) {
          reject(new Error('No data found'));
          return;
        }
        const index = global.customerData.findIndex(c => c.id === id);
        if (index === -1) {
          reject(new Error('Customer not found'));
          return;
        }
        global.customerData[index] = { ...global.customerData[index], ...updates };
        this.saveToStorage();
        resolve(global.customerData[index]);
      }, 50);
    });
  }

  async deleteCustomer(id) {
    if (this.useServer) {
      try {
        const response = await fetch(`${API_BASE_URL}/customers/${id}`, {
          method: 'DELETE'
        });
        if (!response.ok) throw new Error('Failed to delete customer');
        return true;
      } catch (error) {
        console.error('Error deleting customer from server:', error);
      }
    }
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (!global.customerData) {
          reject(new Error('No data found'));
          return;
        }
        const index = global.customerData.findIndex(c => c.id === id);
        if (index === -1) {
          reject(new Error('Customer not found'));
          return;
        }
        global.customerData.splice(index, 1);
        this.saveToStorage();
        resolve(true);
      }, 50);
    });
  }

  async getSettings() {
    if (this.useServer) {
      try {
        const response = await fetch(`${API_BASE_URL}/settings`);
        if (!response.ok) throw new Error('Failed to fetch settings');
        return await response.json();
      } catch (error) {
        console.error('Error fetching settings from server:', error);
      }
    }
    return new Promise((resolve) => {
      setTimeout(() => {
        const settings = localStorage.getItem('mongodb_settings');
        resolve(settings ? JSON.parse(settings) : null);
      }, 50);
    });
  }

  async saveSettings(settings) {
    if (this.useServer) {
      try {
        const response = await fetch(`${API_BASE_URL}/settings`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(settings)
        });
        if (!response.ok) throw new Error('Failed to save settings');
        return true;
      } catch (error) {
        console.error('Error saving settings to server:', error);
      }
    }
    return new Promise((resolve) => {
      setTimeout(() => {
        localStorage.setItem('mongodb_settings', JSON.stringify(settings));
        resolve(true);
      }, 50);
    });
  }

  async getAuditResults() {
    if (this.useServer) {
      try {
        const response = await fetch(`${API_BASE_URL}/audit-results`);
        if (!response.ok) throw new Error('Failed to fetch audit results');
        return await response.json();
      } catch (error) {
        console.error('Error fetching audit results from server:', error);
      }
    }
    return new Promise((resolve) => {
      setTimeout(() => {
        const results = localStorage.getItem('mongodb_audit_results');
        resolve(results ? JSON.parse(results) : []);
      }, 50);
    });
  }

  async saveAuditResult(result) {
    if (this.useServer) {
      try {
        const response = await fetch(`${API_BASE_URL}/audit-results`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(result)
        });
        if (!response.ok) throw new Error('Failed to save audit result');
        return await response.json();
      } catch (error) {
        console.error('Error saving audit result to server:', error);
      }
    }
    return new Promise((resolve) => {
      setTimeout(() => {
        const results = localStorage.getItem('mongodb_audit_results');
        const auditResults = results ? JSON.parse(results) : [];
        auditResults.push({ ...result, timestamp: new Date().toISOString() });
        localStorage.setItem('mongodb_audit_results', JSON.stringify(auditResults));
        resolve(result);
      }, 50);
    });
  }

  disconnect() {
    this.isConnected = false;
    console.log('MongoDB: Disconnected');
  }
}

// Export singleton instance
const mongoDB = new MongoDBClient();
export default mongoDB;

