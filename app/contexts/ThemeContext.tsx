import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

type ThemeMode = 'light' | 'dark' | 'auto';
type ColorScheme = 'green' | 'blue' | 'purple' | 'orange';

const colorSchemes = {
  green: { 
    primary: '#7A9B76', 
    secondary: '#A4C3A2',
    background: '#F5F3EE',
  },
  blue: { 
    primary: '#5B8DBE', 
    secondary: '#87CEEB',
    background: '#F0F4F8',
  },
  purple: { 
    primary: '#9B7AB5', 
    secondary: '#C8A4D4',
    background: '#F5F0FA',
  },
  orange: { 
    primary: '#E89B6C', 
    secondary: '#FFB88C',
    background: '#FFF5EC',
  },
};

interface ThemeColors {
  primary: string;
  secondary: string;
  background: string;
  text: string;
  textSecondary: string;
  card: string;
  border: string;
}

interface ThemeContextType {
  themeMode: ThemeMode;
  colorScheme: ColorScheme;
  colors: ThemeColors;
  isDark: boolean;
  setThemeMode: (mode: ThemeMode) => void;
  setColorScheme: (scheme: ColorScheme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeModeState] = useState<ThemeMode>('light');
  const [colorScheme, setColorSchemeState] = useState<ColorScheme>('green');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadThemePreferences();
  }, []);

  const loadThemePreferences = async () => {
    try {
      const savedMode = await AsyncStorage.getItem('themeMode');
      const savedColor = await AsyncStorage.getItem('colorScheme');
      
      if (savedMode) setThemeModeState(savedMode as ThemeMode);
      if (savedColor) setColorSchemeState(savedColor as ColorScheme);
    } catch (error) {
      console.error('Error loading theme:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const setThemeMode = async (mode: ThemeMode) => {
    setThemeModeState(mode);
    try {
      await AsyncStorage.setItem('themeMode', mode);
    } catch (error) {
      console.error('Error saving theme mode:', error);
    }
  };

  const setColorScheme = async (scheme: ColorScheme) => {
    setColorSchemeState(scheme);
    try {
      await AsyncStorage.setItem('colorScheme', scheme);
    } catch (error) {
      console.error('Error saving color scheme:', error);
    }
  };

  // Determine if dark mode should be active
  // DARK THEME DISABLED - Force light mode always
  // const isDark = themeMode === 'dark' || (themeMode === 'auto' && systemColorScheme === 'dark');
  const isDark = false;

  // Get current color scheme
  const schemeColors = colorSchemes[colorScheme];

  // Build theme colors
  const colors: ThemeColors = {
    primary: schemeColors.primary,
    secondary: schemeColors.secondary,
    background: schemeColors.background, // Always use light background
    text: '#1A1A1A', // Always light mode text
    textSecondary: '#666666', // Always light mode secondary text
    card: '#FFFFFF', // Always light card
    border: '#E0E0E0', // Always light border
    // Dark theme colors commented out:
    // background: isDark ? '#1A1A1A' : schemeColors.background,
    // text: isDark ? '#FFFFFF' : '#1A1A1A',
    // textSecondary: isDark ? '#B0B0B0' : '#666666',
    // card: isDark ? '#2A2A2A' : '#FFFFFF',
    // border: isDark ? '#404040' : '#E0E0E0',
  };

  if (isLoading) {
    return null; // or a loading screen
  }

  return (
    <ThemeContext.Provider 
      value={{ 
        themeMode, 
        colorScheme, 
        colors, 
        isDark,
        setThemeMode, 
        setColorScheme 
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};