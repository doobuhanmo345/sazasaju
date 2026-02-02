'use client';

import { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export function ThemeContextProvider({ children }) {
  // Force light theme
  const [theme, setTheme] = useState('light');
  const [sysTheme, setSysTheme] = useState('light');

  useEffect(() => {
    // Remove dark class on mount
    document.documentElement.classList.remove('dark');
    localStorage.theme = 'light';
  }, []);

  const forceLightSetTheme = () => {
    setTheme('light');
    localStorage.theme = 'light';
  };

  return (
    <ThemeContext.Provider value={{ theme: 'light', setTheme: forceLightSetTheme, sysTheme: 'light', setSysTheme: forceLightSetTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
