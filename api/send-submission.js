/**
 * Vercel Serverless Function for Submission Confirmation Email
 * 
 * This endpoint sends a confirmation email when a project/event is submitted.
 */

import { MailerSend, EmailParams, Sender, Recipient } from 'mailersend';

// Initialize MailerSend
const mailerSend = new MailerSend({
  apiKey: process.env.MAILERSEND_API_KEY || '',
});

const SENDER_EMAIL = process.env.MAILERSEND_SENDER_EMAIL || 'MS_qJLYQi@trial-0r83ql3jjz8lgwpz.mlsender.net';
const SENDER_NAME = 'Wasillah Team';

// Brand styling for emails
const brand = {
  gradient: 'linear-gradient(135deg, #FF6B9D, #00D9FF)',
  headerBg: '#0F0F23',
  textDark: '#2C3E50',
  textLight: '#ffffff'
};

/**
 * Main handler for the serverless function
 */
export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, name, projectName, type } = req.body;

    // Validate required fields
    if (!email || !name || !projectName || !type) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        received: { email, name, projectName, type }
      });
    }

    const typeLabel = type === 'project' ? 'Project' : 'Event';

    // Create email HTML
    const html = `
      <div style="font-family: Inter, Arial, sans-serif; max-width: 640px; margin: 0 auto; background: #f8fafc;">
        <div style="background: ${brand.gradient}; padding: 30px 20px; text-align: center;">
          <h1 style="color: ${brand.textLight}; margin: 0; font-size: 28px;">Submission Received</h1>
        </div>
        
        <div style="background: #ffffff; padding: 30px 24px;">
          <p style="color: ${brand.textDark}; font-size: 16px; line-height: 1.6;">
            Hi <strong>${name}</strong>,
          </p>
          
          <p style="color: ${brand.textDark}; font-size: 16px; line-height: 1.6;">
            Your submission for "<strong>${projectName}</strong>" has been received and is under review.
          </p>
          
          <p style="color: ${brand.textDark}; font-size: 16px; line-height: 1.6;">
            You'll be notified once it's approved.
          </p>
          
          <div style="background: #f1f5f9; border-radius: 12px; padding: 20px; margin: 24px 0;">
            <p style="margin: 0; color: #0f172a; font-size: 15px;">
              <strong>Type:</strong> ${typeLabel}
            </p>
            <p style="margin: 8px 0 0; color: #334155; font-size: 15px;">
              <strong>Title:</strong> ${projectName}
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

    // Send the email
    const sentFrom = new Sender(SENDER_EMAIL, SENDER_NAME);
    const recipients = [new Recipient(email)];

    const emailParams = new EmailParams()
      .setFrom(sentFrom)
      .setTo(recipients)
      .setSubject(`${typeLabel} Submission Received: ${projectName}`)
      .setHtml(html);

    await mailerSend.email.send(emailParams);

    console.log('Submission confirmation email sent successfully to:', email);

    return res.status(200).json({
      success: true,
      message: 'Submission confirmation email sent successfully'
    });

  } catch (error) {
    console.error('Error sending submission email:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
}
