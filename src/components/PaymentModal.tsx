import React, { useState } from 'react';
import { X, CheckCircle, Upload, AlertCircle, Loader, CreditCard, Smartphone, Building, Mail } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useSubscription } from '../contexts/SubscriptionContext';
import { SUBSCRIPTION_TIERS, SubscriptionTier } from '../types/subscription';
import { PAYMENT_GATEWAYS, PAYMENT_ACCOUNTS, PaymentMethod } from '../types/payment';
import {
  createPaymentTransaction,
  verifyAndCompletePayment,
  isTransactionIdUnique,
  calculatePrice,
  createAdminPaymentNotification,
} from '../services/paymentService';

interface PaymentModalProps {
  tier: SubscriptionTier;
  onClose: () => void;
  onSuccess: () => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({ tier, onClose, onSuccess }) => {
  const { currentUser, userData } = useAuth();
  const { upgradeTier } = useSubscription();
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [transactionId, setTransactionId] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const tierInfo = SUBSCRIPTION_TIERS[tier];
  const amount = calculatePrice(tier);

  const handleMethodSelect = (method: PaymentMethod) => {
    setSelectedMethod(method);
    setError(null);
  };

  const handleInstantPayment = async () => {
    if (!currentUser || !userData || !selectedMethod) return;

    // Validate inputs based on method
    if ((selectedMethod === 'jazzcash' || selectedMethod === 'easypaisa') && !transactionId) {
      setError('Please enter your transaction ID');
      return;
    }

    if ((selectedMethod === 'jazzcash' || selectedMethod === 'easypaisa') && !phoneNumber) {
      setError('Please enter your phone number');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // Check if transaction ID is unique (for mobile wallets)
      if (transactionId) {
        const isUnique = await isTransactionIdUnique(transactionId);
        if (!isUnique) {
          throw new Error('This transaction ID has already been used. Please check your payment or contact support.');
        }
      }

      // Create payment transaction
      const paymentId = await createPaymentTransaction({
        userId: currentUser.uid,
        email: userData.email || '',
        amount,
        tier,
        method: selectedMethod,
        transactionId: transactionId || undefined,
        referenceNumber: `REF-${Date.now()}`,
        phone: phoneNumber || undefined,
      });

      // For instant methods (JazzCash, Easypaisa), auto-verify and activate
      if (selectedMethod === 'jazzcash' || selectedMethod === 'easypaisa') {
        // Verify payment (in production, this would call the gateway API)
        await verifyAndCompletePayment({
          paymentId,
          transactionId,
          metadata: {
            phone: phoneNumber,
            method: selectedMethod,
          },
        });

        // Immediately upgrade the user's tier
        await upgradeTier(tier);

        // Show success
        setSuccess(true);

        // Call onSuccess after a short delay
        setTimeout(() => {
          onSuccess();
        }, 2000);
      } else {
        // For manual methods, create admin notification
        await createAdminPaymentNotification(paymentId, userData.email || '', tier, amount);

        // Show pending message
        setError('Payment submitted for verification. You will be upgraded within 24 hours.');
        setTimeout(() => {
          onClose();
        }, 3000);
      }
    } catch (err: any) {
      console.error('Payment error:', err);
      setError(err.message || 'Failed to process payment. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const getMethodIcon = (method: PaymentMethod) => {
    switch (method) {
      case 'jazzcash':
      case 'easypaisa':
        return <Smartphone className="w-6 h-6" />;
      case 'bank_transfer':
        return <Building className="w-6 h-6" />;
      case 'card':
      case 'payfast':
        return <CreditCard className="w-6 h-6" />;
      default:
        return <Mail className="w-6 h-6" />;
    }
  };

  if (success) {
    return (
      <div className="fixed inset-0 bg-black/50 z-[100] backdrop-blur-sm flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center animate-scale-in">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h3 className="text-2xl font-bold text-logo-navy mb-4">
            Payment Successful! 🎉
          </h3>
          <p className="text-gray-600 mb-6">
            Your subscription has been upgraded to {tierInfo.name} tier. Enjoy your new features!
          </p>
          <button
            onClick={onSuccess}
            className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-3 px-6 rounded-lg font-bold hover:shadow-lg transition-all duration-300"
          >
            Continue to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-[100] backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-vibrant-orange to-vibrant-orange-light text-white p-6 flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold">
              Upgrade to {tierInfo.name} {tierInfo.badge?.icon}
            </h3>
            <p className="text-white/90 mt-1">Choose your payment method</p>
          </div>
          <button
            onClick={onClose}
            className="hover:bg-white/20 p-2 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Amount Display */}
          <div className="bg-gradient-to-r from-logo-navy to-logo-teal text-white rounded-xl p-6 mb-6 text-center">
            <p className="text-sm opacity-90 mb-2">Total Amount</p>
            <p className="text-4xl font-bold">${amount}</p>
            <p className="text-sm opacity-90 mt-2">per month</p>
          </div>

          {/* Payment Methods */}
          {!selectedMethod ? (
            <div>
              <h4 className="font-bold text-logo-navy mb-4 text-lg">Select Payment Method:</h4>
              <div className="space-y-3">
                {/* JazzCash - Instant */}
                {PAYMENT_GATEWAYS.jazzcash.available && (
                  <button
                    onClick={() => handleMethodSelect('jazzcash')}
                    className="w-full p-4 border-2 border-gray-200 rounded-xl hover:border-vibrant-orange hover:bg-orange-50 transition-all text-left flex items-center gap-4"
                  >
                    <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-orange-500 rounded-full flex items-center justify-center text-white text-2xl">
                      📱
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-logo-navy">{PAYMENT_GATEWAYS.jazzcash.displayName}</p>
                      <p className="text-sm text-gray-600">{PAYMENT_GATEWAYS.jazzcash.description}</p>
                      <p className="text-xs text-green-600 font-medium mt-1">⚡ Instant Activation</p>
                    </div>
                  </button>
                )}

                {/* Easypaisa - Instant */}
                {PAYMENT_GATEWAYS.easypaisa.available && (
                  <button
                    onClick={() => handleMethodSelect('easypaisa')}
                    className="w-full p-4 border-2 border-gray-200 rounded-xl hover:border-vibrant-orange hover:bg-orange-50 transition-all text-left flex items-center gap-4"
                  >
                    <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-teal-500 rounded-full flex items-center justify-center text-white text-2xl">
                      💳
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-logo-navy">{PAYMENT_GATEWAYS.easypaisa.displayName}</p>
                      <p className="text-sm text-gray-600">{PAYMENT_GATEWAYS.easypaisa.description}</p>
                      <p className="text-xs text-green-600 font-medium mt-1">⚡ Instant Activation</p>
                    </div>
                  </button>
                )}

                {/* Bank Transfer */}
                {PAYMENT_GATEWAYS.bank_transfer.available && (
                  <button
                    onClick={() => handleMethodSelect('bank_transfer')}
                    className="w-full p-4 border-2 border-gray-200 rounded-xl hover:border-vibrant-orange hover:bg-orange-50 transition-all text-left flex items-center gap-4"
                  >
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white text-2xl">
                      🏦
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-logo-navy">{PAYMENT_GATEWAYS.bank_transfer.displayName}</p>
                      <p className="text-sm text-gray-600">{PAYMENT_GATEWAYS.bank_transfer.description}</p>
                      <p className="text-xs text-yellow-600 font-medium mt-1">⏱ Manual Verification (24h)</p>
                    </div>
                  </button>
                )}

                {/* Manual Verification */}
                {PAYMENT_GATEWAYS.manual.available && (
                  <button
                    onClick={() => handleMethodSelect('manual')}
                    className="w-full p-4 border-2 border-gray-200 rounded-xl hover:border-vibrant-orange hover:bg-orange-50 transition-all text-left flex items-center gap-4"
                  >
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-2xl">
                      📧
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-logo-navy">{PAYMENT_GATEWAYS.manual.displayName}</p>
                      <p className="text-sm text-gray-600">{PAYMENT_GATEWAYS.manual.description}</p>
                      <p className="text-xs text-yellow-600 font-medium mt-1">⏱ Up to 24 hours</p>
                    </div>
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div>
              {/* Back Button */}
              <button
                onClick={() => setSelectedMethod(null)}
                className="text-vibrant-orange hover:text-vibrant-orange-dark mb-4 font-medium"
              >
                ← Change Payment Method
              </button>

              {/* Payment Details */}
              <div className="bg-gray-50 rounded-xl p-6 mb-6">
                <div className="flex items-center gap-3 mb-4">
                  {getMethodIcon(selectedMethod)}
                  <h4 className="font-bold text-logo-navy text-lg">
                    {PAYMENT_GATEWAYS[selectedMethod].displayName}
                  </h4>
                </div>

                {/* JazzCash/Easypaisa Instructions */}
                {(selectedMethod === 'jazzcash' || selectedMethod === 'easypaisa') && (
                  <div className="space-y-4">
                    <div className="bg-white rounded-lg p-4 border-2 border-green-200">
                      <p className="text-sm text-gray-700 mb-2">
                        <strong>Step 1:</strong> Send payment to:
                      </p>
                      <p className="text-2xl font-bold text-logo-navy mb-1">
                        {selectedMethod === 'jazzcash' 
                          ? PAYMENT_ACCOUNTS.jazzcash.number 
                          : PAYMENT_ACCOUNTS.easypaisa.number}
                      </p>
                      <p className="text-sm text-gray-600">
                        Account: {selectedMethod === 'jazzcash' 
                          ? PAYMENT_ACCOUNTS.jazzcash.name 
                          : PAYMENT_ACCOUNTS.easypaisa.name}
                      </p>
                      <p className="text-lg font-bold text-vibrant-orange mt-2">
                        Amount: ${amount} (PKR {Math.round(amount * 280)})
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        *Exchange rate may vary
                      </p>
                    </div>

                    <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4">
                      <p className="text-sm text-gray-800">
                        <strong>Step 2:</strong> After payment, enter your transaction ID below for instant activation ⚡
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number Used for Payment*
                      </label>
                      <input
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="03001234567"
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-vibrant-orange focus:outline-none"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Transaction ID*
                      </label>
                      <input
                        type="text"
                        value={transactionId}
                        onChange={(e) => setTransactionId(e.target.value.toUpperCase())}
                        placeholder="TXN123456789"
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-vibrant-orange focus:outline-none"
                        required
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Find this in your {selectedMethod === 'jazzcash' ? 'JazzCash' : 'Easypaisa'} app transaction history
                      </p>
                    </div>
                  </div>
                )}

                {/* Bank Transfer Instructions */}
                {selectedMethod === 'bank_transfer' && (
                  <div className="space-y-4">
                    <div className="bg-white rounded-lg p-4 border-2 border-blue-200">
                      <p className="text-sm text-gray-700 mb-3">
                        <strong>Transfer to:</strong>
                      </p>
                      <div className="space-y-2 text-sm">
                        <p><strong>Bank:</strong> {PAYMENT_ACCOUNTS.bank.bankName}</p>
                        <p><strong>Account #:</strong> {PAYMENT_ACCOUNTS.bank.accountNumber}</p>
                        <p><strong>IBAN:</strong> {PAYMENT_ACCOUNTS.bank.iban}</p>
                        <p><strong>Account Title:</strong> {PAYMENT_ACCOUNTS.bank.accountTitle}</p>
                        <p className="text-lg font-bold text-vibrant-orange mt-2">
                          Amount: ${amount} (PKR {Math.round(amount * 280)})
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          *Exchange rate may vary
                        </p>
                      </div>
                    </div>

                    <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4">
                      <p className="text-sm text-gray-800">
                        After transfer, click "Submit" below. Your subscription will be activated within 1-2 business days.
                      </p>
                    </div>
                  </div>
                )}

                {/* Manual Verification Instructions */}
                {selectedMethod === 'manual' && (
                  <div className="space-y-4">
                    <div className="bg-white rounded-lg p-4 border-2 border-purple-200">
                      <p className="text-sm text-gray-700 mb-3">
                        <strong>Send payment via any method and email proof to:</strong>
                      </p>
                      <p className="text-xl font-bold text-vibrant-orange mb-2">
                        {PAYMENT_ACCOUNTS.email.billing}
                      </p>
                      <p className="text-sm text-gray-600 mb-3">
                        Include your account email: <strong>{userData?.email}</strong>
                      </p>
                      <p className="text-lg font-bold text-logo-navy">
                        Amount: ${amount}
                      </p>
                    </div>

                    <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4">
                      <p className="text-sm text-gray-800">
                        Your subscription will be activated within 24 hours of verification.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4 mb-4 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}

              {/* Submit Button */}
              <button
                onClick={handleInstantPayment}
                disabled={isProcessing}
                className="w-full bg-gradient-to-r from-vibrant-orange to-vibrant-orange-light text-white py-4 px-6 rounded-lg font-bold text-lg hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    {(selectedMethod === 'jazzcash' || selectedMethod === 'easypaisa')
                      ? '⚡ Activate Instantly'
                      : 'Submit for Verification'}
                  </>
                )}
              </button>

              {(selectedMethod === 'jazzcash' || selectedMethod === 'easypaisa') && (
                <p className="text-center text-sm text-green-600 font-medium mt-3">
                  ✓ Instant activation after verification
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
