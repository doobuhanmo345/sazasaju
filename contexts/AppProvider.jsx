'use client';

import { LanguageContextProvider } from './useLanguageContext';
import { ThemeContextProvider } from './useThemeContext';
import { AuthContextProvider } from './useAuthContext';
import { AnalysisModeProvider } from './AnalysisModeContext';

export function AppProvider({ children }) {
  return (
    <LanguageContextProvider>
      <ThemeContextProvider>
        <AuthContextProvider>
          <AnalysisModeProvider>
            {children}
          </AnalysisModeProvider>
        </AuthContextProvider>
      </ThemeContextProvider>
    </LanguageContextProvider>
  );
}
