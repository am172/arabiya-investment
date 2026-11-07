const OBJECT_ID = /^[a-f\d]{24}$/i;
const FIELDS = ['title', 'lat', 'lng', 'offices', 'isActive'];

const push = (errors, field, message) => errors.push({ field, message });
const inRange = (value, limit) => typeof value === 'number' && Number.isFinite(value) && Math.abs(value) <= limit;
const empty = (value) => value === null || value === undefined;

const check = (body, errors, isCreate) => {
  if (isCreate || body.title !== undefined) {
    if (typeof body.title !== 'string' || !body.title.trim() || body.title.length > 100) {
      push(errors, 'title', 'The title is required (max 100)');
    }
  }
  if (isCreate || body.lat !== undefined) {
    if (!inRange(body.lat, 90)) push(errors, 'lat', 'Latitude must be between -90 and 90');
  }
  if (isCreate || body.lng !== undefined) {
    if (!inRange(body.lng, 180)) push(errors, 'lng', 'Longitude must be between -180 and 180');
  }
  if (body.isActive !== undefined && typeof body.isActive !== 'boolean') {
    push(errors, 'isActive', 'isActive must be a boolean');
  }
  if (body.offices !== undefined) {
    if (!Array.isArray(body.offices) || body.offices.length > 30) {
      push(errors, 'offices', 'Up to 30 offices per group');
      return;
    }
    body.offices.forEach((office, index) => {
      const path = `offices[${index}]`;
      if (!office || typeof office.name !== 'string' || !office.name.trim() || office.name.length > 120) {
        push(errors, `${path}.name`, 'The name is required');
        return;
      }
      const noLat = empty(office.lat);
      const noLng = empty(office.lng);
      if (noLat !== noLng || (!noLat && (!inRange(office.lat, 90) || !inRange(office.lng, 180)))) {
        push(errors, `${path}.lat`, 'Enter both valid coordinates or leave both empty');
      }
    });
  }
};

const validateCreateBranch = (body) => {
  const errors = [];
  check(body, errors, true);
  return errors;
};

const validateUpdateBranch = (body) => {
  const errors = [];
  if (!FIELDS.some((field) => body[field] !== undefined)) push(errors, 'body', 'No valid fields to update');
  check(body, errors, false);
  return errors;
};

const validateReorderBranches = (body) => {
  const errors = [];
  if (!Array.isArray(body.ids) || body.ids.length === 0 || body.ids.length > 100 || body.ids.some((id) => !OBJECT_ID.test(String(id)))) {
    push(errors, 'ids', 'ids must be a list of branch ids');
  }
  return errors;
};

module.exports = { validateCreateBranch, validateUpdateBranch, validateReorderBranches };