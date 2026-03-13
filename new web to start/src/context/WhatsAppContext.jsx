import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const WhatsAppContext = createContext();

export const useWhatsApp = () => {
  const context = useContext(WhatsAppContext);
  if (!context) {
    throw new Error('useWhatsApp must be used within a WhatsAppProvider');
  }
  return context;
};

export const WhatsAppProvider = ({ children }) => {
  const [customers, setCustomers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [stats, setStats] = useState({
    totalCustomers: 0,
    messagesToday: 0,
    totalMessages: 0,
    messagesThisWeek: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const API_URL = '/api';

  // Fetch dashboard stats
  const fetchStats = async () => {
    try {
      const response = await axios.get(`${API_URL}/whatsapp/stats`);
      if (response.data.success) {
        setStats(response.data.stats);
      }
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  // Fetch customers
  const fetchCustomers = async (search = '') => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/customers`, {
        params: { search }
      });
      if (response.data.success) {
        setCustomers(response.data.customers);
      }
    } catch (err) {
      console.error('Error fetching customers:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Add customer
  const addCustomer = async (customer) => {
    try {
      setLoading(true);
      const response = await axios.post(`${API_URL}/customers`, customer);
      if (response.data.success) {
        await fetchCustomers();
        await fetchStats();
        return { success: true, customer: response.data.customer };
      }
    } catch (err) {
      console.error('Error adding customer:', err);
      return { success: false, error: err.response?.data?.error || err.message };
    } finally {
      setLoading(false);
    }
  };

  // Update customer
  const updateCustomer = async (id, updates) => {
    try {
      setLoading(true);
      const response = await axios.put(`${API_URL}/customers/${id}`, updates);
      if (response.data.success) {
        await fetchCustomers();
        return { success: true, customer: response.data.customer };
      }
    } catch (err) {
      console.error('Error updating customer:', err);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Delete customer
  const deleteCustomer = async (id) => {
    try {
      setLoading(true);
      const response = await axios.delete(`${API_URL}/customers/${id}`);
      if (response.data.success) {
        await fetchCustomers();
        await fetchStats();
        return { success: true };
      }
    } catch (err) {
      console.error('Error deleting customer:', err);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Import customers from CSV/Excel data
  const importCustomers = async (customerData) => {
    try {
      setLoading(true);
      const response = await axios.post(`${API_URL}/customers/import`, {
        customers: customerData
      });
      if (response.data.success) {
        await fetchCustomers();
        await fetchStats();
        return { success: true, results: response.data.results };
      }
    } catch (err) {
      console.error('Error importing customers:', err);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Send single message
  const sendMessage = async (phone, message, customerName = '') => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.post(`${API_URL}/whatsapp/send`, {
        phone,
        message,
        customerName
      });
      if (response.data.success) {
        await fetchMessages();
        await fetchStats();
        return { success: true, messageId: response.data.messageId };
      }
    } catch (err) {
      console.error('Error sending message:', err);
      const errorMsg = err.response?.data?.error || err.message;
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  // Send bulk messages
  const sendBulkMessages = async (messages) => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.post(`${API_URL}/whatsapp/bulk`, {
        messages
      });
      if (response.data.success) {
        await fetchMessages();
        await fetchStats();
        return { 
          success: true, 
          results: response.data.results,
          errors: response.data.errors
        };
      }
    } catch (err) {
      console.error('Error sending bulk messages:', err);
      const errorMsg = err.response?.data?.error || err.message;
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  // Fetch message history
  const fetchMessages = async (phone = '', page = 1) => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/whatsapp/messages`, {
        params: { phone, page }
      });
      if (response.data.success) {
        setMessages(response.data.messages);
        return response.data;
      }
    } catch (err) {
      console.error('Error fetching messages:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch templates
  const fetchTemplates = async () => {
    try {
      const response = await axios.get(`${API_URL}/whatsapp/templates`);
      if (response.data.success) {
        setTemplates(response.data.templates);
      }
    } catch (err) {
      console.error('Error fetching templates:', err);
    }
  };

  // Initialize data
  useEffect(() => {
    fetchStats();
    fetchCustomers();
    fetchMessages();
    fetchTemplates();
  }, []);

  const value = {
    customers,
    messages,
    templates,
    stats,
    loading,
    error,
    fetchStats,
    fetchCustomers,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    importCustomers,
    sendMessage,
    sendBulkMessages,
    fetchMessages,
    fetchTemplates,
    setError
  };

  return (
    <WhatsAppContext.Provider value={value}>
      {children}
    </WhatsAppContext.Provider>
  );
};

export default WhatsAppContext;
