# Wasillah Email System Documentation

## Overview

This document describes the complete email system implementation for the Wasillah web application using Google Apps Script and Firebase Auth on the Spark (free) plan.

## Architecture

The email system consists of:

1. **Google Apps Script** - Server-side email sending and scheduling
2. **Frontend Integration** - React components calling the Apps Script webhook
3. **Firebase Auth** - Built-in email verification and password reset
4. **Google Sheets** - Reminder tracking and email logs

## Apps Script Setup

### Step 1: Create Google Apps Script Project

1. Go to [Google Apps Script](https://script.google.com/)
2. Click **New Project**
3. Name your project: "Wasillah Email Service"

### Step 2: Add the Code

1. Delete the default `myFunction()` code
2. Copy the entire content of `apps_script/Code.gs` from this repository
3. Paste it into the Apps Script editor
4. Save the project (File > Save or Ctrl+S)

### Step 3: Create Google Sheets

#### Reminders Sheet

1. Create a new Google Sheet named "Wasillah Reminders"
2. Add the following columns in the first row:
   - `id`
   - `userId`
   - `name`
   - `email`
   - `projectName`
   - `message`
   - `scheduledTimestampUTC`
   - `sent`
   - `sentTimestamp`
3. Note the Sheet ID from the URL: `https://docs.google.com/spreadsheets/d/SHEET_ID_HERE/edit`

#### Email Logs Sheet

1. Create another new Google Sheet named "Wasillah Email Logs"
2. Add the following columns in the first row:
   - `timestamp`
   - `type`
   - `recipient`
   - `status`
   - `error`
3. Note the Sheet ID from the URL

### Step 4: Configure Script Properties

1. In Apps Script, go to **Project Settings** (gear icon)
2. Scroll to **Script Properties**
3. Click **Add script property** for each of the following:

| Property Name | Value | Description |
|---------------|-------|-------------|
| `SECRET_KEY` | `your-secret-api-key-here` | Generate a random strong key (e.g., use a password generator) |
| `REMINDERS_SHEET_ID` | `your-reminders-sheet-id` | The ID from the Reminders Sheet URL |
| `EMAIL_LOGS_SHEET_ID` | `your-logs-sheet-id` | The ID from the Email Logs Sheet URL |
| `APP_URL` | `https://your-domain.com` | Your production app URL |

**Important:** Keep your `SECRET_KEY` secure. Rotate it occasionally for security.

### Step 5: Deploy as Web App

1. Click **Deploy** > **New deployment**
2. Click the gear icon next to "Select type" and choose **Web app**
3. Configure:
   - **Description:** "Wasillah Email Service v1"
   - **Execute as:** Me (your Google account)
   - **Who has access:** Anyone
4. Click **Deploy**
5. **Authorize** the script when prompted (review permissions carefully)
6. Copy the **Web app URL** - you'll need this for your frontend

The URL will look like: `https://script.google.com/macros/s/SCRIPT_ID_HERE/exec`

### Step 6: Create Time-Driven Trigger

1. In Apps Script, click **Triggers** (clock icon)
2. Click **Add Trigger**
3. Configure:
   - **Function:** `sendScheduledReminders`
   - **Event source:** Time-driven
   - **Type:** Minutes timer
   - **Interval:** Every 5 minutes (or 10 minutes to reduce quota usage)
4. Click **Save**

## Frontend Configuration

### Step 1: Environment Variables

Add the following to your `.env` file:

```bash
VITE_APPS_SCRIPT_URL=https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec
VITE_APPS_SCRIPT_API_KEY=your-secret-api-key-here
```

**Note:** Use the same `SECRET_KEY` value from your Apps Script properties.

### Step 2: Verify Files

Ensure these files exist in your project:
- `src/utils/appsScriptEmail.ts` - Email service helper
- `src/components/VerificationModal.tsx` - Email verification modal
- `apps_script/Code.gs` - Apps Script server code

## Email Types and Usage

### 1. Welcome Email

**Sent when:** User signs up for an account

**Triggered by:** `AuthContext.tsx` signup function

**Payload:**
```json
{
  "apiKey": "your-api-key",
  "type": "welcome",
  "name": "John Doe",
  "email": "john@example.com",
  "appUrl": "https://yourapp.com"
}
```

**Features:**
- Personalized greeting
- Reminder to check Firebase verification email
- Link to dashboard
- Resend verification button

### 2. Submission Confirmation

**Sent when:** User submits a project or event

**Triggered by:** `CreateSubmission.tsx` after saving to Firestore

**Payload:**
```json
{
  "apiKey": "your-api-key",
  "type": "submission",
  "name": "John Doe",
  "email": "john@example.com",
  "projectName": "Community Garden",
  "submissionUrl": "https://yourapp.com/dashboard"
}
```

### 3. Approval Email

**Sent when:** Admin approves a submission

**Triggered by:** `AdminPanel.tsx` updateSubmissionStatus function

**Payload:**
```json
{
  "apiKey": "your-api-key",
  "type": "approval",
  "name": "John Doe",
  "email": "john@example.com",
  "projectName": "Community Garden",
  "projectUrl": "https://yourapp.com/projects/abc123"
}
```

### 4. Create Reminder

**Sent when:** User schedules a reminder

**Triggered by:** `CreateSubmission.tsx` during submission

**Payload:**
```json
{
  "apiKey": "your-api-key",
  "type": "createReminder",
  "userId": "firebase-user-id",
  "name": "John Doe",
  "email": "john@example.com",
  "projectName": "Community Garden",
  "message": "Don't forget to bring supplies!",
  "scheduledTimestampUTC": "2024-12-25T10:00:00.000Z"
}
```

**Note:** The reminder is saved to the Google Sheet and sent by the time-driven trigger.

### 5. Resend Verification Note

**Sent when:** User clicks "Resend Verification Email"

**Triggered by:** `AuthModal.tsx` resend button

**Payload:**
```json
{
  "apiKey": "your-api-key",
  "type": "resendVerificationNote",
  "name": "John Doe",
  "email": "john@example.com"
}
```

## Security Features

### 1. API Key Validation
- All requests must include the correct API key
- Invalid requests return 401 Unauthorized
- Key stored in Script Properties (not in code)

### 2. Rate Limiting
- Maximum 5 requests per email address per minute
- Prevents abuse and spam
- Automatically resets after 60 seconds

### 3. HTML Sanitization
- Strips `<script>` tags from user input
- Removes dangerous event handlers (`onclick`, etc.)
- Removes `javascript:` URLs

### 4. Input Validation
- Required fields checked for all email types
- Empty/missing fields return 400 Bad Request

## Email Quotas and Limits

### Gmail Free Account
- **100 emails per day** via Apps Script
- Resets at midnight PST
- Shared across all script executions

### Recommendations
1. Monitor usage in Email Logs sheet
2. Consider Google Workspace for higher quotas (2000/day)
3. For production at scale, migrate to SendGrid/Mailgun/Resend
4. Add quota warning in admin UI

## Testing

### Manual Testing in Apps Script

Use the test functions at the bottom of `Code.gs`:

```javascript
// Test welcome email
function testWelcomeEmail() {
  // ... (already in Code.gs)
}

// Test reminder sending
function testReminderSend() {
  sendScheduledReminders();
}
```

Run these from the Apps Script editor: Select function > Click Run

### Frontend Testing Checklist

- [ ] Sign up new user → Welcome email received
- [ ] Verification modal appears after signup
- [ ] Click "Resend Verification" → Note email received
- [ ] Submit project → Confirmation email received
- [ ] Admin approves submission → Approval email received
- [ ] Schedule reminder → Appears in Reminders sheet
- [ ] Wait for trigger time → Reminder email sent
- [ ] Check Email Logs sheet for all activities

### Test with Invalid API Key

Change `VITE_APPS_SCRIPT_API_KEY` temporarily to test security:
- Should see error in browser console
- Email should NOT be sent
- Should log "unauthorized" in EmailLogs sheet

## Monitoring and Logs

### Email Logs Sheet
Track all email activity:
- `timestamp`: When email was sent
- `type`: Email type (welcome, submission, etc.)
- `recipient`: Email address
- `status`: SUCCESS, FAILED, RATE_LIMITED, unauthorized
- `error`: Error message if failed

### Apps Script Logs
View execution logs:
1. Go to Apps Script project
2. Click **Executions** (list icon)
3. View logs for each execution

### Reminders Sheet
Monitor scheduled reminders:
- Check `sent` column (TRUE = sent, FALSE = pending)
- Review `sentTimestamp` for delivery time
- Manually mark as sent if needed

## Troubleshooting

### Emails Not Sending

1. **Check Script Properties**
   - Verify `SECRET_KEY` matches frontend
   - Verify Sheet IDs are correct
   - Verify `APP_URL` is correct

2. **Check Authorization**
   - Apps Script may need reauthorization
   - Redeploy and reauthorize if needed

3. **Check Quota**
   - View executions in Apps Script
   - Check for quota errors
   - Consider Google Workspace upgrade

### Reminders Not Sending

1. **Check Trigger**
   - Verify trigger is active
   - Check execution history
   - Ensure no errors in logs

2. **Check Date Format**
   - Must be ISO 8601: `2024-12-25T10:00:00.000Z`
   - Must be in UTC timezone

3. **Manual Send**
   - Run `sendScheduledReminders()` manually
   - Check for errors in logs

### Verification Modal Not Showing

1. Check AuthModal component imported VerificationModal
2. Check state management in AuthModal
3. Verify modal z-index (should be 9999)

## Password Reset Flow

Password reset uses Firebase Auth's built-in system:

1. User clicks "Forgot Password"
2. Call `sendPasswordResetEmail(auth, email)`
3. User receives email from Firebase
4. User clicks link and resets password
5. Firebase handles validation and security

**No custom implementation needed** - Firebase Auth handles everything securely.

## Customization

### Change Email Templates

Edit the `renderTemplate()` function in `Code.gs`:
- Modify HTML in `getWelcomeHtml()`, `getSubmissionHtml()`, etc.
- Add your logo/branding
- Adjust colors and styling
- Keep structure accessible

### Add New Email Types

1. Add new case in `doPost()` switch statement
2. Create handler function (e.g., `handleNewType()`)
3. Add template in `renderTemplate()`
4. Update frontend to call new type

### Use Third-Party Email Service

Replace GmailApp with external API:
1. Add API key to Script Properties
2. Use `UrlFetchApp.fetch()` for API calls
3. See existing `sendViaResend_()`, `sendViaSendGrid_()` examples
4. Higher quotas but requires paid plan

## Best Practices

1. **Never commit SECRET_KEY to Git**
   - Use .env and .env.example
   - Add .env to .gitignore

2. **Rotate API keys regularly**
   - Update both Apps Script and frontend
   - Coordinate updates to avoid downtime

3. **Monitor email logs**
   - Check for failures regularly
   - Address errors promptly

4. **Test thoroughly**
   - Test all email types before production
   - Test with real email addresses
   - Check spam folders

5. **Handle errors gracefully**
   - All email calls are non-blocking
   - App continues if email fails
   - Log errors for investigation

## Migration Path for Scale

When you outgrow the free tier:

1. **Google Workspace** - 2000 emails/day
   - Upgrade Google account
   - No code changes needed

2. **SendGrid/Mailgun/Resend** - Higher quotas
   - Update Apps Script to use API
   - Or migrate to Cloud Functions
   - Requires paid plan

3. **Firebase Cloud Functions** - Enterprise
   - Requires Blaze plan
   - Full server-side control
   - Better scaling

## Support

For issues or questions:
- Check logs in Apps Script Executions
- Review Email Logs sheet
- Check browser console for errors
- Verify all environment variables

## Security Considerations

1. **API Key Storage**
   - Frontend: Obfuscated in env variables (not fully secure)
   - Backend: Securely stored in Script Properties
   - Recommendation: Rotate keys monthly

2. **Rate Limiting**
   - Prevents abuse
   - Protects quota
   - Consider adding IP-based limits if needed

3. **Data Privacy**
   - Email content logged for debugging
   - Consider GDPR compliance
   - Implement data retention policy

## License

This email system is part of the Wasillah project. Use according to project license terms.
