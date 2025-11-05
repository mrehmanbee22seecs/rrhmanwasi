import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithRedirect,
  getRedirectResult,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail,
  sendEmailVerification,
  updatePassword as firebaseUpdatePassword
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { auth, googleProvider, facebookProvider, db } from '../config/firebase';
import { initializeUserProfile, logActivity as logUserActivity } from '../utils/firebaseInit';
import { sendWelcomeEmail } from '../services/mailerSendEmailService';

interface UserData {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  phoneNumber: string | null;
  isAdmin: boolean;
  isGuest: boolean;
  createdAt: any;
  lastLogin: any;
  activityLog: ActivityLog[];
  preferences?: {
    theme?: string;
    interests?: string[];
    onboardingCompleted?: boolean;
    completedAt?: any;
    lastUpdated?: any;
  };
}

interface ActivityLog {
  id: string;
  action: string;
  page: string;
  timestamp: any;
  details?: any;
}

interface AuthContextType {
  currentUser: User | null;
  userData: UserData | null;
  isGuest: boolean;
  isAdmin: boolean;
  loading: boolean;
  signup: (email: string, password: string, displayName: string, phone?: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  loginWithFacebook: () => Promise<void>;
  logout: () => Promise<void>;
  continueAsGuest: () => void;
  logActivity: (action: string, page: string, details?: any) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (newPassword: string) => Promise<void>;
  resendEmailVerification: () => Promise<void>;
  refreshUserData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isGuest, setIsGuest] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  // Admin credentials
  const ADMIN_EMAIL = 'admin@wasilah.org';
  const ADMIN_PASSWORD = 'WasilahAdmin2024!';

