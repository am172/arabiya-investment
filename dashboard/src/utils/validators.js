export const EMAIL_REGEX = /^\S+@\S+\.\S+$/;
export const HEX_COLOR = /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$/;

export const isEmail = (value) => EMAIL_REGEX.test(String(value || '').trim());

export const isUrl = (value) => {
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch (error) {
    return false;
  }
};

export const isValidLink = (value) => {
  const link = String(value || '').trim();
  if (!link) return true;
  if (link.startsWith('//')) return false;
  if (link.startsWith('/') || link.startsWith('#')) return true;
  return isUrl(link);
};

export const mapServerErrors = (errors) =>
  (errors || []).reduce((acc, item) => {
    if (item && item.field) acc[item.field] = item.message;
    return acc;
  }, {});