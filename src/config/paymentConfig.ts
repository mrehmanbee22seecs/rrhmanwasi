/**
 * Payment configuration
 * For production, move sensitive values to environment variables
 */

// Exchange rate for USD to PKR
// Update this regularly or fetch from API
export const USD_TO_PKR_RATE = 280;

// Subscription expiration (in days)
export const SUBSCRIPTION_DURATION_DAYS = 30;

// Payment account numbers
// TODO: Move to environment variables before production deployment
export const JAZZCASH_NUMBER = import.meta.env.VITE_JAZZCASH_NUMBER || '03001234567';
export const EASYPAISA_NUMBER = import.meta.env.VITE_EASYPAISA_NUMBER || '03349682146';
export const BANK_ACCOUNT = import.meta.env.VITE_BANK_ACCOUNT || '19367902143803';
export const BANK_IBAN = import.meta.env.VITE_BANK_IBAN || 'PK36HABB0019367902143803';

// Email configuration
export const BILLING_EMAIL = import.meta.env.VITE_BILLING_EMAIL || 'billing@wasilah.org';
export const SUPPORT_EMAIL = import.meta.env.VITE_SUPPORT_EMAIL || 'support@wasilah.org';
