import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  customerPhone: {
    type: String,
    required: true,
    trim: true
  },
  customerName: {
    type: String,
    default: ''
  },
  message: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['sent', 'received', 'bulk'],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'sent', 'delivered', 'failed'],
    default: 'pending'
  },
  whatsappMessageId: {
    type: String,
    default: ''
  },
  error: {
    type: String,
    default: ''
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

// Index for faster queries
messageSchema.index({ customerPhone: 1 });
messageSchema.index({ timestamp: -1 });

const Message = mongoose.model('Message', messageSchema);

export default Message;