  const createUserDocument = async (user: User, additionalData: any = {}) => {
    try {
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        // New user - create document
        const { displayName, email, photoURL } = user;
        const isAdminUser = email === ADMIN_EMAIL;
        
        const userData: UserData = {
          uid: user.uid,
          displayName,
          email,
          photoURL,
          phoneNumber: additionalData.phoneNumber || null,
          isAdmin: isAdminUser,
          isGuest: false,
          createdAt: serverTimestamp(),
          lastLogin: serverTimestamp(),
          activityLog: [],
          ...additionalData,
          // Ensure preferences with defaults, merge if additionalData has preferences
          preferences: {
            onboardingCompleted: false,
            ...additionalData.preferences
          }
        };

        await setDoc(userRef, userData);
        
        // Fetch the document again to get server-resolved timestamps
        const newUserSnap = await getDoc(userRef);
        return newUserSnap.data() as UserData;
      } else {
        // Existing user - update last login
        await updateDoc(userRef, {
          lastLogin: serverTimestamp()
        });
        
        // Fetch the updated document
        const updatedUserSnap = await getDoc(userRef);
        return updatedUserSnap.data() as UserData;
      }
    } catch (error) {
      console.error('Error creating/updating user document:', error);
      throw error;
    }
  };

  const signup = async (email: string, password: string, displayName: string, phone?: string) => {
    const { user } = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(user, { displayName });

    // Send email verification with action code settings for proper redirection
    const actionCodeSettings = {
      url: window.location.origin + '/dashboard',
      handleCodeInApp: true
    } as const;
    await sendEmailVerification(user, actionCodeSettings);

    await createUserDocument(user, { phoneNumber: phone });
    
    // Send welcome email via Resend
    try {
      await sendWelcomeEmail({
        email: email,
        name: displayName
      });
    } catch (error) {
      console.error('Failed to send welcome email:', error);
      // Don't fail the signup if email fails
    }
  };

  const login = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const loginWithGoogle = async () => {
    // Use redirect instead of popup to avoid COOP issues
    await signInWithRedirect(auth, googleProvider);
    // User will be handled by getRedirectResult in useEffect
  };

  const loginWithFacebook = async () => {
    // Use redirect instead of popup to avoid COOP issues
    await signInWithRedirect(auth, facebookProvider);
    // User will be handled by getRedirectResult in useEffect
  };

  const logout = async () => {
    // Don't manually set states - let the auth listener handle it
    // This prevents race conditions and ensures consistency
    await signOut(auth);
    // Reset guest mode after signout completes
    setIsGuest(false);
  };

  const continueAsGuest = () => {
    setIsGuest(true);
    setLoading(false);
  };

  const logActivity = async (action: string, page: string, details?: any) => {
    if (currentUser && userData && !userData.isGuest) {
      const now = new Date();
      const activityLog: ActivityLog = {
        id: Date.now().toString(),
        action,
        page,
        timestamp: now,
        details
      };

      const userRef = doc(db, 'users', currentUser.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const currentData = userSnap.data() as UserData;
        const updatedActivityLog = [...(currentData.activityLog || []), activityLog];

        await updateDoc(userRef, {
          activityLog: updatedActivityLog
        });

        setUserData(prev => prev ? { ...prev, activityLog: updatedActivityLog } : null);
      }
    }
  };

  const resetPassword = async (email: string) => {
    const actionCodeSettings = {
      url: window.location.origin + '/dashboard',
      handleCodeInApp: true
    } as const;
    await sendPasswordResetEmail(auth, email, actionCodeSettings);
  };

  const updatePassword = async (newPassword: string) => {
    if (!currentUser) throw new Error('No user logged in');
    await firebaseUpdatePassword(currentUser, newPassword);
  };

  const resendEmailVerification = async () => {
    if (!currentUser) throw new Error('No user logged in');
    const actionCodeSettings = {
      url: window.location.origin + '/dashboard',
      handleCodeInApp: true
    } as const;
    await sendEmailVerification(currentUser, actionCodeSettings);
  };

  const refreshUserData = async () => {
    if (!currentUser) {
      console.warn('Cannot refresh user data: no current user');
      return;
    }
    
    try {
      const userRef = doc(db, 'users', currentUser.uid);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        const latestData = userSnap.data() as UserData;
        setUserData(latestData);
        setIsAdmin(latestData.isAdmin);
        console.log('User data refreshed successfully');
      } else {
        console.error('User document does not exist in Firestore');
      }
    } catch (error) {
      console.error('Error refreshing user data:', error);
      throw error;
    }
  };

  useEffect(() => {
    let unsubscribe: (() => void) | null = null;

    // Handle redirect result and set up auth listener
    const initAuth = async () => {
      try {
        // Check for redirect result first (from Google/Facebook login)
        const result = await getRedirectResult(auth);
        if (result && result.user) {
          // User signed in via redirect - create/update their document
          console.log('User authenticated via redirect');
          // Don't set state here - let onAuthStateChanged handle it
          // This prevents double-setting and ensures consistency
        }
      } catch (error) {
        console.error('Error handling redirect result:', error);
        // Continue to set up auth listener even if redirect fails
      }

      // Set up auth state listener (will catch redirect auth automatically)
      unsubscribe = onAuthStateChanged(auth, async (user) => {
        try {
          if (user) {
            // User is authenticated, fetch/create their data
            const userData = await createUserDocument(user);
            setCurrentUser(user);
            setUserData(userData);
            setIsAdmin(userData.isAdmin);
            setIsGuest(false);
            setLoading(false);
          } else {
            // No user is logged in
            setCurrentUser(null);
            setUserData(null);
            setIsAdmin(false);
            // Set loading to false regardless of guest mode
            // Guest mode is handled separately by continueAsGuest()
            setLoading(false);
          }
        } catch (error) {
          console.error('Error in auth state change:', error);
          // Even on error, stop loading to prevent infinite spinner
          setLoading(false);
          setCurrentUser(null);
          setUserData(null);
          setIsAdmin(false);
        }
      });
    };

    initAuth();
    
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
    // Remove isGuest dependency to prevent listener recreation
    // Guest mode is independent of auth state changes
  }, []);

  const value: AuthContextType = {
    currentUser,
    userData,
    isGuest,
    isAdmin,
    loading,
    signup,
    login,
    loginWithGoogle,
    loginWithFacebook,
    logout,
    continueAsGuest,
    logActivity,
    resetPassword,
    updatePassword,
    resendEmailVerification,
    refreshUserData
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};