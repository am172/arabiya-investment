export const normalizeCode = (value) => {
    const last = String(value || '').split('/').filter(Boolean).pop() || '';
    const raw = last.toUpperCase().replace(/[^A-Z0-9]/g, '');
    return raw.length === 12 ? raw.match(/.{4}/g).join('-') : '';
};

export const formatCodeInput = (value) => {
    const source = String(value || '').includes('/') ? normalizeCode(value) : value;
    const raw = String(source || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 12);
    return (raw.match(/.{1,4}/g) || []).join('-');
};

export const formatCertDate = (value) => {
    if (!value) return '';
    try {
        return new Intl.DateTimeFormat('ar-EG-u-nu-latn', { dateStyle: 'long', timeZone: 'UTC' }).format(new Date(value));
    } catch (error) {
        return '';
    }
};