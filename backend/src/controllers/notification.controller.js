const NotificationSettings = require('../models/NotificationSettings.model');
const PushSubscription = require('../models/PushSubscription.model');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');
const pick = require('../utils/pick');
const service = require('../services/notification.service');
const email = require('../services/email.service');

const FIELDS = ['pushEnabled', 'emailEnabled', 'notifyAllAdmins', 'extraRecipients'];

const present = (doc) => ({
    pushEnabled: doc.pushEnabled,
    emailEnabled: doc.emailEnabled,
    notifyAllAdmins: doc.notifyAllAdmins,
    extraRecipients: doc.extraRecipients
});

const getStatus = asyncHandler(async (req, res) => {
    const [settings, mine] = await Promise.all([
        NotificationSettings.getSettings(),
        PushSubscription.countDocuments({ admin: req.admin._id })
    ]);

    res.status(200).json(
        new ApiResponse(
            200,
            {
                settings: present(settings),
                pushConfigured: service.isPushReady(),
                emailConfigured: email.isConfigured(),
                publicKey: process.env.VAPID_PUBLIC_KEY || '',
                mySubscriptions: mine
            },
            'Status fetched successfully'
        )
    );
});

const updateSettings = asyncHandler(async (req, res) => {
    await NotificationSettings.getSettings();
    const doc = await NotificationSettings.findOneAndUpdate(
        { key: 'main' },
        { $set: pick(req.body, FIELDS) },
        { new: true, runValidators: true }
    );
    res.status(200).json(new ApiResponse(200, present(doc), 'Settings updated successfully'));
});

const subscribe = asyncHandler(async (req, res) => {
    await PushSubscription.findOneAndUpdate(
        { endpoint: req.body.endpoint },
        {
            $set: {
                admin: req.admin._id,
                keys: { p256dh: req.body.keys.p256dh, auth: req.body.keys.auth },
                userAgent: String(req.get('user-agent') || '').slice(0, 300)
            }
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    res.status(201).json(new ApiResponse(201, null, 'Subscribed'));
});

const unsubscribe = asyncHandler(async (req, res) => {
    await PushSubscription.deleteOne({ endpoint: req.body.endpoint, admin: req.admin._id });
    res.status(200).json(new ApiResponse(200, null, 'Unsubscribed'));
});

const test = asyncHandler(async (req, res) => {
    const result = await service.sendTest(req.admin);
    res.status(200).json(new ApiResponse(200, result, 'Test sent'));
});

module.exports = { getStatus, updateSettings, subscribe, unsubscribe, test };