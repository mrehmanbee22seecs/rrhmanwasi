# Email System Testing Guide

This guide will help you test the complete email system implementation.

## Prerequisites

Before testing, ensure you have:

1. ✅ Completed Apps Script setup (see EMAIL_SYSTEM_DOCUMENTATION.md)
2. ✅ Created Reminders and EmailLogs Google Sheets
3. ✅ Set up Script Properties in Apps Script
4. ✅ Deployed Apps Script as web app
5. ✅ Created time-driven trigger for reminders
6. ✅ Updated `.env` with Apps Script URL and API key
7. ✅ Built and deployed the frontend

## Test 1: Welcome Email on Signup

### Steps:
1. Clear browser cache and cookies
2. Navigate to your app's homepage
3. Click "Sign Up" or "Join"
4. Fill in signup form:
   - Name: Test User
   - Email: your-test-email@gmail.com
   - Password: TestPass123!
5. Submit the form

### Expected Results:
- ✅ Account created successfully
- ✅ Verification modal appears with message "We sent a confirmation link to..."
- ✅ Firebase verification email received in inbox
- ✅ Welcome email received from Wasillah with:
  - Personalized greeting with your name
  - Instructions about verification
  - "Go to My Dashboard" button
  - "Resend verification email" link
- ✅ Entry in EmailLogs sheet:
  - type: `welcome`
  - recipient: your email
  - status: `SUCCESS`

### Troubleshooting:
- If no email received, check EmailLogs sheet for errors
- Check Apps Script Executions for runtime errors
- Verify API key matches between .env and Script Properties
- Check spam folder

## Test 2: Resend Verification Email

### Steps:
1. From the verification modal, click "Resend Verification Email"
2. Wait a few seconds

### Expected Results:
- ✅ "Verification email resent successfully!" message appears
- ✅ New Firebase verification email received
- ✅ "Verification Email Resent" email received with instructions
- ✅ Entry in EmailLogs sheet:
  - type: `resendVerificationNote`
  - status: `SUCCESS`

## Test 3: Project Submission Confirmation

### Steps:
1. Sign in to your account
2. Navigate to "Create Project" or "Submit Project"
3. Fill in project details:
   - Title: "Test Community Garden"
   - Description: "A test project for the community"
   - Location: "123 Main St"
   - Start Date: Select a future date
   - Fill other required fields
4. Click "Submit" or "Submit for Review"

### Expected Results:
- ✅ Project submitted successfully
- ✅ Confirmation message appears
- ✅ Submission confirmation email received with:
  - Project title
  - "What happens next?" section
  - "View/Edit Submission" button
- ✅ Entry in EmailLogs sheet:
  - type: `submission`
  - status: `SUCCESS`

## Test 4: Admin Approval Email

### Steps:
1. Sign in as admin (admin@wasilah.org or your admin account)
2. Open Admin Panel
3. Navigate to "Submissions" tab
4. Find the test project you submitted
5. Click "Approve" button
6. Optionally add admin comments
7. Confirm approval

### Expected Results:
- ✅ Project status changes to "Approved"
- ✅ Approval email received with:
  - Congratulatory message with 🎉
  - "Your project is now visible!" notice
  - "Next steps" section
  - "View Your Project" button
- ✅ Two entries in EmailLogs sheet:
  - type: `submission` (status update via old system)
  - type: `approval` (new celebratory email)

## Test 5: Scheduled Reminder Creation

### Steps:
1. While creating or editing a submission, scroll to "Reminders" section
2. Click "Add Reminder"
3. Fill in reminder details:
   - Title: "Test Reminder"
   - Description: "This is a test reminder message"
   - Date: Tomorrow's date
   - Time: 5 minutes from now (for quick testing)
   - Notify Emails: your-test-email@gmail.com
4. Submit the form

### Expected Results:
- ✅ Submission saved successfully
- ✅ Check Reminders Google Sheet:
  - New row added with your reminder details
  - `sent` column is `FALSE`
  - `scheduledTimestampUTC` is correct date/time in ISO format
- ✅ Entry in EmailLogs sheet:
  - type: `createReminder`
  - status: `SUCCESS`

## Test 6: Reminder Email Delivery

### Steps:
1. Wait for the scheduled time (or run trigger manually)
2. In Apps Script, go to Triggers
3. Click on your `sendScheduledReminders` trigger
4. Or manually run: Open Code.gs > Select `sendScheduledReminders` > Click Run

### Expected Results:
- ✅ Reminder email received with:
  - Subject: "Reminder: Test Community Garden — Test Reminder"
  - Your custom message displayed
  - "This reminder was scheduled by you at Wasillah" footer
- ✅ Check Reminders sheet:
  - `sent` column is now `TRUE`
  - `sentTimestamp` populated with current timestamp
- ✅ Entry in EmailLogs sheet:
  - type: `reminder`
  - status: `SUCCESS`

## Test 7: API Key Validation

### Steps:
1. Open browser Developer Tools (F12)
2. Go to Console tab
3. Temporarily change `VITE_APPS_SCRIPT_API_KEY` in .env to "wrong-key"
4. Rebuild: `npm run build`
5. Try signing up a new user

