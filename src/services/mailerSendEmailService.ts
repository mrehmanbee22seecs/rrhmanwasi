/**
 * MailerSend Email Service for Wasillah Email Automation
 * 
 * This service handles all transactional emails using MailerSend API:
 * 1. Welcome emails on user signup
 * 2. Submission confirmations (projects/events)
 * 3. Admin approval notifications
 * 4. Volunteer form confirmations
 * 5. Custom reminders
 */

import { MailerSend, EmailParams, Sender, Recipient } from 'mailersend';

// Initialize MailerSend client
const mailerSendApiKey = (import.meta as any)?.env?.VITE_MAILERSEND_API_KEY;
const mailerSend = mailerSendApiKey ? new MailerSend({ apiKey: mailerSendApiKey }) : null;

// Use MailerSend's free trial domain for testing
// Replace with your own verified domain in production
const SENDER_EMAIL = 'MS_qJLYQi@trial-0r83ql3jjz8lgwpz.mlsender.net'; // MailerSend trial domain
const SENDER_NAME = 'Wasillah Team';

// Brand styling
const brand = {
  gradient: 'linear-gradient(135deg, #FF6B9D, #00D9FF)',
  headerBg: '#0F0F23',
  accent: '#FF6B9D',
  textDark: '#2C3E50',
  textLight: '#ffffff'
};

/**
 * Helper function to send email via MailerSend
 */
