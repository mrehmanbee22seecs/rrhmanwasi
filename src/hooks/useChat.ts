import { useState, useEffect, useCallback } from 'react';
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  doc,
  updateDoc,
  serverTimestamp,
  getDocs,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { filterProfanity, checkRateLimit, generateChatTitle } from '../utils/chatHelpers';
import { matchIntent, detectLanguage, adminOfferMessage, adminConfirmMessage } from '../utils/intents';

// Try to import new KB matcher, fallback to old one
import * as kbMatcher from '../utils/kbMatcher';
const findBestMatchKb: any = kbMatcher?.findBestMatch;
const formatResponse: any = kbMatcher?.formatResponse;

// Legacy imports
let findBestMatch: any = null;
let truncateAnswer: any = null;
try {
  const legacyMatch = require('../utils/matchKb');
  findBestMatch = legacyMatch.findBestMatch;
  truncateAnswer = legacyMatch.truncateAnswer;
} catch (e) {
  console.log('Legacy FAQ system not available');
}

interface Message {
  id: string;
  sender: 'user' | 'bot' | 'admin';
  text: string;
  createdAt: Date;
  meta?: Record<string, any>;
}

interface Chat {
  id: string;
  title: string;
  createdAt: Date;
  lastActivityAt: Date;
  isActive: boolean;
  takeoverBy?: string;
}

interface FAQ {
  id: string;
  question: string;
  answer: string;
  keywords: string[];
  tags: string[];
}

