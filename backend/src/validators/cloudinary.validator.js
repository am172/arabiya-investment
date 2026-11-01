const NAME = /^[A-Za-z0-9_-]{2,60}$/;
const KEY = /^\d{6,30}$/;

const validateCloudinary = (body) => {
    const errors = [];
    const name = String(body.cloudName || '').trim();
    const key = String(body.apiKey || '').trim();
    const secret = String(body.apiSecret || '').trim();

    if (name && !NAME.test(name)) errors.push({ field: 'cloudName', message: 'Invalid cloud name' });
    if (key && !KEY.test(key)) errors.push({ field: 'apiKey', message: 'The API key is made of numbers only' });
    if (secret && (secret.length < 10 || secret.length > 100 || /\s/.test(secret))) {
        errors.push({ field: 'apiSecret', message: 'Invalid API secret' });
    }
    return errors;
};

module.exports = { validateCloudinary };