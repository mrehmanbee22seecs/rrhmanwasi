/**
 * Validation Utilities
 * Centralized validation functions for form inputs and data
 */

/**
 * Email validation
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
};

/**
 * Phone number validation (Pakistan format)
 * Accepts: +923001234567, 03001234567, 3001234567
 */
export const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^(\+92|0)?[0-9]{10}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
};

/**
 * URL validation
 */
export const isValidUrl = (url: string): boolean => {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
};

/**
 * String length validation
 */
export const isValidLength = (
  text: string,
  min: number,
  max?: number
): boolean => {
  const length = text.trim().length;
  if (max !== undefined) {
    return length >= min && length <= max;
  }
  return length >= min;
};

/**
 * Required field validation
 */
export const isRequired = (value: string | null | undefined): boolean => {
  return value !== null && value !== undefined && value.trim().length > 0;
};

/**
 * Number validation
 */
export const isValidNumber = (
  value: string | number,
  min?: number,
  max?: number
): boolean => {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(num)) return false;
  if (min !== undefined && num < min) return false;
  if (max !== undefined && num > max) return false;
  
  return true;
};

/**
 * Date validation
 */
export const isValidDate = (dateString: string): boolean => {
  const date = new Date(dateString);
  return !isNaN(date.getTime());
};

/**
 * Future date validation
 */
export const isFutureDate = (dateString: string): boolean => {
  const date = new Date(dateString);
  const now = new Date();
  return !isNaN(date.getTime()) && date > now;
};

/**
 * File validation
 */
export const isValidImageFile = (file: File, maxSizeMB = 5): boolean => {
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  
  return (
    validTypes.includes(file.type) &&
    file.size <= maxSizeBytes
  );
};

/**
 * Sanitize text input
 */
export const sanitizeText = (text: string): string => {
  return text
    .trim()
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, ''); // Remove script tags
};

/**
 * Validation error messages
 */
export const ValidationMessages = {
  REQUIRED: 'This field is required',
  INVALID_EMAIL: 'Please enter a valid email address',
  INVALID_PHONE: 'Please enter a valid phone number',
  INVALID_URL: 'Please enter a valid URL',
  TOO_SHORT: (min: number) => `Must be at least ${min} characters`,
  TOO_LONG: (max: number) => `Must be no more than ${max} characters`,
  INVALID_NUMBER: 'Please enter a valid number',
  INVALID_DATE: 'Please enter a valid date',
  MUST_BE_FUTURE: 'Date must be in the future',
  INVALID_FILE: 'Please select a valid image file',
  FILE_TOO_LARGE: (maxMB: number) => `File size must be less than ${maxMB}MB`,
};

/**
 * Validate form data
 */
export interface ValidationRule {
  validator: (value: any) => boolean;
  message: string;
}

export interface ValidationRules {
  [key: string]: ValidationRule[];
}

export interface ValidationErrors {
  [key: string]: string;
}

export const validateForm = (
  data: Record<string, any>,
  rules: ValidationRules
): ValidationErrors => {
  const errors: ValidationErrors = {};

  Object.keys(rules).forEach((field) => {
    const fieldRules = rules[field];
    const value = data[field];

    for (const rule of fieldRules) {
      if (!rule.validator(value)) {
        errors[field] = rule.message;
        break; // Stop at first error for this field
      }
    }
  });

  return errors;
};

/**
 * Common validation rule sets
 */
export const CommonRules = {
  email: [
    {
      validator: isRequired,
      message: ValidationMessages.REQUIRED,
    },
    {
      validator: isValidEmail,
      message: ValidationMessages.INVALID_EMAIL,
    },
  ],
  phone: [
    {
      validator: isRequired,
      message: ValidationMessages.REQUIRED,
    },
    {
      validator: isValidPhone,
      message: ValidationMessages.INVALID_PHONE,
    },
  ],
  requiredText: (min = 1, max?: number) => [
    {
      validator: isRequired,
      message: ValidationMessages.REQUIRED,
    },
    {
      validator: (value: string) => isValidLength(value, min, max),
      message: max
        ? `Must be between ${min} and ${max} characters`
        : ValidationMessages.TOO_SHORT(min),
    },
  ],
};

export default {
  isValidEmail,
  isValidPhone,
  isValidUrl,
  isValidLength,
  isRequired,
  isValidNumber,
  isValidDate,
  isFutureDate,
  isValidImageFile,
  sanitizeText,
  validateForm,
  ValidationMessages,
  CommonRules,
};
