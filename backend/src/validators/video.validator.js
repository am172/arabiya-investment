const {
  isHttpUrl,
  checkString,
  checkNumber,
  checkBoolean,
  checkEnum,
  checkUrl,
  checkAsset,
  checkHasFields
} = require('./common.validator');

const FIELDS = [
  'title',
  'description',
  'studentName',
  'studentAge',
  'source',
  'videoUrl',
  'videoPublicId',
  'thumbnail',
  'duration',
  'isFeatured',
  'order',
  'isActive'
];
const SOURCES = ['upload', 'youtube', 'vimeo'];
const HOSTS = {
  youtube: ['youtube.com', 'www.youtube.com', 'm.youtube.com', 'youtu.be', 'www.youtube-nocookie.com'],
  vimeo: ['vimeo.com', 'www.vimeo.com', 'player.vimeo.com']
};

const checkSourceHost = (body, errors) => {
  const hosts = HOSTS[body.source];
  if (!hosts || typeof body.videoUrl !== 'string' || !isHttpUrl(body.videoUrl.trim())) return;
  const host = new URL(body.videoUrl.trim()).hostname.toLowerCase();
  if (!hosts.includes(host)) {
    errors.push({ field: 'videoUrl', message: `videoUrl must be a ${body.source} link` });
  }
};

const build = (isCreate) => (body) => {
  const errors = [];
  const base = { required: isCreate, nonEmpty: true };

  if (!isCreate) checkHasFields(body, FIELDS, errors);

  checkString(body, 'title', { ...base, max: 150 }, errors);
  checkString(body, 'description', { max: 500 }, errors);
  checkString(body, 'studentName', { max: 100 }, errors);
  checkNumber(body, 'studentAge', { min: 3, max: 18, integer: true }, errors);
  checkEnum(body, 'source', SOURCES, errors);
  checkUrl(body, 'videoUrl', { required: isCreate, allowEmpty: false, max: 1000 }, errors);
  checkString(body, 'videoPublicId', { max: 300 }, errors);
  checkAsset(body, 'thumbnail', { required: false }, errors);
  checkNumber(body, 'duration', { min: 0 }, errors);
  checkBoolean(body, 'isFeatured', errors);
  checkNumber(body, 'order', {}, errors);
  checkBoolean(body, 'isActive', errors);
  checkSourceHost(body, errors);

  return errors;
};

module.exports = {
  validateCreateVideo: build(true),
  validateUpdateVideo: build(false)
};