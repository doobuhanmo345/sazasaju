'use client';

import * as firestore from 'firebase/firestore';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { fetchGeminiAnalysis } from '@/lib/gemini';
import { DateService } from '@/utils/dateService';

const getResultPath = (type) => {
  const pathMap = {
    'tarotDaily': '/tarot/tarotdaily/result',
    'tarotLove': '/tarot/tarotlove/result',
    'tarotMoney': '/tarot/tarotmoney/result',
    'tarotCounseling': '/tarot/tarotcounseling/result',
    'saza': '/saju/sazatalk/result',
  };
  return pathMap[type] || '/tarot';
};

class TarotAnalysisService {
  constructor(context) {
    this.user = context.user;
    this.userData = context.userData;
    this.language = context.language;
    this.maxEditCount = context.maxEditCount;
    this.uiText = context.uiText;
    this.analysisMode = context.analysisMode || (typeof window !== 'undefined' ? localStorage.getItem('saza_analysis_mode') : 'direct') || 'direct';

    this.setEditCount = context.setEditCount;
    this.setLoading = context.setLoading;
    this.setLoadingType = context.setLoadingType;
    this.setAiResult = context.setAiResult;
    this.onStart = context.onStart;
    this.setStatusText = context.setStatusText;
  }

  /**
   * 백그라운드 분석 (Queue 방식)
   * - analysis_queue 컬렉션에 문서 생성
   * - Cloud Function이 자동으로 처리
   * - onSnapshot으로 결과 대기
   */
  async analyzeInBackground(prompt, userId, targetPath, analysisTitle = null, analysisType = null, params = null, cacheKey = null) {
    return new Promise(async (resolve, reject) => {
      const TIMEOUT_MS = 10 * 60 * 1000; // 10분
      let unsubscribe = null;
      let timeoutId = null;

      try {
        console.log('[Tarot analyzeInBackground] Creating queue document...');

        // 1. Queue에 문서 생성
        const queueRef = await addDoc(collection(db, 'analysis_queue'), {
          userId: userId,
          prompt: prompt,
          targetPath: targetPath,
          analysisTitle: analysisTitle,
          analysisType: analysisType,
          params: params ? JSON.parse(JSON.stringify(params)) : null,
          cacheKey,
          status: 'pending',
          createdAt: serverTimestamp(),
        });

        console.log('[Tarot analyzeInBackground] Queue document created:', queueRef.id);

        // [NEW] Event-based cancellation listener
        const onGlobalCancel = () => {
          console.log('[Tarot analyzeInBackground] Cancellation triggered by global event');
          if (unsubscribe) unsubscribe();
          if (timeoutId) clearTimeout(timeoutId);
          // Set isAnalyzing to false in users collection to release lock
          if (userId) {
            firestore
              .updateDoc(firestore.doc(db, 'users', userId), {
                isAnalyzing: false,
                analysisStartedAt: null,
                updatedAt: serverTimestamp()
              })
              .catch(console.error);
          }
          reject(new Error('CANCELLED'));
        };

        if (typeof window !== 'undefined') {
          window.addEventListener('sazasaju-analysis-cancel', onGlobalCancel, { once: true });
        }

        // 3. 실시간 감시
        unsubscribe = firestore.onSnapshot(
          firestore.doc(db, 'analysis_queue', queueRef.id),
          (docSnap) => {
            if (!docSnap.exists()) {
              // Document might have been deleted (e.g. by AppBanner handleCancel)
              onGlobalCancel();
              return;
            }

            const data = docSnap.data();
            console.log('[Tarot analyzeInBackground] Status update:', data.status);

            if (data.status === 'completed') {
              console.log('[Tarot analyzeInBackground] Analysis completed successfully');
              if (timeoutId) clearTimeout(timeoutId);
              if (unsubscribe) unsubscribe();
              if (typeof window !== 'undefined') {
                window.removeEventListener('sazasaju-analysis-cancel', onGlobalCancel);
              }
              resolve(data.result || data.airesult);
            } else if (data.status === 'error' || data.status === 'failed') {
              console.error('[Tarot analyzeInBackground] Analysis failed:', data.error);
              if (timeoutId) clearTimeout(timeoutId);
              if (unsubscribe) unsubscribe();
              if (typeof window !== 'undefined') {
                window.removeEventListener('sazasaju-analysis-cancel', onGlobalCancel);
              }
              reject(new Error(data.error || 'Background analysis failed'));
            }
          },
          (error) => {
            console.error('[Tarot analyzeInBackground] Snapshot error:', error);
            if (timeoutId) clearTimeout(timeoutId);
            if (unsubscribe) unsubscribe();
            if (typeof window !== 'undefined') {
              window.removeEventListener('sazasaju-analysis-cancel', onGlobalCancel);
            }
            reject(error);
          }
        );

        // [NEW] 타임아웃 설정
        timeoutId = setTimeout(() => {
          console.error('[Tarot analyzeInBackground] Operation timed out after 10 minutes');
          if (unsubscribe) unsubscribe();
          if (typeof window !== 'undefined') {
            window.removeEventListener('sazasaju-analysis-cancel', onGlobalCancel);
          }
          if (userId) {
            firestore
              .updateDoc(firestore.doc(db, 'users', userId), { isAnalyzing: false })
              .catch(console.error);
          }
          reject(new Error('TIMEOUT'));
        }, TIMEOUT_MS);
      } catch (error) {
        console.error('[Tarot analyzeInBackground] Error:', error);
        if (timeoutId) clearTimeout(timeoutId);
        if (unsubscribe) unsubscribe();
        reject(error);
      }
    });
  }

