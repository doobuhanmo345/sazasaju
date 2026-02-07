'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import AnalysisStepContainer from '@/components/AnalysisStepContainer';
import { useAuthContext } from '@/contexts/useAuthContext';
import { useUsageLimit } from '@/contexts/useUsageLimit';
import { useLoading } from '@/contexts/useLoadingContext';
import { UI_TEXT } from '@/data/constants';
import { useLanguage } from '@/contexts/useLanguageContext';
import { langPrompt, hanja } from '@/data/constants';
import LoadingFourPillar from '@/components/LoadingFourPillar';
import { SajuAnalysisService, AnalysisPresets } from '@/lib/SajuAnalysisService';
import { useRouter } from 'next/navigation';
import DateInput from '@/ui/DateInput';
import SelDateAppeal from '@/app/saju/seldate/SelDateAppeal';
import SelDatePreview from '@/app/saju/seldate/SelDatePreview';
import AnalyzeButton from '@/ui/AnalyzeButton';
import ToTopButton from '@/ui/ToTopButton';
import { ExclamationTriangleIcon } from '@heroicons/react/24/solid';

const PURPOSE_OPTIONS = [
  { id: 'moving', ko: '이사', en: 'Moving' },
  { id: 'wedding', ko: '결혼', en: 'Wedding' },
  { id: 'opening', ko: '개업', en: 'Business Opening' },
  { id: 'travel', ko: '여행', en: 'Travel' },
  { id: 'contract', ko: '계약', en: 'Contract' },
  { id: 'surgery', ko: '수술/시술', en: 'Surgery/Procedure' },
  { id: 'meeting', ko: '중요한 미팅', en: 'Important Meeting' },
  { id: 'other', ko: '기타 중요한 일', en: 'Other Important Event' },
];

