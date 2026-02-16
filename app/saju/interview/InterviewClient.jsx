'use client';

import { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import AnalysisStepContainer from '@/components/AnalysisStepContainer';
import { useSajuCalculator } from '@/hooks/useSajuCalculator';
import EnergyBadge from '@/ui/EnergyBadge';
import { useAuthContext } from '@/contexts/useAuthContext';
import { useUsageLimit } from '@/contexts/useUsageLimit';
import { useLoading } from '@/contexts/useLoadingContext';
import { UI_TEXT } from '@/data/constants';
import { useLanguage } from '@/contexts/useLanguageContext';
import { classNames } from '@/utils/helpers';
import { LockClosedIcon } from '@heroicons/react/24/outline';
import { langPrompt, hanja } from '@/data/constants';
import { calculateSaju } from '@/lib/sajuCalculator';
import { ExclamationTriangleIcon } from '@heroicons/react/24/solid';
import LoadingFourPillar from '@/components/LoadingFourPillar';
import { SajuAnalysisService, AnalysisPresets, getPromptFromDB } from '@/lib/SajuAnalysisService';
import { useRouter } from 'next/navigation';
import CustomCalendar from '@/components/CustomCalendar';
import AnalyzeButton from '@/ui/AnalyzeButton';
import InterviewAppeal from '@/app/saju/interview/InterviewAppeal';
import InterviewPreview from '@/app/saju/interview/InterviewPreview';
import ToTopButton from '@/ui/ToTopButton';
import style from '@/data/styleConstants';
const INTERVIEW_GROUPS = [
  {
    id: 'category',
    label: { ko: '어떤 자리인가요?', en: 'What kind of place?' },
    options: [
      {
        id: 'job',
        ko: '기업 면접',
        en: 'Job Interview',
        prompt: '회사 취업 면접을 앞두고 있어요.',
      },
      {
        id: 'club',
        ko: '동아리/학회',
        en: 'Club/Society',
        prompt: '동아리나 학회 가입을 위한 면접이에요.',
      },
      {
        id: 'exam',
        ko: '국가고시/시험',
        en: 'Exam/Test',
        prompt: '중요한 시험이나 자격증 평가 날이에요.',
      },
      { id: 'etc', ko: '기타 면접', en: 'Other', prompt: '중요한 평가나 면접이 있는 날이에요.' },
    ],
  },
  {
    id: 'vibe',
    label: { ko: '내가 보여줄 모습', en: 'Your Attitude' },
    options: [
      {
        id: 'active',
        ko: '열정적/적극적',
        en: 'Passionate',
        prompt: '열정적이고 적극적인 태도로 임할 계획이에요.',
      },
      {
        id: 'calm',
        ko: '차분함/논리적',
        en: 'Logical',
        prompt: '차분하고 논리적인 대답에 집중할 생각이에요.',
      },
      {
        id: 'humble',
        ko: '겸손함/성실함',
        en: 'Humble',
        prompt: '겸손하고 성실한 인상을 심어주려 해요.',
      },
      {
        id: 'unique',
        ko: '창의적/개성적',
        en: 'Creative',
        prompt: '독특하고 창의적인 매력을 보여주고 싶어요.',
      },
    ],
  },
  {
    id: 'concern',
    label: { ko: '가장 걱정되는 점', en: 'Main Concern' },
    options: [
      {
        id: 'speech',
        ko: '말주변/긴장',
        en: 'Anxiety',
        prompt: '너무 긴장해서 말을 실수할까 봐 걱정돼요.',
      },
      {
        id: 'knowledge',
        ko: '직무/지식',
        en: 'Knowledge',
        prompt: '준비한 답변 외의 어려운 질문이 나올까 걱정돼요.',
      },
      {
        id: 'vibe',
        ko: '압박 면접',
        en: 'Stress',
        prompt: '분위기가 너무 딱딱하거나 압박이 심할까 봐 걱정돼요.',
      },
    ],
  },
];

export default function InterviewPage() {
  const activeTheme = { text: 'text-blue-500' };
  const { loading, setLoading, aiResult, setAiResult, handleCancelHelper } = useLoading();
  const [selectedDate, setSelectedDate] = useState(null);
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

  const detailSectionRef = useRef(null);
  const [dbPrompt, setDbPrompt] = useState('');

  useEffect(() => {
    const loadData = async () => {
      const content = await getPromptFromDB('daily_s_interview');
      setDbPrompt(content);
    };
    loadData();
  }, [selectedDate]);

  useEffect(() => {
    if (selectedDate && detailSectionRef.current) {
      detailSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [selectedDate]);

  const [question, setQuestion] = useState('');

  const { userData, user, selectedProfile, sajuDesc } = useAuthContext();
  const router = useRouter();

  // 컨텍스트 스위칭
  const targetProfile = selectedProfile || userData;
  const { birthDate: inputDate, isTimeUnknown, gender, saju } = targetProfile || {};
  //컨텍스트 스위칭 끝
  const { language } = useLanguage();
  const { setEditCount, MAX_EDIT_COUNT, isLocked } = useUsageLimit();

  // [NEW] Strict Analysis Check (Interview uses 'dailySpecific', stored in Zinterview)
  const prevData = userData?.usageHistory?.Zinterview;

  const isAnalysisDone = useMemo(() => {
    if (!prevData || !prevData.result) return false;

    // 1. 프로필 검증
    if (prevData.gender !== gender) return false;
    if (!SajuAnalysisService.compareSaju(prevData.saju, saju)) return false;

    //  sajuDate: selectedDateSaju,
    if (!SajuAnalysisService.compareSaju(prevData.sajuDate, selectedDateSaju)) return false;


    // 질문 비교 (옵션 변경시 재분석)
    if (prevData.question !== question) return false;

    return true;
  }, [prevData, gender, saju, selectedDate, question]);

  const [isButtonClicked, setIsButtonClicked] = useState(false);
  // Client-side Title Update for Localization (Static Export Support)
  useEffect(() => {
    if (language === 'ko') {
      document.title = '면접 및 합격운 분석 | 나의 경쟁력 확인하기';
    } else {
      document.title = 'Interview & Success Luck | Boosting Your Career';
    }
  }, [language]);

  // [UX FIX] Reset AI Result on Mount to prevent instant redirect
  useEffect(() => {
    setAiResult('');
  }, [setAiResult]);

  const isDisabled = !user || loading || !selectedDate || !dbPrompt;
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
          router.push('/saju/interview/result');
        }, 2000);
        return;
      }

      setAiResult('');
      try {
        await service.analyze(
          AnalysisPresets.dailySpecific({
            saju: saju,
            sajuDesc,
            gender: gender,
            selectedDate: selectedDate,
            sajuDate: selectedDateSaju,
            question: question,
            type: 'interview',
            promptAdd: dbPrompt,
          }),
        );
        // 콜백 제거
      } catch (error) {
        console.error(error);
      }
    },
    [service, saju, gender, language, selectedDate, question, selectedDateSaju, setAiResult, dbPrompt, isAnalysisDone, router],
  );

  const [selections, setSelections] = useState({ category: '', vibe: '', concern: '' });

  const handleSelect = useCallback((groupId, optionId, optionPrompt) => {
    setSelections((prev) => {
      const isAlreadySelected = prev[groupId] === optionId;
      const newSelections = { ...prev, [groupId]: isAlreadySelected ? '' : optionId };

      const updatedPrompts = INTERVIEW_GROUPS.map((group) => {
        if (group.id === groupId) return isAlreadySelected ? '' : optionPrompt;
        const foundOption = group.options.find((opt) => opt.id === newSelections[group.id]);
        return foundOption ? foundOption.prompt : null;
      });

      const combined = updatedPrompts.filter(Boolean).join(', ');
      setQuestion(combined);
      return newSelections;
    });
  }, []);

  const datePickerSection = useCallback(
    () => (
      <div className="w-full mx-auto py-8">
        <header className="mb-10 px-1">
          <h2 className="text-xl font-light text-slate-900 dark:text-white tracking-tight">
            <span className="font-bold">01.</span>
            <span className={`ml-3 italic font-serif ${activeTheme.text}`}>
              {language === 'ko' ? '결전의 날 선택' : 'The Big Day'}
            </span>
          </h2>
          <p className="mt-4 text-sm text-slate-400 font-bold uppercase tracking-[0.2em]">
            {language === 'ko' ? '면접이나 발표가 언제인가요?' : 'When is your interview?'}
          </p>
        </header>

        <CustomCalendar
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          theme="blue"
        />

        {selectedDate && (
          <div
            className="mt-20 pt-16 border-t border-slate-100 dark:border-slate-800 animate-in fade-in slide-in-from-top-4 duration-700"
            ref={detailSectionRef}
          >
            <header className="px-1 mb-12">
              <h2 className="text-xl font-light text-slate-900 dark:text-white tracking-tight">
                <span className="font-bold">02.</span>
                <span className={`ml-3 italic font-serif ${activeTheme.text}`}>
                  {language === 'ko' ? '디테일 정보 (선택)' : 'Context (Optional)'}
                </span>
              </h2>
              <p className="mt-4 text-sm text-slate-400 font-bold uppercase tracking-[0.2em]">
                {language === 'ko' ? '더 정확한 합격운 분석을 위해' : 'For more precise analysis'}
              </p>
            </header>

            <div className="space-y-16 relative">
              <div className="absolute left-[13px] top-2 bottom-0 w-[1px] bg-slate-50 dark:bg-slate-800/50" />
              {INTERVIEW_GROUPS.map((group, index) => (
                <div key={group.id} className="relative pl-12">
                  <div className="absolute left-0 top-0 w-7 h-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-full flex items-center justify-center z-10 shadow-sm">
                    <span className={`text-xs font-black ${activeTheme.text}`}>
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
    [language, selectedDate, selections, handleSelect],
  );

  const sajuGuide = useCallback(
    (onStart) => {
      if (loading) return <LoadingFourPillar saju={saju} isTimeUnknown={isTimeUnknown} isAnalysisDone={isAnalysisDone} />;

      return (
        <div className="mx-auto px-6 py-12 animate-in fade-in slide-in-from-bottom-3 duration-1000">
          <div className="max-w-lg mx-auto">         <header className="text-center">
            <div className="inline-block px-2 py-1 mb-4 bg-blue-50 dark:bg-blue-900/20 rounded text-xs font-black tracking-[0.2em] text-blue-500 uppercase">
              Interview Strategy
            </div>
            <h2 className="text-3xl font-black text-slate-800 dark:text-white leading-[1.2] tracking-tight">
              {language === 'ko' ? '사자가 제안하는' : 'Saza\'s Strategic'}
              <br />
              <span className="relative text-blue-600 dark:text-blue-500">
                {language === 'ko' ? '면접 필승 바이브' : 'Interview Vibe'}
                <div className="absolute inset-0 bg-blue-200/50 dark:bg-blue-900/30 blur-md rounded-full scale-100"></div>
              </span>
            </h2>
          </header>

            <section className="mt-10">{datePickerSection()}</section>

            <div className="mb-12">
              <AnalyzeButton
                onClick={() => handleStartClick(onStart)}
                disabled={isDisabled || isDisabled2}
                loading={loading}
                isDone={isAnalysisDone}
                label={language === 'ko' ? '합격운 확인하기' : 'Check Pass Luck'}
                color="blue"
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
            <InterviewAppeal />
          </div>

          <InterviewPreview
            onStart={() => handleStartClick(onStart)}
            isDisabled={isDisabled || isDisabled2}
            userData={userData}
            selections={selections}
            selectedDate={selectedDate}
          />

          {/* [NEW] Primary Action Button below Preview */}
          <div className="mx-w-lg mx-auto mt-8">
            <div className="mb-12 max-w-lg mx-auto">
              <ToTopButton
                onClick={() => handleStartClick(onStart)}
                disabled={isDisabled || isDisabled2}
                loading={loading}
                isDone={isAnalysisDone}
                label={language === 'ko' ? '면접/시험 분석 받기' : 'Get Interview Analysis'}
                color="blue"
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
      selections,
      selectedDate,
      isAnalysisDone
    ],
  );

  // [NEW] Reactive Redirect
  useEffect(() => {
    if (isButtonClicked && !loading && isAnalysisDone && prevData?.result && prevData?.result?.length > 0) {
      router.push('/saju/interview/result');
    }
  }, [isButtonClicked, prevData, router, isAnalysisDone, loading]);

  return (
    <>
      <AnalysisStepContainer
        guideContent={sajuGuide}
        loadingContent={<LoadingFourPillar saju={saju} isTimeUnknown={isTimeUnknown} isAnalysisDone={isAnalysisDone} />}
        resultComponent={null}
        loadingTime={10000000}
      />
    </>
  );
}
