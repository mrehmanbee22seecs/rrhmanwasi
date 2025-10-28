import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from './AuthContext';

export interface Theme {
  id: string;
  name: string;
  description: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
    textLight: string;
  };
  preview: string;
  // When true, we apply the global `.theme-dark` class for scoped overrides
  isDark?: boolean;
}

export const themes: Theme[] = [
  {
    id: 'wasillah-classic',
    name: 'Wasillah Classic',
    description: 'Premium light theme with warm beige and golden tones',
    colors: {
      // Vibrant brand primary (pink-red accent)
      primary: '#FF6B9D',
      // Warm golden beige for surfaces
      secondary: '#D4AF37',
      // Electric cyan accent
      accent: '#00D9FF',
      // Soft cream background for readability
      background: '#FAF6F1',
      // Warm beige for cards/surfaces
      surface: '#F5E6D3',
      // Dark text for light backgrounds
      text: '#1F2937',
      // Medium gray text
      textLight: '#6B7280'
    },
    preview: 'linear-gradient(135deg, #FAF6F1, #F5E6D3, #D4AF37)',
    isDark: false
  },
  {
    id: 'wasillah-jet-black',
    name: 'Wasillah Jet Black',
    description: 'Premium dark theme with deep black and vibrant accents',
    colors: {
      // Vibrant gradient primary (pink accent)
      primary: '#FF6B9D',
      // Deep jet black background
      secondary: '#000000',
      // Bright accent (electric cyan)
      accent: '#00D9FF',
      // Rich pure black background
      background: '#000000',
      // Dark charcoal surface for subtle contrast
      surface: '#1A1A1A',
      // White text for dark backgrounds
      text: '#FFFFFF',
      // Muted light text
      textLight: '#B4B4C8'
    },
    preview: 'linear-gradient(135deg, #000000, #FF6B9D, #00D9FF)',
    isDark: true
  }
];

interface ThemeContextType {
  currentTheme: Theme;
  setTheme: (themeId: string) => void;
  themes: Theme[];
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const defaultTheme = themes.find(t => t.id === 'wasillah-classic') || themes[0];
  const [currentTheme, setCurrentTheme] = useState<Theme>(defaultTheme);
  const { currentUser, userData } = useAuth();

  useEffect(() => {
    // Load user's saved theme
    if (userData?.preferences?.theme) {
      const savedTheme = themes.find(t => t.id === userData.preferences.theme);
      if (savedTheme) {
        setCurrentTheme(savedTheme);
        applyTheme(savedTheme);
      }
    }
  }, [userData]);

  // Apply the default theme on first mount as well
  useEffect(() => {
    applyTheme(currentTheme);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const applyTheme = (theme: Theme) => {
    const root = document.documentElement;
    root.style.setProperty('--color-primary', theme.colors.primary);
    root.style.setProperty('--color-secondary', theme.colors.secondary);
    root.style.setProperty('--color-accent', theme.colors.accent);
    root.style.setProperty('--color-background', theme.colors.background);
    root.style.setProperty('--color-surface', theme.colors.surface);
    root.style.setProperty('--color-text', theme.colors.text);
    root.style.setProperty('--color-text-light', theme.colors.textLight);

    // Toggle dark class for scoped CSS overrides
    if (theme.isDark) {
      root.classList.add('theme-dark');
    } else {
      root.classList.remove('theme-dark');
    }
  };

  const setTheme = async (themeId: string) => {
    const theme = themes.find(t => t.id === themeId);
    if (!theme) return;

    setCurrentTheme(theme);
    applyTheme(theme);

    // Save to user preferences
    if (currentUser && userData && !userData.isGuest) {
      try {
        const userRef = doc(db, 'users', currentUser.uid);
        await updateDoc(userRef, {
          'preferences.theme': themeId,
          'preferences.lastUpdated': new Date()
        });
      } catch (error) {
        console.error('Error saving theme preference:', error);
      }
    }
  };

  const value: ThemeContextType = {
    currentTheme,
    setTheme,
    themes
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};