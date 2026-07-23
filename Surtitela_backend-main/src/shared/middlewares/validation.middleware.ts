import { Request, Response, NextFunction } from "express";

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

export function validateFieldsMiddleware(body: Record<string, unknown>, rules: ValidationRules) {
  return (req: Request, res: Response, next: NextFunction) => {
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

    if (errors.length) {
      return res.status(400).json({ status: "error", message: "Validación fallida", errors });
    }

    next();
  };
}

export const emailValidation = (value: string): boolean => {
  const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return pattern.test(value);
};

export const passwordValidation = (password: string): boolean => {
  return password.length >= 8;
};

export const documentTypeValidation = (type: string): boolean => {
  const validTypes = ["Cédula de ciudadanía", "Tarjeta de identidad", "Cédula de extranjería", "Pasaporte", "NIT"];
  return validTypes.includes(type);
};

export const validateUuid = (value: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(value);
};