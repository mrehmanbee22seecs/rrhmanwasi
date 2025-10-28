/**
 * Complete Email System for Wasillah Web App (Firebase Spark Plan)
 * Google Apps Script Web App
 * 
 * SETUP INSTRUCTIONS:
 * 1. Create a new Google Apps Script project
 * 2. Copy this code into Code.gs
 * 3. Create a Google Sheet named "Reminders" with columns:
 *    id | userId | name | email | projectName | message | scheduledTimestampUTC | sent | sentTimestamp
 * 4. Create a Google Sheet named "EmailLogs" with columns:
 *    timestamp | type | recipient | status | error
 * 5. Set Script Properties (Project Settings > Script Properties):
 *    - SECRET_KEY: your-secret-api-key-here
 *    - REMINDERS_SHEET_ID: your-reminders-sheet-id
 *    - EMAIL_LOGS_SHEET_ID: your-email-logs-sheet-id
 *    - APP_URL: https://yourapp.com
 * 6. Deploy as Web App: Deploy > New deployment > Web app
 *    - Execute as: Me
 *    - Who has access: Anyone
 * 7. Create time-driven trigger: Triggers > Add Trigger
 *    - Function: sendScheduledReminders
 *    - Event source: Time-driven
 *    - Type: Minutes timer
 *    - Interval: Every 5 minutes
 */

// Rate limiting storage
var rateLimitStore = {};

function doPost(e) {
  try {
    var payload = JSON.parse(e.postData.contents);
    var props = PropertiesService.getScriptProperties();
    var secretKey = props.getProperty('SECRET_KEY');
    
    // Validate API key
    if (!payload.apiKey || payload.apiKey !== secretKey) {
      logEmail('unauthorized', '', 'FAILED', 'Invalid API key');
      return createJsonResponse({ status: 'error', message: 'Unauthorized' }, 401);
    }
    
    // Rate limiting check
    if (!checkRateLimit(payload.email)) {
      logEmail(payload.type || 'unknown', payload.email || '', 'RATE_LIMITED', 'Too many requests');
      return createJsonResponse({ status: 'error', message: 'Rate limit exceeded. Please try again later.' }, 429);
    }
    
    // Validate required fields
    if (!payload.type) {
      return createJsonResponse({ status: 'error', message: 'Missing required field: type' }, 400);
    }
    
    // Route based on type
    switch (payload.type) {
      case 'welcome':
        return handleWelcome(payload);
      case 'submission':
        return handleSubmission(payload);
      case 'approval':
        return handleApproval(payload);
      case 'createReminder':
        return handleCreateReminder(payload);
      case 'resendVerificationNote':
        return handleResendVerificationNote(payload);
      default:
        return createJsonResponse({ status: 'error', message: 'Unknown email type: ' + payload.type }, 400);
    }
  } catch (err) {
    Logger.log('doPost error: ' + err);
    logEmail('error', '', 'FAILED', String(err));
    return createJsonResponse({ status: 'error', message: String(err) }, 500);
  }
}

function handleWelcome(payload) {
  if (!payload.email || !payload.name) {
    return createJsonResponse({ status: 'error', message: 'Missing required fields: email, name' }, 400);
  }
  
  var template = renderTemplate('welcome', payload);
  var sanitizedHtml = sanitizeHtml(template.htmlBody);
  
  try {
    GmailApp.sendEmail(payload.email, template.subject, template.textBody, {
      htmlBody: sanitizedHtml,
      name: 'Wasillah Team'
    });
    logEmail('welcome', payload.email, 'SUCCESS', '');
    return createJsonResponse({ status: 'ok', message: 'Welcome email sent' });
  } catch (err) {
    logEmail('welcome', payload.email, 'FAILED', String(err));
    throw err;
  }
}

function handleSubmission(payload) {
  if (!payload.email || !payload.name || !payload.projectName) {
    return createJsonResponse({ status: 'error', message: 'Missing required fields: email, name, projectName' }, 400);
  }
  
  var template = renderTemplate('submission', payload);
  var sanitizedHtml = sanitizeHtml(template.htmlBody);
  
  try {
    GmailApp.sendEmail(payload.email, template.subject, template.textBody, {
      htmlBody: sanitizedHtml,
      name: 'Wasillah Team'
    });
    logEmail('submission', payload.email, 'SUCCESS', '');
    return createJsonResponse({ status: 'ok', message: 'Submission confirmation email sent' });
  } catch (err) {
    logEmail('submission', payload.email, 'FAILED', String(err));
    throw err;
  }
}

