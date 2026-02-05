const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { onSchedule } = require("firebase-functions/v2/scheduler");
const { setGlobalOptions } = require("firebase-functions/v2");
const { defineSecret } = require('firebase-functions/params');
const admin = require('firebase-admin');
const axios = require('axios');
const { GoogleGenerativeAI } = require('@google/generative-ai');

admin.initializeApp();

// 보안을 위해 Secret Manager에 저장된 API 키를 가져옵니다.
const GEMINI_API_KEY = defineSecret('NEW_GEMINI_KEY');

// 모든 2세대(v2) 함수의 기본 리전을 서울(asia-northeast3)로 설정
setGlobalOptions({ region: "asia-northeast3" });

/**
 * 기존 saju-app에서 사용하던 Gemini 분석 함수입니다.
 */
exports.fetchGeminiAnalysis = onCall(
  {
    secrets: [GEMINI_API_KEY],
    timeoutSeconds: 300,
    memory: '1024MiB',
  },
  async (request) => {
    try {
      const { prompt } = request.data;
      if (!prompt) {
        throw new HttpsError('invalid-argument', '프롬프트 내용이 없습니다.');
      }

      const genAI = new GoogleGenerativeAI(GEMINI_API_KEY.value());
      const model = genAI.getGenerativeModel({
        model: 'gemini-2.5-flash', // 기존 saju-app 프로젝트 설정 유지 (필요시 gemini-2.0-flash 등으로 변경 가능)
        generationConfig: {
          responseMimeType: 'application/json',
        },
      });

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      return { text };
    } catch (error) {
      console.error('Gemini 서버 에러 상세:', error);
      throw new HttpsError('internal', error.message || 'AI 분석 중 알 수 없는 오류가 발생했습니다.');
    }
  }
);

/**
 * 5분마다 실행되어 Gemini 인스턴스를 따뜻하게 유지하는 하트비트 함수입니다. (웜업 방식)
 */
exports.warmupGemini = onSchedule(
  {
    schedule: "every 5 minutes",
    secrets: [GEMINI_API_KEY],
    region: "asia-northeast3",
  },
  async (event) => {
    try {
      const genAI = new GoogleGenerativeAI(GEMINI_API_KEY.value());
      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
      // 아주 짧은 프롬프트를 보내 인스턴스를 활성화 상태로 유지합니다.
      await model.generateContent("ping");
      console.log('Gemini Warm-up successful');
    } catch (error) {
      console.error('Gemini Warm-up failed:', error);
    }
  }
);

/**
 * Naver Access Token을 Firebase Custom Token으로 교환합니다.
 */
exports.verifyNaverToken = onCall(async (request) => {
  const { accessToken } = request.data;

  if (!accessToken) {
    throw new HttpsError('invalid-argument', 'Missing accessToken');
  }

  try {
    const naverProfileRes = await axios.get('https://openapi.naver.com/v1/nid/me', {
      headers: { Authorization: `Bearer ${accessToken}` }
    });

    const profile = naverProfileRes.data.response;
    if (!profile || !profile.id) {
      throw new Error('Invalid Naver profile data');
    }

    const uid = `naver:${profile.id}`;
    const email = profile.email || `${profile.id}@naver.user`;
    const displayName = profile.name || profile.nickname || 'Naver User';
    const photoURL = profile.profile_image || '';

    const customToken = await admin.auth().createCustomToken(uid, {
      provider: 'naver.com'
    });

    return { customToken, email, displayName, photoURL };
  } catch (error) {
    console.error('Naver verification error:', error);
    throw new HttpsError('internal', 'Authentication failed');
  }
});

/**
 * Kakao Access Token을 Firebase Custom Token으로 교환합니다.
 */
exports.verifyKakaoToken = onCall(async (request) => {
  const { accessToken } = request.data;

  if (!accessToken) {
    throw new HttpsError('invalid-argument', 'Missing accessToken');
  }

  try {
    const kakaoProfileRes = await axios.get('https://kapi.kakao.com/v2/user/me', {
      headers: { Authorization: `Bearer ${accessToken}` }
    });

    const profile = kakaoProfileRes.data;
    if (!profile || !profile.id) {
      throw new Error('Invalid Kakao profile data');
    }

    const uid = `kakao:${profile.id}`;
    const kakaoAccount = profile.kakao_account || {};
    const email = kakaoAccount.email || `${profile.id}@kakao.user`;
    const displayName = kakaoAccount.profile?.nickname || 'Kakao User';
    const photoURL = kakaoAccount.profile?.profile_image_url || '';

    const customToken = await admin.auth().createCustomToken(uid, {
      provider: 'kakao.com'
    });

    return { customToken, email, displayName, photoURL };
  } catch (error) {
    console.error('Kakao verification error:', error.response?.data || error.message);
    throw new HttpsError('internal', 'Kakao authentication failed');
  }
});
