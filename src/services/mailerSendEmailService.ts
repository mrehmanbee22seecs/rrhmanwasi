/**
 * MailerSend Email Service for Wasillah Email Automation
 * 
 * This service handles all transactional emails via backend API endpoints:
 * 1. Welcome emails on user signup
 * 2. Submission confirmations (projects/events)
 * 3. Admin approval notifications
 * 4. Volunteer form confirmations
 * 5. Custom reminders
 */

/**
 * Helper function to send email via backend API
 */
async function callEmailAPI(endpoint: string, data: any): Promise<boolean> {
  try {
    console.log(`📧 Calling email API: /api/${endpoint}`, data);
    
    const response = await fetch(`/api/${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Unknown error' }));
      console.error(`❌ Failed to send email via ${endpoint}:`, error);
      console.error(`   Status: ${response.status} ${response.statusText}`);
      return false;
    }

    const result = await response.json();
    console.log(`✅ Email sent successfully via ${endpoint}`, result);
    return true;
  } catch (error) {
    console.error(`❌ Error calling ${endpoint}:`, error);
    return false;
  }
}

/**
 * 1. Welcome Email - Sent on user signup
 */
export async function sendWelcomeEmail(params: {
  email: string;
  name: string;
}): Promise<boolean> {
  return callEmailAPI('send-welcome', {
    email: params.email,
    name: params.name,
    origin: window.location.origin,
  });
}

/**
 * 2. Submission Confirmation - Projects or Events
 */
export async function sendSubmissionConfirmation(params: {
  email: string;
  name: string;
  projectName: string;
  type: 'project' | 'event';
}): Promise<boolean> {
  return callEmailAPI('send-submission', {
    email: params.email,
    name: params.name,
    projectName: params.projectName,
    type: params.type,
  });
}

/**
 * 3. Admin Approval - Project or Event Accepted
 */
export async function sendApprovalEmail(params: {
  email: string;
  name: string;
  projectName: string;
  type: 'project' | 'event';
}): Promise<boolean> {
  return callEmailAPI('send-approval', {
    email: params.email,
    name: params.name,
    projectName: params.projectName,
    type: params.type,
    origin: window.location.origin,
  });
}

/**
 * 4. Custom Reminder Email
 */
export async function sendReminderEmail(params: {
  email: string;
  name: string;
  projectName: string;
  message: string;
}): Promise<boolean> {
  // Note: Reminders use the QStash system and go through /api/send-reminder
  // This function is kept for compatibility but the actual scheduling
  // is handled by the reminder service using Upstash QStash
  console.log('Reminder email will be sent via QStash at scheduled time');
  return true;
}

/**
 * 5. Volunteer Form Confirmation
 */
export async function sendVolunteerConfirmation(params: {
  email: string;
  name: string;
}): Promise<boolean> {
  return callEmailAPI('send-volunteer', {
    email: params.email,
    name: params.name,
  });
}

/**
 * 6. Contact Form Email to Admin
 */
export async function sendContactEmail(params: {
  name: string;
  email: string;
  subject: string;
  message: string;
}): Promise<boolean> {
  return callEmailAPI('send-contact', {
    name: params.name,
    email: params.email,
    subject: params.subject,
    message: params.message,
  });
}

/**
 * Check if MailerSend is properly configured
 */
export function isMailerSendConfigured(): boolean {
  // Always return true since we're using backend API endpoints
  return true;
}

export default {
  sendWelcomeEmail,
  sendSubmissionConfirmation,
  sendApprovalEmail,
  sendReminderEmail,
  sendVolunteerConfirmation,
  sendContactEmail,
  isMailerSendConfigured
};
