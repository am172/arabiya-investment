const LOCALE = 'ar-EG-u-nu-latn';

export const formatDate = (value) =>
  value ? new Intl.DateTimeFormat(LOCALE, { dateStyle: 'medium' }).format(new Date(value)) : '—';

export const formatDateTime = (value) =>
  value
    ? new Intl.DateTimeFormat(LOCALE, { dateStyle: 'medium', timeStyle: 'short' }).format(
        new Date(value)
      )
    : '—';

export const formatNumber = (value) => new Intl.NumberFormat(LOCALE).format(Number(value) || 0);

export const formatCurrency = (value, currency = 'USD') => {
  try {
    return new Intl.NumberFormat(LOCALE, { style: 'currency', currency }).format(Number(value) || 0);
  } catch (error) {
    return `${currency} ${value}`;
  }
};

export const truncate = (text, length = 60) =>
  text && text.length > length ? `${text.slice(0, length).trim()}…` : text || '';

export const initials = (name) =>
  String(name || '?')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('');