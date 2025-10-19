# 🤖 Intelligent Chatbot - Complete Deployment Guide

## Overview

This is a **100% Firebase Spark Plan compatible** intelligent chatbot that:
- ✅ Auto-learns from your website content
- ✅ Uses TF-IDF + fuzzy matching (no external APIs)
- ✅ Shows source links with answers
- ✅ Has "Notify Admin" for unanswered questions
- ✅ Admin panel for manual responses
- ✅ Auto-refresh KB weekly
- ✅ Completely free to run

---

## 📁 What Was Created

### Core Files

1. **`/src/utils/kbMatcher.js`**
   - TF-IDF algorithm implementation
   - Cosine similarity calculation
   - Fuzzy matching with typo tolerance
   - Synonym expansion
   - Smart snippet extraction

2. **`/src/components/ChatBot.jsx`**
   - Modern bubble UI
   - Typing animation
   - Source links
   - "Notify Admin" button
   - Suggested questions
   - Guest mode support

3. **`/src/components/Admin/UnansweredQueriesPanel.jsx`**
   - View unanswered queries
   - Manual reply interface
   - KB refresh button
   - Stats dashboard

4. **`/functions/updateKb.js`**
   - Auto-scrape Firebase Hosting pages
   - Callable function for manual refresh
   - Scheduled weekly updates
   - HTTP endpoint alternative

5. **`/scripts/seedInitialKb.js`**
   - Initial KB seeding script
   - Pre-populated with your content

### Configuration Files

6. **`firestore.rules`** - Updated with chatbot security rules
7. **`firestore.indexes.json`** - Added required indexes
8. **`firebase.json`** - Added functions configuration
9. **`functions/package.json`** - Functions dependencies

---

## 🚀 Deployment Steps

### Step 1: Install Dependencies

```bash
# Main project
npm install

# Functions
cd functions
npm install
cd ..
```

### Step 2: Seed Initial Knowledge Base

First, download your Firebase service account key:
1. Go to Firebase Console → Project Settings → Service Accounts
2. Click "Generate New Private Key"
3. Save as `serviceAccountKey.json` in project root
4. **⚠️ Never commit this file!** (already in .gitignore)

Then run the seed script:

```bash
node scripts/seedInitialKb.js
```

Expected output:
```
🌱 Starting KB seed...
✓ Prepared: Home - Wasilah
✓ Prepared: About Us - Wasilah
✓ Prepared: Projects - Wasilah
✓ Prepared: Volunteer - Wasilah
✓ Prepared: Events - Wasilah
✓ Prepared: Contact - Wasilah

✅ KB seeding complete!
📚 Seeded 6 pages
```

### Step 3: Deploy Firestore Rules & Indexes

```bash
firebase deploy --only firestore:rules,firestore:indexes
```

Wait 5-10 minutes for indexes to build.

### Step 4: Add ChatBot to Your App

In your main `App.tsx` or `App.jsx`:

```jsx
import ChatBot from './components/ChatBot';

function App() {
  return (
    <>
      {/* Your existing app content */}
      <ChatBot />
    </>
  );
}
```

### Step 5: Test Locally

```bash
npm run dev
```

1. Open http://localhost:5173
2. Click the blue chat button (bottom-right)
3. Try these questions:
   - "What is Wasilah?"
   - "How can I volunteer?"
   - "What projects do you run?"

You should see intelligent responses with source links!

### Step 6: Deploy Functions (Optional but Recommended)

This enables auto-refresh and manual KB updates:

```bash
firebase deploy --only functions
```

**Note:** First deployment may take 5-10 minutes.

### Step 7: Deploy to Hosting

```bash
npm run build
firebase deploy --only hosting
```

---

## 🔧 Configuration

### Update Pages to Scrape

Edit `/functions/updateKb.js`:

```javascript
const PAGES_TO_SCRAPE = [
  { url: '/', title: 'Home' },
  { url: '/about', title: 'About Us' },
  { url: '/projects', title: 'Projects' },
  { url: '/events', title: 'Events' },
  { url: '/volunteer', title: 'Volunteer' },
  { url: '/contact', title: 'Contact' },
  // Add more pages as needed
];
```

