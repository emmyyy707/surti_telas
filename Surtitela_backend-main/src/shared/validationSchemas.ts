// Validation schemas for different entities

export const authLoginSchema = {
  email: { required: true, max: 100, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
  password: { required: true, min: 8, max: 128 },
};

export const authRegisterSchema = {
  name: { required: true, min: 3, max: 100 },
  last_name: { required: true, min: 3, max: 100 },
  email: { required: true, max: 100, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
  password: { required: true, min: 8, max: 128 },
  confirmPassword: { required: true, min: 8, max: 128 },
  phone: { max: 20 },
  document_type: { required: true, max: 50 },
  document_number: { required: true, max: 50 },
};

export const userCreateSchema = {
  name: { required: true, max: 50 },
  last_name: { required: true, max: 50 },
  email: { required: true, max: 100, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
  password: { required: true, min: 8, max: 128 },
  phone: { exact: 10, pattern: /^[0-9]+$/ },
  address: { max: 150 },
};

export const userUpdateSchema = {
  name: { max: 50 },
  last_name: { max: 50 },
  email: { max: 100, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
  password: { min: 8, max: 128 },
  phone: { exact: 10, pattern: /^[0-9]+$/ },
  address: { max: 150 },
};

// Add more schemas as needed