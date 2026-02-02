'use client';

import { createContext, useContext } from 'react';
import { useLanguageLogic } from '../hooks/useLanguage';

const LanguageContext = createContext();

export function LanguageContextProvider({ children }) {
  const [language, setLanguage] = useLanguageLogic();

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageContextProvider');
  }
  return context;
}
