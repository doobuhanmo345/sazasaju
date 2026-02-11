'use client';

import * as firestore from 'firebase/firestore';
import { addDoc, collection, serverTimestamp, onSnapshot, doc, getDocs, query, where, orderBy, writeBatch } from 'firebase/firestore';
import { ref, get, child } from 'firebase/database';
import { db, database } from '@/lib/firebase';
import { fetchGeminiAnalysis } from '@/lib/gemini';
import { getEng } from '@/utils/helpers';
import { UI_TEXT, langPrompt, hanja } from '@/data/constants';
import { getPillars, calculateSaju, calculateCalendarRange, calculateDetailedCalendarRange } from '@/lib/sajuCalculator';
import { DateService } from '@/utils/dateService';
import { createPromptForGemini } from '@/lib/sajuLogic';

const getResultPath = (type, currentPath, params, lang = 'ko') => {
  // Map analysis types to their specific result pages (Must match actual folder names in app/saju/)
  const pathMap = {
    'basic': '/saju/basic/result',
    'wealth': '/saju/wealth/result',
    'wealthCapacity': '/saju/wealth/capacity/result',
    'wealthTiming': '/saju/wealth/timing/result',
    'wealthInvestment': '/saju/wealth/investment/result',
    'wealthBusiness': '/saju/wealth/business/result',
    'love': '/saju/love/result',
    'loveLifetime': '/saju/love/lifetime/result',
    'loveMonthly': '/saju/love/monthly/result',
    'loveCompatible': '/saju/love/compatible/result',
    'loveAvoid': '/saju/love/avoid/result',
    'loveReunion': '/saju/love/reunion/result',
    'loveTiming': '/saju/love/timing/result',
    'loveFeelings': '/saju/love/feelings/result',
    'daily': '/saju/todaysluck/result', // Folder is 'todaysluck'
    'newYear': '/saju/2026luck/result', // Folder is '2026luck'
    'match': '/saju/match/result', // Match results are shown inline, so go to the main page
    'selbirth': '/saju/selbirth/result',
    'selDate': '/saju/seldate/result',
    'saza': '/saju/sazatalk/result',
    'dailySpecific': params?.type === 'interview' ? '/saju/interview/result' : '/saju/date/result',
  };

  const titleMap = {
    'ko': {
      'basic': '기본 사주 분석',
      'wealth': '재물운 분석',
      'wealthCapacity': '재물 그릇 분석',
      'wealthTiming': '재물 흐름 분석',
      'wealthInvestment': '투자운 분석',
      'wealthBusiness': '사업운 분석',
      'love': '종합 연애운',
      'loveLifetime': '평생 연애 전문가',
      'loveMonthly': '월간 연애운',
      'loveCompatible': '궁합 분석',
      'loveAvoid': '피해야 할 인연',
      'loveReunion': '재회운 분석',
      'loveTiming': '연애 시기 분석',
      'loveFeelings': '속마음 분석',
      'daily': '오늘의 운세',
      'newYear': '2026년 신년운세',
      'selbirth': '출산 택일',
      'seldate': '택일 서비스',
      'saza': '사자톡 상담',
      'dailySpecific': lang === 'en' ? (params?.type === 'interview' ? 'Interview Saju' : 'Specific Date Analysis') : (params?.type === 'interview' ? '면접 사주' : '지정일 분석')
    },
    'en': {
      'basic': 'Basic Saju',
      'wealth': 'Wealth Analysis',
      'saza': 'SazaTalk Consulting',
      'daily': "Today's Luck",
      'newYear': '2026 Luck'
    }
  };

  const resultPath = pathMap[type] || currentPath;
  const title = titleMap[lang || 'ko']?.[type] || (lang === 'en' ? 'Saju Analysis' : '사주 분석');
  console.log('[getResultPath] type:', type, 'params.type:', params?.type, 'resultPath:', resultPath, 'title:', title);
  return { path: resultPath, title };
};

// Update usages to handle object return or just keep current signature and add getAnalysisTitle helpers
const getAnalysisTitle = (type, lang, params) => getResultPath(type, '', params, lang).title;
const getTargetResultPath = (type, currentPath, params) => getResultPath(type, currentPath, params).path;

export const getPromptFromDB = async (path) => {
  try {
    const pathName = `prompt/${path}`;

    const dbRef = ref(database);
    const snapshot = await get(child(dbRef, pathName));

    if (snapshot.exists()) {
      return snapshot.val(); // 데이터가 있으면 해당 값 반환
    }
    return ''; // 없으면 빈 문자열
  } catch (error) {
    console.error('프롬프트 로드 실패:', error);
    return '';
  }
};

class SajuAnalysisService {
  static SAJU_KEYS = ['sky0', 'grd0', 'sky1', 'grd1', 'sky2', 'grd2', 'sky3', 'grd3'];

  constructor(context) {
    this.user = context.user;
    this.userData = context.userData;
    this.language = context.language;
    this.maxEditCount = context.maxEditCount;
    this.uiText = context.uiText;
    this.langPrompt = context.langPrompt;
    this.hanja = context.hanja;
    this.relationTypes = context.relationTypes;
    this.qTypes = context.qTypes;
    this.subQTypes = context.subQTypes;
    this.analysisMode = context.analysisMode || (typeof window !== 'undefined' ? localStorage.getItem('saza_analysis_mode') : 'direct') || 'direct';
    this.handleCancelHelper = context.handleCancelHelper;
    this.setEditCount = context.setEditCount;
    this.setLoading = context.setLoading;
    this.setLoadingType = context.setLoadingType;
    this.setAiResult = context.setAiResult;
    this.setAiAnalysis = context.setAiAnalysis;
    this.setStep = context.setStep;
    this.setLastParams = context.setLastParams;
    this.setStatusText = context.setStatusText; // [NEW] Status text update
  }

  checkUsageLimit = async () => {

    if (!this.userData) {
      return true;
    }

    const currentCount = this.userData.editCount || 0;
    const currentCredits = this.userData.credits || 0;
    const freeRemaining = Math.max(0, this.maxEditCount - currentCount); // ⭐️ 0 추가
    const totalRemaining = freeRemaining + currentCredits;

    if (this.handleCancelHelper) {
      if (totalRemaining <= 0) {
        this.handleCancelHelper()


        const msg = this.language === 'ko'
          ? '오늘의 무료 분석 횟수를 모두 소진했습니다.\n크레딧을 충전하여 계속 이용해보세요!'
          : 'Daily free limit reached. Please recharge credits to continue.';

        if (confirm(msg)) {
          window.location.href = '/credit/';
          return false;
        } else {
          window.location.href = '/';
          return false;
        }
      }

      return true;
    }

    return totalRemaining > 0;
  };
  static compareSaju(source, target) {
    if (!source && !target) return true;
    if (!source || !target) return false;
    return this.SAJU_KEYS.every((key) => source[key] === target[key]);
  }


  static sortObject(obj) {
    return Object.keys(obj)
      .sort()
      .reduce((acc, key) => ({ ...acc, [key]: obj[key] }), {});
  }

  getDisplayName() {
    return this.userData?.displayName || (this.language === 'ko' ? '선생님' : 'User');
  }

  getSajuString(saju) {
    return `${JSON.stringify(saju)} - sky3+grd3 는 연주, sky2+grd2는 월주, sky1+grd1은 일주, sky0+grd0는 시주야`;
  }

  getTodayDate() {
    return new Date().toLocaleDateString('en-CA');
  }
  async getToday() {
    return await DateService.getTodayDate(); // 결과를 반드시 return 해야 함!
  }

  async getSafeDate() {
    // return DateService.getTodayDate();
    return new Date().toISOString().replace(/[:.]/g, '-');
  }

  async fetchPrompts(paths) {
    const dbRef = ref(database);
    const snapshots = await Promise.all(paths.map((path) => get(child(dbRef, path))));
    return snapshots.reduce((acc, snap, i) => ({ ...acc, [paths[i]]: snap.val() || '' }), {});
  }

