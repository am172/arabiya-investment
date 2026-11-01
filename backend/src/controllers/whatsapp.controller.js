const WhatsAppChat = require('../models/WhatsAppChat.model');
const BotSettings = require('../models/BotSettings.model');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');
const pick = require('../utils/pick');
const { getPagination, getMeta } = require('../utils/pagination');
const manager = require('../services/whatsapp/whatsapp.service');
const bot = require('../services/whatsapp/bot.service');

const SETTINGS_FIELDS = [
    'enabled',
    'provider',
    'instructions',
    'fallbackMessage',
    'handoffKeywords',
    'handoffMessage',
    'maxRepliesPerHour'
];

const getStatus = asyncHandler(async (req, res) => {
    res.status(200).json(new ApiResponse(200, manager.getStatus(), 'Status fetched successfully'));
});

const connect = asyncHandler(async (req, res) => {
    const data = await manager.connect({ mode: req.body.mode, phone: req.body.phone });
    res.status(200).json(new ApiResponse(200, data, 'Connection started'));
});

const disconnect = asyncHandler(async (req, res) => {
    const data = await manager.disconnect();
    res.status(200).json(new ApiResponse(200, data, 'Disconnected successfully'));
});

const getSettings = asyncHandler(async (req, res) => {
    const doc = await BotSettings.getSettings();
    res.status(200).json(new ApiResponse(200, doc, 'Settings fetched successfully'));
});

const updateSettings = asyncHandler(async (req, res) => {
    const doc = await BotSettings.updateSettings(pick(req.body, SETTINGS_FIELDS));
    res.status(200).json(new ApiResponse(200, doc, 'Settings updated successfully'));
});

const preview = asyncHandler(async (req, res) => {
    const history = (req.body.history || []).map((item) => ({
        role: item.role === 'bot' ? 'bot' : 'user',
        text: String(item.text).slice(0, 1000)
    }));
    const answer = await bot.preview({ text: req.body.text, history });
    res.status(200).json(new ApiResponse(200, { answer }, 'Preview generated'));
});

const listChats = asyncHandler(async (req, res) => {
    const { page, limit, skip } = getPagination(req.query);
    const filter = req.query.needsHuman === 'true' ? { needsHuman: true } : {};

    const [items, total] = await Promise.all([
        WhatsAppChat.find(filter).sort({ lastMessageAt: -1 }).skip(skip).limit(limit).lean(),
        WhatsAppChat.countDocuments(filter)
    ]);

    const data = items.map((chat) => ({
        _id: chat._id,
        name: chat.name,
        phone: chat.jid.endsWith('@s.whatsapp.net') ? chat.jid.split('@')[0] : '',
        needsHuman: chat.needsHuman,
        pausedUntil: chat.pausedUntil,
        lastMessageAt: chat.lastMessageAt,
        messages: chat.messages.slice(-12)
    }));

    res
        .status(200)
        .json(new ApiResponse(200, data, 'Chats fetched successfully', getMeta(total, page, limit)));
});

const resumeChat = asyncHandler(async (req, res) => {
    const chat = await WhatsAppChat.findByIdAndUpdate(
        req.params.id,
        { $set: { needsHuman: false, pausedUntil: null } },
        { new: true }
    );
    if (!chat) throw new ApiError(404, 'Chat not found');
    res.status(200).json(new ApiResponse(200, null, 'Bot resumed for this chat'));
});

const deleteChat = asyncHandler(async (req, res) => {
    const chat = await WhatsAppChat.findByIdAndDelete(req.params.id);
    if (!chat) throw new ApiError(404, 'Chat not found');
    res.status(200).json(new ApiResponse(200, null, 'Chat deleted successfully'));
});

module.exports = {
    getStatus,
    connect,
    disconnect,
    getSettings,
    updateSettings,
    preview,
    listChats,
    resumeChat,
    deleteChat
};