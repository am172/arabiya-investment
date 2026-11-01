import { buildLegalFallback } from '@/content/legal';

export const resolveLegal = (data, slug, t) => {
  const base = buildLegalFallback(t)[slug];
  if (!data || typeof data !== 'object' || !data.title) return base;

  return {
    title: data.title,
    intro: typeof data.intro === 'string' ? data.intro : '',
    sections: Array.isArray(data.sections) ? data.sections : [],
    updatedAt: data.updatedAt || null
  };
};

export const parseBody = (text) => {
  const blocks = [];
  let paragraph = [];
  let list = [];

  const flushParagraph = () => {
    if (paragraph.length > 0) blocks.push({ type: 'p', text: paragraph.join(' ') });
    paragraph = [];
  };
  const flushList = () => {
    if (list.length > 0) blocks.push({ type: 'ul', items: list });
    list = [];
  };

  String(text || '')
    .split(/\r?\n/)
    .forEach((raw) => {
      const line = raw.trim();
      if (!line) {
        flushParagraph();
        flushList();
        return;
      }
      if (/^[-•*]\s+/.test(line)) {
        flushParagraph();
        list.push(line.replace(/^[-•*]\s+/, ''));
        return;
      }
      flushList();
      paragraph.push(line);
    });

  flushParagraph();
  flushList();
  return blocks;
};

export const formatArabicDate = (value) => {
  if (!value) return '';
  try {
    return new Intl.DateTimeFormat('ar-EG', { dateStyle: 'long' }).format(new Date(value));
  } catch (error) {
    return '';
  }
};

export const toArabicNumber = (value) => {
  try {
    return new Intl.NumberFormat('ar-EG').format(value);
  } catch (error) {
    return String(value);
  }
};