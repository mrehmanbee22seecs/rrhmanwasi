# Deployment Checklist

## Pre-Deployment

### Firebase Configuration
- [x] Firebase project configured (wasilah-new)
- [x] Firestore security rules updated
- [x] Firestore indexes defined
- [ ] Deploy Firestore rules: `firebase deploy --only firestore:rules`
- [ ] Deploy Firestore indexes: `firebase deploy --only firestore:indexes`

### Cloudinary Configuration
- [ ] Cloudinary account verified
- [ ] API credentials available
- [ ] Set `CLOUDINARY_API_KEY` in Supabase Edge Function
- [ ] Set `CLOUDINARY_API_SECRET` in Supabase Edge Function
- [ ] Set `VITE_CLOUDINARY_CLOUD_NAME` in Supabase Edge Function
- [ ] Deploy Edge Function: Follow Supabase deployment process

### Build Verification
- [x] Project builds without errors
- [x] TypeScript compilation successful
- [x] All dependencies installed
- [x] No console errors in development

## Database Setup

### Initial Data
- [ ] Admin user created in Firebase Auth
- [ ] Admin user document created in Firestore with `isAdmin: true`
- [ ] Default content will initialize automatically on first page load

### Collections to Monitor
- [ ] `content` - Should populate on first page visit
- [ ] `page_content` - For editable sections
- [ ] `project_leaders` - For team members
- [ ] `event_organizers` - For event organizers
- [ ] `users` - User profiles

## Testing Checklist

### Basic Functionality
- [ ] Homepage loads without errors
- [ ] About page loads without errors
- [ ] Contact page loads without errors
- [ ] Navigation works correctly
- [ ] Images display properly

### Public User Access
- [ ] Can view all public content
- [ ] Cannot see edit buttons
- [ ] Cannot access admin features
- [ ] Can submit contact forms

### Admin Features
- [ ] Can log in as admin
- [ ] Edit buttons appear on editable content
- [ ] Can edit hero section
- [ ] Can edit about content
- [ ] Can add/edit/delete programs
- [ ] Can add/edit/delete testimonials
- [ ] Can add team members
- [ ] Can edit team member profiles
- [ ] Can delete team members

### Image Upload
- [ ] Can upload images via ImageUploadField
- [ ] Can crop/resize images via ImageCropUpload
- [ ] Images appear in Cloudinary dashboard
- [ ] Image URLs stored correctly in Firestore
- [ ] Images display on frontend

### Content Management
- [ ] Changes save to Firestore
- [ ] Changes appear immediately after save
- [ ] No data loss on page refresh
- [ ] Order changes reflect correctly

## Post-Deployment

### Monitoring
- [ ] Check Firebase Console for errors
- [ ] Monitor Firestore read/write usage
- [ ] Check Cloudinary bandwidth usage
- [ ] Verify Edge Function execution logs

### Performance
- [ ] Page load times acceptable
- [ ] Images load quickly
- [ ] No console errors
- [ ] No network errors

### Security
- [ ] Public users cannot write data
- [ ] Only admins can edit content
- [ ] Firestore rules working correctly
- [ ] No security warnings in console

## Common Issues & Solutions

### Images Not Uploading
**Problem**: Images fail to upload to Cloudinary
**Solutions**:
1. Check Cloudinary credentials in Edge Function
2. Verify CORS settings in Cloudinary
3. Check Edge Function deployment
4. Verify network connectivity

### Content Not Saving
**Problem**: Content changes don't persist
**Solutions**:
1. Verify user is logged in as admin
2. Check Firestore rules are deployed
3. Verify Firebase connection
4. Check browser console for errors

### Content Not Loading
**Problem**: Pages show no content
**Solutions**:
1. Wait for automatic initialization
2. Check Firestore Console for data
3. Verify Firebase connection
4. Check network tab for failed requests

### Build Errors
**Problem**: `npm run build` fails
**Solutions**:
1. Run `npm install` to update dependencies
2. Check for TypeScript errors
3. Verify all imports are correct
4. Clear node_modules and reinstall

## Firebase CLI Commands

### Install Firebase CLI
```bash
npm install -g firebase-tools
```

### Login to Firebase
```bash
firebase login
```

### Initialize Project (if needed)
```bash
firebase init
```

### Deploy Firestore Rules
```bash
firebase deploy --only firestore:rules
```

### Deploy Firestore Indexes
```bash
firebase deploy --only firestore:indexes
```

### View Logs
```bash
firebase functions:log
```

## Environment Variables

### Required Variables
```env
# Firebase (already configured in code)
VITE_FIREBASE_API_KEY=AIzaSyCAzJf4xhj8YHT6ArbmVdzkOpGKwFTHkCU
VITE_FIREBASE_AUTH_DOMAIN=wasilah-new.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=wasilah-new
VITE_FIREBASE_STORAGE_BUCKET=wasilah-new.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=577353648201
VITE_FIREBASE_APP_ID=1:577353648201:web:322c63144b84db4d2c5798

# Supabase (for Edge Function)
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Cloudinary (set in Edge Function environment)
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
```

## Support Resources

### Documentation
- [Firebase Documentation](https://firebase.google.com/docs)
- [Firestore Documentation](https://firebase.google.com/docs/firestore)
- [Cloudinary Documentation](https://cloudinary.com/documentation)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)

### Console Links
- [Firebase Console](https://console.firebase.google.com/project/wasilah-new)
- [Firestore Database](https://console.firebase.google.com/project/wasilah-new/firestore)
- [Firebase Authentication](https://console.firebase.google.com/project/wasilah-new/authentication)
- [Cloudinary Dashboard](https://console.cloudinary.com/)

## Migration Complete ✅

All data storage has been migrated from Supabase to Firebase Firestore, while maintaining Cloudinary for image management. The application is ready for deployment after completing this checklist.
