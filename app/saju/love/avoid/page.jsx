'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { UserMinusIcon, SparklesIcon, ExclamationTriangleIcon, LockClosedIcon, TicketIcon } from '@heroicons/react/24/outline';
import { useAuthContext } from '@/contexts/useAuthContext';
import { useLanguage } from '@/contexts/useLanguageContext';
import { useUsageLimit } from '@/contexts/useUsageLimit';
import { useConsumeEnergy } from '@/hooks/useConsumingEnergy';
import { useLoading } from '@/contexts/useLoadingContext';
import EnergyBadge from '@/ui/EnergyBadge';
import LoadingFourPillar from '@/components/LoadingFourPillar';
import { SajuAnalysisService, AnalysisPresets, getPromptFromDB } from '@/lib/SajuAnalysisService';
import AnalyzeButton from '@/ui/AnalyzeButton';
import { calculateSaju } from '@/lib/sajuCalculator';

export default function AvoidPage() {
    const { language } = useLanguage();
    const router = useRouter();
    const { user, userData, selectedProfile } = useAuthContext();
    const { MAX_EDIT_COUNT, isLocked, setEditCount } = useUsageLimit();
    const { loading, setLoading, setAiResult, handleCancelHelper } = useLoading();
    const targetProfile = selectedProfile || userData;
    const { gender, saju, isTimeUnknown } = targetProfile || {};
    const loveEnergy = useConsumeEnergy();
    const [isButtonClicked, setIsButtonClicked] = useState(false);
    const [promptQ1, setPromptQ1] = useState('내가 피해야 하는 사람.');
    const [promptQ2, setPromptQ2] = useState('나와 맞지 않는 사람의 유형');
    const [loadingPrompts, setLoadingPrompts] = useState(true);

    useEffect(() => {
        if (language === 'ko') {
            document.title = '내가 피해야 하는 사람 | 궁합 주의';
        } else {
            document.title = 'People to Avoid | Compatibility Warning';
        }
        const today = new Date();
        const currentMonthMid = new Date(today.getFullYear(), today.getMonth(), 15);
        const currentPillar = calculateSaju(currentMonthMid);
        let month;
        if (currentPillar) {
            const currentStr = `${currentPillar.sky2}${currentPillar.grd2}`;
            const suffix = language === 'ko'
                ? ` (이번달(${today.getMonth() + 1}월) 월주: ${currentStr})`
                : ` (Current Month(${today.getMonth() + 1}) Pillar: ${currentStr})`;
            month = suffix;
        }
        const fetchPrompts = async () => {
            try {
                const q1 = '내가 피해야 하는 사람.';
                const q2 = await getPromptFromDB('love_avoid');
                if (q1) setPromptQ1(q1);
                if (q2) setPromptQ2(month + q2);
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

    const prevData = userData?.usageHistory?.ZLoveAvoid;
    const isAnalysisDone = (() => {
        if (!prevData || !prevData.result) return false;
        if (prevData?.language !== language) return false;
        if (prevData?.ques2 !== promptQ2) return false;
        if (prevData?.gender !== targetProfile?.gender) return false;
        return SajuAnalysisService.compareSaju(prevData.saju, targetProfile?.saju);
    })();
    console.log(promptQ2)
    const handleAnalysis = async () => {
        setAiResult('');
        setIsButtonClicked(true);
        if (isAnalysisDone) {
            router.push('/saju/love/avoid/result');
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
                cacheKey: 'ZLoveAvoid',
                partnerSaju: null,
                partnerGender: null,
            });
            await service.analyze(preset);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        if (isButtonClicked && !loading && isAnalysisDone && prevData?.result && prevData?.result?.length > 0) {
            router.push('/saju/love/avoid/result');
        }
    }, [isButtonClicked, prevData, router, isAnalysisDone, loading]);

    const isDisabled = (loading && !loveEnergy.isConsuming) || !user || loading || loadingPrompts;
    const isDisabled2 = !isAnalysisDone && isLocked;

    if (loading && saju) {
        return <LoadingFourPillar saju={saju} isTimeUnknown={isTimeUnknown} isAnalysisDone={isAnalysisDone} />;
    }

    return (
        <div className="w-full animate-in fade-in duration-500">
            <div className="relative bg-gradient-to-br from-red-50 via-orange-50 to-amber-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 border-b border-red-100 dark:border-slate-700">
                <div className="max-w-4xl mx-auto px-4 py-16 text-center">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-red-500 to-orange-600 mb-6 shadow-2xl shadow-red-300 dark:shadow-red-900/50">
                        <UserMinusIcon className="w-11 h-11 text-white" />
                    </div>
                    <h1 className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white mb-4 leading-tight">
                        {language === 'ko' ? '내가 피해야 하는 사람' : 'People to Avoid'}
                    </h1>
                    <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
                        {language === 'ko'
                            ? '나와 맞지 않는 사람의 특징을 분석합니다'
                            : 'Analyze characteristics of incompatible people'}
                    </p>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 py-12">
                <div className="mb-8">
                    <div className="p-8 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm text-center">
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 text-red-500 mb-4">
                            <SparklesIcon className="w-6 h-6" />
                        </div>
                        <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-2">
                            {promptQ1}
                        </h2>
                        <p className="text-slate-600 dark:text-slate-400">
                            {language === 'ko' ?
                                '절대 만나면 안 되는 사람은 누구일까요? 나에게 해가 되거나 악연이 될 수 있는 사람의 특징을 미리 확인하고 피하세요.' :
                                'Who should you absolutely avoid? Identify the characteristics of people who could be toxic or ill-fated for you, and learn to steer clear.'}
                        </p>
                    </div>
                </div>

                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <AnalyzeButton
                        onClick={() => loveEnergy.triggerConsume(handleAnalysis)}
                        disabled={isDisabled || isDisabled2}
                        isDone={isAnalysisDone}
                        label={language === 'en' ? 'Start Analysis' : '분석 시작하기'}
                        color="rose"
                    />

                </div>
            </div>
        </div>
    );
}
