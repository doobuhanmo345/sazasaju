'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import {
  CircleStackIcon,
  CalendarDaysIcon,
  PresentationChartLineIcon,
  BriefcaseIcon,
  SparklesIcon,
  UserGroupIcon,
  CheckCircleIcon,
  ArrowRightIcon,
  ArrowDownIcon,
  LockClosedIcon,
  TicketIcon
} from '@heroicons/react/24/outline';
import { ExclamationTriangleIcon } from '@heroicons/react/24/solid';

import { useAuthContext } from '@/contexts/useAuthContext';
import { useLanguage } from '@/contexts/useLanguageContext';
import { useUsageLimit } from '@/contexts/useUsageLimit';
import { useLoading } from '@/contexts/useLoadingContext';
import { useConsumeEnergy } from '@/hooks/useConsumingEnergy';
import { useSajuCalculator } from '@/hooks/useSajuCalculator';

import Step from '@/components/Step';
import ModifyBd from '@/components/ModifyBd';
import EnergyBadge from '@/ui/EnergyBadge';
import LoadingBar from '@/components/LoadingBar';
import StartButton from '@/ui/StartButton';
import WealthAppeal from '@/app/saju/wealth/WealthAppeal';
import { SajuAnalysisService, AnalysisPresets } from '@/lib/SajuAnalysisService';
import { parseAiResponse } from '@/utils/helpers';
import { UI_TEXT, langPrompt, hanja } from '@/data/constants';

