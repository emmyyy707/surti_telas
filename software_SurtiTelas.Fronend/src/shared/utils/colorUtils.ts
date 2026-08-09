export type ColorShade = 'light' | 'dark' | 'default';

export interface ResolvedColor {
  label: string;
  value: string;
  shade: ColorShade;
}

const NAMED_COLORS: Record<string, string> = {
  rojo: '#dc2626',
  'rojo oscuro': '#991b1b',
  'rojo claro': '#fca5a5',
  azul: '#2563eb',
  'azul oscuro': '#1e3a8a',
  'azul claro': '#93c5fd',
  verde: '#16a34a',
  'verde oscuro': '#166534',
  'verde claro': '#86efac',
  amarillo: '#eab308',
  'amarillo claro': '#fde68a',
  naranja: '#f97316',
  'naranja claro': '#fdba74',
  negro: '#171717',
  blanco: '#fafafa',
  gris: '#6b7280',
  'gris claro': '#d1d5db',
  'gris oscuro': '#374151',
  morado: '#9333ea',
  'morado oscuro': '#6b21a8',
  rosa: '#ec4899',
  'rosa claro': '#f9a8d4',
  marron: '#92400e',
  'marrón oscuro': '#78350f',
  beige: '#d4cfc4',
  dorado: '#d4af37',
  plateado: '#9ca3af',
  turquesa: '#14b8a6',
  'turquesa claro': '#5eead4',
  vino: '#722f37',
  celeste: '#38bdf8',
  coral: '#f87171',
  salmón: '#fa8072',
  lavanda: '#a78bfa',
  menta: '#34d399',
  oliva: '#84cc16',
  'oliva oscuro': '#4d7c0f',
};

const CSS_NAMED_COLORS: Record<string, string> = {
  red: '#ef4444',
  'darkred': '#991b1b',
  'lightcoral': '#f08080',
  blue: '#3b82f6',
  'darkblue': '#1d4ed8',
  'lightblue': '#93c5fd',
  green: '#22c55e',
  'darkgreen': '#15803d',
  'lightgreen': '#86efac',
  yellow: '#eab308',
  orange: '#f97316',
  black: '#171717',
  white: '#fafafa',
  gray: '#6b7280',
  'lightgray': '#d1d5db',
  'darkgray': '#374151',
  purple: '#a855f7',
  pink: '#ec4899',
  brown: '#78350f',
  beige: '#d4cfc4',
  gold: '#d4af37',
  silver: '#9ca3af',
  turquoise: '#14b8a6',
  coral: '#f87171',
  salmon: '#fa8072',
  lavender: '#a78bfa',
  mint: '#34d399',
  olive: '#84cc16',
  crimson: '#dc2626',
  dodgerblue: '#1e90ff',
  forestgreen: '#228b22',
  hotpink: '#ff69b4',
  indigo: '#6366f1',
  magenta: '#d946ef',
  teal: '#14b8a6',
  tomato: '#ef4444',
};

const COLOR_NAMES_BY_HEX: Record<string, string> = {
  '#dc2626': 'Rojo',
  '#ef4444': 'Rojo',
  '#b91c1c': 'Rojo oscuro',
  '#fca5a5': 'Rojo claro',
  '#991b1b': 'Rojo oscuro',
  '#2563eb': 'Azul',
  '#3b82f6': 'Azul',
  '#1e3a8a': 'Azul oscuro',
  '#93c5fd': 'Azul claro',
  '#1e90ff': 'Azul',
  '#16a34a': 'Verde',
  '#22c55e': 'Verde',
  '#166534': 'Verde oscuro',
  '#86efac': 'Verde claro',
  '#15803d': 'Verde oscuro',
  '#228b22': 'Verde',
  '#eab308': 'Amarillo',
  '#fde68a': 'Amarillo claro',
  '#f97316': 'Naranja',
  '#fdba74': 'Naranja claro',
  '#171717': 'Negro',
  '#fafafa': 'Blanco',
  '#6b7280': 'Gris',
  '#d1d5db': 'Gris claro',
  '#374151': 'Gris oscuro',
  '#9333ea': 'Morado',
  '#6b21a8': 'Morado oscuro',
  '#ec4899': 'Rosa',
  '#f9a8d4': 'Rosa claro',
  '#92400e': 'Marrón',
  '#78350f': 'Marrón oscuro',
  '#d4cfc4': 'Beige',
  '#d4af37': 'Dorado',
  '#9ca3af': 'Plateado',
  '#14b8a6': 'Turquesa',
  '#5eead4': 'Turquesa claro',
  '#722f37': 'Vino',
  '#38bdf8': 'Celeste',
  '#f87171': 'Coral',
  '#fa8072': 'Salmón',
  '#a78bfa': 'Lavanda',
  '#34d399': 'Menta',
  '#84cc16': 'Oliva',
  '#4d7c0f': 'Oliva oscuro',
  '#facc15': 'Amarillo',
  '#0ea5e9': 'Celeste',
  '#fbbf24': 'Amarillo',
  '#10b981': 'Verde',
  '#059669': 'Verde',
  '#7e22ce': 'Morado',
};

