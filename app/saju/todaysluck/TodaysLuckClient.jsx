'use client';

import { useRef, useState, useEffect } from 'react';
import { AnalysisStepContainer } from '@/components/AnalysisStepContainer';
import { useSajuCalculator } from '@/hooks/useSajuCalculator';
import { useAuthContext } from '@/contexts/useAuthContext';
import { useUsageLimit } from '@/contexts/useUsageLimit';
import { useLoading } from '@/contexts/useLoadingContext';
import { UI_TEXT } from '@/data/constants';
import { useLanguage } from '@/contexts/useLanguageContext';
import AnalyzeButton from '@/ui/AnalyzeButton';
import TodaysLuckAppeal from '@/app/saju/todaysluck/TodaysLuckAppeal';
import { langPrompt, hanja } from '@/data/constants';
import { ExclamationTriangleIcon } from '@heroicons/react/24/solid';
import { calculateSajuData } from '@/lib/sajuLogic';
import LoadingFourPillar from '@/components/LoadingFourPillar';
import { SajuAnalysisService, AnalysisPresets } from '@/lib/SajuAnalysisService';
import { useRouter } from 'next/navigation';
import { reportStyle } from '@/data/aiResultConstants';
import TodaysLuckPreview from '@/app/saju/todaysluck/TodaysLuckPreview';