  replaceVariables(template, vars) {
    let result = template;
    Object.entries(vars).forEach(([key, value]) => {
      result = result.split(key).join(value || '');
    });
    return result;
  }

  async checkGuestDuplicate(guestId, saju) {
    if (!guestId) return false;
    const docRef = firestore.doc(db, 'sazatalkad_logs', guestId);
    const docSnap = await firestore.getDoc(docRef);

    if (docSnap.exists()) {
      const existingData = docSnap.data();
      if (
        JSON.stringify(SajuAnalysisService.sortObject(existingData.saju)) ===
        JSON.stringify(SajuAnalysisService.sortObject(saju))
      ) {
        const msg =
          this.language === 'en'
            ? 'Visit our website! Log in to get 3 premium reports daily for free.'
            : '사자사주 홈페이지에 방문해 보세요! 로그인만 하면 무료로 하루에 세 개씩 프리미엄 리포트를 확인할 수 있어요.';
        alert(msg);
        return true;
      }
    }
    return false;
  }

  /**
   * 백그라운드 분석 (Queue 방식)
   * - analysis_queue 컬렉션에 문서 생성
   * - Cloud Function이 자동으로 처리
   * - onSnapshot으로 결과 대기
   */
  async analyzeInBackground(prompt, userId, targetPath = null, analysisTitle = null, analysisType = null, params = null, cacheKey = null) {
    return new Promise(async (resolve, reject) => {
      const TIMEOUT_MS = 10 * 60 * 1000; // 10분
      let unsubscribe = null;
      let timeoutId = null;

      try {
        console.log('[analyzeInBackground] Creating queue document...');

        // 1. Queue에 문서 생성
        const queueRef = await addDoc(collection(db, 'analysis_queue'), {
          userId,
          prompt,
          status: 'pending',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          targetPath,
          analysisTitle,
          analysisType,
          params: params ? JSON.parse(JSON.stringify(params)) : null, // Ensure plain object
          cacheKey,
        });

        console.log(`[analyzeInBackground] Queue document created: ${queueRef.id}`);

        // [NEW] Event-based cancellation listener
        const onGlobalCancel = () => {
          console.log('[analyzeInBackground] Cancellation triggered by global event');
          if (unsubscribe) unsubscribe();
          if (timeoutId) clearTimeout(timeoutId);
          // Set isAnalyzing to false in users collection to release lock
          if (userId) {
            firestore
              .updateDoc(firestore.doc(db, 'users', userId), { isAnalyzing: false })
              .catch(console.error);
          }
          reject(new Error('CANCELLED'));
        };

        if (typeof window !== 'undefined') {
          window.addEventListener('sazasaju-analysis-cancel', onGlobalCancel, { once: true });
        }

        // 3. 실시간 리스너 설정
        unsubscribe = onSnapshot(doc(db, 'analysis_queue', queueRef.id), (docSnap) => {
          if (!docSnap.exists()) {

            onGlobalCancel();
            return;
          }

          const data = docSnap.data();
          console.log(`[analyzeInBackground] Status: ${data.status}`);

          if (data.status === 'completed') {
            console.log('[analyzeInBackground] Analysis completed successfully');
            if (timeoutId) clearTimeout(timeoutId);
            if (unsubscribe) unsubscribe();
            if (typeof window !== 'undefined') {
              window.removeEventListener('sazasaju-analysis-cancel', onGlobalCancel);
            }
            resolve(data.result || data.airesult);
          } else if (data.status === 'error' || data.status === 'failed') {
            console.error('[analyzeInBackground] Analysis failed:', data.error || 'Unknown failure');
            if (timeoutId) clearTimeout(timeoutId);
            if (unsubscribe) unsubscribe();
            if (typeof window !== 'undefined') {
              window.removeEventListener('sazasaju-analysis-cancel', onGlobalCancel);
            }
            reject(new Error(data.error || 'Background analysis failed'));
          }
        }, (error) => {
          console.error('[analyzeInBackground] Snapshot error:', error);
          if (timeoutId) clearTimeout(timeoutId);
          if (unsubscribe) unsubscribe();
          if (typeof window !== 'undefined') {
            window.removeEventListener('sazasaju-analysis-cancel', onGlobalCancel);
          }
          reject(error);
        });

        // 2. 타임아웃 설정
        timeoutId = setTimeout(() => {
          console.error('[analyzeInBackground] Operation timed out after 10 minutes');
          if (unsubscribe) unsubscribe();
          if (typeof window !== 'undefined') {
            window.removeEventListener('sazasaju-analysis-cancel', onGlobalCancel);
          }
          // Set isAnalyzing to false via explicit update to be safe
          if (userId) {
            firestore
              .updateDoc(firestore.doc(db, 'users', userId), { isAnalyzing: false })
              .catch(console.error);
          }
          reject(new Error('TIMEOUT'));
        }, TIMEOUT_MS);

      } catch (error) {
        if (timeoutId) clearTimeout(timeoutId);
        if (unsubscribe) unsubscribe();
        console.error('[analyzeInBackground] Setup error:', error);
        reject(error);
      }
    });
  }

