'use client';

import { useRouter } from 'next/navigation';
import Image from 'next/image';
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
import AnalyzeButton from '@/ui/AnalyzeButton';
import { calculateSaju } from '@/lib/sajuCalculator';

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
    const isKo = language === 'ko'
    const q1 = isKo ? '솔로 탈출 시기.' : 'When to Find Love';
    useEffect(() => {
        if (language === 'ko') {
            document.title = '솔로 탈출 시기 | 연애 타이밍';
        } else {
            document.title = 'When to Find Love | Romance Timing';
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

                const q2 = await getPromptFromDB('love_timing');
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

    const prevData = userData?.usageHistory?.ZLoveTiming;

    const isAnalysisDone = (() => {
        if (!prevData || !prevData.result) return false;
        if (prevData?.language !== language) return false;
        if (prevData?.gender !== targetProfile?.gender) return false;
        if (prevData?.ques2 !== promptQ2) return false;

        return SajuAnalysisService.compareSaju(prevData.saju, targetProfile?.saju);
    })();

    const handleAnalysis = async () => {
        setAiResult('');
        setIsButtonClicked(true);
        if (isAnalysisDone) {
            router.push('/saju/love/timing/result');
            return;
        }

        const q2 = promptQ2;
        const qprompt = '';

        try {
            const preset = AnalysisPresets.love({
                saju,
                gender,
                q1,
                q2,
                qprompt,
                cacheKey: 'ZLoveTiming',
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
            <div className="mx-auto  text-center px-6 animate-in fade-in slide-in-from-bottom-5 duration-700">
                <div>
                    <h2 className=" text-3xl font-black text-slate-800 dark:text-white mb-4 tracking-tight">
                        {language === 'ko' ? '운명의 인연 찾기' : "Discover Your Destiny"}
                        <br />
                        <span className="relative text-sky-600 dark:text-sky-500">
                            {language === 'ko' ? '솔로 탈출 시기' : "When to Find Love"}
                        </span>
                    </h2>
                </div>
                <div className="space-y-4 text-slate-600 dark:text-slate-400 mb-10 leading-relaxed break-keep">
                    <p className="text-md">
                        {language === 'ko' ? (
                            <>
                                언제쯤 솔로를 탈출할 수 있을까요? <br />
                                <strong>새로운 인연</strong>이 찾아오는 시기와 <strong>연애운</strong>이 가장 좋은 달을 분석해드립니다.
                            </>
                        ) : (
                            <>
                                "Ready to find your significant other?
                                <br />
                                We pinpoint the timing of your next encounter and analyze your strongest months for love luck."
                                <br />
                                Discover how your Five Elements align to create a destiny-altering synergy.
                            </>
                        )}
                    </p>

                    <div className="m-auto max-w-sm rounded-2xl overflow-hidden shadow-sm border border-slate-100 dark:border-slate-800">
                        <Image
                            src="/images/introcard/love_timing.webp"
                            alt="today's luck"
                            width={800}
                            height={600}
                            className="w-full h-auto"
                            priority
                        />
                    </div>
                </div>

                {/* Primary Analyze Button */}
                <div className="mb-12 max-w-lg mx-auto">
                    <AnalyzeButton
                        onClick={() => loveEnergy.triggerConsume(handleAnalysis)}
                        disabled={isDisabled || isDisabled2}
                        isDone={isAnalysisDone}
                        label={language === 'ko' ? '분석 시작하기' : 'Start Analysis'}
                        color="sky"
                        cost={-1}
                    />

                </div>


            </div>


        </div>
    );
}