export default function TodaysLuckPage() {
  const { setLoadingType, aiResult, setAiResult } = useLoading();
  const [loading, setLoading] = useState(false);
  const [sajuData, setSajuData] = useState(null);
  const { userData, user, selectedProfile } = useAuthContext(); // selectedProfile 추가
  const router = useRouter();

  // 컨텍스트 스위칭
  const targetProfile = selectedProfile || userData;
  const { birthDate: inputDate, isTimeUnknown, gender, saju } = targetProfile || {};

  const { language } = useLanguage();
  const { editCount, setEditCount, MAX_EDIT_COUNT, isLocked } = useUsageLimit();
  const DISABLED_STYLE = 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200';
  const isDisabled = !user || loading;
  const isTargetOthers = !!selectedProfile;

  // [NEW] Strict Analysis Check from User Data
  const prevData = userData?.usageHistory?.ZLastDaily;
  // Note: key for today's luck is ZLastDaily
  console.log(prevData)
  const isAnalysisDone = (() => {
    if (!prevData || !prevData.result) return false;
    // Compare basic fields if needed, but today's luck is date sensitive.
    // Assuming ZLastDaily is already filtered by date in context or backend.
    // Basic check for profile match:
    if (prevData.gender !== (targetProfile?.gender)) return false;
    if (prevData.date !== new Date().toISOString().split('T')[0]) return false;
    return SajuAnalysisService.compareSaju(prevData.saju, targetProfile?.saju);
  })();

  const isDisabled2 = !isTargetOthers && !isAnalysisDone && isLocked;

  // Client-side Title Update for Localization (Static Export Support)
  useEffect(() => {
    if (language === 'ko') {
      document.title = '오늘의 운세 | 당신만을 위한 행운의 컬러와 조언';
    } else {
      document.title = 'Todays Fortune | Lucky Color & Daily Advice';
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

  const service = new SajuAnalysisService({
    user,
    userData: targetProfile, // AI 분석에 타겟 프로필 전달
    language,
    maxEditCount: MAX_EDIT_COUNT,
    uiText: UI_TEXT,
    langPrompt,
    hanja,
    setEditCount,
    setLoading,
    setAiResult,
  });

  const handleStartClick = async (onstart) => {
    // [UX FIX] 로딩 화면을 먼저 보여줌
    onstart();

    // [NEW] 이미 저장된 데이터가 있으면 잠시 대기 후 리다이렉트
    if (isAnalysisDone) {
      console.log('✅ 이미 분석된 데이터가 있어 결과 페이지로 이동합니다.');
      setTimeout(() => {
        router.push('/saju/todaysluck/result');
      }, 2000);
      return;
    }

    setAiResult('');
    try {
      await service.analyze(AnalysisPresets.daily({ saju, gender, language }), (result) => {
        console.log('✅ 오늘의 운세 완료!');
      });
    } catch (error) {
      console.error(error);
    }
  };

  const sajuGuide = (onStart) => {
    if (loading) {
      return <LoadingFourPillar saju={saju} isTimeUnknown={isTimeUnknown} />;
    }
    return (
      <div className="mx-auto  text-center px-6 animate-in fade-in slide-in-from-bottom-5 duration-700">
        <div>
          <h2 className=" text-3xl font-black text-slate-800 dark:text-white mb-4 tracking-tight">
            {language === 'ko' ? '사자가 읽어주는' : "by Saza's Saju reading"}

            <br />
            <span className=" relative text-amber-600 dark:text-amber-500">
              {language === 'ko' ? '당신의 오늘' : 'Luck of the day'}
              <div className="absolute inset-0 bg-amber-200/50 dark:bg-amber-800/60 blur-md rounded-full scale-100"></div>
            </span>
          </h2>
        </div>
        <div className="space-y-4 text-slate-600 dark:text-slate-400 mb-10 leading-relaxed break-keep">
          <p className="text-sm">
            {language === 'ko' ? (
              <>
                사주로 보는
                <strong>오늘의 재물운, 연애운</strong>부터 <strong>오늘의 방향과 컬러</strong>
                까지! 운명 지도 분석.
              </>
            ) : (
              'Including ‘Total score’, ‘Daily short report: Wealth, Love etc.’, ‘Lucky color, direction, keywords of the day’'
            )}
          </p>

          <div className="m-auto max-w-sm rounded-2xl overflow-hidden shadow-sm border border-slate-100 dark:border-slate-800">
            <img
              src="/images/introcard/todaysluck_1.webp"
              alt="today's luck"
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
            label={language === 'ko' ? '운세 확인하기' : 'Check my Luck'}
            color="amber"
            cost={-1}
          />
          {isLocked ? (
            <p className="mt-4 text-rose-600 font-black text-sm flex items-center justify-center gap-1 animate-pulse">
              <ExclamationTriangleIcon className="w-4 h-4" />{' '}
              {language === 'ko' ? '크레딧이 부족합니다..' : 'not Enough credit'}
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
          <TodaysLuckAppeal />
        </div>

        {/* Preview Section */}
        <TodaysLuckPreview
          onStart={() => handleStartClick(onStart)}
          isDisabled={isDisabled}
          isDisabled2={isDisabled2}
          loading={loading}
          isDone={isAnalysisDone}
          isLocked={isLocked}
        />
        <div className="mx-w-lg mx-auto">
          {/* Primary Analyze Button */}
          <div className="mb-12 max-w-lg mx-auto">
            <AnalyzeButton
              onClick={() => handleStartClick(onStart)}
              disabled={isDisabled || isDisabled2}
              loading={loading}
              isDone={isAnalysisDone}
              label={language === 'ko' ? '운세 확인하기' : 'Check my Luck'}
              color="amber"
              cost={-1}
            />
            {isLocked ? (
              <p className="mt-4 text-rose-600 font-black text-sm flex items-center justify-center gap-1 animate-pulse">
                <ExclamationTriangleIcon className="w-4 h-4" />{' '}
                {language === 'ko' ? '크레딧이 부족합니다..' : 'not Enough credit'}
              </p>
            ) : (
              <p className="mt-4 text-[11px] text-slate-400">
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
    if (aiResult) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [aiResult]);

  useEffect(() => {
    if (loading) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [loading]);

  // [NEW] Reactive Redirect
  useEffect(() => {
    if (!loading && aiResult && aiResult.length > 0) {
      router.push('/saju/todaysluck/result');
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
      <div dangerouslySetInnerHTML={{ __html: reportStyle }} />
    </>
  );
}
