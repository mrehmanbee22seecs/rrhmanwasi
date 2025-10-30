/**
 * Vercel Serverless Function for Contact Form Email
 * 
 * This endpoint sends contact form messages to the admin email.
 */

import { MailerSend, EmailParams, Sender, Recipient } from 'mailersend';

// Initialize MailerSend
const mailerSend = new MailerSend({
  apiKey: process.env.MAILERSEND_API_KEY || '',
});

const SENDER_EMAIL = process.env.MAILERSEND_SENDER_EMAIL || 'noreply@test-ywj2lpn1kvpg7oqz.mlsender.net';
const SENDER_NAME = 'Wasillah Team';
const ADMIN_EMAIL = 'muneebtahir08@gmail.com';

/**
 * Main handler for the serverless function
 */
export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Check if MailerSend API key is configured
  if (!process.env.MAILERSEND_API_KEY) {
    console.error('MAILERSEND_API_KEY environment variable is not set');
    return res.status(500).json({
      error: 'Email service not configured',
      message: 'MAILERSEND_API_KEY environment variable is missing'
    });
  }

  try {
    const { name, email, subject, message } = req.body;

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        received: { name, email, subject, message }
      });
    }

    // Create email HTML
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #E67E22, #F39C12); padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">New Contact Message</h1>
          <p style="color: white; margin: 5px 0;">Wasillah Website</p>
        </div>
        
        <div style="padding: 20px; background: #f8f9fa;">
          <h2 style="color: #2C3E50; margin-bottom: 20px;">${subject}</h2>
          
          <div style="background: white; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
            <h3 style="color: #E67E22; margin-top: 0;">Contact Information:</h3>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
          </div>
          
          <div style="background: white; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
            <h3 style="color: #E67E22; margin-top: 0;">Message:</h3>
            <p style="background: #f1f2f6; padding: 15px; border-radius: 5px; line-height: 1.6;">${message}</p>
          </div>
          
          <div style="background: white; padding: 15px; border-radius: 8px;">
            <h3 style="color: #E67E22; margin-top: 0;">Message Details:</h3>
            <p><strong>Submitted:</strong> ${new Date().toLocaleString()}</p>
          </div>
        </div>
        
        <div style="background: #2C3E50; color: white; padding: 15px; text-align: center;">
          <p style="margin: 0;">This message was sent through the Wasillah contact form.</p>
        </div>
      </div>
    `;

    // Send the email to admin with reply-to set to user's email
    const sentFrom = new Sender(SENDER_EMAIL, SENDER_NAME);
    const recipients = [new Recipient(ADMIN_EMAIL)];
    const replyTo = new Recipient(email, name);

    const emailParams = new EmailParams()
      .setFrom(sentFrom)
      .setTo(recipients)
      .setReplyTo(replyTo)
      .setSubject(`Contact Form: ${subject}`)
      .setHtml(html);

    await mailerSend.email.send(emailParams);

    console.log('Contact form email sent successfully to admin:', ADMIN_EMAIL);

    return res.status(200).json({
      success: true,
      message: 'Contact email sent successfully'
    });

  } catch (error) {
    console.error('Error sending contact email:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
}
