import express from 'express';
import cors from 'cors';
import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3003;

const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://Koliharshad:Harshad%401602@chamunda-digital.auwsqre.mongodb.net/?appName=chamunda-digital&retryWrites=true&w=majority';
const DB_NAME = 'chamunda-digital';

let db = null;
let client = null;
let mongoConnected = false;

let localCustomers = [];
let localMessages = [];

const WHATSAPP_CONFIG = {
  phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID || '1009369798926449',
  accessToken: process.env.WHATSAPP_ACCESS_TOKEN || 'EAAbiMMLsZBDIBQ6oKoNnvf9hUZBEXpZA4xZBPntiQXCGJc0BZByD6ZCUeC7fpH9wQrPSruVLScXudS9fn9chghiYVNrWtS6xfqwA5oGoOIE3j0879At0KiPZBzLou7o7rHOjwzvJZAo5ZCLMbKAA4SP1yyY00SYUfMx6yfZCS4hGbBym1XP3oyu2sshElZA5vMKIwZDZD',
  apiVersion: 'v19.0'
};

const WHATSAPP_API_URL = `https://graph.facebook.com/${WHATSAPP_CONFIG.apiVersion}/${WHATSAPP_CONFIG.phoneNumberId}/messages`;

const AUTO_REPLIES = {
  'hi': 'Hello Welcome to Chamunda Digital!',
  'hello': 'Hello Welcome to Chamunda Digital!',
  'services': 'We provide: PF, ESIC, Payroll, Tax Consulting',
  'pf': 'PF services: Registration, Returns, Withdrawal, Transfer',
  'esic': 'ESIC services: Registration, Returns, Medical Benefits',
  'payroll': 'Payroll: Salary Processing, Compliance, Reports',
  'contact': 'Phone: +91 9876543210',
  'thanks': 'You are welcome!',
  'thank you': 'You are welcome!'
};

async function connectToMongoDB() {
  try {
    console.log('Attempting MongoDB connection...');
    client = new MongoClient(MONGO_URI);
    await client.connect();
    db = client.db(DB_NAME);
    await db.admin().ping();
    mongoConnected = true;
    console.log('MongoDB Atlas connected!');
    return true;
  } catch (error) {
    console.error('MongoDB failed:', error.message);
    mongoConnected = false;
    return false;
  }
}

app.use(cors());
app.use(express.json({ limit: '50mb' }));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', mongodb: mongoConnected ? 'connected' : 'disconnected' });
});

const sampleCustomers = [
  { id: 'CD-000001', name: 'Rajesh Kumar', mobile: '919876543210', phone: '919876543210', uan: '101234567890', companyName: 'Tech Solutions', passbookBalance: 245000 },
  { id: 'CD-000002', name: 'Priya Sharma', mobile: '919876543211', phone: '919876543211', uan: '101234567891', companyName: 'Digital Services', passbookBalance: 180000 }
];

async function initializeData() {
  if (!mongoConnected) {
    localCustomers = [...sampleCustomers];
    console.log('Using local memory');
    return;
  }
  try {
    const count = await db.collection('customers').countDocuments();
    if (count === 0) {
      await db.collection('customers').insertMany(sampleCustomers);
    }
  } catch (e) { console.error('Init error:', e.message); }
}

app.post('/api/whatsapp/send', async (req, res) => {
  try {
    const { phone, message, customerName } = req.body;
    if (!phone || !message) return res.status(400).json({ success: false, error: 'Phone and message required' });
    
    const formattedPhone = phone.replace(/^\+/, '');
    const payload = { messaging_product: 'whatsapp', to: formattedPhone, type: 'text', text: { body: message } };
    
    const response = await axios.post(WHATSAPP_API_URL, payload, {
      headers: { 'Authorization': `Bearer ${WHATSAPP_CONFIG.accessToken}`, 'Content-Type': 'application/json' }
    });
    
    if (mongoConnected && db) {
      await db.collection('messages').insertOne({
        customerPhone: formattedPhone, customerName: customerName || '', message, type: 'sent', status: 'sent', timestamp: new Date()
      });
    }
    
    res.json({ success: true, messageId: response.data.messages?.[0]?.id });
  } catch (error) {
    console.error('Send error:', error.response?.data || error.message);
    res.status(500).json({ success: false, error: error.response?.data?.error?.message || error.message });
  }
});