### Expected Results:
- ✅ Signup completes (Firebase Auth works)
- ✅ Verification modal appears
- ✅ Console shows error about email not sent
- ✅ No welcome email received
- ✅ Entry in EmailLogs sheet:
  - type: `unauthorized`
  - status: `FAILED`
  - error: `Invalid API key`

**Important:** Restore correct API key after test!

## Test 8: Rate Limiting

### Steps:
1. Open browser Developer Tools
2. Go to Console tab
3. Run this code 6 times rapidly:

```javascript
// Paste in console - Replace with your actual values:
// - Get APPS_SCRIPT_URL from Apps Script deployment (e.g., https://script.google.com/macros/s/AKfycbz.../exec)
// - Get API_KEY from your .env file (VITE_APPS_SCRIPT_API_KEY)

const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec';
const API_KEY = 'your-api-key-from-env';

fetch(APPS_SCRIPT_URL, {
  method: 'POST',
  body: JSON.stringify({
    apiKey: API_KEY,
    type: 'welcome',
    name: 'Rate Test',
    email: 'ratetest@example.com',
    appUrl: window.location.origin
  })
}).then(r => r.json()).then(console.log)
```

### Expected Results:
- ✅ First 5 requests succeed (status: ok)
- ✅ 6th request fails with:
  - status: `error`
  - message: `Rate limit exceeded. Please try again later.`
- ✅ Entry in EmailLogs sheet:
  - type: varies
  - status: `RATE_LIMITED`

## Test 9: HTML Sanitization

### Steps:
1. Create a reminder with malicious HTML in message:
   ```
   <script>alert('XSS')</script>Hello World
   ```
2. Wait for reminder to be sent

### Expected Results:
- ✅ Reminder email received
- ✅ Script tag stripped from email
- ✅ Email shows: "Hello World" (without script)
- ✅ No JavaScript executed

## Test 10: Password Reset (Firebase Auth)

### Steps:
1. Click "Forgot Password" on login page
2. Enter your email
3. Click "Send Reset Link"

### Expected Results:
- ✅ Password reset email received from Firebase
- ✅ Click link and reset password successfully
- ✅ Can sign in with new password

**Note:** Password reset uses Firebase Auth's built-in system. No custom email needed.

## Monitoring Checklist

After testing, verify:

- [ ] EmailLogs sheet has entries for all tests
- [ ] All statuses are `SUCCESS` (except intentional failures)
- [ ] No errors in Apps Script Executions
- [ ] Reminders sheet shows sent reminders with timestamps
- [ ] No emails in spam folder
- [ ] All email templates render correctly in different email clients

## Email Client Testing

Test email rendering in:
- [ ] Gmail (web and mobile)
- [ ] Outlook
- [ ] Apple Mail
- [ ] Mobile devices (iOS and Android)

### Expected:
- Emails should be responsive
- Colors and styling preserved
- Links clickable
- Images (if any) display correctly

## Performance Testing

- [ ] Emails sent within 5 seconds of trigger
- [ ] No timeouts or errors under normal load
- [ ] Rate limiting prevents abuse
- [ ] Quota usage tracked in logs

## Production Checklist

Before going live:

- [ ] All tests pass successfully
- [ ] API keys rotated and secured
- [ ] EmailLogs monitoring set up
- [ ] Quota limits reviewed
- [ ] Error alerting configured
- [ ] Backup email system ready (if needed)
- [ ] User documentation updated
- [ ] Support team trained on email system

## Common Issues and Solutions

### Issue: Emails not arriving
**Solutions:**
1. Check spam folder
2. Verify email address is correct
3. Check EmailLogs for errors
4. Review Apps Script Executions
5. Verify quota not exceeded

### Issue: Reminders not sending
**Solutions:**
1. Check trigger is active
2. Verify date/time is in future
3. Check timezone (must be UTC)
4. Run `sendScheduledReminders()` manually
5. Review execution logs

### Issue: Verification modal not showing
**Solutions:**
1. Check browser console for errors
2. Verify VerificationModal imported
3. Check z-index conflicts
4. Clear browser cache

### Issue: API key invalid
**Solutions:**
1. Verify .env matches Script Properties
2. Check for typos in key
3. Redeploy frontend after changing .env
4. Restart dev server

## Quota Monitoring

Gmail daily limit: **100 emails**

### Monitor usage:
1. Open EmailLogs sheet
2. Count entries for today (filter by timestamp)
3. Set up alert when approaching 80 emails
4. Consider Google Workspace upgrade if needed

## Success Criteria

All tests must pass with:
- ✅ 100% email delivery success rate
- ✅ No security vulnerabilities
- ✅ Rate limiting working
- ✅ HTML sanitization effective
- ✅ All logs recorded correctly
- ✅ User experience smooth and clear

## Support

If you encounter issues:
1. Check EmailLogs sheet first
2. Review Apps Script Executions
3. Check browser console for frontend errors
4. Refer to EMAIL_SYSTEM_DOCUMENTATION.md
5. Create an issue with logs and error messages

## Next Steps

After all tests pass:
1. Deploy to production
2. Monitor EmailLogs daily
3. Set up quota alerts
4. Train team on system
5. Document any custom configurations
