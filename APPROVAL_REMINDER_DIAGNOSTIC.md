# Approval & Reminder Email Diagnostic Guide

## Current Status (After Latest Fix)

✅ **Enhanced Error Handling** - All email operations now log detailed success/failure messages
✅ **Better Visibility** - Console shows exactly what's happening with each email/reminder
✅ **User Alerts** - Admins see alerts if approval emails or reminders fail

## How to Diagnose Issues

### 1. Check Approval Emails

When admin approves a project/event, check browser console (F12):

**What to look for:**

```
📧 Calling email API: /api/send-approval
   {email: "user@example.com", name: "User Name", ...}
```

**Success:**
```
✅ Email sent successfully via send-approval
✅ Approval email sent successfully to: user@example.com
```

**Failure:**
```
❌ Failed to send email via send-approval: {...}
   Status: 500 Internal Server Error
```

**Common Issues:**

| Error | Cause | Solution |
|-------|-------|----------|
| `MAILERSEND_API_KEY environment variable is missing` | API key not set in Vercel | Add `MAILERSEND_API_KEY` in Vercel env vars |
| `404 Not Found` | API endpoint not deployed | Run `vercel --prod` |
| `Invalid sender email` | Wrong email format | Check sender email format |
| `Failed to fetch` | Network/CORS issue | Check Vercel deployment status |

### 2. Check Reminder Scheduling

When admin approves a project/event with reminders, check console:

**What to look for:**

```
Scheduling 2 reminders for approved project
```

**Success:**
```
Scheduling reminder with QStash:
  - Callback URL: https://your-domain.vercel.app/api/send-reminder
  - Delay: 86400 seconds
  - Scheduled time: 2024-12-25T10:00:00.000Z
✅ Reminder scheduled with QStash successfully!
  - Message ID: msg_abc123
  - Reminder ID: rem_xyz789
Reminders scheduled: 2 succeeded, 0 failed
```

**Failure - QStash Not Configured:**
```
❌ QStash not configured! VITE_QSTASH_TOKEN environment variable is missing.
Reminder stored in Firestore but will NOT be sent automatically.
Reminders scheduled: 0 succeeded, 2 failed
```

**Failure - QStash Error:**
```
❌ Failed to schedule with QStash: [error details]
QStash error details: {message: "...", status: 401, ...}
Reminders scheduled: 0 succeeded, 2 failed
```

**Common Issues:**

| Error | Cause | Solution |
|-------|-------|----------|
| `QStash not configured` | VITE_QSTASH_TOKEN not set | Add token to .env.local |
| `401 Unauthorized` | Invalid QStash token | Check token in Upstash console |
| `Invalid URL` | Callback URL wrong | Set VITE_APP_URL env var |
| `Delay must be positive` | Reminder date in past | Check reminder date/time |

### 3. Environment Variables Checklist

#### For Vercel (Production - Required for ALL emails)
```bash
MAILERSEND_API_KEY=mlsnd_your_token_here
MAILERSEND_SENDER_EMAIL=test-ywj2lpn1kvpg7oqz.mlsender.net
```

#### For Local Development (Required for reminders)
```bash
# .env.local
VITE_QSTASH_TOKEN=your_qstash_token_here
VITE_APP_URL=https://your-domain.vercel.app
```

### 4. Step-by-Step Testing

#### Test Approval Email:
1. Open browser console (F12)
2. Go to Admin Panel
3. Approve a pending project or event
4. Watch console for email logs
5. Check recipient's email inbox
6. If fails, check error message in console

#### Test Reminder Scheduling:
1. Open browser console (F12)
2. Submit a project/event with reminders filled in
3. As admin, approve that submission
4. Watch console for reminder scheduling logs
5. Should see "Reminders scheduled: X succeeded, Y failed"
6. If failed, check error messages

#### Test Reminder Delivery:
1. After scheduling, check Firestore `reminders` collection
2. Should see reminder documents with `qstashMessageId`
3. Check Upstash QStash dashboard for scheduled messages
4. Wait until scheduled time (or schedule for 2 minutes from now for testing)
5. Check recipient email at scheduled time

### 5. Verifying Setup

#### Check MailerSend Configuration:
```bash
# Test API key
curl -X GET https://api.mailersend.com/v1/domains \
  -H "Authorization: Bearer YOUR_MAILERSEND_API_KEY"
```

Should return your domains. If error, API key is invalid.