const HEX_TO_RGB = (hex: string): { r: number; g: number; b: number } | null => {
  const normalized = hex.replace('#', '');
  if (!/^[0-9a-f]{3,8}$/i.test(normalized)) return null;

  const bigint = parseInt(normalized.slice(0, 6), 16);
  if (Number.isNaN(bigint)) return null;

  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return { r, g, b };
};

const RGB_DISTANCE = (a: { r: number; g: number; b: number }, b: { r: number; g: number; b: number }) =>
  Math.sqrt((a.r - b.r) ** 2 + (a.g - b.g) ** 2 + (a.b - b.b) ** 2);

const NEAREST_COLOR_NAME = (hex: string): string | null => {
  const target = HEX_TO_RGB(hex);
  if (!target) return null;

  const entries = Object.entries(COLOR_NAMES_BY_HEX);
  let best: { name: string; distance: number } | null = null;

  for (const [entryHex, name] of entries) {
    const source = HEX_TO_RGB(entryHex);
    if (!source) continue;
    const distance = RGB_DISTANCE(target, source);
    if (!best || distance < best.distance) {
      best = { name, distance };
    }
  }

  return best ? best.name : null;
};

function normalizeColorName(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

export function resolveColor(input: string): ResolvedColor | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  const normalized = normalizeColorName(trimmed);
  if (!normalized) return null;

  if (NAMED_COLORS[normalized]) {
    return {
      label: trimmed,
      value: NAMED_COLORS[normalized],
      shade: normalized.includes('claro') ? 'light' : normalized.includes('oscuro') ? 'dark' : 'default',
    };
  }

  if (CSS_NAMED_COLORS[normalized]) {
    return {
      label: trimmed,
      value: CSS_NAMED_COLORS[normalized],
      shade: normalized.includes('light') ? 'light' : normalized.includes('dark') ? 'dark' : 'default',
    };
  }

  const normalizedHex = /^#?([0-9a-f]{3,8})$/i.exec(normalized);
  if (normalizedHex) {
    const hex = `#${normalizedHex[1]}`;
    const nearest = NEAREST_COLOR_NAME(hex);
    return {
      label: nearest ?? trimmed,
      value: hex,
      shade: 'default',
    };
  }

  if (/^rgb\(/i.test(normalized)) {
    return { label: trimmed, value: normalized, shade: 'default' };
  }

  if (/^rgba\(/i.test(normalized)) {
    return { label: trimmed, value: normalized, shade: 'default' };
  }

  if (/^hsl\(/i.test(normalized)) {
    return { label: trimmed, value: normalized, shade: 'default' };
  }

  if (/^hsla\(/i.test(normalized)) {
    return { label: trimmed, value: normalized, shade: 'default' };
  }

  if (/^hwb\(/i.test(normalized)) {
    return { label: trimmed, value: normalized, shade: 'default' };
  }

  if (/^color\(/i.test(normalized)) {
    return { label: trimmed, value: normalized, shade: 'default' };
  }

  if (/^lab\(/i.test(normalized)) {
    return { label: trimmed, value: normalized, shade: 'default' };
  }

  if (/^oklab\(/i.test(normalized)) {
    return { label: trimmed, value: normalized, shade: 'default' };
  }

  if (/^lch\(/i.test(normalized)) {
    return { label: trimmed, value: normalized, shade: 'default' };
  }

  if (/^oklch\(/i.test(normalized)) {
    return { label: trimmed, value: normalized, shade: 'default' };
  }

  if (/^cmyk\(/i.test(normalized)) {
    return { label: trimmed, value: normalized, shade: 'default' };
  }

  if (/^#?[0-9a-f]{3,8}$/i.test(normalized)) {
    const hex = normalized.startsWith('#') ? normalized : `#${normalized}`;
    const nearest = NEAREST_COLOR_NAME(hex);
    return { label: nearest ?? trimmed, value: hex, shade: 'default' };
  }

  const fallback = `#${normalized.replace(/[^0-9a-f]/gi, '').slice(0, 6)}`;
  if (/^#[0-9a-f]{3,8}$/i.test(fallback)) {
    const nearest = NEAREST_COLOR_NAME(fallback);
    return { label: nearest ?? trimmed, value: fallback, shade: 'default' };
  }

  return null;
}

export function getColorSwatchStyle(color: string): React.CSSProperties {
  const resolved = resolveColor(color);
  if (!resolved) return {};

  return {
    backgroundColor: resolved.value,
    boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.08)',
  };
}

export function getColorContrastColor(color: string): string {
  const resolved = resolveColor(color);
  if (!resolved) return 'var(--color-text-primary)';

  const hex = resolved.value.replace('#', '');
  const r = parseInt(hex.slice(0, 2), 16) || 0;
  const g = parseInt(hex.slice(2, 4), 16) || 0;
  const b = parseInt(hex.slice(4, 6), 16) || 0;
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  return luminance > 0.6 ? 'rgba(0,0,0,0.75)' : 'rgba(255,255,255,0.9)';
}
