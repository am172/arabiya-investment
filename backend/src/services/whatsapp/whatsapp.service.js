const mongoose = require('mongoose');
const logger = require('../../utils/logger');
const ApiError = require('../../utils/ApiError');
const useMongoAuthState = require('./authState');
const bot = require('./bot.service');
const { configured } = require('./ai.service');
const BotSettings = require('../../models/BotSettings.model');

const MAX_AGE_SECONDS = 600;
const MAX_SETUP_RETRIES = 6;
const DISABLED_MESSAGE = 'The WhatsApp bot is turned off on this server';

const state = { status: 'disconnected', qr: '', pairingCode: '', phone: '', error: '' };

let baileys = null;
let sock = null;
let starting = false;
let retry = 0;
let retryTimer = null;
let pendingPhone = '';
let pairingRequested = false;
let queue = Promise.resolve();

const enabled = () => String(process.env.WHATSAPP_ENABLED || '').toLowerCase() === 'true';

const load = async () => {
  if (!baileys) baileys = await import('@whiskeysockets/baileys');
  return baileys;
};

const authCollection = () => mongoose.connection.collection('whatsapp_auth');
const clearSession = () => authCollection().deleteMany({});
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const getStatus = () => ({
  enabled: enabled(),
  status: enabled() ? state.status : 'disabled',
  qr: state.qr,
  pairingCode: state.pairingCode,
  phone: state.phone,
  error: state.error,
  providers: configured()
});

const extractText = (message) => {
  const raw = message.message || {};
  const content =
    (raw.ephemeralMessage && raw.ephemeralMessage.message) ||
    (raw.viewOnceMessage && raw.viewOnceMessage.message) ||
    raw;
  return (
    content.conversation ||
    (content.extendedTextMessage && content.extendedTextMessage.text) ||
    (content.imageMessage && content.imageMessage.caption) ||
    ''
  );
};

const processMessage = async (socket, message) => {
  if (!message.message || message.key.fromMe) return;

  const jid = message.key.remoteJid || '';
  if (!jid.endsWith('@s.whatsapp.net') && !jid.endsWith('@lid')) return;

  const age = Date.now() / 1000 - Number(message.messageTimestamp || 0);
  if (age > MAX_AGE_SECONDS) return;

  const settings = await BotSettings.getSettings();
  if (!settings.enabled) return;

  const text = extractText(message);
  const name = message.pushName || '';
  const answer = text ? await bot.reply({ jid, name, text }) : await bot.replyUnsupported({ jid });
  if (!answer) return;

  await socket.readMessages([message.key]).catch(() => {});
  await socket.sendPresenceUpdate('composing', jid).catch(() => {});
  await wait(Math.min(4000, 800 + answer.length * 20));
  await socket.sendMessage(jid, { text: answer });
  await socket.sendPresenceUpdate('paused', jid).catch(() => {});
};

const handleMessages = (socket) => ({ messages, type }) => {
  if (socket !== sock || type !== 'notify') return;
  messages.forEach((message) => {
    queue = queue
      .then(() => processMessage(socket, message))
      .catch((error) => logger.error(`WhatsApp message failed: ${error.message}`));
  });
};

const scheduleRestart = () => {
  clearTimeout(retryTimer);
  const delay = Math.min(30000, 2000 * 2 ** retry);
  retry += 1;
  retryTimer = setTimeout(() => start(), delay);
};

const handleConnection = (socket) => async (update) => {
  if (socket !== sock) return;
  const { connection, lastDisconnect, qr } = update;
  const { DisconnectReason } = await load();

  if (qr) {
    try {
      if (pendingPhone) {
        if (!pairingRequested) {
          pairingRequested = true;
          state.pairingCode = await socket.requestPairingCode(pendingPhone);
          state.qr = '';
          state.status = 'pairing';
        }
      } else {
        const QRCode = require('qrcode');
        state.qr = await QRCode.toDataURL(qr, { margin: 1, width: 320 });
        state.pairingCode = '';
        state.status = 'qr';
      }
    } catch (error) {
      pairingRequested = false;
      state.error = error.message;
    }
  }

  if (connection === 'open') {
    state.status = 'connected';
    state.qr = '';
    state.pairingCode = '';
    state.error = '';
    state.phone = String((socket.user && socket.user.id) || '').split(':')[0].split('@')[0];
    pendingPhone = '';
    retry = 0;
  }

  if (connection === 'close') {
    const code =
      lastDisconnect && lastDisconnect.error && lastDisconnect.error.output
        ? lastDisconnect.error.output.statusCode
        : 0;
    const registered = Boolean(socket.authState && socket.authState.creds && socket.authState.creds.registered);
    sock = null;
    pairingRequested = false;

    if (code === DisconnectReason.loggedOut) {
      await clearSession();
      Object.assign(state, { status: 'disconnected', qr: '', pairingCode: '', phone: '' });
      return;
    }

    if (!registered && retry >= MAX_SETUP_RETRIES) {
      Object.assign(state, { status: 'disconnected', qr: '', pairingCode: '' });
      retry = 0;
      return;
    }

    state.status = 'connecting';
    scheduleRestart();
  }
};

