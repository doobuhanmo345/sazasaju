'use client';

import { useState, useEffect } from 'react';

/**
 * localStorage와 동기화되는 React 상태를 관리하는 커스텀 훅.
 *
 * @param {string} key - localStorage에 저장할 항목의 키 (Key).
 * @param {any} initialValue - 키에 해당하는 값이 없을 경우 사용할 초기 값.
 * @returns {[any, (value: any) => void]} - [현재 상태 값, 상태 업데이트 함수]
 */
function useLocalStorage(key, initialValue) {
  // 1. 초기 상태 설정
  const [value, setValue] = useState(() => {
    try {
      const storedValue = localStorage.getItem(key);
      return storedValue ? JSON.parse(storedValue) : initialValue;
    } catch (error) {
      console.error('Error retrieving data from localStorage:', error);
      return initialValue;
    }
  });

  // 2. 상태 변경 시 localStorage에 저장
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Error saving data to localStorage:', error);
    }
  }, [key, value]);

  return [value, setValue];
}

export default useLocalStorage;
