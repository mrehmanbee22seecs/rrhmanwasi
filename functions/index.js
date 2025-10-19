/**
 * OPTIONAL CLOUD FUNCTIONS FOR BLAZE PLAN
 * 
 * These functions are OPTIONAL and require upgrading to Firebase Blaze plan.
 * The chat feature works fully on Spark plan without these functions.
 * 
 * To deploy: 
 * 1. Upgrade to Blaze plan
 * 2. Run: firebase deploy --only functions
 * 
 * Benefits when deployed:
 * - Server-side rate limiting (more secure)
 * - Server-side profanity filtering
 * - Audit logging for admin actions
 * - Better security against client-side manipulation
 */

const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();
const db = admin.firestore();

// Server-side rate limiting
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const RATE_LIMIT_MAX = 5;

/**
 * Trigger: onCreate for messages
 * Validates rate limits and filters profanity on the server side
 */
exports.onMessageCreate = functions.firestore
  .document('users/{userId}/chats/{chatId}/messages/{messageId}')
  .onCreate(async (snap, context) => {
    const { userId, chatId, messageId } = context.params;
    const message = snap.data();

    // Only apply to user messages
    if (message.sender !== 'user') {
      return null;
    }

    try {
      // Server-side rate limit check
      const recentMessages = await db
        .collection(`users/${userId}/chats/${chatId}/messages`)
        .where('sender', '==', 'user')
        .where('createdAt', '>', new Date(Date.now() - RATE_LIMIT_WINDOW))
        .get();

      if (recentMessages.size > RATE_LIMIT_MAX) {
        console.warn(`Rate limit exceeded for user ${userId}`);
        // Delete the message that exceeded rate limit
        await snap.ref.delete();
        return null;
      }

      // Server-side profanity filter (more comprehensive list)
      const profanityWords = [
        'damn', 'hell', 'crap', 'stupid', 'idiot', 'dumb',
        // Add more as needed
      ];

      let filteredText = message.text;
      for (const word of profanityWords) {
        const regex = new RegExp(`\\b${word}\\b`, 'gi');
        filteredText = filteredText.replace(regex, (match) => '*'.repeat(match.length));
      }

      // Update message if profanity was found
      if (filteredText !== message.text) {
        await snap.ref.update({ text: filteredText });
      }

      return null;
    } catch (error) {
      console.error('Error in onMessageCreate:', error);
      return null;
    }
  });

/**
 * Trigger: onCreate for bot messages with KB matching
 * Alternative server-side bot response (more secure)
 */
exports.generateBotResponse = functions.firestore
  .document('users/{userId}/chats/{chatId}/messages/{messageId}')
  .onCreate(async (snap, context) => {
    const { userId, chatId } = context.params;
    const message = snap.data();

    // Only respond to user messages
    if (message.sender !== 'user') {
      return null;
    }

    try {
      // Check if chat has takeover
      const chatDoc = await db.doc(`users/${userId}/chats/${chatId}`).get();
      const chatData = chatDoc.data();

      if (chatData?.takeoverBy) {
        // Admin has taken over, skip bot response
        return null;
      }

      // Get recent messages for context
      const recentMessages = await db
        .collection(`users/${userId}/chats/${chatId}/messages`)
        .orderBy('createdAt', 'desc')
        .limit(6)
        .get();

      const context = recentMessages.docs
        .map(doc => doc.data().text)
        .reverse()
        .join(' ');

      // Load KB
      const kbSnapshot = await db.collection('faqs').get();
      const faqs = kbSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Simple keyword matching (you can import matchKb logic here)
      const query = `${context} ${message.text}`.toLowerCase();
      let bestMatch = null;
      let bestScore = 0;

      for (const faq of faqs) {
        let score = 0;
        for (const keyword of faq.keywords || []) {
          if (query.includes(keyword.toLowerCase())) {
            score += 1;
          }
        }
        if (score > bestScore && score > 0) {
          bestScore = score;
          bestMatch = faq;
        }
      }

      // Generate response
      let botResponse;
      let meta = {};

      if (bestMatch && bestScore >= 2) {
        botResponse = bestMatch.answer;
        if (botResponse.length > 500) {
          botResponse = botResponse.substring(0, 500) + '...\n\n[Read more in our FAQ section]';
        }
        meta = { faqId: bestMatch.id };
      } else {
        botResponse = "I'm sorry — we don't have that information right now. We'll review your question and an admin will reach out to you soon.";
      }

      // Add bot message
      await db.collection(`users/${userId}/chats/${chatId}/messages`).add({
        sender: 'bot',
        text: botResponse,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        meta
      });

      // Update chat activity
      await db.doc(`users/${userId}/chats/${chatId}`).update({
        lastActivityAt: admin.firestore.FieldValue.serverTimestamp()
      });

      return null;
    } catch (error) {
      console.error('Error generating bot response:', error);
      return null;
    }
  });

