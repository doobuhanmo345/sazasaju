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
import { calculateSaju } from '@/lib/sajuCalculator';
import AnalyzeButton from '@/ui/AnalyzeButton';
import { getPromptFromDB } from '@/lib/SajuAnalysisService';

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
    const isKo = language === 'ko'
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
    const [q2, setQ2] = useState('');
    const isAnalysisDone = (() => {
        if (!prevData || !prevData.result) return false;
        if (prevData?.language !== language) return false;
        if (prevData?.gender !== targetProfile?.gender) return false;
        if (prevData?.ques !== '이번 달 애정운') return false;
        if (prevData?.ques2 !== q2) return false;
        return SajuAnalysisService.compareSaju(prevData.saju, targetProfile?.saju);
    })();
    const selectSubQ = async (subQid) => {
        setSelectedSubQ(subQid);
        let origin = await getPromptFromDB(`love_monthly_${subQid}`);

        const today = new Date();
        // Use 15th for middle of the month to safely get the month pillar (Jeolgi transition usually happens around 4-8th)
        const currentMonthMid = new Date(today.getFullYear(), today.getMonth(), 15);
        const nextMonthMid = new Date(today.getFullYear(), today.getMonth() + 1, 15);

        const currentPillar = calculateSaju(currentMonthMid);
        const nextPillar = calculateSaju(nextMonthMid);

        if (currentPillar && nextPillar) {
            const currentStr = `${currentPillar.sky2}${currentPillar.grd2}`;
            const nextStr = `${nextPillar.sky2}${nextPillar.grd2}`;
            const suffix = language === 'ko'
                ? ` (이번달(${today.getMonth() + 1}월) 월주: ${currentStr}, 다음달(${today.getMonth() + 2}월) 월주: ${nextStr})`
                : ` (Current Month(${today.getMonth() + 1}) Pillar: ${currentStr}, Next Month(${today.getMonth() + 2}) Pillar: ${nextStr})`;
            origin += suffix;
        }
        setQ2(origin);
    }


    const handleAnalysis = async () => {
        setAiResult('');
        setIsButtonClicked(true);
        if (isAnalysisDone) {
            router.push('/saju/love/monthly/result');
            return;
        }
        const q1 = isKo ? '이번 달 애정운' : 'This Month\'s Love Fortune';

        const qprompt = SUB_Q_TYPES.find((i) => i.id === selectedSubQ)?.prompt;

        try {
            const preset = AnalysisPresets.love({
                saju,
                gender,
                q1,
                q2,
                qprompt,
                cacheKey: 'ZLoveMonthly',
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
            <div className="mx-auto  text-center px-6 animate-in fade-in slide-in-from-bottom-5 duration-700">
                <div>
                    <h2 className=" text-3xl font-black text-slate-800 dark:text-white mb-4 tracking-tight">
                        {language === 'ko' ? '새로운 만남과 연애운' : "New Meeting and Love Fortune"}
                        <br />
                        <span className="relative text-emerald-600 dark:text-emerald-500">
                            {language === 'ko' ? '이번 달의 운세' : "This Month's Fortune"}
                        </span>
                    </h2>
                </div>
                <div className="space-y-4 text-slate-600 dark:text-slate-400 mb-10 leading-relaxed break-keep">
                    <p className="text-md">
                        {language === 'ko' ? (
                            <>
                                이번 달, 당신의 사랑은 어떤 모습일까요? <br />
                                <strong>새로운 설렘</strong>이 시작될 기회와 <strong>기존의 인연</strong>이 더 깊어지는 시기를 분석해 드립니다.
                            </>
                        ) : (
                            <>
                                What does love have in store for you this month? <br />
                                We analyze opportunities for <strong>new sparks</strong> to ignite and identify the perfect timing for <strong>existing bonds</strong> to grow deeper.
                            </>
                        )}
                    </p>

                    <div className="m-auto max-w-sm rounded-2xl overflow-hidden shadow-sm border border-slate-100 dark:border-slate-800">
                        <img
                            src="/images/introcard/love_monthly.webp"
                            alt="today's luck"
                            className="w-full h-auto"
                        />
                    </div>
                </div>

                {/* Primary Analyze Button */}
                <div className="mb-12 max-w-lg mx-auto">
                    <AnalyzeButton
                        onClick={() => loveEnergy.triggerConsume(handleAnalysis)}
                        disabled={isDisabled || isDisabled2}
                        isDone={isAnalysisDone}
                        language={language}
                        label={language !== 'ko' ? 'Start Analysis' : '분석 시작하기'}
                        cost={-1}
                        color="emerald"

                    />

                </div>


            </div>
        </div>
    );
}
