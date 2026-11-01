const mongoose = require('mongoose');

const botSettingsSchema = new mongoose.Schema(
  {
    key: { type: String, default: 'main', unique: true, immutable: true },
    enabled: { type: Boolean, default: true },
    provider: { type: String, enum: ['groq', 'gemini'], default: 'groq' },
    instructions: { type: String, trim: true, maxlength: 1500, default: '' },
    fallbackMessage: {
      type: String,
      trim: true,
      maxlength: 500,
      default: 'شكرًا لتواصلك. سيرد عليك فريقنا في أقرب وقت.'
    },
    handoffKeywords: { type: [String], default: ['موظف', 'بشري', 'اتصال', 'human', 'agent'] },
    handoffMessage: {
      type: String,
      trim: true,
      maxlength: 500,
      default: 'تم تحويل محادثتك إلى أحد أعضاء الفريق وسيتواصل معك قريبًا.'
    },
    maxRepliesPerHour: { type: Number, min: 1, max: 100, default: 15 }
  },
  { timestamps: true }
);

botSettingsSchema.statics.getSettings = async function () {
  let doc = await this.findOne({ key: 'main' });
  if (doc) return doc;
  try {
    doc = await this.create({ key: 'main' });
  } catch (error) {
    if (error.code !== 11000) throw error;
    doc = await this.findOne({ key: 'main' });
  }
  return doc;
};

botSettingsSchema.statics.updateSettings = async function (payload) {
  await this.getSettings();
  return this.findOneAndUpdate({ key: 'main' }, { $set: payload }, { new: true, runValidators: true });
};

module.exports = mongoose.model('BotSettings', botSettingsSchema);