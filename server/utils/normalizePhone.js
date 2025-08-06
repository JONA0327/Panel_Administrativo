function normalizePhone(phone = '') {
  return String(phone)
    .replace(/@[^\s]+$/, '')
    .replace(/\D/g, '');
}

module.exports = { normalizePhone };
