'use client';

import { useRef, useState, useEffect } from 'react';
import { AnalysisStepContainer } from '@/components/AnalysisStepContainer';
import { useAuthContext } from '@/contexts/useAuthContext';
import { useUsageLimit } from '@/contexts/useUsageLimit';
import { useLoading } from '@/contexts/useLoadingContext';
import { UI_TEXT } from '@/data/constants';
import { useLanguage } from '@/contexts/useLanguageContext';
import { langPrompt, hanja } from '@/data/constants';
import { calculateSaju } from '@/lib/sajuCalculator';
import LoadingFourPillar from '@/components/LoadingFourPillar';
import { SajuAnalysisService, AnalysisPresets } from '@/lib/SajuAnalysisService';
import CustomCalendar from '@/components/CustomCalendar';
import ReportTemplateToday from '@/app/saju/dayluck/ReportTemplateToday';


export default function DayLuckPage() {
  const { setLoadingType, aiResult, setAiResult } = useLoading();
  const [selectedDate, setSelectedDate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [question, setQuestion] = useState('');
  const [selectedDateSaju, setSelectedDateSaju] = useState(null);
  const { userData, user, isDailyDone } = useAuthContext();
  const { birthDate: inputDate, isTimeUnknown, gender, saju } = userData || {};

  const { language } = useLanguage();
  const { editCount, setEditCount, MAX_EDIT_COUNT, isLocked } = useUsageLimit();

  const DISABLED_STYLE = 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200';
  const isDisabled = !user || loading || !selectedDate;
  const isDisabled2 = !isDailyDone && isLocked;

  const formatDateForInput = (date) => {
    if (!date) return '';
    const d = new Date(date);
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${d.getFullYear()}-${month}-${day}`;
  };

  const parseDateFromInput = (dateString) => {
    if (!dateString) return null;
    const [year, month, day] = dateString.split('-').map(Number);
    return new Date(year, month - 1, day);
  };
  const selDate = formatDateForInput(selectedDate) + 'T12:00';

  useEffect(() => {
    if (selectedDate) {
      const timeUnknown = true;
      const result = calculateSaju(selDate, timeUnknown);
      setSelectedDateSaju(result.saju);
    }
  }, [selectedDate]);

  const service = new SajuAnalysisService({
    user,
    userData,
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
      await service.analyze(
        AnalysisPresets.dailySpecific({
          saju: saju,
          gender: gender,
          language: language,
          selectedDate: selectedDate,
          question: question,
          sajuDate: selectedDateSaju,
          promptAdd: '',
          type: 'dayluck',
        }),
      );
      onstart();
    } catch (error) {
      console.error(error);
    }
  };

  const datePickerSection = () => {
    const today = new Date();

    return (
      <div className="w-full max-w-xl mx-auto py-8">
        <div className="mb-6">
          <label className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 block mb-4">
            {language === 'ko' ? '01. 날짜 선택' : '01. Select Date'}
          </label>

          <CustomCalendar selectedDate={selectedDate} setSelectedDate={setSelectedDate} />
        </div>

        <div className="mt-10 pt-10 border-t border-slate-100 dark:border-slate-800">
          <div className="flex justify-between items-end mb-4">
            <label className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
              {language === 'ko' ? '02. 질문' : '02. Question'}
            </label>
            {selectedDate && (
              <span className="text-[11px] font-medium text-slate-900 dark:text-white border-b border-slate-900 dark:border-white pb-0.5">
                {selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </span>
            )}
          </div>
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder={language === 'ko' ? '어떤 것이 궁금하신가요?' : "What's on your mind?"}
            className="w-full px-0 py-3 text-base bg-transparent border-none text-slate-900 dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-600 focus:outline-none focus:ring-0 resize-none min-h-[100px]"
          />
        </div>
      </div>
    );
  };

  const sajuGuide = (onStart) => {
    if (loading) {
      return <LoadingFourPillar saju={saju} isTimeUnknown={isTimeUnknown} />;
    }

    return (
      <div className="max-w-md mx-auto px-6 py-12 animate-in fade-in slide-in-from-bottom-3 duration-1000">
        <header className=" text-right">
          <div className="inline-block px-2 py-1 mb-4 bg-slate-50 dark:bg-slate-800 rounded text-[10px] font-black tracking-[0.2em] text-slate-400 dark:text-slate-500 uppercase">
            Initial Spark
          </div>
          <h2 className="text-4xl font-light text-slate-900 dark:text-white leading-[1.1] tracking-tight">
            {language === 'ko' ? '사자가 읽어주는' : 'Reading for'} <br />
            <span className="font-serif italic font-medium text-rose-500/80">
              {language === 'ko' ? '특별한 하루' : 'your special day'}
            </span>
          </h2>

          <p className="mt-6 text-[13px] text-slate-400 dark:text-slate-500 leading-relaxed w-full">
            {language === 'ko' ? (
              <>
                새로운 인연이 기다리는 날, <br />
                <span className="text-slate-600 dark:text-slate-300 font-medium">
                  그 사람과 잘 맞을까?
                </span>{' '}
                정교하게 읽어드립니다.
              </>
            ) : (
              <>
                On a day of new beginnings, <br />
                <span className="text-slate-600 dark:text-slate-300 font-medium">
                  we'll read how beautifully your universes align
                </span>{' '}
                with that special someone.
              </>
            )}
          </p>
        </header>

        <section className="mb-12">{datePickerSection()}</section>

        <footer className="space-y-6">
          <button
            onClick={() => handleStartClick(onStart)}
            disabled={isDisabled || isDisabled2}
            className={classNames(
              'w-full py-5 text-sm font-bold tracking-widest uppercase transition-all duration-500',
              isDisabled
                ? 'text-slate-300 cursor-not-allowed bg-slate-50 dark:bg-slate-800'
                : 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:opacity-90 active:scale-[0.98]',
            )}
          >
            <div className="flex items-center justify-center gap-3">
              {language === 'ko' ? '운세 확인하기' : 'Check Fortune'}

              {false ? (
                <span className="text-[10px] px-2 py-0.5 border border-white/30 rounded text-white/70 font-medium">
                  FREE
                </span>
              ) : isLocked ? (
                <LockClosedIcon className="w-4 h-4 text-rose-400" />
              ) : (
                user && <EnergyBadge active={userData?.birthDate} consuming={loading} cost={-1} />
              )}
            </div>
          </button>
        </footer>
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

  return (
    <>
      <AnalysisStepContainer
        guideContent={sajuGuide}
        loadingContent={<LoadingFourPillar saju={saju} isTimeUnknown={isTimeUnknown} />}
        resultComponent={ReportTemplateToday}
        loadingTime={0}
      />
    </>
  );
}
