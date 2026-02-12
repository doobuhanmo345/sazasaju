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
import LoadingFourPillar from '@/components/LoadingFourPillar';
import { SajuAnalysisService, AnalysisPresets } from '@/lib/SajuAnalysisService';
import AnalyzeButton from '@/ui/AnalyzeButton';
import { getPromptFromDB } from '@/lib/SajuAnalysisService';
import { calculateSaju } from '@/lib/sajuCalculator';
export default function TimingPage() {
    const { language } = useLanguage();
    const router = useRouter();
    const { user, userData, selectedProfile } = useAuthContext();
    const { MAX_EDIT_COUNT, isLocked, setEditCount } = useUsageLimit();
    const { loading, setLoading, setAiResult, handleCancelHelper } = useLoading();
    const targetProfile = selectedProfile || userData;
    const { gender, saju, isTimeUnknown } = targetProfile || {};
    const wealthEnergy = useConsumeEnergy();
    const [prompt, setPrompt] = useState('');
    const [selectedSubQ, setSelectedSubQ] = useState(null);
    const [isButtonClicked, setIsButtonClicked] = useState(false);

    useEffect(() => {
        if (language === 'ko') {
            document.title = '올해/내년 흐름 분석 | 단기 자금 흐름';
        } else {
            document.title = 'Yearly Flow Analysis | Short-term Cash Flow';
        }
    }, [language]);



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
            id: 'nextyear',
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
        handleCancelHelper
    });

    const prevData = userData?.usageHistory?.ZWealthTiming;
    const isAnalysisDone = (() => {
        if (!prevData || !prevData.result) return false;
        if (prevData?.language !== language) return false;
        if (prevData?.gender !== targetProfile?.gender) return false;
        if (prevData?.ques !== '올해/내년 흐름') return false;
        if (prevData?.ques2 !== prompt) return false;
        return SajuAnalysisService.compareSaju(prevData.saju, targetProfile?.saju);
    })();

    const selectSubQ = async (subQid) => {
        setSelectedSubQ(subQid);
        //월별
        const fetchPrompts = async () => {
            try {
                const q2 = await getPromptFromDB(`wealth_timing_${subQid}`);

                const today = new Date();
                // Use 15th for middle of the month to safely get the month pillar (Jeolgi transition usually happens around 4-8th)
                const currentMonthMid = new Date(today.getFullYear(), today.getMonth(), 15);
                const nextMonthMid = new Date(today.getFullYear(), today.getMonth() + 1, 15);
                const currentYear = new Date(today.getFullYear(), 5, 1)
                const currentPillar = calculateSaju(currentMonthMid);
                const nextPillar = calculateSaju(nextMonthMid);
                const thisYearPillar = calculateSaju(currentYear);

                if (currentPillar && nextPillar) {
                    const currentStr = `${currentPillar.sky2}${currentPillar.grd2}`;
                    const nextStr = `${nextPillar.sky2}${nextPillar.grd2}`;
                    const thisYearStr = `${thisYearPillar.sky3}${thisYearPillar.grd3}`;
                    const month = language === 'ko'
                        ? ` (이번달(${today.getMonth() + 1}월) 월주: ${currentStr}, 다음달(${today.getMonth() + 2}월) 월주: ${nextStr})`
                        : ` (Current Month(${today.getMonth() + 1}) Pillar: ${currentStr}, Next Month(${today.getMonth() + 2}) Pillar: ${nextStr})`;
                    const year = language === 'ko'
                        ? ` (올해(${today.getFullYear()}년) 연주: ${thisYearStr})`
                        : ` (Current Year(${today.getFullYear()}) Pillar: ${thisYearStr})`;
                    switch (subQid) {
                        case 'now':
                            if (q2) setPrompt(month + q2);
                            break;
                        case 'nextyear':
                            if (q2) setPrompt(year + q2);
                            break;
                        case 'caution':
                            if (q2) setPrompt(month + q2);
                            break;
                    }


                }
            } catch (error) {
                console.error('Failed to fetch prompts:', error);
            } finally {

            }
        };
        fetchPrompts();




    }

    const handleAnalysis = async () => {
        setAiResult('');
        setIsButtonClicked(true);
        const q1 = '올해/내년 흐름';
        const q2 = prompt
        const qprompt = null

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

    // Full-screen loading display
    if (loading && saju) {
        return <LoadingFourPillar saju={saju} isTimeUnknown={isTimeUnknown} isAnalysisDone={isAnalysisDone} />;
    }

    return (
        <div className="w-full animate-in fade-in duration-500">
            <div className="relative bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 border-b border-sky-100 dark:border-slate-700">
                <div className="max-w-4xl mx-auto px-4 py-16 text-center">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-sky-500 to-blue-600 mb-6 shadow-2xl shadow-sky-300 dark:shadow-sky-900/50">
                        <CalendarDaysIcon className="w-11 h-11 text-white" />
                    </div>
                    <h1 className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white mb-4 leading-tight">
                        {language === 'ko' ? '올해/내년 흐름 분석' : 'Yearly Flow Analysis'}
                    </h1>
                    <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
                        {language === 'ko'
                            ? '단기적인 자금 흐름과 승부수 타이밍을 분석합니다'
                            : 'Analyze short-term cash flow and strategic timing'}
                    </p>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 py-12">
                <div className="mb-8">
                    <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 mb-8 text-center">
                        {language === 'ko' ? '언제의 운세가 궁금하신가요?' : 'Which period are you curious about?'}
                    </h2>
                    <div className="grid grid-cols-1 gap-4">
                        {SUB_Q_TYPES.map((sub) => {
                            const isSelected = selectedSubQ === sub.id;
                            const labelText = language === 'en' ? sub.labelEn : sub.label;
                            const descText = language === 'en' ? sub.descEn : sub.desc;

                            return (
                                <button
                                    key={sub.id}
                                    onClick={() => selectSubQ(sub.id)}
                                    className={`relative flex items-center gap-4 p-6 rounded-2xl border-2 transition-all duration-200 text-left group ${isSelected
                                        ? 'border-sky-500 bg-sky-50 dark:bg-sky-900/20 shadow-lg shadow-sky-100 dark:shadow-sky-900/20 scale-[1.02]'
                                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-sky-300 hover:shadow-md'
                                        }`}
                                >
                                    <div className={`flex-shrink-0 w-14 h-14 rounded-xl flex items-center justify-center transition-all ${isSelected
                                        ? 'bg-sky-500 text-white shadow-lg'
                                        : 'bg-slate-100 dark:bg-slate-700 text-slate-400 group-hover:bg-sky-100 group-hover:text-sky-500'
                                        }`}>
                                        <CalendarDaysIcon className="w-7 h-7" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className={`text-lg font-bold mb-1 ${isSelected ? 'text-sky-900 dark:text-sky-100' : 'text-slate-800 dark:text-slate-100'
                                            }`}>
                                            {labelText}
                                        </h3>
                                        <p className={`text-sm ${isSelected ? 'text-sky-700 dark:text-sky-300' : 'text-slate-500 dark:text-slate-400'
                                            }`}>
                                            {descText}
                                        </p>
                                    </div>
                                    {isSelected && (
                                        <div className="flex-shrink-0">
                                            <div className="w-6 h-6 rounded-full bg-sky-500 flex items-center justify-center">
                                                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                </svg>
                                            </div>
                                        </div>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {selectedSubQ && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">

                        <div className="flex flex-col items-center gap-4 py-8">

                            <AnalyzeButton
                                onClick={() => wealthEnergy.triggerConsume(handleAnalysis)}
                                disabled={isDisabled || isDisabled2}
                                isDone={isAnalysisDone}
                                language={language}
                                label={language === 'en' ? 'Start Analysis' : '분석 시작하기'}
                                cost={-1}
                                color="blue"
                            />

                            {isLocked ? (
                                <p className="text-rose-600 font-bold text-sm flex items-center gap-2 animate-pulse">
                                    <ExclamationTriangleIcon className="w-5 h-5" />
                                    {language === 'ko' ? '크레딧이 부족합니다' : 'Not Enough Credit'}
                                </p>
                            ) : (
                                <p className="text-xs text-slate-400">
                                    {language === 'ko' ? '이미 분석된 운세는 크래딧을 재소모하지 않습니다.' : 'Already analyzed fortunes do not consume credits.'}
                                </p>
                            )}
                        </div>
                    </div>
                )}

                {!selectedSubQ && (
                    <div className="text-center py-12">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 mb-4">
                            <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
                            </svg>
                        </div>
                        <p className="text-slate-400 text-sm">
                            {language === 'ko' ? '위에서 기간을 선택해주세요' : 'Please select a period above'}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
