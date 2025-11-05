# Authentication Troubleshooting Guide

## "Not Working" - Quick Diagnosis

If authentication is still not working after the fix, follow these steps to diagnose the issue:

### Step 1: Check Environment Variables

Add this code temporarily to `src/config/firebase.ts` right after the `firebaseConfig` object:

```typescript
// TEMPORARY DEBUG CODE - Remove after diagnosis
console.log('=== Firebase Configuration Debug ===');
console.log('API Key:', firebaseConfig.apiKey.substring(0, 10) + '...');
console.log('Auth Domain:', firebaseConfig.authDomain);
console.log('Project ID:', firebaseConfig.projectId);
console.log('Using .env values:', {
  apiKey: !!import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: !!import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: !!import.meta.env.VITE_FIREBASE_PROJECT_ID
});
console.log('====================================');
```

**What to look for:**
- If all values show `false`, your `.env` file is not being loaded
- If the values don't match your Firebase project, they're incorrect

### Step 2: Verify .env File Exists and is Correctly Named

```bash
# Check if .env file exists in project root
ls -la .env

# If not found, create it:
cp .env.example .env

# Edit with your Firebase values
nano .env  # or use your preferred editor
```

**IMPORTANT**: The file MUST be named `.env` (not `.env.txt` or `.env.local` or anything else)

### Step 3: Check Browser Console for Specific Errors

1. Open browser DevTools (F12)
2. Go to Console tab
3. Click on the Google/Facebook login button
4. Look for error messages

**Common errors and solutions:**

#### Error: `auth/popup-blocked`
**Cause**: Browser is blocking the popup
**Solution**: 
- Allow popups for your domain in browser settings
- Try again - browser may prompt to allow

#### Error: `auth/unauthorized-domain`
**Cause**: Your domain is not authorized in Firebase Console
**Solution**:
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select project: `wasilah-new`
3. Go to Authentication > Settings
4. Under "Authorized domains", add:
   - `localhost` (for development)
   - Your production domain

#### Error: `auth/popup-closed-by-user`
**Cause**: User closed popup OR popup closed unexpectedly
**Solution**:
- This is now handled with a user-friendly message
- If it happens immediately without showing popup: check popup blockers
- If popup shows but closes: check OAuth consent screen configuration

#### Error: `auth/invalid-api-key` or `auth/invalid-app-credential`
**Cause**: Wrong Firebase configuration values
**Solution**:
1. Go to Firebase Console > Project Settings
2. Scroll to "Your apps" section
3. Copy the correct values to your `.env` file
4. Rebuild: `npm run build`

#### Error: `auth/operation-not-allowed`
**Cause**: Sign-in provider not enabled in Firebase
**Solution**:
1. Go to Firebase Console > Authentication > Sign-in method
2. Enable Google and/or Facebook provider
3. Configure OAuth consent screen (for Google)
4. Add Facebook App ID and Secret (for Facebook)

### Step 4: Verify Firebase Console Configuration

#### For Google OAuth:
1. Firebase Console > Authentication > Sign-in method
2. Enable Google provider
3. Add support email
4. Save

**Google Cloud Console** (if advanced setup needed):
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. APIs & Services > OAuth consent screen
4. Configure consent screen with:
   - App name
   - User support email
   - Developer contact email
5. APIs & Services > Credentials
6. Verify OAuth 2.0 Client ID exists
7. Add authorized redirect URIs:
   - `https://wasilah-new.firebaseapp.com/__/auth/handler`
   - `https://your-domain.com/__/auth/handler` (your production domain)
   - `http://localhost:5173/__/auth/handler` (for development)

#### For Facebook OAuth:
1. Firebase Console > Authentication > Sign-in method
2. Enable Facebook provider
3. You'll need:
   - Facebook App ID
   - Facebook App Secret
4. Copy the OAuth redirect URI provided by Firebase

**Facebook Developers** (https://developers.facebook.com/):
1. Go to your Facebook App
2. Settings > Basic
3. Add your domains to "App Domains"
4. Facebook Login > Settings
5. Add "Valid OAuth Redirect URIs":
   - Use the URI from Firebase Console (step 4 above)
   - Format: `https://wasilah-new.firebaseapp.com/__/auth/handler`

### Step 5: Test with Network Tab

1. Open browser DevTools (F12)
2. Go to Network tab
3. Click login button
4. Look for failed requests (red entries)
5. Click on failed request to see details

**What to look for:**
- 403 errors: Authorization/permission issues
- 400 errors: Bad request (wrong config)
- CORS errors: Domain not authorized

### Step 6: Clear Cache and Rebuild

Sometimes cached files cause issues:

```bash
# Clear build cache
rm -rf dist/
rm -rf node_modules/.vite/

# Rebuild
npm run build

# For development
npm run dev
```

### Step 7: Test in Incognito/Private Mode

This eliminates issues with:
- Browser extensions
- Cached credentials
- Old session data

### Step 8: Check .gitignore

Ensure `.env` is in `.gitignore` (it should be). If you committed `.env` by mistake:

```bash
# Remove from git but keep local file
git rm --cached .env
git commit -m "Remove .env from git"
```

## Still Not Working?

If you've tried all the above and it's still not working, please provide:

1. **Exact error message** from browser console
2. **Screenshot** of the error
3. **What happens** when you click login:
   - Does popup appear at all?
   - Does it immediately close?
   - Does it show an error page?
4. **Browser and version** you're using
5. **Output** of the debug code from Step 1

## Quick Test Script

Add this button temporarily to test configuration:

```typescript
// Add to AuthModal.tsx or any component
const testFirebaseConfig = () => {
  console.log('Testing Firebase Configuration...');
  console.log('Auth instance:', auth);
  console.log('Google provider:', googleProvider);
  console.log('Facebook provider:', facebookProvider);
  console.log('Config loaded from .env:', {
    hasApiKey: !!import.meta.env.VITE_FIREBASE_API_KEY,
    hasAuthDomain: !!import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    hasProjectId: !!import.meta.env.VITE_FIREBASE_PROJECT_ID
  });
};

// Add button
<button onClick={testFirebaseConfig}>Test Config</button>
```

## Success Indicators

You know it's working when:
- ✅ Popup opens successfully
- ✅ Account selection screen appears (Google)
- ✅ Authentication completes
- ✅ You're redirected back to the app
- ✅ You see your user profile/dashboard

## Common Mistakes

1. ❌ `.env` file not in project root
2. ❌ `.env` file not properly formatted
3. ❌ Forgot to rebuild after changing `.env`
4. ❌ Domain not in Firebase authorized domains
5. ❌ OAuth provider not enabled in Firebase Console
6. ❌ Popup blocker is active
7. ❌ Wrong Firebase project credentials
