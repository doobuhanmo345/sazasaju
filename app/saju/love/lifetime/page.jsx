'use client';

import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { HeartIcon, SparklesIcon, ExclamationTriangleIcon, LockClosedIcon, TicketIcon } from '@heroicons/react/24/outline';
import { useAuthContext } from '@/contexts/useAuthContext';
import { useLanguage } from '@/contexts/useLanguageContext';
import { useUsageLimit } from '@/contexts/useUsageLimit';
import { useConsumeEnergy } from '@/hooks/useConsumingEnergy';
import { useLoading } from '@/contexts/useLoadingContext';
import EnergyBadge from '@/ui/EnergyBadge';
import LoadingFourPillar from '@/components/LoadingFourPillar';
import { SajuAnalysisService, AnalysisPresets } from '@/lib/SajuAnalysisService';
import AnalyzeButton from '@/ui/AnalyzeButton';
import style from '@/data/styleConstants';

export default function LifetimeLovePage() {
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
        if (isKo) {
            document.title = '평생 애정운 분석 | 타고난 연애 패턴';
        } else {
            document.title = 'Lifetime Love Fortune | Innate Relationship Patterns';
        }
    }, [language]);

    const SUB_Q_TYPES = [
        {
            id: 'pattern',
            label: '나의 연애 패턴',
            labelEn: 'My Relationship Pattern',
            desc: '타고난 애정운과 연애 스타일',
            descEn: 'Innate love fortune and dating style',
            prompt: 'Analyze the user\'s innate relationship patterns, dating style, and romantic tendencies.',
        },
        {
            id: 'ideal',
            label: '이상형 분석',
            labelEn: 'Ideal Partner Analysis',
            desc: '나에게 맞는 이상적인 파트너',
            descEn: 'Ideal partner characteristics for me',
            prompt: 'Analyze what type of partner is ideal for the user based on their saju.',
        },
        {
            id: 'weakness',
            label: '연애에서의 약점',
            labelEn: 'Relationship Weaknesses',
            desc: '연애할 때 주의해야 할 점',
            descEn: 'Things to watch out for in relationships',
            prompt: 'Analyze the user\'s potential weaknesses or challenges in romantic relationships.',
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

    const prevData = userData?.usageHistory?.ZLoveLifetime;
    const isAnalysisDone = (() => {
        if (!prevData || !prevData.result) return false;
        if (prevData?.language !== language) return false;
        if (prevData?.gender !== targetProfile?.gender) return false;
        if (prevData?.ques !== '평생 애정운') return false;
        if (prevData?.ques2 !== SUB_Q_TYPES.find((i) => i.id === selectedSubQ)?.desc) return false;
        return SajuAnalysisService.compareSaju(prevData.saju, targetProfile?.saju);
    })();

    const handleAnalysis = async () => {
        setAiResult('');
        setIsButtonClicked(true);
        if (isAnalysisDone) {
            router.push('/saju/love/lifetime/result');
            return;
        }
        const q1 = isKo ? '평생 애정운' : 'Lifetime Love Fortune';
        const q2 = SUB_Q_TYPES.find((i) => i.id === selectedSubQ)?.desc;
        const qprompt = SUB_Q_TYPES.find((i) => i.id === selectedSubQ)?.prompt;

        try {
            const preset = AnalysisPresets.love({
                saju,
                gender,
                q1,
                q2,
                qprompt,
                cacheKey: 'ZLoveLifetime',
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
            router.push('/saju/love/lifetime/result');
        }
    }, [isButtonClicked, prevData, router, isAnalysisDone, loading]);

    const isDisabled = (loading && !loveEnergy.isConsuming) || !user || loading;
    const isDisabled2 = !isAnalysisDone && isLocked;

    // Full-screen loading display
    if (loading && saju) {
        return <LoadingFourPillar saju={saju} isTimeUnknown={isTimeUnknown} isAnalysisDone={isAnalysisDone} />;
    }

    return (
        <div className="w-full animate-in fade-in duration-500">
            {/* Hero Section */}
            <div className="mx-auto  text-center px-6 animate-in fade-in slide-in-from-bottom-5 duration-700">
                <div>
                    <h2 className={style.sajuTitle}>
                        {language === 'ko' ? '나의 연애 완전 분석' : "Your Ultimate Love Blueprint"}

                        <br />
                        <span className="relative text-emerald-600 dark:text-emerald-500">
                            {language === 'ko' ? '나의 성향부터 약점까지 한눈에' : "From Your Style to People to Avoid"}
                            <div className="absolute inset-0 bg-emerald-200/50 dark:bg-emerald-800/60 blur-md rounded-full scale-100"></div>
                        </span>
                    </h2>
                </div>
                <div className={style.sajuDesc}>
                    {language === 'ko' ? (
                        <>
                            나의 <strong>타고난 연애 패턴</strong>과 <strong>이상형</strong>, 그리고 <strong>치명적인 약점</strong>까지. <br />
                            더불어 나에게 해가 될 수 있는 <strong>약점</strong>을 미리 파악해보세요
                        </>
                    ) : (
                        <>
                            Discover your <strong>innate love pattern</strong>, <strong>ideal partner</strong>, and <strong>hidden weaknesses</strong>. <br />
                            Learn to identify <strong>toxic connections</strong> in advance <br /> and design your path to a perfect relationship.
                        </>
                    )}

                    <div className="m-auto max-w-sm rounded-[2rem] overflow-hidden shadow-sm border border-slate-100 dark:border-slate-800 relative z-0"
                        style={{ maskImage: 'linear-gradient(to bottom, black 60%, transparent 100%)', WebkitMaskImage: 'linear-gradient(to bottom, black 60%, transparent 100%)' }}>
                        <Image
                            src="/images/introcard/love_lifetime.webp"
                            alt="today's luck"
                            width={800}
                            height={600}
                            className="w-full h-auto opacity-90"
                            priority
                        />
                    </div>
                </div>
                <div className="max-w-md mx-auto px-4 -mt-20 relative z-10">
                    {/* Question Selection */}
                    <div className="mb-4">
                        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-6 px-1 flex items-center gap-2">
                            <span className="w-1.5 h-6 bg-emerald-500 rounded-full inline-block"></span>
                            {language === 'ko' ? '궁금한 주제 선택' : 'Select a Topic'}
                        </h2>
                        <div className="flex flex-col gap-2">
                            {SUB_Q_TYPES.map((sub) => {
                                const isSelected = selectedSubQ === sub.id;
                                const labelText = language !== 'ko' ? sub.labelEn : sub.label;
                                const descText = language !== 'ko' ? sub.descEn : sub.desc;

                                return (
                                    <button
                                        key={sub.id}
                                        onClick={() => setSelectedSubQ(sub.id)}
                                        className={`w-full text-left px-5 py-4 rounded-2xl transition-all duration-200 border relative overflow-hidden group ${isSelected
                                            ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-500 dark:border-emerald-500/50 shadow-sm ring-1 ring-emerald-500/20'
                                            : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-800 hover:border-emerald-200 dark:hover:border-emerald-800 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                                            }`}
                                    >
                                        <div className="flex items-center justify-between relative z-10">
                                            <div>
                                                <h3 className={`font-bold text-[15px] transition-colors ${isSelected ? 'text-emerald-800 dark:text-emerald-300' : 'text-slate-700 dark:text-slate-200'
                                                    }`}>
                                                    {labelText}
                                                </h3>
                                                <p className={`text-xs mt-0.5 transition-colors ${isSelected ? 'text-emerald-600/80 dark:text-emerald-400/70' : 'text-slate-400 dark:text-slate-500'
                                                    }`}>
                                                    {descText}
                                                </p>
                                            </div>
                                            <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${isSelected
                                                ? 'bg-emerald-500 border-emerald-500 scale-110'
                                                : 'border-slate-300 dark:border-slate-600 group-hover:border-emerald-300'
                                                }`}>
                                                {isSelected && (
                                                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                    </svg>
                                                )}
                                            </div>
                                        </div>
                                        {/* Subtle highlight effect on hover */}
                                        {!isSelected && <div className="absolute inset-0 bg-emerald-50/0 group-hover:bg-emerald-50/30 transition-colors duration-300"></div>}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {selectedSubQ && (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">

                            {/* Analysis Button */}
                            <div className="flex flex-col items-center gap-4 py-8">
                                <AnalyzeButton
                                    onClick={() => loveEnergy.triggerConsume(handleAnalysis)}
                                    disabled={isDisabled || isDisabled2}
                                    isDone={isAnalysisDone}
                                    language={language}
                                    label={language !== 'ko' ? 'Start Analysis' : '분석 시작하기'}
                                    cost={-1}
                                    color="emerald"
                                />


                                {isLocked ? (
                                    <p className="text-rose-600 font-bold text-sm flex items-center gap-2 animate-pulse">
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

            {/* Main Content */}

        </div>
    );
}
