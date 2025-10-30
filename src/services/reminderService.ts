/**
 * Reminder Scheduling Service using Upstash QStash
 * 
 * This service handles scheduling of reminder emails using Upstash QStash
 * for delayed HTTP requests.
 */

import { Client } from '@upstash/qstash';
import { collection, addDoc, doc, updateDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import { sendReminderEmail } from './mailerSendEmailService';

// Initialize QStash client
const qstashToken = (import.meta as any)?.env?.VITE_QSTASH_TOKEN;
const qstashClient = qstashToken ? new Client({ token: qstashToken }) : null;

export interface ReminderData {
  email: string;
  name: string;
  projectName: string;
  message: string;
  scheduledAt: string; // ISO timestamp
  userId?: string;
}

export interface ReminderDocument extends ReminderData {
  id?: string;
  sent: boolean;
  createdAt: any;
  sentAt?: any;
  qstashMessageId?: string;
}

/**
 * Create a reminder and schedule it with QStash
 */
export async function createReminder(params: ReminderData): Promise<{
  success: boolean;
  reminderId?: string;
  error?: string;
}> {
  try {
    // Validate scheduledAt is in the future
    const scheduledDate = new Date(params.scheduledAt);
    const now = new Date();
    
    if (scheduledDate <= now) {
      return {
        success: false,
        error: 'Scheduled time must be in the future'
      };
    }

    // Store reminder in Firestore
    const reminderDoc: Omit<ReminderDocument, 'id'> = {
      email: params.email,
      name: params.name,
      projectName: params.projectName,
      message: params.message,
      scheduledAt: params.scheduledAt,
      userId: params.userId,
      sent: false,
      createdAt: serverTimestamp()
    };

    const docRef = await addDoc(collection(db, 'reminders'), reminderDoc);
    console.log('Reminder stored in Firestore with ID:', docRef.id);

    // Schedule with QStash if configured
    if (qstashClient) {
      try {
        // Calculate delay in seconds
        const delaySeconds = Math.floor((scheduledDate.getTime() - now.getTime()) / 1000);
        
        // Get the base URL for the API endpoint
        // Use window.location.origin if available, otherwise use environment variable or default
        const baseUrl = typeof window !== 'undefined' && window.location?.origin 
          ? window.location.origin 
          : (import.meta as any)?.env?.VITE_APP_URL || 'https://your-domain.vercel.app';
        const callbackUrl = `${baseUrl}/api/send-reminder`;
        
        console.log('Scheduling reminder with QStash:');
        console.log('  - Callback URL:', callbackUrl);
        console.log('  - Delay:', delaySeconds, 'seconds');
        console.log('  - Scheduled time:', scheduledDate.toISOString());
        
        // Schedule the reminder with QStash
        const response = await qstashClient.publishJSON({
          url: callbackUrl,
          body: {
            reminderId: docRef.id,
            email: params.email,
            name: params.name,
            projectName: params.projectName,
            message: params.message
          },
          delay: delaySeconds
        });

        // Update Firestore with QStash message ID
        await updateDoc(doc(db, 'reminders', docRef.id), {
          qstashMessageId: response.messageId
        });

        console.log('✅ Reminder scheduled with QStash successfully!');
        console.log('  - Message ID:', response.messageId);
        console.log('  - Reminder ID:', docRef.id);
      } catch (qstashError: any) {
        console.error('❌ Failed to schedule with QStash:', qstashError);
        console.error('QStash error details:', {
          message: qstashError.message,
          status: qstashError.status,
          error: qstashError
        });
        return {
          success: false,
          error: `QStash scheduling failed: ${qstashError.message || 'Unknown error'}`
        };
      }
    } else {
      console.error('❌ QStash not configured! VITE_QSTASH_TOKEN environment variable is missing.');
      console.error('Reminder stored in Firestore but will NOT be sent automatically.');
      return {
        success: false,
        error: 'QStash not configured. Set VITE_QSTASH_TOKEN environment variable.'
      };
    }

    return {
      success: true,
      reminderId: docRef.id
    };
  } catch (error) {
    console.error('Failed to create reminder:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Send a reminder email immediately (called by QStash callback or periodic check)
 */
export async function sendReminder(reminderId: string): Promise<boolean> {
  try {
    // Get reminder from Firestore
    const reminderRef = doc(db, 'reminders', reminderId);
    const reminderSnap = await getDoc(reminderRef);

    if (!reminderSnap.exists()) {
      console.error('Reminder not found:', reminderId);
      return false;
    }

    const reminder = reminderSnap.data() as ReminderDocument;

    // Check if already sent
    if (reminder.sent) {
      console.log('Reminder already sent:', reminderId);
      return true;
    }

    // Send the email
    const success = await sendReminderEmail({
      email: reminder.email,
      name: reminder.name,
      projectName: reminder.projectName,
      message: reminder.message
    });

    if (success) {
      // Mark as sent
      await updateDoc(reminderRef, {
        sent: true,
        sentAt: serverTimestamp()
      });
      console.log('Reminder sent and marked as complete:', reminderId);
      return true;
    } else {
      console.error('Failed to send reminder email:', reminderId);
      return false;
    }
  } catch (error) {
    console.error('Error sending reminder:', error);
    return false;
  }
}

/**
 * Check for due reminders (fallback if QStash is not configured)
 * This should be called periodically by a backend service or Firebase Function
 */
export async function checkDueReminders(): Promise<void> {
  // This would typically run in a Firebase Function on a schedule
  // For now, it's here as a reference implementation
  console.log('Checking for due reminders...');
  
  // Note: This requires Firebase Functions with scheduled triggers
  // or a separate backend service
}

/**
 * Check if QStash is properly configured
 */
export function isQStashConfigured(): boolean {
  return !!qstashClient;
}

export default {
  createReminder,
  sendReminder,
  checkDueReminders,
  isQStashConfigured
};
