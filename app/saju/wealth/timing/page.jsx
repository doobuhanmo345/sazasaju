'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { CalendarDaysIcon, SparklesIcon, ExclamationTriangleIcon, LockClosedIcon, TicketIcon } from '@heroicons/react/24/outline';
import { useAuthContext } from '@/contexts/useAuthContext';
import { useLanguage } from '@/contexts/useLanguageContext';
import { useUsageLimit } from '@/contexts/useUsageLimit';
import { useConsumeEnergy } from '@/hooks/useConsumingEnergy';
import { useLoading } from '@/contexts/useLoadingContext';
import EnergyBadge from '@/ui/EnergyBadge';
import LoadingBar from '@/components/LoadingBar';
import { SajuAnalysisService, AnalysisPresets } from '@/lib/SajuAnalysisService';

export default function TimingPage() {
    const { language } = useLanguage();
    const router = useRouter();
    const { user, userData, selectedProfile } = useAuthContext();
    const { MAX_EDIT_COUNT, isLocked, setEditCount } = useUsageLimit();
    const { loading, setLoading, setAiResult } = useLoading();
    const targetProfile = selectedProfile || userData;
    const { gender, saju } = targetProfile || {};
    const wealthEnergy = useConsumeEnergy();

    const [selectedSubQ, setSelectedSubQ] = useState(null);
    const [step, setStep] = useState(0);
    const [isButtonClicked, setIsButtonClicked] = useState(false);
    const [isCachedLoading, setIsCachedLoading] = useState(false);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        if (language === 'ko') {
            document.title = '올해/내년 흐름 분석 | 단기 자금 흐름';
        } else {
            document.title = 'Yearly Flow Analysis | Short-term Cash Flow';
        }
    }, [language]);

    useEffect(() => {
        let interval;
        if (loading) {
            setProgress(0);
            interval = setInterval(() => {
                setProgress((prev) => {
                    if (prev >= 99) return 99;
                    return prev + (isCachedLoading ? 25 : 1);
                });
            }, isCachedLoading ? 50 : 232);
        } else {
            setProgress(100);
        }
        return () => clearInterval(interval);
    }, [loading, isCachedLoading]);

    const SUB_Q_TYPES = [
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
    ];

    const service = new SajuAnalysisService({
        user,
        userData: targetProfile,
        language,
        maxEditCount: MAX_EDIT_COUNT,
        setEditCount,
        setLoading,
        setAiResult,
    });

    const prevData = userData?.usageHistory?.ZWealthTiming;
    const isAnalysisDone = (() => {
        if (!prevData || !prevData.result) return false;
        if (prevData?.language !== language) return false;
        if (prevData?.gender !== targetProfile?.gender) return false;
        if (prevData?.ques !== '올해/내년 흐름') return false;
        if (prevData?.ques2 !== SUB_Q_TYPES.find((i) => i.id === selectedSubQ)?.desc) return false;
        return SajuAnalysisService.compareSaju(prevData.saju, targetProfile?.saju);
    })();

    const handleAnalysis = async () => {
        setAiResult('');
        setIsButtonClicked(true);
        const q1 = '올해/내년 흐름';
        const q2 = SUB_Q_TYPES.find((i) => i.id === selectedSubQ)?.desc;
        const qprompt = SUB_Q_TYPES.find((i) => i.id === selectedSubQ)?.prompt;

        try {
            const preset = AnalysisPresets.wealth({
                saju,
                gender,
                q1,
                q2,
                qprompt,
                language,
            });
            preset.type = 'wealthTiming';
            preset.cacheKey = 'ZWealthTiming';

            await service.analyze(preset);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        if (isButtonClicked && !loading && isAnalysisDone && prevData?.result && prevData?.result?.length > 0) {
            router.push('/saju/wealth/timing/result');
        }
    }, [isButtonClicked, prevData, router, isAnalysisDone, loading]);

    const isDisabled = (loading && !wealthEnergy.isConsuming) || !user || loading;
    const isDisabled2 = !isAnalysisDone && isLocked;

    return (
        <div className="w-full max-w-3xl mx-auto px-4 py-8 animate-in fade-in duration-500">
            {step === 0 && (
                <>
                    <div className="text-center mb-8">
                        <div className="flex justify-center mb-4">
                            <div className="p-4 rounded-2xl bg-sky-50 dark:bg-sky-900/20 border-2 border-sky-200 dark:border-sky-800">
                                <CalendarDaysIcon className="w-12 h-12 text-sky-500" />
                            </div>
                        </div>
                        <h2 className="text-2xl font-black text-slate-800 dark:text-white mb-2">
                            {language === 'ko' ? '올해/내년 흐름' : 'Yearly Flow'}
                        </h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            {language === 'ko' ? '단기적인 자금 흐름과 승부수 타이밍' : 'Short-term cash flow and strategic timing'}
                        </p>
                    </div>

                    <div className="mb-8">
                        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4 text-center">
                            {language === 'ko' ? '구체적으로 무엇이 궁금한가요?' : 'What specific details do you need?'}
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {SUB_Q_TYPES.map((sub) => {
                                const isSelected = selectedSubQ === sub.id;
                                const labelText = language === 'en' ? sub.labelEn : sub.label;
                                const descText = language === 'en' ? sub.descEn : sub.desc;

                                return (
                                    <button
                                        key={sub.id}
                                        onClick={() => {
                                            setSelectedSubQ(sub.id);
                                            setStep(1);
                                        }}
                                        className={`relative flex flex-col items-start p-5 rounded-2xl border-2 transition-all duration-200 text-left group h-full ${isSelected
                                            ? 'border-sky-500 bg-sky-50 ring-4 ring-sky-500 ring-opacity-20'
                                            : 'border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-sky-200 hover:shadow-md'
                                            }`}
                                    >
                                        <span className={`text-base font-bold block mb-1 ${isSelected ? 'text-sky-900' : 'text-slate-800 dark:text-slate-100'}`}>
                                            {labelText}
                                        </span>
                                        <p className={`text-sm ${isSelected ? 'text-sky-700' : 'text-slate-500 dark:text-slate-400'}`}>
                                            {descText}
                                        </p>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </>
            )}

            {step === 1 && (
                <>
                    <div className="text-center mb-6">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-sky-50 dark:bg-sky-900/20 border border-sky-200 dark:border-sky-800 mb-4">
                            <CalendarDaysIcon className="w-5 h-5 text-sky-500" />
                            <span className="text-sm font-bold text-sky-900 dark:text-sky-100">
                                {language === 'en' ? SUB_Q_TYPES.find((s) => s.id === selectedSubQ)?.labelEn : SUB_Q_TYPES.find((s) => s.id === selectedSubQ)?.label}
                            </span>
                        </div>
                        <button
                            onClick={() => setStep(0)}
                            className="text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                        >
                            {language === 'ko' ? '← 다른 질문 선택' : '← Choose different question'}
                        </button>
                    </div>

                    {loading && <LoadingBar progress={progress} loadingType="wealth" isCachedLoading={isCachedLoading} />}

                    <div className="flex justify-center mt-8">
                        <button
                            onClick={() => wealthEnergy.triggerConsume(handleAnalysis)}
                            disabled={isDisabled || isDisabled2}
                            className={`w-full sm:w-auto px-10 py-4 font-bold rounded-xl shadow-lg transform transition-all flex items-center justify-center gap-2 ${isDisabled || isDisabled2
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
                                : 'bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white shadow-sky-200 hover:-translate-y-1'
                                }`}
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
                                    <LockClosedIcon className="w-4 h-4 text-sky-500" />
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
                        <p className="text-center mt-4 text-[11px] text-slate-400">
                            {language === 'ko' ? '이미 분석된 운세는 크래딧을 재소모하지 않습니다.' : 'Fortunes that have already been analyzed do not use credits.'}
                        </p>
                    )}
                </>
            )}
        </div>
    );
}
