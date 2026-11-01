import { rgbToHex, rgbToHsl } from './themeColors';

const SIZE = 96;
const MIN_DISTANCE = 64;
const MIN_SHARE = 0.015;

const loadImage = (src, cors) =>
  new Promise((resolve, reject) => {
    const image = new Image();
    if (cors) image.crossOrigin = 'anonymous';
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('load'));
    image.src = src;
  });

const distance = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);

export const extractPalette = async (src, { cors = false, count = 6 } = {}) => {
  const image = await loadImage(src, cors);
  const width = image.naturalWidth || 300;
  const height = image.naturalHeight || 300;
  const scale = Math.min(1, SIZE / Math.max(width, height));

  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(width * scale));
  canvas.height = Math.max(1, Math.round(height * scale));
  const context = canvas.getContext('2d', { willReadFrequently: true });
  context.drawImage(image, 0, 0, canvas.width, canvas.height);

  let data;
  try {
    data = context.getImageData(0, 0, canvas.width, canvas.height).data;
  } catch (error) {
    throw new Error('blocked');
  }

  const buckets = new Map();
  for (let index = 0; index < data.length; index += 4) {
    if (data[index + 3] < 140) continue;
    const r = data[index];
    const g = data[index + 1];
    const b = data[index + 2];
    const [, s, l] = rgbToHsl([r, g, b]);
    if (l > 0.94 && s < 0.2) continue;

    const weight = 0.12 + s * s * 1.8 * (l > 0.1 && l < 0.9 ? 1 : 0.3);
    const key = ((r >> 4) << 8) | ((g >> 4) << 4) | (b >> 4);
    const entry = buckets.get(key) || { r: 0, g: 0, b: 0, w: 0 };
    entry.r += r * weight;
    entry.g += g * weight;
    entry.b += b * weight;
    entry.w += weight;
    buckets.set(key, entry);
  }

  const list = [...buckets.values()]
    .map((entry) => ({ rgb: [entry.r / entry.w, entry.g / entry.w, entry.b / entry.w], w: entry.w }))
    .sort((a, b) => b.w - a.w);
  const total = list.reduce((sum, item) => sum + item.w, 0);
  if (!total) return [];

  const picks = [];
  for (const item of list) {
    if (picks.length >= count) break;
    if (item.w / total < MIN_SHARE) break;
    if (picks.every((pick) => distance(pick.rgb, item.rgb) > MIN_DISTANCE)) picks.push(item);
  }

  const sum = picks.reduce((n, pick) => n + pick.w, 0) || 1;
  return picks.map((pick) => ({ hex: rgbToHex(pick.rgb), share: pick.w / sum }));
};