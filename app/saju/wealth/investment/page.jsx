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
import LoadingBar from '@/components/LoadingBar';
import { SajuAnalysisService, AnalysisPresets } from '@/lib/SajuAnalysisService';

export default function InvestmentPage() {
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
            document.title = '투자/재테크 분석 | 주식, 코인, 부동산';
        } else {
            document.title = 'Investment Analysis | Stocks, Crypto, Real Estate';
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

    const prevData = userData?.usageHistory?.ZWealthInvestment;
    const isAnalysisDone = (() => {
        if (!prevData || !prevData.result) return false;
        if (prevData?.language !== language) return false;
        if (prevData?.gender !== targetProfile?.gender) return false;
        if (prevData?.ques !== '투자 / 재테크') return false;
        if (prevData?.ques2 !== SUB_Q_TYPES.find((i) => i.id === selectedSubQ)?.desc) return false;
        return SajuAnalysisService.compareSaju(prevData.saju, targetProfile?.saju);
    })();

    const handleAnalysis = async () => {
        setAiResult('');
        setIsButtonClicked(true);
        const q1 = '투자 / 재테크';
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

    return (
        <div className="w-full max-w-3xl mx-auto px-4 py-8 animate-in fade-in duration-500">
            {step === 0 && (
                <>
                    <div className="text-center mb-8">
                        <div className="flex justify-center mb-4">
                            <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-900/20 border-2 border-rose-200 dark:border-rose-800">
                                <PresentationChartLineIcon className="w-12 h-12 text-rose-500" />
                            </div>
                        </div>
                        <h2 className="text-2xl font-black text-slate-800 dark:text-white mb-2">
                            {language === 'ko' ? '투자 / 재테크' : 'Investment'}
                        </h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            {language === 'ko' ? '주식, 코인, 부동산 등 투기 적합성' : 'Suitability for stocks, crypto, and real estate'}
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
                                                ? 'border-rose-500 bg-rose-50 ring-4 ring-rose-500 ring-opacity-20'
                                                : 'border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-rose-200 hover:shadow-md'
                                            }`}
                                    >
                                        <span className={`text-base font-bold block mb-1 ${isSelected ? 'text-rose-900' : 'text-slate-800 dark:text-slate-100'}`}>
                                            {labelText}
                                        </span>
                                        <p className={`text-sm ${isSelected ? 'text-rose-700' : 'text-slate-500 dark:text-slate-400'}`}>
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
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 mb-4">
                            <PresentationChartLineIcon className="w-5 h-5 text-rose-500" />
                            <span className="text-sm font-bold text-rose-900 dark:text-rose-100">
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
                                    : 'bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white shadow-rose-200 hover:-translate-y-1'
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
                                    <LockClosedIcon className="w-4 h-4 text-rose-500" />
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
