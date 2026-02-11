'use client';

import { useRef, useState, useEffect, useCallback, useMemo } from 'react'; // 1. useMemo 추가
import { useRouter } from 'next/navigation';
import AnalyzeButton from '@/ui/AnalyzeButton';
import { useSajuCalculator } from '@/hooks/useSajuCalculator';
import { AnalysisStepContainer } from '@/components/AnalysisStepContainer';
import { useAuthContext } from '@/contexts/useAuthContext';
import { useUsageLimit } from '@/contexts/useUsageLimit';
import { useLoading } from '@/contexts/useLoadingContext';
import { UI_TEXT } from '@/data/constants';
import { useLanguage } from '@/contexts/useLanguageContext';
import { classNames } from '@/utils/helpers';
import { LockClosedIcon } from '@heroicons/react/24/outline';
import { ExclamationTriangleIcon } from '@heroicons/react/24/solid';
import { calculateSajuData } from '@/lib/sajuLogic';
import LoadingFourPillar from '@/components/LoadingFourPillar';
import { SajuAnalysisService, AnalysisPresets } from '@/lib/SajuAnalysisService';
import BasicAnaAppeal from '@/app/saju/basic/BasicAnaAppeal';
import BasicAnaPreview from '@/app/saju/basic/BasicAnaPreview';

