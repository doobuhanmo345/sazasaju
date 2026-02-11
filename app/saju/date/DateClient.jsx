'use client';

import { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import { AnalysisStepContainer } from '@/components/AnalysisStepContainer';
import { useAuthContext } from '@/contexts/useAuthContext';
import { useUsageLimit } from '@/contexts/useUsageLimit';
import { useLoading } from '@/contexts/useLoadingContext';
import { UI_TEXT } from '@/data/constants';
import { useLanguage } from '@/contexts/useLanguageContext';
import { langPrompt, hanja } from '@/data/constants';
import { calculateSaju } from '@/lib/sajuCalculator';
import { ExclamationTriangleIcon } from '@heroicons/react/24/solid';
import LoadingFourPillar from '@/components/LoadingFourPillar';
import { SajuAnalysisService, AnalysisPresets, getPromptFromDB } from '@/lib/SajuAnalysisService';
import CustomCalendar from '@/components/CustomCalendar';
import { useRouter } from 'next/navigation';
import AnalyzeButton from '@/ui/AnalyzeButton';
import FirstDateAppeal from '@/app/saju/date/FirstDateAppeal';
import FirstDatePreview from '@/app/saju/date/FirstDatePreview';
import ToTopButton from '@/ui/ToTopButton';

const GET_FIRST_DATE_OPTIONS = (gender = 'female') => {
  const isMale = gender === 'male';
  return [
    {
      id: 'vibe',
      label: { ko: '나의 분위기', en: 'My Vibe' },
      options: [
        {
          id: 'soft',
          ko: isMale ? '다정함/젠틀' : '부드러움',
          en: isMale ? 'Gentle/Gentle' : 'Soft',
          prompt: isMale ? '다정하고 젠틀한 인상을 주고 싶어요.' : '부드럽고 편안한 인상을 주고 싶어요.'
        },
        {
          id: 'cool',
          ko: isMale ? '쿨함/클래식' : '세련됨/도시적',
          en: isMale ? 'Cool/Classic' : 'Sophisticated',
          prompt: isMale ? '쿨하고 클래식한 매력을 강조하고 싶어요.' : '세련되고 도시적인 매력을 강조하고 싶어요.'
        },
        {
          id: 'lovely',
          ko: isMale ? '든든함/상남자' : '러블리',
          en: isMale ? 'Reliable/Manly' : 'Lovely',
          prompt: isMale ? '든든하고 믿음직한 에너지를 전달하고 싶어요.' : '밝고 사랑스러운 에너지를 전달하고 싶어요.'
        },
        {
          id: 'intelligent',
          ko: isMale ? '스마트/이지적' : '이지적',
          en: isMale ? 'Smart/Intellectual' : 'Intellectual',
          prompt: isMale ? '똑똑하고 차분한 분위기로 대화하고 싶어요.' : '이지적이고 차분한 분위기로 대화하고 싶어요.'
        },
      ]
    },
    {
      id: 'goal',
      label: { ko: '오늘의 목표', en: 'Goal of Today' },
      options: [
        {
          id: 'first_impression',
          ko: isMale ? '카리스마 첫인상' : '강렬한 첫인상',
          en: isMale ? 'Charismatic Impression' : 'First Impression',
          prompt: isMale ? '상대에게 카리스마 있는 강한 첫인상을 남기고 싶어요.' : '상대에게 잊히지 않을 강한 첫인상을 남기고 싶어요.'
        },
        {
          id: 'deep_talk',
          ko: '깊은 대화',
          en: 'Deep Talk',
          prompt: '서로의 가치관을 공유하는 깊은 대화를 나누고 싶어요.'
        },
        {
          id: 'comfort',
          ko: isMale ? '즐거운 분위기' : '편안한 교감',
          en: isMale ? 'Fun Atmosphere' : 'Comfort',
          prompt: isMale ? '부담 없이 즐겁고 유쾌한 시간을 보내고 싶어요.' : '부담 없이 즐겁고 편안한 시간을 보내고 싶어요.'
        },
        {
          id: 'after',
          ko: isMale ? '다음 만남 약속' : '확실한 애프터',
          en: isMale ? 'Next Meetup' : 'Get After-date',
          prompt: isMale ? '다음 만남을 확실하게 약속받고 싶어요.' : '다음 만남을 확실하게 약속받고 싶어요.'
        },
      ]
    }
  ];
};

export default function FirstDatePage() {
  const { loading, setLoading, setLoadingType, setAiResult, aiResult, handleCancelHelper } = useLoading();
  const [selectedDate, setSelectedDate] = useState(null);
  const detailSectionRef = useRef(null);
  const { userData, user, selectedProfile } = useAuthContext();
  const router = useRouter();
  const [question, setQuestion] = useState('');
  // 컨텍스트 스위칭
  const targetProfile = selectedProfile || userData;
  const { birthDate: inputDate, isTimeUnknown, gender, saju } = targetProfile || {};
  //컨텍스트 스위칭 끝
  const { language } = useLanguage();
  const { setEditCount, MAX_EDIT_COUNT, isLocked } = useUsageLimit();
  const [dbPrompt, setDbPrompt] = useState('');
  useEffect(() => {
    const loadData = async () => {
      const content = await getPromptFromDB('daily_s_date');
      setDbPrompt(content);
    };
    loadData();
  }, [selectedDate]);

  // [NEW] Strict Analysis Check (First Date uses 'dailySpecific', stored in Zfirstdate)
  const prevData = userData?.usageHistory?.Zfirstdate;
  const selDateString = selectedDate ? new Date(selectedDate).toLocaleDateString('en-CA') : '';





  // Client-side Title Update for Localization (Static Export Support)
  useEffect(() => {
    if (language === 'ko') {
      document.title = '연애 및 데이트운 분석 | 완벽한 만남을 위한 조언';
    } else {
      document.title = 'Date & Romance Luck | Tips for Perfect Meeting';
    }
    // [FIX] 페이지 진입 시 이전 결과 초기화
    setAiResult('');
  }, [language, setAiResult]);

  const FIRST_DATE_OPTIONS = useMemo(() => GET_FIRST_DATE_OPTIONS(gender), [gender]);

  useEffect(() => {
    if (selectedDate && detailSectionRef.current) {
      detailSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [selectedDate]);
  const selDate = useMemo(() => {
    if (!selectedDate) return '';
    const d = new Date(selectedDate);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}T12:00`;
  }, [selectedDate]);


  const selectedDateSaju = useMemo(() => {
    if (selectedDate) {
      const result = calculateSaju(selDate, true);
      return result
    }
    return null;
  }, [selectedDate, selDate]);

  const isAnalysisDone = useMemo(() => {
    if (!prevData || !prevData?.result) return false;
    if (prevData?.gender !== gender) return false;
    if (!SajuAnalysisService.compareSaju(prevData?.saju, saju)) return false;
    if (!SajuAnalysisService.compareSaju(prevData?.sajuDate, selectedDateSaju)) return false;
    if (prevData?.question !== question) return false;

    return true;
  }, [prevData, gender, saju, selDateString, question, selectedDate]);
  const [isButtonClicked, setIsButtonClicked] = useState(false);


  const isDisabled = !user || loading || !selectedDate;

  const isDisabled2 = !isAnalysisDone && isLocked;



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
        handleCancelHelper: handleCancelHelper,
      }),
    [user, userData, language, MAX_EDIT_COUNT, setEditCount, setLoading, setAiResult],
  );

  const handleStartClick = useCallback(
    async (onstart) => {
      // [UX FIX] 로딩 화면 먼저 진입
      onstart();
      setIsButtonClicked(true)
      // [NEW] 이미 저장된 데이터와 입력값이 같으면 잠시 대기 후 결과 페이지로 이동
      if (isAnalysisDone) {
        console.log('✅ 이미 분석된 데이터(옵션 일치)가 있어 결과 페이지로 이동합니다.');
        setLoading(true); // Manually trigger loading state for UI transition
        setTimeout(() => {
          router.push('/saju/date/result');
        }, 2000);
        return;
      }


      try {
        await service.analyze(
          AnalysisPresets.dailySpecific({
            saju: saju,
            gender: gender,
            language: language,
            selectedDate: selectedDate,
            sajuDate: selectedDateSaju,
            question: question,
            type: 'firstdate',
            promptAdd: dbPrompt,
          }),
        );

      } catch (error) {
        console.error(error);
      }
    },
    [service, saju, gender, language, selectedDate, question, selectedDateSaju, setAiResult, dbPrompt, isAnalysisDone, router],
  );


  const [selections, setSelections] = useState({ vibe: '', goal: '' });

  const handleSelect = useCallback((groupId, optionId, optionPrompt) => {
    setSelections((prev) => {
      const isAlreadySelected = prev[groupId] === optionId;
      const newSelections = { ...prev, [groupId]: isAlreadySelected ? '' : optionId };

      const updatedPrompts = FIRST_DATE_OPTIONS.map((group) => {
        if (group.id === groupId) return isAlreadySelected ? '' : optionPrompt;
        const foundOption = group.options.find((opt) => opt.id === newSelections[group.id]);
        return foundOption ? foundOption.prompt : null;
      });

      // const combined = (language === 'ko' ? '오늘의 만남은 ' : 'Today\'s meeting is ') + updatedPrompts.filter(Boolean).join(', ');
      // setQuestion(combined);
      return newSelections;
    });
  }, [FIRST_DATE_OPTIONS, language]);

  const datePickerSection = useCallback(
    () => (
      <div className="w-full max-w-xl mx-auto py-8">
        <header className="mb-10 px-1">
          <h2 className="text-xl font-light text-slate-900 dark:text-white tracking-tight">
            <span className="font-bold">01.</span>
            <span className="ml-3 italic font-serif text-rose-500/80">
              {language === 'ko' ? '운명의 날 선택' : 'The Encounter Date'}
            </span>
          </h2>
          <p className="mt-4 text-sm text-slate-400 font-bold uppercase tracking-[0.2em]">
            {language === 'ko' ? '설레는 첫 만남이 언제인가요?' : 'When is your first meeting?'}
          </p>
        </header>

        <CustomCalendar selectedDate={selectedDate} setSelectedDate={setSelectedDate} theme="rose" />

        {selectedDate && (
          <div
            className="mt-20 pt-16 border-t border-slate-100 dark:border-slate-800 animate-in fade-in slide-in-from-top-4 duration-700"
            ref={detailSectionRef}
          >
            <header className="px-1 mb-12">
              <h2 className="text-xl font-light text-slate-900 dark:text-white tracking-tight">
                <span className="font-bold">02.</span>
                <span className="ml-3 italic font-serif text-rose-500/80">
                  {language === 'ko' ? '디테일 정보 (선택)' : 'Context (Optional)'}
                </span>
              </h2>
              <p className="mt-4 text-sm text-slate-400 font-bold uppercase tracking-[0.2em]">
                {language === 'ko' ? '더 로맨틱한 분석을 위해' : 'For more romantic analysis'}
              </p>
            </header>

            <div className="space-y-16 relative">
              <div className="absolute left-[13px] top-2 bottom-0 w-[1px] bg-slate-50 dark:bg-slate-800/50" />
              {FIRST_DATE_OPTIONS.map((group, index) => (
                <div key={group.id} className="relative pl-12">
                  <div className="absolute left-0 top-0 w-7 h-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-full flex items-center justify-center z-10 shadow-sm">
                    <span className="text-xs font-black text-rose-500">
                      {index + 1}
                    </span>
                  </div>
                  <label className="text-xs font-black uppercase tracking-[0.3em] text-slate-400 block mb-6 px-1">
                    {language === 'ko' ? group.label.ko : group.label.en}
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {group.options.map((opt) => (
                      <button
                        key={opt.id}
                        onClick={() => handleSelect(group.id, opt.id, opt.prompt)}
                        className={`px-5 py-2.5 text-sm font-medium border transition-all duration-300
                        ${selections[group.id] === opt.id
                            ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white shadow-xl -translate-y-1'
                            : 'bg-white dark:bg-slate-800/30 text-slate-400 border-slate-100 dark:border-slate-800 hover:border-slate-300'
                          }`}
                      >
                        {language === 'ko' ? opt.ko : opt.en}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    ),
    [language, selectedDate, selections, handleSelect, FIRST_DATE_OPTIONS],
  );

  const sajuGuide = useCallback(
    (onStart) => {
      if (loading) return <LoadingFourPillar saju={saju} isTimeUnknown={isTimeUnknown} isAnalysisDone={isAnalysisDone} />;

      return (
        <div className="mx-auto px-6 py-12 animate-in fade-in slide-in-from-bottom-3 duration-1000">
          <div className="max-w-lg mx-auto">
            <header className="text-center">
              <div className="inline-block px-2 py-1 mb-4 bg-rose-50 dark:bg-rose-900/20 rounded text-xs font-black tracking-[0.2em] text-rose-500 uppercase">
                First Encounter
              </div>
              <h2 className="text-3xl font-black text-slate-800 dark:text-white leading-[1.2] tracking-tight">
                {language === 'ko' ? '사자가 준비한' : "Saza's Perfect"}
                <br />
                <span className="relative text-rose-600 dark:text-rose-500">
                  {language === 'ko' ? '완벽한 데이트 플랜' : 'Date Planner'}
                  <div className="absolute inset-0 bg-rose-200/50 dark:bg-rose-900/30 blur-md rounded-full scale-100"></div>
                </span>
              </h2>
            </header>

            <section className="mt-10">{datePickerSection()}</section>

            <div className="mb-12">
              <AnalyzeButton
                onClick={() => handleStartClick(onStart)}
                disabled={isDisabled || isDisabled2}
                loading={loading} s
                isDone={isAnalysisDone}
                label={language === 'ko' ? '데이트 분석하기' : 'Analyze Date'}
                color="rose"
                cost={-1}
              />

              {isLocked ? (
                <p className="mt-4 text-rose-600 font-black text-sm flex items-center justify-center gap-1 animate-pulse">
                  <ExclamationTriangleIcon className="w-4 h-4" />
                  {language === 'ko' ? '크레딧이 부족합니다..' : 'Not Enough credit'}
                </p>
              ) : (
                <p className="mt-4 text-sm text-slate-400 text-center">
                  {language === 'ko'
                    ? '이미 분석된 운세는 크래딧을 재소모하지 않습니다.'
                    : 'Fortunes already analyzed do not use credits.'}
                </p>
              )}
            </div>
          </div>

          <div className="mb-12 -mx-6">
            <FirstDateAppeal />
          </div>

          <FirstDatePreview
            onStart={() => handleStartClick(onStart)}
            isDisabled={isDisabled || isDisabled2}
          />

          {/* [NEW] Secondary Analyze Button (Bottom) */}
          <div className="mx-w-lg mx-auto mt-8">
            <div className="mb-12 max-w-lg mx-auto">
              <ToTopButton
                onClick={() => handleStartClick(onStart)}
                disabled={isDisabled || isDisabled2}
                loading={loading}
                isDone={isAnalysisDone}
                label={language === 'ko' ? '데이트 가이드 받기' : 'Get Date Guide'}
                color="rose"
                cost={-1}
              />
              {isLocked ? (
                <p className="mt-4 text-rose-600 font-black text-sm flex items-center justify-center gap-1 animate-pulse">
                  <ExclamationTriangleIcon className="w-4 h-4" />
                  {language === 'ko' ? '크레딧이 부족합니다..' : 'Not Enough credit'}
                </p>
              ) : (
                <p className="mt-4 text-sm text-slate-400 text-center">
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
      datePickerSection,
      handleStartClick,
      isDisabled,
      isDisabled2,
      isLocked,
      user,
      userData,

    ],
  );

  // [NEW] Reactive Redirect
  useEffect(() => {
    if (isButtonClicked && !loading && isAnalysisDone && prevData?.result && prevData?.result?.length > 0) {
      router.push('/saju/date/result');
    }
  }, [isButtonClicked, prevData, router, isAnalysisDone, loading]);

  return (
    <main className="min-h-screen">
      <AnalysisStepContainer
        guideContent={sajuGuide}
        loadingContent={<LoadingFourPillar saju={saju} isTimeUnknown={isTimeUnknown} isAnalysisDone={isAnalysisDone} />}
        resultComponent={null}
        loadingTime={10000000}
      />
    </main>
  );
}
