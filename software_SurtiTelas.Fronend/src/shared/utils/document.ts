export function isValidNit(nit: string | null | undefined): boolean {
  if (!nit || !nit.trim()) return false;
  const cleaned = nit.replace(/\s+/g, '').replace(/-/g, '');
  if (!/^\d+$/.test(cleaned)) return false;
  if (cleaned.length < 9 || cleaned.length > 12) return false;
  return true;
}

export function normalizeNit(nit: string | null | undefined): string | null {
  if (!nit || !nit.trim()) return null;
  return nit.replace(/\s+/g, '').replace(/-/g, '').trim();
}

export function formatNitDisplay(nit: string | null | undefined): string {
  if (!nit || !nit.trim()) return '';
  const cleaned = nit.replace(/\s+/g, '').replace(/-/g, '').trim();
  if (cleaned.length >= 10) {
    return `${cleaned.slice(0, cleaned.length - 1)}-${cleaned.slice(cleaned.length - 1)}`;
  }
  return cleaned;
}

export function isValidDocumentNumber(value: string | null | undefined, type?: string | null): boolean {
  if (!value || !value.trim()) return false;
  const cleaned = value.trim();
  const upperType = type?.toUpperCase();

  if (upperType === 'CC' || upperType === 'CE') {
    return /^\d{5,12}$/.test(cleaned);
  }
  if (upperType === 'NIE') {
    return /^[A-Z]\d{7,8}[A-Z0-9]$/i.test(cleaned);
  }
  if (upperType === 'PASSPORT') {
    return cleaned.length >= 3 && cleaned.length <= 20;
  }
  return cleaned.length >= 3 && cleaned.length <= 20;
}

export function normalizeDocumentNumber(value: string | null | undefined): string | null {
  if (!value || !value.trim()) return null;
  return value.trim().toUpperCase();
}