export default function BasicAnaPage() {
  const router = useRouter();
  const [sajuData, setSajuData] = useState(null);
  const { loading, setLoading, setLoadingType, setAiResult, aiResult } = useLoading();
  const { userData, user, selectedProfile } = useAuthContext(); // selectedProfile 추가

  // 컨텍스트 스위칭: 선택된 프로필이 있으면 그것을 사용, 없으면 본인 정보
  const targetProfile = selectedProfile || userData;
  // [FIX] birthTime이 별도로 있는 경우 합쳐서 ISO 포맷으로 만듦
  const rawDate = targetProfile?.birthDate;
  const rawTime = targetProfile?.birthTime || '12:00';
  const inputDate = (targetProfile?.birthTime && rawDate && !rawDate.includes('T'))
    ? `${rawDate}T${rawTime}`
    : rawDate;

  const { isTimeUnknown, gender } = targetProfile || {};

  const { saju } = useSajuCalculator(inputDate, isTimeUnknown);
  const { language } = useLanguage();
  const { setEditCount, MAX_EDIT_COUNT, isLocked } = useUsageLimit();

  const DISABLED_STYLE = 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200';
  const isDisabled = !user || loading;

  const prevData = userData?.usageHistory?.ZApiAnalysis;
  const isAnalysisDone = useMemo(() => {

    return !!(
      prevData &&
      prevData.result &&
      SajuAnalysisService.compareSaju(prevData.saju, targetProfile?.saju) &&
      prevData.gender === targetProfile?.gender
    );
  }, [targetProfile]);
  // console.log(selectedProfile, !!prevData, SajuAnalysisService.compareSaju(prevData.saju, selectedProfile?.saju), prevData.gender, selectedProfile?.gender)
  const isDisabled2 = !isAnalysisDone && isLocked;
  const [isButtonClicked, setIsButtonClicked] = useState(false);
  // Client-side Title Update for Localization (Static Export Support)
  useEffect(() => {
    if (language === 'ko') {
      document.title = '평생 사주 분석 리포트 | 나의 타고난 명식과 대운 풀이';
    } else {
      document.title = 'Lifetime Saju Analysis | My Innate Map & Great Luck';
    }
  }, [language]);

  // ✅ 1. SajuAnalysisService 인스턴스 고정 (가장 중요)
  // useMemo를 안쓰면 렌더링마다 서비스가 새로 생성되어 내부 리렌더링을 유발합니다.
  const service = useMemo(
    () =>
      new SajuAnalysisService({
        user,
        userData: targetProfile, // AI 분석 서비스에 타겟 프로필 전달
        language,
        maxEditCount: MAX_EDIT_COUNT,
        uiText: UI_TEXT,
        setEditCount,
        setLoading,
        setAiResult,
      }),
    [user, targetProfile, language, MAX_EDIT_COUNT, setEditCount, setLoading, setAiResult], // 의존성 변경
  );

  // ✅ 2. handleStartClick을 useCallback으로 고정
  const handleStartClick = useCallback(
    async (onstart) => {
      // [UX FIX] 로딩 화면을 먼저 보여줌
      onstart();
      setIsButtonClicked(true);
      // [NEW] 이미 저장된 데이터와 현재 입력값이 같으면 잠시 대기 후 결과 페이지로 이동
      if (isAnalysisDone) {
        console.log('✅ 이미 분석된 데이터가 있어 결과 페이지로 이동합니다.');
        setTimeout(() => {
          router.push('/saju/basic/result');
        }, 2000);
        return;
      }

      setAiResult('');
      try {
        const data = calculateSajuData(inputDate, gender, isTimeUnknown, language);
        if (!data) return;

        const preset = AnalysisPresets.basic({ saju, gender, language }, data);

        // [CRITICAL FIX] 친구 프로필 분석 시 메인 유저의 saju 데이터 덮어쓰기 방지
        if (targetProfile) {
          preset.buildSaveData = async (result, p, service) => {
            const todayStr = await service.getToday();
            return {
              // saju 필드 생략 (메인 유저 데이터 오염 방지)
              usageHistory: {
                ZApiAnalysis: {
                  result,
                  saju: targetProfile?.saju,
                  language: p.language,
                  gender: targetProfile?.gender,
                  targetName: targetProfile.displayName || 'Friend', // 누구 사주인지 기록
                },
              },
              // 친구 분석은 카운트 증가 안 함 (옵션) -> 일단 기록은 남기되 메인 데이터 보호
              // dailyUsage: { [todayStr]: firestore.increment(1) }, 
            };
          };
        }
        onstart(); // 로딩화면 진입 (분석 시작 전)
        await service.analyze(preset, (result) => {
          console.log('✅ 평생운세 완료!');
        });
      } catch (error) {
        console.error(error);
        alert(UI_TEXT.error?.[language] || 'An error occurred.');
      }
    },
    [inputDate, gender, isTimeUnknown, language, service, saju, setAiResult, targetProfile],
  );

  // ✅ 3. sajuGuide를 useCallback으로 고정
  // AnalysisStepContainer가 이 함수를 의존성으로 가질 경우 무한 루프의 주범이 됩니다.
  const sajuGuide = useCallback(
    (onStart) => {
      if (loading) {
        return <LoadingFourPillar saju={saju} isTimeUnknown={isTimeUnknown} isAnalysisDone={isAnalysisDone} />;
      }

      const iljuName = saju ? `${saju.sky1}${saju.grd1}` : '';
      const displayName = targetProfile?.displayName || (language === 'ko' ? '당신' : 'My');

      return (
        <div className=" mx-auto text-center px-6 animate-in fade-in slide-in-from-bottom-5 duration-700">
          <div>
            <h2 className="text-3xl font-black text-slate-800 dark:text-white mb-4 tracking-tight leading-tight">
              {saju ? (
                <>
                  <span className="text-xl font-bold text-slate-500 block mb-1">
                    {language === 'ko' ? '오행으로 읽는' : 'Reading the Five Elements'}
                  </span>
                  <span className="text-indigo-600 dark:text-indigo-400">{displayName}</span>
                  {language === 'ko' ? '의 ' : "'s "}
                  <span className="relative inline-block">
                    <span className="relative z-10 text-slate-800 dark:text-slate-100"> {language === 'ko' ? '정밀 운세 분석' : 'Saju Analysis'}</span>
                    <div className="absolute inset-x-0 bottom-1 h-3 bg-indigo-200/50 dark:bg-indigo-800/50 -rotate-1 rounded-full"></div>
                  </span>
                </>
              ) : (
                <>
                  {language === 'ko' ? '오행으로 읽는' : 'Reading the Five Elements'}
                  <br />
                  <span className="relative text-sky-600 dark:text-sky-500">
                    {language === 'ko' ? '평생운세 & 10년 대운' : 'Saju Analysis'}
                    <div className="absolute inset-0 bg-sky-200/50 dark:bg-sky-800/60 blur-md rounded-full scale-100"></div>
                  </span>
                </>
              )}
            </h2>
            <div className="space-y-4 text-slate-600 dark:text-slate-400 mb-10 leading-relaxed break-keep">
              <p className="text-sm">
                {language === 'ko' ? (
                  <>
                    타고난 기질과 <strong>10년마다 찾아오는 대운</strong>의 흐름,<br />
                    당신의 운명 지도를 분석합니다.
                  </>
                ) : (
                  'My innate color and the period of change that comes every ten years. Analyzing your destiny map.'
                )}
              </p>
              <div className="m-auto max-w-sm rounded-2xl overflow-hidden shadow-sm border border-slate-100 dark:border-slate-800">
                <img
                  src="/images/introcard/basicana_1.webp"
                  alt="saju analysis"
                  className="w-full h-auto"
                />
              </div>
            </div>
          </div>

          {/* [NEW] Primary Analyze Button */}
          <div className="mb-12 max-w-lg mx-auto">
            <AnalyzeButton
              onClick={() => handleStartClick(onStart)}
              disabled={isDisabled || isDisabled2}
              loading={loading}
              isDone={isAnalysisDone}
              label={language === 'ko' ? '평생 운세 보기' : 'Analyze Saju'}
              color="indigo"
              cost={-1}
            />
            {isLocked ? (
              <p className="mt-4 text-rose-600 font-black text-sm flex items-center justify-center gap-1 animate-pulse">
                <ExclamationTriangleIcon className="w-4 h-4" />
                {language === 'ko' ? '크레딧이 부족합니다..' : 'Not Enough credit'}
              </p>
            ) : (
              <p className="mt-4 text-[11px] text-slate-400">
                {language === 'ko'
                  ? '이미 분석된 운세는 크래딧을 재소모하지 않습니다.'
                  : 'Fortunes already analyzed do not use credits.'}
              </p>
            )}
          </div>


          {/* [NEW] Appeal Section */}
          <div className="mb-12 -mx-6">
            <BasicAnaAppeal />
          </div>

          {/* 3단 정보 바 (삭제됨 - Appeal 컴포넌트로 대체) */}

          {/* 프리뷰 섹션 시작 */}
          <BasicAnaPreview
            onStart={() => handleStartClick(onStart)}
            isDisabled={isDisabled}
            isDisabled2={isDisabled2}
            loading={loading}
            isDone={isAnalysisDone}
            isLocked={isLocked}
          />

          {/* [NEW] Secondary Analyze Button (Bottom) */}
          <div className="mx-w-lg mx-auto mt-8">
            <div className="mb-12 max-w-lg mx-auto">
              <AnalyzeButton
                onClick={() => handleStartClick(onStart)}
                disabled={isDisabled || isDisabled2}
                loading={loading}
                isDone={isAnalysisDone}
                label={language === 'ko' ? '평생 운세 보기' : 'Analyze Saju'}
                color="indigo"
                cost={-1}
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
    [
      loading,
      saju,
      isTimeUnknown,
      language,
      isDisabled,
      isDisabled2,
      handleStartClick,
      user,
      userData,
      isLocked,
    ],
  );

  // ✅ 4. 스크롤 로직 & 리다이렉트 (loading이 false가 되고 결과가 있을 때 이동)
  useEffect(() => {
    if (isButtonClicked && !loading && isAnalysisDone && prevData?.result && prevData?.result?.length > 0) {
      router.push('/saju/basic/result');
    }
  }, [isButtonClicked, prevData, router, isAnalysisDone, loading]);

  return (
    <>
      <AnalysisStepContainer
        guideContent={sajuGuide}
        loadingContent={<LoadingFourPillar saju={saju} isTimeUnknown={isTimeUnknown} isAnalysisDone={isAnalysisDone} />}
        resultComponent={null}
        loadingTime={10000000} // Redirect handles result view
      />
    </>
  );
}
