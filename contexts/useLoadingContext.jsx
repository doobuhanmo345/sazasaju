'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

const LoadingContext = createContext();

export function LoadingProvider({ children }) {
  const [aiResult, setAiResult] = useState();
  const [lastParams, setLastParams] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingType, setLoadingType] = useState(null);
  const [isCachedLoading, setIsCachedLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0); // [NEW] Track analysis time

  // Timer for elapsedTime
  useEffect(() => {
    let timer;
    if (loading) {
      setElapsedTime(0);
      timer = setInterval(() => {
        setElapsedTime((prev) => prev + 1);
      }, 1000);
    } else {
      clearInterval(timer);
    }
    return () => clearInterval(timer);
  }, [loading]);

  // Auto-increment progress when loading
  useEffect(() => {
    let interval;
    if (loading) {
      setProgress(0);
      interval = setInterval(
        () => {
          setProgress((prev) => {
            if (prev >= 99) return 99; // Wait at 99% until API response
            return prev + (isCachedLoading ? 25 : 1);
          });
        },
        isCachedLoading ? 50 : 232,
      );
    } else {
      setProgress(100); // Immediately set to 100% when loading stops
    }
    return () => clearInterval(interval);
  }, [loading, isCachedLoading]);

  const onCancel = () => {
    // Dispatch global event for services to catch
    if (typeof window !== 'undefined') {
      console.log('[LoadingContext] Dispatching cancellation event');
      window.dispatchEvent(new CustomEvent('sazasaju-analysis-cancel'));
    }
    setLoading(false);
  };

  const value = {
    loading,
    setLoading,
    loadingType,
    setLoadingType,
    isCachedLoading,
    setIsCachedLoading,
    progress,
    setProgress,
    aiResult,
    setAiResult,
    lastParams,
    setLastParams,
    elapsedTime,
    onCancel,
  };

  return <LoadingContext.Provider value={value}>{children}</LoadingContext.Provider>;
}

export const useLoading = () => useContext(LoadingContext);