async function sendEmail(to: string, subject: string, html: string): Promise<boolean> {
  if (!mailerSend) {
    console.warn('MailerSend not configured, skipping email');
    return false;
  }

  try {
    const sentFrom = new Sender(SENDER_EMAIL, SENDER_NAME);
    const recipients = [new Recipient(to)];

    const emailParams = new EmailParams()
      .setFrom(sentFrom)
      .setTo(recipients)
      .setSubject(subject)
      .setHtml(html);

    await mailerSend.email.send(emailParams);
    console.log('Email sent via MailerSend to:', to);
    return true;
  } catch (error) {
    console.error('Failed to send email via MailerSend:', error);
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
  const html = `
    <div style="font-family: Inter, Arial, sans-serif; max-width: 640px; margin: 0 auto; background: #f8fafc;">
      <div style="background: ${brand.gradient}; padding: 30px 20px; text-align: center;">
        <h1 style="color: ${brand.textLight}; margin: 0; font-size: 28px;">Welcome to Wasillah!</h1>
      </div>
      
      <div style="background: #ffffff; padding: 30px 24px;">
        <p style="color: ${brand.textDark}; font-size: 16px; line-height: 1.6;">
          Hi <strong>${params.name}</strong>,
        </p>
        
        <p style="color: ${brand.textDark}; font-size: 16px; line-height: 1.6;">
          Welcome to Wasillah! We're excited to have you on board. 
        </p>
        
        <p style="color: ${brand.textDark}; font-size: 16px; line-height: 1.6;">
          Explore our projects, join events, and start making an impact today.
        </p>
        
        <div style="margin: 30px 0; text-align: center;">
          <a href="${window.location.origin}/projects" 
             style="display: inline-block; background: ${brand.accent}; color: ${brand.textLight}; 
                    padding: 14px 28px; border-radius: 8px; text-decoration: none; 
                    font-weight: 600; font-size: 16px;">
            Explore Projects
          </a>
        </div>
        
        <p style="color: ${brand.textDark}; font-size: 16px; line-height: 1.6; margin-top: 30px;">
          — The Wasillah Team
        </p>
      </div>
      
      <div style="background: ${brand.headerBg}; color: ${brand.textLight}; padding: 20px; text-align: center; font-size: 14px;">
        <p style="margin: 0;">Thank you for joining our community!</p>
      </div>
    </div>
  `;

  return sendEmail(params.email, 'Welcome to Wasillah!', html);
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
  const typeLabel = params.type === 'project' ? 'Project' : 'Event';

  const html = `
    <div style="font-family: Inter, Arial, sans-serif; max-width: 640px; margin: 0 auto; background: #f8fafc;">
      <div style="background: ${brand.gradient}; padding: 30px 20px; text-align: center;">
        <h1 style="color: ${brand.textLight}; margin: 0; font-size: 28px;">Submission Received</h1>
      </div>
      
      <div style="background: #ffffff; padding: 30px 24px;">
        <p style="color: ${brand.textDark}; font-size: 16px; line-height: 1.6;">
          Hi <strong>${params.name}</strong>,
        </p>
        
        <p style="color: ${brand.textDark}; font-size: 16px; line-height: 1.6;">
          Your submission for "<strong>${params.projectName}</strong>" has been received and is under review.
        </p>
        
        <p style="color: ${brand.textDark}; font-size: 16px; line-height: 1.6;">
          You'll be notified once it's approved.
        </p>
        
        <div style="background: #f1f5f9; border-radius: 12px; padding: 20px; margin: 24px 0;">
          <p style="margin: 0; color: #0f172a; font-size: 15px;">
            <strong>Type:</strong> ${typeLabel}
          </p>
          <p style="margin: 8px 0 0; color: #334155; font-size: 15px;">
            <strong>Title:</strong> ${params.projectName}
          </p>
          <p style="margin: 8px 0 0; color: #334155; font-size: 15px;">
            <strong>Status:</strong> Under Review
          </p>
        </div>
        
        <p style="color: ${brand.textDark}; font-size: 16px; line-height: 1.6; margin-top: 30px;">
          — The Wasillah Team
        </p>
      </div>
      
      <div style="background: ${brand.headerBg}; color: ${brand.textLight}; padding: 20px; text-align: center; font-size: 14px;">
        <p style="margin: 0;">We'll review your submission and get back to you soon.</p>
      </div>
    </div>
  `;

  return sendEmail(params.email, `${typeLabel} Submission Received: ${params.projectName}`, html);
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
  const typeLabel = params.type === 'project' ? 'project' : 'event';

  const html = `
    <div style="font-family: Inter, Arial, sans-serif; max-width: 640px; margin: 0 auto; background: #f8fafc;">
      <div style="background: linear-gradient(135deg, #10B981, #34D399); padding: 30px 20px; text-align: center;">
        <h1 style="color: ${brand.textLight}; margin: 0; font-size: 28px;">🎉 Approved!</h1>
      </div>
      
      <div style="background: #ffffff; padding: 30px 24px;">
        <p style="color: ${brand.textDark}; font-size: 16px; line-height: 1.6;">
          Hi <strong>${params.name}</strong>,
        </p>
        
        <p style="color: ${brand.textDark}; font-size: 16px; line-height: 1.6;">
          Great news! Your ${typeLabel} "<strong>${params.projectName}</strong>" has been approved.
        </p>
        
        <p style="color: ${brand.textDark}; font-size: 16px; line-height: 1.6;">
          Thank you for contributing to Wasillah. Your ${typeLabel} is now live and visible to the community!
        </p>
        
        <div style="margin: 30px 0; text-align: center;">
          <a href="${window.location.origin}/dashboard" 
             style="display: inline-block; background: #10B981; color: ${brand.textLight}; 
                    padding: 14px 28px; border-radius: 8px; text-decoration: none; 
                    font-weight: 600; font-size: 16px;">
            View Dashboard
          </a>
        </div>
        
        <p style="color: ${brand.textDark}; font-size: 16px; line-height: 1.6; margin-top: 30px;">
          — The Wasillah Team
        </p>
      </div>
      
      <div style="background: ${brand.headerBg}; color: ${brand.textLight}; padding: 20px; text-align: center; font-size: 14px;">
        <p style="margin: 0;">Keep up the great work!</p>
      </div>
    </div>
  `;

  return sendEmail(params.email, `Great News! Your ${typeLabel} "${params.projectName}" has been approved`, html);
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
  const html = `
    <div style="font-family: Inter, Arial, sans-serif; max-width: 640px; margin: 0 auto; background: #f8fafc;">
      <div style="background: ${brand.gradient}; padding: 30px 20px; text-align: center;">
        <h1 style="color: ${brand.textLight}; margin: 0; font-size: 28px;">⏰ Reminder</h1>
      </div>
      
      <div style="background: #ffffff; padding: 30px 24px;">
        <p style="color: ${brand.textDark}; font-size: 16px; line-height: 1.6;">
          Hi <strong>${params.name}</strong>,
        </p>
        
        <p style="color: ${brand.textDark}; font-size: 16px; line-height: 1.6;">
          This is your reminder for <strong>${params.projectName}</strong>:
        </p>
        
        <div style="background: #FEF3C7; border-left: 4px solid #F59E0B; padding: 20px; margin: 24px 0; border-radius: 8px;">
          <p style="margin: 0; color: #78350F; font-size: 15px; line-height: 1.6;">
            ${params.message}
          </p>
        </div>
        
        <p style="color: ${brand.textDark}; font-size: 16px; line-height: 1.6; margin-top: 30px;">
          — Wasillah Team
        </p>
      </div>
      
      <div style="background: ${brand.headerBg}; color: ${brand.textLight}; padding: 20px; text-align: center; font-size: 14px;">
        <p style="margin: 0;">This is an automated reminder you set up.</p>
      </div>
    </div>
  `;

  return sendEmail(params.email, `Reminder: ${params.projectName}`, html);
}

/**
 * 5. Volunteer Form Confirmation
 */
export async function sendVolunteerConfirmation(params: {
  email: string;
  name: string;
}): Promise<boolean> {
  const html = `
    <div style="font-family: Inter, Arial, sans-serif; max-width: 640px; margin: 0 auto; background: #f8fafc;">
      <div style="background: ${brand.gradient}; padding: 30px 20px; text-align: center;">
        <h1 style="color: ${brand.textLight}; margin: 0; font-size: 28px;">💌 Thank You!</h1>
      </div>
      
      <div style="background: #ffffff; padding: 30px 24px;">
        <p style="color: ${brand.textDark}; font-size: 16px; line-height: 1.6;">
          Hi <strong>${params.name}</strong>,
        </p>
        
        <p style="color: ${brand.textDark}; font-size: 16px; line-height: 1.6;">
          Thank you for volunteering with Wasillah!
        </p>
        
        <p style="color: ${brand.textDark}; font-size: 16px; line-height: 1.6;">
          Your response has been recorded and we'll get back to you very soon.
        </p>
        
        <div style="background: #DBEAFE; border-radius: 12px; padding: 20px; margin: 24px 0;">
          <p style="margin: 0; color: #1E40AF; font-size: 15px; line-height: 1.6;">
            <strong>What's Next?</strong><br>
            Our team will review your application and reach out to you with more details about volunteer opportunities that match your interests and availability.
          </p>
        </div>
        
        <p style="color: ${brand.textDark}; font-size: 16px; line-height: 1.6; margin-top: 30px;">
          — The Wasillah Team
        </p>
      </div>
      
      <div style="background: ${brand.headerBg}; color: ${brand.textLight}; padding: 20px; text-align: center; font-size: 14px;">
        <p style="margin: 0;">We appreciate your willingness to make a difference!</p>
      </div>
    </div>
  `;

  return sendEmail(params.email, 'Thank You for Volunteering with Wasillah!', html);
}

/**
 * Check if MailerSend is properly configured
 */
export function isMailerSendConfigured(): boolean {
  return !!mailerSend;
}

export default {
  sendWelcomeEmail,
  sendSubmissionConfirmation,
  sendApprovalEmail,
  sendReminderEmail,
  sendVolunteerConfirmation,
  isMailerSendConfigured
};
