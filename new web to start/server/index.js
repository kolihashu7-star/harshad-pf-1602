import express from 'express';
import cors from 'cors';
import { MongoClient, ObjectId } from 'mongodb';
import dotenv from 'dotenv';
import axios from 'axios';

// Load environment variables
dotenv.config();

import webhookRoutes from './routes/webhook.js';

const app = express();
const PORT = process.env.PORT || 3002;

// MongoDB Connection - using standard mongodb protocol
const MONGO_URI = process.env.MONGO_URI || 'mongodb://Koliharshad:Harshad%401602@chamunda-digital.auwsqre.mongodb.net:27017/?appName=chamunda-digital&retryWrites=true&w=majority';
const DB_NAME = 'chamunda-digital';

let db;
let customersCollection;
let messagesCollection;
let settingsCollection;
let auditResultsCollection;

// WhatsApp API Configuration
const WHATSAPP_CONFIG = {
  phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID || '1009369798926449',
  accessToken: process.env.WHATSAPP_ACCESS_TOKEN || 'EAAbiMMLsZBDIBQ6oKoNnvf9hUZBEXpZA4xZBPntiQXCGJc0BZByD6ZCUeC7fpH9wQrPSruVLScXudS9fn9chghiYVNrWtS6xfqwA5oGoOIE3j0879At0KiPZBzLou7o7rHOjwzvJZAo5ZCLMbKAA4SP1yyY00SYUfMx6yfZCS4hGbBym1XP3oyu2sshElZA5vMKIwZDZD',
  apiVersion: 'v19.0'
};

const WHATSAPP_API_URL = `https://graph.facebook.com/${WHATSAPP_CONFIG.apiVersion}/${WHATSAPP_CONFIG.phoneNumberId}/messages`;

// Auto-reply configurations
const AUTO_REPLIES = {
  'hi': 'Hello 👋 Welcome to Chamunda Digital! How can we help you today?',
  'hello': 'Hello 👋 Welcome to Chamunda Digital! How can we help you today?',
  'services': 'We provide the following services:\n• PF (Provident Fund)\n• ESIC\n• Payroll Management\n• Tax Consulting\n\nReply with any specific service for more details!',
  'pf': 'For PF (Provident Fund) services:\n• PF Registration\n• PF Returns Filing\n• PF Withdrawal\n• Transfer Claims\n\nContact our team for assistance!',
  'esic': 'For ESIC (Employees\' State Insurance) services:\n• ESIC Registration\n• Monthly Returns\n• Medical Benefits\n• Claims Assistance\n\nWe are here to help!',
  'payroll': 'Our Payroll Management services include:\n• Salary Processing\n• Statutory Compliance\n• Payroll Reports\n• Employee Self-Service Portal\n\nContact us for a customized solution!',
  'contact': '📞 Contact Us:\nPhone: +91 9876543210\nEmail: info@chamundadigital.com\nAddress: Mumbai, Maharashtra',
  'help': 'You can ask us about:\n• Services we offer\n• Contact information\n• PF, ESIC, Payroll\n\nOr simply type "hi" to start fresh! 😊',
  'thanks': 'You are welcome! 😊 Happy to help!',
  'thank you': 'You are welcome! 😊 Happy to help!'
};

async function connectToMongoDB() {
  try {
    const client = new MongoClient(MONGO_URI);
    await client.connect();
    db = client.db(DB_NAME);
    customersCollection = db.collection('customers');
    messagesCollection = db.collection('messages');
    settingsCollection = db.collection('settings');
    auditResultsCollection = db.collection('auditResults');
    
    console.log('MongoDB connected successfully!');
    
    // Create indexes
    await customersCollection.createIndex({ phone: 1 });
    await customersCollection.createIndex({ uan: 1 });
    await customersCollection.createIndex({ name: 'text' });
    await messagesCollection.createIndex({ customerPhone: 1 });
    await messagesCollection.createIndex({ timestamp: -1 });
    
    return client;
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    throw error;
  }
}

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));

app.use('/api/whatsapp', webhookRoutes);