  async analyze(config) {
    const {
      type,
      params,
      cacheKey,
      validateCache,
      promptPaths,
      buildPromptVars,
      buildSaveData,
      useCustomPromptBuilder = false,
      customPromptBuilder = null,
      customValidation,
      loadingType = null,
      skipUsageCheck = false,
      isGuestMode = false,
      guestId = null,
      guestCollection = null,
      getNotificationType,
      getResultPath: presetGetResultPath,
      onComplete,
    } = config;

    this.setLastParams?.(params);

    if (!isGuestMode && !this.user) {
      alert(this.uiText?.loginReq?.[this.language] || 'Please login');
      return null;
    }

    if (customValidation && !(await customValidation(params, this))) { // ⭐️ await 추가
      return null;
    }

    this.setLoading?.(true);
    this.setLoadingType?.(loadingType);
    this.setAiResult?.('');

    // [NEW] Check if already analyzing
    if (this.userData?.isAnalyzing) {
      // Check for stale lock ( > 5 minutes)
      // Note: userData.analysisStartedAt might be a Firestore Timestamp or a Date object depending on how it's serialized
      let isStale = false;
      if (this.userData.analysisStartedAt) {
        const startTime = this.userData.analysisStartedAt.seconds
          ? this.userData.analysisStartedAt.seconds * 1000
          : new Date(this.userData.analysisStartedAt).getTime();

        const now = Date.now();
        if (now - startTime > 5 * 60 * 1000) {
          isStale = true;
        }
      }

      if (!isStale) {
        this.setLoading?.(false);
        this.setStatusText?.('');
        this.setLoadingType?.(null);
        alert(this.language === 'ko'
          ? '이미 분석이 진행 중입니다. 잠시만 기다려주세요.'
          : 'Analysis already in progress. Please wait.');
        return null;
      } else {
        console.warn('⚠️ Stale analysis lock detected. Proceeding with new analysis.');
      }
    }

    // [NEW] Global Lock: Set isAnalyzing to true
    if (this.user) {
      try {
        await firestore.setDoc(firestore.doc(db, 'users', this.user.uid), {
          isAnalyzing: true,
          analysisStartedAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        }, { merge: true });
      } catch (e) {
        console.error('Failed to set lock:', e);
      }
    }

    console.log(`🚀 Starting ${type} Analysis...`);
    console.time('FullAnalysis');

    try {
      const usageData = this.userData?.usageHistory || {};
      const editCount = this.userData?.editCount;
      const currentCredits = this.userData?.credits || 0;
      let useCredit = false;

      // 캐시 체크
      if (cacheKey && usageData[cacheKey]) {
        const cached = usageData[cacheKey];
        if (validateCache?.(cached, params)) {
          console.log(`✅ ${type} 캐시 사용`);
          console.timeEnd('FullAnalysis');

          this.setAiResult?.(cached.result);
          this.setAiAnalysis?.(cached.result);

          this.setLoading?.(false);
          this.setLoadingType?.(null);

          setTimeout(() => {
            onComplete?.(cached.result);
          }, 100);

          return cached.result;
        }
      }

      console.log(`🚀 ${type} API 호출`);
      this.setStatusText?.(this.language === 'ko' ? '분석 준비 중...' : 'Preparing analysis...');

      // 프롬프트 생성
      let fullPrompt;
      console.time('PromptBuild');
      if (useCustomPromptBuilder && customPromptBuilder) {
        fullPrompt = await customPromptBuilder(params, this);
        if (!fullPrompt) {
          console.timeEnd('PromptBuild');
          console.timeEnd('FullAnalysis');
          alert('데이터베이스에서 프롬프트를 불러오지 못했습니다.');
          return null;
        }
      } else {
        const prompts = await this.fetchPrompts(promptPaths);
        if (!prompts[promptPaths[0]]) {
          console.timeEnd('PromptBuild');
          console.timeEnd('FullAnalysis');
          throw new Error(`${type} 템플릿이 DB에 없습니다.`);
        }
        const vars = buildPromptVars(prompts, params, this);
        fullPrompt = this.replaceVariables(prompts[promptPaths[0]], vars);
      }

      // [Hotfix] selDate 타입인 경우 달력 데이터 강제 주입 (템플릿 변수가 없어도 무조건 들어가도록)
      // 사용자가 템플릿을 수정하지 않아도 정확한 만세력 데이터가 전달되게 합니다.
      if (type === 'selDate' && params.startDate && params.endDate) {
        const calendarData = calculateCalendarRange(params.startDate, params.endDate);
        if (calendarData) {
          fullPrompt += `\n\n[IMPORTANT: Accurate Saju Calendar Data]\nUse this data to determine the daily Ganji (Il-jin). Do NOT hallucinate.\n${calendarData}\n----------------------------------\n`;
        }
      }

      if (true || this.user?.email === 'doobuhanmo3@gmail.com') {
        console.log('✅ Final Prompt with Calendar:', fullPrompt);
      }

      // API 호출 - 스마트 라우팅 (앱 상태에 따라 직접/백그라운드 선택)
      console.time('GeminiCall');
      this.setStatusText?.(this.language === 'ko' ? 'AI 분석 중...' : 'AI Analyzing...');
      let result;

      // Determine target path and title for background context
      const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';
      let targetPathRaw = type === 'saza'
        ? '/saju/sazatalk/result'
        : (presetGetResultPath ? presetGetResultPath(currentPath, params) : getTargetResultPath(type, currentPath, params));

      // Ensure targetPath is a string (might be an object due to recent getResultPath changes)
      const targetPath = typeof targetPathRaw === 'object' ? targetPathRaw.path : targetPathRaw;

      const analysisTitle = (typeof targetPathRaw === 'object' && targetPathRaw.title)
        ? targetPathRaw.title
        : getAnalysisTitle(type, this.language, params);

      const useBackground = (this.user && this.analysisMode === 'background' && !config.forceDirect) ||
        config.forceBackground ||
        (typeof document !== 'undefined' && document.visibilityState !== 'visible');

      let isBackgroundResult = false;
      if (useBackground && this.user) {
        console.log(`🔄 Using background analysis (Mode: ${this.analysisMode}, forced: ${!!config.forceBackground})`);
        try {
          // Pass useCredit to params so backend can deduct accordingly
          const bgParams = { ...params, useCredit };
          result = await this.analyzeInBackground(fullPrompt, this.user.uid, targetPath, analysisTitle, type, bgParams, cacheKey);
          isBackgroundResult = true;
        } catch (bgError) {
          if (bgError.message === 'CANCELLED') return null;
          console.warn('⚠️ Background analysis failed, falling back to direct call:', bgError);
          result = await fetchGeminiAnalysis(fullPrompt);
        }
      } else {
        console.log(`⚡ Using direct analysis (Mode: ${this.analysisMode})`);

        // [NEW] Event-based cancellation for direct call
        let isCancelled = false;
        const onGlobalCancel = () => {
          console.log('[SajuAnalysisService] Direct analysis ignored via global event');
          isCancelled = true;
          if (this.user) {
            firestore
              .updateDoc(firestore.doc(db, 'users', this.user.uid), { isAnalyzing: false })
              .catch(console.error);
          }
        };

        if (typeof window !== 'undefined') {
          window.addEventListener('sazasaju-analysis-cancel', onGlobalCancel, { once: true });
        }

        try {
          result = await fetchGeminiAnalysis(fullPrompt);
        } finally {
          if (typeof window !== 'undefined') {
            window.removeEventListener('sazasaju-analysis-cancel', onGlobalCancel);
          }
        }

        if (isCancelled) return null;
      }

      console.timeEnd('GeminiCall');
      this.setStatusText?.(this.language === 'ko' ? '결과 정리 중...' : 'Finalizing result...');


      // DB 저장 (백엔드에서 이미 저장했으면 클라이언트는 생략하여 중복 차감 및 중복 데이터 방지)
      if (buildSaveData && !isBackgroundResult) {
        try {
          const saveData = await buildSaveData(result, params, this, cacheKey);

          if (isGuestMode && guestId && guestCollection) {
            await firestore.setDoc(firestore.doc(db, guestCollection, guestId), saveData, { merge: true });
          } else if (this.user) {

            // [MODIFIED] Apply Usage Logic (Free vs Credit)
            if (useCredit) {
              // Paid Tier: Remove editCount increment, Deduct Credit
              delete saveData.editCount;
              saveData.credits = firestore.increment(-1);
              // Note: dailyUsage will still increment as analytics, which is fine.
            } else {
              // Free Tier: Normal behavior (editCount increment)
              // saveData.editCount is already set by preset
            }

            await firestore.setDoc(firestore.doc(db, 'users', this.user.uid), saveData, { merge: true });

            // Context Update (Optimistic)
            if (!useCredit) {
              this.setEditCount?.((prev) => prev + 1);
            }
          }
        } catch (dbError) {
          console.error('DB Save Failed (Non-critical):', dbError);
          // 필요하다면 토스트 메시지 등을 띄울 수 있음
        }

        // [NEW] Notification: Create Alarm in NotificationList
        if (this.user) {
          try {
            const labels = {
              ko: {
                basic: '기본 사주 분석',
                wealth: '재물운 분석',
                wealthCapacity: '평생 재물운 분석',
                wealthTiming: '올해/내년 흐름 분석',
                wealthInvestment: '투자/재테크 분석',
                wealthBusiness: '사업/창업운 분석',
                love: '애정운 분석',
                loveLifetime: '평생 애정운 분석',
                loveMonthly: '이번 달 애정운 분석',
                loveCompatible: '잘 맞는 사람 분석',
                loveAvoid: '피해야 할 사람 분석',
                loveReunion: '재회운 분석',
                loveTiming: '솔로 탈출 시기 분석',
                loveFeelings: '상대방 속마음 분석',
                daily: '오늘의 운세',
                newYear: '2026 신년운세',
                match: '궁합 분석',
                selbirth: '출산 택일',
                seldate: '택일 분석',
                saza: '사자톡 상담',
                dailySpecific: params?.type === 'interview' ? '면접 사주 분석' : params?.type === 'firstdate' ? '첫만남 분석' : '특정일 분석'
              },
              en: {
                basic: 'Basic Saju Analysis',
                wealth: 'Wealth Analysis',
                wealthCapacity: 'Lifetime Wealth Analysis',
                wealthTiming: 'Yearly Flow Analysis',
                wealthInvestment: 'Investment Analysis',
                wealthBusiness: 'Business Analysis',
                love: 'Love Fortune Analysis',
                loveLifetime: 'Lifetime Love Fortune Analysis',
                loveMonthly: 'Monthly Love Fortune Analysis',
                loveCompatible: 'Compatible Partners Analysis',
                loveAvoid: 'People to Avoid Analysis',
                loveReunion: 'Reunion Fortune Analysis',
                loveTiming: 'Love Timing Analysis',
                loveFeelings: 'Their Feelings Analysis',
                daily: "Today's Luck",
                newYear: '2026 New Year Luck',
                match: 'Compatibility Analysis',
                selbirth: 'Birth Date Selection',
                seldate: 'Date Selection',
                saza: 'SazaTalk Consulting Complete',
                dailySpecific: params?.type === 'interview' ? 'Interview Saju Analysis' : params?.type === 'firstdate' ? 'First Date Analysis' : 'Specific Date Analysis'
              }
            };

            // [NEW] Dynamically determine notification type for labels
            const notifType = getNotificationType ? getNotificationType(params) : type;

            const typeLabel = labels[this.language || 'ko']?.[notifType] ||
              (this.language === 'ko' ? '사주 분석' : 'Saju analysis');

            const notifMsg = this.language === 'ko'
              ? `${typeLabel}이 완료되었습니다.`
              : `${typeLabel} completed.`;

            // Special path for SazaTalk to trigger modal in Messages inbox
            const targetPathRaw = type === 'saza'
              ? '/saju/sazatalk/result'
              : (presetGetResultPath ? presetGetResultPath(window.location.pathname, params) : getResultPath(type, window.location.pathname, params));

            const targetPath = typeof targetPathRaw === 'object' ? targetPathRaw.path : targetPathRaw;

            await addDoc(collection(db, 'notifications'), {
              userId: this.user.uid,
              type: 'analysis',
              message: notifMsg,
              isRead: false,
              createdAt: serverTimestamp(),
              targetPath: targetPath
            });
          } catch (notifErr) {
            console.error('Notification creation failed:', notifErr);
          }
        }

        // [NEW] SazaTalk Message: Create message in sazatalk_messages collection
        if (this.user && type === 'saza') {
          try {
            // Create message
            await addDoc(collection(db, 'sazatalk_messages'), {
              userId: this.user.uid,
              question: params.question,
              answer: result,
              isSaved: false,
              isRead: false,
              createdAt: serverTimestamp()
            });

            // Auto-cleanup: Keep only recent 3 unsaved messages
            const messagesQuery = query(
              collection(db, 'sazatalk_messages'),
              where('userId', '==', this.user.uid),
              where('isSaved', '==', false)
            );
            const snapshot = await getDocs(messagesQuery);

            if (snapshot.docs.length > 3) {
              // Sort by createdAt descending on client to avoid index requirement
              const sortedDocs = [...snapshot.docs].sort((a, b) => {
                const timeA = a.data().createdAt?.seconds || 0;
                const timeB = b.data().createdAt?.seconds || 0;
                return timeB - timeA;
              });

              const toDelete = sortedDocs.slice(3);
              const batch = writeBatch(db);
              toDelete.forEach(doc => batch.delete(doc.ref));
              await batch.commit();
              console.log(`[SazaTalk] Cleaned up ${toDelete.length} old messages`);
            }
          } catch (sazaErr) {
            console.error('[SazaTalk] Message creation/cleanup failed:', sazaErr);
          }
        }
      }

      this.setAiResult?.(result);
      this.setAiAnalysis?.(result);
      onComplete?.(result);

      console.timeEnd('FullAnalysis');
      return result;
    } catch (error) {
      console.timeEnd('FullAnalysis');
      console.error('발생한 에러:', error);
      alert(`분석 중 오류가 발생했습니다: ${error.message}`);
      throw error;
    } finally {
      this.setLoading?.(false);
      this.setStatusText?.('');
      this.setLoadingType?.(null);
      // [NEW] Global Lock: Release
      if (this.user) {
        try {
          await firestore.updateDoc(firestore.doc(db, 'users', this.user.uid), {
            isAnalyzing: false, // Changed to false for release
            analysisStartedAt: null, // Cleared on release
            updatedAt: serverTimestamp()
          });
        } catch (e) {
          console.error('Failed to release lock:', e);
        }
      }
    }
  }
}

