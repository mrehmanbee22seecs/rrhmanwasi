/**
 * Vercel Serverless Function for Volunteer Confirmation Email
 * 
 * This endpoint sends a confirmation email when someone volunteers.
 */

import { MailerSend, EmailParams, Sender, Recipient } from 'mailersend';

// Initialize MailerSend
const mailerSend = new MailerSend({
  apiKey: process.env.MAILERSEND_API_KEY || '',
});

const SENDER_EMAIL = process.env.MAILERSEND_SENDER_EMAIL || 'MS_qJLYQi@test-ywj2lpn1kvpg7oqz.mlsender.net';
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
    const { email, name } = req.body;

    // Validate required fields
    if (!email || !name) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        received: { email, name }
      });
    }

    // Create email HTML
    const html = `
      <div style="font-family: Inter, Arial, sans-serif; max-width: 640px; margin: 0 auto; background: #f8fafc;">
        <div style="background: ${brand.gradient}; padding: 30px 20px; text-align: center;">
          <h1 style="color: ${brand.textLight}; margin: 0; font-size: 28px;">💌 Thank You!</h1>
        </div>
        
        <div style="background: #ffffff; padding: 30px 24px;">
          <p style="color: ${brand.textDark}; font-size: 16px; line-height: 1.6;">
            Hi <strong>${name}</strong>,
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

    // Send the email
    const sentFrom = new Sender(SENDER_EMAIL, SENDER_NAME);
    const recipients = [new Recipient(email)];

    const emailParams = new EmailParams()
      .setFrom(sentFrom)
      .setTo(recipients)
      .setSubject('Thank You for Volunteering with Wasillah!')
      .setHtml(html);

    await mailerSend.email.send(emailParams);

    console.log('Volunteer confirmation email sent successfully to:', email);

    return res.status(200).json({
      success: true,
      message: 'Volunteer confirmation email sent successfully'
    });

  } catch (error) {
    console.error('Error sending volunteer email:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
}
