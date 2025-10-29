/**
 * Vercel Serverless Function for Approval Email
 * 
 * This endpoint sends an approval email when a project/event is approved.
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
    const { email, name, projectName, type, origin } = req.body;

    // Validate required fields
    if (!email || !name || !projectName || !type) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        received: { email, name, projectName, type }
      });
    }

    const typeLabel = type === 'project' ? 'project' : 'event';
    const baseUrl = origin || 'https://yourdomain.com'; // Replace with actual domain

    // Create email HTML
    const html = `
      <div style="font-family: Inter, Arial, sans-serif; max-width: 640px; margin: 0 auto; background: #f8fafc;">
        <div style="background: linear-gradient(135deg, #10B981, #34D399); padding: 30px 20px; text-align: center;">
          <h1 style="color: ${brand.textLight}; margin: 0; font-size: 28px;">🎉 Approved!</h1>
        </div>
        
        <div style="background: #ffffff; padding: 30px 24px;">
          <p style="color: ${brand.textDark}; font-size: 16px; line-height: 1.6;">
            Hi <strong>${name}</strong>,
          </p>
          
          <p style="color: ${brand.textDark}; font-size: 16px; line-height: 1.6;">
            Great news! Your ${typeLabel} "<strong>${projectName}</strong>" has been approved.
          </p>
          
          <p style="color: ${brand.textDark}; font-size: 16px; line-height: 1.6;">
            Thank you for contributing to Wasillah. Your ${typeLabel} is now live and visible to the community!
          </p>
          
          <div style="margin: 30px 0; text-align: center;">
            <a href="${baseUrl}/dashboard" 
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

    // Send the email
    const sentFrom = new Sender(SENDER_EMAIL, SENDER_NAME);
    const recipients = [new Recipient(email)];

    const emailParams = new EmailParams()
      .setFrom(sentFrom)
      .setTo(recipients)
      .setSubject(`Great News! Your ${typeLabel} "${projectName}" has been approved`)
      .setHtml(html);

    await mailerSend.email.send(emailParams);

    console.log('Approval email sent successfully to:', email);

    return res.status(200).json({
      success: true,
      message: 'Approval email sent successfully'
    });

  } catch (error) {
    console.error('Error sending approval email:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
}