app.post('/api/whatsapp/bulk', async (req, res) => {
  try {
    const { messages } = req.body;
    if (!messages || !Array.isArray(messages)) return res.status(400).json({ success: false, error: 'Messages array required' });
    
    const results = [];
    for (const msg of messages) {
      try {
        const formattedPhone = msg.phone.replace(/^\+/, '');
        const payload = { messaging_product: 'whatsapp', to: formattedPhone, type: 'text', text: { body: msg.message } };
        await axios.post(WHATSAPP_API_URL, payload, { headers: { 'Authorization': `Bearer ${WHATSAPP_CONFIG.accessToken}`, 'Content-Type': 'application/json' } });
        results.push({ phone: formattedPhone, success: true });
        if (mongoConnected && db) {
          await db.collection('messages').insertOne({ customerPhone: formattedPhone, customerName: msg.customerName || '', message: msg.message, type: 'bulk', status: 'sent', timestamp: new Date() });
        }
        await new Promise(r => setTimeout(r, 500));
      } catch (e) { results.push({ phone: msg.phone, error: e.message }); }
    }
    res.json({ success: true, results });
  } catch (error) { res.status(500).json({ success: false, error: error.message }); }
});

app.get('/api/whatsapp/webhook', (req, res) => {
  const token = req.query['hub.verify_token'];
  if (token === (process.env.WHATSAPP_VERIFY_TOKEN || 'chamunda_digital_verify')) res.send(req.query['hub.challenge']);
  else res.status(403).send('Failed');
});

app.post('/api/whatsapp/webhook', async (req, res) => {
  try {
    const entry = req.body.entry;
    if (entry && entry[0]?.changes) {
      for (const change of entry[0].changes) {
        if (change.value?.messages) {
          for (const waMsg of change.value.messages) {
            const phone = waMsg.from;
            const text = waMsg.text?.body || '';
            console.log('From ' + phone + ': ' + text);
            if (mongoConnected && db) await db.collection('messages').insertOne({ customerPhone: phone, message: text, type: 'received', timestamp: new Date() });
            const lower = text.toLowerCase().trim();
            let reply = AUTO_REPLIES[lower];
            if (!reply) { if (lower.includes('pf')) reply = AUTO_REPLIES['pf']; else if (lower.includes('esic')) reply = AUTO_REPLIES['esic']; }
            if (reply) {
              await axios.post(WHATSAPP_API_URL, { messaging_product: 'whatsapp', to: phone, type: 'text', text: { body: reply } }, { headers: { 'Authorization': `Bearer ${WHATSAPP_CONFIG.accessToken}`, 'Content-Type': 'application/json' } });
            }
          }
        }
      }
    }
    res.send('OK');
  } catch (e) { res.status(500).send('Error'); }
});

app.get('/api/whatsapp/messages', async (req, res) => {
  try {
    if (!mongoConnected || !db) return res.json({ success: true, messages: localMessages });
    const messages = await db.collection('messages').find({}).sort({ timestamp: -1 }).limit(50).toArray();
    res.json({ success: true, messages });
  } catch (e) { res.json({ success: true, messages: localMessages }); }
});

app.get('/api/whatsapp/stats', async (req, res) => {
  try {
    if (!mongoConnected || !db) return res.json({ success: true, stats: { totalCustomers: localCustomers.length, messagesToday: 0, totalMessages: localMessages.length } });
    const totalCustomers = await db.collection('customers').countDocuments();
    const totalMessages = await db.collection('messages').countDocuments({ type: 'sent' });
    res.json({ success: true, stats: { totalCustomers, messagesToday: 0, totalMessages } });
  } catch (e) { res.json({ success: true, stats: { totalCustomers: localCustomers.length, messagesToday: 0, totalMessages: localMessages.length } }); }
});

