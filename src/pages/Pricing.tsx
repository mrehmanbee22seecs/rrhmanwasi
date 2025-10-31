import React, { useState } from 'react';
import { Check, Crown, Star, Sparkles, Zap, Shield, TrendingUp, Award, ChevronRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useSubscription } from '../contexts/SubscriptionContext';
import { SUBSCRIPTION_TIERS, SubscriptionTier } from '../types/subscription';
import { useNavigate } from 'react-router-dom';
import PaymentModal from '../components/PaymentModal';

const Pricing = () => {
  const { currentUser, isAdmin } = useAuth();
  const { currentTier, upgradeTier } = useSubscription();
  const navigate = useNavigate();
  const [selectedTier, setSelectedTier] = useState<SubscriptionTier | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const handleUpgrade = async (tier: SubscriptionTier) => {
    if (!currentUser) {
      alert('Please sign in to upgrade your subscription');
      navigate('/');
      return;
    }

    if (tier === currentTier) {
      return;
    }

    if (tier === 'free') {
      // Allow downgrade
      if (confirm('Are you sure you want to downgrade to the Free tier?')) {
        try {
          await upgradeTier('free');
          alert('Successfully downgraded to Free tier');
        } catch (error) {
          console.error('Error downgrading:', error);
          alert('Failed to downgrade. Please try again.');
        }
      }
      return;
    }

    // For paid tiers, show payment modal
    setSelectedTier(tier);
    setShowPaymentModal(true);
  };

  const handlePaymentSuccess = () => {
    setShowPaymentModal(false);
    setSelectedTier(null);
    // Refresh the page to show updated tier
    window.location.reload();
  };

  const getTierIcon = (tier: SubscriptionTier) => {
    switch (tier) {
      case 'free':
        return <Shield className="w-8 h-8" />;
      case 'supporter':
        return <Star className="w-8 h-8" />;
      case 'champion':
        return <Crown className="w-8 h-8" />;
    }
  };

  const getTierColor = (tier: SubscriptionTier) => {
    switch (tier) {
      case 'free':
        return 'from-gray-500 to-gray-600';
      case 'supporter':
        return 'from-yellow-500 to-orange-500';
      case 'champion':
        return 'from-purple-500 to-pink-500';
    }
  };

  return (
    <div className="min-h-screen app-bg pt-28 pb-16">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <div className="text-center">
          <div className="inline-flex items-center justify-center p-3 bg-gradient-to-r from-vibrant-orange to-logo-teal rounded-full mb-6">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-logo-navy mb-6">
            Choose Your <span className="text-gradient-animated">Impact Level</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-4">
            Select a plan that matches your commitment to community engagement
          </p>
          {currentUser && (
            <p className="text-lg font-medium text-vibrant-orange">
              Current Plan: {SUBSCRIPTION_TIERS[currentTier].name} {SUBSCRIPTION_TIERS[currentTier].badge?.icon}
            </p>
          )}
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {(Object.keys(SUBSCRIPTION_TIERS) as SubscriptionTier[]).map((tierId) => {
            const tier = SUBSCRIPTION_TIERS[tierId];
            const isCurrent = tierId === currentTier;
            const isRecommended = tierId === 'supporter';

            return (
              <div
                key={tierId}
                className={`relative bg-white rounded-2xl shadow-xl overflow-hidden transition-all duration-300 hover:scale-105 ${
                  isRecommended ? 'border-4 border-vibrant-orange' : 'border-2 border-gray-200'
                }`}
              >
                {isRecommended && (
                  <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-vibrant-orange to-vibrant-orange-light text-white text-center py-2 text-sm font-bold">
                    MOST POPULAR ⭐
                  </div>
                )}

                {isCurrent && (
                  <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-logo-teal to-logo-navy text-white text-center py-2 text-sm font-bold">
                    YOUR CURRENT PLAN ✓
                  </div>
                )}

                <div className={`p-8 ${isRecommended || isCurrent ? 'mt-10' : ''}`}>
                  {/* Tier Header */}
                  <div className="text-center mb-6">
                    <div
                      className={`inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r ${getTierColor(
                        tierId
                      )} text-white mb-4`}
                    >
                      {getTierIcon(tierId)}
                    </div>
                    <h3 className="text-2xl font-bold text-logo-navy mb-2">
                      {tier.name} {tier.badge?.icon}
                    </h3>
                    <div className="text-4xl font-bold text-logo-navy mb-2">
                      {tier.price === 0 ? 'Free' : `$${tier.price}`}
                      {tier.price > 0 && <span className="text-lg text-gray-600">/month</span>}
                    </div>
                    <p className="text-gray-600">{tier.description}</p>
                  </div>

                  {/* Features List */}
                  <div className="space-y-4 mb-8">
                    <div className="border-t border-gray-200 pt-4">
                      <p className="font-bold text-logo-navy mb-3">Features:</p>
                      <ul className="space-y-3">
                        <li className="flex items-start">
                          <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                          <span className="text-gray-700">
                            {tier.features.chatMessagesPerDay === 'unlimited'
                              ? 'Unlimited'
                              : tier.features.chatMessagesPerDay}{' '}
                            chat messages per day
                          </span>
                        </li>
                        <li className="flex items-start">
                          <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                          <span className="text-gray-700">
                            {tier.features.chatHistoryDays === 'unlimited'
                              ? 'Forever'
                              : `${tier.features.chatHistoryDays} days`}{' '}
                            chat history
                          </span>
                        </li>
                        <li className="flex items-start">
                          <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                          <span className="text-gray-700">
                            {tier.features.projectSubmissionsPerMonth === 'unlimited'
                              ? 'Unlimited'
                              : tier.features.projectSubmissionsPerMonth}{' '}
                            project submissions/month
                          </span>
                        </li>
                        <li className="flex items-start">
                          <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                          <span className="text-gray-700">
                            {tier.features.eventSubmissionsPerMonth === 'unlimited'
                              ? 'Unlimited'
                              : tier.features.eventSubmissionsPerMonth}{' '}
                            event submissions/month
                          </span>
                        </li>
                        <li className="flex items-start">
                          <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                          <span className="text-gray-700">
                            Join up to{' '}
                            {tier.features.maxProjectsToJoin === 'unlimited'
                              ? 'unlimited'
                              : tier.features.maxProjectsToJoin}{' '}
                            projects
                          </span>
                        </li>
                        <li className="flex items-start">
                          <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                          <span className="text-gray-700">
                            Join up to{' '}
                            {tier.features.maxEventsToJoin === 'unlimited'
                              ? 'unlimited'
                              : tier.features.maxEventsToJoin}{' '}
                            events
                          </span>
                        </li>
                        <li className="flex items-start">
                          <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                          <span className="text-gray-700">
                            {tier.features.remindersPerMonth === 'unlimited'
                              ? 'Unlimited'
                              : tier.features.remindersPerMonth}{' '}
                            reminders/month
                          </span>
                        </li>
                        {tier.features.priorityEmailNotifications && (
                          <li className="flex items-start">
                            <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                            <span className="text-gray-700">Priority email notifications</span>
                          </li>
                        )}
                        {tier.features.featuredProfile && (
                          <li className="flex items-start">
                            <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                            <span className="text-gray-700">Featured profile</span>
                          </li>
                        )}
                        {tier.features.advancedAnalytics && (
                          <li className="flex items-start">
                            <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                            <span className="text-gray-700">Advanced analytics</span>
                          </li>
                        )}
                        {tier.features.dataExport && (
                          <li className="flex items-start">
                            <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                            <span className="text-gray-700">Data export (CSV/Excel)</span>
                          </li>
                        )}
                        {tier.features.prioritySupport && (
                          <li className="flex items-start">
                            <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                            <span className="text-gray-700">Priority support</span>
                          </li>
                        )}
                      </ul>
                    </div>
                  </div>

                  {/* CTA Button */}
                  <button
                    onClick={() => handleUpgrade(tierId)}
                    disabled={isCurrent}
                    className={`w-full py-3 px-6 rounded-lg font-bold text-lg transition-all duration-300 flex items-center justify-center ${
                      isCurrent
                        ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                        : isRecommended
                        ? 'bg-gradient-to-r from-vibrant-orange to-vibrant-orange-light text-white hover:shadow-lg'
                        : 'bg-gradient-to-r from-logo-navy to-logo-teal text-white hover:shadow-lg'
                    }`}
                  >
                    {isCurrent ? (
                      'Current Plan'
                    ) : (
                      <>
                        {tierId === 'free' ? 'Downgrade' : 'Upgrade Now'}
                        <ChevronRight className="w-5 h-5 ml-2" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && selectedTier && (
        <PaymentModal
          tier={selectedTier}
          onClose={() => {
            setShowPaymentModal(false);
            setSelectedTier(null);
          }}
          onSuccess={handlePaymentSuccess}
        />
      )}

      {/* FAQ Section */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-center text-logo-navy mb-8">Frequently Asked Questions</h2>
        <div className="space-y-4">
          <details className="bg-white rounded-lg p-6 shadow-md">
            <summary className="font-bold text-logo-navy cursor-pointer">
              Can I cancel my subscription anytime?
            </summary>
            <p className="text-gray-600 mt-3">
              Yes! You can downgrade to the Free tier at any time. Your current subscription benefits will remain
              active until the end of your billing period.
            </p>
          </details>

          <details className="bg-white rounded-lg p-6 shadow-md">
            <summary className="font-bold text-logo-navy cursor-pointer">
              What happens if I exceed my limits?
            </summary>
            <p className="text-gray-600 mt-3">
              You'll be prompted to upgrade to a higher tier. Your account won't be suspended, but you won't be able to
              use features beyond your current tier's limits until you upgrade or your monthly limits reset.
            </p>
          </details>

          <details className="bg-white rounded-lg p-6 shadow-md">
            <summary className="font-bold text-logo-navy cursor-pointer">How do monthly limits reset?</summary>
            <p className="text-gray-600 mt-3">
              All monthly limits reset automatically 30 days after your subscription starts or renews. Daily limits (like
              chat messages) reset every 24 hours.
            </p>
          </details>

          <details className="bg-white rounded-lg p-6 shadow-md">
            <summary className="font-bold text-logo-navy cursor-pointer">Is my payment secure?</summary>
            <p className="text-gray-600 mt-3">
              Yes! We use trusted payment methods (Easypaisa and bank transfer). We never store your payment information.
              All transactions are processed securely through established financial institutions.
            </p>
          </details>
        </div>
      </div>
    </div>
  );
};

export default Pricing;
