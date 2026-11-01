const pick = (source, keys) =>
  keys.reduce((acc, key) => {
    if (source && Object.prototype.hasOwnProperty.call(source, key) && source[key] !== undefined) {
      acc[key] = source[key];
    }
    return acc;
  }, {});

module.exports = pick;