# Migration Guide: Client-Side to Server-Side Emails

## Overview

This guide explains how to migrate from insecure client-side email sending to secure server-side email sending using Vercel Serverless Functions.

## Why Migrate?

### Current Issues (Client-Side):
❌ API keys exposed in browser console  
❌ Users can inspect network requests and steal API keys  
❌ No rate limiting or abuse prevention  
❌ CORS issues may block requests  
❌ Unreliable (depends on user's network)

### Benefits (Server-Side):
✅ API keys kept secret on server  
✅ Better security and rate limiting  
✅ No CORS issues  
✅ More reliable delivery  
✅ Easier to debug and monitor

## New API Endpoints

### 1. `/api/send-welcome-email`
**Purpose:** Send welcome email after user signup

**Request:**
```bash
POST /api/send-welcome-email
Content-Type: application/json

{
  "email": "user@example.com",
  "name": "John Doe"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Welcome email sent successfully",
  "email": "user@example.com"
}
```

**Response (Error):**
```json
{
  "error": "Missing required fields",
  "received": { "email": null, "name": "John" }
}
```

### 2. `/api/send-volunteer-confirmation`
**Purpose:** Send confirmation email after volunteer form submission

**Request:**
```bash
POST /api/send-volunteer-confirmation
Content-Type: application/json

{
  "email": "volunteer@example.com",
  "name": "Jane Smith"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Volunteer confirmation email sent successfully",
  "email": "volunteer@example.com"
}
```

### 3. `/api/send-reminder` (Already Exists)
**Purpose:** Send scheduled reminder emails

**Request:**
```bash
POST /api/send-reminder
Content-Type: application/json

{
  "reminderId": "abc123",
  "email": "user@example.com",
  "name": "User Name",
  "projectName": "Project Name",
  "message": "Reminder message"
}
```

## Code Changes Required

### Step 1: Update AuthContext.tsx (Welcome Email)

**Current Code (Insecure):**
```typescript
// src/contexts/AuthContext.tsx
import { sendWelcomeEmail } from '../services/mailerSendEmailService';

// In signup function:
try {
  await sendWelcomeEmail({
    email: email,
    name: displayName
  });
} catch (error) {
  console.error('Failed to send welcome email:', error);
}
```

**New Code (Secure):**
```typescript
// src/contexts/AuthContext.tsx
// Remove the import:
// import { sendWelcomeEmail } from '../services/mailerSendEmailService';

// In signup function:
try {
  // Send welcome email via server-side API
  const response = await fetch('/api/send-welcome-email', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: email,
      name: displayName
    })
  });
  
  if (!response.ok) {
    console.error('Failed to send welcome email:', await response.json());
  }
} catch (error) {
  console.error('Failed to send welcome email:', error);
  // Don't fail the signup if email fails
}
```

### Step 2: Update Volunteer.tsx (Volunteer Confirmation)

**Current Code (Insecure):**
```typescript
// src/pages/Volunteer.tsx
import { sendVolunteerConfirmation } from '../services/mailerSendEmailService';

// In form submit:
sendVolunteerConfirmation({
  email: formData.email,
  name: `${formData.firstName} ${formData.lastName}`
}).catch(err => console.error('Resend confirmation failed:', err));
```

**New Code (Secure):**
```typescript
// src/pages/Volunteer.tsx
// Remove the import:
// import { sendVolunteerConfirmation } from '../services/mailerSendEmailService';

// In form submit:
try {
  // Send volunteer confirmation via server-side API
  const response = await fetch('/api/send-volunteer-confirmation', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: formData.email,
      name: `${formData.firstName} ${formData.lastName}`
    })
  });
  
  if (!response.ok) {
    console.error('Failed to send confirmation email:', await response.json());
  }
} catch (err) {
  console.error('Resend confirmation failed:', err);
}
```

## Testing

### Test 1: Welcome Email
1. Sign up with a new account
2. Check browser console for API call to `/api/send-welcome-email`
3. Check email inbox for welcome email
4. Check Vercel logs: `vercel logs --follow`

### Test 2: Volunteer Confirmation
1. Submit volunteer form
2. Check browser console for API call to `/api/send-volunteer-confirmation`
3. Check email inbox for confirmation
4. Check Vercel logs: `vercel logs --follow`

## Deployment Checklist

- [ ] New API files created in `/api` directory
  - [ ] `api/send-welcome-email.js`
  - [ ] `api/send-volunteer-confirmation.js`
- [ ] Environment variables set in Vercel
  - [ ] `MAILERSEND_API_KEY`
  - [ ] `MAILERSEND_SENDER_EMAIL`
- [ ] Frontend code updated
  - [ ] `src/contexts/AuthContext.tsx` (welcome email)
  - [ ] `src/pages/Volunteer.tsx` (volunteer confirmation)
- [ ] Remove or comment out insecure imports
- [ ] Test all email flows
- [ ] Monitor Vercel logs for errors

## Environment Variables

Make sure these are set in Vercel Dashboard:

```bash
MAILERSEND_API_KEY=mlsn.your_actual_api_key_here
MAILERSEND_SENDER_EMAIL=MS_xxxxx@trial-xxxxx.mlsender.net
```

**DO NOT SET:**
- ❌ `VITE_MAILERSEND_API_KEY` (exposes key to browser!)

## Rollback Plan

If something goes wrong:

1. **Revert frontend changes:**
   ```bash
   git revert HEAD
   git push origin main
   ```

2. **Keep new API endpoints** - they're harmless if not used

3. **Check Vercel logs** for errors:
   ```bash
   vercel logs --follow
   ```

## FAQ

### Q: Can I still use the old mailerSendEmailService.ts?
**A:** No, it's insecure. The new API endpoints should be used instead.

### Q: What about Firebase Functions for emails?
**A:** Firebase Functions are great for database-triggered emails (submissions, approvals). Use them for:
- Project submission confirmations
- Event submission confirmations  
- Approval notifications

Use Vercel Functions for user-initiated emails:
- Welcome emails (after signup)
- Volunteer confirmations (after form submit)

### Q: How do I debug email issues?
**A:** 
1. Check browser console for API errors
2. Check Vercel logs: `vercel logs`
3. Check MailerSend dashboard for delivery status
4. Use curl to test API directly

### Q: Will this break existing functionality?
**A:** No. The old code will gracefully fail (log warning) if `VITE_MAILERSEND_API_KEY` is not set. The new code will work immediately once deployed.

## Support

For issues:
1. Check Vercel logs
2. Check MailerSend dashboard
3. Verify environment variables are set
4. Test API endpoints directly with curl

## Security Best Practices

✅ **Do:**
- Keep API keys in environment variables
- Use server-side functions for email sending
- Validate input before sending emails
- Rate limit API endpoints

❌ **Don't:**
- Expose API keys in frontend code
- Trust client-side data without validation
- Send emails directly from browser
- Commit `.env` files to git

## Next Steps

After migration:
1. Monitor email delivery rates
2. Set up alerts for failed emails
3. Add rate limiting to API endpoints
4. Consider email templates in MailerSend dashboard
5. Implement email retry logic for failures