class AnalysisPresets {
  static basic(params, sajuData) {
    return {
      type: 'basic',
      params,
      cacheKey: 'ZApiAnalysis',
      loadingType: 'main',
      useCustomPromptBuilder: true,

      customValidation: async (p, service) => {
        const hasUsage = await service.checkUsageLimit(); // ⭐️ await 추가
        if (!hasUsage) {
          return false;
        }
        if (!service.userData?.birthDate) {
          alert(service.uiText?.saveFirst?.[service.language] || '생년월일을 먼저 저장해주세요.');
          return false;
        }
        return true;
      },

      validateCache: (cached, p) =>
        cached.language === p.language &&
        cached.gender === p.gender &&
        SajuAnalysisService.compareSaju(cached.saju, p.saju) &&
        !!cached.result,

      customPromptBuilder: async (p, service) => {
        return await createPromptForGemini(sajuData, p.language);
      },

      buildSaveData: async (result, p, service) => {
        const todayStr = await service.getToday();
        return {
          editCount: firestore.increment(1),
          lastEditDate: todayStr,
          usageHistory: {
            ZApiAnalysis: {
              result,
              saju: p.saju,
              language: p.language,
              gender: p.gender,
              updatedAt: new Date().toISOString(),
            },
          },
          dailyUsage: { [todayStr]: firestore.increment(1) },
        };
      },
    };
  }

  static saza(params) {
    return {
      type: 'saza',
      params,
      promptPaths: ['prompt/saza_basic', 'prompt/saza_strict', 'prompt/saza_format'],

      customValidation: async (p, service) => {
        const hasUsage = await service.checkUsageLimit(); // ⭐️ await 추가

        if (!hasUsage) {
          return false;
        }
        if (!service.userData?.birthDate) {
          alert(service.uiText?.saveFirst?.[service.language] || '생년월일을 먼저 저장해주세요.');
          return false;
        }
        if (!p.question?.trim()) {
          alert('질문을 입력해주세요.');
          return false;
        }
        return true;
      },

      buildPromptVars: (prompts, p, service) => ({
        '{{STRICT_PROMPT}}': prompts['prompt/saza_strict'],
        '{{SAZA_FORMAT}}': prompts['prompt/saza_format'],
        '{{myQuestion}}': p.question,
        '{{history}}': p.history || '', // [NEW] 대화 기록 추가
        '{{sajuInfo}}': `성별:${p.gender}, 생년월일:${p.inputDate}, 팔자:${JSON.stringify(p.saju)} (sky3+grd3=연주, sky2+grd2=월주, sky1+grd1=일주, sky0+grd0=시주). 호칭:${service.getDisplayName()}님.`,
        '{{todayInfo}}': `현재 시각:${new Date().toLocaleString()}. 2026년=병오년. `,
        '{{langPrompt}}': service.langPrompt?.(service.language) || '',
        '{{hanjaPrompt}}': service.hanja?.(service.language) || '',
      }),

      buildSaveData: async (result, p, service) => {
        const todayStr = await service.getToday();
        const timestamp = new Date().toISOString();
        return {

          editCount: firestore.increment(1),
          lastEditDate: todayStr,
          usageHistory: {

            Zsazatalk: {
              question: p.question,
              result: result,

              updatedAt: timestamp,
            },
            question_history: firestore.arrayUnion({
              question: p.question,
              updatedAt: timestamp,
            }),
          },
          dailyUsage: { [todayStr]: firestore.increment(1) },
        };
      },
    };
  }

