import React from 'react';
import { Crown, Star, Shield } from 'lucide-react';
import { useSubscription } from '../contexts/SubscriptionContext';
import { SUBSCRIPTION_TIERS } from '../types/subscription';
import { Link } from 'react-router-dom';

interface SubscriptionBadgeProps {
  size?: 'sm' | 'md' | 'lg';
  showUpgrade?: boolean;
}

const SubscriptionBadge: React.FC<SubscriptionBadgeProps> = ({ 
  size = 'md',
  showUpgrade = true 
}) => {
  const { currentTier } = useSubscription();
  const tierInfo = SUBSCRIPTION_TIERS[currentTier];

  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1.5',
    lg: 'text-base px-4 py-2',
  };

  const getIcon = () => {
    switch (currentTier) {
      case 'free':
        return <Shield className={`${size === 'sm' ? 'w-3 h-3' : size === 'md' ? 'w-4 h-4' : 'w-5 h-5'}`} />;
      case 'supporter':
        return <Star className={`${size === 'sm' ? 'w-3 h-3' : size === 'md' ? 'w-4 h-4' : 'w-5 h-5'}`} />;
      case 'champion':
        return <Crown className={`${size === 'sm' ? 'w-3 h-3' : size === 'md' ? 'w-4 h-4' : 'w-5 h-5'}`} />;
    }
  };

  const getColor = () => {
    switch (currentTier) {
      case 'free':
        return 'bg-gray-100 text-gray-700 border-gray-300';
      case 'supporter':
        return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'champion':
        return 'bg-purple-100 text-purple-700 border-purple-300';
    }
  };

  return (
    <div className="flex items-center gap-2">
      <span
        className={`inline-flex items-center gap-1.5 font-bold rounded-full border-2 ${getColor()} ${sizeClasses[size]}`}
      >
        {getIcon()}
        {tierInfo.name} {tierInfo.badge?.icon}
      </span>
      
      {showUpgrade && currentTier !== 'champion' && (
        <Link
          to="/pricing"
          className="text-xs font-medium text-vibrant-orange hover:text-vibrant-orange-dark underline"
        >
          Upgrade
        </Link>
      )}
    </div>
  );
};

export default SubscriptionBadge;
