# Vercel Deployment Checklist for Email Fix

## Pre-Deployment Verification

### ✅ Environment Variables in Vercel Dashboard

Go to your Vercel project settings → Environment Variables and verify these are set:

#### Required for Email Sending:
- [ ] `MAILERSEND_API_KEY` - Your MailerSend API key
- [ ] `MAILERSEND_SENDER_EMAIL` - Format: `MS_xxxxx@trial-xxxxx.mlsender.net`

#### Required for Firebase Integration:
- [ ] `FIREBASE_PROJECT_ID` - Your Firebase project ID
- [ ] `FIREBASE_CLIENT_EMAIL` - Service account email
- [ ] `FIREBASE_PRIVATE_KEY` - Private key (with `\n` for newlines)

#### Optional but Recommended:
- [ ] `VITE_QSTASH_TOKEN` - For reminder scheduling
- [ ] `VITE_CLOUDINARY_CLOUD_NAME` - For image uploads
- [ ] `VITE_CLOUDINARY_UPLOAD_PRESET` - For image uploads
- [ ] `VITE_APPS_SCRIPT_URL` - For Apps Script integration
- [ ] `VITE_APPS_SCRIPT_API_KEY` - For Apps Script API

### ⚠️ Common Mistakes to Avoid

1. **Wrong Environment Variable Names:**
   - ❌ `VITE_MAILERSEND_API_KEY` (exposes key to browser!)
   - ✅ `MAILERSEND_API_KEY` (server-side only)

2. **Invalid Email Format:**
   - ❌ `test-domain.mlsender.net/`
   - ❌ `username@domain`
   - ✅ `MS_xxxxx@trial-xxxxx.mlsender.net`

3. **FIREBASE_PRIVATE_KEY Issues:**
   - Must include `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----`
   - Must have `\n` for newlines (not actual newlines in Vercel UI)
   - Example: `-----BEGIN PRIVATE KEY-----\nMIIE...\n-----END PRIVATE KEY-----\n`

## Deployment Steps

### 1. Commit and Push Changes
```bash
git add .
git commit -m "Fix email configuration"
git push origin main
```

### 2. Verify Automatic Deployment
Vercel should automatically deploy when you push to main branch.

Check deployment status:
- Go to Vercel Dashboard
- Click on your project
- Check "Deployments" tab
- Wait for deployment to complete

### 3. Post-Deployment Testing

#### Test A: Check Environment Variables are Loaded
```bash
# Use Vercel CLI to check logs
vercel logs --follow
```

#### Test B: Test Reminder Email API
```bash
# Replace with your actual Vercel URL
curl -X POST https://your-app.vercel.app/api/send-reminder \
  -H "Content-Type: application/json" \
  -d '{
    "reminderId": "test-123",
    "email": "your-test-email@example.com",
    "name": "Test User",
    "projectName": "Test Project",
    "message": "This is a test reminder to verify email sending works"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Reminder email sent successfully",
  "reminderId": "test-123"
}
```

#### Test C: Check MailerSend Dashboard
1. Go to https://app.mailersend.com
2. Navigate to "Analytics" → "Email Activity"
3. Look for your test email
4. Status should be "Sent" or "Delivered"

#### Test D: Check Vercel Function Logs
```bash
vercel logs --follow
```

Look for:
- ✅ "Email sent successfully to: ..."
- ❌ "Failed to send email: ..." (indicates problem)

## Troubleshooting

### Issue: "Failed to send email" in logs

**Check 1: Verify API Key**
```bash
vercel env ls
```
Look for `MAILERSEND_API_KEY` - make sure it's set.

**Check 2: Test API Key in MailerSend Dashboard**
- Go to https://app.mailersend.com
- API Keys section
- Click "Test" next to your API key

**Check 3: Verify Sender Email Format**
```bash
# In Vercel function logs, look for:
# "sentFrom: Wasillah Team <email@domain.com>"
# 
# The email should be a valid format with @ symbol
```

### Issue: "Domain not verified" or "Sender not allowed"

**Solution:**
1. In MailerSend dashboard, go to "Domains"
2. Check if your trial domain is active
3. If using custom domain, verify DNS records are correct
4. Use the trial domain format: `MS_xxxxx@trial-xxxxx.mlsender.net`

### Issue: Environment variable not found

**Check Vercel Environment Variable Scope:**
- Make sure variables are set for "Production" environment
- Re-deploy after adding new environment variables

**Redeploy:**
```bash
vercel --prod
```

### Issue: Emails sent but not received

**Check 1: Spam Folder**
Check recipient's spam/junk folder.

**Check 2: MailerSend Activity Log**
- Look for bounce or spam reports
- Check delivery status

**Check 3: Recipient Email Valid**
Test with a different email address.

## Success Criteria

Your email system is working correctly if:

- [x] Code changes deployed to Vercel
- [x] Environment variables configured correctly
- [x] `/api/send-reminder` endpoint returns success
- [x] MailerSend dashboard shows sent emails
- [x] Test email received in inbox (or spam)
- [x] No errors in Vercel function logs
- [x] Firebase Functions (if deployed) also sending emails

## Next Steps After Successful Deployment

### 1. Test All Email Types

**Welcome Emails:**
- Create new user account
- Check for welcome email

**Volunteer Confirmations:**
- Submit volunteer form
- Check for confirmation email

**Submission Confirmations:**
- Submit project/event (requires Firebase Functions)
- Check for confirmation email

**Approval Emails:**
- Approve submission in admin panel (requires Firebase Functions)
- Check for approval email

### 2. Monitor Email Delivery

Set up monitoring in MailerSend:
- Email open rates
- Bounce rates
- Spam complaints

### 3. Consider Production Improvements

- [ ] Verify custom domain for professional sender address
- [ ] Set up email templates in MailerSend dashboard
- [ ] Add email delivery webhooks for real-time status
- [ ] Implement retry logic for failed sends
- [ ] Add rate limiting to prevent abuse

## Quick Reference

### Vercel Commands
```bash
# Deploy to production
vercel --prod

# View logs
vercel logs

# List environment variables
vercel env ls

# Add environment variable
vercel env add MAILERSEND_API_KEY

# Remove environment variable
vercel env rm MAILERSEND_API_KEY
```

### Firebase Commands (if using Firebase Functions)
```bash
# Set config
firebase functions:config:set mailersend.api_key="your_key"

# Get config
firebase functions:config:get

# Deploy functions
firebase deploy --only functions

# View logs
firebase functions:log
```

## Support Resources

- [Vercel Environment Variables Docs](https://vercel.com/docs/projects/environment-variables)
- [MailerSend Documentation](https://developers.mailersend.com/)
- [Firebase Functions Config](https://firebase.google.com/docs/functions/config-env)

## Emergency Rollback

If deployment breaks:
```bash
# Rollback to previous deployment in Vercel dashboard
# Or redeploy previous commit:
git revert HEAD
git push origin main
```
