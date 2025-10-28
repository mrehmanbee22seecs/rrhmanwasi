# Email System Architecture Flow

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                     Wasillah Web App (React)                     │
│                     Firebase Spark Plan                          │
└─────────────────────────────────────────────────────────────────┘
                            │
                            │ HTTPS POST
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│              Google Apps Script Web App                          │
│              • API Key Validation                                │
│              • Rate Limiting                                     │
│              • HTML Sanitization                                 │
└─────────────────────────────────────────────────────────────────┘
                            │
          ┌─────────────────┼─────────────────┐
          │                 │                 │
          ▼                 ▼                 ▼
    ┌─────────┐      ┌──────────┐     ┌──────────┐
    │ GmailApp│      │ Google   │     │  Trigger │
    │         │      │ Sheets   │     │  Every   │
    │ Send    │      │ (Reminders│     │ 5 mins  │
    │ Email   │      │ & Logs)  │     │          │
    └─────────┘      └──────────┘     └──────────┘
```

## Email Flow by Type

### 1. Welcome Email (On Signup)

```
User Signup
   │
   ├─► Firebase Auth: createUserWithEmailAndPassword()
   │
   ├─► Firebase Auth: sendEmailVerification() ──► [Firebase Verification Email]
   │
   ├─► Apps Script: POST /welcome ──► [Welcome Email]
   │
   └─► Show VerificationModal
         │
         └─► User clicks "Resend"
               │
               ├─► Firebase Auth: sendEmailVerification() ──► [Verification Email]
               │
               └─► Apps Script: POST /resendVerificationNote ──► [Note Email]
```

**Emails Sent:**
1. Firebase verification email (automatic, secure)
2. Welcome email (personalized, friendly)
3. Resend note (optional, user-triggered)

### 2. Submission Confirmation Email

```
User Submits Project/Event
   │
   ├─► Firestore: Save to project_submissions or event_submissions
   │
   ├─► Apps Script: POST /submission ──► [Confirmation Email to User]
   │
   └─► Success message shown
```

**Email Sent:**
1. Submission confirmation with edit link

### 3. Approval Email

```
admin Reviews Submission
   │
   └─► admin clicks "Approve"
         │
         ├─► Firestore: Update status to 'approved', isVisible=true
         │
         ├─► Existing Email: formatSubmissionStatusUpdateEmail() ──► [Status Update]
         │
         └─► Apps Script: POST /approval ──► [Celebratory Approval Email]
```

**Emails Sent:**
1. Status update email (existing system)
2. Celebratory approval email with 🎉 (new)

### 4. Scheduled Reminder System

```
User Creates Reminder
   │
   ├─► Firestore: Save to reminders collection
   │
   ├─► Apps Script: POST /createReminder
   │     │
   │     └─► Google Sheet: Add row to "Reminders" sheet
   │           • id, userId, name, email, projectName
   │           • message, scheduledTimestampUTC
   │           • sent=FALSE, sentTimestamp=empty
   │
   └─► Existing Webhook: scheduleReminderEmails() (backwards compat)


Time-Driven Trigger (Every 5 minutes)
   │
   └─► Apps Script: sendScheduledReminders()
         │
         └─► For each row in "Reminders" sheet:
               │
               ├─► If sent == FALSE AND scheduledTime <= NOW:
               │     │
               │     ├─► GmailApp.sendEmail() ──► [Reminder Email]
               │     │
               │     ├─► Update sheet: sent=TRUE, sentTimestamp=NOW
               │     │
               │     └─► Log to EmailLogs sheet
               │
               └─► Skip if already sent
```

**Process:**
1. Reminder saved to Google Sheet
2. Trigger checks every 5 minutes
3. Sends due reminders
4. Marks as sent to prevent duplicates

### 5. Password Reset (Firebase Auth)

```
User Clicks "Forgot Password"
   │
   └─► Firebase Auth: sendPasswordResetEmail()
         │
         └─► [Password Reset Email from Firebase]
               │
               └─► User clicks link ──► Firebase Hosted Reset Page
                     │
                     └─► User enters new password
                           │
                           └─► Firebase Auth: confirmPasswordReset()
