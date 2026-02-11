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

export default function MonthlyLovePage() {
    const { language } = useLanguage();
    const router = useRouter();
    const { user, userData, selectedProfile } = useAuthContext();
    const { MAX_EDIT_COUNT, isLocked, setEditCount } = useUsageLimit();
    const { loading, setLoading, setAiResult, handleCancelHelper } = useLoading();
    const targetProfile = selectedProfile || userData;
    const { gender, saju, isTimeUnknown } = targetProfile || {};
    const loveEnergy = useConsumeEnergy();

    const [selectedSubQ, setSelectedSubQ] = useState(null);
    const [isButtonClicked, setIsButtonClicked] = useState(false);

    useEffect(() => {
        if (language === 'ko') {
            document.title = '이번 달 애정운 | 이달의 연애 흐름';
        } else {
            document.title = 'This Month\'s Love | Monthly Romance Flow';
        }
    }, [language]);

    const SUB_Q_TYPES = [
        {
            id: 'overall',
            label: '이번 달 전반적인 애정운',
            labelEn: 'Overall Love Fortune',
            desc: '이번 달 연애운과 만남의 기회',
            descEn: 'This month\'s romantic luck and opportunities',
            prompt: 'Analyze the user\'s overall love fortune for this month.',
        },
        {
            id: 'opportunity',
            label: '새로운 만남의 기회',
            labelEn: 'New Meeting Opportunities',
            desc: '이번 달 새로운 인연을 만날 가능성',
            descEn: 'Possibility of meeting someone new',
            prompt: 'Analyze opportunities for new romantic encounters this month.',
        },
        {
            id: 'existing',
            label: '기존 관계 발전',
            labelEn: 'Existing Relationship',
            desc: '현재 관계의 발전 가능성',
            descEn: 'Development of current relationship',
            prompt: 'Analyze how existing relationships may develop this month.',
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
        handleCancelHelper,
    });

    const prevData = userData?.usageHistory?.ZLoveMonthly;
    const isAnalysisDone = (() => {
        if (!prevData || !prevData.result) return false;
        if (prevData?.language !== language) return false;
        if (prevData?.gender !== targetProfile?.gender) return false;
        if (prevData?.ques !== '이번 달 애정운') return false;
        if (prevData?.ques2 !== SUB_Q_TYPES.find((i) => i.id === selectedSubQ)?.desc) return false;
        return SajuAnalysisService.compareSaju(prevData.saju, targetProfile?.saju);
    })();

    const handleAnalysis = async () => {
        setAiResult('');
        setIsButtonClicked(true);
        if (isAnalysisDone) {
            router.push('/saju/love/monthly/result');
            return;
        }
        const q1 = '이번 달 애정운';
        const q2 = SUB_Q_TYPES.find((i) => i.id === selectedSubQ)?.desc;
        const qprompt = SUB_Q_TYPES.find((i) => i.id === selectedSubQ)?.prompt;

        try {
            const preset = AnalysisPresets.love({
                saju,
                gender,
                q1,
                q2,
                qprompt,
                language,
                cacheKey: 'ZLoveMonthly',
            });

            await service.analyze(preset);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        if (isButtonClicked && !loading && isAnalysisDone && prevData?.result && prevData?.result?.length > 0) {
            router.push('/saju/love/monthly/result');
        }
    }, [isButtonClicked, prevData, router, isAnalysisDone, loading]);

    const isDisabled = (loading && !loveEnergy.isConsuming) || !user || loading;
    const isDisabled2 = !isAnalysisDone && isLocked;

    if (loading && saju) {
        return <LoadingFourPillar saju={saju} isTimeUnknown={isTimeUnknown} isAnalysisDone={isAnalysisDone} />;
    }

    return (
        <div className="w-full animate-in fade-in duration-500">
            <div className="relative bg-gradient-to-br from-pink-50 via-fuchsia-50 to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 border-b border-pink-100 dark:border-slate-700">
                <div className="max-w-4xl mx-auto px-4 py-16 text-center">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-pink-500 to-fuchsia-600 mb-6 shadow-2xl shadow-pink-300 dark:shadow-pink-900/50">
                        <CalendarDaysIcon className="w-11 h-11 text-white" />
                    </div>
                    <h1 className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white mb-4 leading-tight">
                        {language === 'ko' ? '이번 달 애정운' : 'This Month\'s Love'}
                    </h1>
                    <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
                        {language === 'ko'
                            ? '이번 달의 애정운과 연애 흐름을 분석합니다'
                            : 'Analyze this month\'s love fortune and romantic flow'}
                    </p>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 py-12">
                <div className="mb-8">
                    <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 mb-8 text-center">
                        {language === 'ko' ? '무엇이 궁금하신가요?' : 'What are you curious about?'}
                    </h2>
                    <div className="grid grid-cols-1 gap-4">
                        {SUB_Q_TYPES.map((sub) => {
                            const isSelected = selectedSubQ === sub.id;
                            const labelText = language === 'en' ? sub.labelEn : sub.label;
                            const descText = language === 'en' ? sub.descEn : sub.desc;

                            return (
                                <button
                                    key={sub.id}
                                    onClick={() => setSelectedSubQ(sub.id)}
                                    className={`relative flex items-center gap-4 p-6 rounded-2xl border-2 transition-all duration-200 text-left group ${isSelected
                                        ? 'border-pink-500 bg-pink-50 dark:bg-pink-900/20 shadow-lg shadow-pink-100 dark:shadow-pink-900/20 scale-[1.02]'
                                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-pink-300 hover:shadow-md'
                                        }`}
                                >
                                    <div className={`flex-shrink-0 w-14 h-14 rounded-xl flex items-center justify-center transition-all ${isSelected
                                        ? 'bg-pink-500 text-white shadow-lg'
                                        : 'bg-slate-100 dark:bg-slate-700 text-slate-400 group-hover:bg-pink-100 group-hover:text-pink-500'
                                        }`}>
                                        <CalendarDaysIcon className="w-7 h-7" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className={`text-lg font-bold mb-1 ${isSelected ? 'text-pink-900 dark:text-pink-100' : 'text-slate-800 dark:text-slate-100'
                                            }`}>
                                            {labelText}
                                        </h3>
                                        <p className={`text-sm ${isSelected ? 'text-pink-700 dark:text-pink-300' : 'text-slate-500 dark:text-slate-400'
                                            }`}>
                                            {descText}
                                        </p>
                                    </div>
                                    {isSelected && (
                                        <div className="flex-shrink-0">
                                            <div className="w-6 h-6 rounded-full bg-pink-500 flex items-center justify-center">
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
                            <button
                                onClick={() => loveEnergy.triggerConsume(handleAnalysis)}
                                disabled={isDisabled || isDisabled2}
                                className={`w-full sm:w-auto px-16 py-6 font-bold text-xl rounded-2xl shadow-2xl transform transition-all flex items-center justify-center gap-3 ${isDisabled || isDisabled2
                                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed border-2 border-slate-200'
                                    : 'bg-gradient-to-r from-pink-600 to-fuchsia-600 hover:from-pink-500 hover:to-fuchsia-500 text-white shadow-pink-400 dark:shadow-pink-900/50 hover:-translate-y-1 hover:shadow-pink-500'
                                    }`}
                            >
                                <SparklesIcon className="w-7 h-7 animate-pulse" />
                                <span>{language === 'en' ? 'Start Analysis' : '분석 시작하기'}</span>
                                {isAnalysisDone ? (
                                    <div className="flex items-center gap-1 backdrop-blur-md bg-white/20 px-3 py-1 rounded-full border border-white/30">
                                        <span className="text-xs font-bold text-white uppercase">Free</span>
                                        <TicketIcon className="w-4 h-4 text-white" />
                                    </div>
                                ) : isLocked ? (
                                    <div className="flex items-center gap-1 backdrop-blur-sm px-3 py-1 rounded-full border shadow-sm border-gray-500/50 bg-gray-400/40">
                                        <LockClosedIcon className="w-5 h-5 text-pink-500" />
                                    </div>
                                ) : user && (
                                    <div className="relative">
                                        <EnergyBadge active={!!userData?.birthDate} consuming={loading} cost={-1} />
                                    </div>
                                )}
                            </button>

                            {isLocked ? (
                                <p className="text-pink-600 font-bold text-sm flex items-center gap-2 animate-pulse">
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
                            {language === 'ko' ? '위에서 질문을 선택해주세요' : 'Please select a question above'}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
