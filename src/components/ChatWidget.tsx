import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Minimize2, Menu, Plus, Clock, Trash2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useChat } from '../hooks/useChat';

interface Message {
  id: string;
  sender: 'user' | 'bot' | 'admin';
  text: string;
  createdAt: Date;
  meta?: Record<string, any>;
}

const ChatWidget = () => {
  const { currentUser } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const {
    messages,
    chats,
    currentChatId,
    sendMessage,
    setCurrentChatId,
    closeChat,
  } = useChat(currentUser?.uid || null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!currentUser) return null;

  const handleSend = async () => {
    if (!inputText.trim()) return;

    try {
      setIsTyping(true);
      await sendMessage(inputText);
      setInputText('');
    } catch (error: any) {
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
    // Check if chat has admin takeover
    return chat.takeoverBy;
  });

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg transition-all z-50 relative"
        aria-label="Open chat"
      >
        <MessageCircle className="w-6 h-6" />
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
      className={`fixed bottom-6 right-6 bg-white rounded-lg shadow-2xl z-50 transition-all ${
        isMinimized ? 'w-80 h-16' : showHistory ? 'w-[600px] h-[600px]' : 'w-96 h-[600px]'
      }`}
    >
      <div className="flex items-center justify-between p-4 bg-blue-600 text-white rounded-t-lg">
        <div className="flex items-center gap-2">
          <MessageCircle className="w-5 h-5" />
          <h3 className="font-semibold">
            {currentChat?.title || 'Wasilah Support'}
          </h3>
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
                <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="text-sm">Welcome to Wasilah Support!</p>
                <p className="text-xs mt-1">How can we help you today?</p>
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
                  className={`max-w-[75%] rounded-lg px-4 py-2 ${
                    message.sender === 'user'
                      ? 'bg-blue-600 text-white'
                      : message.sender === 'admin'
                      ? 'bg-green-100 text-green-900 border border-green-300'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  {message.sender === 'admin' && (
                    <div className="text-xs font-semibold mb-1 text-green-700">
                      Admin
                    </div>
                  )}
                  <p className="text-sm whitespace-pre-wrap">{message.text}</p>
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