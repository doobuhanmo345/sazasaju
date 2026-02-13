'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ChatBubbleLeftRightIcon, SparklesIcon, ExclamationTriangleIcon, LockClosedIcon, TicketIcon, HeartIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
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
    const [promptQ2, setPromptQ2] = useState('그 사람이 나를 어떻게 생각하는지');
    const [loadingPrompts, setLoadingPrompts] = useState(true);

    // Partner saju state
    const [partnerDate, setPartnerDate] = useState('2000-01-01T12:00');
    const [partnerTimeUnknown, setPartnerTimeUnknown] = useState(false);
    const [partnerGender, setPartnerGender] = useState('male');
    const { saju: partnerSajuCalculated } = useSajuCalculator(partnerDate, partnerTimeUnknown);
    const [partnerSaju, setPartnerSaju] = useState(null);
    const isKo = language === 'ko';
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
    const q1 = isKo ? '상대방의 진심.' : 'Their true feelings.';
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

                const q2 = await getPromptFromDB('love_feeling');
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

    const handleAnalysis = async () => {
        setAiResult('');
        setIsButtonClicked(true);
        if (isAnalysisDone) {
            router.push('/saju/love/feelings/result');
            return;
        }

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

            <div className="mx-auto  text-center px-6 animate-in fade-in slide-in-from-bottom-5 duration-700">
                <div>
                    <h2 className=" text-3xl font-black text-slate-800 dark:text-white mb-4 tracking-tight">
                        {language === 'ko' ? '사자가 읽어주는' : "by Saza's Saju reading"}

                        <br />
                        <span className=" relative text-amber-600 dark:text-amber-500">
                            {language === 'ko' ? '상대방의 속마음' : "the other person's heart"}
                            <div className="absolute inset-0 bg-amber-200/50 dark:bg-amber-800/60 blur-md rounded-full scale-100"></div>
                        </span>
                    </h2>
                </div>
                <div className="space-y-4 text-slate-600 dark:text-slate-400 mb-10 leading-relaxed break-keep">
                    <p className="text-md">
                        {language === 'ko' ? (
                            <>
                                그 사람은 나를 어떻게 생각하고 있을까요?<br /> <strong>상대방의 속마음</strong>과 진심을 사주로 분석해드립니다.
                            </>
                        ) : (
                            'What is he/she thinking about me? We analyze the other person\'s hidden thoughts and true feelings through Saju.'
                        )}
                    </p>

                    <div className="m-auto max-w-sm rounded-2xl overflow-hidden shadow-sm border border-slate-100 dark:border-slate-800">
                        <img
                            src="/images/introcard/love_feeling.webp"
                            alt="today's luck"
                            className="w-full h-auto"
                        />
                    </div>
                </div>
                {/* 파트너 인풋 */}
                <div className="mx-auto max-w-md mb-10 text-left animate-in fade-in slide-in-from-bottom-5 duration-700">
                    <div
                        className={`transition-all duration-300 ease-in-out rounded-2xl border overflow-hidden ${showPartnerInput
                            ? 'bg-white dark:bg-slate-800 border-amber-200 dark:border-amber-700/50 shadow-xl shadow-amber-100/50 dark:shadow-none ring-1 ring-amber-100 dark:ring-amber-900/20'
                            : 'bg-white/60 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 hover:border-amber-200 dark:hover:border-amber-700/30'
                            }`}
                    >
                        <button
                            onClick={() => setShowPartnerInput(!showPartnerInput)}
                            className="w-full p-5 flex items-center justify-between text-left focus:outline-none group"
                        >
                            <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${showPartnerInput
                                    ? 'bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-lg shadow-amber-200/50 dark:shadow-none'
                                    : 'bg-slate-100 dark:bg-slate-700 text-slate-400 group-hover:bg-amber-50 dark:group-hover:bg-slate-600 group-hover:text-amber-500'
                                    }`}>
                                    <HeartIcon className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className={`text-base font-bold transition-colors ${showPartnerInput ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-300'}`}>
                                        {language === 'ko' ? '상대방 정보 입력 (선택)' : 'Partner Info (Optional)'}
                                    </h3>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                        {showPartnerInput
                                            ? (language === 'ko' ? '정보를 입력하여 정확도를 높이세요' : 'Add info for better accuracy')
                                            : (language === 'ko' ? '상대방 사주를 추가할까요?' : 'Add partner\'s birth info?')}
                                    </p>
                                </div>
                            </div>
                            <div className={`transition-transform duration-300 ${showPartnerInput ? 'rotate-180 text-amber-500' : 'text-slate-400 group-hover:text-amber-400'}`}>
                                <ChevronDownIcon className="w-5 h-5" />
                            </div>
                        </button>

                        {showPartnerInput && (
                            <div className="px-5 pb-6 animate-in slide-in-from-top-2 fade-in duration-300">
                                <div className="h-px w-full bg-gradient-to-r from-transparent via-slate-200 dark:via-slate-700 to-transparent mb-6"></div>

                                <p className="text-sm text-slate-600 dark:text-slate-400 mb-6 bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl leading-relaxed border border-slate-100 dark:border-slate-800">
                                    {language === 'ko'
                                        ? '상대방의 생년월일을 입력하면 두 사람의 사주를 정밀하게 분석하여 속마음을 더 정확히 파악할 수 있습니다.'
                                        : 'Enter partner\'s birth info for detailed compatibility analysis. Skip for general analysis.'}
                                </p>

                                <div className="space-y-8">
                                    {/* Saved Profiles */}
                                    {savedProfiles && savedProfiles.length > 0 && (
                                        <div className="relative">
                                            <label className="absolute -top-2.5 left-3 px-2 bg-white dark:bg-slate-800 text-[10px] font-bold text-amber-500 uppercase tracking-wider">
                                                {language === 'ko' ? '저장된 프로필' : 'Saved Profile'}
                                            </label>
                                            <div className="border border-slate-200 dark:border-slate-700 rounded-xl p-4 pt-5">
                                                <SelectPerson
                                                    list={savedProfiles}
                                                    onSelect={onSelectPartner}
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {/* Date Input */}
                                    <div>
                                        <div className="flex items-center gap-2 mb-3 px-1">
                                            <div className="w-1 h-3 bg-amber-400 rounded-full"></div>
                                            <span className="text-sm font-bold text-slate-700 dark:text-slate-200">
                                                {language === 'ko' ? '상세 정보' : 'Details'}
                                            </span>
                                        </div>
                                        <SelBd
                                            inputDate={partnerDate}
                                            setInputDate={setPartnerDate}
                                            isTimeUnknown={partnerTimeUnknown}
                                            setIsTimeUnknown={setPartnerTimeUnknown}
                                            gender={partnerGender}
                                            setGender={setPartnerGender}
                                            handleSaveMyInfo={() => { }}
                                            color="amber"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Primary Analyze Button */}
                <div className="mb-12 max-w-lg mx-auto">
                    <AnalyzeButton
                        onClick={() => loveEnergy.triggerConsume(handleAnalysis)}
                        disabled={isDisabled || isDisabled2}
                        loading={loading}
                        isDone={isAnalysisDone}
                        label={language === 'ko' ? '확인하기' : 'Check his/her mind'}
                        color="amber"
                        cost={-1}
                    />


                </div>




            </div>



        </div>
    );
}