export default function Wealth({ }) {
  const { language } = useLanguage();
  const router = useRouter();
  const { user, userData, selectedProfile } = useAuthContext();
  const { MAX_EDIT_COUNT, isLocked, setEditCount, editCount } = useUsageLimit();
  const { setLoading, setAiResult, handleCancelHelper } = useLoading();
  // 컨텍스트 스위칭
  const targetProfile = selectedProfile || userData;
  const { birthDate: inputDate, isTimeUnknown, gender, saju } = targetProfile || {};
  //컨텍스트 스위칭 끝
  // Client-side Title Update for Localization (Static Export Support)
  useEffect(() => {
    if (language === 'ko') {
      document.title = '재물운 분석 | 나의 부와 금전의 흐름';
    } else {
      document.title = 'Wealth Luck Analysis | Path to Financial Success';
    }
  }, [language]);

  const [step, setStep] = useState(0);
  const [selectedQ, setSelectedQ] = useState(null);
  const [selectedSubQ, setSelectedSubQ] = useState(null);
  const [isCachedLoading, setIsCachedLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [data, setData] = useState(null);
  const [isButtonClicked, setIsButtonClicked] = useState(false);
  const wealthEnergy = useConsumeEnergy();

  const totalStep = 4;

  const Q_TYPES = [
    {
      id: 'capacity',
      label: '평생 재물운',
      sub: 'Lifetime Wealth',
      desc: '타고난 그릇의 크기와 부자 사주 분석',
      descEn: 'Analysis of innate wealth capacity and potential',
      icon: CircleStackIcon,
      color: 'text-amber-500',
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      activeBorder: 'border-amber-500 ring-amber-200',
    },
    {
      id: 'timing',
      label: '올해/내년 흐름',
      sub: 'Yearly Flow',
      desc: '단기적인 자금 흐름과 승부수 타이밍',
      descEn: 'Short-term cash flow and strategic timing',
      icon: CalendarDaysIcon,
      color: 'text-sky-500',
      bg: 'bg-sky-50',
      border: 'border-sky-200',
      activeBorder: 'border-sky-500 ring-sky-200',
    },
    {
      id: 'investment',
      label: '투자 / 재테크',
      sub: 'Investment',
      desc: '주식, 코인, 부동산 등 투기 적합성',
      descEn: 'Suitability for stocks, crypto, and real estate',
      icon: PresentationChartLineIcon,
      color: 'text-rose-500',
      bg: 'bg-rose-50',
      border: 'border-rose-200',
      activeBorder: 'border-rose-500 ring-rose-200',
    },
    {
      id: 'business',
      label: '사업 / 창업운',
      sub: 'Business',
      desc: '내 사업을 해도 되는지, 동업이 좋은지',
      descEn: 'Entrepreneurial potential and partnership luck',
      icon: BriefcaseIcon,
      color: 'text-emerald-500',
      bg: 'bg-emerald-50',
      border: 'border-emerald-200',
      activeBorder: 'border-emerald-500 ring-emerald-200',
    },
  ];

  const SUB_Q_TYPES = {
    capacity: [
      {
        id: 'scale',
        label: '나의 타고난 부의 그릇은?',
        labelEn: 'My innate wealth capacity?',
        desc: '얼마나 벌 수 있는지, 언제 부자가 되는지',
        descEn: 'Potential wealth volume and timing of financial success.',
        prompt: 'Focus on the total volume of wealth and the peak period of life.',
      },
      {
        id: 'style',
        label: '월급 관리형 vs 사업 투자형',
        labelEn: 'Salary Manager vs. Business Investor',
        desc: '안정적인 직점이 맞는지, 내 일이 맞는지',
        descEn: 'Suitability for a stable career vs. running your own business.',
        prompt: 'Analyze whether a stable salary or business income suits this person better.',
      },
      {
        id: 'leak',
        label: '돈이 모이지 않고 새는 이유',
        labelEn: "Why money leaks and doesn't accumulate",
        desc: '재물 창고(재고)와 소비 성향 분석',
        descEn: 'Analysis of wealth retention capacity and spending habits.',
        prompt: "Identify the 'Hole' where money leaks out and suggest a wealth-keeping strategy.",
      },
    ],
    timing: [
      {
        id: 'now',
        label: '당장 이번 달과 다음 달 운세',
        labelEn: 'Luck for this and next month',
        desc: '단기적인 자금 융통과 흐름',
        descEn: 'Short-term cash flow and liquidity analysis.',
        prompt: 'Analyze the financial flow for the current month and the next month specifically.',
      },
      {
        id: 'next_year',
        label: '다가오는 2026년 재물운',
        labelEn: 'Financial luck for 2026',
        desc: '내년의 전체적인 총운과 승부처',
        descEn: 'Overall fortune and key opportunities for the upcoming year.',
        prompt: 'Predict the overall financial fortune and key opportunities for the year 2026.',
      },
      {
        id: 'caution',
        label: '언제 조심해야 할까요? (손재수)',
        labelEn: 'When to be cautious (Financial Loss)',
        desc: '돈이 나가는 시기와 피해야 할 행동',
        descEn: 'Periods of financial loss and actions to avoid.',
        prompt: 'Identify months or periods with high risk of financial loss (Son-jae-su).',
      },
    ],
    investment: [
      {
        id: 'aggressive',
        label: '주식 / 코인 (공격적 투자)',
        labelEn: 'Stocks / Crypto (Aggressive)',
        desc: '변동성이 큰 시장에서의 승률',
        descEn: 'Success rate in high-volatility markets.',
        prompt: 'Analyze suitability for high-risk, high-return investments like stocks or crypto.',
      },
      {
        id: 'real_estate',
        label: '부동산 / 청약 (문서운)',
        labelEn: 'Real Estate (Document Luck)',
        desc: '집을 사도 되는지, 이사 운이 있는지',
        descEn: 'Buying property and luck regarding moving.',
        prompt: 'Analyze luck related to real estate, property documents, and moving.',
      },
      {
        id: 'safe',
        label: '예적금 / 안전 자산',
        labelEn: 'Savings / Safe Assets',
        desc: '지키는 것이 중요한 시기인지 확인',
        descEn: 'Check if asset protection is prioritized over investment.',
        prompt: 'Check if conservative asset management (savings) is better than investing now.',
      },
    ],
    business: [
      {
        id: 'startup',
        label: '내 사업을 시작해도 될까요?',
        labelEn: 'Should I start a business?',
        desc: '창업 시기와 성공 가능성',
        descEn: 'Optimal timing for starting up and success potential.',
        prompt: 'Analyze the timing and potential success for starting a new business.',
      },
      {
        id: 'partnership',
        label: '동업 vs 독자 생존',
        labelEn: 'Partnership vs. Solo',
        desc: '누구와 함께하는 게 좋은지, 혼자가 좋은지',
        descEn: 'Pros and cons of partnership vs. going solo.',
        prompt: 'Analyze whether partnership is beneficial or if they should work alone.',
      },
      {
        id: 'item',
        label: '나에게 맞는 업종/아이템',
        labelEn: 'Suitable Industry/Item',
        desc: '물장사, 금속, 교육 등 오행 기반 추천',
        descEn: 'Industry recommendations based on your Five Elements.',
        prompt: 'Recommend suitable business industries based on their favorable elements.',
      },
    ],
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [step]);

  useEffect(() => {
    let interval;
    if (loading) {
      setProgress(0);
      interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 99) return 99;
          return prev + (isCachedLoading ? 25 : 1);
        });
      }, isCachedLoading ? 50 : 1200);
    } else {
      setProgress(100);
    }
    return () => clearInterval(interval);
  }, [loading, isCachedLoading]);

  const service = new SajuAnalysisService({
    user,
    userData: targetProfile,
    language,
    maxEditCount: MAX_EDIT_COUNT,
    setEditCount,
    setLoading,
    setAiResult,
    handleCancelHelper
  });

  const handleWealthAnalysis = async () => {
    setAiResult('');
    setIsButtonClicked(true);
    const q1 = Q_TYPES.find((i) => i.id === selectedQ)?.desc;
    const q2 = SUB_Q_TYPES?.[selectedQ]?.find((i) => i.id === selectedSubQ)?.desc;
    const qprompt = SUB_Q_TYPES?.[selectedQ]?.find((i) => i.id === selectedSubQ)?.prompt;

    try {
      await service.analyze(
        AnalysisPresets.wealth({
          saju,
          gender,
          q1,
          q2,
          qprompt,
          language,
        })
      );
      setStep(4);
    } catch (error) {
      console.error(error);
    }
  };



  const handleStartClick = () => setStep(1);
  const handleBack = () => step > 1 && setStep(step - 1);
  const handleQNext = () => {
    if (selectedQ) {
      setStep(2);
      setAiResult('');
    }
  };
  const toConfirm = () => setStep(3);
  const prevData = userData?.usageHistory?.ZWealth;
  const isAnalysisDone = (() => { // using IIFE or useMemo
    if (!prevData || !prevData.result) return false;
    if (prevData?.language !== language) return false;
    if (prevData?.gender !== (targetProfile?.gender)) return false;
    if (prevData?.ques !== Q_TYPES.find((i) => i.id === selectedQ)?.desc) return false;
    if (prevData?.ques2 !== SUB_Q_TYPES?.[selectedQ]?.find((i) => i.id === selectedSubQ)?.desc) return false;

    return SajuAnalysisService.compareSaju(prevData.saju, targetProfile?.saju);
  })();

  const isDisabled = (loading && !wealthEnergy.isConsuming) || !user || loading;
  const isDisabled2 = !isAnalysisDone && isLocked;
  useEffect(() => {
    if (isButtonClicked && !loading && isAnalysisDone && prevData?.result && prevData?.result?.length > 0) {
      // [NEW] Reactive Redirect
      router.push('/saju/wealth/result');
    }
  }, [isButtonClicked, prevData, router, isAnalysisDone, loading]);

  return (
    <div className="w-full">
      {step > 0 && step < 4 && (
        <Step
          step={step}
          totalStep={totalStep}
          title={
            step === 1 ? 'Question 1' : step === 2 ? 'Question 2' : step === 3 ? 'Confirm Data' : 'Analysis Result'
          }
          onBack={handleBack}
        />
      )}

      {step === 0 && (
        <div className="w-full animate-in fade-in slide-in-from-bottom-5 duration-700">
          <div className="max-w-lg mx-auto text-center px-6 mb-12">
            <h2 className="text-3xl font-black text-slate-800 dark:text-white mb-4 tracking-tight">
              {language === 'ko' ? '오행으로 읽는' : 'Reading the Five Elements'}
              <br />
              <span className="relative text-emerald-600 dark:text-emerald-500">
                {language === 'ko' ? '평생 재물운 & 투자운' : 'Lifetime Wealth & Investment'}
                <div className="absolute inset-0 bg-emerald-200/50 dark:bg-emerald-800/60 blur-md rounded-full scale-100"></div>
              </span>
            </h2>

            <div className="space-y-4 text-slate-600 dark:text-slate-400 mb-10 leading-relaxed break-keep">
              <p className="text-sm">
                <strong>{language === 'ko' ? '타고난 금전의 그릇' : 'Innate Wealth Capacity'}</strong>
                {language === 'ko' ? '과 ' : ' and '}
                <strong>{language === 'ko' ? '재물이 모이는 시기' : 'Strategic Financial Timing'}</strong>
                {language === 'ko' ? ', 당신의 재물 지도 분석.' : ', Analyzing your financial map.'}
              </p>
              <div className="m-auto max-w-sm rounded-2xl overflow-hidden shadow-sm border border-slate-100 dark:border-slate-800">
                <Image
                  src="/images/introcard/wealth_1.webp"
                  alt="wealth"
                  width={800}
                  height={600}
                  className="w-full h-auto"
                  priority
                />
              </div>
            </div>

            <StartButton
              onClick={handleStartClick}
              disabled={loading}
              isDone={isAnalysisDone}
              label={language === 'ko' ? '나의 재물운 분석하기' : 'Start Wealth Analysis'}
              color="emerald"
            />
          </div>
          <WealthAppeal />
        </div>
      )}

      {step === 1 && (
        <div className="w-full max-w-3xl mx-auto px-1 animate-in fade-in duration-500">
          <div className="flex flex-col gap-6">
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">
                {language === 'ko' ? '어떤 재물운이 궁금하신가요?' : 'What financial insight do you need?'}
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                {language === 'ko' ? '주제를 선택하면 그 주제로 당신의 사주를 정밀하게 분석해 드립니다.' : 'Select a topic for a precise analysis based on your Saju.'}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {Q_TYPES.map((type) => {
                const isSelected = selectedQ === type.id;
                const Icon = type.icon;
                const labelText = language === 'en' ? type.sub : type.label;
                const descText = language === 'en' ? type.descEn : type.desc;

                return (
                  <button
                    key={type.id}
                    onClick={() => setSelectedQ(type.id)}
                    className={`
                      relative flex flex-col items-start p-5 rounded-2xl border-2 transition-all duration-200 text-left group
                      ${isSelected ? `${type.activeBorder} ${type.bg} ring-4 ring-opacity-30` : `border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-indigo-100 dark:hover:border-slate-600 hover:shadow-md`}
                    `}
                  >
                    <div className="flex items-center justify-between w-full mb-3">
                      <div className={`p-2.5 rounded-xl bg-white dark:bg-slate-900 shadow-sm border border-slate-100 dark:border-slate-700 ${isSelected ? 'scale-110' : 'group-hover:scale-110'} transition-transform duration-300`}>
                        <Icon className={`w-6 h-6 ${type.color}`} />
                      </div>
                      {isSelected && <div className="w-3 h-3 rounded-full bg-indigo-500 animate-pulse"></div>}
                    </div>
                    <div>
                      <div className="flex items-baseline gap-1.5 mb-0.5">
                        <span className={`text-base font-bold ${isSelected ? 'text-slate-900 dark:text-slate-700' : 'text-slate-700 dark:text-slate-200'}`}>
                          {labelText}
                        </span>
                        {language !== 'en' && (
                          <span className={`text-xs font-bold uppercase tracking-wider ${isSelected ? 'opacity-70 dark:text-slate-600' : 'text-slate-400'}`}>
                            {type.sub}
                          </span>
                        )}
                      </div>
                      <p className={`text-xs ${isSelected ? 'text-slate-600 dark:text-slate-500' : 'text-slate-400 dark:text-slate-500'}`}>
                        {descText}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="mt-4 flex justify-end">
              <button
                disabled={!selectedQ}
                onClick={handleQNext}
                className={`px-8 py-3.5 rounded-xl text-sm font-bold tracking-wide transition-all shadow-lg ${selectedQ ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-200 translate-y-0' : 'bg-slate-200 dark:bg-slate-700 text-slate-400 cursor-not-allowed shadow-none'}`}
              >
                {language === 'en' ? 'Next Step' : '다음 단계로 (Next)'}
              </button>
            </div>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="w-full max-w-3xl mx-auto px-1 animate-in fade-in duration-500">
          <div className="flex flex-col gap-6">
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">
                {language === 'ko' ? '구체적으로 무엇이 궁금한가요?' : 'What specific details do you need?'}
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                {language === 'ko' ? '선택하신 주제에 맞춰 더 정밀하게 분석해 드립니다.' : 'We will analyze in more detail based on your choice.'}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {(SUB_Q_TYPES[selectedQ] || []).map((sub) => {
                const isSelected = selectedSubQ === sub.id;
                const labelText = language === 'en' ? sub.labelEn : sub.label;
                const descText = language === 'en' ? sub.descEn : sub.desc;

                return (
                  <button
                    key={sub.id}
                    onClick={() => setSelectedSubQ(sub.id)}
                    className={`relative flex flex-col items-start p-5 rounded-2xl border-2 transition-all duration-200 text-left group h-full ${isSelected ? 'border-indigo-500 bg-indigo-50 ring-4 ring-indigo-500 ring-opacity-20' : 'border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-indigo-200 hover:shadow-md'}`}
                  >
                    <div className="flex items-center justify-between w-full mb-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-200 ${isSelected ? 'bg-indigo-500 text-white' : 'bg-slate-100 text-slate-400 group-hover:bg-indigo-100 group-hover:text-indigo-500'}`}>
                        <CheckCircleIcon className="w-5 h-5" />
                      </div>
                    </div>
                    <div className="flex flex-col h-full justify-between">
                      <div>
                        <span className={`text-lg font-bold block mb-1 ${isSelected ? 'text-indigo-900' : 'text-slate-800 dark:text-slate-100'}`}>
                          {labelText}
                        </span>
                        <p className={`text-sm ${isSelected ? 'text-indigo-700' : 'text-slate-500 dark:text-slate-400'}`}>
                          {descText}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                disabled={!selectedSubQ || !!loading}
                onClick={toConfirm}
                className={`flex items-center gap-2 px-8 py-3.5 rounded-xl text-sm font-bold tracking-wide transition-all shadow-lg ${selectedSubQ && !loading ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-200 translate-y-0' : 'bg-slate-200 dark:bg-slate-700 text-slate-400 cursor-not-allowed shadow-none'}`}
              >
                <SparklesIcon className="w-4 h-4" />
                {language === 'en' ? 'Next' : '다음'}
              </button>
            </div>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="w-full max-w-2xl mx-auto px-1 animate-in fade-in duration-500">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
            {(() => {
              const qData = Q_TYPES.find((r) => r.id === selectedQ);
              const RelIcon = qData?.icon || UserGroupIcon;
              const qLabel = language === 'en' ? qData?.sub : qData?.label;
              return (
                <div className={`flex items-center gap-3 px-5 py-3 rounded-2xl border-2 shadow-sm w-full sm:w-auto ${qData?.bg || 'bg-slate-50'} ${qData?.border || 'border-slate-200'} dark:bg-slate-800 dark:border-slate-700`}>
                  <div className={`p-2 rounded-full bg-white dark:bg-slate-900 shadow-sm ${qData?.color || 'text-slate-400'}`}>
                    <RelIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">Topic</span>
                    <span className={`text-base sm:text-lg font-bold ${qData?.color ? 'text-slate-700 dark:text-slate-200' : 'text-slate-700 dark:text-slate-200'}`}>
                      {qLabel}
                    </span>
                  </div>
                </div>
              );
            })()}

            <div className="text-slate-300 dark:text-slate-600">
              <ArrowRightIcon className="w-6 h-6 hidden sm:block" />
              <ArrowDownIcon className="w-6 h-6 block sm:hidden" />
            </div>

            {(() => {
              const subData = (SUB_Q_TYPES[selectedQ] || []).find((r) => r.id === selectedSubQ);
              if (!subData) return null;
              const subLabel = language === 'en' ? subData.labelEn : subData.label;
              return (
                <div className="flex items-center gap-3 px-5 py-3 rounded-2xl border-2 border-indigo-100 bg-indigo-50 dark:bg-slate-800 dark:border-indigo-900 shadow-sm w-full sm:w-auto">
                  <div className="p-2 rounded-full bg-white dark:bg-slate-900 shadow-sm text-indigo-500">
                    <SparklesIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-xs uppercase font-bold text-indigo-400 tracking-wider">Detail</span>
                    <span className="text-base sm:text-lg font-bold text-indigo-900 dark:text-indigo-100">{subLabel}</span>
                  </div>
                </div>
              );
            })()}
          </div>

          <div className="my-5 flex justify-center">
            {loading && <LoadingBar progress={progress} loadingType="wealth" isCachedLoading={isCachedLoading} />}
          </div>

          <div className="flex justify-center">
            <button
              onClick={() => wealthEnergy.triggerConsume(handleWealthAnalysis)}
              disabled={isDisabled || isDisabled2}
              className={`w-full sm:w-auto px-10 py-4 font-bold rounded-xl shadow-lg transform transition-all flex items-center justify-center gap-2 ${isDisabled ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200' : 'bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-indigo-200 hover:-translate-y-1'}`}
            >
              <SparklesIcon className="w-5 h-5 animate-pulse" />
              <span>{language === 'en' ? 'Start Analysis' : '분석 시작하기'}</span>
              {isAnalysisDone ? (
                <div className="flex items-center gap-1 backdrop-blur-md bg-white/20 px-2 py-0.5 rounded-full border border-white/30">
                  <span className="text-[9px] font-bold text-white uppercase">Free</span>
                  <TicketIcon className="w-3 h-3 text-white" />
                </div>
              ) : isLocked ? (
                <div className="mt-1 flex items-center gap-1 backdrop-blur-sm px-2 py-0.5 rounded-full border shadow-sm border-gray-500/50 bg-gray-400/40">
                  <LockClosedIcon className="w-4 h-4 text-amber-500" />
                </div>
              ) : user && (
                <div className="relative scale-90">
                  <EnergyBadge active={!!userData?.birthDate} consuming={loading} cost={-1} />
                </div>
              )}
            </button>
          </div>
          {isLocked ? (
            <p className="text-center mt-4 text-rose-600 font-black text-sm flex items-center justify-center gap-1 animate-pulse">
              <ExclamationTriangleIcon className="w-4 h-4" />
              {language === 'ko' ? '크레딧이 부족합니다..' : 'not Enough credit'}
            </p>
          ) : (
            <p className="text-center mt-4 text-sm text-slate-400">
              {language === 'ko' ? '이미 분석된 운세는 크래딧을 재소모하지 않습니다.' : 'Fortunes that have already been analyzed do not use credits.'}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
