'use client';

import { LanguageContextProvider } from './useLanguageContext';
import { ThemeContextProvider } from './useThemeContext';
import { AuthContextProvider } from './useAuthContext';

export function AppProvider({ children }) {
  return (
    <LanguageContextProvider>
      <ThemeContextProvider>
        <AuthContextProvider>
          {children}
        </AuthContextProvider>
      </ThemeContextProvider>
    </LanguageContextProvider>
  );
}