export default function SelDatePage() {
  const { setLoadingType, setAiResult, aiResult } = useLoading(); // aiResult added
  const [loading, setLoading] = useState(false);
  const { userData, user, selectedProfile } = useAuthContext();
  const router = useRouter();
  // 컨텍스트 스위칭
  const targetProfile = selectedProfile || userData;
  const { birthDate: inputDate, isTimeUnknown, gender, saju } = targetProfile || {};
  //컨텍스트 스위칭 끝
  const { language } = useLanguage();
  const { setEditCount, MAX_EDIT_COUNT, isLocked } = useUsageLimit();

  // Client-side Title Update for Localization (Static Export Support)
  useEffect(() => {
    if (language === 'ko') {
      document.title = '좋은 날 택일 분석 | 성공을 위한 완벽한 타이밍';
    } else {
      document.title = 'Auspicious Date Selection | Perfect Timing for Success';
    }
    // [FIX] 페이지 진입 시 이전 결과 초기화 (Auto Redirect 방지)
    setAiResult('');
  }, [language, setAiResult]);

  const [selectedPurpose, setSelectedPurpose] = useState('');
  const [startDate, setStartDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => {
    const today = new Date();
    const nextMonth = new Date(today);
    nextMonth.setDate(today.getDate() + 30);
    return nextMonth.toISOString().split('T')[0];
  });

  // maxDate Logic restored
  const maxDate = useMemo(() => {
    const start = new Date(startDate);
    const max = new Date(start);
    max.setDate(start.getDate() + 100);
    return max.toISOString().split('T')[0];
  }, [startDate]);

  // [NEW] Strict Analysis Check (Matching SajuAnalysisService.validateCache)
  const prevData = userData?.usageHistory?.ZSelDate;
  const isAnalysisDone = useMemo(() => {
    if (!prevData || !prevData.result) return false;

    const purposeLabel = PURPOSE_OPTIONS.find(p => p.id === selectedPurpose);
    const currentPurposeText = language === 'ko' ? purposeLabel?.ko : purposeLabel?.en;

    // Check all fields consistent with validateCache
    const isSame =
      prevData.startDate === startDate &&
      prevData.endDate === endDate &&
      prevData.purpose === currentPurposeText && // Check Text (since service uses text)
      prevData.language === language &&
      prevData.gender === gender &&
      SajuAnalysisService.compareSaju(prevData.saju, saju);

    return isSame;
  }, [prevData, startDate, endDate, selectedPurpose, language, gender, saju]);
  const [isButtonClicked, setIsButtonClicked] = useState(false);
  const isDisabled = !isAnalysisDone && isLocked;

  const handleQuickSelect = (amount, unit = 'months') => {
    const start = new Date(startDate);
    const end = new Date(start);

    if (unit === 'weeks') {
      end.setDate(start.getDate() + (amount * 7));
    } else {
      end.setMonth(start.getMonth() + amount);
    }

    setEndDate(end.toISOString().split('T')[0]);
  };

  const service = useMemo(
    () =>
      new SajuAnalysisService({
        user,
        userData: targetProfile,
        language,
        maxEditCount: MAX_EDIT_COUNT,
        uiText: UI_TEXT,
        langPrompt,
        hanja,
        setEditCount,
        setLoading,
        setAiResult,
      }),
    [user, userData, language, MAX_EDIT_COUNT, setEditCount, setLoading, setAiResult],
  );

  const handleStartClick = useCallback(
    async (onStart) => {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const diffTime = end - start;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays > 100) {
        alert(language === 'ko' ? '기간은 최대 100일까지 선택 가능합니다.' : 'Date range cannot exceed 100 days.');
        return;
      }

      const purposeLabel = PURPOSE_OPTIONS.find(p => p.id === selectedPurpose);
      const purposeText = language === 'ko' ? purposeLabel?.ko : purposeLabel?.en;

      // [UX FIX] 로딩 화면 먼저 진입
      onStart();
      setIsButtonClicked(true)

      // [NEW] 이미 저장된 데이터와 입력값이 같으면 잠시 대기 후 결과 페이지로 이동
      if (isAnalysisDone) {
        console.log('✅ 이미 분석된 데이터(옵션 일치)가 있어 결과 페이지로 이동합니다.');
        setTimeout(() => {
          router.push('/saju/seldate/result');
        }, 2000);
        return;
      }

      setAiResult('');
      try {
        await service.analyze(
          AnalysisPresets.selDate({
            saju,
            gender,
            language,
            startDate,
            endDate,
            purpose: purposeText,
          }),
        );
        // 콜백 제거 -> useEffect에서 처리
      } catch (error) {
        console.error(error);
      }
    },
    [service, saju, gender, language, startDate, endDate, selectedPurpose, setAiResult, isAnalysisDone, router],
  );
  console.log(prevData)
  const selectionSection = useCallback(() => {
    return (
      <div className="w-full mx-auto py-8">
        <div className="mb-10">
          <header className="mb-6 px-1">
            <div className="flex items-baseline gap-3">
              <h2 className="text-xl font-light text-slate-900 dark:text-white tracking-tight">
                <span className="font-bold">01.</span>
                <span className="ml-3 italic font-serif text-emerald-600/80">
                  {language === 'ko' ? '목적 선택' : 'Select Purpose'}
                </span>
              </h2>
            </div>
            <p className="mt-4 text-sm text-slate-400 dark:text-slate-500 font-bold uppercase tracking-[0.2em]">
              {language === 'ko' ? '어떤 중요한 일을 앞두고 계신가요?' : 'What is the occasion?'}
            </p>
          </header>

          <div className="grid grid-cols-2 gap-3">
            {PURPOSE_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                onClick={() => setSelectedPurpose(opt.id)}
                className={`
                  px-4 py-3 text-sm font-medium rounded-lg transition-all duration-300
                  ${selectedPurpose === opt.id
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-md ring-2 ring-emerald-200 dark:ring-emerald-900'
                    : 'bg-white dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700 hover:border-slate-400'
                  }
                `}
              >
                {language === 'ko' ? opt.ko : opt.en}
              </button>
            ))}
          </div>
        </div>

        {selectedPurpose && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <header className="mb-6 px-1">
              <div className="flex items-baseline gap-3">
                <h2 className="text-xl font-light text-slate-900 dark:text-white tracking-tight">
                  <span className="font-bold">02.</span>
                  <span className="ml-3 italic font-serif text-emerald-600/80">
                    {language === 'ko' ? '기간 선택' : 'Date Range'}
                  </span>
                </h2>
              </div>
              <p className="mt-4 text-sm text-slate-400 dark:text-slate-500 font-bold uppercase tracking-[0.2em]">
                {language === 'ko' ? '언제가 좋을지 알아볼까요? (최대 100일)' : 'When are you planning? (Max 100 days)'}
              </p>
            </header>

            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm space-y-6">
              <div className="flex flex-col gap-4">
                <DateInput
                  label="START DATE"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full"
                  language={language}
                  color="emerald"
                />
                <DateInput
                  label="END DATE"
                  value={endDate}
                  min={startDate}
                  max={maxDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full"
                  language={language}
                  color="emerald"
                />
              </div>

              <div className="flex flex-wrap gap-2 justify-center">
                <button
                  onClick={() => handleQuickSelect(2, 'weeks')}
                  className="px-3 py-1.5 text-xs font-medium text-slate-500 bg-slate-50 hover:bg-slate-100 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600 rounded-full border border-slate-200 dark:border-slate-600 transition-colors"
                >
                  +2 {language === 'ko' ? '주' : 'Weeks'}
                </button>
                <button
                  onClick={() => handleQuickSelect(1, 'months')}
                  className="px-3 py-1.5 text-xs font-medium text-slate-500 bg-slate-50 hover:bg-slate-100 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600 rounded-full border border-slate-200 dark:border-slate-600 transition-colors"
                >
                  +1 {language === 'ko' ? '달' : 'Month'}
                </button>
                <button
                  onClick={() => handleQuickSelect(2, 'months')}
                  className="px-3 py-1.5 text-xs font-medium text-slate-500 bg-slate-50 hover:bg-slate-100 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600 rounded-full border border-slate-200 dark:border-slate-600 transition-colors"
                >
                  +2 {language === 'ko' ? '달' : 'Months'}
                </button>
              </div>
            </div>
            <p className="text-center mt-3 text-xs text-emerald-600/80 italic">
              * {language === 'ko' ? '선택하신 기간 중에서 가장 좋은 날짜들을 뽑아드립니다' : 'Finding the best dates within this period'}
            </p>
          </div>
        )}
      </div>
    );
  }, [language, selectedPurpose, startDate, endDate, maxDate]);

  const sajuGuide = useCallback(
    (onStart) => {
      if (loading) {
        return <LoadingFourPillar saju={saju} isTimeUnknown={isTimeUnknown} />;
      }
      return (
        <div className="mx-auto px-6 py-12 animate-in fade-in slide-in-from-bottom-3 duration-1000">
          <div className="max-w-lg mx-auto">
            <header className="text-right mb-12">
              <div className="inline-block px-2 py-1 mb-4 bg-slate-50 dark:bg-slate-800 rounded text-[10px] font-black tracking-[0.2em] text-slate-400 dark:text-slate-500 uppercase">
                Auspicious Day
              </div>
              <h2 className="text-4xl font-light text-slate-900 dark:text-white leading-[1.1] tracking-tight">
                {language === 'ko' ? '찾아 드리는' : 'Finding your'} <br />
                <span className="font-serif italic font-medium text-emerald-600/80">
                  {language === 'ko' ? '최고의 날' : 'Best Days'}
                </span>
              </h2>
              <p className="mt-6 text-[13px] text-slate-400 dark:text-slate-500 leading-relaxed w-full">
                {language === 'ko' ? (
                  <>
                    중요한 시작을 앞두고 계신가요?<br />
                    <span className="text-slate-600 dark:text-slate-300 font-medium">
                      천상의 기운이 당신을 돕는 날
                    </span>을<br />
                    정교하게 분석해 드립니다.
                  </>
                ) : (
                  <>
                    Planning something important?<br />
                    Let us find the days when <br />
                    <span className="text-slate-600 dark:text-slate-300 font-medium">
                      the universe supports you the most.
                    </span>
                  </>
                )}
              </p>
            </header>

            <section className="">{selectionSection()}</section>

            <footer className="mb-12">
              <AnalyzeButton
                onClick={() => handleStartClick(onStart)}
                disabled={isDisabled}
                loading={loading}
                isDone={isAnalysisDone}
                label={language === 'ko' ? '좋은 날짜 받기' : 'Find Best Dates'}
                color='emerald'
              />
            </footer>
          </div>

          <div className="mb-12 -mx-6">
            <SelDateAppeal />
          </div>

          <SelDatePreview
            onStart={() => handleStartClick(onStart)}
            isDisabled={isDisabled}
          />
          <div className="mx-w-lg mx-auto mt-8">
            <div className="mb-12 max-w-lg mx-auto">
              <ToTopButton
                onClick={() => handleStartClick(onStart)}
                disabled={isDisabled}
                loading={loading}
                isDone={isAnalysisDone}
                label={language === 'ko' ? '좋은 날짜 받기' : 'Find Best Dates'}
                color='emerald'
              />
              {isLocked ? (
                <p className="mt-4 text-rose-600 font-black text-sm flex items-center justify-center gap-1 animate-pulse">
                  <ExclamationTriangleIcon className="w-4 h-4" />
                  {language === 'ko' ? '크레딧이 부족합니다..' : 'Not Enough credit'}
                </p>
              ) : (
                <p className="mt-4 text-[11px] text-slate-400 text-center">
                  {language === 'ko'
                    ? '이미 분석된 운세는 크래딧을 재소모하지 않습니다.'
                    : 'Fortunes already analyzed do not use credits.'}
                </p>
              )}
            </div>
          </div>
        </div>
      );
    },
    [loading, saju, isTimeUnknown, language, selectionSection, handleStartClick, isDisabled, isLocked, isAnalysisDone]
  );

  // [NEW] Reactive Redirect
  useEffect(() => {
    if (isButtonClicked && prevData?.result && prevData?.result?.length > 0) {
      router.push('/saju/seldate/result');
    }
  }, [loading, aiResult, router]);

  return (
    <>
      <AnalysisStepContainer
        guideContent={sajuGuide}
        loadingContent={<LoadingFourPillar saju={saju} isTimeUnknown={isTimeUnknown} />}
        resultComponent={null}
        loadingTime={10000000}
      />
    </>
  );
}
