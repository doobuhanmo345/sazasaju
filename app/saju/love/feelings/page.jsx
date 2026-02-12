'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ChatBubbleLeftRightIcon, SparklesIcon, ExclamationTriangleIcon, LockClosedIcon, TicketIcon } from '@heroicons/react/24/outline';
import { useAuthContext } from '@/contexts/useAuthContext';
import { useLanguage } from '@/contexts/useLanguageContext';
import { useUsageLimit } from '@/contexts/useUsageLimit';
import { useConsumeEnergy } from '@/hooks/useConsumingEnergy';
import { useLoading } from '@/contexts/useLoadingContext';
import { useSajuCalculator } from '@/hooks/useSajuCalculator';
import EnergyBadge from '@/ui/EnergyBadge';
import LoadingFourPillar from '@/components/LoadingFourPillar';
import { SajuAnalysisService, AnalysisPresets, getPromptFromDB } from '@/lib/SajuAnalysisService';
import SelBd from '@/app/saju/match/SelBd';
import SelectPerson from '@/ui/SelectPerson';
import AnalyzeButton from '@/ui/AnalyzeButton';
import { calculateSaju } from '@/lib/sajuCalculator';

export default function FeelingsPage() {
    const { language } = useLanguage();
    const router = useRouter();
    const { user, userData, selectedProfile, savedProfiles } = useAuthContext();
    const { MAX_EDIT_COUNT, isLocked, setEditCount } = useUsageLimit();
    const { loading, setLoading, setAiResult, handleCancelHelper } = useLoading();
    const targetProfile = selectedProfile || userData;
    const { gender, saju, isTimeUnknown } = targetProfile || {};
    const loveEnergy = useConsumeEnergy();

    const [isButtonClicked, setIsButtonClicked] = useState(false);
    const [showPartnerInput, setShowPartnerInput] = useState(false);
    const [promptQ1, setPromptQ1] = useState('상대방의 진심');
    const [promptQ2, setPromptQ2] = useState('그 사람이 나를 어떻게 생각하는지');
    const [loadingPrompts, setLoadingPrompts] = useState(true);

    // Partner saju state
    const [partnerDate, setPartnerDate] = useState('2000-01-01T12:00');
    const [partnerTimeUnknown, setPartnerTimeUnknown] = useState(false);
    const [partnerGender, setPartnerGender] = useState('male');
    const { saju: partnerSajuCalculated } = useSajuCalculator(partnerDate, partnerTimeUnknown);
    const [partnerSaju, setPartnerSaju] = useState(null);

    useEffect(() => {
        if (partnerSajuCalculated) {
            setPartnerSaju(partnerSajuCalculated);
        }
    }, [partnerSajuCalculated]);

    const onSelectPartner = (id) => {
        const profile = savedProfiles.find((p) => p.id === id);
        if (profile) {
            setPartnerSaju(profile.saju);
            // Handle birthDate and birthTime combination if necessary
            const dateStr = profile.birthTime ? `${profile.birthDate}T${profile.birthTime}` : profile.birthDate;
            setPartnerDate(dateStr);
            setPartnerTimeUnknown(profile.isTimeUnknown);
            setPartnerGender(profile.gender);
        }
    };

    useEffect(() => {
        if (language === 'ko') {
            document.title = '상대방의 진심 | 그 사람의 마음';
        } else {
            document.title = 'Their True Feelings | What They Really Think';
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
        // Fetch fixed prompts from DB
        const fetchPrompts = async () => {
            try {
                const q1 = '상대방의 진심.'
                const q2 = await getPromptFromDB('love_feeling');
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
    console.log(promptQ2)
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

    const prevData = userData?.usageHistory?.ZLoveFeelings;
    const isAnalysisDone = (() => {
        if (!prevData || !prevData.result) return false;
        if (prevData?.language !== language) return false;
        if (prevData?.gender !== targetProfile?.gender) return false;
        if (prevData?.ques2 !== promptQ2) return false;

        if (!showPartnerInput && !!prevData.partnerSaju) {
            return false;
        }
        // Check partner saju if provided
        if (showPartnerInput && partnerSaju) {
            if (!prevData.partnerSaju) return false;
            if (!SajuAnalysisService.compareSaju(prevData.partnerSaju, partnerSaju)) return false;
        } else if (prevData.partnerSaju) {
            return false;
        }

        return SajuAnalysisService.compareSaju(prevData.saju, targetProfile?.saju);
    })();
    console.log(isAnalysisDone)
    const handleAnalysis = async () => {
        setAiResult('');
        setIsButtonClicked(true);
        if (isAnalysisDone) {
            router.push('/saju/love/feelings/result');
            return;
        }
        const q1 = promptQ1;
        const q2 = promptQ2;
        const qprompt = ''; // Full instructions are now in q2 from DB

        // Ensure partner info is strictly null if input is closed
        const finalPartnerSaju = showPartnerInput ? partnerSaju : null;
        const finalPartnerGender = showPartnerInput ? partnerGender : null;

        try {
            const preset = AnalysisPresets.love({
                saju,
                gender,
                q1,
                q2: promptQ2,
                qprompt,
                language,
                cacheKey: 'ZLoveFeelings',
                partnerSaju: finalPartnerSaju,
                partnerGender: finalPartnerGender,
            });

            await service.analyze(preset);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        if (isButtonClicked && !loading && isAnalysisDone && prevData?.result && prevData?.result?.length > 0) {
            router.push('/saju/love/feelings/result');
        }
    }, [isButtonClicked, prevData, router, isAnalysisDone, loading]);
    const isDisabled = (loading && !loveEnergy.isConsuming) || !user || loading || loadingPrompts;
    const isDisabled2 = !isAnalysisDone && isLocked;

    if (loading && saju) {
        return <LoadingFourPillar saju={saju} isTimeUnknown={isTimeUnknown} isAnalysisDone={isAnalysisDone} />;
    }


    return (
        <div className="w-full animate-in fade-in duration-500">
            <div className="relative bg-gradient-to-br from-cyan-50 via-teal-50 to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 border-b border-cyan-100 dark:border-slate-700">
                <div className="max-w-4xl mx-auto px-4 py-16 text-center">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-cyan-500 to-teal-600 mb-6 shadow-2xl shadow-cyan-300 dark:shadow-cyan-900/50">
                        <ChatBubbleLeftRightIcon className="w-11 h-11 text-white" />
                    </div>
                    <h1 className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white mb-4 leading-tight">
                        {language === 'ko' ? '상대방의 진심' : 'Their True Feelings'}
                    </h1>
                    <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
                        {language === 'ko'
                            ? '그 사람의 진짜 마음을 분석합니다'
                            : 'Analyze what they truly feel about you'}
                    </p>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 py-12">
                {/* Partner Input Toggle */}
                <div className="mb-8 p-6 bg-cyan-50 dark:bg-cyan-900/10 rounded-2xl border border-cyan-200 dark:border-cyan-800">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                            {language === 'ko' ? '상대방 정보 입력 (선택사항)' : 'Partner Information (Optional)'}
                        </h3>
                        <button
                            onClick={() => setShowPartnerInput(!showPartnerInput)}
                            className={`px-4 py-2 rounded-lg font-semibold transition-all ${showPartnerInput
                                ? 'bg-cyan-600 text-white'
                                : 'bg-white dark:bg-slate-800 text-cyan-600 border border-cyan-300'
                                }`}
                        >
                            {showPartnerInput ? (language === 'ko' ? '입력 취소' : 'Cancel') : (language === 'ko' ? '입력하기' : 'Add Info')}
                        </button>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                        {language === 'ko'
                            ? '상대방의 사주를 입력하면 더 정확한 궁합 분석이 가능합니다. 입력하지 않으면 일반적인 분석을 제공합니다.'
                            : 'Enter partner\'s birth info for detailed compatibility analysis. Skip for general analysis.'}
                    </p>

                    {showPartnerInput && (
                        <div className="mt-6 space-y-6">
                            {savedProfiles && savedProfiles.length > 0 && (
                                <div className="max-w-xs">
                                    <label className="block text-xs font-black text-cyan-600/70 dark:text-cyan-400/70 uppercase tracking-wider mb-2">
                                        {language === 'ko' ? '저장된 프로필 선택' : 'Select Saved Profile'}
                                    </label>
                                    <SelectPerson
                                        list={savedProfiles}
                                        onSelect={onSelectPartner}
                                    />
                                </div>
                            )}
                            <SelBd
                                inputDate={partnerDate}
                                setInputDate={setPartnerDate}
                                isTimeUnknown={partnerTimeUnknown}
                                setIsTimeUnknown={setPartnerTimeUnknown}
                                gender={partnerGender}
                                setGender={setPartnerGender}
                                handleSaveMyInfo={() => { }}
                                color="cyan"
                            />
                        </div>
                    )}
                </div>

                <div className="mb-8">
                    <div className="p-8 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm text-center">
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-cyan-100 dark:bg-cyan-900/30 text-cyan-500 mb-4">
                            <SparklesIcon className="w-6 h-6" />
                        </div>
                        <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-2">
                            {promptQ1}
                        </h2>
                        <p className="text-slate-600 dark:text-slate-400">
                            {language === 'ko' ?
                                '그 사람은 나를 어떻게 생각하고 있을까요? 상대방의 숨겨진 속마음과 진심을 사주로 분석해드립니다.' :
                                'What do they really think of you? Analyze their hidden feelings and sincerity toward you using Saju.'}
                        </p>
                    </div>
                </div>

                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="flex flex-col items-center gap-4 py-8">
                        <AnalyzeButton
                            onClick={() => loveEnergy.triggerConsume(handleAnalysis)}
                            disabled={isDisabled || isDisabled2}
                            loading={loading}
                            isDone={isAnalysisDone}
                            label={language === 'ko' ? '상대방의 진심 확인하기' : 'Check Partner\'s Feelings'}
                            color="cyan"
                            cost={-1}
                        />

                    </div>
                </div>

                {/* [REMOVED] Question prompt */}
            </div>
        </div>
    );
}
