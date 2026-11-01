import { t } from '../i18n';

export const PRESETS = [
  { value: 'today', label: 'Today' },
  { value: 'yesterday', label: 'Yesterday' },
  { value: 'last7days', label: 'Last 7 days' },
  { value: 'last30days', label: 'Last 30 days' },
  { value: 'thismonth', label: 'This month' },
  { value: 'last90days', label: 'Last 90 days' },
  { value: 'all', label: 'All time' },
  { value: 'custom', label: 'Custom range' }
];

export const MAX_CUSTOM_DAYS = 731;

const LOCALE = 'ar-EG-u-nu-latn';
const pad = (value) => String(value).padStart(2, '0');

export const toDateInput = (date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

export const todayInput = () => toDateInput(new Date());

export const daysAgoInput = (days) => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return toDateInput(date);
};

const dayNumber = (value) => {
  const [year, month, day] = value.split('-').map(Number);
  return Date.UTC(year, month - 1, day) / 86400000;
};

export const validateCustomRange = (startDate, endDate) => {
  if (!startDate || !endDate) return 'Choose both a start and an end date';
  if (startDate > endDate) return 'The start date must be before the end date';
  if (startDate > todayInput()) return 'The start date cannot be in the future';
  if (dayNumber(endDate) - dayNumber(startDate) + 1 > MAX_CUSTOM_DAYS) {
    return 'Ranges are limited to 731 days';
  }
  return '';
};

export const buildParams = (range) => {
  const params = {
    range: range.preset,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
  };
  if (range.preset === 'custom') {
    params.startDate = range.startDate;
    params.endDate = range.endDate;
  }
  return params;
};

export const formatDuration = (seconds) => {
  const total = Math.max(0, Math.round(Number(seconds) || 0));
  if (total < 60) return `${total} ث`;
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  if (hours > 0) return `${hours} س ${minutes} د`;
  return `${minutes} د ${pad(total % 60)} ث`;
};

export const getTrend = (current, previous) => {
  if (previous === null || previous === undefined) return null;
  if (previous === 0) return current > 0 ? { direction: 'up', label: 'جديد' } : null;
  const change = ((current - previous) / previous) * 100;
  const rounded = Math.round(Math.abs(change) * 10) / 10;
  if (rounded === 0) return { direction: 'flat', label: '0%' };
  return { direction: change > 0 ? 'up' : 'down', label: `${rounded}%` };
};

const parseBucket = (key) => {
  const [datePart, timePart] = String(key).split('T');
  const [year, month, day = '1'] = datePart.split('-');
  const hour = timePart ? timePart.split(':')[0] : '0';
  return new Date(Date.UTC(Number(year), Number(month) - 1, Number(day), Number(hour)));
};

const formatter = (options) => new Intl.DateTimeFormat(LOCALE, { timeZone: 'UTC', ...options });

const FORMATS = {
  hourAxis: formatter({ hour: 'numeric' }),
  shortDate: formatter({ month: 'short', day: 'numeric' }),
  hourFull: formatter({ month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }),
  dayFull: formatter({ weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }),
  monthAxis: formatter({ month: 'short', year: '2-digit' }),
  monthFull: formatter({ month: 'long', year: 'numeric' })
};

export const formatAxisLabel = (key, granularity) => {
  const date = parseBucket(key);
  if (granularity === 'hour') {
    return date.getUTCHours() === 0 ? FORMATS.shortDate.format(date) : FORMATS.hourAxis.format(date);
  }
  if (granularity === 'month') return FORMATS.monthAxis.format(date);
  return FORMATS.shortDate.format(date);
};

export const formatTooltipLabel = (key, granularity) => {
  const date = parseBucket(key);
  if (granularity === 'hour') return FORMATS.hourFull.format(date);
  if (granularity === 'month') return FORMATS.monthFull.format(date);
  return FORMATS.dayFull.format(date);
};

export const describeRange = (range) => {
  const format = new Intl.DateTimeFormat(LOCALE, { dateStyle: 'medium', timeZone: range.timezone });
  const from = format.format(new Date(range.start));
  const to = format.format(new Date(new Date(range.end).getTime() - 1));
  return from === to ? from : `${from} – ${to}`;
};

export const flagEmoji = (code) => {
  if (!/^[A-Za-z]{2}$/.test(code || '')) return '';
  return String.fromCodePoint(
    ...code
      .toUpperCase()
      .split('')
      .map((char) => 127397 + char.charCodeAt(0))
  );
};

const regionNames = new Intl.DisplayNames(['ar'], { type: 'region' });

export const countryName = (code) => {
  if (!/^[A-Za-z]{2}$/.test(code || '')) return t('Unknown');
  try {
    return regionNames.of(code.toUpperCase()) || code;
  } catch (error) {
    return code;
  }
};

export const pageLabel = (path) => (path === '/' ? t('Home') : path);

export const capitalize = (value) =>
  value ? value.charAt(0).toUpperCase() + value.slice(1) : '';

const EVENT_TITLES = {
  CTA_CLICK: 'CTA click',
  VIDEO_PLAY: 'Video play',
  FORM_SUBMIT: 'Form submit'
};

export const eventTitle = (name) =>
  EVENT_TITLES[name]
    ? t(EVENT_TITLES[name])
    : capitalize(String(name).replace(/[_:.-]+/g, ' ').toLowerCase());