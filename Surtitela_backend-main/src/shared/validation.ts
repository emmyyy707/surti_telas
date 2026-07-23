export type ValidationRule = {
  required?: boolean;
  min?: number;
  max?: number;
  exact?: number;
  pattern?: RegExp;
  name?: string;
};

export type ValidationRules = Record<string, ValidationRule>;

export type ValidationError = {
  field: string;
  message: string;
};

function getStringValue(value: unknown): string {
  return value === undefined || value === null ? "" : String(value).trim();
}

export function validateFields(body: Record<string, unknown>, rules: ValidationRules): ValidationError[] {
  const errors: ValidationError[] = [];

  for (const [field, rule] of Object.entries(rules)) {
    const value = body[field];
    const text = getStringValue(value);
    const label = rule.name ?? field;

    if (rule.required && !text) {
      errors.push({ field, message: `Campo ${label} es requerido` });
      continue;
    }

    if (!text) {
      continue;
    }

    if (rule.min !== undefined && text.length < rule.min) {
      errors.push({ field, message: `Campo ${label} debe tener al menos ${rule.min} caracteres` });
    }

    if (rule.max !== undefined && text.length > rule.max) {
      errors.push({ field, message: `Campo ${label} debe tener como máximo ${rule.max} caracteres` });
    }

    if (rule.exact !== undefined && text.length !== rule.exact) {
      errors.push({ field, message: `Campo ${label} debe tener exactamente ${rule.exact} caracteres` });
    }

    if (rule.pattern && !rule.pattern.test(text)) {
      errors.push({ field, message: `Campo ${label} tiene formato inválido` });
    }
  }

  return errors;
}
