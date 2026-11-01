const mongoose = require('mongoose');

const schema = new mongoose.Schema({
    key: { type: String, required: true, unique: true },
    seq: { type: Number, default: 0 }
});

schema.statics.next = async function (key) {
    const doc = await this.findOneAndUpdate(
        { key },
        { $inc: { seq: 1 } },
        { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    return doc.seq;
};

module.exports = mongoose.model('Counter', schema);