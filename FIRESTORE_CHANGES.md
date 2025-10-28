# Firestore Rules and Indexes Updates for Email System

## Overview

The email system implementation requires updates to Firestore security rules and indexes to support the `reminders` collection. These changes have been made to ensure proper access control and query performance.

## Changes Made

### 1. Firestore Security Rules (`firestore.rules`)

**Added reminders collection rules:**

```javascript
// Reminders collection - users can create/read their own, admins can manage all
match /reminders/{reminderId} {
  allow create: if isAuthenticated();
  allow read: if isAuthenticated() && (request.auth.uid == resource.data.userId || isAdmin());
  allow update: if isAuthenticated() && (request.auth.uid == resource.data.userId || isAdmin());
  allow delete: if isAuthenticated() && (request.auth.uid == resource.data.userId || isAdmin());
}
```

**Security guarantees:**
- ✅ Only authenticated users can create reminders
- ✅ Users can only read their own reminders (or admins can read all)
- ✅ Users can only update/delete their own reminders (or admins can manage all)
- ✅ Prevents unauthorized access to other users' reminders

### 2. Firestore Indexes (`firestore.indexes.json`)

**Added two composite indexes for reminders:**

```json
{
  "collectionGroup": "reminders",
  "queryScope": "COLLECTION",
  "fields": [
    { "fieldPath": "userId", "order": "ASCENDING" },
    { "fieldPath": "scheduledUTC", "order": "ASCENDING" }
  ]
}
```

**Purpose:** Efficiently query reminders for a specific user, ordered by scheduled time.

```json
{
  "collectionGroup": "reminders",
  "queryScope": "COLLECTION",
  "fields": [
    { "fieldPath": "sent", "order": "ASCENDING" },
    { "fieldPath": "scheduledUTC", "order": "ASCENDING" }
  ]
}
```

**Purpose:** Efficiently query pending reminders (sent=false), ordered by scheduled time. Useful for admin dashboard or future sync features.

## Reminders Collection Schema

While reminders are primarily stored in Google Sheets (for Apps Script processing), they can optionally be mirrored to Firestore for the following benefits:

```typescript
interface ReminderDocument {
  id: string;                    // Unique reminder ID (matches Google Sheet)
  userId: string;                // Firebase Auth UID of creator
  name: string;                  // User's display name
  email: string;                 // Recipient email
  projectName: string;           // Associated project/event name
  message: string;               // Reminder message
  scheduledUTC: Timestamp;       // When to send (UTC timestamp)
  sent: boolean;                 // Whether reminder has been sent
  sentAt?: Timestamp;            // When reminder was sent (if sent=true)
  createdAt: Timestamp;          // When reminder was created
}
```

**Field descriptions:**
- `userId`: Links reminder to creating user for access control
- `scheduledUTC`: Stored as Firestore Timestamp in UTC for consistency
- `sent`: Boolean flag for tracking delivery status
- `projectName`: Context for which project/event this reminder is about

## Deployment Steps

### Step 1: Deploy Firestore Rules

```bash
# Deploy security rules to Firebase
firebase deploy --only firestore:rules
```

**Expected output:**
```
✔  firestore: rules file firestore.rules compiled successfully
✔  firestore: released rules firestore.rules to cloud.firestore
✔  Deploy complete!
```

### Step 2: Deploy Firestore Indexes

```bash
# Deploy indexes to Firebase
firebase deploy --only firestore:indexes
```

**Expected output:**
```
✔  firestore: indexes in firestore.indexes.json deployed successfully
✔  Deploy complete!
```

**Note:** Index creation can take several minutes. Firebase will notify you when complete.

### Step 3: Verify Deployment

1. **Check Rules:**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Select your project
   - Navigate to Firestore Database > Rules
   - Verify the `reminders` match block exists

2. **Check Indexes:**
   - Navigate to Firestore Database > Indexes
   - Look for two indexes on the `reminders` collection
   - Status should show "Enabled" (may take a few minutes)

