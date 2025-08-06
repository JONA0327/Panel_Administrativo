export function normalizePhone(phone = '') {
  return String(phone)
    .replace(/@s\.whatsapp\.net$/, '')
    .replace(/\D/g, '');
}
