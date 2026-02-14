'use client';

import { useRouter } from 'next/navigation';
import Image from 'next/image';
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
    const isKo = language === 'ko';
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
            <div className="mx-auto  text-center px-6 animate-in fade-in slide-in-from-bottom-5 duration-700">

                <div className="space-y-4 text-slate-600 dark:text-slate-400 mb-10 leading-relaxed break-keep">
                    <h2 className="text-3xl font-black text-slate-800 dark:text-white mb-4 tracking-tight">
                        {language === 'ko' ? '나의 타고난 부의 그릇은?' : "What Is My Natural Wealth Capacity?"}

                        <br />
                        <span className="relative text-amber-600 dark:text-amber-500">
                            {language === 'ko' ? '얼마나 벌 수 있고 언제 부자가 될까' : "How Much Can I Earn — And When?"}
                            <div className="absolute inset-0 bg-amber-200/50 dark:bg-amber-800/60 blur-md rounded-full scale-100"></div>
                        </span>
                    </h2>
                    <p className="text-md text-slate-600 dark:text-slate-400 mb-6 leading-relaxed break-keep">
                        {language === 'ko' ? (
                            <>
                                당신의 사주가 담을 수 있는 <strong>부의 크기</strong>를 분석합니다. <br />
                                얼마나 벌 수 있는지, <strong>부가 커지는 시기</strong>는 언제인지 확인하세요.
                            </>
                        ) : (
                            <>
                                Discover your natural <strong>capacity for wealth</strong>. <br />
                                See how much you can accumulate and <strong>when prosperity expands</strong>.
                            </>
                        )}

                    </p>


                    <div className="m-auto max-w-sm rounded-[2rem] overflow-hidden shadow-sm border border-slate-100 dark:border-slate-800 relative z-0"
                        style={{ maskImage: 'linear-gradient(to bottom, black 60%, transparent 100%)', WebkitMaskImage: 'linear-gradient(to bottom, black 60%, transparent 100%)' }}>
                        <Image
                            src="/images/introcard/wealth_1nobg.webp"
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
                            <span className="w-1.5 h-6 bg-amber-500 rounded-full inline-block"></span>
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
                                            ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-500 dark:border-amber-500/50 shadow-sm ring-1 ring-amber-500/20'
                                            : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-800 hover:border-amber-200 dark:hover:border-amber-800 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                                            }`}
                                    >
                                        <div className="flex items-center justify-between relative z-10">
                                            <div>
                                                <h3 className={`font-bold text-[15px] transition-colors ${isSelected ? 'text-amber-800 dark:text-amber-300' : 'text-slate-700 dark:text-slate-200'
                                                    }`}>
                                                    {labelText}
                                                </h3>
                                                <p className={`text-xs mt-0.5 transition-colors ${isSelected ? 'text-amber-600/80 dark:text-amber-400/70' : 'text-slate-400 dark:text-slate-500'
                                                    }`}>
                                                    {descText}
                                                </p>
                                            </div>
                                            <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${isSelected
                                                ? 'bg-amber-500 border-amber-500 scale-110'
                                                : 'border-slate-300 dark:border-slate-600 group-hover:border-amber-300'
                                                }`}>
                                                {isSelected && (
                                                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                    </svg>
                                                )}
                                            </div>
                                        </div>
                                        {/* Subtle highlight effect on hover */}
                                        {!isSelected && <div className="absolute inset-0 bg-amber-50/0 group-hover:bg-amber-50/30 transition-colors duration-300"></div>}
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
                                {language === 'ko' ? '위에서 질문을 선택해주세요.' : 'Please select a question above.'}
                            </p>
                        </div>
                    )}
                </div>

            </div>


        </div>
    );
}
