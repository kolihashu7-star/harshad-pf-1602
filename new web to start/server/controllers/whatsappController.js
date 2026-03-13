import axios from 'axios';
import Message from '../models/Message.js';
import Customer from '../models/Customer.js';

// WhatsApp API Configuration
const WHATSAPP_CONFIG = {
  phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID || '1009369798926449',
  accessToken: process.env.WHATSAPP_ACCESS_TOKEN || 'EAAbiMMLsZBDIBQ6oKoNnvf9hUZBEXpZA4xZBPntiQXCGJc0BZByD6ZCUeC7fpH9wQrPSruVLScXudS9fn9chghiYVNrWtS6xfqwA5oGoOIE3j0879At0KiPZBzLou7o7rHOjwzvJZAo5ZCLMbKAA4SP1yyY00SYUfMx6yfZCS4hGbBym1XP3oyu2sshElZA5vMKIwZDZD',
  apiVersion: 'v19.0'
};

// Base URL for WhatsApp API
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

// Send single WhatsApp message
export const sendSingleMessage = async (req, res) => {
  try {
    const { phone, message, customerName } = req.body;

    if (!phone || !message) {
      return res.status(400).json({ 
        success: false, 
        error: 'Phone number and message are required' 
      });
    }

    // Format phone number (remove + if present)
    const formattedPhone = phone.replace(/^\+/, '');

    // Prepare WhatsApp API payload
    const payload = {
      messaging_product: 'whatsapp',
      to: formattedPhone,
      type: 'text',
      text: { body: message }
    };

    // Send message via WhatsApp API
    const response = await axios.post(WHATSAPP_API_URL, payload, {
      headers: {
        'Authorization': `Bearer ${WHATSAPP_CONFIG.accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    // Save message to database
    const newMessage = new Message({
      customerPhone: formattedPhone,
      customerName: customerName || '',
      message: message,
      type: 'sent',
      status: 'sent',
      whatsappMessageId: response.data.messages?.[0]?.id || ''
    });
    await newMessage.save();

    res.json({
      success: true,
      message: 'Message sent successfully',
      messageId: response.data.messages?.[0]?.id,
      data: newMessage
    });

  } catch (error) {
    console.error('Send Message Error:', error.response?.data || error.message);
    
    // Save failed message to database
    try {
      const { phone, message, customerName } = req.body;
      const formattedPhone = phone?.replace(/^\+/, '') || '';
      
      const failedMessage = new Message({
        customerPhone: formattedPhone,
        customerName: customerName || '',
        message: message || '',
        type: 'sent',
        status: 'failed',
        error: error.response?.data?.error?.message || error.message
      });
      await failedMessage.save();
    } catch (saveError) {
      console.error('Error saving failed message:', saveError);
    }

    res.status(500).json({
      success: false,
      error: error.response?.data?.error?.message || 'Failed to send message'
    });
  }
};

// Send bulk WhatsApp messages
export const sendBulkMessages = async (req, res) => {
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

    // Send messages one by one with delay to avoid rate limiting
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

        // Save to database
        const newMessage = new Message({
          customerPhone: formattedPhone,
          customerName: customerName || '',
          message: message,
          type: 'bulk',
          status: 'sent',
          whatsappMessageId: response.data.messages?.[0]?.id || ''
        });
        await newMessage.save();

        results.push({
          phone: formattedPhone,
          success: true,
          messageId: response.data.messages?.[0]?.id
        });

        // Delay between messages to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 500));

      } catch (error) {
        errors.push({
          phone: msg.phone,
          error: error.message
        });

        // Save failed bulk message
        try {
          const newMessage = new Message({
            customerPhone: msg.phone?.replace(/^\+/, ''),
            customerName: msg.customerName || '',
            message: msg.message,
            type: 'bulk',
            status: 'failed',
            error: error.message
          });
          await newMessage.save();
        } catch (saveError) {
          console.error('Error saving failed bulk message:', saveError);
        }
      }
    }

    res.json({
      success: true,
      message: `Sent ${results.length} messages, ${errors.length} failed`,
      results,
      errors
    });

  } catch (error) {
    console.error('Bulk Send Error:', error.response?.data || error.message);
    res.status(500).json({
      success: false,
      error: error.response?.data?.error?.message || 'Failed to send bulk messages'
    });
  }
};

// WhatsApp Webhook for receiving messages
export const handleWebhook = async (req, res) => {
  try {
    const { entry } = req.body;

    // Verify webhook (for initial setup)
    if (req.query['hub.mode'] === 'subscribe') {
      const hubChallenge = req.query['hub.challenge'];
      const hubVerifyToken = req.query['hub.verify_token'];
      
      // You should set a verify token in environment
      const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || 'chamunda_digital_verify';
      
      if (hubVerifyToken === VERIFY_TOKEN) {
        console.log('Webhook Verified Successfully');
        return res.status(200).send(hubChallenge);
      } else {
        return res.status(403).send('Verification failed');
      }
    }

    // Process incoming messages
    if (entry && entry[0]?.changes) {
      const changes = entry[0].changes;
      
      for (const change of changes) {
        if (change.value?.messages) {
          for (const message of change.value.messages) {
            await processIncomingMessage(message);
          }
        }
      }
    }

    res.status(200).send('OK');

  } catch (error) {
    console.error('Webhook Error:', error);
    res.status(500).send('Error processing webhook');
  }
};

// Process incoming WhatsApp message
const processIncomingMessage = async (whatsappMessage) => {
  try {
    const phone = whatsappMessage.from;
    const messageText = whatsappMessage.text?.body || '';
    const messageId = whatsappMessage.id;

    console.log(`Received message from ${phone}: ${messageText}`);

    // Save received message to database
    const newMessage = new Message({
      customerPhone: phone,
      customerName: '',
      message: messageText,
      type: 'received',
      status: 'delivered',
      whatsappMessageId: messageId
    });
    await newMessage.save();

    // Check for auto-reply
    const lowerMessage = messageText.toLowerCase().trim();
    let replyText = AUTO_REPLIES[lowerMessage];

    // If no exact match, check for keywords
    if (!replyText) {
      if (lowerMessage.includes('pf') || lowerMessage.includes('provident')) {
        replyText = AUTO_REPLIES['pf'];
      } else if (lowerMessage.includes('esic')) {
        replyText = AUTO_REPLIES['esic'];
      } else if (lowerMessage.includes('payroll')) {
        replyText = AUTO_REPLIES['payroll'];
      } else if (lowerMessage.includes('service')) {
        replyText = AUTO_REPLIES['services'];
      } else if (lowerMessage.includes('contact') || lowerMessage.includes('phone') || lowerMessage.includes('email')) {
        replyText = AUTO_REPLIES['contact'];
      }
    }

    // Send auto-reply if matched
    if (replyText) {
      await sendAutoReply(phone, replyText, messageId);
    }

    // Check if customer exists, if not create one
    const existingCustomer = await Customer.findOne({ phone });
    if (!existingCustomer) {
      await Customer.create({
        name: `Customer ${phone.slice(-4)}`,
        phone: phone,
        phoneNumberId: messageId
      });
    }

  } catch (error) {
    console.error('Error processing incoming message:', error);
  }
};

// Send auto-reply message
const sendAutoReply = async (phone, message, replyToMessageId) => {
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

    // Save auto-reply to database
    const autoReplyMessage = new Message({
      customerPhone: phone,
      customerName: '',
      message: message,
      type: 'sent',
      status: 'sent',
      whatsappMessageId: response.data.messages?.[0]?.id || ''
    });
    await autoReplyMessage.save();

    console.log(`Auto-reply sent to ${phone}`);
    return response.data;

  } catch (error) {
    console.error('Error sending auto-reply:', error);
  }
};

// Get message history
export const getMessageHistory = async (req, res) => {
  try {
    const { phone, limit = 50, page = 1 } = req.query;
    
    let query = {};
    if (phone) {
      query.customerPhone = phone;
    }

    const messages = await Message.find(query)
      .sort({ timestamp: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Message.countDocuments(query);

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
    res.status(500).json({
      success: false,
      error: 'Failed to get message history'
    });
  }
};

// Get dashboard statistics
export const getDashboardStats = async (req, res) => {
  try {
    const totalCustomers = await Customer.countDocuments();
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const messagesToday = await Message.countDocuments({
      timestamp: { $gte: today },
      type: 'sent'
    });

    const totalMessages = await Message.countDocuments({ type: 'sent' });
    
    const last7Days = new Date();
    last7Days.setDate(last7Days.getDate() - 7);
    
    const messagesThisWeek = await Message.countDocuments({
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
    res.status(500).json({
      success: false,
      error: 'Failed to get dashboard stats'
    });
  }
};

// Get template messages
export const getTemplates = async (req, res) => {
  try {
    const templates = [
      {
        id: 1,
        name: 'Welcome Message',
        message: 'Hello 👋 Welcome to Chamunda Digital! Your PF audit is complete. Total Balance: ₹{balance}'
      },
      {
        id: 2,
        name: 'PF Advance Eligible',
        message: 'Your PF advance is eligible! Submit Form 31 for withdrawal.'
      },
      {
        id: 3,
        name: 'Form 10D - Pension',
        message: 'Congratulations! You are eligible for monthly pension. Apply for Form 10D.'
      },
      {
        id: 4,
        name: 'Low Balance Alert',
        message: 'Your withdrawable balance is low. Consider waiting for more contributions.'
      },
      {
        id: 5,
        name: 'KYC Reminder',
        message: 'Please complete your Bank KYC to enable smooth withdrawals.'
      },
      {
        id: 6,
        name: 'Meeting Schedule',
        message: 'Hello {name}, your appointment is scheduled for {date} at {time}.'
      },
      {
        id: 7,
        name: 'Document Required',
        message: 'Hello {name}, please submit the following documents: {documents}'
      },
      {
        id: 8,
        name: 'Service Inquiry',
        message: 'Thank you for contacting Chamunda Digital. We provide PF, ESIC and Payroll services. How can we help you?'
      }
    ];

    res.json({
      success: true,
      templates
    });

  } catch (error) {
    console.error('Get Templates Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get templates'
    });
  }
};

export default {
  sendSingleMessage,
  sendBulkMessages,
  handleWebhook,
  getMessageHistory,
  getDashboardStats,
  getTemplates
};

