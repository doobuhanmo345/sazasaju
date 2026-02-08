'use client';

import { useState, useEffect, useMemo } from 'react';
import { doc, setDoc, increment } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { UI_TEXT } from '@/data/constants';
import { useAuthContext } from './useAuthContext';
import { useLanguage } from './useLanguageContext';
import { DateService } from '@/utils/dateService';

export const useUsageLimit = () => {
  const [editCount, setEditCount] = useState(0);
  const { user, userData } = useAuthContext();
  const { language } = useLanguage();

  const MAX_EDIT_COUNT = useMemo(() => {
    if (['admin', 'super_admin'].includes(userData?.role)) return 10;
    else return 3;
  }, [user?.uid, userData]);

  const isLocked = editCount >= MAX_EDIT_COUNT;

  // 초기 데이터 동기화
  useEffect(() => {
    if (user && userData) {
      setEditCount(userData.editCount || 0);
    } else {
      setEditCount(0);
    }
  }, [user, userData]);

  const incrementUsage = async (additionalData = {}) => {
    if (!user) return;

    const todayDate = await DateService.getTodayDate();

    const baseData = {
      editCount: increment(1),
      lastEditDate: todayDate,
      dailyUsage: {
        [todayDate]: increment(1),
      },
    };

    await setDoc(doc(db, 'users', user.uid), { ...baseData, ...additionalData }, { merge: true });

    setEditCount((prev) => prev + 1);
    return editCount;
  };

  const checkLimit = () => {
    if (isLocked) {
      alert(UI_TEXT.limitReached[language]);
      return false;
    }
    return true;
  };

  return {
    editCount,
    setEditCount,
    MAX_EDIT_COUNT,
    isLocked,
    incrementUsage,
    checkLimit,
  };
};