// Sample customer data for initial load
const sampleCustomers = [
  {
    id: 'CD-000001',
    name: 'Rajesh Kumar',
    mobile: '919876543210',
    phone: '919876543210',
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
    mobile: '919876543211',
    phone: '919876543211',
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

// Initialize database with sample data if empty
async function initializeData() {
  try {
    const count = await customersCollection.countDocuments();
    if (count === 0) {
      await customersCollection.insertMany(sampleCustomers);
      console.log('Sample customer data initialized');
    }
  } catch (error) {
    console.error('Error initializing data:', error);
  }
}

// ==================== WHATSAPP ROUTES ====================

// Send single WhatsApp message
app.post('/api/whatsapp/send', async (req, res) => {
  try {
    const { phone, message, customerName } = req.body;

    if (!phone || !message) {
      return res.status(400).json({ 
        success: false, 
        error: 'Phone number and message are required' 
      });
    }

    const formattedPhone = phone.replace(/^\+/, '');

    const payload = {
      messaging_product: 'whatsapp',
      to: formattedPhone,
      type: 'text',
      text: { body: message }
    };

    const response = await axios.post(WHATSAPP_API_URL, payload, {
      headers: {
        'Authorization': `Bearer ${WHATSAPP_CONFIG.accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    // Save message to database
    const newMessage = {
      customerPhone: formattedPhone,
      customerName: customerName || '',
      message: message,
      type: 'sent',
      status: 'sent',
      whatsappMessageId: response.data.messages?.[0]?.id || '',
      timestamp: new Date()
    };
    await messagesCollection.insertOne(newMessage);

    res.json({
      success: true,
      message: 'Message sent successfully',
      messageId: response.data.messages?.[0]?.id
    });

  } catch (error) {
    console.error('Send Message Error:', error.response?.data || error.message);
    
    // Save failed message
    try {
      const { phone, message, customerName } = req.body;
      const formattedPhone = phone?.replace(/^\+/, '') || '';
      
      await messagesCollection.insertOne({
        customerPhone: formattedPhone,
        customerName: customerName || '',
        message: message || '',
        type: 'sent',
        status: 'failed',
        error: error.response?.data?.error?.message || error.message,
        timestamp: new Date()
      });
    } catch (e) {
      console.error('Error saving failed message:', e);
    }

    res.status(500).json({
      success: false,
      error: error.response?.data?.error?.message || 'Failed to send message'
    });
  }
});

// Send bulk WhatsApp messages
app.post('/api/whatsapp/bulk', async (req, res) => {
  try {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Messages array is required'
      });
    }

    const results = [];
    const errors = [];

    for (const msg of messages) {
      try {
        const { phone, message, customerName } = msg;
        const formattedPhone = phone.replace(/^\+/, '');

        const payload = {
          messaging_product: 'whatsapp',
          to: formattedPhone,
          type: 'text',
          text: { body: message }
        };

        const response = await axios.post(WHATSAPP_API_URL, payload, {
          headers: {
            'Authorization': `Bearer ${WHATSAPP_CONFIG.accessToken}`,
            'Content-Type': 'application/json'
          }
        });

        await messagesCollection.insertOne({
          customerPhone: formattedPhone,
          customerName: customerName || '',
          message: message,
          type: 'bulk',
          status: 'sent',
          whatsappMessageId: response.data.messages?.[0]?.id || '',
          timestamp: new Date()
        });

        results.push({
          phone: formattedPhone,
          success: true,
          messageId: response.data.messages?.[0]?.id
        });

        await new Promise(resolve => setTimeout(resolve, 500));

      } catch (error) {
        errors.push({
          phone: msg.phone,
          error: error.message
        });

        await messagesCollection.insertOne({
          customerPhone: msg.phone?.replace(/^\+/, ''),
          customerName: msg.customerName || '',
          message: msg.message,
          type: 'bulk',
          status: 'failed',
          error: error.message,
          timestamp: new Date()
        });
      }
    }

    res.json({
      success: true,
      message: `Sent ${results.length} messages, ${errors.length} failed`,
      results,
      errors
    });

  } catch (error) {
    console.error('Bulk Send Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to send bulk messages'
    });
  }
});





// Process incoming message
async function processIncomingMessage(whatsappMessage) {
  try {
    const phone = whatsappMessage.from;
    const messageText = whatsappMessage.text?.body || '';
    const messageId = whatsappMessage.id;

    console.log(`Received message from ${phone}: ${messageText}`);

    // Save received message
    await messagesCollection.insertOne({
      customerPhone: phone,
      customerName: '',
      message: messageText,
      type: 'received',
      status: 'delivered',
      whatsappMessageId: messageId,
      timestamp: new Date()
    });

    // Check for auto-reply
    const lowerMessage = messageText.toLowerCase().trim();
    let replyText = AUTO_REPLIES[lowerMessage];

    if (!replyText) {
      if (lowerMessage.includes('pf') || lowerMessage.includes('provident')) {
        replyText = AUTO_REPLIES['pf'];
      } else if (lowerMessage.includes('esic')) {
        replyText = AUTO_REPLIES['esic'];
      } else if (lowerMessage.includes('payroll')) {
        replyText = AUTO_REPLIES['payroll'];
      } else if (lowerMessage.includes('service')) {
        replyText = AUTO_REPLIES['services'];
      }
    }

    if (replyText) {
      await sendAutoReply(phone, replyText);
    }

    // Create customer if not exists
    const existingCustomer = await customersCollection.findOne({ phone });
    if (!existingCustomer) {
      await customersCollection.insertOne({
        name: `Customer ${phone.slice(-4)}`,
        phone: phone,
        mobile: phone,
        email: '',
        company: '',
        notes: '',
        tags: [],
        createdAt: new Date()
      });
    }

  } catch (error) {
    console.error('Error processing incoming message:', error);
  }
}

// Send auto-reply
async function sendAutoReply(phone, message) {
  try {
    const payload = {
      messaging_product: 'whatsapp',
      to: phone,
      type: 'text',
      text: { body: message }
    };

    const response = await axios.post(WHATSAPP_API_URL, payload, {
      headers: {
        'Authorization': `Bearer ${WHATSAPP_CONFIG.accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    await messagesCollection.insertOne({
      customerPhone: phone,
      customerName: '',
      message: message,
      type: 'sent',
      status: 'sent',
      whatsappMessageId: response.data.messages?.[0]?.id || '',
      timestamp: new Date()
    });

    console.log(`Auto-reply sent to ${phone}`);
  } catch (error) {
    console.error('Error sending auto-reply:', error);
  }
}

// Get message history
app.get('/api/whatsapp/messages', async (req, res) => {
  try {
    const { phone, limit = 50, page = 1 } = req.query;
    
    let query = {};
    if (phone) {
      query.customerPhone = phone;
    }

    const messages = await messagesCollection
      .find(query)
      .sort({ timestamp: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .toArray();

    const total = await messagesCollection.countDocuments(query);

    res.json({
      success: true,
      messages,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('Get Message History Error:', error);
    res.status(500).json({ success: false, error: 'Failed to get message history' });
  }
});

// Get dashboard stats
app.get('/api/whatsapp/stats', async (req, res) => {
  try {
    const totalCustomers = await customersCollection.countDocuments();
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const messagesToday = await messagesCollection.countDocuments({
      timestamp: { $gte: today },
      type: 'sent'
    });

    const totalMessages = await messagesCollection.countDocuments({ type: 'sent' });
    
    const last7Days = new Date();
    last7Days.setDate(last7Days.getDate() - 7);
    
    const messagesThisWeek = await messagesCollection.countDocuments({
      timestamp: { $gte: last7Days },
      type: 'sent'
    });

    res.json({
      success: true,
      stats: {
        totalCustomers,
        messagesToday,
        totalMessages,
        messagesThisWeek
      }
    });

  } catch (error) {
    console.error('Get Dashboard Stats Error:', error);
    res.status(500).json({ success: false, error: 'Failed to get dashboard stats' });
  }
});

// Get templates
app.get('/api/whatsapp/templates', async (req, res) => {
  try {
    const templates = [
      { id: 1, name: 'Welcome Message', message: 'Hello 👋 Welcome to Chamunda Digital! How can we help you?' },
      { id: 2, name: 'PF Advance Eligible', message: 'Your PF advance is eligible! Submit Form 31 for withdrawal.' },
      { id: 3, name: 'Form 10D - Pension', message: 'Congratulations! You are eligible for monthly pension. Apply for Form 10D.' },
      { id: 4, name: 'KYC Reminder', message: 'Please complete your Bank KYC to enable smooth withdrawals.' },
      { id: 5, name: 'Meeting Schedule', message: 'Hello {name}, your appointment is scheduled for {date} at {time}.' },
      { id: 6, name: 'Document Required', message: 'Hello {name}, please submit the following documents: {documents}' },
      { id: 7, name: 'Service Inquiry', message: 'Thank you for contacting Chamunda Digital. We provide PF, ESIC and Payroll services.' }
    ];

    res.json({ success: true, templates });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to get templates' });
  }
});

// ==================== CUSTOMER ROUTES ====================

// Get all customers
app.get('/api/customers', async (req, res) => {
  try {
    const { search, limit = 50, page = 1 } = req.query;
    
    let query = {};
    
    if (search) {
      query = {
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { phone: { $regex: search, $options: 'i' } },
          { mobile: { $regex: search, $options: 'i' } },
          { uan: { $regex: search, $options: 'i' } }
        ]
      };
    }

    const customers = await customersCollection
      .find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .toArray();

    const total = await customersCollection.countDocuments(query);

    res.json({
      success: true,
      customers,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('Get Customers Error:', error);
    res.status(500).json({ success: false, error: 'Failed to get customers' });
  }
});

// Add customer
app.post('/api/customers', async (req, res) => {
  try {
    const customer = req.body;
    customer.createdAt = new Date();
    customer.updatedAt = new Date();
    
    const result = await customersCollection.insertOne(customer);
    res.status(201).json({
      success: true,
      customer: { ...customer, _id: result.insertedId }
    });

  } catch (error) {
    console.error('Add Customer Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update customer
app.put('/api/customers/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = { ...req.body, updatedAt: new Date() };
    
    await customersCollection.updateOne(
      { id },
      { $set: updates }
    );
    
    const updated = await customersCollection.findOne({ id });
    res.json({ success: true, customer: updated });

  } catch (error) {
    console.error('Update Customer Error:', error);
    res.status(500).json({ success: false, error: 'Failed to update customer' });
  }
});

// Delete customer
app.delete('/api/customers/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await customersCollection.deleteOne({ id });
    res.json({ success: true, message: 'Customer deleted successfully' });

  } catch (error) {
    console.error('Delete Customer Error:', error);
    res.status(500).json({ success: false, error: 'Failed to delete customer' });
  }
});

// Import customers (bulk)
app.post('/api/customers/import', async (req, res) => {
  try {
    const { customers } = req.body;

    if (!customers || !Array.isArray(customers)) {
      return res.status(400).json({
        success: false,
        error: 'Customers array is required'
      });
    }

    const results = { imported: 0, skipped: 0, errors: [] };

    for (const customerData of customers) {
      try {
        const existing = await customersCollection.findOne({ 
          $or: [
            { phone: customerData.phone },
            { mobile: customerData.mobile }
          ]
        });
        
        if (existing) {
          results.skipped++;
          continue;
        }

        await customersCollection.insertOne({
          ...customerData,
          createdAt: new Date(),
          updatedAt: new Date()
        });
        results.imported++;

      } catch (error) {
        results.errors.push({ phone: customerData.phone, error: error.message });
      }
    }

    res.json({
      success: true,
      message: `Imported ${results.imported} customers, skipped ${results.skipped}`,
      results
    });

  } catch (error) {
    console.error('Import Customers Error:', error);
    res.status(500).json({ success: false, error: 'Failed to import customers' });
  }
});

// ==================== EXISTING APP ROUTES ====================

// Get settings
app.get('/api/settings', async (req, res) => {
  try {
    const settings = await settingsCollection.findOne({ type: 'admin' });
    res.json(settings || {});
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Save settings
app.post('/api/settings', async (req, res) => {
  try {
    const settings = req.body;
    await settingsCollection.updateOne(
      { type: 'admin' },
      { $set: { ...settings, type: 'admin' } },
      { upsert: true }
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get audit results
app.get('/api/audit-results', async (req, res) => {
  try {
    const results = await auditResultsCollection.find({}).sort({ timestamp: -1 }).toArray();
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Save audit result
app.post('/api/audit-results', async (req, res) => {
  try {
    const result = { ...req.body, timestamp: new Date() };
    await auditResultsCollection.insertOne(result);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', mongodb: 'connected' });
});

// Login History endpoints
app.get('/api/login-history', (req, res) => {
  try {
    const history = localStorage.getItem('chamunda_login_history');
    res.json(history ? JSON.parse(history) : []);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/login-history', (req, res) => {
  try {
    const entry = req.body;
    const history = localStorage.getItem('chamunda_login_history');
    const existing = history ? JSON.parse(history) : [];
    existing.unshift({ ...entry, timestamp: new Date().toISOString() });
    const trimmed = existing.slice(0, 100);
    localStorage.setItem('chamunda_login_history', JSON.stringify(trimmed));
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== START SERVER ====================

async function start() {
  try {
    await connectToMongoDB();
    await initializeData();
  } catch (error) {
    console.log('MongoDB not available, starting server without database...');
  }
  
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log('===========================================');
    console.log('WhatsApp CRM API Endpoints:');
    console.log('  POST   /api/whatsapp/send       - Send single message');
    console.log('  POST   /api/whatsapp/bulk       - Send bulk messages');
    console.log('  GET    /api/whatsapp/webhook    - Webhook verification');
    console.log('  POST   /api/whatsapp/webhook    - Receive messages');
    console.log('  GET    /api/whatsapp/messages   - Get message history');
    console.log('  GET    /api/whatsapp/stats      - Dashboard stats');
    console.log('  GET    /api/whatsapp/templates - Get templates');
    console.log('===========================================');
    console.log('Customer API Endpoints:');
    console.log('  GET    /api/customers           - Get customers');
    console.log('  POST   /api/customers           - Add customer');
    console.log('  PUT    /api/customers/:id      - Update customer');
    console.log('  DELETE /api/customers/:id       - Delete customer');
    console.log('  POST   /api/customers/import    - Import customers');
  });
}

start();