/**
 * Audit logging for admin actions
 */
exports.logAdminAction = functions.firestore
  .document('users/{userId}/chats/{chatId}')
  .onUpdate(async (change, context) => {
    const { userId, chatId } = context.params;
    const before = change.before.data();
    const after = change.after.data();

    // Check if takeover status changed
    if (before.takeoverBy !== after.takeoverBy) {
      try {
        await db.collection('auditLogs').add({
          action: after.takeoverBy ? 'takeover_enabled' : 'takeover_disabled',
          actorUid: after.takeoverBy || before.takeoverBy,
          payload: {
            userId,
            chatId,
            previousState: before.takeoverBy,
            newState: after.takeoverBy
          },
          createdAt: admin.firestore.FieldValue.serverTimestamp()
        });
      } catch (error) {
        console.error('Error logging admin action:', error);
      }
    }

    return null;
  });

/**
 * Clean up old inactive chats (optional maintenance function)
 * Run manually or on a schedule
 */
exports.cleanupInactiveChats = functions.pubsub
  .schedule('every 24 hours')
  .onRun(async (context) => {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    try {
      const usersSnapshot = await db.collection('users').get();

      for (const userDoc of usersSnapshot.docs) {
        const chatsSnapshot = await db
          .collection(`users/${userDoc.id}/chats`)
          .where('isActive', '==', false)
          .where('lastActivityAt', '<', thirtyDaysAgo)
          .get();

        for (const chatDoc of chatsSnapshot.docs) {
          console.log(`Archiving chat ${chatDoc.id} for user ${userDoc.id}`);
          // Instead of deleting, we could move to an archive collection
          // For now, just mark as archived
          await chatDoc.ref.update({ archived: true });
        }
      }

      return null;
    } catch (error) {
      console.error('Error cleaning up chats:', error);
      return null;
    }
  });

/**
 * HTTP function to get chat analytics (admin only)
 */
exports.getChatAnalytics = functions.https.onCall(async (data, context) => {
  // Check if user is authenticated and is admin
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'User must be authenticated'
    );
  }

  const userDoc = await db.doc(`users/${context.auth.uid}`).get();
  if (!userDoc.exists || !userDoc.data()?.isAdmin) {
    throw new functions.https.HttpsError(
      'permission-denied',
      'User must be admin'
    );
  }

  try {
    const usersSnapshot = await db.collection('users').get();
    let totalChats = 0;
    let totalMessages = 0;
    let activeChats = 0;

    for (const userDoc of usersSnapshot.docs) {
      const chatsSnapshot = await db
        .collection(`users/${userDoc.id}/chats`)
        .get();

      totalChats += chatsSnapshot.size;

      for (const chatDoc of chatsSnapshot.docs) {
        if (chatDoc.data().isActive) {
          activeChats++;
        }

        const messagesSnapshot = await db
          .collection(`users/${userDoc.id}/chats/${chatDoc.id}/messages`)
          .get();

        totalMessages += messagesSnapshot.size;
      }
    }

    return {
      totalUsers: usersSnapshot.size,
      totalChats,
      activeChats,
      totalMessages,
      averageMessagesPerChat: totalChats > 0 ? (totalMessages / totalChats).toFixed(2) : 0
    };
  } catch (error) {
    console.error('Error getting analytics:', error);
    throw new functions.https.HttpsError('internal', 'Failed to fetch analytics');
  }
});
