'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { BriefcaseIcon, SparklesIcon, ExclamationTriangleIcon, LockClosedIcon, TicketIcon } from '@heroicons/react/24/outline';
import { useAuthContext } from '@/contexts/useAuthContext';
import { useLanguage } from '@/contexts/useLanguageContext';
import { useUsageLimit } from '@/contexts/useUsageLimit';
import { useConsumeEnergy } from '@/hooks/useConsumingEnergy';
import { useLoading } from '@/contexts/useLoadingContext';
import EnergyBadge from '@/ui/EnergyBadge';
import LoadingBar from '@/components/LoadingBar';
import { SajuAnalysisService, AnalysisPresets } from '@/lib/SajuAnalysisService';

export default function BusinessPage() {
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
            document.title = '사업/창업운 분석 | 내 사업 적합성';
        } else {
            document.title = 'Business Analysis | Entrepreneurial Potential';
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

    const prevData = userData?.usageHistory?.ZWealthBusiness;
    const isAnalysisDone = (() => {
        if (!prevData || !prevData.result) return false;
        if (prevData?.language !== language) return false;
        if (prevData?.gender !== targetProfile?.gender) return false;
        if (prevData?.ques !== '사업 / 창업운') return false;
        if (prevData?.ques2 !== SUB_Q_TYPES.find((i) => i.id === selectedSubQ)?.desc) return false;
        return SajuAnalysisService.compareSaju(prevData.saju, targetProfile?.saju);
    })();

    const handleAnalysis = async () => {
        setAiResult('');
        setIsButtonClicked(true);
        const q1 = '사업 / 창업운';
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
            preset.type = 'wealthBusiness';
            preset.cacheKey = 'ZWealthBusiness';

            await service.analyze(preset);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        if (isButtonClicked && !loading && isAnalysisDone && prevData?.result && prevData?.result?.length > 0) {
            router.push('/saju/wealth/business/result');
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
                            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 border-2 border-emerald-200 dark:border-emerald-800">
                                <BriefcaseIcon className="w-12 h-12 text-emerald-500" />
                            </div>
                        </div>
                        <h2 className="text-2xl font-black text-slate-800 dark:text-white mb-2">
                            {language === 'ko' ? '사업 / 창업운' : 'Business'}
                        </h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            {language === 'ko' ? '내 사업을 해도 되는지, 동업이 좋은지' : 'Entrepreneurial potential and partnership luck'}
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
                                                ? 'border-emerald-500 bg-emerald-50 ring-4 ring-emerald-500 ring-opacity-20'
                                                : 'border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-emerald-200 hover:shadow-md'
                                            }`}
                                    >
                                        <span className={`text-base font-bold block mb-1 ${isSelected ? 'text-emerald-900' : 'text-slate-800 dark:text-slate-100'}`}>
                                            {labelText}
                                        </span>
                                        <p className={`text-sm ${isSelected ? 'text-emerald-700' : 'text-slate-500 dark:text-slate-400'}`}>
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
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 mb-4">
                            <BriefcaseIcon className="w-5 h-5 text-emerald-500" />
                            <span className="text-sm font-bold text-emerald-900 dark:text-emerald-100">
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
                                    : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-emerald-200 hover:-translate-y-1'
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
                                    <LockClosedIcon className="w-4 h-4 text-emerald-500" />
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
