'use client';

import { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { doc, onSnapshot, updateDoc, setDoc, getDoc } from 'firebase/firestore';
import { login, logout, onUserStateChange, db, auth, getRedirectResult, loginWithKakao, loginWithNaver } from '@/lib/firebase';
import { useLanguage } from './useLanguageContext';
import { getRomanizedIlju } from '@/data/sajuInt';
import { calculateSaju } from '@/lib/sajuCalculator';
import { specialPaths } from '@/lib/constants';
import { ProfileService } from '@/lib/profileService';

const AuthContext = createContext();

// 헬퍼 함수: 사주 데이터 비교 (컴포넌트 외부로 빼서 성능 최적화)
const checkSajuMatch = (prevSaju, targetSaju) => {
  if (!prevSaju || !targetSaju) return false;
  const sajuKeys = ['sky0', 'grd0', 'sky1', 'grd1', 'sky2', 'grd2', 'sky3', 'grd3'];
  return sajuKeys.every((k) => prevSaju[k] === targetSaju[k]);
};

export function AuthContextProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null); // Main User Data (Firebase sync)
  const [loadingUser, setLoadingUser] = useState(true);

  // Multi-Profile State
  const [savedProfiles, setSavedProfiles] = useState([]);
  const [selectedProfile, setSelectedProfile] = useState(null); // Currently Active Profile (User or Friend)

  const { language } = useLanguage();
  const pathname = typeof window !== 'undefined' ? window.location.pathname.trim() : '';

  // userData 로드 시 selectedProfile 초기화 (기존 유저는 본인이 기본값)
  useEffect(() => {
    if (!userData) return;

    // 1. 최초 초기화: 선택된 프로필이 없고 userData가 처음 로드되었을 때
    if (!selectedProfile) {
      // 로컬 스토리지에서 복원하려는 시도가 이미 있었는지 확인 (savedProfiles 로드 로직과 연결)
      setSelectedProfile(userData);
      return;
    }

    // 2. 데이터 동기화: 현재 선택된 프로필이 '본인(userData)'인 경우, 최신 userData 반영
    const isOwnerSelected = selectedProfile && (selectedProfile.uid === userData.uid && !selectedProfile.id);

    if (isOwnerSelected) {
      // 무한 루프 방지를 위해 실제 값이 다를 때만 업데이트
      if (JSON.stringify(selectedProfile) !== JSON.stringify(userData)) {
        setSelectedProfile(userData);
      }
    }
  }, [userData, selectedProfile]);

  // 저장된 프로필 목록 불러오기
  useEffect(() => {
    if (user?.uid) {
      ProfileService.getSavedProfiles(user.uid).then(profiles => {
        setSavedProfiles(profiles);

        // [NEW] 이전에 선택된 프로필 복원
        const lastSelectedId = localStorage.getItem('lastSelectedProfileId');
        if (lastSelectedId && profiles.length > 0) {
          const restored = profiles.find(p => p.id === lastSelectedId);
          if (restored) {
            setSelectedProfile(restored);
          }
        }
      });
    } else {
      setSavedProfiles([]);
    }
  }, [user]);

  // 프로필 선택 함수 (Firebase 연동)
  const selectProfile = async (profile) => {
    if (!user) return;
    const userDocRef = doc(db, 'users', user.uid);
    try {
      // profile이 없거나, profile이 본인(uid 일치)인 경우 -> 본인 선택으로 처리
      const isSelf = !profile || (profile.uid === user.uid);

      if (isSelf) {
        setSelectedProfile(userData); // UI 즉시 반영
        await updateDoc(userDocRef, { currentProfileId: null }); // DB 저장 (본인)
        localStorage.removeItem('lastSelectedProfileId');
      } else {
        setSelectedProfile(profile); // UI 즉시 반영
        await updateDoc(userDocRef, { currentProfileId: profile.id }); // DB 저장
        localStorage.setItem('lastSelectedProfileId', profile.id);
      }
    } catch (e) {
      console.error("Failed to save selected profile:", e);
    }
  };

  // [NEW] Firestore 및 localStorage 기반의 프로필 복원 로직 통합
  useEffect(() => {
    if (!userData || !savedProfiles || savedProfiles.length === 0) return;

    const dbProfileId = userData.currentProfileId;
    const localProfileId = localStorage.getItem('lastSelectedProfileId');
    const targetId = dbProfileId !== undefined ? dbProfileId : localProfileId;

    if (targetId) {
      const found = savedProfiles.find(p => p.id === targetId);
      if (found) {
        // 현재 선택된 것과 다를 때만 업데이트
        if (selectedProfile?.id !== found.id) {
          setSelectedProfile(found);
        }
      } else {
        // ID는 있는데 목록에 없으면(삭제됨 등) 본인으로 리셋
        if (selectedProfile?.id) {
          setSelectedProfile(userData);
        }
      }
    } else {
      // targetId가 null/undefined면 본인
      if (selectedProfile?.id) { // 이미 본인이면 패스
        setSelectedProfile(userData);
      }
    }
  }, [userData?.currentProfileId, savedProfiles]); // userData 전체보다는 ID만 의존 추천하지만 userData가 객체라.. 간단히

  // 프로필 추가 함수
  const addProfile = async (profileData) => {
    if (!user) return;
    const newProfile = await ProfileService.addSavedProfile(user.uid, profileData);
    setSavedProfiles(prev => [newProfile, ...prev]);
    return newProfile;
  };

  // 프로필 삭제 함수
  const removeProfile = async (profileId) => {
    if (!user) return;
    await ProfileService.deleteSavedProfile(user.uid, profileId);
    setSavedProfiles(prev => prev.filter(p => p.id !== profileId));
    // 만약 삭제된 프로필을 보고 있었다면 본인 프로필로 복귀
    if (selectedProfile?.id === profileId) {
      selectProfile(null); // DB 업데이트 포함
    }
  };

  // 프로필 수정 함수 (친구용)
  const updateSavedProfile = async (profileId, newData) => {
    if (!user) return;
    const updated = await ProfileService.updateSavedProfile(user.uid, profileId, newData);

    // 저장된 목록 업데이트
    setSavedProfiles(prev => prev.map(p => p.id === profileId ? updated : p));

    // 현재 선택된 프로필이면 그것도 업데이트
    if (selectedProfile?.id === profileId) {
      setSelectedProfile(updated);
    }
    return updated;
  };

  // 1️⃣ 일주 이미지 경로 계산 - selectedProfile 기준
  const iljuImagePath = useMemo(() => {
    const target = selectedProfile || userData; // Fallback

    // [보안/에러 방지] 함수 초기화 여부와 데이터 존재 여부를 동시에 체크
    if (!target || !target.saju || !target.birthDate || typeof calculateSaju !== 'function') {
      return '/images/ilju/default.png';
    }

    try {
      const data = target.saju; // 이미 계산된 사주 사용

      const safeIlju =
        data?.sky1 && typeof getRomanizedIlju === 'function'
          ? getRomanizedIlju(data.sky1 + data.grd1)
          : 'gapja';

      const safeGender = target.gender ? target.gender.toLowerCase() : 'male';
      return `/images/ilju/${safeIlju}_${safeGender}.png`;
    } catch (e) {
      console.error('Ilju image path error:', e);
      return '/images/ilju/default.png';
    }
  }, [selectedProfile, userData, language]);

  // 2️⃣ 서비스 이용 상태 계산 - selectedProfile 기준
  const status = useMemo(() => {
    const target = selectedProfile || userData;
    const isOwner = target && userData && target.uid === userData.uid;

    if (!target || !userData || typeof checkSajuMatch !== 'function')
      return { isMainDone: false, isYearDone: false, isDailyDone: false, isCookieDone: false };

    // 친구 프로필인 경우: 항상 열람 가능 (false)
    // if (!isOwner) {
    //    return { isMainDone: false, isYearDone: false, isDailyDone: false, isCookieDone: false };
    // }

    const todayStr = new Date().toLocaleDateString('en-CA');
    const nextYear = '2027';
    const gender = userData.gender;
    const currentSaju = userData.saju;
    const hist = userData.usageHistory || {};

    return {
      isMainDone: !!(
        hist.ZApiAnalysis?.language === language &&
        hist.ZApiAnalysis?.gender === gender &&
        checkSajuMatch(hist.ZApiAnalysis?.saju, target.saju)
      ),
      isYearDone: !!(
        String(hist.ZNewYear?.year) === nextYear &&
        hist.ZNewYear?.language === language &&
        checkSajuMatch(hist.ZNewYear?.saju, target.saju)
      ),
      isDailyDone: !!(
        hist.ZLastDaily?.date === todayStr &&
        hist.ZLastDaily?.language === language &&
        checkSajuMatch(hist.ZLastDaily?.saju, target.saju)
      ),
      isCookieDone: !!(hist.ZCookie?.today === todayStr),
    };
  }, [selectedProfile, userData, language]);

  // 3️⃣ 인앱 브라우저 체크
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const userAgent = navigator.userAgent.toLowerCase();
    const isSpecialPage = specialPaths.some((path) => pathname === path || pathname.startsWith(path + '/'));
    const isInApp = /kakaotalk|instagram|naver/.test(userAgent);

    if (!isSpecialPage && !!isInApp) {
      const currentUrl = window.location.href;
      if (/android/.test(userAgent)) {
        window.location.href = `intent://${currentUrl.replace(/https?:\/\//i, '')}#Intent;scheme=https;package=com.android.chrome;end`;
        return;
      } else if (/iphone|ipad|ipod/.test(userAgent) && !currentUrl.includes('/open-in-browser')) {
        window.location.href = '/open-in-browser';
        return;
      }
    }
  }, [pathname]);

  // 4️⃣ 로그인 감시 (최초 1회만 실행)
  useEffect(() => {
    const unsubscribe = onUserStateChange((firebaseUser) => {
      if (firebaseUser) {
        setLoadingUser(true); // Ensure loading state while fetching Cloud Firestore data
        setUser(firebaseUser);
      } else {
        setUser(null);
        setUserData(null); // Clear stale data
        setSelectedProfile(null);
        setLoadingUser(false);
      }
    });

    // Handle mobile redirect result
    getRedirectResult(auth).then((result) => {
      if (result) {
        console.log('Mobile redirect login success:', result.user.email);
      }
    }).catch((error) => {
      console.error('Redirect result error:', error);
    });

    return () => unsubscribe?.();
  }, []);

  // 4️⃣ 데이터 실시간 동기화 및 로그인 날짜/신규유저 업데이트
  useEffect(() => {
    if (!user) return;

    const userDocRef = doc(db, 'users', user.uid);
    const todayStr = new Date().toLocaleDateString('en-CA');

    // [A] 실시간 데이터 감시 (순수하게 읽기만 수행하여 무한루프 방지)
    const unsubscribeSnapshot = onSnapshot(
      userDocRef,
      (docSnap) => {
        if (docSnap.exists()) {
          setUserData(docSnap.data());
        }
        setLoadingUser(false);
      },
      (error) => {
        console.error('Firestore Snapshot Error:', error);
        setLoadingUser(false);
      },
    );

    // [B] 로그인 날짜 업데이트 및 초기 데이터 생성 (비동기로 1회 실행)
    const initializeUserData = async () => {
      try {
        const docSnap = await getDoc(userDocRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          // 날짜가 다를 때만 업데이트 (깜빡임 최소화)
          if (data.lastLoginDate !== todayStr) {
            await updateDoc(userDocRef, {
              lastLoginDate: todayStr,
              editCount: 0,
              updatedAt: new Date().toISOString(),
            });
          }
        } else {
          // 신규 유저 초기 생성
          let providerId = user.providerData?.[0]?.providerId;

          if (!providerId) {
            // 커스텀 토큰(카카오/네이버)의 경우 providerData가 비어있을 수 있으므로 UID 접두사로 확인
            if (user.uid.startsWith('kakao:')) providerId = 'kakao.com';
            else if (user.uid.startsWith('naver:')) providerId = 'naver.com';
            else providerId = 'firebase'; // 그 외 커스텀/익명 등
          }
          const initialData = {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName || '사용자',
            photoURL: user.photoURL || '',
            provider: providerId, // 로그인 제공자 저장 (google.com, kakao.com 등)
            phoneNumber: user.phoneNumber || '', // 이미 있으면 저장
            role: 'user',
            status: 'active',
            editCount: 0,
            lastLoginDate: todayStr,
            gender: 'female',
            birthDate: '',
            birthCity: '',
            isTimeUnknown: false,
            saju: null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            usageHistory: {
              ZNewYear: null,
              ZLastDaily: null,
              ZCookie: null,
              ZApiAnalysis: null,
            },
            question_history: [],
            dailyUsage: {},
          };
          await setDoc(userDocRef, initialData);
        }
      } catch (error) {
        console.error('User Initialization Error:', error);
      }
    };

    initializeUserData();

    return () => unsubscribeSnapshot?.();
  }, [user]);

  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [msgModalData, setMsgModalData] = useState({ isOpen: false, receiverId: 'admin', receiverName: 'Admin', originalId: null });

  const openLoginModal = () => setIsLoginModalOpen(true);
  const closeLoginModal = () => setIsLoginModalOpen(false);
  const openContactModal = () => setIsContactModalOpen(true);
  const closeContactModal = () => setIsContactModalOpen(false);
  const openMessageModal = (receiverId = 'admin', receiverName = 'Admin', originalId = null) => {
    setMsgModalData({ isOpen: true, receiverId, receiverName, originalId });
  };
  const closeMessageModal = () => {
    setMsgModalData(prev => ({ ...prev, isOpen: false }));
  };

  const handleLogin = async (provider = 'google') => {
    setIsLoggingIn(true);
    try {
      if (provider === 'kakao') {
        await loginWithKakao();
      } else if (provider === 'naver') {
        await loginWithNaver();
      } else {
        await login();
      }
    } catch (error) {
      if (error.code === 'auth/popup-closed-by-user') {
        return;
      }
      console.error('Login Error:', error);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const cancelLogin = () => {
    setIsLoggingIn(false);
  };

  const updateProfileData = async (newData) => {
    if (!user) return;
    const userDocRef = doc(db, 'users', user.uid);
    await updateDoc(userDocRef, { ...newData, updatedAt: new Date().toISOString() });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userData, // 본인 원본 데이터
        selectedProfile, // 현재 선택된 프로필 (친구 포함)
        savedProfiles, // 저장된 친구 목록
        loadingUser,
        isLoggingIn,
        iljuImagePath, // selectedProfile 기준
        login: handleLogin,
        isLoginModalOpen,
        openLoginModal,
        closeLoginModal,
        isContactModalOpen,
        openContactModal,
        closeContactModal,
        isMessageModalOpen: msgModalData.isOpen,
        msgModalData,
        openMessageModal,
        closeMessageModal,
        cancelLogin,
        logout,
        updateProfileData,
        selectProfile, // 프로필 변경 함수
        addProfile, // 프로필 추가 함수
        removeProfile, // 프로필 삭제 함수
        updateSavedProfile, // 프로필 수정 함수
        ...status, // selectedProfile 기준 상태
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
export function useAuthContext() {
  return useContext(AuthContext);
}
