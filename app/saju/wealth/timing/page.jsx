'use client';

import { useRouter } from 'next/navigation';
import Image from 'next/image';
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
    const isKo = language === 'ko'
    useEffect(() => {
        if (language === 'ko') {
            document.title = '단기 재물운 흐름 분석 | 단기 자금 흐름';
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
        const q1 = isKo ? '올해/내년 흐름' : 'This year/Next year flow';
        const q2 = prompt
        const qprompt = null

        try {
            const preset = AnalysisPresets.wealth({
                saju,
                gender,
                q1,
                q2,
                qprompt,

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
            <div className="mx-auto  text-center px-6 animate-in fade-in slide-in-from-bottom-5 duration-700">
                <div>
                    <h2 className="text-3xl font-black text-slate-800 dark:text-white mb-4 tracking-tight">
                        {language === 'ko' ? '재물 흐름의 결정적 순간' : "The Critical Moment of Wealth Flow"}

                        <br />
                        <span className="relative text-cyan-600 dark:text-cyan-500">
                            {language === 'ko' ? '단기 자금부터 2026년 재물운까지' : "From Short-Term Cash Flow to 2026 Wealth Outlook"}
                            <div className="absolute inset-0 bg-cyan-200/50 dark:bg-cyan-800/60 blur-md rounded-full scale-100"></div>
                        </span>
                    </h2>

                </div>
                <div className="space-y-4 text-slate-600 dark:text-slate-400 mb-10 leading-relaxed break-keep">
                    {language === 'ko' ? (
                        <>
                            단기 자금 흐름부터 <strong>2026년 재물운</strong>까지 한눈에. <br />
                            기회 구간과 <strong>손재수 주의 시기</strong>를 명확히 알려드립니다.
                        </>
                    ) : (
                        <>
                            From short-term cash flow to your <strong>2026 wealth forecast</strong>. <br />
                            Clearly identify opportunity windows and financial risk periods.
                        </>
                    )}


                    <div className="m-auto max-w-sm rounded-[2rem] overflow-hidden shadow-sm border border-slate-100 dark:border-slate-800 relative z-0"
                        style={{ maskImage: 'linear-gradient(to bottom, black 60%, transparent 100%)', WebkitMaskImage: 'linear-gradient(to bottom, black 60%, transparent 100%)' }}>
                        <Image
                            src="/images/introcard/ledger.webp"
                            alt="today's luck"
                            width={800}
                            height={600}
                            className="w-full h-auto opacity-90"
                            priority
                        />
                    </div>
                </div>
                <div className="max-w-md mx-auto px-4 -mt-20 relative z-10">
                    {/* Question Selection */}
                    <div className="mb-4">
                        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-6 px-1 flex items-center gap-2">
                            <span className="w-1.5 h-6 bg-cyan-500 rounded-full inline-block"></span>
                            {language === 'ko' ? '궁금한 주제 선택' : 'Select a Topic'}
                        </h2>
                        <div className="flex flex-col gap-2">
                            {SUB_Q_TYPES.map((sub) => {
                                const isSelected = selectedSubQ === sub.id;
                                const labelText = language !== 'ko' ? sub.labelEn : sub.label;
                                const descText = language !== 'ko' ? sub.descEn : sub.desc;

                                return (
                                    <button
                                        key={sub.id}
                                        onClick={() => selectSubQ(sub.id)}
                                        className={`w-full text-left px-5 py-4 rounded-2xl transition-all duration-200 border relative overflow-hidden group ${isSelected
                                            ? 'bg-cyan-50 dark:bg-cyan-900/20 border-cyan-500 dark:border-cyan-500/50 shadow-sm ring-1 ring-cyan-500/20'
                                            : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-800 hover:border-cyan-200 dark:hover:border-cyan-800 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                                            }`}
                                    >
                                        <div className="flex items-center justify-between relative z-10">
                                            <div>
                                                <h3 className={`font-bold text-[15px] transition-colors ${isSelected ? 'text-cyan-800 dark:text-cyan-300' : 'text-slate-700 dark:text-slate-200'
                                                    }`}>
                                                    {labelText}
                                                </h3>
                                                <p className={`text-xs mt-0.5 transition-colors ${isSelected ? 'text-cyan-600/80 dark:text-cyan-400/70' : 'text-slate-400 dark:text-slate-500'
                                                    }`}>
                                                    {descText}
                                                </p>
                                            </div>
                                            <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${isSelected
                                                ? 'bg-cyan-500 border-cyan-500 scale-110'
                                                : 'border-slate-300 dark:border-slate-600 group-hover:border-cyan-300'
                                                }`}>
                                                {isSelected && (
                                                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                    </svg>
                                                )}
                                            </div>
                                        </div>
                                        {/* Subtle highlight effect on hover */}
                                        {!isSelected && <div className="absolute inset-0 bg-cyan-50/0 group-hover:bg-cyan-50/30 transition-colors duration-300"></div>}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {selectedSubQ && (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">

                            {/* Analysis Button */}
                            <div className="flex flex-col items-center gap-4 py-8">
                                <AnalyzeButton
                                    onClick={() => wealthEnergy.triggerConsume(handleAnalysis)}
                                    disabled={isDisabled || isDisabled2}
                                    isDone={isAnalysisDone}
                                    language={language}
                                    label={language !== 'ko' ? 'Start Analysis' : '분석 시작하기'}
                                    cost={-1}
                                    color="cyan"
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
                                {language === 'ko' ? '위에서 기간을 선택해 주세요' : 'Please select a period above'}
                            </p>
                        </div>
                    )}
                </div>

            </div>


        </div>
    );
}
