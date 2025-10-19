import React, { useState } from 'react';
import { MessageCircle } from 'lucide-react';
import ChatWidgetModal from './ChatWidgetModal';

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Z-INDEX: 50 - Floating button */}
      {/* Mobile: bottom-44 right-4 (visible above other elements) */}
      {/* Desktop: bottom-6 right-6 (standard positioning) */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-44 right-4 sm:bottom-6 sm:right-6 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-3 py-2 sm:px-6 sm:py-4 rounded-full shadow-2xl transition-all z-50 hover:scale-110 active:scale-95 animate-bounce-subtle flex items-center gap-2"
        title="Chat with us"
      >
        <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6" />
        <span className="text-sm sm:text-lg font-bold whitespace-nowrap">
          <span className="hidden xs:inline">CHAT NOW!</span>
          <span className="xs:hidden">CHAT</span>
        </span>
      </button>

      {/* Chat Modal */}
      <ChatWidgetModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
};

export default ChatWidget;