function handleApproval(payload) {
  if (!payload.email || !payload.name || !payload.projectName) {
    return createJsonResponse({ status: 'error', message: 'Missing required fields: email, name, projectName' }, 400);
  }
  
  var template = renderTemplate('approval', payload);
  var sanitizedHtml = sanitizeHtml(template.htmlBody);
  
  try {
    GmailApp.sendEmail(payload.email, template.subject, template.textBody, {
      htmlBody: sanitizedHtml,
      name: 'Wasillah Team'
    });
    logEmail('approval', payload.email, 'SUCCESS', '');
    return createJsonResponse({ status: 'ok', message: 'Approval email sent' });
  } catch (err) {
    logEmail('approval', payload.email, 'FAILED', String(err));
    throw err;
  }
}

function handleCreateReminder(payload) {
  if (!payload.email || !payload.userId || !payload.scheduledTimestampUTC || !payload.message) {
    return createJsonResponse({ status: 'error', message: 'Missing required fields: email, userId, scheduledTimestampUTC, message' }, 400);
  }
  
  try {
    var props = PropertiesService.getScriptProperties();
    var sheetId = props.getProperty('REMINDERS_SHEET_ID');
    
    if (!sheetId) {
      throw new Error('REMINDERS_SHEET_ID not configured in Script Properties');
    }
    
    var sheet = SpreadsheetApp.openById(sheetId).getSheetByName('Reminders');
    if (!sheet) {
      throw new Error('Reminders sheet not found');
    }
    
    // Append reminder to sheet
    var reminderId = Utilities.getUuid();
    sheet.appendRow([
      reminderId,
      payload.userId || '',
      payload.name || '',
      payload.email,
      payload.projectName || '',
      sanitizeText(payload.message),
      payload.scheduledTimestampUTC,
      'FALSE', // sent
      '' // sentTimestamp
    ]);
    
    logEmail('createReminder', payload.email, 'SUCCESS', 'Reminder scheduled');
    return createJsonResponse({ status: 'ok', message: 'Reminder scheduled', reminderId: reminderId });
  } catch (err) {
    logEmail('createReminder', payload.email, 'FAILED', String(err));
    throw err;
  }
}

function handleResendVerificationNote(payload) {
  if (!payload.email || !payload.name) {
    return createJsonResponse({ status: 'error', message: 'Missing required fields: email, name' }, 400);
  }
  
  var template = renderTemplate('resendVerificationNote', payload);
  var sanitizedHtml = sanitizeHtml(template.htmlBody);
  
  try {
    GmailApp.sendEmail(payload.email, template.subject, template.textBody, {
      htmlBody: sanitizedHtml,
      name: 'Wasillah Team'
    });
    logEmail('resendVerificationNote', payload.email, 'SUCCESS', '');
    return createJsonResponse({ status: 'ok', message: 'Resend verification note sent' });
  } catch (err) {
    logEmail('resendVerificationNote', payload.email, 'FAILED', String(err));
    throw err;
  }
}

function sendScheduledReminders() {
  try {
    var props = PropertiesService.getScriptProperties();
    var sheetId = props.getProperty('REMINDERS_SHEET_ID');
    
    if (!sheetId) {
      Logger.log('REMINDERS_SHEET_ID not configured');
      return;
    }
    
    var sheet = SpreadsheetApp.openById(sheetId).getSheetByName('Reminders');
    if (!sheet) {
      Logger.log('Reminders sheet not found');
      return;
    }
    
    var data = sheet.getDataRange().getValues();
    var now = new Date().getTime();
    
    // Start from row 2 (skip header)
    for (var i = 1; i < data.length; i++) {
      var row = data[i];
      var reminderId = row[0];
      var email = row[3];
      var projectName = row[4];
      var message = row[5];
      var scheduledTimestamp = row[6];
      var sent = row[7];
      
      // Skip if already sent
      if (sent === 'TRUE' || sent === true) {
        continue;
      }
      
      // Check if scheduled time has passed
      var scheduledTime = new Date(scheduledTimestamp).getTime();
      if (scheduledTime <= now) {
        try {
          var template = renderTemplate('reminder', {
            name: row[2],
            email: email,
            projectName: projectName,
            customMessage: message
          });
          
          GmailApp.sendEmail(email, template.subject, template.textBody, {
            htmlBody: sanitizeHtml(template.htmlBody),
            name: 'Wasillah Team'
          });
          
          // Mark as sent
          sheet.getRange(i + 1, 8).setValue('TRUE'); // sent column
          sheet.getRange(i + 1, 9).setValue(new Date().toISOString()); // sentTimestamp column
          
          logEmail('reminder', email, 'SUCCESS', 'Reminder sent: ' + reminderId);
          Logger.log('Sent reminder ' + reminderId + ' to ' + email);
        } catch (err) {
          Logger.log('Failed to send reminder ' + reminderId + ': ' + err);
          logEmail('reminder', email, 'FAILED', String(err));
        }
      }
    }
  } catch (err) {
    Logger.log('sendScheduledReminders error: ' + err);
  }
}