### Adjust Matching Threshold

In `/src/components/ChatBot.jsx`, change the confidence threshold:

```javascript
// Line ~144
const match = findBestMatch(userMessage, kbPages, 0.4);
// Lower = more lenient (e.g., 0.3)
// Higher = more strict (e.g., 0.6)
```

### Add Custom Synonyms

In `/src/utils/kbMatcher.js`:

```javascript
const SYNONYMS = {
  'help': ['assist', 'support', 'aid'],
  'volunteer': ['help', 'participate', 'contribute', 'join'],
  // Add your own synonyms
  'donate': ['give', 'contribute', 'support'],
  'project': ['program', 'initiative', 'activity'],
};
```

---

## 👨‍💼 Admin Panel Setup

### 1. Set Up Admin User

After a user signs up, make them admin in Firestore:

```javascript
// Firestore Console → users → {userId}
{
  isAdmin: true  // Add this field
}
```

### 2. Add Admin Route

In your `App.tsx`:

```jsx
import UnansweredQueriesPanel from './components/Admin/UnansweredQueriesPanel';

<Route 
  path="/admin/chatbot" 
  element={
    <ProtectedRoute>
      <UnansweredQueriesPanel />
    </ProtectedRoute>
  } 
/>
```

### 3. Access Admin Panel

Visit `/admin/chatbot` to:
- View unanswered questions
- Reply to users manually
- Refresh KB with one click
- See KB statistics

---

## 🔄 How Auto-Learning Works

### Initial State
1. Manual seed creates initial KB from static content
2. Chatbot uses this to answer questions

### Weekly Auto-Refresh
1. Every Sunday at 2 AM (Asia/Karachi time)
2. Function scrapes your Firebase Hosting pages
3. Extracts text content
4. Tokenizes and stores in Firestore
5. Chatbot automatically uses updated content

### Manual Refresh
1. Admin goes to admin panel
2. Clicks "Refresh KB" button
3. Function immediately scrapes all pages
4. Shows results (success/failed)

---

## 🧪 Testing Checklist

### Basic Functionality
- [ ] Chat button appears (bottom-right)
- [ ] Can open/close chat
- [ ] Can minimize chat
- [ ] Suggested questions work
- [ ] Can type and send messages

### Intelligent Responses
- [ ] Asks "What is Wasilah?" → Gets relevant answer
- [ ] Answer includes source link
- [ ] Source link opens correct page
- [ ] Asks unclear question → Gets fallback
- [ ] Fallback shows "Notify Admin" button

### Admin Features
- [ ] Admin can access `/admin/chatbot`
- [ ] Unanswered queries appear in list
- [ ] Can reply to queries
- [ ] User receives admin reply in chat
- [ ] Can refresh KB manually
- [ ] KB stats show correctly

### Guest Mode
- [ ] Works for non-logged-in users
- [ ] Generates guest session ID
- [ ] Messages persist in session
- [ ] No errors in console

---

## 📊 Firestore Structure

### Collections Created

```
/kb
  /pages
    /content
      /{pageId}
        - url: string
        - title: string
        - content: string (max 5000 chars)
        - tokens: string[] (max 500 tokens)
        - lastUpdated: timestamp
        - source: string

/chats
  /{chatId}
    - userId: string
    - createdAt: timestamp
    - status: 'active' | 'closed'
    - isGuest: boolean
    
    /messages
      /{messageId}
        - sender: 'user' | 'bot' | 'admin'
        - text: string
        - sourceUrl?: string
        - confidence?: number
        - needsAdmin?: boolean
        - createdAt: timestamp

/unanswered_queries
  /{queryId}
    - chatId: string
    - userId: string
    - query: string
    - status: 'pending' | 'resolved'
    - createdAt: timestamp
    - resolvedAt?: timestamp
    - adminReply?: string

/admin_notifications
  /{notificationId}
    - chatId: string
    - userId: string
    - type: string
    - status: 'pending' | 'read'
    - createdAt: timestamp
```

