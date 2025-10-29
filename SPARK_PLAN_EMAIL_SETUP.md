# Email System - Spark Plan Setup (No Firebase Functions)

## Overview

The email system is now **fully compatible with Firebase Spark (free) plan**. All email functionality works through **Vercel serverless API endpoints** and **Upstash QStash** - no Firebase Functions required!

## ✅ What Works on Spark Plan

All email features work without Firebase Functions:

1. **Submission Confirmations** - When users submit projects/events
2. **Approval Notifications** - When admins approve submissions
3. **Volunteer Confirmations** - When users apply to volunteer
4. **Welcome Emails** - When users sign up (optional)
5. **Reminder Emails** - Scheduled reminders via QStash

## Architecture

### Email Flow (No Firebase Functions)

```
┌─────────────────┐
│  User Action    │
│ (Submit/Approve)│
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Client-Side     │
│ Email Service   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ POST to         │
│ /api/send-*     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Vercel Function │
│ (Serverless)    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ MailerSend API  │
│ Sends Email     │
└─────────────────┘
```

### Reminder Flow (QStash)

```
┌─────────────────┐
│ Create Reminder │
│ in Firestore    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Schedule with   │
│ Upstash QStash  │
└────────┬────────┘
         │
         ▼ (at scheduled time)
┌─────────────────┐
│ QStash calls    │
│ /api/send-      │
│ reminder        │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Vercel Function │
│ Sends Email     │
└─────────────────┘
```

## Setup Instructions

### 1. Prerequisites

- Firebase project (Spark plan is fine!)
- MailerSend account (free tier: 12,000 emails/month)
- Upstash account (free tier: 500 requests/day) for reminders
- Vercel account (free tier)

### 2. Get MailerSend API Key

