import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Minimize2, Menu, Plus, Clock, Trash2, Bell, ExternalLink, Sparkles } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useChat } from '../hooks/useChat';
import { collection, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import { findBestMatch, formatResponse } from '../utils/kbMatcher';

interface Message {
  id: string;
  sender: 'user' | 'bot' | 'admin';
  text: string;
  createdAt: Date;
  meta?: Record<string, any>;
  sourceUrl?: string;
  sourcePage?: string;
  needsAdmin?: boolean;
  confidence?: number;
}

const ChatWidget = () => {
  const { currentUser } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [kbPages, setKbPages] = useState<any[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const {
    messages,
    chats,
    currentChatId,
    sendMessage,
    setCurrentChatId,
    closeChat,
  } = useChat(currentUser?.uid || null);

  // Load KB pages for intelligent matching
  useEffect(() => {
    const loadKb = async () => {
      try {
        const pagesSnapshot = await getDocs(
          collection(db, 'kb', 'pages', 'content')
        );
        
        const pages: any[] = [];
        pagesSnapshot.forEach((doc) => {
          pages.push({
            id: doc.id,
            ...doc.data()
          });
        });
        
        setKbPages(pages);
        console.log(`✅ Loaded ${pages.length} KB pages for intelligent matching`);
      } catch (error) {
        console.error('Error loading KB:', error);
      }
    };
    
    loadKb();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Show for both logged-in users AND guests
  if (!currentUser && !isOpen) {
    // Allow opening chat even as guest
  }

  const handleNotifyAdmin = async (messageText: string) => {
    if (!currentChatId) return;
    
    try {
      await addDoc(collection(db, 'unanswered_queries'), {
        chatId: currentChatId,
        userId: currentUser?.uid || 'guest',
        query: messageText,
        status: 'pending',
        createdAt: serverTimestamp()
      });
      
      alert('✅ Admin has been notified! They will respond soon.');
    } catch (error) {
      console.error('Error notifying admin:', error);
      alert('Failed to notify admin. Please try again.');
    }
  };

  const handleSend = async () => {
    if (!inputText.trim()) return;

    const userMessage = inputText.trim();
    setInputText('');
    setIsTyping(true);

    try {
      // Send user message using existing hook
      await sendMessage(userMessage);
      
      // Small delay for UX
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // If KB pages loaded, use intelligent matching
      if (kbPages.length > 0) {
        const match = findBestMatch(userMessage, kbPages, 0.4);
        const response = formatResponse(match);
        
        console.log('🤖 Intelligent match:', {
          query: userMessage,
          confidence: response.confidence,
          hasMatch: !response.needsAdmin
        });
        
        // The bot response will be handled by useChat hook
        // but we can log the intelligence for monitoring
      }
    } catch (error: any) {
      console.error('Error sending message:', error);
      alert(error.message || 'Failed to send message');
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Check if there are any admin messages in any chat
  const hasUnreadAdminMessages = chats.some((chat) => {
    return chat.takeoverBy;
  });

  const hasIntelligentKb = kbPages.length > 0;

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white p-3 sm:p-4 rounded-full shadow-2xl transition-all z-50 relative hover:scale-110 active:scale-95 group animate-bounce-subtle"
        aria-label="Open chat"
      >
        <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6" />
        {hasIntelligentKb && (
          <Sparkles className="w-3 h-3 absolute -top-1 -left-1 text-yellow-300 animate-pulse" title="AI-Powered" />
        )}
        {hasUnreadAdminMessages ? (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white animate-pulse" title="Admin replied!" />
        ) : chats.length > 0 ? (
          <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-semibold">
            {chats.length}
          </span>
        ) : null}
      </button>
    );
  }

  const handleNewChat = () => {
    setCurrentChatId(null);
    setShowHistory(false);
  };

  const handleSelectChat = (chatId: string) => {
    setCurrentChatId(chatId);
    setShowHistory(false);
  };

  const handleCloseChat = async () => {
    if (currentChatId && window.confirm('Close this chat? You can still view it in history.')) {
      await closeChat();
      setShowHistory(false);
    }
  };

  const currentChat = chats.find((c) => c.id === currentChatId);
  const hasAdminMessages = messages.some((m) => m.sender === 'admin');

  return (
    <div
      className={`fixed bottom-4 right-4 sm:bottom-6 sm:right-6 bg-white rounded-2xl shadow-2xl z-50 transition-all animate-slide-up ${
        isMinimized ? 'w-80 sm:w-96 h-16' : showHistory ? 'w-[calc(100vw-2rem)] sm:w-[600px] h-[calc(100vh-2rem)] sm:h-[600px]' : 'w-[calc(100vw-2rem)] sm:w-96 h-[calc(100vh-2rem)] sm:h-[600px]'
      }`}
    >
      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-lg">
        <div className="flex items-center gap-2">
          <MessageCircle className="w-5 h-5" />
          <h3 className="font-semibold">
            {currentChat?.title || 'Wasilah Assistant'}
          </h3>
          {hasIntelligentKb && (
            <span className="text-xs bg-yellow-400 text-blue-900 px-2 py-0.5 rounded-full flex items-center gap-1 font-semibold">
              <Sparkles className="w-3 h-3" />
              Smart
            </span>
          )}
          {hasAdminMessages && (
            <span className="text-xs bg-green-500 px-2 py-0.5 rounded-full">
              Admin replied
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="hover:bg-blue-700 p-1 rounded transition-colors"
            aria-label="Chat history"
            title="Chat History"
          >
            <Menu className="w-5 h-5" />
            {chats.length > 1 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">
                {chats.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="hover:bg-blue-700 p-1 rounded transition-colors"
            aria-label="Minimize"
          >
            <Minimize2 className="w-5 h-5" />
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="hover:bg-blue-700 p-1 rounded transition-colors"
            aria-label="Close chat"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <div className="flex h-[536px]">
          {/* Chat History Sidebar */}
          {showHistory && (
            <div className="w-56 border-r flex flex-col">
              <div className="p-3 border-b bg-gray-50">
                <button
                  onClick={handleNewChat}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  New Chat
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto">
                {chats.length === 0 ? (
                  <div className="p-4 text-center text-gray-500 text-sm">
                    No chat history yet
                  </div>
                ) : (
                  <div className="divide-y">
                    {chats.map((chat) => (
                      <button
                        key={chat.id}
                        onClick={() => handleSelectChat(chat.id)}
                        className={`w-full p-3 text-left hover:bg-blue-50 transition-colors ${
                          currentChatId === chat.id ? 'bg-blue-100' : ''
                        }`}
                      >
                        <div className="text-sm font-medium text-gray-900 truncate">
                          {chat.title}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <Clock className="w-3 h-3 text-gray-400" />
                          <span className="text-xs text-gray-500">
                            {chat.lastActivityAt.toLocaleDateString([], {
                              month: 'short',
                              day: 'numeric',
                            })}
                          </span>
                        </div>
                        {chat.takeoverBy && (
                          <span className="inline-block mt-1 text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded-full">
                            Admin active
                          </span>
                        )}
                        {!chat.isActive && (
                          <span className="inline-block mt-1 ml-1 text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">
                            Closed
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Main Chat Area */}
          <div className="flex-1 flex flex-col">
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.length === 0 && (
              <div className="text-center text-gray-500 mt-8">
                <div className="relative inline-block mb-3">
                  <MessageCircle className="w-12 h-12 opacity-30" />
                  {hasIntelligentKb && (
                    <Sparkles className="w-5 h-5 absolute -top-1 -right-1 text-yellow-500 animate-pulse" />
                  )}
                </div>
                <p className="text-sm font-semibold">Welcome to Wasilah Assistant!</p>
                <p className="text-xs mt-1">
                  {hasIntelligentKb 
                    ? '🤖 Ask me anything - I learn from our website!'
                    : 'How can we help you today?'
                  }
                </p>
                {hasIntelligentKb && (
                  <div className="mt-4 space-y-2 max-w-xs mx-auto">
                    <button
                      onClick={() => setInputText('What is Wasilah?')}
                      className="w-full text-left px-3 py-2 text-xs bg-white hover:bg-blue-50 rounded-lg border border-gray-200 transition-colors"
                    >
                      💡 What is Wasilah?
                    </button>
                    <button
                      onClick={() => setInputText('How can I volunteer?')}
                      className="w-full text-left px-3 py-2 text-xs bg-white hover:bg-blue-50 rounded-lg border border-gray-200 transition-colors"
                    >
                      🙋 How can I volunteer?
                    </button>
                    <button
                      onClick={() => setInputText('What projects do you run?')}
                      className="w-full text-left px-3 py-2 text-xs bg-white hover:bg-blue-50 rounded-lg border border-gray-200 transition-colors"
                    >
                      🎯 What projects do you run?
                    </button>
                  </div>
                )}
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
                  className={`max-w-[75%] rounded-2xl px-4 py-3 ${
                    message.sender === 'user'
                      ? 'bg-blue-600 text-white'
                      : message.sender === 'admin'
                      ? 'bg-green-100 text-green-900 border border-green-300'
                      : 'bg-white text-gray-900 shadow-md'
                  }`}
                >
                  {message.sender === 'admin' && (
                    <div className="text-xs font-semibold mb-1 text-green-700 flex items-center gap-1">
                      <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                      Admin
                    </div>
                  )}
                  <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                  
                  {/* Source link for bot responses */}
                  {message.sender === 'bot' && message.sourceUrl && (
                    <a
                      href={message.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 mt-2 text-xs text-blue-600 hover:text-blue-700 font-medium hover:underline"
                    >
                      <ExternalLink className="w-3 h-3" />
                      Learn more: {message.sourcePage || 'Source'}
                    </a>
                  )}
                  
                  {/* Confidence indicator for bot */}
                  {message.sender === 'bot' && message.confidence && (
                    <div className="mt-2 text-xs text-gray-500 flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      {Math.round(message.confidence * 100)}% confident
                    </div>
                  )}
                  
                  {/* Notify Admin button for fallback */}
                  {message.sender === 'bot' && message.needsAdmin && (
                    <button
                      onClick={() => handleNotifyAdmin(message.text)}
                      className="flex items-center gap-1 mt-2 px-3 py-1.5 text-xs bg-yellow-100 hover:bg-yellow-200 text-yellow-800 rounded-lg transition-colors font-medium"
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

            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-lg px-4 py-2">
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

            <div className="border-t p-4">
              {currentChatId && (
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-gray-500">
                    {currentChat?.isActive ? 'Chat active' : 'Chat closed'}
                  </span>
                  {currentChatId && (
                    <button
                      onClick={handleCloseChat}
                      className="text-xs text-red-600 hover:text-red-700 flex items-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" />
                      Close Chat
                    </button>
                  )}
                </div>
              )}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message..."
                  className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none"
                  disabled={isTyping}
                />
                <button
                  onClick={handleSend}
                  disabled={!inputText.trim() || isTyping}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white p-2 rounded-lg transition-colors"
                  aria-label="Send message"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatWidget;