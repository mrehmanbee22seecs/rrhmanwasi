# Quick Fix Guide: Auth Popup Error

## ✅ What Was Fixed

The Firebase configuration now properly reads from environment variables, and OAuth providers are configured for better popup handling.

## 🚀 Quick Start (3 Steps)

### Step 1: Create `.env` File
Create a file named `.env` in the project root:

```env
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

**Where to find these values:**
- Go to [Firebase Console](https://console.firebase.google.com/)
- Select your project
- Go to Project Settings (gear icon) > General
- Scroll down to "Your apps" section
- Copy the values from your web app configuration

### Step 2: Rebuild
```bash
npm run build
```

### Step 3: Verify Firebase Console
1. Go to Firebase Console > Authentication > Sign-in method
2. Click on "Settings" tab
3. Under "Authorized domains", make sure your domain is listed:
   - `localhost` (for development)
   - `wasilah-new.firebaseapp.com` (Firebase hosting)
   - Your custom domain (if any)

## 🔍 Test It

1. Clear browser cache and cookies
2. Navigate to your app
3. Try logging in with Google
4. Try logging in with Facebook

## ❓ Still Having Issues?

### Check Browser Console
Open DevTools (F12) → Console tab and look for error messages.

### Common Issues:

**Issue**: "Domain not authorized"
- **Fix**: Add your domain to Authorized domains in Firebase Console

**Issue**: "Invalid OAuth client"
- **Fix**: Check OAuth consent screen in Google Cloud Console

**Issue**: Popup is blocked
- **Fix**: Allow popups for your domain in browser settings

## 📚 More Details

See `AUTH_POPUP_FIX.md` for comprehensive documentation and troubleshooting.

## 🎯 Key Changes

1. **Environment Variables**: Config now reads from `.env` file
2. **Google Auth**: Always shows account selection screen
3. **Facebook Auth**: Properly configured for popup display
4. **Fallback Values**: App still works without `.env` (uses defaults)

## 💡 Pro Tip

To verify your environment variables are loaded, add this temporarily to your code:

```javascript
console.log('Firebase Config Check:', {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY ? '✓ Loaded' : '✗ Using default',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'Using default',
});
```

Then check the browser console after rebuilding.
