# Firebase Auth Popup Error Fix

## Problem
You were experiencing the error: `Firebase: Error (auth/popup-closed-by-user)` when attempting to log in using Google or Facebook authentication.

## Root Cause
The Firebase configuration in `src/config/firebase.ts` was using **hardcoded values** instead of reading from **environment variables**. This meant that when you updated your environment variables (`.env` file), the changes were not being reflected in the application.

## Changes Made

### 1. Updated Firebase Configuration to Use Environment Variables
**File:** `src/config/firebase.ts`

Changed from hardcoded values:
```typescript
const firebaseConfig = {
  apiKey: "AIzaSyCAzJf4xhj8YHT6ArbmVdzkOpGKwFTHkCU",
  authDomain: "wasilah-new.firebaseapp.com",
  // ...
};
```

To environment variable-based configuration with fallbacks:
```typescript
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyCAzJf4xhj8YHT6ArbmVdzkOpGKwFTHkCU",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "wasilah-new.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "wasilah-new",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "wasilah-new.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "577353648201",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:577353648201:web:322c63144b84db4d2c5798"
};
```

### 2. Added OAuth Provider Custom Parameters
Added proper configuration for Google and Facebook authentication providers to improve popup behavior:

```typescript
// Configure Google Auth Provider with custom parameters
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

// Configure Facebook Auth Provider with custom parameters
export const facebookProvider = new FacebookAuthProvider();
facebookProvider.setCustomParameters({
  display: 'popup'
});
```

## What This Fixes

1. **Environment Variable Support**: Your Firebase configuration now properly reads from environment variables, allowing you to update credentials without modifying code.

2. **Better Popup Handling**: The custom parameters ensure:
   - Google login always shows the account selection screen
   - Facebook login properly displays in popup mode
   - Reduces chances of popup-closed-by-user errors

3. **Flexible Configuration**: The fallback values ensure the app still works even if environment variables are not set (useful for development).

## How to Use

### Step 1: Create a `.env` File
Create a `.env` file in the root of your project with your Firebase configuration:

```env
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### Step 2: Verify Firebase Console Settings
Ensure your Firebase project is properly configured:

1. **Go to Firebase Console**: https://console.firebase.google.com/
2. **Select your project**: `wasilah-new`
3. **Navigate to Authentication > Sign-in method**
4. **Verify Authorized Domains**:
   - Go to the "Settings" tab in Authentication
   - Under "Authorized domains", ensure your domain is listed (e.g., `wasilah-new.firebaseapp.com`, `localhost`, and your production domain)
   
5. **For Google OAuth**:
   - Ensure Google provider is enabled in Firebase Console
   - Verify OAuth consent screen is properly configured in Google Cloud Console
   
6. **For Facebook OAuth**:
   - Ensure Facebook provider is enabled in Firebase Console
   - Verify your app domain is added to Facebook App settings

### Step 3: Rebuild Your Application
After creating or updating your `.env` file:

```bash
npm run build
```

### Step 4: Test Authentication
1. Clear your browser cache and cookies
2. Test Google login
3. Test Facebook login

## Additional Troubleshooting

If you still experience issues:

### Check Browser Console
Look for specific error messages that can provide more details:
- Open browser DevTools (F12)
- Go to Console tab
- Attempt login and note any errors

### Common Issues & Solutions

1. **Domain Not Authorized**
   - **Error**: `auth/unauthorized-domain`
   - **Solution**: Add your domain to Firebase Console > Authentication > Settings > Authorized domains

2. **Invalid OAuth Client**
   - **Error**: Related to OAuth configuration
   - **Solution**: Verify your OAuth consent screen is properly configured in Google Cloud Console

3. **Popup Blocked by Browser**
   - **Error**: Popup window doesn't appear
   - **Solution**: Check browser popup blocker settings and allow popups for your domain

4. **CORS Issues**
   - **Error**: Cross-origin errors in console
   - **Solution**: Already handled via `vite.config.ts` headers, but verify your production server has similar CORS headers

### Verify Environment Variables Are Loaded
Add this temporarily to your code to debug:
```typescript
console.log('Firebase Config:', {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY ? 'Set' : 'Not Set',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID
});
```

## Next Steps

1. ✅ Code changes are complete
2. ⏳ Create or update your `.env` file with correct values
3. ⏳ Rebuild the application
4. ⏳ Test authentication in your browser
5. ⏳ Verify authorized domains in Firebase Console

## Support

If issues persist:
1. Check Firebase Console for proper OAuth provider configuration
2. Verify your OAuth consent screen settings
3. Ensure authorized domains include your deployment domain
4. Check browser console for specific error messages