#### Check QStash Configuration:
```bash
# Test QStash token
curl -X GET https://qstash.upstash.io/v2/topics \
  -H "Authorization: Bearer YOUR_QSTASH_TOKEN"
```

Should return 200 OK. If error, token is invalid.

#### Check Vercel Deployment:
```bash
# Test approval email endpoint
curl -X POST https://YOUR-DOMAIN.vercel.app/api/send-approval \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "name": "Test User",
    "projectName": "Test Project",
    "type": "project"
  }'
```

Should return `{"success": true}` or error message.

### 6. Troubleshooting Steps

**If approval emails not sending:**

1. ✅ Check browser console for error messages
2. ✅ Verify MAILERSEND_API_KEY is set in Vercel
3. ✅ Test API endpoint directly with curl (see above)
4. ✅ Check MailerSend dashboard for email activity
5. ✅ Check spam folder
6. ✅ Verify sender email format: `test-ywj2lpn1kvpg7oqz.mlsender.net`

**If reminders not scheduling:**

1. ✅ Check browser console for QStash error
2. ✅ Verify VITE_QSTASH_TOKEN is set in .env.local
3. ✅ Test QStash token with curl (see above)
4. ✅ Check Upstash QStash dashboard for scheduled messages
5. ✅ Verify VITE_APP_URL points to your Vercel domain
6. ✅ Make sure reminder date/time is in the future

**If reminders scheduling but not sending:**

1. ✅ Check Upstash QStash dashboard - Status of messages
2. ✅ Check Vercel function logs for `/api/send-reminder`
3. ✅ Verify MAILERSEND_API_KEY is set in Vercel
4. ✅ Check Firestore reminders collection - `sent` field should be true
5. ✅ Look for QStash webhook errors in Upstash logs

### 7. Quick Test Commands

**Test everything at once:**

```bash
# 1. Test MailerSend API Key
echo "Testing MailerSend API Key..."
curl -X GET https://api.mailersend.com/v1/domains \
  -H "Authorization: Bearer YOUR_MAILERSEND_API_KEY"

# 2. Test QStash Token
echo -e "\n\nTesting QStash Token..."
curl -X GET https://qstash.upstash.io/v2/topics \
  -H "Authorization: Bearer YOUR_QSTASH_TOKEN"

# 3. Test Approval Email Endpoint
echo -e "\n\nTesting Approval Email Endpoint..."
curl -X POST https://YOUR-DOMAIN.vercel.app/api/send-approval \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","name":"Test","projectName":"Test","type":"project"}'

# 4. Check Vercel Environment Variables
echo -e "\n\nCheck these are set in Vercel:"
echo "  - MAILERSEND_API_KEY"
echo "  - MAILERSEND_SENDER_EMAIL"

echo -e "\n\nCheck these are set locally (.env.local):"
echo "  - VITE_QSTASH_TOKEN"
echo "  - VITE_APP_URL"
```

### 8. Expected Console Output

**When approving a project with reminders:**

```
📧 Calling email API: /api/send-approval
   {email: "user@example.com", name: "John Doe", projectName: "Community Garden", type: "project"}
✅ Email sent successfully via send-approval {success: true, message: "Approval email sent successfully"}
✅ Approval email sent successfully to: user@example.com
Scheduling 2 reminders for approved project
Scheduling reminder with QStash:
  - Callback URL: https://your-app.vercel.app/api/send-reminder
  - Delay: 86400 seconds
  - Scheduled time: 2024-12-25T10:00:00.000Z
✅ Reminder scheduled with QStash successfully!
  - Message ID: msg_abc123xyz
  - Reminder ID: rem_firestore_id_1
Scheduling reminder with QStash:
  - Callback URL: https://your-app.vercel.app/api/send-reminder
  - Delay: 172800 seconds
  - Scheduled time: 2024-12-26T10:00:00.000Z
✅ Reminder scheduled with QStash successfully!
  - Message ID: msg_def456uvw
  - Reminder ID: rem_firestore_id_2
Reminders scheduled: 2 succeeded, 0 failed
```

### 9. Getting Help

If still not working after following this guide, provide:

1. **Screenshot of browser console** when approving
2. **Vercel environment variables** (list names, not values)
3. **Local .env.local variables** (list names, not values)
4. **MailerSend dashboard** - screenshot of activity log
5. **Upstash QStash dashboard** - screenshot of scheduled messages
6. **Any error messages** from console

This information will help identify the exact issue!
