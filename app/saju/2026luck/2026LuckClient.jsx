'use client';

import { useRef, useState, useMemo, useEffect } from 'react';
import { AnalysisStepContainer } from '@/components/AnalysisStepContainer';
import { useSajuCalculator } from '@/hooks/useSajuCalculator';
import { useAuthContext } from '@/contexts/useAuthContext';
import { useUsageLimit } from '@/contexts/useUsageLimit';
import { useLoading } from '@/contexts/useLoadingContext';
import { UI_TEXT } from '@/data/constants';
import { useLanguage } from '@/contexts/useLanguageContext';
import { langPrompt, hanja } from '@/data/constants';
import { ExclamationTriangleIcon } from '@heroicons/react/24/solid';
import { calculateSajuData } from '@/lib/sajuLogic';
import LoadingFourPillar from '@/components/LoadingFourPillar';
import { SajuAnalysisService, AnalysisPresets } from '@/lib/SajuAnalysisService';
import { reportStyleBlue } from '@/data/aiResultConstants';
import { useRouter } from 'next/navigation';
import AnalyzeButton from '@/ui/AnalyzeButton';
import YearlyLuckAppeal from '@/app/saju/2026luck/YearlyLuckAppeal';
import YearlyLuckPreview from '@/app/saju/2026luck/YearlyLuckPreview';

