# Email Troubleshooting Checklist

## Current Status

✅ Sender email reverted to: `test-ywj2lpn1kvpg7oqz.mlsender.net` (domain-only, no @)
✅ API key validation added to all endpoints
✅ Error handling improved with clear messages

## Step-by-Step Debugging

### Step 1: Verify Environment Variables

**Check in Vercel Dashboard:**
1. Go to: Vercel Dashboard → Your Project → Settings → Environment Variables
2. Verify these variables exist:
   - `MAILERSEND_API_KEY` - Your MailerSend API token (starts with `mlsnd_`)
   - `MAILERSEND_SENDER_EMAIL` (optional) - Defaults to `test-ywj2lpn1kvpg7oqz.mlsender.net`

**If missing:**
```bash
# Add via Vercel CLI
vercel env add MAILERSEND_API_KEY production
# Paste your API key when prompted

# Then redeploy
vercel --prod
```

### Step 2: Test API Endpoint Directly

**Test if the API is working:**
```bash
# Replace YOUR_DOMAIN with your actual Vercel domain
curl -X POST https://YOUR_DOMAIN.vercel.app/api/send-submission \
  -H "Content-Type: application/json" \
  -d '{
    "email": "your-email@example.com",
    "name": "Test User",
    "projectName": "Test Project",
    "type": "project"
  }'
```

**Expected responses:**

**✅ Success:**
```json
{
  "success": true,
  "message": "Submission confirmation email sent successfully"
}
```

**❌ API Key Missing:**
```json
{
  "error": "Email service not configured",
  "message": "MAILERSEND_API_KEY environment variable is missing"
}
```

**❌ Invalid Request:**
```json
{
  "error": "Missing required fields",
  "received": {...}
}
```

### Step 3: Check Browser Console

When submitting a form in the app:

1. Open browser DevTools (F12)
2. Go to **Console** tab
3. Submit a project/event
4. Look for messages:

**What to look for:**
```javascript
// Success
"Email sent successfully via send-submission"

// Failure
"Failed to send email via send-submission: ..."
"Error calling send-submission: ..."
```

### Step 4: Check Vercel Function Logs

**Via CLI:**
```bash
vercel logs --follow
```

**Via Dashboard:**
1. Go to Vercel Dashboard → Your Project
2. Click **Deployments** → Latest deployment
3. Click **View Function Logs**
4. Look for errors from `/api/send-*` functions

**Common errors:**
```
"MAILERSEND_API_KEY environment variable is not set"
"Error sending submission email: ..."
"MailerSend API error: ..."
```

### Step 5: Verify MailerSend API Key

**Check in MailerSend Dashboard:**
1. Go to https://www.mailersend.com/
2. Navigate to **API Tokens**
3. Verify your token is **Active**
4. Check the **Permissions** - needs "Email" permission
5. Verify your **Sending Quota** - free tier: 12,000/month

**Test API key directly:**
```bash
# Replace with your actual API key
curl -X GET https://api.mailersend.com/v1/domains \
  -H "Authorization: Bearer mlsnd_YOUR_API_KEY"
```

Should return your domains. If error, API key is invalid.

### Step 6: Check Sender Domain

**In MailerSend Dashboard:**
1. Go to **Domains**
2. Find: `test-ywj2lpn1kvpg7oqz.mlsender.net`
3. Verify status is **Active** or **Verified**

**Important:** The sender email format is currently set to domain-only: `test-ywj2lpn1kvpg7oqz.mlsender.net`

However, MailerSend typically requires a full email address like:
- `noreply@test-ywj2lpn1kvpg7oqz.mlsender.net`
- `MS_qJLYQi@test-ywj2lpn1kvpg7oqz.mlsender.net`

**If emails still don't work**, try updating the sender email to full format:
1. In Vercel: Add env var `MAILERSEND_SENDER_EMAIL=noreply@test-ywj2lpn1kvpg7oqz.mlsender.net`
2. Redeploy

### Step 7: Check Network Requests

