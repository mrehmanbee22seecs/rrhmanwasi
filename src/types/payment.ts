/**
 * Payment types and interfaces for subscription payments
 * Supports multiple payment gateways for Pakistan and international users
 */

export type PaymentMethod = 
  | 'jazzcash' 
  | 'easypaisa' 
  | 'bank_transfer' 
  | 'payfast' 
  | 'card'
  | 'manual';

export type PaymentStatus = 
  | 'pending' 
  | 'processing' 
  | 'completed' 
  | 'failed' 
  | 'refunded';

export interface PaymentTransaction {
  id: string;
  userId: string;
  amount: number;
  currency: string;
  method: PaymentMethod;
  status: PaymentStatus;
  tier: string;
  transactionId?: string;
  referenceNumber?: string;
  receiptUrl?: string;
  createdAt: any;
  completedAt?: any;
  metadata?: {
    email?: string;
    phone?: string;
    gatewayResponse?: any;
  };
}

export interface PaymentGatewayConfig {
  id: string;
  name: string;
  displayName: string;
  description: string;
  icon: string;
  available: boolean;
  countries: string[];
  acceptsInternational: boolean;
  processingTime: string;
  fees: string;
  instructions?: string;
}

// Payment gateway configurations
export const PAYMENT_GATEWAYS: Record<string, PaymentGatewayConfig> = {
  jazzcash: {
    id: 'jazzcash',
    name: 'JazzCash',
    displayName: 'JazzCash Mobile Wallet',
    description: 'Pay instantly using JazzCash mobile wallet',
    icon: '📱',
    available: true,
    countries: ['PK'],
    acceptsInternational: false,
    processingTime: 'Instant',
    fees: '0% (we cover the fees)',
    instructions: 'Send payment to JazzCash number and enter transaction ID',
  },
  easypaisa: {
    id: 'easypaisa',
    name: 'Easypaisa',
    displayName: 'Easypaisa Mobile Wallet',
    description: 'Pay instantly using Easypaisa mobile wallet',
    icon: '💳',
    available: true,
    countries: ['PK'],
    acceptsInternational: false,
    processingTime: 'Instant',
    fees: '0% (we cover the fees)',
    instructions: 'Send payment to Easypaisa number and enter transaction ID',
  },
  bank_transfer: {
    id: 'bank_transfer',
    name: 'Bank Transfer',
    displayName: 'Direct Bank Transfer',
    description: 'Transfer directly to our bank account',
    icon: '🏦',
    available: true,
    countries: ['PK'],
    acceptsInternational: true,
    processingTime: '1-2 business days',
    fees: 'Standard bank fees apply',
    instructions: 'Transfer to our bank account and upload receipt',
  },
  payfast: {
    id: 'payfast',
    name: 'PayFast',
    displayName: 'Credit/Debit Card (PayFast)',
    description: 'Pay securely with any credit or debit card',
    icon: '💳',
    available: false, // Will be enabled when configured
    countries: ['PK', 'GLOBAL'],
    acceptsInternational: true,
    processingTime: 'Instant',
    fees: '2.9% + PKR 15',
    instructions: 'Click to pay securely with your card',
  },
  card: {
    id: 'card',
    name: 'International Card',
    displayName: 'International Credit/Debit Card',
    description: 'For international customers',
    icon: '🌍',
    available: false, // Will be enabled when configured
    countries: ['GLOBAL'],
    acceptsInternational: true,
    processingTime: 'Instant',
    fees: '2.9% + $0.30',
    instructions: 'Pay securely with your international card',
  },
  manual: {
    id: 'manual',
    name: 'Manual Verification',
    displayName: 'Manual Payment Verification',
    description: 'Send payment proof for manual verification',
    icon: '📧',
    available: true,
    countries: ['GLOBAL'],
    acceptsInternational: true,
    processingTime: 'Up to 24 hours',
    fees: '0%',
    instructions: 'Send payment and proof to our email',
  },
};

// Payment account details
export const PAYMENT_ACCOUNTS = {
  jazzcash: {
    number: '03001234567', // TODO: Replace with actual JazzCash number before production
    name: 'Wasilah Foundation',
  },
  easypaisa: {
    number: '03349682146',
    name: 'Wasilah Foundation',
  },
  bank: {
    accountNumber: '19367902143803',
    bankName: 'Habib Bank Limited',
    accountTitle: 'Wasilah Foundation',
    iban: 'PK36HABB0019367902143803',
    branchCode: '1936',
  },
  email: {
    billing: 'billing@wasilah.org',
    support: 'support@wasilah.org',
  },
};
