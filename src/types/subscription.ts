/**
 * Subscription tier types and interfaces
 * All tiers work on Firebase Spark (free) plan - no paid Firebase features required
 */

export type SubscriptionTier = 'free' | 'supporter' | 'champion';

export interface SubscriptionFeatures {
  // Chat features
  chatMessagesPerDay: number | 'unlimited';
  chatHistoryDays: number | 'unlimited';
  
  // Submission limits
  projectSubmissionsPerMonth: number | 'unlimited';
  eventSubmissionsPerMonth: number | 'unlimited';
  
  // Participation limits
  maxProjectsToJoin: number | 'unlimited';
  maxEventsToJoin: number | 'unlimited';
  
  // Reminders
  remindersPerMonth: number | 'unlimited';
  
  // Additional features
  priorityEmailNotifications: boolean;
  earlyAccessFeatures: boolean;
  advancedAnalytics: boolean;
  dataExport: boolean;
  customEventThemes: boolean;
  featuredProfile: boolean;
  prioritySupport: boolean;
}

export interface SubscriptionTierInfo {
  id: SubscriptionTier;
  name: string;
  price: number; // in USD, 0 for free
  priceDisplay: string;
  description: string;
  features: SubscriptionFeatures;
  badge?: {
    icon: string;
    color: string;
  };
}

export interface UserSubscription {
  tier: SubscriptionTier;
  startDate: any; // Firebase Timestamp
  expiresAt?: any; // Firebase Timestamp for paid tiers
  autoRenew?: boolean;
  paymentMethod?: string;
  
  // Usage tracking (resets monthly)
  usage: {
    chatMessagesToday: number;
    projectSubmissionsThisMonth: number;
    eventSubmissionsThisMonth: number;
    projectsJoined: number;
    eventsJoined: number;
    remindersThisMonth: number;
    lastResetDate: any; // Firebase Timestamp
  };
}

// Tier configurations
export const SUBSCRIPTION_TIERS: Record<SubscriptionTier, SubscriptionTierInfo> = {
  free: {
    id: 'free',
    name: 'Free',
    price: 0,
    priceDisplay: 'Free',
    description: 'Perfect for getting started with community engagement',
    features: {
      chatMessagesPerDay: 5,
      chatHistoryDays: 7,
      projectSubmissionsPerMonth: 1,
      eventSubmissionsPerMonth: 1,
      maxProjectsToJoin: 3,
      maxEventsToJoin: 3,
      remindersPerMonth: 3,
      priorityEmailNotifications: false,
      earlyAccessFeatures: false,
      advancedAnalytics: false,
      dataExport: false,
      customEventThemes: false,
      featuredProfile: false,
      prioritySupport: false,
    },
  },
  supporter: {
    id: 'supporter',
    name: 'Supporter',
    price: 5,
    priceDisplay: '$5/month',
    description: 'For active community members who want more',
    features: {
      chatMessagesPerDay: 'unlimited',
      chatHistoryDays: 30,
      projectSubmissionsPerMonth: 5,
      eventSubmissionsPerMonth: 5,
      maxProjectsToJoin: 10,
      maxEventsToJoin: 10,
      remindersPerMonth: 20,
      priorityEmailNotifications: true,
      earlyAccessFeatures: true,
      advancedAnalytics: false,
      dataExport: false,
      customEventThemes: false,
      featuredProfile: true,
      prioritySupport: false,
    },
    badge: {
      icon: '⭐',
      color: 'bg-yellow-500',
    },
  },
  champion: {
    id: 'champion',
    name: 'Champion',
    price: 15,
    priceDisplay: '$15/month',
    description: 'Ultimate access for community champions',
    features: {
      chatMessagesPerDay: 'unlimited',
      chatHistoryDays: 'unlimited',
      projectSubmissionsPerMonth: 'unlimited',
      eventSubmissionsPerMonth: 'unlimited',
      maxProjectsToJoin: 'unlimited',
      maxEventsToJoin: 'unlimited',
      remindersPerMonth: 'unlimited',
      priorityEmailNotifications: true,
      earlyAccessFeatures: true,
      advancedAnalytics: true,
      dataExport: true,
      customEventThemes: true,
      featuredProfile: true,
      prioritySupport: true,
    },
    badge: {
      icon: '👑',
      color: 'bg-purple-600',
    },
  },
};

// Helper function to check if a feature is unlimited
export const isUnlimited = (value: number | 'unlimited'): boolean => {
  return value === 'unlimited';
};

// Helper function to get remaining usage
export const getRemainingUsage = (
  limit: number | 'unlimited',
  used: number
): number | 'unlimited' => {
  if (limit === 'unlimited') return 'unlimited';
  return Math.max(0, limit - used);
};
