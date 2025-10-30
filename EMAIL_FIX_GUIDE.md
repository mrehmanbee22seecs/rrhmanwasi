# Email Not Sending - Root Cause & Fix

## Problem Summary
Emails are not being received despite environment variables being set in Vercel.

## Root Causes Identified

### 1. **CRITICAL: Invalid Sender Email Format in Firebase Functions**
**Location:** `functions/emailFunctions.js` line 29

**Before (BROKEN):**
```javascript
const SENDER_EMAIL = 'test-ywj2lpn1kvpg7oqz.mlsender.net/';
```

**Issues:**
- ❌ Missing `@` symbol (required for email format)
- ❌ Has trailing slash `/` (invalid character)
- ❌ Wrong format - should be `username@domain.com`

**After (FIXED):**
```javascript
const SENDER_EMAIL = process.env.MAILERSEND_SENDER_EMAIL || 'MS_qJLYQi@trial-0r83ql3jjz8lgwpz.mlsender.net';
```

### 2. **Environment Variable Not Being Used**
The hardcoded sender email wasn't reading from `process.env.MAILERSEND_SENDER_EMAIL`, so even though you set it in Vercel, the code was using the broken hardcoded value.

### 3. **Client-Side Email Sending (Security Issue)**
**Location:** `src/services/mailerSendEmailService.ts`

**Problem:**
- Emails are being sent from the browser (client-side)
- This exposes your API key in the browser console
- MailerSend API may block requests due to CORS
- This is a **security vulnerability**

**Impact:**
- Welcome emails on signup - sent from browser ❌
- Volunteer confirmation emails - sent from browser ❌

**Server-Side Emails (Working Correctly):**
- Submission confirmation emails - Firebase Functions ✅
- Approval emails - Firebase Functions ✅
- Reminder emails - Vercel Serverless Function ✅

## Environment Variables Checklist

### ✅ Variables You Set in Vercel (Correct)
- `MAILERSEND_API_KEY` - ✅ Correct (no VITE_ prefix for serverless)
- `MAILERSEND_SENDER_EMAIL` - ✅ Correct format
- `FIREBASE_PROJECT_ID` - ✅
- `FIREBASE_CLIENT_EMAIL` - ✅
- `FIREBASE_PRIVATE_KEY` - ✅
- `VITE_QSTASH_TOKEN` - ✅
- `VITE_CLOUDINARY_CLOUD_NAME` - ✅
- `VITE_CLOUDINARY_UPLOAD_PRESET` - ✅
- `VITE_APPS_SCRIPT_URL` - ✅
- `VITE_APPS_SCRIPT_API_KEY` - ✅

### ⚠️ Important Notes About Environment Variables

#### Vercel Environment Variables:
1. **Serverless Functions (`/api` directory):**
   - Use: `MAILERSEND_API_KEY` (without VITE_ prefix)
   - Access: `process.env.MAILERSEND_API_KEY`
   
2. **Frontend (Browser/Vite):**
   - Use: `VITE_` prefix for public variables only
   - ❌ **NEVER** use `VITE_MAILERSEND_API_KEY` (security risk!)
   
3. **Firebase Functions:**
   - Deploy separately with Firebase CLI
   - Set via: `firebase functions:config:set`
   - Or use `.env` file locally

## Fixed Files

### 1. `functions/emailFunctions.js`
- ✅ Fixed sender email format
- ✅ Now uses `MAILERSEND_SENDER_EMAIL` environment variable
- ✅ Falls back to valid trial domain if not set

### 2. `.env.example`
- ✅ Updated with all environment variables
- ✅ Added clear comments about VITE_ prefix usage
- ✅ Removed insecure `VITE_MAILERSEND_API_KEY`

## How to Deploy the Fix

### Option A: Vercel Deployment (Recommended for Serverless Functions)

1. **Ensure environment variables are set in Vercel Dashboard:**
   ```
   MAILERSEND_API_KEY=your_actual_api_key
   MAILERSEND_SENDER_EMAIL=MS_xxxxx@trial-xxxxx.mlsender.net
   FIREBASE_PROJECT_ID=your_project_id
   FIREBASE_CLIENT_EMAIL=your_client_email
   FIREBASE_PRIVATE_KEY=your_private_key_with_newlines
   ```

2. **Deploy to Vercel:**
   ```bash
   vercel --prod
   ```

### Option B: Firebase Functions Deployment