const start = async () => {
  if (!enabled() || starting || sock) return;
  starting = true;

  try {
    const b = await load();
    const makeWASocket = b.makeWASocket || b.default;
    if (typeof makeWASocket !== 'function') throw new Error('Baileys did not export makeWASocket');

    const { state: auth, saveCreds } = await useMongoAuthState(authCollection(), b);
    const versionInfo = await b.fetchLatestBaileysVersion().catch(() => ({}));
    const pino = require('pino');
    const silent = pino({ level: 'silent' });

    const socket = makeWASocket({
      version: versionInfo.version,
      auth: { creds: auth.creds, keys: b.makeCacheableSignalKeyStore(auth.keys, silent) },
      logger: silent,
      printQRInTerminal: false,
      browser: ['Academy Assistant', 'Chrome', '1.0.0'],
      markOnlineOnConnect: false,
      syncFullHistory: false,
      generateHighQualityLinkPreview: false
    });

    sock = socket;
    state.status = 'connecting';
    socket.ev.on('creds.update', saveCreds);
    socket.ev.on('connection.update', handleConnection(socket));
    socket.ev.on('messages.upsert', handleMessages(socket));
  } catch (error) {
    state.status = 'disconnected';
    state.error = error.message;
    logger.error(`WhatsApp start failed: ${error.message}`);
  } finally {
    starting = false;
  }
};

const stopSocket = () => {
  clearTimeout(retryTimer);
  const current = sock;
  sock = null;
  if (current) {
    try {
      current.end(undefined);
    } catch (error) {
      logger.warn(`WhatsApp end failed: ${error.message}`);
    }
  }
};

const connect = async ({ mode, phone }) => {
  if (!enabled()) throw new ApiError(503, DISABLED_MESSAGE);
  if (state.status === 'connected') return getStatus();

  stopSocket();
  retry = 0;
  pairingRequested = false;
  state.qr = '';
  state.pairingCode = '';
  state.error = '';

  if (mode === 'pairing') {
    const digits = String(phone || '').replace(/\D/g, '');
    if (digits.length < 8 || digits.length > 15) {
      throw new ApiError(400, 'Enter the full number with the country code');
    }
    pendingPhone = digits;
  } else {
    pendingPhone = '';
  }

  await start();
  return getStatus();
};

const disconnect = async () => {
  clearTimeout(retryTimer);
  const current = sock;
  sock = null;
  if (current) {
    try {
      await current.logout();
    } catch (error) {
      try {
        current.end(undefined);
      } catch (inner) {
        logger.warn(`WhatsApp end failed: ${inner.message}`);
      }
    }
  }
  await clearSession();
  pendingPhone = '';
  Object.assign(state, { status: 'disconnected', qr: '', pairingCode: '', phone: '', error: '' });
  return getStatus();
};

const autoStart = async () => {
  if (!enabled()) return;
  const doc = await authCollection().findOne({ _id: 'creds' });
  if (!doc) return;
  try {
    const creds = JSON.parse(doc.value);
    if (creds.registered === true) await start();
  } catch (error) {
    logger.warn(`WhatsApp session could not be read: ${error.message}`);
  }
};

const sendDocument = async ({ phone, buffer, fileName, caption }) => {
  if (!enabled()) throw new ApiError(503, DISABLED_MESSAGE);
  if (!sock || state.status !== 'connected') throw new ApiError(409, 'WhatsApp is not connected');

  const digits = String(phone || '').replace(/\D/g, '');
  if (digits.length < 8 || digits.length > 15) {
    throw new ApiError(400, 'Enter the full number with the country code');
  }

  const [found] = (await sock.onWhatsApp(`${digits}@s.whatsapp.net`)) || [];
  if (!found || !found.exists) throw new ApiError(404, 'This number is not on WhatsApp');

  await sock.sendMessage(found.jid, {
    document: buffer,
    mimetype: 'application/pdf',
    fileName,
    caption
  });
};

module.exports = { connect, disconnect, getStatus, autoStart, sendDocument };