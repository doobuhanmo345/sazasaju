'use client';

import { useRouter } from 'next/navigation';
import Image from 'next/image';
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
import AnalyzeButton from '@/ui/AnalyzeButton';
import { calculateSaju } from '@/lib/sajuCalculator';
import style from '@/data/styleConstants';
export default function CompatiblePage() {
    const { language } = useLanguage();
    const router = useRouter();
    const { user, userData, selectedProfile } = useAuthContext();
    const { MAX_EDIT_COUNT, isLocked, setEditCount } = useUsageLimit();
    const { loading, setLoading, setAiResult, handleCancelHelper } = useLoading();
    const targetProfile = selectedProfile || userData;
    const { gender, saju, isTimeUnknown } = targetProfile || {};
    const loveEnergy = useConsumeEnergy();

    const [isButtonClicked, setIsButtonClicked] = useState(false);
    const [promptQ1, setPromptQ1] = useState('나와 잘 맞는 사람.');
    const [promptQ2, setPromptQ2] = useState('나의 천생연분 유형');
    const [loadingPrompts, setLoadingPrompts] = useState(true);
    const isKo = language === 'ko'
    const q1 = isKo ? '나와 잘 맞는 사람.' : 'People who are compatible with me.';
    useEffect(() => {
        if (language === 'ko') {
            document.title = '나와 잘 맞는 사람 | 궁합 분석';
        } else {
            document.title = 'Compatible Partners | Compatibility Analysis';
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

                const q2 = await getPromptFromDB('love_compatible');
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

        const q2 = promptQ2;
        const qprompt = '';

        try {
            const preset = AnalysisPresets.love({
                saju,
                gender,
                q1,
                q2,
                qprompt,
                cacheKey: 'ZLoveCompatible',
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
            <div className="mx-auto  text-center px-6 animate-in fade-in slide-in-from-bottom-5 duration-700">
                <div>
                    <h2 className={style.sajuTitle}>
                        {language === 'ko' ? '운명의 인연 찾기' : "Discover Your Destiny"}
                        <br />
                        <span className="relative text-amber-600 dark:text-amber-500">
                            {language === 'ko' ? '나와의 찰떡 궁합' : "Your Cosmic Soulmate"}
                        </span>
                    </h2>
                </div>
                <div className={style.sajuDesc}>

                    {language === 'ko' ? (
                        <>
                            단순한 호감을 넘어, 사주학적으로 <br />당신의 기운을 북돋아 줄 상대를 분석합니다.
                            <br />
                            서로의 부족한 오행을 채워주고 시너지를 낼 수 있는<br /> 최고의 인연을 확인해 보세요.
                        </>
                    ) : (
                        <>
                            Find the soul who balances your cosmic energy.
                            <br />
                            Discover how your Five Elements align to <br />create a destiny-altering synergy.
                        </>
                    )}
                    <div className="m-auto max-w-sm rounded-2xl overflow-hidden shadow-sm border border-slate-100 dark:border-slate-800">
                        <Image
                            src="/images/introcard/love_compatible.webp"
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
                        label={language !== 'ko' ? 'Start Analysis' : '분석 시작하기'}
                        color="amber"
                        cost={-1}
                    />
                </div>
            </div>


        </div>
    );
}
