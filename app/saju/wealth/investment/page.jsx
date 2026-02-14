'use client';

import { useRouter } from 'next/navigation';
import Image from 'next/image';
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
    const isKo = language === 'ko'




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
        const q1 = isKo ? '투자 / 재테크' : 'Investment / Wealth Management';
        const q2 = prompt;
        try {
            const preset = AnalysisPresets.wealth({
                saju,
                gender,
                q1,
                q2,
                qprompt: null,

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
            <div className="mx-auto  text-center px-6 animate-in fade-in slide-in-from-bottom-5 duration-700">
                <div>
                    <h2 className="text-3xl font-black text-slate-800 dark:text-white mb-4 tracking-tight">
                        {language === 'ko' ? '사업 성패의 결정적 한 수' : "Your Business Success Blueprint"}

                        <br />
                        <span className="relative text-sky-600 dark:text-sky-500">
                            {language === 'ko' ? '창업 시기부터 업종 분석까지' : "From Launch Timing to Best Industry"}
                            <div className="absolute inset-0 bg-sky-200/50 dark:bg-sky-800/60 blur-md rounded-full scale-100"></div>
                        </span>
                    </h2>
                </div>
                <div className="space-y-4 text-slate-600 dark:text-slate-400 mb-10 leading-relaxed break-keep">
                    {language === 'ko' ? (
                        <>
                            당신의 <strong>사업적 성공 가능성</strong>과 <br />가장 운이 따르는 <strong>최적의 창업 시기</strong>를 분석합니다. <br />
                            나에게 맞는 <strong>업종과 아이템</strong>은 무엇인지, <br />그리고 <strong>동업과 독자 생존</strong> 중 어떤 길이 유리할지 사주학적 마스터 플랜을 확인해 보세요.
                        </>
                    ) : (
                        <>
                            Analyze your <strong>entrepreneurial success potential</strong> and <br />find the <strong>optimal timing</strong> to launch your business. <br />
                            Discover the <strong>best industries and items</strong> for you, <br />and determine whether <strong>partnership or going solo</strong> will lead to greater prosperity.
                        </>
                    )}

                    <div className="m-auto max-w-sm rounded-[2rem] overflow-hidden shadow-sm border border-slate-100 dark:border-slate-800 relative z-0"
                        style={{ maskImage: 'linear-gradient(to bottom, black 60%, transparent 100%)', WebkitMaskImage: 'linear-gradient(to bottom, black 60%, transparent 100%)' }}>
                        <Image
                            src="/images/introcard/wealth_inves.webp"
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
                            <span className="w-1.5 h-6 bg-sky-500 rounded-full inline-block"></span>
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
                                            ? 'bg-sky-50 dark:bg-sky-900/20 border-sky-500 dark:border-sky-500/50 shadow-sm ring-1 ring-sky-500/20'
                                            : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-800 hover:border-sky-200 dark:hover:border-sky-800 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                                            }`}
                                    >
                                        <div className="flex items-center justify-between relative z-10">
                                            <div>
                                                <h3 className={`font-bold text-[15px] transition-colors ${isSelected ? 'text-sky-800 dark:text-sky-300' : 'text-slate-700 dark:text-slate-200'
                                                    }`}>
                                                    {labelText}
                                                </h3>
                                                <p className={`text-xs mt-0.5 transition-colors ${isSelected ? 'text-sky-600/80 dark:text-sky-400/70' : 'text-slate-400 dark:text-slate-500'
                                                    }`}>
                                                    {descText}
                                                </p>
                                            </div>
                                            <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${isSelected
                                                ? 'bg-sky-500 border-sky-500 scale-110'
                                                : 'border-slate-300 dark:border-slate-600 group-hover:border-sky-300'
                                                }`}>
                                                {isSelected && (
                                                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                    </svg>
                                                )}
                                            </div>
                                        </div>
                                        {/* Subtle highlight effect on hover */}
                                        {!isSelected && <div className="absolute inset-0 bg-sky-50/0 group-hover:bg-sky-50/30 transition-colors duration-300"></div>}
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
                                    color="sky"
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
                                {language === 'ko' ? '위에서 투자 유형을 선택해주세요' : 'Please select an investment type above'}
                            </p>
                        </div>
                    )}
                </div>

            </div>


        </div>

    );
}
