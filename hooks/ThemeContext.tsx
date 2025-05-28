import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react';
import {IUser} from '../lib/interfaces';

// Define the shape of the context
interface ThemeContextType {
  isDark: boolean;
  toggleTheme: (mode?: boolean) => Promise<void>;
  user: IUser | null;
  setUser: React.Dispatch<React.SetStateAction<IUser | null>>;
}

// Create the context with the defined type
export const ThemeContext = createContext<ThemeContextType | undefined>(
  undefined,
);

// Props for the ThemeProvider component
interface ThemeProviderProps {
  children: ReactNode;
}

// ThemeProvider component
export const ThemeProvider: React.FC<ThemeProviderProps> = ({children}) => {
  const [isDark, setIsDark] = useState(false);
  const [user, setUser] = useState<IUser | null>(null);

  useEffect(() => {
    const loadTheme = async () => {
      const saved = await AsyncStorage.getItem('darkMode');
      setIsDark(saved === 'true');
    };
    loadTheme();
  }, []);

  const toggleTheme = async (mode?: boolean) => {
    const newMode = mode ?? !isDark; // Default to toggling if mode is not provided
    setIsDark(newMode);
    await AsyncStorage.setItem('darkMode', newMode.toString());
  };

  return (
    <ThemeContext.Provider value={{isDark, toggleTheme, user, setUser}}>
      {children}
    </ThemeContext.Provider>
  );
};
export const useHook = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useThemeContext must be used within a ThemeProvider');
  }
  return context;
};