```

**Note:** Uses Firebase's secure built-in system. No custom email needed.

## Data Flow Architecture

```
┌──────────────┐
│   Browser    │
│  (React App) │
└──────┬───────┘
       │
       │ 1. User Action (signup, submit, etc.)
       ▼
┌──────────────┐
│  AuthContext │
│ CreateSubmission│
│  AdminPanel  │
└──────┬───────┘
       │
       │ 2. Call Helper Function
       ▼
┌─────────────────┐
│ appsScriptEmail │
│   sendWelcomeEmail() │
│   sendSubmissionEmail() │
│   sendApprovalEmail() │
│   createReminder() │
└──────┬──────────┘
       │
       │ 3. HTTPS POST with API Key
       ▼
┌─────────────────────┐
│  Apps Script        │
│  doPost(e)          │
│  • Validate API Key │
│  • Rate Limit Check │
│  • Route by type    │
└──────┬──────────────┘
       │
       ├─► 4a. Immediate Email
       │    └─► GmailApp.sendEmail()
       │
       ├─► 4b. Schedule Reminder
       │    └─► Append to Google Sheet
       │
       └─► 4c. Log Activity
            └─► Append to EmailLogs Sheet
```

## Security Layers

```
Request Flow with Security Checks:

Browser ──► Apps Script
   │
   ├─► ✓ API Key Validation
   │      └─► Compare with Script Properties SECRET_KEY
   │
   ├─► ✓ Rate Limiting
   │      └─► Max 5 requests per email per minute
   │
   ├─► ✓ Input Validation
   │      └─► Required fields present and valid
   │
   ├─► ✓ HTML Sanitization
   │      └─► Strip <script> tags and dangerous attributes
   │
   └─► ✓ Logging
          └─► All requests logged to EmailLogs sheet
```

## Google Sheets Structure

### Reminders Sheet

| Column | Type | Description |
|--------|------|-------------|
| id | String | UUID of reminder |
| userId | String | Firebase user ID |
| name | String | User display name |
| email | String | Recipient email |
| projectName | String | Associated project/event |
| message | String | Reminder message (sanitized) |
| scheduledTimestampUTC | ISO DateTime | When to send (UTC) |
| sent | Boolean | TRUE if sent, FALSE if pending |
| sentTimestamp | ISO DateTime | When email was sent |

### EmailLogs Sheet

| Column | Type | Description |
|--------|------|-------------|
| timestamp | ISO DateTime | When request processed |
| type | String | Email type (welcome, submission, etc.) |
| recipient | String | Email address |
| status | String | SUCCESS, FAILED, RATE_LIMITED, unauthorized |
| error | String | Error message if failed |

## API Endpoints (Apps Script)

### POST /exec (Apps Script Web App URL)

**Shared Headers:**
```json
{
  "Content-Type": "application/json"
}
```

**Shared Payload:**
```json
{
  "apiKey": "your-secret-key"
}
```

### 1. Welcome Email

```json
{
  "type": "welcome",
  "name": "John Doe",
  "email": "john@example.com",
  "appUrl": "https://yourapp.com"
}
```

**Response:**
```json
{
  "status": "ok",
  "message": "Welcome email sent"
}
```

### 2. Submission Confirmation

```json
{
  "type": "submission",
  "name": "John Doe",
  "email": "john@example.com",
  "projectName": "Community Garden",
  "submissionUrl": "https://yourapp.com/dashboard"
}
```

### 3. Approval Email

```json
{
  "type": "approval",
  "name": "John Doe",
  "email": "john@example.com",
  "projectName": "Community Garden",
  "projectUrl": "https://yourapp.com/projects/abc123"
}
```

### 4. Create Reminder

```json
{
  "type": "createReminder",
  "userId": "firebase-uid",
  "name": "John Doe",
  "email": "john@example.com",
  "projectName": "Community Garden",
  "message": "Don't forget supplies!",
  "scheduledTimestampUTC": "2024-12-25T10:00:00.000Z"
}
```

### 5. Resend Verification Note

```json
{
  "type": "resendVerificationNote",
  "name": "John Doe",
  "email": "john@example.com"
}
```

## Error Responses

### Invalid API Key
```json
{
  "status": "error",
  "message": "Unauthorized",
  "httpStatus": 401
}
```

### Rate Limit Exceeded
```json
{
  "status": "error",
  "message": "Rate limit exceeded. Please try again later.",
  "httpStatus": 429
}
```

### Missing Required Fields
```json
{
  "status": "error",
  "message": "Missing required fields: email, name",
  "httpStatus": 400
}
```

### Unknown Email Type
```json
{
  "status": "error",
  "message": "Unknown email type: invalid",
  "httpStatus": 400
}
```

## Monitoring Dashboard

Access your monitoring tools:

1. **Apps Script Executions**
   - URL: Apps Script > Executions tab
   - Shows: All function runs, errors, duration

2. **Email Logs Sheet**
   - Real-time logging of all email operations
   - Filter by date, type, status

3. **Reminders Sheet**
   - Track pending and sent reminders
   - Verify scheduled times

4. **Browser Console**
   - Frontend errors and API responses
   - Network tab for request details

## Quota Management

```
Gmail Free Account Limits:
┌──────────────────────────────┐
│  100 emails per day          │
│  Resets: Midnight PST        │
│  Shared: All Apps Scripts    │
└──────────────────────────────┘
                │
                ▼
        Daily Usage Tracking
                │
                ├─► 0-80 emails: ✓ Normal operation
                ├─► 80-95 emails: ⚠️ Warning threshold
                └─► 95-100 emails: 🚨 Critical - Stop non-essential