## Testing the Rules

### Test 1: Create Reminder (Authenticated User)

```javascript
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from './firebase';

const createTestReminder = async () => {
  const reminderData = {
    userId: auth.currentUser.uid,
    name: auth.currentUser.displayName,
    email: auth.currentUser.email,
    projectName: "Test Project",
    message: "Test reminder message",
    scheduledUTC: serverTimestamp(),
    sent: false,
    createdAt: serverTimestamp()
  };
  
  try {
    const docRef = await addDoc(collection(db, 'reminders'), reminderData);
    console.log('✅ Reminder created:', docRef.id);
  } catch (error) {
    console.error('❌ Error:', error);
  }
};
```

**Expected:** Should succeed if user is authenticated.

### Test 2: Read Own Reminders

```javascript
import { collection, query, where, getDocs } from 'firebase/firestore';

const readOwnReminders = async () => {
  const q = query(
    collection(db, 'reminders'),
    where('userId', '==', auth.currentUser.uid)
  );
  
  try {
    const snapshot = await getDocs(q);
    console.log('✅ Found reminders:', snapshot.size);
    snapshot.forEach(doc => console.log(doc.data()));
  } catch (error) {
    console.error('❌ Error:', error);
  }
};
```

**Expected:** Should return user's own reminders only.

### Test 3: Attempt to Read Another User's Reminder

```javascript
const tryReadOthersReminder = async (otherUserId) => {
  const q = query(
    collection(db, 'reminders'),
    where('userId', '==', otherUserId)  // Different user
  );
  
  try {
    const snapshot = await getDocs(q);
    console.log('❌ Security breach - should not see this!');
  } catch (error) {
    console.log('✅ Access denied (as expected):', error.code);
  }
};
```

**Expected:** Should fail with permission-denied error (unless you're an admin).

## No Breaking Changes

**Important:** These changes are **additive only** and do not affect existing functionality:

- ✅ All existing collections remain unchanged
- ✅ Existing rules for other collections are preserved
- ✅ No data migration required
- ✅ Existing indexes remain functional
- ✅ The reminders collection is optional for Firestore (primary storage is Google Sheets)

## Optional: Firestore as Secondary Storage

While the email system primarily uses Google Sheets for reminder storage (as it integrates with Apps Script), you can optionally sync reminders to Firestore for:

1. **User Dashboard:** Show users their scheduled reminders
2. **Admin Panel:** View all pending reminders
3. **Analytics:** Track reminder creation and delivery stats
4. **Backup:** Additional redundancy beyond Google Sheets

**Implementation is optional** - the email system works fully with Google Sheets alone.

## Troubleshooting

### Issue: Rules not deployed

**Solution:**
```bash
# Check Firebase project is set
firebase use --project your-project-id

# Re-deploy rules
firebase deploy --only firestore:rules
```

### Issue: Indexes still building

**Symptoms:** Queries fail with "index required" error

**Solution:**
- Wait 5-10 minutes for indexes to complete
- Check Firebase Console > Firestore > Indexes for status
- Click on index to see progress

### Issue: Permission denied errors

**Check:**
1. User is authenticated: `auth.currentUser !== null`
2. User is trying to access their own reminders: `userId === auth.currentUser.uid`
3. Rules deployed successfully
4. Firebase project connected correctly

## Summary

**What was added:**
- ✅ Security rules for `reminders` collection
- ✅ Two composite indexes for efficient queries
- ✅ Access control: users can only see their own reminders
- ✅ Admin access: admins can manage all reminders

**What to do:**
1. Deploy rules: `firebase deploy --only firestore:rules`
2. Deploy indexes: `firebase deploy --only firestore:indexes`
3. Wait for indexes to build (5-10 minutes)
4. Test access control with authenticated users

**No breaking changes** - Safe to deploy to production!
