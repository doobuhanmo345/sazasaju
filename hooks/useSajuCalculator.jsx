'use client';

import { useState, useEffect } from 'react';
import { calculateSaju, calculateSajuLunar } from '@/lib/sajuCalculator';
import { useLanguage } from '@/contexts/useLanguageContext';

/**
 * 날짜 입력이 변경될 때마다 사주 팔자를 계산하여 상태를 관리하는 커스텀 훅입니다.
 * @param {string} inputDate - 날짜 문자열 (YYYY-MM-DDTHH:MM 형식)
 * @param {boolean} isTimeUnknown - 시간이 미상인지 여부
 * @returns {{saju: object, setSaju: function, sajul: object, setSajul: function}} 계산된 사주 데이터와 세터 함수
 */
export function useSajuCalculator(inputDate, isTimeUnknown) {
  const [saju, setSaju] = useState({});
  const [sajul, setSajul] = useState({});
  const { language } = useLanguage();

  useEffect(() => {
    if (!inputDate) {
      setSaju({});
      setSajul({});
      return;
    }

    const originalDate = new Date(inputDate);
    if (isNaN(originalDate.getTime())) {
      setSaju({});
      setSajul({});
      return;
    }

    const year = originalDate.getFullYear();
    if (isNaN(year) || year < 1000 || year > 3000) {
      setSaju({});
      setSajul({});
      return;
    }

    try {
      let processingDate = new Date(originalDate);

      // 한국어 설정이고, 시간을 아는 경우에만 30분을 뺍니다.
      if (language === 'ko' && !isTimeUnknown) {
        processingDate.setMinutes(processingDate.getMinutes() - 30);
      }

      const calculatedSaju = calculateSaju(processingDate, isTimeUnknown);
      const calculatedSajuL = calculateSajuLunar(processingDate, isTimeUnknown);

      if (calculatedSaju) {
        setSaju(calculatedSaju);
      } else {
        setSaju({});
      }
      if (calculatedSajuL) {
        setSajul(calculatedSajuL);
      } else {
        setSajul({});
      }
    } catch (error) {
      console.warn('사주 계산 중 오류 발생:', error);
      setSaju({});
      setSajul({});
    }
  }, [inputDate, isTimeUnknown, language]);

  return { saju, setSaju, sajul, setSajul };
}
