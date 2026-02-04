'use client';

import { useRef, useState, useEffect } from 'react';
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
import ReportTemplateNewYear from '@/app/saju/2026luck/ReportTemplateNewYear';
import AnalyzeButton from '@/ui/AnalyzeButton';
import YearlyLuckAppeal from '@/app/saju/2026luck/YearlyLuckAppeal';
import YearlyLuckPreview from '@/app/saju/2026luck/YearlyLuckPreview';

export default function YearlyLuckPage() {
  const { setLoadingType, aiResult, setAiResult } = useLoading();
  const [loading, setLoading] = useState(false);
  const [sajuData, setSajuData] = useState(null);
  const { userData, user, isYearDone, selectedProfile } = useAuthContext(); // selectedProfile 추가
  
  // 컨텍스트 스위칭
  const targetProfile = selectedProfile || userData;
  const { birthDate: inputDate, isTimeUnknown, gender, saju } = targetProfile || {};
//컨텍스트 스위칭 끝
  const { language } = useLanguage();
  const { editCount, setEditCount, MAX_EDIT_COUNT, isLocked } = useUsageLimit();
  const DISABLED_STYLE = 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200';
  const isDisabled = !user || loading;
  const isTargetOthers = !!selectedProfile;
  const isDisabled2 = !isTargetOthers && !isYearDone && isLocked;

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
    setAiResult('');
    try {
      await service.analyze(AnalysisPresets.newYear({ saju, gender, language }));
      onstart();
    } catch (error) {
      console.error(error);
    }
  };

  const sajuGuide = (onStart) => {
    if (loading) {
      return <LoadingFourPillar saju={saju} isTimeUnknown={isTimeUnknown} />;
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
            isDone={isYearDone}
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
          isDone={isYearDone} 
          isLocked={isLocked}
        />
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

  return (
    <>
      <AnalysisStepContainer
        guideContent={sajuGuide}
        loadingContent={<LoadingFourPillar saju={saju} isTimeUnknown={isTimeUnknown} />}
        resultComponent={ReportTemplateNewYear}
        loadingTime={0}
      />
      <div dangerouslySetInnerHTML={{ __html: reportStyleBlue }} />
    </>
  );
}