export default function YearlyLuckPage() {
  const { loading, setLoading, setLoadingType, aiResult, setAiResult, handleCancelHelper } = useLoading();
  const [sajuData, setSajuData] = useState(null);
  const { userData, user, selectedProfile } = useAuthContext(); // selectedProfile 추가
  const router = useRouter();
  // 컨텍스트 스위칭
  const targetProfile = selectedProfile || userData;
  const { birthDate: inputDate, isTimeUnknown, gender, saju } = targetProfile || {};
  //컨텍스트 스위칭 끝
  const { language } = useLanguage();
  const { editCount, setEditCount, MAX_EDIT_COUNT, isLocked } = useUsageLimit();
  const DISABLED_STYLE = 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200';
  const isDisabled = !user || loading;
  const isTargetOthers = !!selectedProfile;

  // [NEW] Strict Analysis Check from User Data
  const prevData = userData?.usageHistory?.ZNewYear;
  // Note: Assuming ZNewYear is the key. Provide manual fallback if key differs?
  // Based on context, it seems standard.
  const isAnalysisDone = (() => { // using IIFE or useMemo
    if (!prevData || !prevData.result) return false;
    // Compare basic fields
    if (prevData.gender !== (targetProfile?.gender)) return false;
    // Compare Saju
    return SajuAnalysisService.compareSaju(prevData.saju, targetProfile?.saju);
  })();

  const isDisabled2 = !isTargetOthers && !isAnalysisDone && isLocked;
  const [isButtonClicked, setIsButtonClicked] = useState(false);
  // Client-side Title Update for Localization (Static Export Support)
  useEffect(() => {
    if (language === 'ko') {
      document.title = '2026년 신년운세 | 병오년 기운으로 보는 나의 한 해';
    } else {
      document.title = '2026 New Year Fortune | Year of the Red Horse';
    }
  }, [language]);

  useEffect(() => {
    if (inputDate) {
      const data = calculateSajuData(inputDate, gender, isTimeUnknown, language);
      if (data) {
        setSajuData(data);
      }
    }
  }, [inputDate, gender, isTimeUnknown, language]);

  const service = useMemo(() => {
    // console.log('🔧 Creating service with handleCancelHelper:', handleCancelHelper);
    return new SajuAnalysisService({

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
      handleCancelHelper: handleCancelHelper,
    });
  }, [user, targetProfile, language]); // 필요한 의존성만
  // console.log(handleCancelHelper)
  const handleStartClick = async (onstart) => {
    // [UX FIX] 로딩 화면을 먼저 보여줌
    onstart();
    setIsButtonClicked(true);
    // [NEW] 이미 저장된 데이터와 현재 입력값이 같으면 잠시 대기 후 결과 페이지로 이동
    if (isAnalysisDone) {
      console.log('✅ 이미 분석된 데이터가 있어 결과 페이지로 이동합니다.');
      setTimeout(() => {
        router.push('/saju/2026luck/result');
      }, 2000);
      return;
    }

    setAiResult('');
    try {
      onstart(); // [NEW] 로딩화면 먼저 진입
      await service.analyze(AnalysisPresets.newYear({ saju, gender, language }), (result) => {
        console.log('✅ 신년운세 완료!');
      });
    } catch (error) {
      console.error(error);
    }
  };

  const sajuGuide = (onStart) => {
    if (loading) {
      return <LoadingFourPillar saju={saju} isTimeUnknown={isTimeUnknown} isAnalysisDone={isAnalysisDone} />;
    }

    return (
      <div className=" mx-auto text-center px-6 animate-in fade-in slide-in-from-bottom-5 duration-700">
        <h2 className=" text-3xl font-black text-slate-800 dark:text-white mb-4 tracking-tight">
          {language === 'ko' ? '오행으로 읽는' : 'Reading the Five Elements'}
          <br />
          <span className="relative text-red-600 dark:text-red-400">
            {language === 'ko' ? '2026 신년운세' : '2026 Fortune Preview'}
            <div className="absolute inset-0 bg-red-200/50 dark:bg-red-900/30 blur-md rounded-full scale-100"></div>
          </span>
        </h2>
        {/* 설명문구 */}
        <div className="space-y-4 text-slate-600 dark:text-slate-400 mb-10 leading-relaxed break-keep text-center">
          <p className="text-sm">
            {language === 'ko' ? (
              <>
                <strong>붉은 말의 해</strong>, 사주에 숨겨진 월별 건강운, 재물운, 연애운.
              </>
            ) : (
              '2026 is Year of the Red Horse, find out the fortune upcoming of yours'
            )}
          </p>

          <div className="m-auto max-w-sm rounded-2xl overflow-hidden shadow-sm border border-slate-100 dark:border-slate-800">
            <img
              src="/images/introcard/newyear_1.webp"
              alt="2026 yearly luck"
              className="w-full h-auto"
            />
          </div>
        </div>
        {/* Primary Analyze Button */}
        <div className="mb-12 max-w-lg mx-auto">
          <AnalyzeButton
            onClick={() => handleStartClick(onStart)}
            disabled={isDisabled || isDisabled2}
            loading={loading}
            isDone={isAnalysisDone}
            label={language === 'ko' ? '2026 신년 운세 보기' : 'Check the 2026 Fortune'}
            color="red"
            cost={-1}
          />
          {isLocked ? (
            <p className="mt-4 text-rose-600 font-black text-sm flex items-center justify-center gap-1 animate-pulse">
              <ExclamationTriangleIcon className="w-4 h-4" />{' '}
              {language === 'ko' ? '크레딧이 부족합니다..' : 'Not enough credits'}
            </p>
          ) : (
            <p className="mt-4 text-[11px] text-slate-400">
              {language === 'ko'
                ? '이미 분석된 운세는 크래딧을 재소모하지 않습니다.'
                : 'Fortunes that have already been analyzed do not use credits.'}
            </p>
          )}
        </div>


        {/* Appeal Section */}
        <div className="mb-12 -mx-6">
          <YearlyLuckAppeal />
        </div>


        {/* Preview Section - Yearly Luck Teaser */}
        <YearlyLuckPreview
          onStart={() => handleStartClick(onStart)}
          isDisabled={isDisabled}
          isDisabled2={isDisabled2}
          loading={loading}
          isDone={isAnalysisDone}
          isLocked={isLocked}
        />

        {/* Secondary Analyze Button (Bottom) */}
        <div className="mx-w-lg mx-auto mt-8">
          <div className="mb-12 max-w-lg mx-auto">
            <AnalyzeButton
              onClick={() => handleStartClick(onStart)}
              disabled={isDisabled || isDisabled2}
              loading={loading}
              isDone={isAnalysisDone}
              label={language === 'ko' ? '2026 신년 운세 보기' : 'Check the 2026 Fortune'}
              color="red"
              cost={-1}
            />
            {isLocked ? (
              <p className="mt-4 text-rose-600 font-black text-sm flex items-center justify-center gap-1 animate-pulse">
                <ExclamationTriangleIcon className="w-4 h-4" />{' '}
                {language === 'ko' ? '크레딧이 부족합니다..' : 'Not enough credits'}
              </p>
            ) : (
              <p className="mt-4 text-[11px] text-slate-400 text-center">
                {language === 'ko'
                  ? '이미 분석된 운세는 크래딧을 재소모하지 않습니다.'
                  : 'Fortunes that have already been analyzed do not use credits.'}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  };

  useEffect(() => {
    if (typeof aiResult === 'string' && aiResult.trim().length > 0) {
      const timer = setTimeout(() => {
        window.scrollTo({
          top: 0,
          behavior: 'smooth',
        });
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [aiResult]);

  useEffect(() => {
    if (loading) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [loading]);

  // [NEW] Reactive Redirect
  useEffect(() => {
    if (isButtonClicked && !loading && isAnalysisDone && prevData?.result && prevData?.result?.length > 0) {
      router.push('/saju/2026luck/result');
    }
  }, [loading, prevData, router]);

  return (
    <>
      <AnalysisStepContainer
        guideContent={sajuGuide}
        loadingContent={<LoadingFourPillar saju={saju} isTimeUnknown={isTimeUnknown} isAnalysisDone={isAnalysisDone} />}
        resultComponent={null}
        loadingTime={10000000}
      />
      <div dangerouslySetInnerHTML={{ __html: reportStyleBlue }} />
    </>
  );
}
