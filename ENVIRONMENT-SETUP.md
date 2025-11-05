# Environment Setup Guide

Complete guide for setting up all required environment variables and external services for the Wasilah platform.

## Table of Contents
- [Quick Setup](#quick-setup)
- [Firebase Configuration](#firebase-configuration)
- [Cloudinary Setup](#cloudinary-setup)
- [Supabase Setup (Optional)](#supabase-setup-optional)
- [Email Services (Disabled)](#email-services-disabled)
- [Firebase Functions Config](#firebase-functions-config)
- [Vercel Deployment](#vercel-deployment)
- [Testing Configuration](#testing-configuration)

---

## Quick Setup

1. **Copy the example file:**
   ```bash
   cp .env.example .env
   ```

2. **Fill in required values** (see sections below for details)

3. **Verify configuration:**
   ```bash
   npm run build
   ```

---

## Firebase Configuration

### Frontend (Client-side)

These values are **safe to expose** in client-side code. Security is enforced through Firebase security rules.

#### How to Get These Values:

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project (or create a new one)
3. Click on **Project Settings** (⚙️ icon)
4. Scroll to **Your apps** section
5. If you don't have a web app, click **Add app** → **Web**
6. Copy the config values from the Firebase SDK snippet

#### Environment Variables:

```bash
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123:web:abc
```

### Backend (Server-side)

These are **SECRET** and should never be committed to git or exposed client-side.

#### How to Get Service Account Credentials:

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click **Project Settings** → **Service Accounts**
3. Click **Generate New Private Key**
4. Download the JSON file
5. Extract these values:

```bash
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"
```

**Important:** Keep the service account JSON file secure and never commit it!

#### For Firebase Functions:

```bash
FIREBASE_HOSTING_URL=https://your-project.web.app
APP_URL=https://your-production-domain.com
```

---

## Cloudinary Setup

Cloudinary is used for image upload, optimization, and transformation.

### How to Get Cloudinary Credentials:

1. Create account at [Cloudinary](https://cloudinary.com)
2. Go to **Dashboard**
3. Copy your **Cloud Name**
4. Go to **Settings** → **Upload**
5. Create an **Upload Preset**:
   - Click **Add upload preset**
   - Set **Signing Mode** to "Unsigned" (for client uploads)
   - Configure folder and transformations as needed
   - Save and copy the preset name

### Environment Variables:

```bash
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
VITE_CLOUDINARY_UPLOAD_PRESET=your_preset_name
```

### Free Tier Limits:
- 25 GB storage
- 25 GB bandwidth/month
- 25,000 transformations/month

---

## Supabase Setup (Optional)

Only needed if you're using Supabase features. Most functionality uses Firebase.

### How to Get Supabase Credentials:

1. Create project at [Supabase](https://supabase.com)
2. Go to **Project Settings** → **API**
3. Copy the **URL** and **anon public** key

### Environment Variables:

```bash
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
```

**Note:** The `anon` key is safe for client-side use with Row Level Security (RLS) enabled.

---

## Email Services (Disabled)

Email features are currently disabled. When ready to enable:

### MailerSend

1. Create account at [MailerSend](https://www.mailersend.com)
2. Get API key from **Settings** → **API Tokens**
3. Use trial domain or add your custom domain

```bash
VITE_MAILERSEND_API_KEY=mlsnd_xxxxx
MAILERSEND_API_KEY=mlsnd_xxxxx
MAILERSEND_SENDER_EMAIL=your-email@domain.com
```

### Upstash QStash

1. Create account at [Upstash](https://upstash.com)
2. Create QStash queue
3. Copy QStash token

```bash
VITE_QSTASH_TOKEN=eyJhbGc...
```

### Email Webhook

```bash
MAIL_WEBHOOK_URL=https://your-webhook-url.com/send-email
```

---

## Firebase Functions Config

These are set via Firebase CLI, not environment variables:

### Set Configuration:

```bash
# KB Update Token (for knowledge base updates)
firebase functions:config:set kb.update_token="secure_random_token_here"

# Hosting URL
firebase functions:config:set hosting.url="https://your-domain.com"
```

### View Current Config:

```bash
firebase functions:config:get
```

### Generate Secure Token:

```bash
# Linux/Mac
openssl rand -hex 32

# Or use Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## Vercel Deployment

### Adding Environment Variables to Vercel:

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add each variable:
   - **Key:** Variable name (e.g., `VITE_FIREBASE_API_KEY`)
   - **Value:** Your value
   - **Environments:** Select Production, Preview, Development as needed

### Required for Production:

All `VITE_*` variables from your `.env` file should be added to Vercel.

### Sensitive Variables:

For backend/API routes, add without `VITE_` prefix:
- `FIREBASE_PRIVATE_KEY`
- `FIREBASE_CLIENT_EMAIL`
- `MAILERSEND_API_KEY` (when enabled)

### Deploy:

```bash
vercel --prod
```

---

## Testing Configuration

### Local Development:

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Run tests
npm test

# Run tests with coverage
npm run test:coverage
```

### Environment-Specific Testing:

Create additional env files for different environments:

```bash
.env.local          # Local development (gitignored)
.env.development    # Development environment
.env.staging        # Staging environment
.env.production     # Production environment (should use Vercel vars)
```

**Never commit `.env.local` or any file with real credentials!**

---

## Verification Checklist

After setup, verify everything works:

### Frontend:
- [ ] Firebase authentication works (login/signup)
- [ ] Firestore reads/writes work
- [ ] Image upload to Cloudinary works
- [ ] Chat widget loads
- [ ] Admin panel accessible (for admin users)

### Backend:
- [ ] Firebase Functions deploy successfully
- [ ] Firestore rules are enforced
- [ ] Storage rules prevent unauthorized uploads
- [ ] API endpoints respond correctly

### Build & Deploy:
- [ ] `npm run build` succeeds
- [ ] `npm test` passes
- [ ] Vercel deployment succeeds
- [ ] Production site loads without errors

---

## Troubleshooting

### Build fails with "Cannot find module"
- Run `npm install` again
- Delete `node_modules` and `package-lock.json`, then `npm install`

### Firebase connection errors
- Check API key is correct
- Verify Firebase project exists
- Ensure Firestore and Storage are enabled in Firebase Console

### Cloudinary upload fails
- Verify cloud name and upload preset are correct
- Check upload preset signing mode is "Unsigned"
- Ensure CORS is configured in Cloudinary settings

### Vercel deployment fails
- Check all required environment variables are set
- Verify build command is `npm run build`
- Check build logs for specific errors

### Tests fail
- Run `npm test` locally first
- Check that test environment is configured
- Verify imports in test files

---

## Security Best Practices

1. **Never commit secrets** - Use `.gitignore` for `.env` files
2. **Rotate credentials** - Change API keys if compromised
3. **Use different credentials** - Separate dev/staging/production
4. **Restrict API keys** - Use Firebase restrictions where possible
5. **Monitor usage** - Set up Firebase usage alerts
6. **Review rules** - Regularly audit Firestore/Storage rules
7. **Enable 2FA** - On Firebase, Vercel, Cloudinary accounts

---

## Support

For issues or questions:
- Check [SECURITY-AUDIT-REPORT.md](./SECURITY-AUDIT-REPORT.md) for security info
- See [README.md](./README.md) for general documentation
- Open an issue on GitHub

---

**Last Updated:** November 2025
