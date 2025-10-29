/**
 * Vercel Serverless Function for Welcome Email
 * 
 * This endpoint sends a welcome email when a user signs up.
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
  accent: '#FF6B9D',
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
    const { email, name, origin } = req.body;

    // Validate required fields
    if (!email || !name) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        received: { email, name }
      });
    }

    const baseUrl = origin || 'https://yourdomain.com'; // Replace with actual domain

    // Create email HTML
    const html = `
      <div style="font-family: Inter, Arial, sans-serif; max-width: 640px; margin: 0 auto; background: #f8fafc;">
        <div style="background: ${brand.gradient}; padding: 30px 20px; text-align: center;">
          <h1 style="color: ${brand.textLight}; margin: 0; font-size: 28px;">Welcome to Wasillah!</h1>
        </div>
        
        <div style="background: #ffffff; padding: 30px 24px;">
          <p style="color: ${brand.textDark}; font-size: 16px; line-height: 1.6;">
            Hi <strong>${name}</strong>,
          </p>
          
          <p style="color: ${brand.textDark}; font-size: 16px; line-height: 1.6;">
            Welcome to Wasillah! We're excited to have you on board. 
          </p>
          
          <p style="color: ${brand.textDark}; font-size: 16px; line-height: 1.6;">
            Explore our projects, join events, and start making an impact today.
          </p>
          
          <div style="margin: 30px 0; text-align: center;">
            <a href="${baseUrl}/projects" 
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

    // Send the email
    const sentFrom = new Sender(SENDER_EMAIL, SENDER_NAME);
    const recipients = [new Recipient(email)];

    const emailParams = new EmailParams()
      .setFrom(sentFrom)
      .setTo(recipients)
      .setSubject('Welcome to Wasillah!')
      .setHtml(html);

    await mailerSend.email.send(emailParams);

    console.log('Welcome email sent successfully to:', email);

    return res.status(200).json({
      success: true,
      message: 'Welcome email sent successfully'
    });

  } catch (error) {
    console.error('Error sending welcome email:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
}