  static sazaGuest(params, guestId) {
    return {
      type: 'saza_guest',
      params,
      isGuestMode: true,
      guestId,
      guestCollection: 'sazatalkad_logs',
      skipUsageCheck: true,
      promptPaths: ['prompt/saza_basic', 'prompt/saza_strict', 'prompt/saza_format'],

      customValidation: (p) => {

        if (!p.question?.trim()) {
          alert('질문을 입력해주세요.');
          return false;
        }
        return true;
      },

      buildPromptVars: (prompts, p, service) => {
        const displayName =
          service.userData?.displayName || (service.language === 'ko' ? '의뢰자' : 'guest');
        return {
          '{{STRICT_PROMPT}}': prompts['prompt/saza_strict'],
          '{{SAZA_FORMAT}}': prompts['prompt/saza_format'],
          '{{myQuestion}}': p.question,
          '{{sajuInfo}}': `성별:${p.gender}, 생년${p.birthData.year} 생월${p.birthData.month} 생일${p.birthData.day}, 팔자:${JSON.stringify(p.saju)} (sky3+grd3=연주, sky2+grd2=월주, sky1+grd1=일주, sky0+grd0=시주). 호칭:${displayName}`,
          '{{todayInfo}}': `현재 시각:${new Date().toLocaleString()}. 2026년=병오년. `,
          '{{langPrompt}}': '**한국어로 150~200 단어로**',
          '{{hanjaPrompt}}': service.hanja?.(service.language) || '',
        };
      },

      buildSaveData: async (result, p, service) => {
        const todayStr = await service.getToday();
        return {
          id: guestId,
          date: todayStr,
          user: !!service.user,
          saju: p.saju,
          usageHistory: {
            // question_history: arrayUnion({
            //   question: p.question,
            //   timestamp: new Date().toISOString(),
            // }),
          },
        };
      },
    };
  }

  static match(params) {
    return {
      type: 'match',
      params,
      cacheKey: 'ZMatchAnalysis',
      promptPaths: ['prompt/match_basic', 'prompt/match_strict', 'prompt/match_specific'],

      customValidation: async (p, service) => {
        const hasUsage = await service.checkUsageLimit(); // ⭐️ await 추가
        if (!hasUsage) {
          return false;
        }
        if (!service.userData?.birthDate) {
          alert(service.uiText?.saveFirst?.[service.language] || '생년월일을 먼저 저장해주세요.');
          return false;
        }
        if (!p.saju2?.sky1) {
          alert('상대방 정보를 입력해주세요.');
          return false;
        }
        return true;
      },

      validateCache: (cached, p) =>
        cached.language === p.language &&
        cached.relationship === p.relationship &&
        cached.gender === p.gender &&
        cached.gender2 === p.gender2 &&
        SajuAnalysisService.compareSaju(cached.saju, p.saju) &&
        SajuAnalysisService.compareSaju(cached.saju2, p.saju2) &&
        !!cached.result,

      buildPromptVars: (prompts, p, service) => {
        const relationLabel =
          service.relationTypes?.find((r) => r.id === p.relationship)?.label || 'Unknown';
        return {
          '{{STRICT_PROMPT}}': prompts['prompt/match_strict'],
          '{{SPECIFIC_PROMPT}}': prompts['prompt/match_specific'],
          '{{relationLabel}}': `${relationLabel} (${p.relationship})`,
          '{{gender}}': p.gender,
          '{{displayName}}': service.getDisplayName(),
          '{{mySajuStr}}': service.getSajuString(p.saju),
          '{{partnerGender}}': p.gender2,
          '{{partnerSajuStr}}': service.getSajuString(p.saju2),
          '{{langPrompt}}': service.langPrompt?.(service.language) || '',
          '{{hanjaPrompt}}': service.hanja?.(service.language) || '',
        };
      },

      buildSaveData: async (result, p, service) => {
        const todayStr = await service.getToday();
        return {
          editCount: firestore.increment(1),
          lastEditDate: todayStr,
          dailyUsage: { [todayStr]: firestore.increment(1) },
          usageHistory: {
            ZMatchAnalysis: {
              result,
              saju: p.saju,
              saju2: p.saju2,
              gender: p.gender,
              gender2: p.gender2,
              relationship: p.relationship,
              language: p.language,
              inputDate: p.inputDate,
              inputDate2: p.inputDate2,
              updatedAt: new Date().toISOString(),
            },
          },
        };
      },
    };
  }

  static newYear(params) {
    const nextYear = new Date().getFullYear() + 1;
    return {
      type: 'newYear',
      params,
      cacheKey: 'ZNewYear',
      loadingType: 'year',
      promptPaths: [
        'prompt/new_year_basic',
        'prompt/default_instruction',
        `prompt/new_year_format_${params.language}`,
      ],

      customValidation: async (p, service) => {
        const hasUsage = await service.checkUsageLimit(); // ⭐️ await 추가
        if (!hasUsage) {
          return false;
        }
        if (!service.userData?.birthDate) {
          alert(service.uiText?.saveFirst?.[service.language] || '생년월일을 먼저 저장해주세요.');
          return false;
        }
        return true;
      },

      validateCache: (cached, p) =>
        String(cached.year) === String(nextYear) &&
        cached.language === p.language &&
        cached.gender === p.gender &&
        SajuAnalysisService.compareSaju(cached.saju, p.saju) &&
        !!cached.result,

      buildPromptVars: (prompts, p, service) => ({
        '{{STRICT_INSTRUCTION}}': prompts['prompt/default_instruction'],
        '{{NEW_YEAR_FORMAT}}': prompts[`prompt/new_year_format_${p.language}`],
        '{{gender}}': p.gender,
        '{{birthDate}}': service.userData?.birthDate || '미입력',
        '{{sajuJson}}': service.getSajuString(p.saju),
        '{{displayName}}': service.getDisplayName(),
        '{{langPrompt}}': service.langPrompt?.(service.language) || '',
        '{{hanjaPrompt}}': service.hanja?.(service.language) || '',
      }),

      buildSaveData: async (result, p, service) => {
        const todayStr = await service.getToday();
        return {

          editCount: firestore.increment(1),
          lastEditDate: todayStr,
          usageHistory: {
            ZNewYear: {
              result,
              year: nextYear,
              saju: p.saju,
              language: p.language,
              gender: p.gender,
              updatedAt: new Date().toISOString(),
            },
          },
          dailyUsage: { [todayStr]: firestore.increment(1) },
        };
      },
    };
  }

  static newYearGuest(params, guestId) {
    return {
      type: 'newYear_guest',
      params,
      isGuestMode: true,
      guestId,
      guestCollection: 'newyearad_logs',
      skipUsageCheck: true,
      promptPaths: ['prompt/new_year_basic', 'prompt/default_instruction'],

      buildPromptVars: (prompts, p, service) => ({
        '{{STRICT_INSTRUCTION}}': prompts['prompt/default_instruction'],
        '{{NEW_YEAR_FORMAT}}':
          '2026년 병오년의 운세를 개략적으로 말해줘. 시작은 <b>태그로 시작해줘. 인사하지 말고 소제목부터. 소제목은 <b>로 감싸주고 질문 형식으로 해줘. 예를 들면 나의 올 한해는? 이렇게  내용은 <p> 내용은 세 문장 정도로.  그렇게 한거를 세개정도 만들어줘.',
        '{{gender}}': p.gender,
        '{{sajuJson}}': service.getSajuString(p.saju),
        '{{displayName}}': service.getDisplayName(),
        '{{langPrompt}}': service.langPrompt?.(service.language) || '',
        '{{hanjaPrompt}}': service.hanja?.(service.language) || '',
      }),

      buildSaveData: async (result, p, service) => {
        const todayStr = await service.getToday();
        return {
          id: guestId,
          date: todayStr,
          user: !!service.user,
          saju: p.saju,
        };
      },
    };
  }