  async analyze(config) {
    const {
      type,
      params,
      promptBuilder,
      saveDataBuilder,
      loadingType = 'tarot',
    } = config;

    if (!this.user) {
      alert(this.uiText?.loginReq?.[this.language] || 'Please login');
      return null;
    }

    const currentCount = this.userData?.editCount || 0;
    const currentCredits = this.userData?.credits || 0;
    let useCredit = false;

    // [MODIFIED] Usage Logic: Free Tier (editCount) -> Paid Tier (credits)
    if (currentCount >= this.maxEditCount) {
      if (currentCredits > 0) {
        useCredit = true;
        console.log(`💳 Daily limit reached (${currentCount}/${this.maxEditCount}). Using Credit (Remaining: ${currentCredits})`);
      } else {
        const msg = this.language === 'ko'
          ? '오늘의 무료 분석 횟수를 모두 소진했습니다.\n크레딧을 충전하여 계속 이용해보세요!'
          : 'Daily free limit reached. Please recharge credits to continue.';
        if (confirm(msg)) {
          window.location.href = '/credit/';
        }
        return null;
      }
    } else {
      console.log(`🆓 Using Free Tier (${currentCount}/${this.maxEditCount})`);
    }

    this.setLoading?.(true);
    this.setStatusText?.(this.language === 'ko' ? '타로 분석 준비 중...' : 'Preparing Tarot analysis...');
    this.setLoadingType?.(loadingType);

    // [NEW] Global Lock: Set isAnalyzing to true
    if (this.user) {
      try {
        await firestore.updateDoc(firestore.doc(db, 'users', this.user.uid), {
          isAnalyzing: true,
          analysisStartedAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      } catch (e) { console.error('[Tarot] Failed to set lock:', e); }
    }

    try {
      const fullPrompt = promptBuilder(params, this);

      // API 호출 - 스마트 라우팅 (앱 상태에 따라 직접/백그라운드 선택)
      console.time('TarotGeminiCall');
      let result;

      const useBackground = (this.user && this.analysisMode === 'background') ||
        config.forceBackground ||
        (typeof document !== 'undefined' && document.visibilityState !== 'visible');

      let isBackgroundResult = false;
      if (useBackground && this.user) {
        console.log(`🔄 Using background analysis (Mode: ${this.analysisMode}, forced: ${!!config.forceBackground})`);
        try {
          const targetPath = getResultPath(type);
          const labels = {
            'ko': {
              'tarotDaily': '오늘의 타로',
              'tarotLove': '연애 타로',
              'tarotMoney': '금전 타로',
              'tarotCounseling': '타로 상담'
            },
            'en': {
              'tarotDaily': "Today's Tarot",
              'tarotLove': 'Love Tarot',
              'tarotMoney': 'Money Tarot',
              'tarotCounseling': 'Tarot Counseling'
            }
          };
          const analysisTitle = labels[this.language || 'ko']?.[type] ||
            (this.language === 'ko' ? '타로 분석' : 'Tarot Analysis');

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
          console.log('[TarotAnalysisService] Direct analysis ignored via global event');
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

      console.timeEnd('TarotGeminiCall');
      this.setStatusText?.(this.language === 'ko' ? '결과 정리 중...' : 'Finalizing result...');

      const todayDate = await DateService.getTodayDate();

      // DB 저장 (백엔드에서 이미 저장했으면 클라이언트는 생략하여 중복 차감 및 중복 데이터 방지)
      if (saveDataBuilder && !isBackgroundResult) {
        const saveData = saveDataBuilder(result, params, todayDate, this);

        // [MODIFIED] Apply Usage Logic (Free vs Credit)
        if (useCredit) {
          // Paid Tier: Remove editCount increment, Deduct Credit
          delete saveData.editCount;
          saveData.credits = firestore.increment(-1);
          // Note: dailyUsage/usageHistory will still record the analysis.
        }

        await firestore.setDoc(
          firestore.doc(db, 'users', this.user.uid),
          saveData,
          { merge: true }
        );

        // Optimistic Update
        if (!useCredit) {
          this.setEditCount?.((prev) => prev + 1);
        }


        // [NEW] Notification: Create Alarm in NotificationList
        if (this.user) {
          try {
            const labels = {
              ko: {
                tarotDaily: '오늘의 타로',
                tarotLove: '연애 타로',
                tarotMoney: '금전 타로',
                tarotCounseling: '타로 상담'
              },
              en: {
                tarotDaily: "Today's Tarot",
                tarotLove: 'Love Tarot',
                tarotMoney: 'Money Tarot',
                tarotCounseling: 'Tarot Counseling'
              }
            };

            const typeLabel = labels[this.language || 'ko']?.[type] ||
              (this.language === 'ko' ? '타로 분석' : 'Tarot analysis');

            const notifMsg = this.language === 'ko'
              ? `${typeLabel}이 완료되었습니다.`
              : `${typeLabel} completed.`;

            await addDoc(collection(db, 'notifications'), {
              userId: this.user.uid,
              type: 'analysis',
              message: notifMsg,
              isRead: false,
              createdAt: serverTimestamp(),
              targetPath: getResultPath(type)
            });
          } catch (notifErr) {
            console.error('Notification creation failed:', notifErr);
          }
        }
      }

      this.setAiResult?.(result);
      if (this.onStart) this.onStart();

      return result;
    } catch (error) {
      console.error(`Tarot Analysis (${type}) Failed:`, error);
      alert(error.message || 'Analysis failed');
      throw error;
    } finally {
      this.setLoading?.(false);
      this.setStatusText?.('');

      // [NEW] Release global lock
      if (this.user) {
        try {
          await firestore.updateDoc(firestore.doc(db, 'users', this.user.uid), {
            isAnalyzing: false,
            analysisStartedAt: null,
            updatedAt: serverTimestamp()
          });
        } catch (e) { console.error('[Tarot] Failed to release lock:', e); }
      }
    }
  }
}

export class TarotPresets {
  static daily(params) {
    return {
      type: 'tarotDaily',
      params,
      loadingType: 'tarot',
      promptBuilder: (p, service) => `
당신은 통찰력 있는 삶의 가이드를 제시하는 타로 마스터입니다. 
사용자의 하루를 조망하는 정밀 타로 리포트를 반드시 아래의 **JSON 구조**로만 응답하세요.

### [데이터]
- 카드: ${p.pickedCard.kor} (${p.pickedCard.name})
- 키워드: ${p.pickedCard.keyword}

### [JSON 구조 (필수)]
{
  "title": "${service.language === 'ko' ? '오늘의 운세' : 'Tarot Luck of the day'}",
  "subTitle": "오늘 당신의 삶을 채울 에너지 흐름",
  "cardName": "${p.pickedCard.kor} (${p.pickedCard.name})",
  "tags": ["#오늘의에너지", "#행운의흐름", "#타로가이드"],
  "description": "이 카드(${p.pickedCard.kor})가 오늘 당신의 삶에 가져올 본질적인 에너지와 그 의미를 상세히 설명하세요.",
  "analysisTitle": "상황별 운세 흐름 (General Fortune)",
  "analysisList": [
    "대인관계: 주위 사람들과의 관계 및 소통의 흐름",
    "업무 및 학업: 추진 중인 일이나 공부에서의 성과와 주의점",
    "심리적 상태: 오늘 하루 유지하면 좋을 마음가짐"
  ],
  "adviceTitle": "오늘을 위한 조언 (Action Plan)",
  "adviceList": [
    "오늘 실천하면 좋은 구체적인 행동 지침 1",
    "오늘 실천하면 좋은 구체적인 행동 지침 2",
    "오늘 실천하면 좋은 구체적인 행동 지침 3"
  ],
  "footerTags": ["#긍정", "#행운", "#조화", "#성장", "#타이밍"]
}

### [절대 규칙]
1. 마크다운(\`\`\`) 없이 순수 JSON 텍스트만 출력할 것.
2. 한자(Hanja) 사용 금지.
3. 답변 언어: ${service.language === 'ko' ? '한국어' : 'English'}. (JSON 키값은 영문 유지)
4. 어조: 차분하고 신비로우면서도 명확한 가이드를 주는 어조 유지.
`,
      saveDataBuilder: (result, p, todayDate) => ({
        editCount: firestore.increment(1),
        lastEditDate: todayDate,
        dailyUsage: { [todayDate]: firestore.increment(1) },
        usageHistory: {
          tarotDaily: {
            [todayDate]: firestore.increment(1),
            result: result,
          }
        },
      }),
    };
  }

  static love(params) {
    return {
      type: 'tarotLove',
      params,
      loadingType: 'tarot_love',
      promptBuilder: (p, service) => `
당신은 연애 심리 전문 타로 마스터입니다. 
상황(${p.typeLabel})에 따른 정밀 연애 타로 리포트를 작성하세요.
반드시 아래의 **JSON 구조**로만 응답하세요.

### [데이터]
- 연애 상황: ${p.typeLabel} 
- 카드: ${p.pickedCard.kor} (${p.pickedCard.name})
- 키워드: ${p.pickedCard.keyword}

### [JSON 구조 (필수)]
{
  "title": "${service.language === 'ko' ? '연애운 분석' : 'Tarot Love'}-${p.typeLabel}",
  "subTitle": "${p.typeLabel + ' 상황 분석'}",
  "cardName": "${p.pickedCard.kor} (${p.pickedCard.name})",
  "tags": ["#연애운", "#상대방속마음", "#인연"],
  "description": "선택된 카드(${p.pickedCard.kor})가 이번 연애운에서 가지는 본질적 의미와 상징적 해석을 상세히 설명하세요.",
  "analysisTitle": "${p.typeLabel} 맞춤 상황 분석",
  "analysisList": [
    "상대방의 현재 심리나 두 사람 사이의 에너지 분석",
    "현재 상황에서 가장 큰 영향을 미치고 있는 핵심 요소",
    "조만간 나타날 연애 흐름의 결정적 변화"
  ],
  "adviceTitle": "연애 성공을 위한 실천 지침",
  "adviceList": [
    "관계를 발전시키기 위한 구체적 행동 1",
    "관계를 발전시키기 위한 구체적 행동 2",
    "관계를 발전시키기 위한 구체적 행동 3"
  ],
  "footerTags": ["#행운의타이밍", "#확신", "#설렘", "#소통", "#인연"]
}

### [규칙]
1. 마크다운(\`\`\`) 없이 순수 JSON 텍스트만 출력.
2. 한자 사용 금지, 연애 심리에 특화된 따뜻한 어조 유지.
3. 답변 언어: ${service.language === 'ko' ? '한국어' : 'English'}.
`,
      saveDataBuilder: (result, p, todayDate) => ({
        editCount: firestore.increment(1),
        lastEditDate: todayDate,
        dailyUsage: { [todayDate]: firestore.increment(1) },
        usageHistory: {
          tarotLove: {
            result: result,
            [todayDate]: { [p.typeLabel]: firestore.increment(1) }
          }
        },
      }),
    };
  }

  static money(params) {
    return {
      type: 'tarotMoney',
      params,
      loadingType: 'tarot_money',
      promptBuilder: (p, service) => `
당신은 자산 관리 및 비즈니스 전문 타로 마스터입니다. 
제공된 데이터를 바탕으로 경제적 통찰력이 담긴 정밀 재무 리포트를 작성하세요.
반드시 아래의 **JSON 구조**로만 응답해야 합니다.

### [데이터]
- 분야: ${p.categoryLabel}
- 카드: ${p.pickedCard.kor} (${p.pickedCard.name})
- 키워드: ${p.pickedCard.keyword}

### [JSON 구조 (필수)]
{
  "title": "${service.language === 'ko' ? '타로 금전운 리포트' : 'Financial Tarot Report'} - ${p.categoryLabel}",
  "subTitle": "${p.categoryLabel} 분야 자금 흐름 분석",
  "cardName": "${p.pickedCard.kor} (${p.pickedCard.name})",
  "tags": ["#자금흐름", "#재무기회", "#리스크관리"],
  "description": "이 카드가 암시하는 현재의 자금 흐름과 경제적 상황에 대한 본질적 의미를 분석하세요.",
  "analysisTitle": "${p.categoryLabel} 맞춤 재무 전망",
  "analysisList": [
    "현재 분야(${p.categoryLabel})에서의 구체적인 재무 상황 진단",
    "투자/지출/수입 등 타이밍에 대한 냉철한 분석",
    "가장 주의해야 할 경제적 변수와 대응 방향"
  ],
  "adviceTitle": "자산 관리 전략 (Action Plan)",
  "adviceList": [
    "당장 실천해야 할 구체적인 경제적 행동 지침 1",
    "당장 실천해야 할 구체적인 경제적 행동 지침 2",
    "당장 실천해야 할 구체적인 경제적 행동 지침 3"
  ],
  "footerTags": ["#수익창출", "#지출통제", "#자산증식", "#재테크", "#안정권"]
}

### [절대 규칙]
1. 마크다운(\`\`\`) 없이 순수 JSON 텍스트만 출력할 것.
2. 한자(Hanja) 사용 금지.
3. 답변 언어: ${service.language === 'ko' ? '한국어' : 'English'}. (JSON 키값은 영문 유지)
4. 어조: 냉철하고 전문적인 자산 관리사의 어조를 유지하면서도 희망적인 포인트를 짚어줄 것.
`,
      saveDataBuilder: (result, p, todayDate) => ({
        editCount: firestore.increment(1),
        lastEditDate: todayDate,
        dailyUsage: { [todayDate]: firestore.increment(1) },
        usageHistory: {
          tarotMoney: {
            result: result,
            [todayDate]: { [p.categoryLabel]: firestore.increment(1) }

          }
        },
      }),
    };
  }

  static counseling(params) {
    return {
      type: 'tarotCounseling',
      params,
      loadingType: 'tarot_counseling',
      promptBuilder: (p, service) => `
당신은 공감 능력이 뛰어난 심리 상담가이자 타로 마스터입니다. 
다음 데이터를 바탕으로 사용자의 마음을 어루만지는 심리 리포트를 작성하세요.
반드시 아래의 **JSON 구조**로만 응답하세요.

### [데이터]
- 고민내용: ${p.userQuestion}
- 카드: ${p.pickedCard.kor} (${p.pickedCard.name})
- 키워드: ${p.pickedCard.keyword}

### [JSON 구조 (필수)]
{
  "title": "${service.language === 'ko' ? '마음 상담 리포트' : 'Psychological Report'}",
  "subTitle": "${p.userQuestion}",
  "cardName": "${p.pickedCard.kor} (${p.pickedCard.name})",
  "tags": ["#힐링", "#공감", "#마음챙김"],
  "description": "선택된 카드(${p.pickedCard.kor})가 현재 사용자의 내면 상태에 대해 들려주는 따뜻한 메시지를 작성하세요.",
  "analysisTitle": "현재 상황 분석 (Deep Counseling)",
  "analysisList": [
    "사용자의 고민 상황에 깊이 공감하는 내용",
    "카드의 상징을 통해 본 현재 심리적 어려움 분석",
    "변화를 위해 내면에서 찾아야 할 긍정적인 통찰"
  ],
  "adviceTitle": "마음을 위한 실천 지침 (Healing Plan)",
  "adviceList": [
    "오늘 바로 실천할 수 있는 마음 회복 행동 1",
    "오늘 바로 실천할 수 있는 마음 회복 행동 2",
    "오늘 바로 실천할 수 있는 마음 회복 행동 3"
  ],
  "footerTags": ["#자존감", "#회복", "#안정", "#위로", "#희망"]
}

### [규칙]
1. 마크다운(\`\`\`) 없이 순수 JSON 텍스트만 출력.
2. 한자 사용 금지, 어조는 매우 다정하고 전문적이어야 함.
3. 답변 언어: ${service.language === 'ko' ? '한국어' : 'English'}.
`,
      saveDataBuilder: (result, p, todayDate) => ({
        editCount: firestore.increment(1),
        lastEditDate: todayDate,
        dailyUsage: { [todayDate]: firestore.increment(1) },
        usageHistory: {
          tarotCounseling: {
            [todayDate]: { [p.userQuestion]: firestore.increment(1) },
            result: result,
          }
        },
      }),
    };
  }
}

export default TarotAnalysisService;