Upgrade Options:
├─► Google Workspace: 2,000 emails/day
└─► Third-party (SendGrid, etc.): Higher limits
```

## Scaling Strategy

```
Current: Firebase Spark + Apps Script + Gmail
   │
   ├─► Phase 1 (100+ emails/day needed)
   │     └─► Google Workspace ($6/user/month)
   │           └─► 2,000 emails/day
   │
   ├─► Phase 2 (2,000+ emails/day needed)
   │     └─► SendGrid/Mailgun/Resend
   │           ├─► Update Apps Script to use API
   │           └─► 10,000+ emails/day
   │
   └─► Phase 3 (Enterprise scale)
         └─► Firebase Blaze + Cloud Functions
               ├─► Cloud Pub/Sub for queuing
               ├─► Cloud Tasks for scheduling
               └─► Dedicated email infrastructure
```

## Troubleshooting Decision Tree

```
Email Not Sent?
   │
   ├─► Check EmailLogs sheet
   │     │
   │     ├─► Status: "FAILED"
   │     │     └─► Check error column
   │     │           ├─► "Invalid API key" → Fix API key
   │     │           ├─► "Quota exceeded" → Upgrade plan
   │     │           └─► Other → Check Apps Script logs
   │     │
   │     ├─► Status: "RATE_LIMITED"
   │     │     └─► Wait 1 minute, reduce request rate
   │     │
   │     └─► Status: "unauthorized"
   │           └─► API key mismatch → Fix .env and Script Properties
   │
   └─► No entry in EmailLogs?
         └─► Check Apps Script Executions
               ├─► Authorization error → Reauthorize
               ├─► Quota exceeded → Wait or upgrade
               └─► Script error → Check code, redeploy
```

## Best Practices Summary

1. **Security**
   - ✓ Rotate API keys monthly
   - ✓ Monitor EmailLogs for unauthorized attempts
   - ✓ Never commit .env to Git

2. **Reliability**
   - ✓ Monitor quota usage daily
   - ✓ Set up alerts for failures
   - ✓ Test all flows regularly

3. **Performance**
   - ✓ Use non-blocking email calls in frontend
   - ✓ Log all operations
   - ✓ Clean up old logs periodically

4. **User Experience**
   - ✓ Show clear success/error messages
   - ✓ Provide alternative contact methods
   - ✓ Make verification process obvious

## Support Resources

- **Documentation:** EMAIL_SYSTEM_DOCUMENTATION.md
- **Testing Guide:** EMAIL_TESTING_GUIDE.md
- **Apps Script Help:** https://developers.google.com/apps-script
- **Firebase Auth:** https://firebase.google.com/docs/auth
- **Gmail Limits:** https://support.google.com/mail/answer/22839
