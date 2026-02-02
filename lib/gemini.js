// lib/gemini.js
import { httpsCallable } from 'firebase/functions';
import { functions } from '@/lib/firebase';

/**
 * Gemini AI 분석 결과를 가져오는 함수 (Firebase Functions 호출)
 * @param {string} prompt - AI에게 전달할 프롬프트
 * @returns {Promise<string>} AI 응답 텍스트
 */
export const fetchGeminiAnalysis = async (prompt) => {
  const maxRetries = 2;
  let lastError;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const geminiFunction = httpsCallable(functions, 'fetchGeminiAnalysis', {
        timeout: 300000, // 5분
      });
      const result = await geminiFunction({ prompt });
      return result.data.text;
    } catch (error) {
      lastError = error;
      console.error(`Gemini API 호출 시도 ${attempt + 1} 실패:`, error);
      
      // 마지막 시도가 아니면 1초 대기 후 재시도
      if (attempt < maxRetries) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        continue;
      }
    }
  }

  throw new Error(lastError?.message || '분석 호출 중 오류가 발생했습니다. (3회 시도 모두 실패)');
};
