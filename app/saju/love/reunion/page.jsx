'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ArrowPathIcon, SparklesIcon, ExclamationTriangleIcon, LockClosedIcon, TicketIcon } from '@heroicons/react/24/outline';
import { useAuthContext } from '@/contexts/useAuthContext';
import { useLanguage } from '@/contexts/useLanguageContext';
import { useUsageLimit } from '@/contexts/useUsageLimit';
import { useConsumeEnergy } from '@/hooks/useConsumingEnergy';
import { useLoading } from '@/contexts/useLoadingContext';
import { useSajuCalculator } from '@/hooks/useSajuCalculator';
import EnergyBadge from '@/ui/EnergyBadge';
import LoadingFourPillar from '@/components/LoadingFourPillar';
import { SajuAnalysisService, AnalysisPresets } from '@/lib/SajuAnalysisService';
import SelBd from '@/app/saju/match/SelBd';

export default function ReunionPage() {
    const { language } = useLanguage();
    const router = useRouter();
    const { user, userData, selectedProfile } = useAuthContext();
    const { MAX_EDIT_COUNT, isLocked, setEditCount } = useUsageLimit();
    const { loading, setLoading, setAiResult } = useLoading();
    const targetProfile = selectedProfile || userData;
    const { gender, saju, isTimeUnknown } = targetProfile || {};
    const loveEnergy = useConsumeEnergy();

    const [selectedSubQ, setSelectedSubQ] = useState(null);
    const [isButtonClicked, setIsButtonClicked] = useState(false);
    const [showPartnerInput, setShowPartnerInput] = useState(false);

    // Partner saju state
    const [partnerDate, setPartnerDate] = useState('2000-01-01T12:00');
    const [partnerTimeUnknown, setPartnerTimeUnknown] = useState(false);
    const [partnerGender, setPartnerGender] = useState('male');
    const { saju: partnerSaju } = useSajuCalculator(partnerDate, partnerTimeUnknown);

    useEffect(() => {
        if (language === 'ko') {
            document.title = '재회운 | 헤어진 사람과의 재회';
        } else {
            document.title = 'Reunion Fortune | Getting Back Together';
        }
    }, [language]);

    const SUB_Q_TYPES = [
        {
            id: 'general',
            label: '재회 가능성',
            labelEn: 'Reunion Possibility',
            desc: '헤어진 사람과 다시 만날 가능성',
            descEn: 'Possibility of getting back together',
            prompt: 'Analyze the general possibility of reunion based on the user\'s saju.',
        },
        {
            id: 'timing',
            label: '재회 시기',
            labelEn: 'Reunion Timing',
            desc: '재회하기 좋은 시기',
            descEn: 'Best timing for reunion',
            prompt: 'Analyze the best timing for potential reunion.',
        },
        {
            id: 'advice',
            label: '재회 조언',
            labelEn: 'Reunion Advice',
            desc: '재회를 위한 조언',
            descEn: 'Advice for reunion',
            prompt: 'Provide advice and guidance for potential reunion.',
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

    const prevData = userData?.usageHistory?.ZLoveReunion;
    const isAnalysisDone = (() => {
        if (!prevData || !prevData.result) return false;
        if (prevData?.language !== language) return false;
        if (prevData?.gender !== targetProfile?.gender) return false;
        if (prevData?.ques !== '재회운') return false;
        if (prevData?.ques2 !== SUB_Q_TYPES.find((i) => i.id === selectedSubQ)?.desc) return false;

        // Check partner saju if provided
        if (showPartnerInput && partnerSaju) {
            if (!prevData.partnerSaju) return false;
            if (!SajuAnalysisService.compareSaju(prevData.partnerSaju, partnerSaju)) return false;
        }

        return SajuAnalysisService.compareSaju(prevData.saju, targetProfile?.saju);
    })();

    const handleAnalysis = async () => {
        setAiResult('');
        setIsButtonClicked(true);
        const q1 = '재회운';
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
                cacheKey: 'ZLoveReunion',
                partnerSaju: showPartnerInput ? partnerSaju : null,
                partnerGender: showPartnerInput ? partnerGender : null,
            });

            await service.analyze(preset);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        if (isButtonClicked && !loading && isAnalysisDone && prevData?.result && prevData?.result?.length > 0) {
            router.push('/saju/love/reunion/result');
        }
    }, [isButtonClicked, prevData, router, isAnalysisDone, loading]);

    const isDisabled = (loading && !loveEnergy.isConsuming) || !user || loading;
    const isDisabled2 = !isAnalysisDone && isLocked;

    if (loading && saju) {
        return <LoadingFourPillar saju={saju} isTimeUnknown={isTimeUnknown} />;
    }

    return (
        <div className="w-full animate-in fade-in duration-500">
            <div className="relative bg-gradient-to-br from-purple-50 via-violet-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 border-b border-purple-100 dark:border-slate-700">
                <div className="max-w-4xl mx-auto px-4 py-16 text-center">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-purple-500 to-violet-600 mb-6 shadow-2xl shadow-purple-300 dark:shadow-purple-900/50">
                        <ArrowPathIcon className="w-11 h-11 text-white" />
                    </div>
                    <h1 className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white mb-4 leading-tight">
                        {language === 'ko' ? '재회운 분석' : 'Reunion Fortune'}
                    </h1>
                    <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
                        {language === 'ko'
                            ? '헤어진 사람과의 재회 가능성을 분석합니다'
                            : 'Analyze the possibility of reunion with your ex'}
                    </p>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 py-12">
                {/* Partner Input Toggle */}
                <div className="mb-8 p-6 bg-purple-50 dark:bg-purple-900/10 rounded-2xl border border-purple-200 dark:border-purple-800">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                            {language === 'ko' ? '상대방 정보 입력 (선택사항)' : 'Partner Information (Optional)'}
                        </h3>
                        <button
                            onClick={() => setShowPartnerInput(!showPartnerInput)}
                            className={`px-4 py-2 rounded-lg font-semibold transition-all ${showPartnerInput
                                ? 'bg-purple-600 text-white'
                                : 'bg-white dark:bg-slate-800 text-purple-600 border border-purple-300'
                                }`}
                        >
                            {showPartnerInput ? (language === 'ko' ? '입력 취소' : 'Cancel') : (language === 'ko' ? '입력하기' : 'Add Info')}
                        </button>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                        {language === 'ko'
                            ? '상대방의 사주를 입력하면 더 정확한 궁합 분석이 가능합니다. 입력하지 않으면 일반적인 재회운을 분석합니다.'
                            : 'Enter partner\'s birth info for detailed compatibility analysis. Skip for general reunion fortune.'}
                    </p>

                    {showPartnerInput && (
                        <div className="mt-6">
                            <SelBd
                                inputDate={partnerDate}
                                setInputDate={setPartnerDate}
                                isTimeUnknown={partnerTimeUnknown}
                                setIsTimeUnknown={setPartnerTimeUnknown}
                                gender={partnerGender}
                                setGender={setPartnerGender}
                            />
                        </div>
                    )}
                </div>

                {/* Question Selection */}
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
                                        ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 shadow-lg shadow-purple-100 dark:shadow-purple-900/20 scale-[1.02]'
                                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-purple-300 hover:shadow-md'
                                        }`}
                                >
                                    <div className={`flex-shrink-0 w-14 h-14 rounded-xl flex items-center justify-center transition-all ${isSelected
                                        ? 'bg-purple-500 text-white shadow-lg'
                                        : 'bg-slate-100 dark:bg-slate-700 text-slate-400 group-hover:bg-purple-100 group-hover:text-purple-500'
                                        }`}>
                                        <ArrowPathIcon className="w-7 h-7" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className={`text-lg font-bold mb-1 ${isSelected ? 'text-purple-900 dark:text-purple-100' : 'text-slate-800 dark:text-slate-100'
                                            }`}>
                                            {labelText}
                                        </h3>
                                        <p className={`text-sm ${isSelected ? 'text-purple-700 dark:text-purple-300' : 'text-slate-500 dark:text-slate-400'
                                            }`}>
                                            {descText}
                                        </p>
                                    </div>
                                    {isSelected && (
                                        <div className="flex-shrink-0">
                                            <div className="w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center">
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
                                    : 'bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 text-white shadow-purple-400 dark:shadow-purple-900/50 hover:-translate-y-1 hover:shadow-purple-500'
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
                                        <LockClosedIcon className="w-5 h-5 text-purple-500" />
                                    </div>
                                ) : user && (
                                    <div className="relative">
                                        <EnergyBadge active={!!userData?.birthDate} consuming={loading} cost={-1} />
                                    </div>
                                )}
                            </button>

                            {isLocked ? (
                                <p className="text-purple-600 font-bold text-sm flex items-center gap-2 animate-pulse">
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