function renderTemplate(type, data) {
  var props = PropertiesService.getScriptProperties();
  var appUrl = props.getProperty('APP_URL') || 'https://wasillah.org';
  
  switch (type) {
    case 'welcome':
      return {
        subject: 'Welcome to Wasillah, ' + data.name + ' — happy you\'re here!',
        textBody: 'Hi ' + data.name + ',\n\nWelcome to Wasillah! We\'re thrilled to have you join our community of changemakers.\n\nA verification email from Firebase has been sent to confirm your email address. Please check your inbox and click the verification link to activate your account.\n\nOnce verified, you can:\n• Browse and join community projects\n• Create your own initiatives\n• Connect with volunteers\n• Make a real difference in your community\n\nNeed to resend the verification email? Visit: ' + appUrl + '/resend-verification\n\nReady to get started? Visit your dashboard: ' + appUrl + '/dashboard\n\nIf you have any questions, feel free to reach out to our team.\n\nBest regards,\nThe Wasillah Team',
        htmlBody: getWelcomeHtml(data.name, appUrl)
      };
      
    case 'submission':
      return {
        subject: 'We received your submission — ' + data.projectName,
        textBody: 'Hi ' + data.name + ',\n\nThanks for submitting "' + data.projectName + '". Your request has been received and is being reviewed by the Wasillah moderation team.\n\nWe\'ll notify you once the review is complete. Meanwhile, you can edit your submission here: ' + (data.submissionUrl || appUrl + '/dashboard') + '\n\nBest regards,\nThe Wasillah Team',
        htmlBody: getSubmissionHtml(data.name, data.projectName, data.submissionUrl || appUrl + '/dashboard')
      };
      
    case 'approval':
      return {
        subject: 'Your project "' + data.projectName + '" has been approved 🎉',
        textBody: 'Hi ' + data.name + ',\n\nGreat news! Your project "' + data.projectName + '" has been approved and is now live on Wasillah.\n\nYour project is now visible to the community and volunteers can start joining.\n\nView your project: ' + (data.projectUrl || appUrl + '/projects') + '\n\nNext steps:\n• Share your project with your network\n• Keep your project details updated\n• Engage with volunteers who join\n• Track your impact\n\nThank you for contributing to positive change in our community!\n\nBest regards,\nThe Wasillah Team',
        htmlBody: getApprovalHtml(data.name, data.projectName, data.projectUrl || appUrl + '/projects')
      };
      
    case 'reminder':
      var previewMessage = data.customMessage ? data.customMessage.substring(0, 50) : 'Reminder';
      return {
        subject: 'Reminder: ' + (data.projectName || 'Wasillah') + ' — ' + previewMessage,
        textBody: 'Hi ' + (data.name || 'there') + ',\n\n' + data.customMessage + '\n\nThis reminder was scheduled by you at Wasillah.\n\nBest regards,\nThe Wasillah Team',
        htmlBody: getReminderHtml(data.name, data.projectName, data.customMessage)
      };
      
    case 'resendVerificationNote':
      return {
        subject: 'Verification Email Resent',
        textBody: 'Hi ' + data.name + ',\n\nWe\'ve resent the verification email to your inbox.\n\nPlease check your email and click the verification link to activate your account.\n\nSteps:\n1. Check your email inbox (and spam folder)\n2. Open the email from Firebase\n3. Click the verification link\n4. Return to Wasillah and sign in\n\nIf you continue to have issues, please contact our support team.\n\nBest regards,\nThe Wasillah Team',
        htmlBody: getResendVerificationNoteHtml(data.name)
      };
      
    default:
      return {
        subject: 'Message from Wasillah',
        textBody: 'Hello,\n\nYou have received a message from Wasillah.\n\nBest regards,\nThe Wasillah Team',
        htmlBody: '<p>Hello,</p><p>You have received a message from Wasillah.</p>'
      };
  }
}

