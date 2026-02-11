'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ClockIcon, SparklesIcon, ExclamationTriangleIcon, LockClosedIcon, TicketIcon } from '@heroicons/react/24/outline';
import { useAuthContext } from '@/contexts/useAuthContext';
import { useLanguage } from '@/contexts/useLanguageContext';
import { useUsageLimit } from '@/contexts/useUsageLimit';
import { useConsumeEnergy } from '@/hooks/useConsumingEnergy';
import { useLoading } from '@/contexts/useLoadingContext';
import EnergyBadge from '@/ui/EnergyBadge';
import LoadingFourPillar from '@/components/LoadingFourPillar';
import { SajuAnalysisService, AnalysisPresets, getPromptFromDB } from '@/lib/SajuAnalysisService';

export default function LoveTimingPage() {
    const { language } = useLanguage();
    const router = useRouter();
    const { user, userData, selectedProfile } = useAuthContext();
    const { MAX_EDIT_COUNT, isLocked, setEditCount } = useUsageLimit();
    const { loading, setLoading, setAiResult, handleCancelHelper } = useLoading();
    const targetProfile = selectedProfile || userData;
    const { gender, saju, isTimeUnknown } = targetProfile || {};
    const loveEnergy = useConsumeEnergy();
    const [isButtonClicked, setIsButtonClicked] = useState(false);
    const [promptQ1, setPromptQ1] = useState('솔로 탈출 시기.');
    const [promptQ2, setPromptQ2] = useState('언제쯤 인연이 찾아올지');
    const [loadingPrompts, setLoadingPrompts] = useState(true);

    useEffect(() => {
        if (language === 'ko') {
            document.title = '솔로 탈출 시기 | 연애 타이밍';
        } else {
            document.title = 'When to Find Love | Romance Timing';
        }

        const fetchPrompts = async () => {
            try {
                const q1 = '솔로 탈출 시기.';
                const q2 = await getPromptFromDB('love_timing');
                if (q1) setPromptQ1(q1);
                if (q2) setPromptQ2(q2);
            } catch (error) {
                console.error('Failed to fetch prompts:', error);
            } finally {
                setLoadingPrompts(false);
            }
        };
        fetchPrompts();
    }, [language]);

    // [REMOVED] SUB_Q_TYPES

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

    const prevData = userData?.usageHistory?.ZLoveTiming;
    const isAnalysisDone = (() => {
        if (!prevData || !prevData.result) return false;
        if (prevData?.language !== language) return false;
        if (prevData?.gender !== targetProfile?.gender) return false;

        return SajuAnalysisService.compareSaju(prevData.saju, targetProfile?.saju);
    })();

    const handleAnalysis = async () => {
        setAiResult('');
        setIsButtonClicked(true);
        if (isAnalysisDone) {
            router.push('/saju/love/timing/result');
            return;
        }
        const q1 = promptQ1;
        const q2 = promptQ2;
        const qprompt = '';

        try {
            const preset = AnalysisPresets.love({
                saju,
                gender,
                q1,
                q2,
                qprompt,
                language,
                cacheKey: 'ZLoveTiming',
            });
            await service.analyze(preset);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        if (isButtonClicked && !loading && isAnalysisDone && prevData?.result && prevData?.result?.length > 0) {
            router.push('/saju/love/timing/result');
        }
    }, [isButtonClicked, prevData, router, isAnalysisDone, loading]);

    const isDisabled = (loading && !loveEnergy.isConsuming) || !user || loading || loadingPrompts;
    const isDisabled2 = !isAnalysisDone && isLocked;


    if (loading && saju) {
        return <LoadingFourPillar saju={saju} isTimeUnknown={isTimeUnknown} isAnalysisDone={isAnalysisDone} />;
    }

    return (
        <div className="w-full animate-in fade-in duration-500">
            <div className="relative bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 border-b border-sky-100 dark:border-slate-700">
                <div className="max-w-4xl mx-auto px-4 py-16 text-center">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-sky-500 to-blue-600 mb-6 shadow-2xl shadow-sky-300 dark:shadow-sky-900/50">
                        <ClockIcon className="w-11 h-11 text-white" />
                    </div>
                    <h1 className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white mb-4 leading-tight">
                        {language === 'ko' ? '솔로 탈출 시기' : 'When to Find Love'}
                    </h1>
                    <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
                        {language === 'ko'
                            ? '연애를 시작하기 좋은 시기를 분석합니다'
                            : 'Analyze the best timing to start a relationship'}
                    </p>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 py-12">
                <div className="mb-8">
                    <div className="p-8 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm text-center">
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-sky-100 dark:bg-sky-900/30 text-sky-500 mb-4">
                            <SparklesIcon className="w-6 h-6" />
                        </div>
                        <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-2">
                            {promptQ1}
                        </h2>
                        <p className="text-slate-600 dark:text-slate-400">
                            {language === 'ko' ?
                                '언제쯤 솔로를 탈출할 수 있을까요? 새로운 인연이 찾아오는 시기와 연애운이 가장 좋은 달을 분석해드립니다.' :
                                'When will you find love? Analyze when a new connection will arrive and identify the best months for romance.'}
                        </p>
                    </div>
                </div>

                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="flex flex-col items-center gap-4 py-8">
                        <button
                            onClick={() => loveEnergy.triggerConsume(handleAnalysis)}
                            disabled={isDisabled || isDisabled2}
                            className={`w-full sm:w-auto px-16 py-6 font-bold text-xl rounded-2xl shadow-2xl transform transition-all flex items-center justify-center gap-3 ${isDisabled || isDisabled2
                                ? 'bg-slate-100 text-slate-400 cursor-not-allowed border-2 border-slate-200'
                                : 'bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white shadow-sky-400 dark:shadow-sky-900/50 hover:-translate-y-1 hover:shadow-sky-500'
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
                                    <LockClosedIcon className="w-5 h-5 text-sky-500" />
                                </div>
                            ) : user && (
                                <div className="relative">
                                    <EnergyBadge active={!!userData?.birthDate} consuming={loading} cost={-1} />
                                </div>
                            )}
                        </button>

                        {isLocked ? (
                            <p className="text-sky-600 font-bold text-sm flex items-center gap-2 animate-pulse">
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
            </div>
        </div>
    );
}
