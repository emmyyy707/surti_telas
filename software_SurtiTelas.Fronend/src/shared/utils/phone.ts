export function isValidPhone(phone: string | null | undefined): boolean {
  if (!phone || !phone.trim()) return true;
  const cleaned = phone.replace(/[\s\-()]/g, '');
  if (cleaned.startsWith('+57')) {
    const withoutCountry = cleaned.slice(3);
    return /^\d{10}$/.test(withoutCountry);
  }
  if (cleaned.startsWith('57') && cleaned.length === 12) {
    return /^57\d{10}$/.test(cleaned);
  }
  return /^\d{10}$/.test(cleaned);
}

export function normalizePhone(phone: string | null | undefined): string | null {
  if (!phone || !phone.trim()) return null;
  const cleaned = phone.replace(/[\s\-()]/g, '');
  if (cleaned.startsWith('+57')) return cleaned;
  if (cleaned.startsWith('57') && cleaned.length === 12) return cleaned;
  return cleaned;
}

export function formatPhoneDisplay(phone: string | null | undefined): string {
  if (!phone || !phone.trim()) return '';
  const cleaned = phone.replace(/[\s\-()]/g, '');
  if (cleaned.startsWith('+57') && cleaned.length === 13) {
    const digits = cleaned.slice(3);
    return `+57 ${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`;
  }
  if (cleaned.length === 10) {
    return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`;
  }
  return cleaned;
}
