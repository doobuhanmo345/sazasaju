'use client';

import React, { createContext, useMemo, useContext, useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, query, where, orderBy, limit, onSnapshot, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { useAuthContext } from '@/contexts/useAuthContext';

const LoadingContext = createContext();

export function LoadingProvider({ children }) {
  const [aiResult, setAiResult] = useState();
  const [lastParams, setLastParams] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingType, setLoadingType] = useState(null);
  const [isCachedLoading, setIsCachedLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0); // [NEW] Track analysis time
  const [statusText, setStatusText] = useState(''); // [NEW] Track detailed status (e.g. "Mapping Saju...")
  const [queueDoc, setQueueDoc] = useState(null);
  const [localStatusText, setLocalStatusText] = useState('');
  const { user, userData } = useAuthContext();
  const router = useRouter();
  // Timer for elapsedTime
  const onCancel = () => {
    // Dispatch global event for services to catch
    if (typeof window !== 'undefined') {
      console.log('[LoadingContext] Dispatching cancellation event');
      window.dispatchEvent(new CustomEvent('sazasaju-analysis-cancel'));
    }
    setLoading(false);
  };
  const handleCancelHelper = async () => {


    const docId = queueDoc?.id;
    const uid = user?.uid;

    // [UI] Update local state immediately for instant dismissal
    onCancel();
    setQueueDoc(null);
    setLocalStatusText('');


    try {
      // [Background] Cleanup Firestore resources
      if (docId) {
        await deleteDoc(doc(db, 'analysis_queue', docId));
      }

      // [Global] Release analysis lock
      if (uid) {
        await updateDoc(doc(db, 'users', uid), { isAnalyzing: false });
      }
      console.log('Analysis cancelled');
    } catch (error) {
      console.error('Failed to cancel analysis:', error);
    }
    router.push('/');
  };
  const handleCancel = async () => {
    const confirmCancel = confirm('분석을 취소하시겠습니까?');
    if (!confirmCancel) return;

    const docId = queueDoc?.id;
    const uid = user?.uid;

    // [UI] Update local state immediately for instant dismissal
    onCancel();
    setQueueDoc(null);
    setLocalStatusText('');


    try {
      // [Background] Cleanup Firestore resources
      if (docId) {
        await deleteDoc(doc(db, 'analysis_queue', docId));
      }

      // [Global] Release analysis lock
      if (uid) {
        await updateDoc(doc(db, 'users', uid), { isAnalyzing: false });
      }
      console.log('Analysis cancelled');
    } catch (error) {
      console.error('Failed to cancel analysis:', error);
    }
    router.push('/');
  };

  useEffect(() => {
    let timer;
    if (loading) {
      setElapsedTime(0);
      setStatusText(''); // Reset on start
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

  useEffect(() => {
    if (!user?.uid) {
      setQueueDoc(null);
      return;
    }

    const q = query(
      collection(db, 'analysis_queue'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc'),
      limit(1)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (snapshot.empty) {
        setQueueDoc(null);
        if (userData?.isAnalyzing && !loading) {
          // Stale flag detection
          const startAt = userData.analysisStartedAt?.toMillis ? userData.analysisStartedAt.toMillis() : (userData.analysisStartedAt ? new Date(userData.analysisStartedAt).getTime() : 0);
          const updateAt = userData.updatedAt?.toMillis ? userData.updatedAt.toMillis() : (userData.updatedAt ? new Date(userData.updatedAt).getTime() : 0);
          const lastActive = Math.max(startAt, updateAt);
          const fiveMinsAgo = Date.now() - 5 * 60 * 1000;

          if (lastActive && lastActive < fiveMinsAgo) {
            updateDoc(doc(db, 'users', user.uid), { isAnalyzing: false }).catch(console.error);
          } else {
            setLocalStatusText('분석 준비 중...');
          }
        }
        return;
      }

      const docData = snapshot.docs[0];
      const data = docData.data();

      if (data.status === 'pending' || data.status === 'processing') {
        setQueueDoc({ id: docData.id, ...data });
        if (data.status === 'pending') {
          setLocalStatusText('대기 중...');
        } else if (data.status === 'processing') {
          setLocalStatusText(data.progressMessage || '분석 중...');
        }
      } else {
        setQueueDoc(null);
      }
    }, (error) => {
      setQueueDoc(null);
    });

    return () => unsubscribe();
  }, [user?.uid, userData?.isAnalyzing, userData?.updatedAt, loading]);



  const isBackground = !!queueDoc;
  const isDirect = loading;
  const isStaleFlag = useMemo(() => {
    if (!userData?.isAnalyzing || loading || isBackground) return false;
    const startAt = userData.analysisStartedAt?.toMillis ? userData.analysisStartedAt.toMillis() : (userData.analysisStartedAt ? new Date(userData.analysisStartedAt).getTime() : 0);
    const updateAt = userData.updatedAt?.toMillis ? userData.updatedAt.toMillis() : (userData.updatedAt ? new Date(userData.updatedAt).getTime() : 0);
    const lastActive = Math.max(startAt, updateAt);
    if (!lastActive) return false;
    return Date.now() - lastActive > 5 * 60 * 1000;
  }, [userData, loading, isBackground])
  const isAnalyzing = isBackground || isDirect || (userData?.isAnalyzing && !isStaleFlag);

  const value = {
    handleCancelHelper,
    handleCancel,
    queueDoc,
    setQueueDoc,
    localStatusText,
    setLocalStatusText,
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
    statusText,
    setStatusText,
    isBackground,
    isDirect,
    isAnalyzing,
  };

  return <LoadingContext.Provider value={value}>{children}</LoadingContext.Provider>;
}

export const useLoading = () => useContext(LoadingContext);