function getWelcomeHtml(name, appUrl) {
  return '<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head><body style="margin:0;padding:0;font-family:Arial,sans-serif;background:#f8fafc">' +
    '<div style="max-width:600px;margin:0 auto;background:#ffffff">' +
    '<div style="background:linear-gradient(135deg, #FF6B9D, #00D9FF);padding:32px;text-align:center">' +
    '<h1 style="color:#ffffff;margin:0;font-size:28px">Welcome to Wasillah!</h1>' +
    '</div>' +
    '<div style="padding:32px">' +
    '<p style="font-size:16px;color:#334155;margin:0 0 16px">Hi <strong>' + name + '</strong>,</p>' +
    '<p style="font-size:16px;color:#334155;margin:0 0 16px">We\'re thrilled to have you join our community of changemakers! Wasillah connects passionate volunteers with meaningful projects to create positive change.</p>' +
    '<div style="background:#f1f5f9;border-left:4px solid #FF6B9D;padding:16px;margin:24px 0">' +
    '<p style="margin:0;color:#0f172a;font-size:14px"><strong>📧 Important: Verify your email</strong></p>' +
    '<p style="margin:8px 0 0;color:#334155;font-size:14px">A verification email from Firebase has been sent to your inbox. Please click the link to activate your account.</p>' +
    '</div>' +
    '<p style="font-size:16px;color:#334155;margin:16px 0">Once verified, you can:</p>' +
    '<ul style="color:#334155;font-size:14px;line-height:1.8">' +
    '<li>Browse and join community projects</li>' +
    '<li>Create your own initiatives</li>' +
    '<li>Connect with volunteers</li>' +
    '<li>Make a real difference</li>' +
    '</ul>' +
    '<div style="text-align:center;margin:32px 0">' +
    '<a href="' + appUrl + '/dashboard" style="display:inline-block;background:linear-gradient(135deg, #FF6B9D, #00D9FF);color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:8px;font-weight:bold;font-size:16px">Go to My Dashboard</a>' +
    '</div>' +
    '<div style="text-align:center;margin:16px 0">' +
    '<a href="' + appUrl + '/resend-verification" style="color:#FF6B9D;font-size:14px;text-decoration:none">Resend verification email</a>' +
    '</div>' +
    '</div>' +
    '<div style="background:#0f172a;color:#94a3b8;padding:24px;text-align:center;font-size:12px">' +
    '<p style="margin:0">Thank you for joining Wasillah</p>' +
    '<p style="margin:8px 0 0">Questions? Contact us at support@wasillah.org</p>' +
    '</div>' +
    '</div></body></html>';
}

function getSubmissionHtml(name, projectName, submissionUrl) {
  return '<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head><body style="margin:0;padding:0;font-family:Arial,sans-serif;background:#f8fafc">' +
    '<div style="max-width:600px;margin:0 auto;background:#ffffff">' +
    '<div style="background:linear-gradient(135deg, #FF6B9D, #00D9FF);padding:32px;text-align:center">' +
    '<h1 style="color:#ffffff;margin:0;font-size:28px">Submission Received</h1>' +
    '</div>' +
    '<div style="padding:32px">' +
    '<p style="font-size:16px;color:#334155;margin:0 0 16px">Hi <strong>' + name + '</strong>,</p>' +
    '<p style="font-size:16px;color:#334155;margin:0 0 16px">Thank you for submitting <strong>"' + projectName + '"</strong>. Your request has been received and is being reviewed by the Wasillah moderation team.</p>' +
    '<div style="background:#f1f5f9;border-radius:8px;padding:16px;margin:24px 0">' +
    '<p style="margin:0;color:#0f172a;font-size:14px"><strong>What happens next?</strong></p>' +
    '<p style="margin:8px 0 0;color:#334155;font-size:14px">Our team will review your submission and notify you once approved. This typically takes 1-2 business days.</p>' +
    '</div>' +
    '<div style="text-align:center;margin:32px 0">' +
    '<a href="' + submissionUrl + '" style="display:inline-block;background:linear-gradient(135deg, #FF6B9D, #00D9FF);color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:8px;font-weight:bold;font-size:16px">View/Edit Submission</a>' +
    '</div>' +
    '</div>' +
    '<div style="background:#0f172a;color:#94a3b8;padding:24px;text-align:center;font-size:12px">' +
    '<p style="margin:0">Thank you for contributing to Wasillah</p>' +
    '</div>' +
    '</div></body></html>';
}

