'use client';

import { useRouter } from 'next/navigation';
import Image from 'next/image';
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
import style from '@/data/styleConstants';

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
    const isKo = language === 'ko'
    const q1 = isKo ? '내가 피해야 하는 사람.' : 'People I should avoid.';
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

                const q2 = await getPromptFromDB('love_avoid');
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

    const handleAnalysis = async () => {
        setAiResult('');
        setIsButtonClicked(true);
        if (isAnalysisDone) {
            router.push('/saju/love/avoid/result');
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
            <div className="mx-auto  text-center px-6 animate-in fade-in slide-in-from-bottom-5 duration-700">
                <div>
                    <h2 className={style.sajuTitle}>
                        {language === 'ko' ? '나와 안 맞는 사람' : "by Saza's Saju reading"}

                        <br />
                        <span className=" relative text-amber-600 dark:text-amber-500">
                            {language === 'ko' ? '사자가 알려드려요' : "the other person's heart"}
                            <div className="absolute inset-0 bg-amber-200/50 dark:bg-amber-800/60 blur-md rounded-full scale-100"></div>
                        </span>
                    </h2>
                </div>
                <div className={style.sajuDesc}>
                    <p className="text-md">
                        {language === 'ko' ? (
                            <>
                                절대 만나면 안 되는 사람은 누구일까요? <br />
                                나에게 해가 되거나 악연이 될 수 있는 사람의 특징을 미리 확인하고 피하세요.
                            </>
                        ) : (
                            <>
                                Who is the person you should never meet? <br />
                                Check the characteristics of people who could be <br /> harmful or a bad match for you in advance and avoid them.
                            </>
                        )}
                    </p>

                    <div className="m-auto max-w-sm rounded-2xl overflow-hidden shadow-sm border border-slate-100 dark:border-slate-800">
                        <Image
                            src="/images/introcard/love_avoid.webp"
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