---

## 💰 Cost Analysis (Spark Plan)

### Reads
- Per message: ~3 reads (KB pages, chat, messages)
- 100 messages/day = 300 reads
- Limit: 50K reads/day ✅

### Writes
- Per message: ~2 writes (user + bot message)
- 100 messages/day = 200 writes
- Limit: 20K writes/day ✅

### Functions
- Manual KB refresh: ~5 seconds execution
- Weekly auto-refresh: ~5 seconds execution
- Limit: 125K invocations/month, 40K seconds ✅

**Verdict: Easily fits in Spark Plan limits for small-medium sites!**

---

## 🐛 Troubleshooting

### Issue: "No KB pages loaded"

**Solution:**
1. Check if seed script ran successfully
2. Verify Firestore rules allow reading `/kb`
3. Check browser console for errors
4. Run: `firebase firestore:indexes` to see if indexes built

### Issue: "Function not found: refreshKnowledgeBase"

**Solution:**
1. Deploy functions: `firebase deploy --only functions`
2. Wait 5 minutes for deployment
3. Check function logs: `firebase functions:log`
4. Verify function name matches in code

### Issue: "Chatbot always says 'I don't know'"

**Solution:**
1. Lower threshold in ChatBot.jsx (try 0.3)
2. Add more synonyms in kbMatcher.js
3. Check if KB content matches user questions
4. Verify tokens are being generated correctly

### Issue: "Source links not working"

**Solution:**
1. Check URL format in KB pages (must start with `/`)
2. Verify pages exist on your site
3. Update PAGES_TO_SCRAPE in updateKb.js
4. Re-run KB refresh

### Issue: "Admin panel empty"

**Solution:**
1. Verify user has `isAdmin: true` in Firestore
2. Check if any unanswered queries exist
3. Try triggering fallback by asking unusual question
4. Check browser console for permission errors

---

## 🎯 Advanced Features

### Add More Intelligence

Edit `/src/utils/kbMatcher.js` to add:
- More stop words
- Custom tokenization rules
- Domain-specific synonyms
- Better snippet extraction logic

### Improve Scraping

Edit `/functions/updateKb.js` to:
- Extract meta descriptions
- Parse specific HTML selectors
- Handle dynamic content
- Add retry logic

### Analytics

Track chatbot usage:

```javascript
// In ChatBot.jsx, after bot response
await addDoc(collection(db, 'chatbot_analytics'), {
  query: userMessage,
  matched: !!match,
  confidence: response.confidence,
  timestamp: serverTimestamp()
});
```

---

## 📝 Next Steps

1. **Monitor Usage:**
   - Check Firebase Console → Usage tab
   - Watch for quota limits
   - Review unanswered queries

2. **Improve Content:**
   - Add more pages to scraping list
   - Update static content regularly
   - Add FAQs based on common questions

3. **Enhance Matching:**
   - Lower/raise threshold based on results
   - Add domain-specific synonyms
   - Improve content quality

4. **Scale Up (Optional):**
   - Upgrade to Blaze plan for:
     - More frequent auto-refresh
     - Larger KB (more pages)
     - Advanced analytics

---

## ✅ Success Checklist

Your chatbot is ready when:

- [x] KB seeded successfully
- [x] Firestore rules deployed
- [x] Indexes created and enabled
- [x] Chat button appears on site
- [x] Bot gives intelligent responses
- [x] Source links work
- [x] Admin can view/reply to queries
- [x] Functions deployed (optional)
- [x] No errors in console
- [x] Works on Spark plan

---

## 🎉 You're Done!

Your intelligent chatbot is now live and learning from your website!

**Questions?**
- Check function logs: `firebase functions:log`
- Test locally: `npm run dev`
- Check Firestore Console for data

**Need help?**
- Review code comments in each file
- Check browser console for errors
- Verify Firebase Console → Firestore shows data

---

**Built with ❤️ for Firebase Spark Plan**
No external APIs • No paid services • 100% free to run
