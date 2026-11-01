const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
    {
        role: { type: String, enum: ['user', 'bot'], required: true },
        text: { type: String, maxlength: 2000, default: '' },
        at: { type: Date, default: Date.now }
    },
    { _id: false }
);

const chatSchema = new mongoose.Schema({
    jid: { type: String, required: true, unique: true },
    name: { type: String, default: '', maxlength: 100 },
    messages: { type: [messageSchema], default: [] },
    needsHuman: { type: Boolean, default: false },
    pausedUntil: { type: Date, default: null },
    lastMessageAt: { type: Date, default: Date.now, expires: 60 * 60 * 24 * 30 }
});

module.exports = mongoose.model('WhatsAppChat', chatSchema);