**In Browser DevTools:**
1. Open **Network** tab
2. Submit a form
3. Look for POST request to `/api/send-submission` or `/api/send-approval`
4. Check:
   - **Status Code**: Should be 200 (success) or 500 (error)
   - **Response**: Check the JSON response for error messages
   - **Request Payload**: Verify email data is being sent

### Step 8: Verify Code Integration

**Check that email functions are being called:**

**In CreateSubmission.tsx:**
```typescript
// Should see this import
import { sendSubmissionConfirmation } from '../services/mailerSendEmailService';

// Should call after submission
sendSubmissionConfirmation({
  email: userData.email,
  name: userData.displayName,
  projectName: projectData.title,
  type: 'project'
})
```

**In AdminPanel.tsx:**
```typescript
// Should see this import
import { sendApprovalEmail } from '../services/mailerSendEmailService';

// Should call when approving
if (status === 'approved') {
  await sendApprovalEmail({
    email: submission.submitterEmail,
    name: submission.submitterName,
    projectName: submission.title,
    type: submissionType
  });
}
```

## Common Issues & Solutions

### Issue: "MAILERSEND_API_KEY environment variable is missing"

**Cause:** Environment variable not set in Vercel

**Solution:**
```bash
vercel env add MAILERSEND_API_KEY production
# Paste your API key
vercel --prod  # Redeploy
```

### Issue: "Invalid sender email" or "Domain not verified"

**Cause:** Sender email format may be incorrect

**Solution 1:** Try full email format
```bash
vercel env add MAILERSEND_SENDER_EMAIL production
# Enter: noreply@test-ywj2lpn1kvpg7oqz.mlsender.net
vercel --prod
```

**Solution 2:** Check MailerSend dashboard for correct domain format

### Issue: Emails sent but not received

**Causes:**
1. Email in spam folder
2. MailerSend sending quota exceeded
3. Recipient email invalid

**Solutions:**
1. Check spam/junk folder
2. Check MailerSend dashboard → Activity → Email logs
3. Verify recipient email is correct
4. Check MailerSend sending quota

### Issue: API endpoint returns 405 Method Not Allowed

**Cause:** API endpoint not deployed or wrong HTTP method

**Solution:**
```bash
# Redeploy Vercel functions
vercel --prod

# Verify API endpoints exist
curl https://YOUR_DOMAIN.vercel.app/api/send-submission
# Should not return 404
```

### Issue: Function timeout

**Cause:** Vercel function taking too long (default 10s limit)

**Solution:** Already configured in `vercel.json` with 10s max duration. If still timing out, check MailerSend API response time.

## Quick Test Script

Save this as `test-email.sh` and run it:

```bash
#!/bin/bash

DOMAIN="your-domain.vercel.app"  # Replace with your Vercel domain
EMAIL="your-email@example.com"    # Replace with test email

echo "Testing email API..."
curl -X POST https://$DOMAIN/api/send-submission \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"name\":\"Test User\",\"projectName\":\"Test Project\",\"type\":\"project\"}" \
  -v

echo -e "\n\nCheck the response above for errors."
echo "Also check $EMAIL inbox (and spam folder)."
```

## Final Checklist

Before asking for help, verify:

- [ ] ✅ Vercel environment variable `MAILERSEND_API_KEY` is set
- [ ] ✅ Vercel functions are deployed (`vercel --prod`)
- [ ] ✅ MailerSend API key is active in MailerSend dashboard
- [ ] ✅ Sender domain `test-ywj2lpn1kvpg7oqz.mlsender.net` is verified
- [ ] ✅ Sending quota not exceeded (check MailerSend dashboard)
- [ ] ✅ API endpoint returns 200 when called directly (Step 2)
- [ ] ✅ Browser console shows email API call (Step 3)
- [ ] ✅ Vercel logs show function execution (Step 4)
- [ ] ✅ Checked spam folder

## Getting More Help

If still not working after all checks:

1. **Share Vercel function logs** (from Step 4)
2. **Share browser console output** (from Step 3)
3. **Share API test response** (from Step 2)
4. **Share MailerSend Activity logs** (from MailerSend dashboard → Activity)

This will help identify the exact issue!
