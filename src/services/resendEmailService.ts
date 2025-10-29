/**
 * Resend Email Service for Wasillah Email Automation
 * 
 * This service handles all transactional emails using Resend API:
 * 1. Welcome emails on user signup
 * 2. Submission confirmations (projects/events)
 * 3. Admin approval notifications
 * 4. Volunteer form confirmations
 * 5. Custom reminders
 */

import { Resend } from 'resend';

// Initialize Resend client
const resendApiKey = (import.meta as any)?.env?.VITE_RESEND_API_KEY;
const resend = resendApiKey ? new Resend(resendApiKey) : null;

const SENDER_EMAIL = 'noreply@wasillah.org'; // Update with your verified domain
const SENDER_NAME = 'Wasillah Team';
const FROM = `${SENDER_NAME} <${SENDER_EMAIL}>`;

// Brand styling
const brand = {
  gradient: 'linear-gradient(135deg, #FF6B9D, #00D9FF)',
  headerBg: '#0F0F23',
  accent: '#FF6B9D',
  textDark: '#2C3E50',
  textLight: '#ffffff'
};

/**
 * 1. Welcome Email - Sent on user signup
 */
export async function sendWelcomeEmail(params: {
  email: string;
  name: string;
}): Promise<boolean> {
  if (!resend) {
    console.warn('Resend not configured, skipping welcome email');
    return false;
  }

  try {
    await resend.emails.send({
      from: FROM,
      to: params.email,
      subject: 'Welcome to Wasillah!',
      html: `
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
      `
    });
    console.log('Welcome email sent to:', params.email);
    return true;
  } catch (error) {
    console.error('Failed to send welcome email:', error);
    return false;
  }
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
  if (!resend) {
    console.warn('Resend not configured, skipping submission confirmation email');
    return false;
  }

  const typeLabel = params.type === 'project' ? 'Project' : 'Event';

  try {
    await resend.emails.send({
      from: FROM,
      to: params.email,
      subject: `${typeLabel} Submission Received: ${params.projectName}`,
      html: `
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
      `
    });
    console.log('Submission confirmation email sent to:', params.email);
    return true;
  } catch (error) {
    console.error('Failed to send submission confirmation email:', error);
    return false;
  }
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
  if (!resend) {
    console.warn('Resend not configured, skipping approval email');
    return false;
  }

  const typeLabel = params.type === 'project' ? 'project' : 'event';

  try {
    await resend.emails.send({
      from: FROM,
      to: params.email,
      subject: `Great News! Your ${typeLabel} "${params.projectName}" has been approved`,
      html: `
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
      `
    });
    console.log('Approval email sent to:', params.email);
    return true;
  } catch (error) {
    console.error('Failed to send approval email:', error);
    return false;
  }
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
  if (!resend) {
    console.warn('Resend not configured, skipping reminder email');
    return false;
  }

  try {
    await resend.emails.send({
      from: FROM,
      to: params.email,
      subject: `Reminder: ${params.projectName}`,
      html: `
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
      `
    });
    console.log('Reminder email sent to:', params.email);
    return true;
  } catch (error) {
    console.error('Failed to send reminder email:', error);
    return false;
  }
}

/**
 * 5. Volunteer Form Confirmation
 */
export async function sendVolunteerConfirmation(params: {
  email: string;
  name: string;
}): Promise<boolean> {
  if (!resend) {
    console.warn('Resend not configured, skipping volunteer confirmation email');
    return false;
  }

  try {
    await resend.emails.send({
      from: FROM,
      to: params.email,
      subject: 'Thank You for Volunteering with Wasillah!',
      html: `
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
      `
    });
    console.log('Volunteer confirmation email sent to:', params.email);
    return true;
  } catch (error) {
    console.error('Failed to send volunteer confirmation email:', error);
    return false;
  }
}

/**
 * Check if Resend is properly configured
 */
export function isResendConfigured(): boolean {
  return !!resend;
}

export default {
  sendWelcomeEmail,
  sendSubmissionConfirmation,
  sendApprovalEmail,
  sendReminderEmail,
  sendVolunteerConfirmation,
  isResendConfigured
};