1. **Set Firebase Functions config:**
   ```bash
   firebase functions:config:set \
     mailersend.api_key="your_actual_api_key" \
     mailersend.sender_email="MS_xxxxx@trial-xxxxx.mlsender.net"
   ```

2. **Deploy Firebase Functions:**
   ```bash
   firebase deploy --only functions
   ```

### Option C: Local Development

1. **Create `.env.local` file in project root:**
   ```bash
   MAILERSEND_API_KEY=your_actual_api_key
   MAILERSEND_SENDER_EMAIL=MS_xxxxx@trial-xxxxx.mlsender.net
   FIREBASE_PROJECT_ID=your_project_id
   FIREBASE_CLIENT_EMAIL=your_client_email
   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..."
   ```

2. **Run locally:**
   ```bash
   npm run dev
   ```

## Testing the Fix

### Test 1: Vercel Serverless Function (Reminders)
```bash
curl -X POST https://your-app.vercel.app/api/send-reminder \
  -H "Content-Type: application/json" \
  -d '{
    "reminderId": "test123",
    "email": "test@example.com",
    "name": "Test User",
    "projectName": "Test Project",
    "message": "This is a test reminder"
  }'
```

**Expected:** Email should be sent successfully

### Test 2: Firebase Functions (Submissions)
1. Submit a project or event through the website
2. Check Firestore for the submission document
3. Check MailerSend dashboard for sent email
4. Check Functions logs: `firebase functions:log`

**Expected:** Confirmation email sent to submitter

### Test 3: Check MailerSend Dashboard
1. Go to [MailerSend Dashboard](https://app.mailersend.com)
2. Navigate to "Analytics" → "Email Activity"
3. Look for recent email sends
4. Check delivery status

## Why Emails Weren't Being Sent

### Before Fix:
```javascript
// This was the broken sender email:
const SENDER_EMAIL = 'test-ywj2lpn1kvpg7oqz.mlsender.net/';

// MailerSend tried to send from:
From: "Wasillah Team" <test-ywj2lpn1kvpg7oqz.mlsender.net/>
                        ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
                        INVALID EMAIL ADDRESS!
```

### After Fix:
```javascript
// Now uses proper email format:
const SENDER_EMAIL = 'MS_qJLYQi@trial-0r83ql3jjz8lgwpz.mlsender.net';

// MailerSend sends from:
From: "Wasillah Team" <MS_qJLYQi@trial-0r83ql3jjz8lgwpz.mlsender.net>
                        ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
                        VALID EMAIL ADDRESS!
```

## Recommended Next Steps

### 1. Remove Client-Side Email Sending (Security Issue)
The frontend should NOT send emails directly. Instead:

**Option A: Use Vercel Serverless Functions**
Create API endpoints for:
- `/api/send-welcome-email`
- `/api/send-volunteer-confirmation`

**Option B: Use Firebase Functions**
- Already have `onProjectSubmissionCreate`
- Already have `onEventSubmissionCreate`
- Add `onUserCreate` trigger for welcome emails

### 2. Verify Your Domain in MailerSend
Currently using trial domain. For production:
1. Add your domain in MailerSend dashboard
2. Add DNS records (SPF, DKIM)
3. Update `MAILERSEND_SENDER_EMAIL` to use your domain

### 3. Monitor Email Delivery
Set up alerts in MailerSend for:
- Failed deliveries
- Bounce rates
- Spam complaints

## Verification Checklist

- [x] Fixed sender email format in `functions/emailFunctions.js`
- [x] Updated to use environment variable
- [x] Updated `.env.example` with all required variables
- [ ] Deploy to Vercel/Firebase
- [ ] Test reminder emails via API
- [ ] Test submission emails via Firestore triggers
- [ ] Check MailerSend dashboard for sent emails
- [ ] Verify no client-side email sending in production
- [ ] Set up email delivery monitoring

## Support

If emails still don't work after this fix:

1. **Check Vercel Logs:**
   ```bash
   vercel logs
   ```

2. **Check Firebase Functions Logs:**
   ```bash
   firebase functions:log
   ```

3. **Check MailerSend Dashboard:**
   - Look for failed sends
   - Check error messages
   - Verify API key is active

4. **Verify Environment Variables:**
   ```bash
   # In Vercel
   vercel env ls
   
   # In Firebase
   firebase functions:config:get
   ```

## Security Note

🔒 **NEVER commit these files with real values:**
- `.env`
- `.env.local`
- `serviceAccountKey.json`

These are already in `.gitignore` ✅
