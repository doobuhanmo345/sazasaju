'use client';

import { useState, useEffect } from 'react';
import { DateService } from '@/utils/dateService';

/**
 * 다음날 자정까지 남은 시간을 계산하고 1초마다 업데이트하는 커스텀 훅입니다.
 * @param {number} editCount - 타이머 작동 여부를 결정하는 조건 값 (0보다 커야 작동)
 * @returns {string} 남은 시간 문자열 (예: '05:03:01') 또는 빈 문자열
 */
export function useTimer(editCount) {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    // 1. 크레딧이 0이면 작동 안 함
    if (editCount <= 0) {
      setTimeLeft('');
      return;
    }

    // 2. 서버에서 시간을 새로 받아와서 타이머를 갱신하는 핵심 함수
    const updateFromServer = async () => {
      const serverTs = await DateService.getTime();

      const now = new Date(serverTs);
      const midnight = new Date(now);
      midnight.setHours(24, 0, 0, 0); // 서버 기준 자정

      const diff = midnight.getTime() - serverTs;

      if (diff <= 0) {
        setTimeLeft('00:00:00');
        return;
      }

      const h = Math.floor(diff / (1000 * 60 * 60))
        .toString()
        .padStart(2, '0');
      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
        .toString()
        .padStart(2, '0');
      const s = Math.floor((diff % (1000 * 60)) / 1000)
        .toString()
        .padStart(2, '0');

      setTimeLeft(`${h}:${m}:${s}`);
    };

    // 처음 한 번 실행
    updateFromServer();

    // 1초마다 무조건 서버 API 호출해서 시간 동기화
    const interval = setInterval(updateFromServer, 1000);

    return () => clearInterval(interval);
  }, [editCount]);

  return timeLeft;
}