  static daily(params) {
    return {
      type: 'daily',
      params,
      cacheKey: 'ZLastDaily',
      loadingType: 'daily',
      promptPaths: [
        'prompt/daily_basic',
        'prompt/default_instruction',
        `prompt/daily_format_${params.language}`,
      ],

      customValidation: async (p, service) => {
        const hasUsage = await service.checkUsageLimit(); // ⭐️ await 추가
        if (!hasUsage) {
          return false;
        }
        if (!service.userData?.birthDate) {
          alert(service.uiText?.saveFirst?.[service.language] || '생년월일을 먼저 저장해주세요.');
          return false;
        }
        return true;
      },

      validateCache: (cached, p) => {
        // 날짜를 YYYY-MM-DD 스트링으로 변환해서 비교해야 함
        const todayStr = new Date().toLocaleDateString('en-CA');
        const targetDate = p.selectedDate
          ? p.selectedDate instanceof Date
            ? p.selectedDate.toLocaleDateString('en-CA')
            : p.selectedDate
          : todayStr;

        console.log('🔍 캐시 날짜 비교:', cached.date, ' vs ', targetDate);

        return (
          cached.date === targetDate &&
          cached.language === p.language &&
          cached.gender === p.gender &&
          SajuAnalysisService.compareSaju(cached.saju, p.saju) &&
          !!cached.result // 결과가 실제로 들어있는지 확인
        );
      },
      buildPromptVars: (prompts, p, service) => {
        // selectedDate가 있으면 그 날짜 사용, 없으면 오늘
        let today = new Date().toISOString().split('T')[0]
        if (p.selectedDate && p.selectedDate instanceof Date) {
          today = new Date(p.selectedDate);
        }

        const tomorrow = new Date(today);


        const todayPillars = calculateSaju(today);
        const tomorrowPillars = calculateSaju(tomorrow);

        const userSajuText = `${p.saju.sky3}${p.saju.grd3}년 ${p.saju.sky2}${p.saju.grd2}월 ${p.saju.sky1}${p.saju.grd1}일 ${p.saju.sky0}${p.saju.grd0}시`;
        const todaySajuText = `${todayPillars.sky3}${todayPillars.grd3}년 ${todayPillars.sky2}${todayPillars.grd2}월 ${todayPillars.sky1}${todayPillars.grd1}일`;
        const tomorrowSajuText = `${tomorrowPillars.sky3}${tomorrowPillars.grd3}년 ${tomorrowPillars.sky2}${tomorrowPillars.grd2}월 ${tomorrowPillars.sky1}${tomorrowPillars.grd1}일`;

        return {
          '{{STRICT_INSTRUCTION}}': prompts['prompt/default_instruction'],
          '{{DAILY_FORTUNE_PROMPT}}': prompts[`prompt/daily_format_${p.language}`],
          '{{gender}}': p.gender,
          '{{userSajuText}}': userSajuText,
          '{{service.getTodayDate()}}': todayPillars.date,
          '{{todaySajuText}}': todaySajuText,
          '{{tomorrowDate}}': tomorrowPillars.date,
          '{{tomorrowSajuText}}': tomorrowSajuText,
          '{{displayName}}': service.getDisplayName(),
          '{{question}}': p.question || '', // 질문 추가
          '{{langPrompt}}': service.langPrompt?.(service.language) || '',
          '{{hanjaPrompt}}': service.hanja?.(service.language) || '',
        };
      },

      buildSaveData: async (result, p, service) => {
        const todayStr = await service.getToday();
        return {
          editCount: firestore.increment(1),
          lastEditDate: todayStr,
          usageHistory: {
            ZLastDaily: {
              result,
              selectedDate: p.selectedDate || todayStr,
              date: todayStr,
              saju: p.saju,
              language: p.language,
              gender: p.gender,
              question: p.question || '', // 질문 저장
              updatedAt: new Date().toISOString(),
            },
          },
          dailyUsage: { [todayStr]: firestore.increment(1) },
        };
      },
    };
  }
  static dailySpecific(params) {
    return {
      type: 'dailySpecific',
      params,
      cacheKey: 'ZDailySpecific',
      loadingType: 'daily',
      promptPaths: [
        'prompt/daily_s_basic',
        'prompt/default_instruction',
        `prompt/daily_s_${params.language}`,
      ],

      customValidation: async (p, service) => {
        const hasUsage = await service.checkUsageLimit(); // ⭐️ await 추가
        if (!hasUsage) {
          return false;
        }
        if (!service.userData?.birthDate) {
          alert(service.uiText?.saveFirst?.[service.language] || '생년월일을 먼저 저장해주세요.');
          return false;
        }
        return true;
      },

      validateCache: (cached, p) =>

        cached.language === p.language &&
        cached.gender === p.gender &&
        SajuAnalysisService.compareSaju(cached.sajuDate, p.sajuDate) &&
        SajuAnalysisService.compareSaju(cached.saju, p.saju) &&
        !!cached.result,

      buildPromptVars: (prompts, p, service) => {
        // selectedDate가 있으면 그 날짜 사용, 없으면 오늘
        let today = new Date();
        if (p.selectedDate && p.selectedDate instanceof Date) {
          today = new Date(p.selectedDate);
        }

        const additionalPrompt = p.promptAdd;
        const userSajuText = `${p.saju.sky3}${p.saju.grd3}년 ${p.saju.sky2}${p.saju.grd2}월 ${p.saju.sky1}${p.saju.grd1}일 ${p.saju.sky0}${p.saju.grd0}시`;
        const todaySaju = p.sajuDate;
        const todaySajuText = `${todaySaju.sky3}${todaySaju.grd3}년 ${todaySaju.sky2}${todaySaju.grd2}월 ${todaySaju.sky1}${todaySaju.grd1}일 ${todaySaju.sky0}${todaySaju.grd0}시`;

        return {
          '{{STRICT_INSTRUCTION}}': prompts['prompt/default_instruction'],
          '{{DAILY_S_PROMPT}}': prompts[`prompt/daily_s_${p.language}`],
          '{{gender}}': p.gender,
          '{{userSajuText}}': userSajuText,
          '{{todayDate}}': today,
          '{{todaySajuText}}': todaySajuText,
          '{{displayName}}': service.getDisplayName(),
          '{{question}}': p.question || '', // 질문 추가
          '{{langPrompt}}': service.langPrompt?.(service.language) || '',
          '{{hanjaPrompt}}': service.hanja?.(service.language) || '',
          '{{addPrompt}}': additionalPrompt,
        };
      },

      buildSaveData: async (result, p, service) => {
        const todayStr = await service.getToday();

        // 1. 기존 데이터를 유지하기 위해 service에서 넘겨받은 userData를 활용하거나
        // 혹은 단순히 usageHistory 필드를 통째로 정의합니다.
        return {
          editCount: firestore.increment(1),
          lastEditDate: todayStr,
          // 마침표를 쓰지 않고, 계층 구조를 직접 만듭니다.
          usageHistory: {
            [`Z${p.type}`]: {
              result,
              date: p.selectedDate || todayStr,
              saju: p.saju,
              language: p.language,
              gender: p.gender,
              sajuDate: p.sajuDate,
              question: p.question || '',
              updatedAt: new Date().toISOString(),
            },
          },

          dailyUsage: { [todayStr]: firestore.increment(1) },
        };
      },
    };
  }

