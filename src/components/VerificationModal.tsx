import React, { useState } from 'react';
import { X, Mail, CheckCircle } from 'lucide-react';

interface VerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  email: string;
  onResend: () => Promise<void>;
}

const VerificationModal: React.FC<VerificationModalProps> = ({ isOpen, onClose, email, onResend }) => {
  const [isResending, setIsResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  if (!isOpen) return null;

  const handleResend = async () => {
    setIsResending(true);
    setResendSuccess(false);
    try {
      await onResend();
      setResendSuccess(true);
      setTimeout(() => setResendSuccess(false), 3000);
    } catch (error) {
      console.error('Error resending verification:', error);
      alert('Failed to resend verification email. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative animate-fadeIn">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Close modal"
        >
          <X size={24} />
        </button>

        {/* Icon */}
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-cyan-500 rounded-full flex items-center justify-center">
            <Mail size={32} className="text-white" />
          </div>
        </div>

        {/* Content */}
        <h2 className="text-2xl font-bold text-center text-gray-900 mb-2">
          Verify Your Email
        </h2>
        <p className="text-center text-gray-600 mb-6">
          We've sent a confirmation link to
        </p>
        <div className="bg-gray-50 rounded-lg p-3 mb-6">
          <p className="text-center font-medium text-gray-900 break-all">
            {email}
          </p>
        </div>

        <div className="space-y-3">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-900">
              <strong>Next steps:</strong>
            </p>
            <ol className="text-sm text-blue-800 mt-2 space-y-1 list-decimal list-inside">
              <li>Check your email inbox</li>
              <li>Click the verification link</li>
              <li>Return here and sign in</li>
            </ol>
          </div>

          {resendSuccess && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-2">
              <CheckCircle size={20} className="text-green-600 flex-shrink-0" />
              <p className="text-sm text-green-900">
                Verification email resent successfully!
              </p>
            </div>
          )}

          <div className="text-center">
            <p className="text-sm text-gray-600 mb-2">
              Didn't receive the email?
            </p>
            <button
              onClick={handleResend}
              disabled={isResending}
              className="text-sm font-medium text-pink-600 hover:text-pink-700 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {isResending ? 'Resending...' : 'Resend Verification Email'}
            </button>
          </div>

          <button
            onClick={onClose}
            className="w-full bg-gradient-to-r from-pink-500 to-cyan-500 text-white font-semibold py-3 px-6 rounded-lg hover:from-pink-600 hover:to-cyan-600 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
          >
            Got It
          </button>
        </div>

        <p className="text-xs text-gray-500 text-center mt-4">
          Check your spam folder if you don't see the email within a few minutes.
        </p>
      </div>
    </div>
  );
};

export default VerificationModal;