function getApprovalHtml(name, projectName, projectUrl) {
  return '<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head><body style="margin:0;padding:0;font-family:Arial,sans-serif;background:#f8fafc">' +
    '<div style="max-width:600px;margin:0 auto;background:#ffffff">' +
    '<div style="background:linear-gradient(135deg, #10B981, #34D399);padding:32px;text-align:center">' +
    '<h1 style="color:#ffffff;margin:0;font-size:28px">🎉 Approved!</h1>' +
    '</div>' +
    '<div style="padding:32px">' +
    '<p style="font-size:16px;color:#334155;margin:0 0 16px">Hi <strong>' + name + '</strong>,</p>' +
    '<p style="font-size:16px;color:#334155;margin:0 0 16px">Great news! Your project <strong>"' + projectName + '"</strong> has been approved and is now live on Wasillah.</p>' +
    '<div style="background:#f0fdf4;border-left:4px solid #10B981;padding:16px;margin:24px 0">' +
    '<p style="margin:0;color:#0f172a;font-size:14px"><strong>Your project is now visible!</strong></p>' +
    '<p style="margin:8px 0 0;color:#334155;font-size:14px">Community members can now discover and join your project.</p>' +
    '</div>' +
    '<p style="font-size:16px;color:#334155;margin:16px 0"><strong>Next steps:</strong></p>' +
    '<ul style="color:#334155;font-size:14px;line-height:1.8">' +
    '<li>Share your project with your network</li>' +
    '<li>Keep project details updated</li>' +
    '<li>Engage with volunteers who join</li>' +
    '<li>Track your impact on the dashboard</li>' +
    '</ul>' +
    '<div style="text-align:center;margin:32px 0">' +
    '<a href="' + projectUrl + '" style="display:inline-block;background:linear-gradient(135deg, #10B981, #34D399);color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:8px;font-weight:bold;font-size:16px">View Your Project</a>' +
    '</div>' +
    '<p style="font-size:14px;color:#64748b;margin:24px 0 0;text-align:center">Thank you for contributing to positive change in our community!</p>' +
    '</div>' +
    '<div style="background:#0f172a;color:#94a3b8;padding:24px;text-align:center;font-size:12px">' +
    '<p style="margin:0">Keep making a difference with Wasillah</p>' +
    '</div>' +
    '</div></body></html>';
}

function getReminderHtml(name, projectName, customMessage) {
  return '<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head><body style="margin:0;padding:0;font-family:Arial,sans-serif;background:#f8fafc">' +
    '<div style="max-width:600px;margin:0 auto;background:#ffffff">' +
    '<div style="background:linear-gradient(135deg, #FF6B9D, #00D9FF);padding:32px;text-align:center">' +
    '<h1 style="color:#ffffff;margin:0;font-size:28px">⏰ Reminder</h1>' +
    '</div>' +
    '<div style="padding:32px">' +
    (name ? '<p style="font-size:16px;color:#334155;margin:0 0 16px">Hi <strong>' + name + '</strong>,</p>' : '') +
    (projectName ? '<p style="font-size:14px;color:#64748b;margin:0 0 16px">For: <strong>' + projectName + '</strong></p>' : '') +
    '<div style="background:#f1f5f9;border-left:4px solid #FF6B9D;padding:16px;margin:24px 0">' +
    '<p style="margin:0;color:#0f172a;font-size:16px;white-space:pre-wrap">' + (customMessage || 'This is your scheduled reminder.') + '</p>' +
    '</div>' +
    '<p style="font-size:12px;color:#94a3b8;margin:24px 0 0;text-align:center">This reminder was scheduled by you at Wasillah</p>' +
    '</div>' +
    '<div style="background:#0f172a;color:#94a3b8;padding:24px;text-align:center;font-size:12px">' +
    '<p style="margin:0">Wasillah Community Platform</p>' +
    '</div>' +
    '</div></body></html>';
}