  static wealth(params) {
    return {
      type: 'wealth',
      params,
      cacheKey: 'ZWealth',
      promptPaths: ['prompt/wealth_basic', 'prompt/wealth_strict'],

      customValidation: async (p, service) => {
        const hasUsage = await service.checkUsageLimit(); // ⭐️ await 추가
        if (!hasUsage) {
          return false;
        }
        if (!service.userData?.birthDate) {
          alert(service.uiText?.saveFirst?.[service.language] || '생년월일을 먼저 저장해주세요.');
          return false;
        }
        return true;
      },

      validateCache: (cached, p) =>
        cached.language === p.language &&
        cached.ques === p.q1 &&
        cached.ques2 === p.q2 &&
        cached.gender === p.gender &&
        SajuAnalysisService.compareSaju(cached.saju, p.saju) &&
        !!cached.result,

      buildPromptVars: (prompts, p, service) => {
        const today = new Date();

        // 연 중순, 월 중순을 기준으로 기운을 가져와서 월운/연운의 경계(절기) 오류 방지
        const midThisYear = new Date(today.getFullYear(), 6, 15); // 7월 15일 (연 중순)
        const midThisMonth = new Date(today.getFullYear(), today.getMonth(), 15); // 이번 달 15일 (월 중순)
        const midNextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 15); // 다음 달 15일 (다음 달 중순)

        const yearP = getPillars(midThisYear);
        const thisMonthP = getPillars(midThisMonth);
        const nextMonthP = getPillars(midNextMonth);

        const thisYearPillar = `${yearP.sky3}${yearP.grd3}`;
        const thisMonthPillar = `${thisMonthP.sky2}${thisMonthP.grd2}`;
        const nextMonthPillar = `${nextMonthP.sky2}${nextMonthP.grd2}`;

        return {
          '{{STRICT_PROMPT}}': prompts['prompt/wealth_strict'],
          '{{qLabel}}': p.q1,
          '{{subQuestion}}': p.q2,
          '{{qPrompt}}': p.qprompt,
          '{{gender}}': p.gender,
          '{{thisYear}}': `${today.getFullYear()}년 (${thisYearPillar}년)`,
          '{{thisMonth}}': `${today.getMonth() + 1}월 (${thisMonthPillar}월)`,
          '{{nextMonth}}': `${midNextMonth.getMonth() + 1}월 (${nextMonthPillar}월)`,
          '{{todayStr}}': today.toLocaleDateString('en-CA'),
          '{{mySajuStr}}': service.getSajuString(p.saju),
          '{{displayName}}': service.getDisplayName(),
          '{{langPrompt}}': service.langPrompt?.(service.language) || '',
        };
      },

      buildSaveData: async (result, p, service, cacheKey = 'ZWealth') => {
        const todayStr = await service.getToday();
        return {
          editCount: firestore.increment(1),
          lastEditDate: todayStr,
          dailyUsage: { [todayStr]: firestore.increment(1) },
          usageHistory: {
            [cacheKey]: {
              result,
              saju: p.saju,
              gender: p.gender,
              ques: p.q1,
              ques2: p.q2,
              language: p.language,
              updatedAt: new Date().toISOString(),
            },
          },
        };
      },
    };
  }

  static selDate(params) {
    return {
      type: 'selDate',
      params,
      cacheKey: 'ZSelDate',
      loadingType: 'main',
      promptPaths: ['prompt/seldate_basic', 'prompt/default_instruction', 'prompt/seldate_format'],

      customValidation: async (p, service) => {
        const hasUsage = await service.checkUsageLimit(); // ⭐️ await 추가
        if (!hasUsage) {
          return false;
        }
        if (!p.purpose) {
          alert('어떤 일을 위한 날짜인지 선택해주세요.');
          return false;
        }
        if (!p.startDate || !p.endDate) {
          alert('시작 날짜와 종료 날짜를 모두 선택해주세요.');
          return false;
        }
        return true;
      },

      validateCache: (cached, p) =>
        cached.startDate === p.startDate &&
        cached.endDate === p.endDate &&
        cached.purpose === p.purpose &&
        cached.language === p.language &&
        cached.gender === p.gender &&
        SajuAnalysisService.compareSaju(cached.saju, p.saju) &&
        !!cached.result,

      buildPromptVars: (prompts, p, service) => {
        console.log('📅 SelDate Params:', p.startDate, p.endDate);
        const calendarData = calculateCalendarRange(p.startDate, p.endDate);
        console.log('📅 Generated Calendar Data Length:', calendarData?.length);

        const dayDiff = Math.ceil((new Date(p.endDate) - new Date(p.startDate)) / (1000 * 60 * 60 * 24));

        // 날짜가 너무 많으면(31일 초과) 달력 데이터를 다 넣지 말고, 중요 팁만 제공하거나 요약
        // 하지만 calculateCalendarRange에서 이미 100일로 제한함.

        const augmentedInstruction = `${prompts['prompt/default_instruction']}
        
        [중요: 실제 만세력 계산 데이터]
        아래는 선택된 기간의 정확한 일진(Day Pillar) 정보입니다. 택일 시 반드시 이 데이터를 참조하여 계산하세요. 없는 날짜를 지어내지 마세요.
        ${calendarData || '(데이터 생성 실패)'}
        ---------------------------------------------
        `;

        return {
          '{{STRICT_INSTRUCTION}}': augmentedInstruction,
          '{{SELDATE_FORMAT}}': prompts['prompt/seldate_format'],
          '{{calendarData}}': calendarData, // 프롬프트에 {{calendarData}} 변수가 있으면 여기에 들어감
          '{{gender}}': p.gender,
          '{{mySajuStr}}': service.getSajuString(p.saju),
          '{{displayName}}': service.getDisplayName(),
          '{{startDate}}': p.startDate,
          '{{endDate}}': p.endDate,
          '{{purpose}}': p.purpose,
          '{{langPrompt}}': service.langPrompt?.(service.language) || '',
          '{{hanjaPrompt}}': service.hanja?.(service.language) || '',
        };
      },

      buildSaveData: async (result, p, service) => {
        const todayStr = await service.getToday();

        // Build cache object, filtering out undefined values
        const cacheData = {
          result,
          startDate: p.startDate,
          endDate: p.endDate,
          purpose: p.purpose,
          saju: p.saju,
          language: p.language,
          gender: p.gender,
          updatedAt: new Date().toISOString(),
        };

        // Only add purposeId if it's defined
        if (p.purposeId !== undefined) {
          cacheData.purposeId = p.purposeId;
        }

        return {
          editCount: firestore.increment(1),
          lastEditDate: todayStr,
          usageHistory: {
            ZSelDate: cacheData,
          },
          dailyUsage: { [todayStr]: firestore.increment(1) },
        };
      },
    };
  }

  static selBirth(params) {
    return {
      type: 'selBirth',
      params,
      cacheKey: 'ZSelBirth',
      loadingType: 'main',
      // selbirth 전용 프롬프트 사용
      promptPaths: ['prompt/selbirth_basic', 'prompt/default_instruction', 'prompt/selbirth_format'],

      customValidation: async (p, service) => {
        const hasUsage = await service.checkUsageLimit(); // ⭐️ await 추가
        if (!hasUsage) {
          return false;
        }
        if (!p.startDate || !p.endDate) {
          alert('날짜 범위가 올바르지 않습니다.');
          return false;
        }
        return true;
      },

      validateCache: (cached, p) => {
        const currentPSaju = p.partnerBirthDate ? calculateSaju(p.partnerBirthDate, p.partnerTimeUnknown) : null;
        return (
          cached.startDate === p.startDate &&
          cached.endDate === p.endDate &&
          cached.language === p.language &&
          cached.gender === p.gender &&
          cached.birthMethod === p.birthMethod &&
          cached.babyGender === p.babyGender &&
          cached.partnerBirthDate === p.partnerBirthDate &&
          SajuAnalysisService.compareSaju(cached.saju, p.saju) &&
          SajuAnalysisService.compareSaju(cached.partnerSaju, currentPSaju) &&
          !!cached.result
        );
      },

      buildPromptVars: (prompts, p, service) => {
        console.log('👶 SelBirth Params:', p.startDate, p.endDate);
        const calendarData = calculateDetailedCalendarRange(p.startDate, p.endDate);

        const birthMethodLabel = p.birthMethod === 'natural'
          ? (service.language === 'ko' ? '자연분만' : 'Natural Birth')
          : (service.language === 'ko' ? '제왕절개' : 'Cesarean Section');

        let partnerSajuInfo = '';
        if (p.partnerBirthDate) {
          const pSaju = calculateSaju(p.partnerBirthDate, p.partnerTimeUnknown);
          if (pSaju) {
            partnerSajuInfo = `\n[배우자(상대 부모) 사주 정보]\n${service.getSajuString(pSaju)}\n`;
          }
        }

        const augmentedInstruction = `${prompts['prompt/default_instruction']}
        
        [중요: 실제 만세력 계산 데이터]
        아래는 선택된 기간의 정확한 일진(Day Pillar) 정보입니다. 출산 택일 시 반드시 이 데이터를 참조하여, 아기의 사주(특히 일주)가 좋게 나오는 날짜를 선정하세요. 
        ${calendarData || '(데이터 생성 실패)'}
        ---------------------------------------------
        [출산 방식: ${birthMethodLabel}]
        ${partnerSajuInfo}
        `;

        return {
          '{{STRICT_INSTRUCTION}}': augmentedInstruction,
          '{{SELBIRTH_FORMAT}}': prompts['prompt/selbirth_format'],
          '{{calendarData}}': calendarData,
          '{{displayName}}': service.getDisplayName(),
          '{{mySajuStr}}': service.getSajuString(p.saju),
          '{{partnerSajuStr}}': partnerSajuInfo,
          '{{userGender}}': p.gender === 'female' ? (service.language === 'ko' ? '여성' : 'Female') : (service.language === 'ko' ? '남성' : 'Male'),
          '{{partnerGender}}': p.gender === 'female' ? (service.language === 'ko' ? '남성' : 'Male') : (service.language === 'ko' ? '여성' : 'Female'),
          '{{startDate}}': p.startDate,
          '{{endDate}}': p.endDate,
          '{{purpose}}': p.purpose,
          '{{birthMethod}}': birthMethodLabel,
          '{{babyGender}}': p.babyGender === 'boy' ? (service.language === 'ko' ? '남아' : 'Boy') : p.babyGender === 'girl' ? (service.language === 'ko' ? '여아' : 'Girl') : (service.language === 'ko' ? '성별모름' : 'Unknown'),
          '{{partnerBirthDate}}': p.partnerBirthDate ? p.partnerBirthDate.split('T')[0] : '',
          '{{partnerTimeUnknown}}': p.partnerTimeUnknown ? 'true' : 'false',
          '{{langPrompt}}': service.langPrompt?.(service.language) || '',
          '{{hanjaPrompt}}': service.hanja?.(service.language) || '',
        };
      },

      buildSaveData: async (result, p, service) => {
        const todayStr = await service.getToday();
        const currentPSaju = p.partnerBirthDate ? calculateSaju(p.partnerBirthDate, p.partnerTimeUnknown) : null;
        return {
          editCount: firestore.increment(1),
          lastEditDate: todayStr,
          usageHistory: {
            ZSelBirth: {
              result,
              saju: p.saju,
              startDate: p.startDate,
              endDate: p.endDate,
              language: p.language,
              gender: p.gender,
              dueDate: p.dueDate,
              birthMethod: p.birthMethod,
              babyGender: p.babyGender,
              partnerBirthDate: p.partnerBirthDate,
              partnerSaju: p.partnerBirthDate ? currentPSaju : null,
              updatedAt: new Date().toISOString(),
            },
          },
          dailyUsage: { [todayStr]: firestore.increment(1) },
        };
      },
    };
  }

  static love(params) {
    return {
      type: 'love',
      params,
      cacheKey: params.cacheKey || 'ZLove', // Each analysis type has its own cache key
      promptPaths: ['prompt/love_basic', 'prompt/love_strict'],

      getNotificationType: (p) => {
        const cacheKeyMap = {
          'ZLoveLifetime': 'loveLifetime',
          'ZLoveMonthly': 'loveMonthly',
          'ZLoveCompatible': 'loveCompatible',
          'ZLoveAvoid': 'loveAvoid',
          'ZLoveReunion': 'loveReunion',
          'ZLoveTiming': 'loveTiming',
          'ZLoveFeelings': 'loveFeelings',
        };
        return cacheKeyMap[params.cacheKey] || 'love';
      },

      getResultPath: (currentPath, p) => {
        // Map cache keys to their result paths
        const cacheKeyMap = {
          'ZLoveLifetime': 'loveLifetime',
          'ZLoveMonthly': 'loveMonthly',
          'ZLoveCompatible': 'loveCompatible',
          'ZLoveAvoid': 'loveAvoid',
          'ZLoveReunion': 'loveReunion',
          'ZLoveTiming': 'loveTiming',
          'ZLoveFeelings': 'loveFeelings',
        };
        // Use the cacheKey from params (passed from the preset)
        const mappedType = cacheKeyMap[params.cacheKey] || 'love';
        console.log('[love.getResultPath] cacheKey:', params.cacheKey, 'mappedType:', mappedType);
        return getResultPath(mappedType, currentPath, p);
      },

      customValidation: async (p, service) => {
        const hasUsage = await service.checkUsageLimit(); // ⭐️ await 추가

        if (!hasUsage) {
          return false;
        }
        if (!service.userData?.birthDate) {
          alert(service.uiText?.saveFirst?.[service.language] || '생년월일을 먼저 저장해주세요.');
          return false;
        }
        // Partner saju is optional - if not provided, analysis will be more general
        return true;
      },

      validateCache: (cached, p) => {
        const basicMatch =
          cached.language === p.language &&
          cached.ques === p.q1 &&
          cached.ques2 === p.q2 &&
          cached.gender === p.gender &&
          SajuAnalysisService.compareSaju(cached.saju, p.saju) &&
          !!cached.result;

        // If partner saju is provided, also validate it
        if (p.partnerSaju) {
          return (
            basicMatch &&
            cached.partnerGender === p.partnerGender &&
            SajuAnalysisService.compareSaju(cached.partnerSaju, p.partnerSaju)
          );
        }

        // If no partner saju in current request, cache is valid only if it also had no partner
        return basicMatch && !cached.partnerSaju;
      },

      buildPromptVars: (prompts, p, service) => {
        const today = new Date();
        const midThisMonth = new Date(today.getFullYear(), today.getMonth(), 15);
        const thisMonthP = getPillars(midThisMonth);
        const thisMonthPillar = `${thisMonthP.sky2}${thisMonthP.grd2}`;

        const vars = {
          '{{BASIC_PROMPT}}': prompts['prompt/default_instruction'] || '',
          '{{STRICT_PROMPT}}': prompts['prompt/love_strict'] || '',
          '{{qLabel}}': p.q1,
          '{{subQuestion}}': p.q2,
          '{{qPrompt}}': p.qprompt,
          '{{gender}}': p.gender,
          '{{thisMonth}}': `${today.getMonth() + 1}월 (${thisMonthPillar}월)`,
          '{{todayStr}}': today.toLocaleDateString('en-CA'),
          '{{mySajuStr}}': service.getSajuString(p.saju),
          '{{displayName}}': service.getDisplayName(),
          '{{langPrompt}}': service.langPrompt?.(service.language) || '',
        };

        // Add partner saju if provided
        if (p.partnerSaju) {
          vars['{{partnerSajuStr}}'] = service.getSajuString(p.partnerSaju);
          vars['{{partnerGender}}'] = p.partnerGender || '알 수 없음';
          vars['{{hasPartner}}'] = 'true';
        } else {
          vars['{{partnerSajuStr}}'] = '';
          vars['{{partnerGender}}'] = '';
          vars['{{hasPartner}}'] = 'false';
        }

        return vars;
      },

      buildSaveData: async (result, p, service, cacheKey) => {
        const todayStr = await service.getToday();
        // Use the cacheKey passed from params (e.g., ZLoveLifetime, ZLoveMonthly, etc.)
        const finalCacheKey = cacheKey || p.cacheKey || 'ZLove';

        const saveData = {
          editCount: firestore.increment(1),
          lastEditDate: todayStr,
          dailyUsage: { [todayStr]: firestore.increment(1) },
          usageHistory: {
            [finalCacheKey]: {
              result,
              saju: p.saju,
              gender: p.gender,
              ques: p.q1,
              ques2: p.q2,
              language: p.language,
              updatedAt: new Date().toISOString(),
            },
          },
        };

        // Save partner saju if provided
        if (p.partnerSaju) {
          saveData.usageHistory[finalCacheKey].partnerSaju = p.partnerSaju;
          saveData.usageHistory[finalCacheKey].partnerGender = p.partnerGender;
        }

        return saveData;
      },
    };
  }
}

export { SajuAnalysisService, AnalysisPresets };
