import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Minimize2, Bell, ExternalLink, Loader } from 'lucide-react';
import { 
  collection, 
  addDoc, 
  query, 
  orderBy, 
  onSnapshot, 
  serverTimestamp,
  doc,
  updateDoc,
  getDocs
} from 'firebase/firestore';
import { db, auth } from '../config/firebase';
import { findBestMatch, formatResponse, tokenize } from '../utils/kbMatcher';

/**
 * Intelligent ChatBot Component
 * - Auto-learns from website content
 * - TF-IDF matching
 * - Shows source links
 * - Notify admin for unanswered questions
 * - 100% Firebase Spark Plan compatible
 */
const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [currentChatId, setCurrentChatId] = useState(null);
  const [kbPages, setKbPages] = useState([]);
  const [userId, setUserId] = useState(null);
  const messagesEndRef = useRef(null);

  // Load KB pages from Firestore
  useEffect(() => {
    const loadKb = async () => {
      try {
        const pagesSnapshot = await getDocs(
          collection(db, 'kb', 'pages', 'content')
        );
        
        const pages = [];
        pagesSnapshot.forEach((doc) => {
          pages.push({
            id: doc.id,
            ...doc.data()
          });
        });
        
        setKbPages(pages);
        console.log(`Loaded ${pages.length} KB pages`);
      } catch (error) {
        console.error('Error loading KB:', error);
      }
    };
    
    loadKb();
  }, []);

  // Track user authentication
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUserId(user.uid);
      } else {
        // Guest mode - generate session ID
        setUserId(`guest_${Date.now()}`);
      }
    });
    
    return () => unsubscribe();
  }, []);

  // Create or load chat
  useEffect(() => {
    if (!userId) return;
    
    const initChat = async () => {
      try {
        // Check for existing active chat
        const chatsRef = collection(db, 'chats');
        const q = query(chatsRef, orderBy('createdAt', 'desc'));
        const chatsSnapshot = await getDocs(q);
        
        let activeChatId = null;
        
        chatsSnapshot.forEach((doc) => {
          const data = doc.data();
          if (data.userId === userId && data.status === 'active') {
            activeChatId = doc.id;
          }
        });
        
        // Create new chat if none exists
        if (!activeChatId) {
          const newChat = await addDoc(collection(db, 'chats'), {
            userId,
            createdAt: serverTimestamp(),
            status: 'active',
            isGuest: userId.startsWith('guest_')
          });
          activeChatId = newChat.id;
        }
        
        setCurrentChatId(activeChatId);
        
        // Listen to messages
        const messagesRef = collection(db, 'chats', activeChatId, 'messages');
        const messagesQuery = query(messagesRef, orderBy('createdAt', 'asc'));
        
        const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
          const msgs = [];
          snapshot.forEach((doc) => {
            msgs.push({
              id: doc.id,
              ...doc.data(),
              createdAt: doc.data().createdAt?.toDate() || new Date()
            });
          });
          setMessages(msgs);
        });
        
        return () => unsubscribe();
      } catch (error) {
        console.error('Error initializing chat:', error);
      }
    };
    
    initChat();
  }, [userId]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!inputText.trim() || !currentChatId) return;
    
    const userMessage = inputText.trim();
    setInputText('');
    setIsTyping(true);
    
    try {
      // Save user message
      const messagesRef = collection(db, 'chats', currentChatId, 'messages');
      await addDoc(messagesRef, {
        sender: 'user',
        text: userMessage,
        createdAt: serverTimestamp()
      });
      
      // Simulate typing delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Find best match in KB
      const match = findBestMatch(userMessage, kbPages, 0.4);
      const response = formatResponse(match);
      
      // Save bot response
      await addDoc(messagesRef, {
        sender: 'bot',
        text: response.text,
        sourceUrl: response.sourceUrl,
        sourcePage: response.sourcePage,
        confidence: response.confidence,
        needsAdmin: response.needsAdmin,
        createdAt: serverTimestamp()
      });
      
      // If needs admin, flag this query as unanswered
      if (response.needsAdmin) {
        await addDoc(collection(db, 'unanswered_queries'), {
          chatId: currentChatId,
          userId,
          query: userMessage,
          status: 'pending',
          createdAt: serverTimestamp()
        });
      }
      
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Send error message
      const messagesRef = collection(db, 'chats', currentChatId, 'messages');
      await addDoc(messagesRef, {
        sender: 'bot',
        text: "Sorry, I'm having trouble right now. Please try again in a moment.",
        createdAt: serverTimestamp()
      });
    } finally {
      setIsTyping(false);
    }
  };

  const handleNotifyAdmin = async (messageId) => {
    try {
      await addDoc(collection(db, 'admin_notifications'), {
        chatId: currentChatId,
        messageId,
        userId,
        type: 'unanswered_query',
        status: 'pending',
        createdAt: serverTimestamp()
      });
      
      alert('Admin has been notified! They will respond soon.');
    } catch (error) {
      console.error('Error notifying admin:', error);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white p-4 rounded-full shadow-2xl transition-all z-50 hover:scale-110"
        aria-label="Open chat"
      >
        <MessageCircle className="w-6 h-6" />
      </button>
    );
  }

  return (
    <div
      className={`fixed bottom-6 right-6 bg-white rounded-2xl shadow-2xl z-50 transition-all ${
        isMinimized ? 'w-80 h-16' : 'w-96 h-[600px]'
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-2xl">
        <div className="flex items-center gap-2">
          <MessageCircle className="w-5 h-5" />
          <h3 className="font-semibold">Wasilah Assistant</h3>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="hover:bg-blue-800 p-1 rounded transition-colors"
            aria-label="Minimize"
          >
            <Minimize2 className="w-5 h-5" />
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="hover:bg-blue-800 p-1 rounded transition-colors"
            aria-label="Close chat"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Messages */}
          <div className="h-[480px] overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.length === 0 && (
              <div className="text-center text-gray-500 mt-8">
                <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="text-sm font-medium">Welcome to Wasilah!</p>
                <p className="text-xs mt-1">
                  I can help you learn about our projects, volunteering, and more.
                </p>
                <div className="mt-4 space-y-2">
                  <button
                    onClick={() => setInputText('What is Wasilah?')}
                    className="block w-full text-left px-3 py-2 text-xs bg-white hover:bg-blue-50 rounded-lg border border-gray-200 transition-colors"
                  >
                    💡 What is Wasilah?
                  </button>
                  <button
                    onClick={() => setInputText('How can I volunteer?')}
                    className="block w-full text-left px-3 py-2 text-xs bg-white hover:bg-blue-50 rounded-lg border border-gray-200 transition-colors"
                  >
                    🙋 How can I volunteer?
                  </button>
                  <button
                    onClick={() => setInputText('What projects do you run?')}
                    className="block w-full text-left px-3 py-2 text-xs bg-white hover:bg-blue-50 rounded-lg border border-gray-200 transition-colors"
                  >
                    🎯 What projects do you run?
                  </button>
                </div>
              </div>
            )}

            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.sender === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                    message.sender === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-900 shadow-md'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                  
                  {/* Source link */}
                  {message.sender === 'bot' && message.sourceUrl && (
                    <a
                      href={message.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 mt-2 text-xs text-blue-600 hover:text-blue-700 font-medium"
                    >
                      <ExternalLink className="w-3 h-3" />
                      Learn more: {message.sourcePage}
                    </a>
                  )}
                  
                  {/* Notify admin button */}
                  {message.sender === 'bot' && message.needsAdmin && (
                    <button
                      onClick={() => handleNotifyAdmin(message.id)}
                      className="flex items-center gap-1 mt-2 px-3 py-1 text-xs bg-yellow-100 hover:bg-yellow-200 text-yellow-800 rounded-lg transition-colors"
                    >
                      <Bell className="w-3 h-3" />
                      Notify Admin
                    </button>
                  )}
                  
                  <p className="text-xs opacity-60 mt-1">
                    {message.createdAt.toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white rounded-2xl px-4 py-3 shadow-md">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100" />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200" />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t p-4 bg-white rounded-b-2xl">
            <div className="flex gap-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none text-sm"
                disabled={isTyping}
              />
              <button
                onClick={handleSend}
                disabled={!inputText.trim() || isTyping}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white px-4 py-2 rounded-xl transition-colors flex items-center gap-2"
                aria-label="Send message"
              >
                {isTyping ? (
                  <Loader className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2 text-center">
              Powered by intelligent matching • No external APIs
            </p>
          </div>
        </>
      )}
    </div>
  );
};

export default ChatBot;
