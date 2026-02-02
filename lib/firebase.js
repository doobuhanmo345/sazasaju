import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence,
} from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';
import { getDatabase } from 'firebase/database';
import { getFunctions } from 'firebase/functions';

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
  try {
    // 구글 프로바이더 설정
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({
      prompt: 'select_account',
    });

    // 팝업 실행
    const result = await signInWithPopup(auth, provider);

    console.log('로그인 성공:', result.user);
    return result.user;
  } catch (error) {
    console.error('로그인 상세 에러:', error);

    if (error.code === 'auth/popup-closed-by-user') {
      console.log('사용자가 팝업을 닫았습니다.');
    } else if (error.message?.includes('missing initial state')) {
      alert(
        '브라우저 보안 설정으로 인해 로그인이 차단되었습니다. 다른 브라우저(크롬 등)를 사용하거나 사파리 설정을 확인해주세요.',
      );
    }

    throw error;
  }
}

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
