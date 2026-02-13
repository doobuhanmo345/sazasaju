'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { CircleStackIcon, SparklesIcon, ExclamationTriangleIcon, LockClosedIcon, TicketIcon } from '@heroicons/react/24/outline';
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

export default function CapacityPage() {
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

    useEffect(() => {
        if (language === 'ko') {
            document.title = '평생 재물운 분석 | 타고난 부의 그릇';
        } else {
            document.title = 'Lifetime Wealth Analysis | Innate Capacity';
        }
    }, [language]);



    const SUB_Q_TYPES = [
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

    const prevData = userData?.usageHistory?.ZWealthCapacity;
    const isAnalysisDone = (() => {
        if (!prevData || !prevData.result) return false;
        if (prevData?.language !== language) return false;
        if (prevData?.gender !== targetProfile?.gender) return false;
        if (prevData?.ques !== '평생 재물운') return false;
        if (prevData?.ques2 !== prompt) return false;
        return SajuAnalysisService.compareSaju(prevData.saju, targetProfile?.saju);
    })();

    const selectSubQ = async (subQid) => {
        setSelectedSubQ(subQid);
        const origin = SUB_Q_TYPES.find((i) => i.id === subQid);

        const fetchPrompts = async () => {
            try {
                const q2 = await getPromptFromDB(`wealth_capacity_${subQid}`);


                if (q2) setPrompt(q2);
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
        const q1 = isKo ? '평생 재물운' : 'Lifetime Wealth';
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
            // Override type and cacheKey for capacity category
            preset.type = 'wealthCapacity';
            preset.cacheKey = 'ZWealthCapacity';

            await service.analyze(preset);
        } catch (error) {
            console.error(error);
        }
    };
    useEffect(() => {
        if (isButtonClicked && !loading && isAnalysisDone && prevData?.result && prevData?.result?.length > 0) {
            router.push('/saju/wealth/capacity/result');
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
            <div className="relative bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 border-b border-amber-100 dark:border-slate-700">
                <div className="max-w-4xl mx-auto px-4 py-16 text-center">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-amber-500 to-orange-600 mb-6 shadow-2xl shadow-amber-300 dark:shadow-amber-900/50">
                        <CircleStackIcon className="w-11 h-11 text-white" />
                    </div>
                    <h1 className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white mb-4 leading-tight">
                        {language === 'ko' ? '평생 재물운 분석' : 'Lifetime Wealth Analysis'}
                    </h1>
                    <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
                        {language === 'ko'
                            ? '타고난 부의 그릇과 재물운의 흐름을 사주로 분석합니다'
                            : 'Analyze your innate wealth capacity and financial fortune flow'}
                    </p>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-4xl mx-auto px-4 py-12">
                {/* Question Selection */}
                <div className="mb-8">
                    <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 mb-8 text-center">
                        {language === 'ko' ? '무엇이 궁금하신가요?' : 'What are you curious about?'}
                    </h2>
                    <div className="grid grid-cols-1 gap-4">
                        {SUB_Q_TYPES.map((sub) => {
                            const isSelected = selectedSubQ === sub.id;
                            const labelText = language !== 'ko' ? sub.labelEn : sub.label;
                            const descText = language !== 'ko' ? sub.descEn : sub.desc;

                            return (
                                <button
                                    key={sub.id}
                                    onClick={() => selectSubQ(sub.id)}
                                    className={`relative flex items-center gap-4 p-6 rounded-2xl border-2 transition-all duration-200 text-left group ${isSelected
                                        ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20 shadow-lg shadow-amber-100 dark:shadow-amber-900/20 scale-[1.02]'
                                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-amber-300 hover:shadow-md'
                                        }`}
                                >
                                    <div className={`flex-shrink-0 w-14 h-14 rounded-xl flex items-center justify-center transition-all ${isSelected
                                        ? 'bg-amber-500 text-white shadow-lg'
                                        : 'bg-slate-100 dark:bg-slate-700 text-slate-400 group-hover:bg-amber-100 group-hover:text-amber-500'
                                        }`}>
                                        <CircleStackIcon className="w-7 h-7" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className={`text-lg font-bold mb-1 ${isSelected ? 'text-amber-900 dark:text-amber-100' : 'text-slate-800 dark:text-slate-100'
                                            }`}>
                                            {labelText}
                                        </h3>
                                        <p className={`text-sm ${isSelected ? 'text-amber-700 dark:text-amber-300' : 'text-slate-500 dark:text-slate-400'
                                            }`}>
                                            {descText}
                                        </p>
                                    </div>
                                    {isSelected && (
                                        <div className="flex-shrink-0">
                                            <div className="w-6 h-6 rounded-full bg-amber-500 flex items-center justify-center">
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
                                label={language !== 'ko' ? 'Start Analysis' : '분석 시작하기'}
                                cost={-1}
                                color="amber"
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
                            {language === 'ko' ? '위에서 질문을 선택해주세요' : 'Please select a question above'}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
