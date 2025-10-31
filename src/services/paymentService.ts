/**
 * Payment service for handling subscription payments
 * Works entirely on Firebase Spark plan - no paid Firebase features required
 */

import { collection, addDoc, updateDoc, doc, serverTimestamp, query, where, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';
import { PaymentTransaction, PaymentMethod, PaymentStatus } from '../types/payment';
import { SubscriptionTier } from '../types/subscription';

interface CreatePaymentParams {
  userId: string;
  email: string;
  amount: number;
  tier: SubscriptionTier;
  method: PaymentMethod;
  transactionId?: string;
  referenceNumber?: string;
  phone?: string;
}

interface VerifyPaymentParams {
  paymentId: string;
  transactionId?: string;
  receiptUrl?: string;
  metadata?: any;
}

/**
 * Create a payment transaction record
 */
export const createPaymentTransaction = async (params: CreatePaymentParams): Promise<string> => {
  try {
    const paymentData: Omit<PaymentTransaction, 'id'> = {
      userId: params.userId,
      amount: params.amount,
      currency: 'USD',
      method: params.method,
      status: 'pending',
      tier: params.tier,
      transactionId: params.transactionId,
      referenceNumber: params.referenceNumber,
      createdAt: serverTimestamp(),
      metadata: {
        email: params.email,
        phone: params.phone,
      },
    };

    const paymentRef = await addDoc(collection(db, 'payment_transactions'), paymentData);
    return paymentRef.id;
  } catch (error) {
    console.error('Error creating payment transaction:', error);
    throw new Error('Failed to create payment transaction');
  }
};

/**
 * Update payment transaction status
 */
export const updatePaymentStatus = async (
  paymentId: string,
  status: PaymentStatus,
  metadata?: any
): Promise<void> => {
  try {
    const paymentRef = doc(db, 'payment_transactions', paymentId);
    const updateData: any = {
      status,
      ...(metadata && { metadata }),
    };

    if (status === 'completed') {
      updateData.completedAt = serverTimestamp();
    }

    await updateDoc(paymentRef, updateData);
  } catch (error) {
    console.error('Error updating payment status:', error);
    throw new Error('Failed to update payment status');
  }
};

/**
 * Verify and complete payment (instant activation)
 */
export const verifyAndCompletePayment = async (params: VerifyPaymentParams): Promise<void> => {
  try {
    const updateData: any = {
      status: 'completed',
      completedAt: serverTimestamp(),
    };

    if (params.transactionId) {
      updateData.transactionId = params.transactionId;
    }

    if (params.receiptUrl) {
      updateData.receiptUrl = params.receiptUrl;
    }

    if (params.metadata) {
      updateData['metadata.gatewayResponse'] = params.metadata;
    }

    const paymentRef = doc(db, 'payment_transactions', params.paymentId);
    await updateDoc(paymentRef, updateData);
  } catch (error) {
    console.error('Error verifying payment:', error);
    throw new Error('Failed to verify payment');
  }
};

/**
 * Get user's payment history
 */
export const getUserPayments = async (userId: string): Promise<PaymentTransaction[]> => {
  try {
    const paymentsQuery = query(
      collection(db, 'payment_transactions'),
      where('userId', '==', userId)
    );

    const snapshot = await getDocs(paymentsQuery);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as PaymentTransaction[];
  } catch (error) {
    console.error('Error fetching user payments:', error);
    return [];
  }
};

/**
 * Check if transaction ID is unique (prevent duplicate payments)
 */
export const isTransactionIdUnique = async (transactionId: string): Promise<boolean> => {
  try {
    const q = query(
      collection(db, 'payment_transactions'),
      where('transactionId', '==', transactionId)
    );

    const snapshot = await getDocs(q);
    return snapshot.empty;
  } catch (error) {
    console.error('Error checking transaction ID:', error);
    return false;
  }
};

/**
 * Calculate subscription price based on tier
 */
export const calculatePrice = (tier: SubscriptionTier): number => {
  const prices: Record<SubscriptionTier, number> = {
    free: 0,
    supporter: 5,
    champion: 15,
  };

  return prices[tier] || 0;
};

/**
 * Send payment notification email (using existing email service)
 */
export const sendPaymentNotificationEmail = async (
  email: string,
  tier: string,
  amount: number,
  transactionId: string
): Promise<void> => {
  // This will integrate with the existing MailerSend service
  console.log('Payment notification email:', { email, tier, amount, transactionId });
  // TODO: Integrate with mailerSendEmailService
};

/**
 * Create admin notification for manual verification
 */
export const createAdminPaymentNotification = async (
  paymentId: string,
  userEmail: string,
  tier: string,
  amount: number
): Promise<void> => {
  try {
    await addDoc(collection(db, 'admin_notifications'), {
      type: 'payment_verification',
      paymentId,
      userEmail,
      tier,
      amount,
      status: 'pending',
      createdAt: serverTimestamp(),
      read: false,
    });
  } catch (error) {
    console.error('Error creating admin notification:', error);
  }
};
