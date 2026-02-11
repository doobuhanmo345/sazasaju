'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { UserPlusIcon, SparklesIcon, ExclamationTriangleIcon, LockClosedIcon, TicketIcon } from '@heroicons/react/24/outline';
import { useAuthContext } from '@/contexts/useAuthContext';
import { useLanguage } from '@/contexts/useLanguageContext';
import { useUsageLimit } from '@/contexts/useUsageLimit';
import { useConsumeEnergy } from '@/hooks/useConsumingEnergy';
import { useLoading } from '@/contexts/useLoadingContext';
import EnergyBadge from '@/ui/EnergyBadge';
import LoadingFourPillar from '@/components/LoadingFourPillar';
import { SajuAnalysisService, AnalysisPresets, getPromptFromDB } from '@/lib/SajuAnalysisService';

export default function CompatiblePage() {
    const { language } = useLanguage();
    const router = useRouter();
    const { user, userData, selectedProfile } = useAuthContext();
    const { MAX_EDIT_COUNT, isLocked, setEditCount } = useUsageLimit();
    const { loading, setLoading, setAiResult } = useLoading();
    const targetProfile = selectedProfile || userData;
    const { gender, saju, isTimeUnknown } = targetProfile || {};
    const loveEnergy = useConsumeEnergy();

    const [isButtonClicked, setIsButtonClicked] = useState(false);
    const [promptQ1, setPromptQ1] = useState('나와 잘 맞는 사람.');
    const [promptQ2, setPromptQ2] = useState('나의 천생연분 유형');
    const [loadingPrompts, setLoadingPrompts] = useState(true);

    useEffect(() => {
        if (language === 'ko') {
            document.title = '나와 잘 맞는 사람 | 궁합 분석';
        } else {
            document.title = 'Compatible Partners | Compatibility Analysis';
        }

        const fetchPrompts = async () => {
            try {
                const q1 = '나와 잘 맞는 사람.';
                const q2 = await getPromptFromDB('love_compatible');
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
    });

    const prevData = userData?.usageHistory?.ZLoveCompatible;
    const isAnalysisDone = (() => {
        if (!prevData || !prevData.result) return false;
        if (prevData?.language !== language) return false;
        if (prevData?.gender !== targetProfile?.gender) return false;
        if (prevData?.ques !== promptQ1) return false;
        if (prevData?.ques2 !== promptQ2) return false;
        return SajuAnalysisService.compareSaju(prevData.saju, targetProfile?.saju);
    })();

    const handleAnalysis = async () => {
        setAiResult('');
        setIsButtonClicked(true);
        if (isAnalysisDone) {
            router.push('/saju/love/compatible/result');
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
                cacheKey: 'ZLoveCompatible',
            });

            await service.analyze(preset);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        if (isButtonClicked && !loading && isAnalysisDone && prevData?.result && prevData?.result?.length > 0) {
            router.push('/saju/love/compatible/result');
        }
    }, [isButtonClicked, prevData, router, isAnalysisDone, loading]);

    const isDisabled = (loading && !loveEnergy.isConsuming) || !user || loading || loadingPrompts;
    const isDisabled2 = !isAnalysisDone && isLocked;

    if (loading && saju) {
        return <LoadingFourPillar saju={saju} isTimeUnknown={isTimeUnknown} isAnalysisDone={isAnalysisDone} />;
    }

    return (
        <div className="w-full animate-in fade-in duration-500">
            <div className="relative bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 border-b border-emerald-100 dark:border-slate-700">
                <div className="max-w-4xl mx-auto px-4 py-16 text-center">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-emerald-500 to-green-600 mb-6 shadow-2xl shadow-emerald-300 dark:shadow-emerald-900/50">
                        <UserPlusIcon className="w-11 h-11 text-white" />
                    </div>
                    <h1 className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white mb-4 leading-tight">
                        {language === 'ko' ? '나와 잘 맞는 사람' : 'Compatible Partners'}
                    </h1>
                    <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
                        {language === 'ko'
                            ? '나와 궁합이 좋은 사람의 특징을 분석합니다'
                            : 'Analyze characteristics of compatible partners'}
                    </p>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 py-12">
                <div className="mb-8">
                    <div className="p-8 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm text-center">
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-500 mb-4">
                            <SparklesIcon className="w-6 h-6" />
                        </div>
                        <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-2">
                            나와잘맞는사람
                        </h2>
                        {language === 'ko' ?
                            '나와 찰떡궁합인 사람은 누구일까요? 성격, 가치관, 연애 스타일까지 잘 맞는 천생연분의 특징을 알려드립니다.' :
                            'Who is your perfect match? Discover the characteristics of your soulmate, including personality, values, and dating style.'}
                    </div>
                </div>

                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="flex flex-col items-center gap-4 py-8">
                        <button
                            onClick={() => loveEnergy.triggerConsume(handleAnalysis)}
                            disabled={isDisabled || isDisabled2}
                            className={`w-full sm:w-auto px-16 py-6 font-bold text-xl rounded-2xl shadow-2xl transform transition-all flex items-center justify-center gap-3 ${isDisabled || isDisabled2
                                ? 'bg-slate-100 text-slate-400 cursor-not-allowed border-2 border-slate-200'
                                : 'bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white shadow-emerald-400 dark:shadow-emerald-900/50 hover:-translate-y-1 hover:shadow-emerald-500'
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
                                    <LockClosedIcon className="w-5 h-5 text-emerald-500" />
                                </div>
                            ) : user && (
                                <div className="relative">
                                    <EnergyBadge active={!!userData?.birthDate} consuming={loading} cost={-1} />
                                </div>
                            )}
                        </button>

                        {isLocked ? (
                            <p className="text-emerald-600 font-bold text-sm flex items-center gap-2 animate-pulse">
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
