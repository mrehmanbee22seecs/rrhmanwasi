import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from './AuthContext';
import {
  SubscriptionTier,
  UserSubscription,
  SUBSCRIPTION_TIERS,
  isUnlimited,
  getRemainingUsage,
  SubscriptionFeatures,
} from '../types/subscription';

interface SubscriptionContextType {
  userSubscription: UserSubscription | null;
  currentTier: SubscriptionTier;
  features: SubscriptionFeatures;
  loading: boolean;
  
  // Feature checks
  canUseFeature: (feature: keyof SubscriptionFeatures) => boolean;
  canSendChatMessage: () => Promise<boolean>;
  canSubmitProject: () => Promise<boolean>;
  canSubmitEvent: () => Promise<boolean>;
  canJoinProject: () => Promise<boolean>;
  canJoinEvent: () => Promise<boolean>;
  canCreateReminder: () => Promise<boolean>;
  
  // Usage tracking
  incrementChatUsage: () => Promise<void>;
  incrementProjectSubmission: () => Promise<void>;
  incrementEventSubmission: () => Promise<void>;
  incrementProjectJoined: () => Promise<void>;
  incrementEventJoined: () => Promise<void>;
  incrementReminder: () => Promise<void>;
  
  // Subscription management
  upgradeTier: (newTier: SubscriptionTier) => Promise<void>;
  resetMonthlyUsage: () => Promise<void>;
  refreshSubscription: () => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
};

interface SubscriptionProviderProps {
  children: ReactNode;
}