export function useChat(userId: string | null, chatId?: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [chats, setChats] = useState<Chat[]>([]);
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [kbPages, setKbPages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentChatId, setCurrentChatId] = useState<string | null>(chatId || null);
  const [isTakeover, setIsTakeover] = useState(false);

  // Sync chatId parameter with internal state
  useEffect(() => {
    if (chatId !== undefined) {
      setCurrentChatId(chatId);
    }
  }, [chatId]);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const chatsRef = collection(db, `users/${userId}/chats`);
    const q = query(chatsRef, orderBy('lastActivityAt', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const chatList: Chat[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        chatList.push({
          id: doc.id,
          title: data.title,
          createdAt: data.createdAt?.toDate() || new Date(),
          lastActivityAt: data.lastActivityAt?.toDate() || new Date(),
          isActive: data.isActive ?? true,
          takeoverBy: data.takeoverBy,
        });
      });
      setChats(chatList);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userId]);

  // Load FAQs (legacy system)
  useEffect(() => {
    const faqsRef = collection(db, 'faqs');
    const unsubscribe = onSnapshot(faqsRef, (snapshot) => {
      const faqList: FAQ[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        faqList.push({
          id: doc.id,
          question: data.question,
          answer: data.answer,
          keywords: data.keywords || [],
          tags: data.tags || [],
        });
      });
      setFaqs(faqList);
    });

    return () => unsubscribe();
  }, []);

  // Load KB pages (new intelligent system)
  useEffect(() => {
    const loadKbPages = async () => {
      try {
        const kbSnapshot = await getDocs(
          collection(db, 'kb', 'pages', 'content')
        );
        
        const pages: any[] = [];
        kbSnapshot.forEach((doc) => {
          pages.push({
            id: doc.id,
            ...doc.data()
          });
        });
        
        setKbPages(pages);
        if (pages.length > 0) {
          console.log(`✅ Loaded ${pages.length} KB pages - using intelligent matching`);
        }
      } catch (error) {
        console.error('Error loading KB pages:', error);
      }
    };
    
    loadKbPages();
  }, []);

  useEffect(() => {
    if (!userId || !currentChatId) {
      setMessages([]);
      return;
    }

    const messagesRef = collection(db, `users/${userId}/chats/${currentChatId}/messages`);
    const q = query(messagesRef, orderBy('createdAt', 'asc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messageList: Message[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        messageList.push({
          id: doc.id,
          sender: data.sender,
          text: data.text,
          createdAt: data.createdAt?.toDate() || new Date(),
          meta: data.meta,
        });
      });
      setMessages(messageList);

      const currentChat = chats.find((c) => c.id === currentChatId);
      setIsTakeover(!!currentChat?.takeoverBy);
    });

    return () => unsubscribe();
  }, [userId, currentChatId, chats]);

  const createNewChat = useCallback(
    async (firstMessage: string): Promise<string | null> => {
      if (!userId) return null;

      try {
        const chatsRef = collection(db, `users/${userId}/chats`);
        const chatDoc = await addDoc(chatsRef, {
          title: generateChatTitle(firstMessage),
          createdAt: serverTimestamp(),
          lastActivityAt: serverTimestamp(),
          isActive: true,
        });

        return chatDoc.id;
      } catch (error) {
        console.error('Error creating chat:', error);
        return null;
      }
    },
    [userId]
  );

  const sendMessage = useCallback(
    async (text: string, isAdmin: boolean = false) => {
      if (!userId) return;

      const rateCheck = checkRateLimit(userId);
      if (!rateCheck.allowed && !isAdmin) {
        throw new Error('Rate limit exceeded. Please wait before sending more messages.');
      }

      const filteredText = filterProfanity(text);

      let activeChatId = currentChatId;

      if (!activeChatId) {
        activeChatId = await createNewChat(filteredText);
        if (!activeChatId) throw new Error('Failed to create chat');
        setCurrentChatId(activeChatId);
      }

      const messagesRef = collection(db, `users/${userId}/chats/${activeChatId}/messages`);

      await addDoc(messagesRef, {
        sender: isAdmin ? 'admin' : 'user',
        text: filteredText,
        createdAt: serverTimestamp(),
        meta: {},
      });

      const chatRef = doc(db, `users/${userId}/chats/${activeChatId}`);
      await updateDoc(chatRef, {
        lastActivityAt: serverTimestamp(),
      });

      if (!isAdmin && !isTakeover) {
        setTimeout(async () => {
          let botResponseText: string;
          let botMeta: any = {};
          
          // 1) Quick intent-based replies (greetings, thanks, help) with Urdu support
          const intent = matchIntent(filteredText);
          if (intent.handled) {
            botResponseText = intent.reply!;
            botMeta = { matchType: 'intent' };
          }
          // 2) Intelligent KB matching
          else if (kbPages.length > 0 && typeof findBestMatchKb === 'function' && typeof formatResponse === 'function') {
            console.log('🤖 Using intelligent KB matching');
            const match = findBestMatchKb(filteredText, kbPages, 0.4);
            const response = formatResponse(match);
            
            botResponseText = response.text;
            botMeta = {
              sourceUrl: response.sourceUrl,
              sourcePage: response.sourcePage,
              confidence: response.confidence,
              needsAdmin: response.needsAdmin,
              matchType: 'intelligent'
            };
            
            // If no match, flag as unanswered for admin
            if (response.needsAdmin) {
              try {
                await addDoc(collection(db, 'unanswered_queries'), {
                  chatId: activeChatId,
                  userId,
                  query: filteredText,
                  status: 'pending',
                  createdAt: serverTimestamp()
                });
              } catch (error) {
                console.error('Error creating unanswered query:', error);
              }
            }
          }
          // 3) Fallback to legacy FAQ matching
          else if (faqs.length > 0 && findBestMatch && truncateAnswer) {
            console.log('📚 Using legacy FAQ matching');
            const recentMessages = messages.slice(-6);
            const context = recentMessages.map((m) => m.text).join(' ');
            const searchQuery = `${context} ${filteredText}`;
            const match = findBestMatch(searchQuery, faqs);

            if (match) {
              botResponseText = truncateAnswer(match.answer, 500);
              if (match.answer.length > 500) {
                botResponseText += '\n\n[Read more in our FAQ section]';
              }
              botMeta = { faqId: match.id, matchType: 'legacy' };
            } else {
              const lang = detectLanguage(filteredText);
              botResponseText = adminOfferMessage(lang);
              botMeta = { needsAdminOffer: true, matchType: 'legacy' };
            }
          }
          // No matching system available
          else {
            const lang = detectLanguage(filteredText);
            botResponseText = adminOfferMessage(lang);
            botMeta = { needsAdminOffer: true, matchType: 'none' };
          }

          // If user says 'yes' after an admin offer, auto-route to admin
          const lastBot = messages.slice().reverse().find((m) => m.sender === 'bot');
          const userSaidYes = /^(yes|y|haan|han|جی|ہاں)$/i.test(filteredText.trim());
          if (lastBot && (lastBot.meta as any)?.needsAdminOffer && userSaidYes) {
            const lang = detectLanguage(filteredText);
            botResponseText = adminConfirmMessage(lang);
            botMeta = { needsAdmin: true, escalated: true };
          }

          await addDoc(messagesRef, {
            sender: 'bot',
            text: botResponseText,
            createdAt: serverTimestamp(),
            meta: botMeta,
            ...botMeta // Spread meta fields to root for easy access
          });

          await updateDoc(chatRef, {
            lastActivityAt: serverTimestamp(),
          });
        }, 1000);
      }
    },
    [userId, currentChatId, messages, faqs, isTakeover, createNewChat]
  );

  const toggleTakeover = useCallback(
    async (adminId: string | null) => {
      if (!userId || !currentChatId) return;

      const chatRef = doc(db, `users/${userId}/chats/${currentChatId}`);
      await updateDoc(chatRef, {
        takeoverBy: adminId || null,
      });
    },
    [userId, currentChatId]
  );

  const closeChat = useCallback(async () => {
    if (!userId || !currentChatId) return;

    const chatRef = doc(db, `users/${userId}/chats/${currentChatId}`);
    await updateDoc(chatRef, {
      isActive: false,
    });

    setCurrentChatId(null);
  }, [userId, currentChatId]);

  return {
    messages,
    chats,
    loading,
    currentChatId,
    isTakeover,
    sendMessage,
    toggleTakeover,
    closeChat,
    setCurrentChatId,
  };
}
