import React from 'react';
import { AlertCircle, Zap, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SubscriptionTier, SUBSCRIPTION_TIERS } from '../types/subscription';

interface UpgradePromptProps {
  feature: string;
  requiredTier: SubscriptionTier;
  currentUsage?: number;
  limit?: number;
  inline?: boolean;
}

const UpgradePrompt: React.FC<UpgradePromptProps> = ({
  feature,
  requiredTier,
  currentUsage,
  limit,
  inline = false,
}) => {
  const tierInfo = SUBSCRIPTION_TIERS[requiredTier];

  if (inline) {
    return (
      <div className="inline-flex items-center gap-2 text-sm text-gray-600 bg-yellow-50 px-3 py-1.5 rounded-lg border border-yellow-200">
        <AlertCircle className="w-4 h-4 text-yellow-600" />
        <span>
          {currentUsage !== undefined && limit !== undefined && (
            <strong className="text-gray-900">{currentUsage}/{limit} used</strong>
          )}
          {currentUsage !== undefined && limit !== undefined && ' - '}
          Upgrade to{' '}
          <Link to="/pricing" className="text-vibrant-orange font-bold hover:underline">
            {tierInfo.name} {tierInfo.badge?.icon}
          </Link>
        </span>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-vibrant-orange/10 to-vibrant-orange-light/10 border-2 border-vibrant-orange/30 rounded-xl p-6">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 bg-gradient-to-r from-vibrant-orange to-vibrant-orange-light rounded-full flex items-center justify-center flex-shrink-0">
          <Zap className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-bold text-logo-navy mb-2">
            Upgrade to Unlock {feature}
          </h3>
          <p className="text-gray-700 mb-4">
            {currentUsage !== undefined && limit !== undefined && (
              <>You've used {currentUsage} out of {limit} {feature}. </>
            )}
            Upgrade to <strong>{tierInfo.name}</strong> tier for{' '}
            {currentUsage !== undefined && limit !== undefined ? 'more access' : 'this feature'}.
          </p>
          <div className="flex items-center gap-3">
            <Link
              to="/pricing"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-vibrant-orange to-vibrant-orange-light text-white px-6 py-3 rounded-lg font-bold hover:shadow-lg transition-all duration-300"
            >
              Upgrade Now
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              to="/pricing"
              className="text-vibrant-orange hover:text-vibrant-orange-dark font-medium"
            >
              View All Plans
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpgradePrompt;
