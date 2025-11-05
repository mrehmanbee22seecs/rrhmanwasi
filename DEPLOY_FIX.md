# Deploy the Auth Fix

## Critical: You Must Redeploy

The fix requires **redeploying to Firebase Hosting** because the CORS headers are configured in `firebase.json` and only take effect after deployment.

## Quick Deploy (3 Steps)

### Step 1: Build the Application
```bash
npm run build
```

### Step 2: Deploy to Firebase Hosting
```bash
firebase deploy --only hosting
```

### Step 3: Test Authentication
1. Go to your live site (after deploy completes)
2. Clear browser cache (Ctrl+Shift+Delete or Cmd+Shift+Delete)
3. Try Google login
4. Try Facebook login

## What Was Fixed

### The Problem
The OAuth popup authentication was failing because:
- **Production** (Firebase Hosting) was missing CORS headers
- Development worked because `vite.config.ts` had the headers
- Production didn't work because `firebase.json` was missing the headers

### The Solution
Added these headers to `firebase.json`:
```json
{
  "key": "Cross-Origin-Opener-Policy",
  "value": "same-origin-allow-popups"
},
{
  "key": "Cross-Origin-Embedder-Policy",
  "value": "unsafe-none"
}
```

## Verify the Fix

After deploying, verify the headers are applied:

### Using curl:
```bash
curl -I https://wasilah-new.web.app
```

Look for these headers in the response:
```
Cross-Origin-Opener-Policy: same-origin-allow-popups
Cross-Origin-Embedder-Policy: unsafe-none
```

### Using Browser DevTools:
1. Open your site
2. Press F12 (DevTools)
3. Go to Network tab
4. Refresh page
5. Click on the first request (your domain)
6. Look at Response Headers
7. Verify CORS headers are present

## If It Still Doesn't Work After Deploy

1. **Clear Browser Cache**: Ctrl+Shift+Delete (or Cmd+Shift+Delete on Mac)
2. **Try Incognito/Private Mode**: Opens a clean session
3. **Check Firebase Console**: 
   - Authentication > Sign-in method
   - Verify Google/Facebook providers are enabled
   - Check Settings > Authorized domains

## Full Deployment (if needed)

If you want to deploy everything:
```bash
# Build first
npm run build

# Deploy all (hosting, functions, firestore, storage)
firebase deploy

# Or deploy specific parts:
firebase deploy --only hosting
firebase deploy --only functions
firebase deploy --only firestore:rules
firebase deploy --only storage
```

## Alternative: Use Firebase Hosting for Development

Test with Firebase emulator locally:
```bash
# Start Firebase emulators
firebase emulators:start

# In another terminal, build
npm run build

# Access at http://localhost:5000
```

This tests the production configuration locally.

## Rollback (if something goes wrong)

If you need to rollback:
```bash
# List recent hosting releases
firebase hosting:channel:list

# View deployment history
firebase hosting:releases:list

# Rollback to previous version
firebase hosting:rollback
```

## Environment Variables Reminder

If you haven't already, create `.env` file:
```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=wasilah-new.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=wasilah-new
VITE_FIREBASE_STORAGE_BUCKET=wasilah-new.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

Then rebuild before deploying.

## Success Checklist

- [ ] Ran `npm run build` successfully
- [ ] Ran `firebase deploy --only hosting` successfully
- [ ] Cleared browser cache
- [ ] Tested Google login - popup opens and completes
- [ ] Tested Facebook login - popup opens and completes
- [ ] Verified CORS headers in browser DevTools

## Need Help?

If you're still having issues after deployment:
1. Check `TROUBLESHOOTING_AUTH.md` for detailed diagnostics
2. Check browser console for error messages
3. Verify CORS headers are present (see "Verify the Fix" above)
4. Make sure you're testing on the deployed URL, not localhost