1. Go to [MailerSend Dashboard](https://www.mailersend.com)
2. Sign up or log in
3. Navigate to **API Tokens**
4. Create a new API token
5. Copy the token (starts with `mlsnd_`)
6. Your trial domain is shown in dashboard (e.g., `MS_qJLYQi@test-ywj2lpn1kvpg7oqz.mlsender.net`)

### 3. Get QStash Token (for Reminders)

1. Go to [Upstash Console](https://console.upstash.com/)
2. Sign up or log in
3. Create a QStash instance
4. Copy the **QStash Token**

### 4. Configure Environment Variables

#### For Vercel (Production)

Set these in Vercel Dashboard → Settings → Environment Variables:

```bash
# Required
MAILERSEND_API_KEY=mlsnd_your_token_here
MAILERSEND_SENDER_EMAIL=MS_qJLYQi@test-ywj2lpn1kvpg7oqz.mlsender.net

# For Reminders (Optional)
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=your-client-email
FIREBASE_PRIVATE_KEY=your-private-key
```

#### For Local Development

Create `.env.local` in project root:

```bash
# MailerSend
VITE_MAILERSEND_API_KEY=mlsnd_your_token_here

# QStash (for reminders)
VITE_QSTASH_TOKEN=your_qstash_token

# Vercel API endpoints (optional - defaults to /api)
VITE_API_BASE_URL=/api
```

### 5. Deploy to Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod

# Or link to GitHub for automatic deployments
vercel link
```

### 6. Verify Email Configuration

Check that sender email matches your MailerSend domain:

```bash
# Check all email files
grep -r "SENDER_EMAIL" api/ functions/

# Should show: MS_qJLYQi@test-ywj2lpn1kvpg7oqz.mlsender.net
```

## API Endpoints

All endpoints are in `/api/` directory and work on Vercel serverless:

### 1. Send Submission Confirmation
```
POST /api/send-submission
Body: {
  email: string,
  name: string,
  projectName: string,
  type: 'project' | 'event'
}
```

### 2. Send Approval Email
```
POST /api/send-approval
Body: {
  email: string,
  name: string,
  projectName: string,
  type: 'project' | 'event',
  origin: string (optional)
}
```

### 3. Send Reminder Email
```
POST /api/send-reminder
Body: {
  reminderId: string,
  email: string,
  name: string,
  projectName: string,
  message: string
}
```

### 4. Send Volunteer Confirmation
```
POST /api/send-volunteer
Body: {
  email: string,
  name: string
}
```

### 5. Send Welcome Email
```
POST /api/send-welcome
Body: {
  email: string,
  name: string,
  origin: string (optional)
}
```

## Client-Side Integration

### Submission Confirmations

In `CreateSubmission.tsx`:

```typescript
import { sendSubmissionConfirmation } from '../services/mailerSendEmailService';

// After successful submission
sendSubmissionConfirmation({
  email: userData.email,
  name: userData.displayName,
  projectName: projectData.title,
  type: 'project'
}).catch(err => console.warn('Email failed:', err));
```

### Approval Notifications

In `AdminPanel.tsx`:

```typescript
import { sendApprovalEmail } from '../services/mailerSendEmailService';

// When approving a submission
if (status === 'approved') {
  await sendApprovalEmail({
    email: submission.submitterEmail,
    name: submission.submitterName,
    projectName: submission.title,
    type: submissionType
  });
}
```

### Scheduled Reminders

In `CreateSubmission.tsx`:

```typescript
import { createReminder } from '../services/reminderService';

// Create a reminder
createReminder({
  email: 'user@example.com',
  name: 'John Doe',
  projectName: 'Community Garden',
  message: 'Remember to bring tools!',
  scheduledAt: '2024-12-25T10:00:00Z',
  userId: currentUser.uid
});
```

## Testing

### Test Submission Email

1. Go to your app
2. Submit a new project or event
3. Check the submitter's email inbox
4. Should receive confirmation within seconds

### Test Approval Email

1. Log in as admin
2. Go to Admin Panel
3. Approve a pending submission
4. Check the submitter's email inbox

### Test Reminder Email

1. Create a reminder with a near-future time (e.g., 2 minutes)
2. Wait for the scheduled time
3. Check email inbox

### Check Logs

#### Vercel Logs
```bash
vercel logs
```

#### Or in Vercel Dashboard
1. Go to your project
2. Click **Functions**
3. Click on any function to see logs

## Troubleshooting

### Emails Not Sending

**Check 1: Environment Variables**
```bash
# Verify in Vercel Dashboard
Settings → Environment Variables

# Must have:
- MAILERSEND_API_KEY
- MAILERSEND_SENDER_EMAIL
```

**Check 2: Sender Email Format**
- Must be valid email: `something@domain.mlsender.net`
- Must match your MailerSend trial domain
- Check in MailerSend dashboard

**Check 3: API Key**
- Verify key is active in MailerSend dashboard
- Check quota/limits (free tier: 12,000/month)

**Check 4: Vercel Deployment**
```bash
# Check deployment status
vercel ls

# Should show your project with 'Ready' status
```

### Reminders Not Sending

**Check 1: QStash Configuration**
- Verify `VITE_QSTASH_TOKEN` is set
- Check token in Upstash console

**Check 2: Firestore Access**
- Verify Firebase credentials in Vercel
- Check Firestore rules allow reading `reminders` collection

**Check 3: QStash Logs**
- Go to Upstash Console
- Check QStash logs for errors

### Common Errors

**"MailerSend not configured"**
- Environment variable `MAILERSEND_API_KEY` not set
- Redeploy after setting environment variables

**"Invalid sender email"**
- Sender email format is wrong
- Must be: `MS_something@test-domain.mlsender.net`

**"QStash not configured"**
- `VITE_QSTASH_TOKEN` not set
- Reminders won't be scheduled (but will still be stored in Firestore)

## Cost Breakdown (Free Tier)

### Firebase Spark Plan: $0/month
- ✅ Firestore reads/writes
- ✅ Authentication
- ✅ Storage (limited)
- ❌ No Cloud Functions

### MailerSend Free Tier: $0/month
- ✅ 12,000 emails/month
- ✅ Trial domain included
- ✅ All features

### Upstash QStash Free Tier: $0/month
- ✅ 500 requests/day
- ✅ Scheduled HTTP requests
- ✅ All features

### Vercel Free Tier: $0/month
- ✅ Serverless Functions
- ✅ 100GB bandwidth
- ✅ Automatic deployments

**Total Cost: $0/month** 🎉

## Benefits of This Setup

1. ✅ **No Firebase Functions** - Works on Spark (free) plan
2. ✅ **Lower Latency** - Direct API calls, no Function cold starts
3. ✅ **Better Monitoring** - Vercel/Upstash dashboards
4. ✅ **Cost Effective** - Everything on free tiers
5. ✅ **More Reliable** - QStash handles retries automatically
6. ✅ **Easy Debugging** - Clear logs in Vercel/Upstash consoles

## What About Firebase Functions?

The Firebase Functions in `functions/emailFunctions.js` are now **optional** and **not required** for email functionality. They are kept for:

1. **Reference** - Example of how it could work with Functions
2. **Future Migration** - If you upgrade to Blaze plan
3. **Alternative Approach** - Firestore triggers vs client-side calls

You can safely **ignore** or **delete** the `functions/` directory if you're staying on Spark plan.

## Next Steps

1. ✅ Set up environment variables in Vercel
2. ✅ Deploy to Vercel: `vercel --prod`
3. ✅ Test submission email
4. ✅ Test approval email
5. ✅ (Optional) Test reminder with QStash
6. ✅ Monitor logs in Vercel dashboard

Your email system is now fully functional on Firebase Spark plan! 🚀
