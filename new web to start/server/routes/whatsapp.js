import express from 'express';
import whatsappController from '../controllers/whatsappController.js';

const router = express.Router();

// Send single WhatsApp message
router.post('/send', whatsappController.sendSingleMessage);

// Send bulk WhatsApp messages
router.post('/bulk', whatsappController.sendBulkMessages);

// WhatsApp Webhook
router.post('/webhook', whatsappController.handleWebhook);

// Get message history
router.get('/messages', whatsappController.getMessageHistory);

// Get dashboard stats
router.get('/stats', whatsappController.getDashboardStats);

// Get message templates
router.get('/templates', whatsappController.getTemplates);

// Webhook verification GET endpoint
router.get('/webhook', (req, res) => {
  const hubChallenge = req.query['hub.challenge'];
  const hubVerifyToken = req.query['hub.verify_token'];
  
  // Verify token - should match your WhatsApp webhook verify token
  const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || 'chamunda_digital_verify';
  
  if (hubVerifyToken === VERIFY_TOKEN) {
    console.log('Webhook Verified Successfully');
    res.status(200).send(hubChallenge);
  } else {
    console.log('Webhook Verification Failed');
    res.status(403).send('Verification failed');
  }
});

export default router;

