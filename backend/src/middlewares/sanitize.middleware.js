const clean = (value) => {
  if (Array.isArray(value)) {
    value.forEach((item, index) => {
      value[index] = clean(item);
    });
    return value;
  }
  if (value && typeof value === 'object') {
    Object.keys(value).forEach((key) => {
      if (key.startsWith('$') || key.includes('.')) {
        delete value[key];
      } else {
        value[key] = clean(value[key]);
      }
    });
    return value;
  }
  return value;
};

const sanitize = (req, res, next) => {
  if (req.body) clean(req.body);
  if (req.query) clean(req.query);
  if (req.params) clean(req.params);
  next();
};

module.exports = sanitize;