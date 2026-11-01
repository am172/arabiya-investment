const EMAIL = /^\S+@\S+\.\S+$/;
const PHONE = /^[+()\d\s-]{6,30}$/;

export const validateContact = (form, t) => {
  const errors = {};
  const name = form.name.trim();
  const message = form.message.trim();

  if (name.length < 2 || name.length > 100) errors.name = t('contact_errName');
  if (!EMAIL.test(form.email.trim())) errors.email = t('contact_errEmail');
  if (form.phone.trim() && !PHONE.test(form.phone.trim())) errors.phone = t('contact_errPhone');

  if (form.childAge !== '') {
    const age = Number(form.childAge);
    if (!Number.isInteger(age) || age < 1 || age > 18) errors.childAge = t('contact_errAge');
  }

  if (form.subject.trim().length > 150) errors.subject = t('contact_errSubject');

  if (message.length < 10) errors.message = t('contact_errMessageMin');
  else if (message.length > 2000) errors.message = t('contact_errMessageMax');

  return errors;
};

export const mapServerErrors = (errors) =>
  (errors || []).reduce((acc, item) => {
    if (item && item.field) acc[item.field] = item.message;
    return acc;
  }, {});