function getResendVerificationNoteHtml(name) {
  return '<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head><body style="margin:0;padding:0;font-family:Arial,sans-serif;background:#f8fafc">' +
    '<div style="max-width:600px;margin:0 auto;background:#ffffff">' +
    '<div style="background:linear-gradient(135deg, #FF6B9D, #00D9FF);padding:32px;text-align:center">' +
    '<h1 style="color:#ffffff;margin:0;font-size:28px">Verification Email Resent</h1>' +
    '</div>' +
    '<div style="padding:32px">' +
    '<p style="font-size:16px;color:#334155;margin:0 0 16px">Hi <strong>' + name + '</strong>,</p>' +
    '<p style="font-size:16px;color:#334155;margin:0 0 16px">We\'ve resent the verification email to your inbox.</p>' +
    '<div style="background:#f1f5f9;border-radius:8px;padding:16px;margin:24px 0">' +
    '<p style="margin:0;color:#0f172a;font-size:14px"><strong>Next steps:</strong></p>' +
    '<ol style="margin:8px 0 0;padding-left:20px;color:#334155;font-size:14px;line-height:1.8">' +
    '<li>Check your email inbox (and spam folder)</li>' +
    '<li>Open the email from Firebase</li>' +
    '<li>Click the verification link</li>' +
    '<li>Return to Wasillah and sign in</li>' +
    '</ol>' +
    '</div>' +
    '<p style="font-size:14px;color:#64748b;margin:24px 0 0">If you continue to have issues, please contact our support team at support@wasillah.org</p>' +
    '</div>' +
    '<div style="background:#0f172a;color:#94a3b8;padding:24px;text-align:center;font-size:12px">' +
    '<p style="margin:0">Wasillah Community Platform</p>' +
    '</div>' +
    '</div></body></html>';
}

function sanitizeHtml(html) {
  // Basic HTML sanitization - remove script tags and dangerous attributes
  if (!html) return '';
  var sanitized = html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
    .replace(/javascript:/gi, '');
  return sanitized;
}

function sanitizeText(text) {
  // Strip HTML tags from text
  if (!text) return '';
  return text.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

function checkRateLimit(email) {
  if (!email) return true;
  
  var now = Date.now();
  var key = email.toLowerCase();
  
  // Clean up old entries (older than 1 minute)
  if (rateLimitStore[key]) {
    rateLimitStore[key] = rateLimitStore[key].filter(function(timestamp) {
      return now - timestamp < 60000; // 60 seconds
    });
  } else {
    rateLimitStore[key] = [];
  }
  
  // Check if limit exceeded
  if (rateLimitStore[key].length >= 5) {
    return false; // Rate limit exceeded
  }
  
  // Add current request
  rateLimitStore[key].push(now);
  return true;
}

function logEmail(type, recipient, status, error) {
  try {
    var props = PropertiesService.getScriptProperties();
    var logsSheetId = props.getProperty('EMAIL_LOGS_SHEET_ID');
    
    if (!logsSheetId) {
      Logger.log('EMAIL_LOGS_SHEET_ID not configured');
      return;
    }
    
    var sheet = SpreadsheetApp.openById(logsSheetId).getSheetByName('EmailLogs');
    if (!sheet) {
      Logger.log('EmailLogs sheet not found');
      return;
    }
    
    sheet.appendRow([
      new Date().toISOString(),
      type,
      recipient,
      status,
      error
    ]);
  } catch (err) {
    Logger.log('Failed to log email: ' + err);
  }
}

function createJsonResponse(data, statusCode) {
  statusCode = statusCode || 200;
  var response = ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
  
  // Note: Apps Script doesn't support setting HTTP status codes directly
  // The status is included in the JSON response body
  if (statusCode !== 200) {
    data.httpStatus = statusCode;
  }
  
  return response;
}

/**
 * Test functions for manual testing
 */
function testWelcomeEmail() {
  var payload = {
    apiKey: PropertiesService.getScriptProperties().getProperty('SECRET_KEY'),
    type: 'welcome',
    name: 'Test User',
    email: 'test@example.com',
    appUrl: 'https://wasillah.org'
  };
  
  var mockEvent = {
    postData: {
      contents: JSON.stringify(payload)
    }
  };
  
  var result = doPost(mockEvent);
  Logger.log(result.getContent());
}

function testReminderSend() {
  sendScheduledReminders();
}