app.get('/api/whatsapp/templates', (req, res) => {
  res.json({ success: true, templates: [
    { id: 1, name: 'Welcome', message: 'Hello Welcome to Chamunda Digital!' },
    { id: 2, name: 'PF Advance', message: 'Your PF advance is eligible!' },
    { id: 3, name: 'Pension', message: 'You are eligible for Form 10D!' },
    { id: 4, name: 'KYC', message: 'Please complete your Bank KYC.' },
    { id: 5, name: 'Services', message: 'We provide PF, ESIC, Payroll services.' }
  ]});
});

app.get('/api/customers', async (req, res) => {
  try {
    if (!mongoConnected || !db) return res.json({ success: true, customers: localCustomers });
    const customers = await db.collection('customers').find({}).sort({ createdAt: -1 }).limit(50).toArray();
    res.json({ success: true, customers });
  } catch (e) { res.json({ success: true, customers: localCustomers }); }
});

app.post('/api/customers', async (req, res) => {
  try {
    const customer = { ...req.body, createdAt: new Date() };
    if (!mongoConnected || !db) { localCustomers.push(customer); return res.json({ success: true, customer }); }
    const result = await db.collection('customers').insertOne(customer);
    res.json({ success: true, customer: { ...customer, _id: result.insertedId } });
  } catch (e) { res.status(500).json({ success: false, error: e.message }); }
});

app.put('/api/customers/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = { ...req.body, updatedAt: new Date() };
    if (!mongoConnected || !db) {
      const idx = localCustomers.findIndex(c => c.id === id);
      if (idx >= 0) { localCustomers[idx] = { ...localCustomers[idx], ...updates }; return res.json({ success: true, customer: localCustomers[idx] }); }
      return res.status(404).json({ success: false, error: 'Not found' });
    }
    await db.collection('customers').updateOne({ id }, { $set: updates });
    const updated = await db.collection('customers').findOne({ id });
    res.json({ success: true, customer: updated });
  } catch (e) { res.status(500).json({ success: false, error: e.message }); }
});

app.delete('/api/customers/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoConnected || !db) { localCustomers = localCustomers.filter(c => c.id !== id); return res.json({ success: true }); }
    await db.collection('customers').deleteOne({ id });
    res.json({ success: true });
  } catch (e) { res.status(500).json({ success: false, error: e.message }); }
});

app.post('/api/customers/import', async (req, res) => {
  try {
    const { customers } = req.body;
    if (!customers || !Array.isArray(customers)) return res.status(400).json({ success: false, error: 'Array required' });
    let imported = 0;
    if (!mongoConnected || !db) {
      for (const c of customers) {
        const exists = localCustomers.find(x => x.phone === c.phone || x.mobile === c.mobile);
        if (!exists) { localCustomers.push({ ...c, createdAt: new Date() }); imported++; }
      }
      return res.json({ success: true, message: 'Imported ' + imported });
    }
    for (const c of customers) {
      const existing = await db.collection('customers').findOne({ $or: [{ phone: c.phone }, { mobile: c.mobile }] });
      if (!existing) { await db.collection('customers').insertOne({ ...c, createdAt: new Date() }); imported++; }
    }
    res.json({ success: true, message: 'Imported ' + imported });
  } catch (e) { res.status(500).json({ success: false, error: e.message }); }
});

async function start() {
  console.log('Connecting to MongoDB...');
  await connectToMongoDB();
  await initializeData();
  app.listen(PORT, () => {
    console.log('Server: http://localhost:' + PORT);
    console.log('MongoDB: ' + (mongoConnected ? 'Connected' : 'Local memory'));
    console.log('APIs: /api/whatsapp/* /api/customers/* /api/health');
  });
}

start();
