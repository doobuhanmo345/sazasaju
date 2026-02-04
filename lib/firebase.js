import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signInWithCredential,
  signInWithCustomToken,
  signOut,
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence,
} from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';
import { getDatabase } from 'firebase/database';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { Capacitor, registerPlugin } from '@capacitor/core';
import { GoogleAuth } from '@codetrix-studio/capacitor-google-auth';
import { CapacitorNaverLogin } from '@hanhokim/capacitor-naver-login';

// Capacitor 7+ Compatibility: KakaoLogin manual registration removed (not needed for new plugin)

// Next.js 환경 변수 불러오기
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  databaseURL: 'https://korean-saju-default-rtdb.asia-southeast1.firebasedatabase.app/',
};

// 앱 초기화
const app = initializeApp(firebaseConfig);

// 인증 및 DB 내보내기
export const auth = getAuth(app);
export const db = getFirestore(app);
export const database = getDatabase(app);
export const functions = getFunctions(app, 'asia-northeast3');

// Persistence 설정 (비동기지만 초기화 시점에 수행)
setPersistence(auth, browserLocalPersistence).catch((error) => {
  console.error('Persistence 오류:', error);
});

// 구글 로그인 함수
export async function login() {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });

  try {
    // 1. 네이티브 환경인 경우 (안드로이드/iOS)
    if (Capacitor.isNativePlatform()) {
      console.log('Native environment detected. Using @codetrix-studio/capacitor-google-auth...');
      
      const result = await GoogleAuth.signIn();
      console.log('Google Auth Native Result:', result);

      if (!result?.authentication?.idToken) {
        throw new Error('Google Sign-In failed: No idToken received.');
      }
      
      const credential = GoogleAuthProvider.credential(result.authentication.idToken);
      const userCredential = await signInWithCredential(auth, credential);
      
      console.log('Native login success (Firebase):', userCredential.user.email);
      return userCredential.user;
    }

    // 2. 웹 환경인 경우
    console.log('Web environment detected. Using signInWithPopup...');
    const result = await signInWithPopup(auth, provider);
    console.log('Web login successful:', result.user.email);
    return result.user;
  } catch (error) {
    console.error('Login Error:', error);
    if (error.code === 'auth/popup-closed-by-user') {
      console.log('User closed the popup.');
    } else {
      alert('로그인 에러: ' + error.message);
    }
    throw error;
  }
}

// 카카오 로그인
export async function loginWithKakao() {
  try {
    let accessToken = null;

    if (Capacitor.isNativePlatform()) {
      console.log('Native Kakao login started...');
      // Dynamic import to avoid web build errors
      const { KakaoLogin } = await import('capacitor-kakao-plugin');
      
      const result = await KakaoLogin.kakaoLogin();
      console.log('Kakao Login Result:', result);
      
      // Check result structure (plugin dependent, usually result.accessToken or result.value)
      accessToken = result.accessToken || result.value;
      
      if (!accessToken) {
        throw new Error('Kakao login failed: No access token received.');
      }
    } else {
      // Web Version using Kakao JS SDK v1 (Popup flow) -> Existing logic remains same
      console.log('Web Kakao login started (v1 SDK)...');
      if (!window.Kakao || !window.Kakao.isInitialized()) {
        throw new Error('Kakao SDK not initialized');
      }
      
      accessToken = await new Promise((resolve, reject) => {
        window.Kakao.Auth.login({
          success: (authObj) => {
            console.log('Kakao Web Login Success:', authObj);
            resolve(authObj.access_token);
          },
          fail: (error) => {
            console.error('Kakao Web Login Fail:', error);
            reject(error);
          },
        });
      });
    }

    // Exchange Kakao Access Token for Firebase Custom Token
    const verifyKakaoToken = httpsCallable(functions, 'verifyKakaoToken');
    const { data } = await verifyKakaoToken({ accessToken });
    
    if (data.customToken) {
      const userCredential = await signInWithCustomToken(auth, data.customToken);
      return userCredential.user;
    } else {
      throw new Error('Failed to get custom token from server');
    }
  } catch (error) {
    console.error('Kakao Login Error:', error);
    if (error.message !== 'User closed the window') {
      alert('카카오 로그인 에러: ' + error.message);
    }
    throw error;
  }
}

// 네이버 로그인
export async function loginWithNaver() {
  try {
    let accessToken = null;

    if (Capacitor.isNativePlatform()) {
      console.log('Native Naver login started...');
      const result = await new Promise(async (resolve, reject) => {
        let handler;
        try {
          handler = await CapacitorNaverLogin.addListener('callback', (data) => {
            if (handler) handler.remove();
            if (data.success && data.access_token) {
              resolve(data);
            } else {
              reject(new Error(data.error || 'Naver login failed'));
            }
          });
          await CapacitorNaverLogin.prompt();
        } catch (err) {
          if (handler) handler.remove();
          reject(err);
        }
      });
      accessToken = result.access_token;
    } else {
      // Web Version using Naver Login JS SDK
      console.log('Web Naver login started...');
      // Naver Web Login typically uses a redirect. 
      // This is a stub for now as it requires a pre-configured button or custom flow.
      alert('네이버 웹 로그인은 곧 업데이트 예정입니다. (현재 앱 지원 중)');
      return null;
    }

    // Exchange Naver Access Token for Firebase Custom Token
    const verifyNaverToken = httpsCallable(functions, 'verifyNaverToken');
    const { data } = await verifyNaverToken({ accessToken });
    
    if (data.customToken) {
      const userCredential = await signInWithCustomToken(auth, data.customToken);
      return userCredential.user;
    } else {
      throw new Error('Failed to get custom token from server');
    }
  } catch (error) {
    console.error('Naver Login Error:', error);
    alert('네이버 로그인 에러: ' + error.message);
    throw error;
  }
}

export { getRedirectResult };

// 로그아웃 함수
export const logout = () => signOut(auth).catch(console.error);

// 유저 감지 함수
export const onUserStateChange = (callback) => {
  onAuthStateChanged(auth, (user) => {
    callback(user);
  });
};

// DB 헬퍼 함수들
export const getUserData = async (uid) => {
  const docSnap = await getDoc(doc(db, 'users', uid));
  return docSnap.exists() ? docSnap.data() : null;
};

export const saveUserData = async (uid, data) => {
  await setDoc(doc(db, 'users', uid), data, { merge: true });
};
