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
  Timestamp,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { filterProfanity, checkRateLimit, generateChatTitle } from '../utils/chatHelpers';

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
  const [faqs] = useState<FAQ[]>([]);
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

  // FAQs and KB are deprecated for bot responses; using ApiFreeLLM instead

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
          aiProvider: 'apifreellm',
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
        const seconds = Math.ceil(rateCheck.resetMs / 1000);
        throw new Error(
          `Rate limit reached: ${rateCheck.limit}/${Math.round(rateCheck.windowMs/1000)}s. Try again in ${seconds}s.`
        );
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
        meta: {
          rate: {
            remaining: rateCheck.remaining,
            limit: rateCheck.limit,
            windowMs: rateCheck.windowMs,
          }
        },
      });

      const chatRef = doc(db, `users/${userId}/chats/${activeChatId}`);
      await updateDoc(chatRef, {
        lastActivityAt: serverTimestamp(),
      });

      if (!isAdmin && !isTakeover) {
        setTimeout(async () => {
          const chatRef = doc(db, `users/${userId}/chats/${activeChatId}`);
          const messagesRef = collection(db, `users/${userId}/chats/${activeChatId}/messages`);

          const CHATBOT_PROMPT = `You are a helpful customer support AI assistant for Wasilah. Your personality traits:\n\n- Friendly and professional tone\n- Patient and understanding\n- Knowledgeable about general topics\n- Always provide actionable advice\n- If you don't know something specific about the organization, politely say so and offer to connect them with a human agent\n- Keep responses concise but informative\n- Use emojis occasionally to be friendly (but not overuse them)\n\nImportant behaviors:\n- Respond quickly and directly, without unnecessary delays\n- If the user is approaching or exceeding a message limit, summarize briefly and suggest waiting before sending more`;

          const recentMessages = messages.slice(-10);
          const historyLines = recentMessages
            .map((m) => `${m.sender === 'user' ? 'User' : m.sender === 'admin' ? 'Admin' : 'Assistant'}: ${m.text}`)
            .join('\n');

          const contextPrompt = `${CHATBOT_PROMPT}\n\nConversation History:\n${historyLines}\n\nCurrent User Message: ${filteredText}\n\nPlease respond naturally considering the conversation context above.`;

          let botText = '';
          try {
            const w = (typeof window !== 'undefined' ? (window as any) : {}) as any;
            if (w.apifree && typeof w.apifree.chat === 'function') {
              const sdkResp = await w.apifree.chat(contextPrompt);
              botText = (sdkResp || '').toString().trim();
            } else {
              const res = await fetch('https://apifreellm.com/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: contextPrompt }),
              });

              let aiResponse: string | null = null;
              try {
                const data = await res.json();
                if (typeof data === 'string') aiResponse = data;
                else if (data && typeof data.response === 'string') aiResponse = data.response;
                else if (data && typeof data.message === 'string') aiResponse = data.message;
              } catch (_) {
                aiResponse = await res.text();
              }

              botText = (aiResponse || '').toString().trim();
            }
            if (!botText) {
              botText = "Sorry, I couldn't generate a response. Please try again in a moment.";
            }
          } catch (error) {
            console.error('ApiFreeLLM error:', error);
            botText = 'Sorry, I encountered an error. Please try again!';
          }

          await addDoc(messagesRef, {
            sender: 'bot',
            text: botText,
            createdAt: serverTimestamp(),
            meta: { provider: 'apifreellm' },
            provider: 'apifreellm',
          });

          await updateDoc(chatRef, { lastActivityAt: serverTimestamp() });
        }, 1000);
      }
    },
    [userId, currentChatId, messages, isTakeover, createNewChat]
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
