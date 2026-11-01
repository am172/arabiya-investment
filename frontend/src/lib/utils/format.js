export const formatPrice = (value, currency = 'USD') => {
  const amount = Number(value) || 0;
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      maximumFractionDigits: Number.isInteger(amount) ? 0 : 2
    }).format(amount);
  } catch (error) {
    return `${currency} ${amount}`;
  }
};

