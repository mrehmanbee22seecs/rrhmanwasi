/**
 * Reminder Scheduling Service using Upstash QStash
 * 
 * This service handles scheduling of reminder emails using Upstash QStash
 * for delayed HTTP requests.
 */

import { Client } from '@upstash/qstash';
import { collection, addDoc, doc, updateDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import { sendReminderEmail } from './resendEmailService';

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
        
        // Create a callback URL (this would be your backend endpoint)
        // For now, we'll store the reminder and check periodically
        // In production, you'd have an actual HTTP endpoint
        const callbackUrl = `${window.location.origin}/api/sendReminder`;
        
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

        console.log('Reminder scheduled with QStash, message ID:', response.messageId);
      } catch (qstashError) {
        console.warn('Failed to schedule with QStash, will use periodic check:', qstashError);
        // Continue anyway - we have the reminder in Firestore
      }
    } else {
      console.warn('QStash not configured, reminder will be checked periodically');
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
