'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { PresentationChartLineIcon, SparklesIcon, ExclamationTriangleIcon, LockClosedIcon, TicketIcon } from '@heroicons/react/24/outline';
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

export default function InvestmentPage() {
    const { language } = useLanguage();
    const router = useRouter();
    const { user, userData, selectedProfile } = useAuthContext();
    const { MAX_EDIT_COUNT, isLocked, setEditCount } = useUsageLimit();
    const { loading, setLoading, setAiResult, handleCancelHelper } = useLoading();
    const targetProfile = selectedProfile || userData;
    const { gender, saju, isTimeUnknown } = targetProfile || {};
    const wealthEnergy = useConsumeEnergy();
    const [prompt, setPrompt] = useState()
    const [selectedSubQ, setSelectedSubQ] = useState(null);
    const [isButtonClicked, setIsButtonClicked] = useState(false);





    const SUB_Q_TYPES = [
        {
            id: 'aggressive',
            label: '주식 / 코인 (공격적 투자)',
            labelEn: 'Stocks / Crypto (Aggressive)',
            desc: '변동성이 큰 시장에서의 승률',
            descEn: 'Success rate in high-volatility markets.',
            prompt: 'Analyze suitability for high-risk, high-return investments like stocks or crypto.',
        },
        {
            id: 'realestate',
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

    const prevData = userData?.usageHistory?.ZWealthInvestment;
    const isAnalysisDone = (() => {
        if (!prevData || !prevData.result) return false;
        if (prevData?.language !== language) return false;
        if (prevData?.gender !== targetProfile?.gender) return false;
        if (prevData?.ques !== '투자 / 재테크') return false;
        if (prevData?.ques2 !== prompt) return false;
        return SajuAnalysisService.compareSaju(prevData.saju, targetProfile?.saju);
    })();
    const selectSubQ = async (subQid) => {
        setSelectedSubQ(subQid);
        const origin = SUB_Q_TYPES.find((i) => i.id === subQid);

        // const today = new Date();
        // const currentMonthMid = new Date(today.getFullYear(), today.getMonth(), 15);
        // const nextMonthMid = new Date(today.getFullYear(), today.getMonth() + 1, 15);

        // const currentPillar = calculateSaju(currentMonthMid);
        // const nextPillar = calculateSaju(nextMonthMid);

        // if (currentPillar && nextPillar) {
        //     const currentStr = `${currentPillar.sky2}${currentPillar.grd2}`;
        //     const nextStr = `${nextPillar.sky2}${nextPillar.grd2}`;
        //     const suffix = language === 'ko'
        //         ? ` (이번달(${today.getMonth() + 1}월) 월주: ${currentStr}, 다음달(${today.getMonth() + 2}월) 월주: ${nextStr})`
        //         : ` (Current Month(${today.getMonth() + 1}) Pillar: ${currentStr}, Next Month(${today.getMonth() + 2}) Pillar: ${nextStr})`;
        //     origin.desc += suffix;
        // }
        const fetchPrompts = async () => {
            try {
                const q2 = await getPromptFromDB(`wealth_investment_${subQid}`);


                if (q2) setPrompt(q2);
            } catch (error) {
                console.error('Failed to fetch prompts:', error);
            } finally {

            }
        };
        fetchPrompts();
        // setPrompt(origin.desc);
    }


    const handleAnalysis = async () => {
        setAiResult('');
        setIsButtonClicked(true);
        const q1 = '투자 / 재테크';
        const q2 = prompt;
        try {
            const preset = AnalysisPresets.wealth({
                saju,
                gender,
                q1,
                q2,
                qprompt: null,
                language,
            });
            preset.type = 'wealthInvestment';
            preset.cacheKey = 'ZWealthInvestment';

            await service.analyze(preset);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        if (isButtonClicked && !loading && isAnalysisDone && prevData?.result && prevData?.result?.length > 0) {
            router.push('/saju/wealth/investment/result');
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
            {/* Hero Section */}
            <div className="relative bg-gradient-to-br from-rose-50 via-pink-50 to-red-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 border-b border-rose-100 dark:border-slate-700">
                <div className="max-w-4xl mx-auto px-4 py-16 text-center">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-rose-500 to-pink-600 mb-6 shadow-2xl shadow-rose-300 dark:shadow-rose-900/50">
                        <PresentationChartLineIcon className="w-11 h-11 text-white" />
                    </div>
                    <h1 className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white mb-4 leading-tight">
                        {language === 'ko' ? '투자 / 재테크 분석' : 'Investment Analysis'}
                    </h1>
                    <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
                        {language === 'ko'
                            ? '주식, 코인, 부동산 등 당신에게 맞는 투자 방향을 사주로 분석합니다'
                            : 'Analyze your suitability for stocks, crypto, real estate and more'}
                    </p>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-4xl mx-auto px-4 py-12">
                {/* Question Selection */}
                <div className="mb-8">
                    <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 mb-8 text-center">
                        {language === 'ko' ? '어떤 투자가 궁금하신가요?' : 'What investment are you curious about?'}
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
                                        ? 'border-rose-500 bg-rose-50 dark:bg-rose-900/20 shadow-lg shadow-rose-100 dark:shadow-rose-900/20 scale-[1.02]'
                                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-rose-300 hover:shadow-md'
                                        }`}
                                >
                                    <div className={`flex-shrink-0 w-14 h-14 rounded-xl flex items-center justify-center transition-all ${isSelected
                                        ? 'bg-rose-500 text-white shadow-lg'
                                        : 'bg-slate-100 dark:bg-slate-700 text-slate-400 group-hover:bg-rose-100 group-hover:text-rose-500'
                                        }`}>
                                        <PresentationChartLineIcon className="w-7 h-7" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className={`text-lg font-bold mb-1 ${isSelected ? 'text-rose-900 dark:text-rose-100' : 'text-slate-800 dark:text-slate-100'
                                            }`}>
                                            {labelText}
                                        </h3>
                                        <p className={`text-sm ${isSelected ? 'text-rose-700 dark:text-rose-300' : 'text-slate-500 dark:text-slate-400'
                                            }`}>
                                            {descText}
                                        </p>
                                    </div>
                                    {isSelected && (
                                        <div className="flex-shrink-0">
                                            <div className="w-6 h-6 rounded-full bg-rose-500 flex items-center justify-center">
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

                        {/* Analysis Button */}
                        <div className="flex flex-col items-center gap-4 py-8">
                            <AnalyzeButton
                                onClick={() => wealthEnergy.triggerConsume(handleAnalysis)}
                                disabled={isDisabled || isDisabled2}
                                isDone={isAnalysisDone}
                                language={language}
                                label={language === 'en' ? 'Start Analysis' : '분석 시작하기'}
                                cost={-1}
                                color="rose"
                            />



                            {/* Info Text */}
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

                {/* Empty State - Shows when no question selected */}
                {!selectedSubQ && (
                    <div className="text-center py-12">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 mb-4">
                            <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
                            </svg>
                        </div>
                        <p className="text-slate-400 text-sm">
                            {language === 'ko' ? '위에서 투자 유형을 선택해주세요' : 'Please select an investment type above'}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
