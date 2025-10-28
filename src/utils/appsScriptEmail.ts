/**
 * Apps Script Email Service for Wasillah
 * Handles communication with Google Apps Script email webhook
 */

const APPS_SCRIPT_URL = (import.meta as any)?.env?.VITE_APPS_SCRIPT_URL;
const APPS_SCRIPT_API_KEY = (import.meta as any)?.env?.VITE_APPS_SCRIPT_API_KEY;

export interface WelcomeEmailPayload {
  type: 'welcome';
  name: string;
  email: string;
  appUrl: string;
}

export interface SubmissionEmailPayload {
  type: 'submission';
  name: string;
  email: string;
  projectName: string;
  submissionUrl?: string;
}

export interface ApprovalEmailPayload {
  type: 'approval';
  name: string;
  email: string;
  projectName: string;
  projectUrl?: string;
}

export interface CreateReminderPayload {
  type: 'createReminder';
  userId: string;
  name: string;
  email: string;
  projectName: string;
  message: string;
  scheduledTimestampUTC: string; // ISO 8601 format
}

export interface ResendVerificationNotePayload {
  type: 'resendVerificationNote';
  name: string;
  email: string;
}

type EmailPayload = 
  | WelcomeEmailPayload 
  | SubmissionEmailPayload 
  | ApprovalEmailPayload 
  | CreateReminderPayload 
  | ResendVerificationNotePayload;

/**
 * Send email via Apps Script webhook
 */
export async function sendAppsScriptEmail(payload: EmailPayload): Promise<boolean> {
  if (!APPS_SCRIPT_URL) {
    console.warn('VITE_APPS_SCRIPT_URL not configured, email not sent');
    return false;
  }

  if (!APPS_SCRIPT_API_KEY) {
    console.warn('VITE_APPS_SCRIPT_API_KEY not configured, email not sent');
    return false;
  }

  try {
    const response = await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...payload,
        apiKey: APPS_SCRIPT_API_KEY,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Apps Script email error:', errorData);
      return false;
    }

    const result = await response.json();
    
    if (result.status === 'ok') {
      console.log('Email sent successfully:', payload.type);
      return true;
    } else {
      console.error('Apps Script email failed:', result.message || 'Unknown error');
      return false;
    }
  } catch (error) {
    console.error('Error calling Apps Script:', error);
    return false;
  }
}

/**
 * Send welcome email after signup
 */
export async function sendWelcomeEmail(name: string, email: string): Promise<boolean> {
  return sendAppsScriptEmail({
    type: 'welcome',
    name,
    email,
    appUrl: window.location.origin,
  });
}

/**
 * Send submission confirmation email
 */
export async function sendSubmissionEmail(
  name: string,
  email: string,
  projectName: string,
  submissionUrl?: string
): Promise<boolean> {
  return sendAppsScriptEmail({
    type: 'submission',
    name,
    email,
    projectName,
    submissionUrl,
  });
}

/**
 * Send approval email when admin approves a submission
 */
export async function sendApprovalEmail(
  name: string,
  email: string,
  projectName: string,
  projectUrl?: string
): Promise<boolean> {
  return sendAppsScriptEmail({
    type: 'approval',
    name,
    email,
    projectName,
    projectUrl,
  });
}

/**
 * Create a scheduled reminder
 */
export async function createReminder(
  userId: string,
  name: string,
  email: string,
  projectName: string,
  message: string,
  scheduledDate: Date
): Promise<boolean> {
  return sendAppsScriptEmail({
    type: 'createReminder',
    userId,
    name,
    email,
    projectName,
    message,
    scheduledTimestampUTC: scheduledDate.toISOString(),
  });
}

/**
 * Send resend verification note
 */
export async function sendResendVerificationNote(name: string, email: string): Promise<boolean> {
  return sendAppsScriptEmail({
    type: 'resendVerificationNote',
    name,
    email,
  });
}
