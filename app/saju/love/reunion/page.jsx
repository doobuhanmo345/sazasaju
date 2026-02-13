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
import { SajuAnalysisService, AnalysisPresets, getPromptFromDB } from '@/lib/SajuAnalysisService';
import SelBd from '@/app/saju/match/SelBd';
import SelectPerson from '@/ui/SelectPerson';
import AnalyzeButton from '@/ui/AnalyzeButton';
import { calculateSaju } from '@/lib/sajuCalculator';

export default function ReunionPage() {
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
    const [promptQ1, setPromptQ1] = useState('재회 가능성.');
    const [promptQ2, setPromptQ2] = useState('다시 만날 운명이 있을지');
    const [loadingPrompts, setLoadingPrompts] = useState(true);

    const [partnerDate, setPartnerDate] = useState('2000-01-01T12:00');
    const [partnerTimeUnknown, setPartnerTimeUnknown] = useState(false);
    const [partnerGender, setPartnerGender] = useState('male');
    const { saju: partnerSaju } = useSajuCalculator(partnerDate, partnerTimeUnknown);

    const onSelectPartner = (id) => {
        const profile = savedProfiles.find((p) => p.id === id);
        if (profile) {
            const dateStr = profile.birthTime ? `${profile.birthDate}T${profile.birthTime}` : profile.birthDate;
            setPartnerDate(dateStr);
            setPartnerGender(profile.gender);
            setPartnerTimeUnknown(profile.isTimeUnknown);
        }
    };

    // Partner saju state

    useEffect(() => {
        if (language === 'ko') {
            document.title = '재회운 | 헤어진 사람과의 재회';
        } else {
            document.title = 'Reunion Fortune | Getting Back Together';
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
                const q1 = '재회 가능성.';
                const q2 = await getPromptFromDB('love_reunion');
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

    const prevData = userData?.usageHistory?.ZLoveReunion;
    const isAnalysisDone = (() => {
        if (!prevData || !prevData.result) return false;
        if (prevData?.language !== language) return false;
        if (prevData?.ques2 !== promptQ2) return false;
        if (prevData?.gender !== targetProfile?.gender) return false;
        // Check partner saju if provided
        if (!showPartnerInput && prevData?.partnerSaju) {
            return false;
        }
        if (showPartnerInput && partnerSaju) {
            if (!prevData.partnerSaju) return false;
            if (!SajuAnalysisService.compareSaju(prevData.partnerSaju, partnerSaju)) return false;
        }
        return SajuAnalysisService.compareSaju(prevData.saju, targetProfile?.saju);
    })();

    const handleAnalysis = async () => {
        setAiResult('');
        setIsButtonClicked(true);
        if (isAnalysisDone) {
            router.push('/saju/love/reunion/result');
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


    const isDisabled = (loading && !loveEnergy.isConsuming) || !user || loading || loadingPrompts;
    const isDisabled2 = !isAnalysisDone && isLocked;

    if (loading && saju) {

        return <LoadingFourPillar saju={saju} isTimeUnknown={isTimeUnknown} isAnalysisDone={isAnalysisDone} />;
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
                        <div className="mt-6 space-y-6">
                            {savedProfiles && savedProfiles.length > 0 && (
                                <div className="max-w-xs">
                                    <label className="block text-xs font-black text-purple-600/70 dark:text-purple-400/70 uppercase tracking-wider mb-2">
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
                                color="purple"
                            />
                        </div>
                    )}
                </div>

                {/* Question Selection */}
                <div className="mb-8">
                    <div className="p-8 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm text-center">
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-500 mb-4">
                            <SparklesIcon className="w-6 h-6" />
                        </div>
                        <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-2">
                            {promptQ1}
                        </h2>
                        <p className="text-slate-600 dark:text-slate-400">
                            {language === 'ko' ?
                                '헤어진 연인과의 재회 가능성과 시기를 사주로 분석해드립니다. 상대방의 속마음과 두 사람의 인연 끈이 아직 이어져 있는지 확인해보세요.' :
                                'Analyze the possibility and timing of reuniting with your ex-partner using Saju. Discover their true feelings and find out if the thread of destiny still connects you two.'}
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
                            label={language === 'ko' ? '재회 가능성 확인하기' : 'Check Reunion Destiny'}
                            color="indigo"
                            cost={-1}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
