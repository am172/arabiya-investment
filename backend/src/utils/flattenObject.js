const isPlainObject = (value) =>
  value !== null && typeof value === 'object' && !Array.isArray(value);

const flattenObject = (source, prefix = '') =>
  Object.keys(source).reduce((acc, key) => {
    if (key.startsWith('$') || key.includes('.')) return acc;
    const path = prefix ? `${prefix}.${key}` : key;
    const value = source[key];
    if (isPlainObject(value) && Object.keys(value).length > 0) {
      Object.assign(acc, flattenObject(value, path));
    } else {
      acc[path] = value;
    }
    return acc;
  }, {});

module.exports = flattenObject;