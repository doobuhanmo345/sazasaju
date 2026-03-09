'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import Image from 'next/image';
import AnalysisStepContainer from '@/components/AnalysisStepContainer';
import { useAuthContext } from '@/contexts/useAuthContext';
import { useUsageLimit } from '@/contexts/useUsageLimit';
import { useLoading } from '@/contexts/useLoadingContext';
import { UI_TEXT, langPrompt, hanja } from '@/data/constants';
import { useLanguage } from '@/contexts/useLanguageContext';
import { classNames } from '@/utils/helpers';
import { LockClosedIcon } from '@heroicons/react/24/outline';
import EnergyBadge from '@/ui/EnergyBadge';
import LoadingFourPillar from '@/components/LoadingFourPillar';
import { SajuAnalysisService, AnalysisPresets } from '@/lib/SajuAnalysisService';
import ReportTemplateSelBirth from '@/app/saju/selbirth/ReportTemplateSelBirth';

import DateInput from '@/ui/DateInput';
import BdInput from '@/ui/BdInput';
import AnalyzeButton from '@/ui/AnalyzeButton';
import SelBirthAppeal from '@/app/saju/selbirth/SelBirthAppeal';
import SelBirthPreview from '@/app/saju/selbirth/SelBirthPreview';
import { useRouter } from 'next/navigation';
import ToTopButton from '@/ui/ToTopButton';
import style from '@/data/styleConstants';
export default function SelBirthPage() {
  const router = useRouter();
  const { loading, setLoading, aiResult, setAiResult, setLastParams, handleCancelHelper } = useLoading();

  const { sajuDesc, userData, user, selectedProfile } = useAuthContext();
  // 컨텍스트 스위칭
  const targetProfile = selectedProfile || userData;
  const { birthDate: inputDate, isTimeUnknown, gender, saju } = targetProfile || {};
  //컨텍스트 스위칭 끝
  const { language } = useLanguage();
  const { setEditCount, MAX_EDIT_COUNT, isLocked } = useUsageLimit();

  // Client-side Title Update for Localization (Static Export Support)
  useEffect(() => {
    if (language === 'ko') {
      document.title = '출산 택일 분석 | 신생아를 위한 축복의 시간';
    } else {
      document.title = 'Auspicious Birth Selection | Best Time for Newborn';
    }
  }, [language]);

  const [step, setStep] = useState('input');

  // 출산 예정일 (기본값: 오늘로부터 약 90일 뒤)
  const [dueDate, setDueDate] = useState(() => {
    const today = new Date();
    const future = new Date(today);
    future.setDate(today.getDate() + 90);
    return future.toISOString().split('T')[0];
  });

  const [partnerBirthInfo, setPartnerBirthInfo] = useState('1990-01-01T12:00');
  const [partnerTimeUnknown, setPartnerTimeUnknown] = useState(true);

  // 선택된 기간 옵션 (1, 2, 3주)
  const [rangeWeeks, setRangeWeeks] = useState(2);

  // 실제 계산된 startDate, endDate
  const { startDate, endDate } = useMemo(() => {
    const end = new Date(dueDate);
    const start = new Date(dueDate);
    start.setDate(end.getDate() - (rangeWeeks * 7));

    return {
      startDate: start.toISOString().split('T')[0],
      endDate: end.toISOString().split('T')[0]
    };
  }, [dueDate, rangeWeeks]);

  const [birthMethod, setBirthMethod] = useState('cesarean');
  const [babyGender, setBabyGender] = useState('unknown');

  // [NEW] Strict Analysis Check (SelBirth uses 'selBirth', stored in ZSelBirth)
  const prevData = userData?.usageHistory?.ZSelBirth;

  const isAnalysisDone = useMemo(() => {
    if (!prevData || !prevData.result) return false;

    // 1. 프로필 검증 (엄마/본인)
    if (prevData.gender !== gender) return false;
    if (!SajuAnalysisService.compareSaju(prevData.saju, saju)) return false;

    // 2. 입력값 검증
    // Due Date
    if (prevData.dueDate !== dueDate) return false;

    // Partner Info (SajuAnalysisService.selBirth saves parameter as 'partnerBirthDate')
    // stored as '1990-01-01T12:00'? Need to check what is saved.
    // In buildSaveData for selBirth (not visible but inferred), it likely saves params.
    // Assuming it saves exactly what is passed.
    if (prevData.partnerBirthDate !== partnerBirthInfo) return false;
    if (!prevData?.partnerSaju.grd0 !== partnerTimeUnknown) return false;

    // Options
    if (prevData.birthMethod !== birthMethod) return false;
    if (prevData.babyGender !== babyGender) return false;
    if (prevData.startDate && prevData.startDate !== startDate) return false;
    if (prevData.endDate && prevData.endDate !== endDate) return false;

    return true;
  }, [prevData, gender, saju, dueDate, partnerBirthInfo, partnerTimeUnknown, birthMethod, babyGender, startDate, endDate]);
  const [isButtonClicked, setIsButtonClicked] = useState(false);
  const [justAnalyzed, setJustAnalyzed] = useState(false);
  const isDisabled = !user || loading || !dueDate;

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
        setLastParams,
        handleCancelHelper,
      }),
    [user, userData, language, MAX_EDIT_COUNT, setEditCount, setLoading, setAiResult, setLastParams],
  );

  const handleStartAnalysis = useCallback(
    async (onStart) => {
      if (!user) {
        alert(UI_TEXT.loginReq[language]);
        return;
      }

      // [UX FIX] 로딩 화면 먼저 진입
      onStart();
      setIsButtonClicked(true)
      // [NEW] 이미 저장된 데이터와 입력값이 같으면 잠시 대기 후 결과 페이지로 이동
      if (isAnalysisDone) {
        console.log('✅ 이미 분석된 데이터(옵션 일치)가 있어 결과 페이지로 이동합니다.');
        setLoading(true); // Manually trigger loading state
        setTimeout(() => {
          router.push('/saju/selbirth/result');
        }, 2000);
        return;
      }

      setAiResult('');
      try {
        const methodText = birthMethod === 'natural'
          ? (language === 'ko' ? '자연분만' : 'Natural Birth')
          : (language === 'ko' ? '제왕절개' : 'Cesarean Section');

        const genderText = babyGender === 'boy'
          ? (language === 'ko' ? '남아' : 'Boy')
          : babyGender === 'girl'
            ? (language === 'ko' ? '여아' : 'Girl')
            : (language === 'ko' ? '성별모름' : 'Unknown');

        const purposeText = `${language === 'ko' ? '출산 택일' : 'Childbirth Selection'} (${methodText}, ${genderText})`;

        const result = await service.analyze(
          AnalysisPresets.selBirth({
            saju,
            sajuDesc,
            gender,
            startDate,
            endDate,
            purpose: purposeText,
            dueDate,
            partnerBirthDate: partnerBirthInfo,
            partnerTimeUnknown,
            birthMethod,
            babyGender,
          }),
        );
        if (result) setJustAnalyzed(true);
        // 콜백 제거

      } catch (error) {
        console.error(error);
      }
    },
    [service, saju, gender, language, startDate, endDate, dueDate, partnerBirthInfo, partnerTimeUnknown, birthMethod, babyGender, setAiResult, user, isAnalysisDone, router],
  );

  // [UX FIX] Reset AI Result on Mount

  // [NEW] Reactive Redirect
  useEffect(() => {
    if (isButtonClicked && !loading && (isAnalysisDone || justAnalyzed)) {
      router.push('/saju/selbirth/result');
    }
  }, [isButtonClicked, prevData, router, isAnalysisDone, loading, justAnalyzed]);

  const renderInput = (onStart) => {
    return (
      <div className="w-full px-6 py-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <header className="max-w-lg mx-auto mb-8 text-center sm:text-left">
          <div className="inline-block px-2 py-1 mb-4 bg-emerald-50 dark:bg-emerald-900/20 rounded text-xs font-black tracking-[0.2em] text-emerald-600 dark:text-emerald-400 uppercase">
            Step 01. 정보 입력
          </div>
          <h2 className={style.sajuTitle}>
            {language === 'ko' ? '최고의 순간을 위한' : 'For the Best Moment'} <br />
            <span className="text-emerald-600 dark:text-emerald-400">
              {language === 'ko' ? '정보를 알려주세요' : 'Please Enter Info'}
            </span>
          </h2>
        </header>

        <div className="max-w-lg mx-auto bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-xl space-y-8 text-left">
          <div className="flex flex-col gap-6">
            {/* 1. 배우자 정보 */}
            <BdInput
              label={gender === 'female'
                ? (language === 'ko' ? '아빠(배우자) 생년월일' : "FATHER'S BIRTH DATE")
                : (language === 'ko' ? '엄마(배우자) 생년월일' : "MOTHER'S BIRTH DATE")
              }
              language={language}
              value={partnerBirthInfo}
              onChange={setPartnerBirthInfo}
              isTimeUnknown={partnerTimeUnknown}
              setIsTimeUnknown={setPartnerTimeUnknown}
              color="indigo"
            />

            {/* 2. 출산 예정일 */}
            <div className="pt-6 border-t border-slate-50 dark:border-slate-700/50">
              <DateInput
                label={language === 'ko' ? "출산 예정일" : "EXPECTED DUE DATE"}
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full"
                language={language}
                color="emerald"
              />
            </div>

            {/* 3. 출산 방식 */}
            <div className="pt-6 border-t border-slate-50 dark:border-slate-700/50">
              <p className="mb-3 text-sm font-black text-slate-400 uppercase tracking-[0.3em] ml-1">
                {language === 'ko' ? '출산 방식' : 'BIRTH METHOD'}
              </p>
              <div className="flex gap-2">
                {[
                  { id: 'natural', label: language === 'ko' ? '자연분만' : 'Natural' },
                  { id: 'cesarean', label: language === 'ko' ? '제왕절개' : 'Cesarean' }
                ].map((method) => (
                  <button
                    key={method.id}
                    onClick={() => setBirthMethod(method.id)}
                    className={`flex-1 py-4 text-sm font-bold rounded-2xl transition-all duration-300 ${birthMethod === method.id
                      ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-lg ring-2 ring-emerald-500/20'
                      : 'bg-slate-50 dark:bg-slate-700/50 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                      }`}
                  >
                    {method.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 4. 아이 성별 */}
            <div className="pt-6 border-t border-slate-50 dark:border-slate-700/50">
              <p className="mb-3 text-sm font-black text-slate-400 uppercase tracking-[0.3em] ml-1">
                {language === 'ko' ? '아이 성별' : "BABY'S GENDER"}
              </p>
              <div className="flex gap-2">
                {[
                  { id: 'boy', label: language === 'ko' ? '남아' : 'Boy' },
                  { id: 'girl', label: language === 'ko' ? '여아' : 'Girl' },
                  { id: 'unknown', label: language === 'ko' ? '모름' : 'Unknown' }
                ].map((g) => (
                  <button
                    key={g.id}
                    onClick={() => setBabyGender(g.id)}
                    className={`flex-1 py-4 text-sm font-bold rounded-2xl transition-all duration-300 ${babyGender === g.id
                      ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-lg ring-2 ring-emerald-500/20'
                      : 'bg-slate-50 dark:bg-slate-700/50 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                      }`}
                  >
                    {g.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 5. 기간 선택 */}
            <div className="pt-6 border-t border-slate-50 dark:border-slate-700/50">
              <p className="mb-3 text-sm font-black text-slate-400 uppercase tracking-[0.3em] ml-1">
                {language === 'ko' ? '택일 범위 (예정일 기준)' : 'RANGE BEFORE DUE DATE'}
              </p>
              <div className="grid grid-cols-3 gap-2">
                {[1, 2, 3].map((week) => (
                  <button
                    key={week}
                    onClick={() => setRangeWeeks(week)}
                    className={`
                        py-4 text-sm font-bold rounded-2xl transition-all duration-300
                        ${rangeWeeks === week
                        ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-lg ring-2 ring-emerald-500/20'
                        : 'bg-slate-50 dark:bg-slate-700/50 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                      }
                      `}
                  >
                    {week}{language === 'ko' ? '주' : 'w'}
                  </button>
                ))}
              </div>
              <div className="mt-4 flex items-center justify-end gap-2 px-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <p className="text-sm font-bold text-emerald-600/60 font-serif lowercase tracking-tighter">
                  {startDate} ~ {endDate}
                </p>
              </div>
            </div>
          </div>

          <footer className="pt-6">
            <AnalyzeButton
              onClick={() => handleStartAnalysis(onStart)}
              disabled={isDisabled}
              loading={false}
              isDone={isAnalysisDone}
              label={language === 'ko' ? '좋은 날짜 받기' : 'Find Best Dates'}
              color='emerald'
              cost={-1}
            />
            {isLocked && (
              <p className="mt-2 text-rose-500 text-sm font-bold text-center animate-pulse">
                {language === 'ko' ? '크레딧이 부족합니다' : 'Not enough energy'}
              </p>
            )}
          </footer>
        </div>

        <div className="mt-12 -mx-6">
          <SelBirthAppeal />
        </div>

        <SelBirthPreview
          onStart={() => handleStartAnalysis(onStart)}
          isDisabled={isDisabled}
        />

        {/* [NEW] Secondary Analyze Button (Bottom) */}
        <div className="mx-w-lg mx-auto mt-8">
          <div className="mb-12 max-w-lg mx-auto">
            <ToTopButton
              onClick={() => handleStartAnalysis(onStart)}
              disabled={isDisabled}
              loading={loading}
              isDone={isAnalysisDone}
              label={language === 'ko' ? '좋은 날짜 받기' : 'Find Best Dates'}
              color='emerald'
              cost={-1}
            />
            {isLocked && (
              <p className="mt-2 text-rose-500 text-sm font-bold text-center animate-pulse">
                {language === 'ko' ? '크레딧이 부족합니다' : 'Not enough energy'}
              </p>
            )}
            <p className="mt-4 text-sm text-slate-400 text-center">
              {language === 'ko'
                ? '이미 분석된 운세는 크래딧을 재소모하지 않습니다.'
                : 'Fortunes already analyzed do not use credits.'}
            </p>
          </div>
        </div>
      </div>
    );
  };

  const sajuGuide = useCallback(
    (onStart) => {
      if (loading) {
        return <LoadingFourPillar saju={saju} isTimeUnknown={isTimeUnknown} isAnalysisDone={isAnalysisDone} />;
      }

      if (step === 'intro') {
        return (
          <div className="w-full px-6 py-12 animate-in fade-in slide-in-from-bottom-3 duration-1000 text-center">
            <header className="mb-12">
              <div className="inline-block px-2 py-1 mb-4 bg-emerald-50 dark:bg-emerald-900/20 rounded text-xs font-black tracking-[0.2em] text-emerald-600 dark:text-emerald-400 uppercase">
                Childbirth Selection
              </div>
              <h2 className="text-4xl font-extrabold text-slate-900 dark:text-white leading-[1.1] tracking-tight">
                {language === 'ko' ? '세상과 만나는' : 'Meeting the World'} <br />
                <span className="text-emerald-600 dark:text-emerald-400">
                  {language === 'ko' ? '첫 순간의 기록' : 'The First Moment'}
                </span>
              </h2>
              <p className="mt-6 text-sm text-slate-500 dark:text-slate-400 leading-relaxed max-w-sm mx-auto">
                {language === 'ko' ? (
                  <>
                    소중한 아이가 세상에 나오는 날,<br />
                    명리학적으로 분석한 최고의 시간을 찾아드립니다.
                  </>
                ) : (
                  <>
                    Find the most blessed time for your precious child entry into the world.
                  </>
                )}
              </p>
            </header>

            <div className="mb-12 relative group max-w-sm mx-auto">
              <div className="absolute inset-0 bg-emerald-500/20 blur-3xl rounded-full scale-75 group-hover:scale-100 transition-transform duration-700" />
              <Image
                src="/images/introcard/sel_birth.webp"
                alt="Birth Selection"
                width={800}
                height={600}
                className="relative z-10 w-full rounded-[2.5rem] shadow-2xl border border-white/50 dark:border-slate-700/50 h-auto"
                priority
              />
            </div>

            <div className="flex flex-col items-center gap-4">
              <button
                onClick={() => setStep('input')}
                className="w-full max-w-sm py-5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl text-lg font-black shadow-xl shadow-emerald-200 dark:shadow-none transform transition-all hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-3"
              >
                {language === 'ko' ? '시작하기' : 'Start Now'}
                {user && (
                  <EnergyBadge active={userData?.birthDate} consuming={loading} cost={-1} />
                )}
              </button>
              <p className="text-xs text-slate-400">
                {language === 'ko' ? '💡 분석 시 1 에너지가 소모됩니다.' : '💡 1 Energy will be consumed.'}
              </p>
            </div>

            <div className="mt-16 -mx-6">
              <SelBirthAppeal />
            </div>
          </div>
        );
      }

      return renderInput(onStart);
    },
    [loading, saju, isTimeUnknown, language, isDisabled, isLocked, user, userData, partnerBirthInfo, partnerTimeUnknown, step, dueDate, rangeWeeks, birthMethod, babyGender]
  );

  return (
    <main className="min-h-screen pt-20 pb-12 bg-slate-50 dark:bg-slate-950 transition-colors">
      <AnalysisStepContainer
        guideContent={sajuGuide}
        loadingContent={<LoadingFourPillar saju={saju} isTimeUnknown={isTimeUnknown} isAnalysisDone={isAnalysisDone} />}
        resultComponent={null}
        loadingTime={10000000}
      />
    </main>
  );
}