export const SubscriptionProvider: React.FC<SubscriptionProviderProps> = ({ children }) => {
  const { currentUser, userData } = useAuth();
  const [userSubscription, setUserSubscription] = useState<UserSubscription | null>(null);
  const [loading, setLoading] = useState(true);

  const currentTier: SubscriptionTier = userSubscription?.tier || 'free';
  const features = SUBSCRIPTION_TIERS[currentTier].features;

  // Initialize or load subscription
  useEffect(() => {
    if (currentUser && userData) {
      initializeSubscription();
    } else {
      setUserSubscription(null);
      setLoading(false);
    }
  }, [currentUser?.uid, userData]);

  const initializeSubscription = async () => {
    if (!currentUser) return;

    try {
      const userRef = doc(db, 'users', currentUser.uid);
      const userDoc = await getDoc(userRef);

      if (userDoc.exists()) {
        const data = userDoc.data();
        
        if (data.subscription) {
          setUserSubscription(data.subscription);
          
          // Check if we need to reset monthly usage
          const lastReset = data.subscription.usage?.lastResetDate?.toDate?.();
          const now = new Date();
          
          if (lastReset) {
            const daysSinceReset = Math.floor((now.getTime() - lastReset.getTime()) / (1000 * 60 * 60 * 24));
            
            // Reset if it's been more than 30 days
            if (daysSinceReset >= 30) {
              await resetMonthlyUsage();
            }
          }
        } else {
          // Initialize subscription for existing user
          const newSubscription: UserSubscription = {
            tier: 'free',
            startDate: serverTimestamp(),
            usage: {
              chatMessagesToday: 0,
              projectSubmissionsThisMonth: 0,
              eventSubmissionsThisMonth: 0,
              projectsJoined: 0,
              eventsJoined: 0,
              remindersThisMonth: 0,
              lastResetDate: serverTimestamp(),
            },
          };

          await updateDoc(userRef, {
            subscription: newSubscription,
          });

          setUserSubscription(newSubscription);
        }
      }
    } catch (error) {
      console.error('Error initializing subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  const canUseFeature = (feature: keyof SubscriptionFeatures): boolean => {
    return !!features[feature];
  };

  const canSendChatMessage = async (): Promise<boolean> => {
    if (!userSubscription) return false;
    
    const limit = features.chatMessagesPerDay;
    if (isUnlimited(limit)) return true;
    
    const used = userSubscription.usage.chatMessagesToday || 0;
    return used < (limit as number);
  };

  const canSubmitProject = async (): Promise<boolean> => {
    if (!userSubscription) return false;
    
    const limit = features.projectSubmissionsPerMonth;
    if (isUnlimited(limit)) return true;
    
    const used = userSubscription.usage.projectSubmissionsThisMonth || 0;
    return used < (limit as number);
  };

  const canSubmitEvent = async (): Promise<boolean> => {
    if (!userSubscription) return false;
    
    const limit = features.eventSubmissionsPerMonth;
    if (isUnlimited(limit)) return true;
    
    const used = userSubscription.usage.eventSubmissionsThisMonth || 0;
    return used < (limit as number);
  };

  const canJoinProject = async (): Promise<boolean> => {
    if (!userSubscription) return false;
    
    const limit = features.maxProjectsToJoin;
    if (isUnlimited(limit)) return true;
    
    const used = userSubscription.usage.projectsJoined || 0;
    return used < (limit as number);
  };

  const canJoinEvent = async (): Promise<boolean> => {
    if (!userSubscription) return false;
    
    const limit = features.maxEventsToJoin;
    if (isUnlimited(limit)) return true;
    
    const used = userSubscription.usage.eventsJoined || 0;
    return used < (limit as number);
  };

  const canCreateReminder = async (): Promise<boolean> => {
    if (!userSubscription) return false;
    
    const limit = features.remindersPerMonth;
    if (isUnlimited(limit)) return true;
    
    const used = userSubscription.usage.remindersThisMonth || 0;
    return used < (limit as number);
  };

  const incrementUsage = async (field: keyof UserSubscription['usage']) => {
    if (!currentUser || !userSubscription) return;

    try {
      const userRef = doc(db, 'users', currentUser.uid);
      const newValue = (userSubscription.usage[field] || 0) + 1;

      await updateDoc(userRef, {
        [`subscription.usage.${field}`]: newValue,
      });

      // Update local state
      setUserSubscription({
        ...userSubscription,
        usage: {
          ...userSubscription.usage,
          [field]: newValue,
        },
      });
    } catch (error) {
      console.error(`Error incrementing ${field}:`, error);
    }
  };

  const incrementChatUsage = () => incrementUsage('chatMessagesToday');
  const incrementProjectSubmission = () => incrementUsage('projectSubmissionsThisMonth');
  const incrementEventSubmission = () => incrementUsage('eventSubmissionsThisMonth');
  const incrementProjectJoined = () => incrementUsage('projectsJoined');
  const incrementEventJoined = () => incrementUsage('eventsJoined');
  const incrementReminder = () => incrementUsage('remindersThisMonth');

  const resetMonthlyUsage = async () => {
    if (!currentUser) return;

    try {
      const userRef = doc(db, 'users', currentUser.uid);
      const resetUsage = {
        chatMessagesToday: 0,
        projectSubmissionsThisMonth: 0,
        eventSubmissionsThisMonth: 0,
        projectsJoined: 0,
        eventsJoined: 0,
        remindersThisMonth: 0,
        lastResetDate: serverTimestamp(),
      };

      await updateDoc(userRef, {
        'subscription.usage': resetUsage,
      });

      if (userSubscription) {
        setUserSubscription({
          ...userSubscription,
          usage: resetUsage as any,
        });
      }
    } catch (error) {
      console.error('Error resetting monthly usage:', error);
    }
  };

  const upgradeTier = async (newTier: SubscriptionTier) => {
    if (!currentUser) return;

    try {
      const userRef = doc(db, 'users', currentUser.uid);
      const now = serverTimestamp();
      
      // Calculate expiration date (SUBSCRIPTION_DURATION_DAYS from now for paid tiers)
      const SUBSCRIPTION_DURATION_DAYS = 30;
      const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;
      const expiresAt = newTier !== 'free' 
        ? new Date(Date.now() + SUBSCRIPTION_DURATION_DAYS * MILLISECONDS_PER_DAY) 
        : null;

      const updatedSubscription: Partial<UserSubscription> = {
        tier: newTier,
        startDate: now,
        ...(expiresAt && { expiresAt }),
      };

      await updateDoc(userRef, {
        'subscription.tier': newTier,
        'subscription.startDate': now,
        ...(expiresAt && { 'subscription.expiresAt': expiresAt }),
      });

      if (userSubscription) {
        setUserSubscription({
          ...userSubscription,
          ...updatedSubscription,
        } as UserSubscription);
      }
    } catch (error) {
      console.error('Error upgrading tier:', error);
      throw error;
    }
  };

  const refreshSubscription = async () => {
    if (!currentUser) return;
    await initializeSubscription();
  };

  const value: SubscriptionContextType = {
    userSubscription,
    currentTier,
    features,
    loading,
    canUseFeature,
    canSendChatMessage,
    canSubmitProject,
    canSubmitEvent,
    canJoinProject,
    canJoinEvent,
    canCreateReminder,
    incrementChatUsage,
    incrementProjectSubmission,
    incrementEventSubmission,
    incrementProjectJoined,
    incrementEventJoined,
    incrementReminder,
    upgradeTier,
    resetMonthlyUsage,
    refreshSubscription,
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
};
