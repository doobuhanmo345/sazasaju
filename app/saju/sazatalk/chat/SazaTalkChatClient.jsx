'use client';

import { useRef, useState, useEffect, useMemo, Suspense } from 'react';
import AnalysisStepContainer from '@/components/AnalysisStepContainer';
import { useAuthContext } from '@/contexts/useAuthContext';
import { useUsageLimit } from '@/contexts/useUsageLimit';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useLoading } from '@/contexts/useLoadingContext';
import { UI_TEXT } from '@/data/constants';
import html2canvas from 'html2canvas';
import { useLanguage } from '@/contexts/useLanguageContext';
import { classNames } from '@/utils/helpers';
import { PencilSquareIcon, LockClosedIcon, ClockIcon, XMarkIcon, ClipboardDocumentIcon, CameraIcon } from '@heroicons/react/24/outline';
import { SajuAnalysisService, AnalysisPresets } from '@/lib/SajuAnalysisService';
import AnalyzeButton from '@/ui/AnalyzeButton';
import { langPrompt, hanja } from '@/data/constants';
import EnergyBadge from '@/ui/EnergyBadge';
import { useRouter, useSearchParams } from 'next/navigation';
import ViewSazaResult from '@/app/saju/sazatalk/ViewSazaResult';
import { parseAiResponse } from '@/utils/helpers';
import { aiSajuStyle } from '@/data/aiResultConstants';
import SazaTalkAppeal from '@/app/saju/sazatalk/SazaTalkAppeal';
import style from '@/data/styleConstants';

const DISABLED_STYLE = 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed';

function ChatClientContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const initialQuery = searchParams.get('q');

    const { loading, setLoading, setLoadingType, setAiResult, aiResult, handleCancelHelper } = useLoading();
    const { userData, user, selectedProfile } = useAuthContext();

    const targetProfile = selectedProfile || userData;
    const { saju, gender, birthDate: inputDate } = targetProfile || {};

    const { language } = useLanguage();
    const { setEditCount, MAX_EDIT_COUNT, editCount, isLocked } = useUsageLimit();
    const [step, setStep] = useState('input');

    useEffect(() => {
        if (language === 'ko') {
            document.title = '사자톡 (SazaTalk) |  사주 실시간 상담';
        } else {
            document.title = 'SazaTalk | AI Saju Consulting';
        }
    }, [language]);

    const [userQuestion, setUserQuestion] = useState(initialQuery || '');
    const [latestSazaTalk, setLatestSazaTalk] = useState(null);
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);
    const historyContentRef = useRef(null);
    const [autoStarted, setAutoStarted] = useState(false);

    const handleHistoryCopy = async () => {
        if (!latestSazaTalk?.result) return;
        try {
            await navigator.clipboard.writeText(latestSazaTalk.result);
            alert(language === 'ko' ? '복사되었습니다.' : 'Copied to clipboard.');
        } catch (err) {
            console.error('Failed to copy text: ', err);
        }
    };

    const handleHistoryCapture = async () => {
        if (historyContentRef.current) {
            const original = historyContentRef.current;

            const container = document.createElement('div');
            container.style.position = 'fixed';
            container.style.top = '0';
            container.style.left = '-9999px';
            container.style.zIndex = '-9999';
            container.style.width = '550px';
            document.body.appendChild(container);

            const clone = original.cloneNode(true);

            clone.style.width = '100%';
            clone.style.height = 'auto';
            clone.style.maxHeight = 'none';
            clone.style.overflow = 'visible';
            clone.style.borderRadius = '0';
            clone.style.background = '#ffffff';

            container.appendChild(clone);

            await new Promise(resolve => setTimeout(resolve, 300));

            try {
                const canvas = await html2canvas(clone, {
                    backgroundColor: '#ffffff',
                    scale: 2,
                    useCORS: true,
                    windowWidth: 550,
                });

                const link = document.createElement('a');
                link.download = `saza_history_${new Date().toISOString().slice(0, 10)}.png`;
                link.href = canvas.toDataURL('image/png');
                link.click();
            } catch (err) {
                console.error('Failed to capture image: ', err);
                alert(language === 'ko' ? '이미지 저장에 실패했습니다.' : 'Failed to save image.');
            } finally {
                document.body.removeChild(container);
            }
        }
    };

    useEffect(() => {
        if (user?.uid) {
            const fetchHistory = async () => {
                try {
                    const docRef = doc(db, 'users', user.uid);
                    const docSnap = await getDoc(docRef);
                    if (docSnap.exists()) {
                        const data = docSnap.data();
                        if (data.usageHistory?.Zsazatalk) {
                            setLatestSazaTalk(data.usageHistory.Zsazatalk);
                        }
                    }
                } catch (error) {
                    console.error('Error fetching SazaTalk history:', error);
                }
            };
            fetchHistory();
        }
    }, [user]);

    const parsedHistoryData = useMemo(() => {
        if (!latestSazaTalk?.result) return null;
        try {
            return parseAiResponse(latestSazaTalk.result) || {};
        } catch (e) {
            console.error("Failed to parse history:", e);
            return null;
        }
    }, [latestSazaTalk]);

    const service = new SajuAnalysisService({
        user,
        userData: targetProfile,
        language,
        maxEditCount: MAX_EDIT_COUNT,
        uiText: UI_TEXT,
        langPrompt,
        hanja,
        setEditCount,
        setLoading,
        setAiResult,
        setStep,
        handleCancelHelper,
    });

    const handleSazaTest = async (onstart) => {
        if (!inputDate) {
            alert(language === 'ko' ? '사주 정보를 먼저 등록해 주세요.' : 'Please register your Saju info first.');
            router.push('/');
            return;
        }

        if (latestSazaTalk && !autoStarted) {
            if (!window.confirm(UI_TEXT.overwriteConfirm?.[language] || (language === 'ko' ? "새로운 질문을 하시면 이전 답변은 사라집니다. 계속하시겠습니까?" : "Asking a new question will delete the previous answer. Do you want to continue?"))) {
                return;
            }
        }

        setAiResult('');
        try {
            const result = await service.analyze(
                AnalysisPresets.saza({
                    saju: saju,
                    gender: gender,
                    inputDate: inputDate,
                    question: userQuestion,
                }),
            );
            if (result) {
                setLatestSazaTalk({
                    question: userQuestion,
                    result: result,
                    timestamp: new Date().toISOString(),
                });
            }
            onstart();
        } catch (error) {
            console.error(error);
        }
    };

    // Auto-start analysis if query param is present
    useEffect(() => {
        if (initialQuery && !autoStarted && inputDate && !loading) {
            // A small delay to ensure everything is mounted
            const timer = setTimeout(() => {
                setAutoStarted(true);
                // We need to pass a dummy onStart function or handle it appropriately
                // AnalysisStepContainer handles step transitions, but we can trigger the service directly.
                // However, service.analyze calls setStep internaly.
                // But we need to make sure AnalysisStepContainer knows we are starting.
                // Since we cannot easily access the internal onStart of AnalysisStepContainer from here without refs or context,
                // we might rely on the user clicking or just setting the question.

                // Actually, best user experience might be just pre-filling it and letting user click to confirm (to avoid accidental credit usage),
                // OR if the user explicitly clicked "Send" on the banner, they expect it to run.

                // Let's TRY to auto-run if the user context is ready.
                handleSazaTest(() => { });
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [initialQuery, inputDate, loading, autoStarted]);


    const Loading = () => {
        const [progress, setProgress] = useState(0);
        const [msgIdx, setMsgIdx] = useState(0);

        const loadingMessages = language === 'ko' ? [
            "당신의 사주 원국을 분석하고 있어요",
            "오늘의 천기(天氣)를 읽는 중입니다",
            "사자와 전문가들이 지혜를 모으고 있어요",
            "명쾌한 해답을 정리하고 있습니다"
        ] : [
            "Analyzing your Saju pillars...",
            "Reading today's celestial flow...",
            "Gathering wisdom from Saju masters...",
            "Drafting a clear solution for you..."
        ];

        useEffect(() => {
            const progressTimer = setInterval(() => {
                setProgress(prev => {
                    if (prev >= 98) {
                        clearInterval(progressTimer);
                        return 98;
                    }
                    const step = prev < 80 ? Math.random() * 10 : Math.random() * 2;
                    return Math.min(prev + step, 98);
                });
            }, 800);

            const msgTimer = setInterval(() => {
                setMsgIdx(prev => (prev + 1) % loadingMessages.length);
            }, 2500);

            return () => {
                clearInterval(progressTimer);
                clearInterval(msgTimer);
            };
        }, []);

        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] overflow-hidden transform-gpu py-12">
                <div className="relative flex items-center justify-center w-64 h-64 mb-8">
                    <div className="absolute w-40 h-40 rounded-full border-2 border-indigo-100/50 dark:border-indigo-900/20 animate-[spin_3s_linear_infinite] will-change-transform"></div>
                    <div className="absolute w-48 h-48 rounded-full border border-dashed border-indigo-200/30 dark:border-indigo-800/20 animate-[spin_10s_linear_infinite_reverse] will-change-transform"></div>

                    <div className="absolute w-48 h-48 animate-[spin_4s_linear_infinite] will-change-transform">
                        <span className="absolute top-0 left-1/2 -translate-x-1/2 text-2xl filter drop-shadow-md">✨</span>
                    </div>
                    <div className="absolute w-32 h-32 animate-[spin_6s_linear_infinite_reverse] will-change-transform">
                        <span className="absolute bottom-0 left-1/2 -translate-x-1/2 text-xl filter drop-shadow-md">⭐</span>
                    </div>
                    <div className="absolute w-56 h-56 animate-[spin_8s_linear_infinite] will-change-transform">
                        <span className="absolute left-0 top-1/2 -translate-y-1/2 text-xl filter drop-shadow-md">🌙</span>
                    </div>

                    <div className="relative flex flex-col items-center z-10">
                        <div className="absolute inset-0 bg-indigo-500/20 blur-3xl rounded-full scale-150 animate-pulse"></div>
                        <span className="text-8xl select-none drop-shadow-2xl animate-bounce">🦁</span>
                    </div>
                </div>

                <div className="w-full max-w-xs px-6 flex flex-col items-center">
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden mb-3 shadow-inner border border-slate-200/50 dark:border-slate-700/50">
                        <div
                            className="h-full bg-gradient-to-r from-violet-500 via-indigo-500 to-purple-500 transition-all duration-700 ease-out rounded-full relative"
                            style={{ width: `${progress}%` }}
                        >
                            <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.2)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.2)_50%,rgba(255,255,255,0.2)_75%,transparent_75%,transparent)] bg-[length:20px_20px] animate-[shimmer_2s_linear_infinite]"></div>
                        </div>
                    </div>
                    <p className="text-xs font-black text-indigo-500 dark:text-indigo-400 mb-6 tracking-[0.2em] uppercase">
                        {language === 'ko' ? '분석 중' : 'Analyzing'} {Math.round(progress)}%
                    </p>

                    <div className="text-center min-h-[60px] flex flex-col items-center justify-center">
                        <h2 className="text-xl font-black text-slate-800 dark:text-white mb-2 tracking-tight transition-all duration-500 animate-in fade-in slide-in-from-bottom-2" key={msgIdx}>
                            {loadingMessages[msgIdx]}
                        </h2>
                        <div className="flex items-center gap-1.5 bg-indigo-50/50 dark:bg-indigo-900/20 px-4 py-1.5 rounded-full border border-indigo-100/50 dark:border-indigo-800/30">
                            <span className="text-xs text-indigo-600 dark:text-indigo-400 font-bold">
                                {language === 'ko' ? '하늘의 영감을 기록하고 있어요' : 'Recording celestial inspiration'}
                            </span>
                            <span className="flex gap-0.5">
                                <span className="w-1 h-1 bg-indigo-500 rounded-full animate-bounce"></span>
                                <span className="w-1 h-1 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                                <span className="w-1 h-1 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                            </span>
                        </div>
                    </div>

                    <div className="mt-8 flex items-center justify-center gap-2 text-rose-500 font-black text-xs tracking-widest uppercase opacity-60">
                        <span className="animate-pulse">⚠️</span>
                        <span>{language === 'ko' ? '페이지를 나가지 마세요' : 'Do not leave this page'}</span>
                    </div>
                </div>

                <style>{`
          @keyframes shimmer {
            0% { background-position: 0 0; }
            100% { background-position: 40px 0; }
          }
        `}</style>
            </div>
        );
    };

    const renderContent = (onStart) => {
        if (loading) return <Loading />;
        const isDisabled = false;

        return (
            <>
                {step === 'intro' ? (
                    <div className="max-w-lg mx-auto text-center px-6 animate-in fade-in slide-in-from-bottom-5 duration-700">
                        <div className="flex justify-center mb-3">
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-50 dark:bg-violet-900/20 border border-violet-100 dark:border-violet-800 shadow-sm">
                                <div className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-violet-500"></span>
                                </div>
                                <span className="text-xs font-bold tracking-wider text-violet-600 dark:text-violet-400 uppercase">
                                    Expert Intelligence Analysis
                                </span>
                            </div>
                        </div>
                        <h2 className={style.sajuTitle}>
                            {language === 'ko' ? '오행으로 물어보는' : 'Reading the Five Elements'}
                            <br />
                            <span className="relative text-violet-600 dark:text-violet-400">
                                {language === 'ko' ? '사자와의 대화' : 'Conversation with Saza'}
                                <div className="absolute inset-0 bg-violet-200/50 dark:bg-violet-900/30 blur-md rounded-full scale-100"></div>
                            </span>
                        </h2>
                        <div className={style.sajuDesc}>

                            {language === 'ko' ? (
                                <>
                                    <strong>사자</strong>에게 당신의 고민을 물어보세요.
                                </>
                            ) : (
                                "Ask Saza what's in your mind"
                            )}


                            <div className="m-auto max-w-sm rounded-2xl overflow-hidden shadow-sm border border-slate-100 dark:border-slate-800">
                            </div>
                        </div>

                        <button
                            onClick={() => setStep('input')}
                            disabled={false}
                            className={classNames(
                                'w-full  px-10 py-4 font-bold rounded-xl shadow-lg dark:shadow-none transform transition-all flex items-center justify-center gap-2',
                                isDisabled
                                    ? DISABLED_STYLE
                                    : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-purple-200 hover:-translate-y-1',
                            )}
                        >
                            {language === 'ko' ? '사자에게 물어보기' : 'Ask Saza'}
                            {isLocked ? (
                                <>
                                    <div
                                        className="mt-1 flex items-center gap-1 backdrop-blur-sm px-2 py-0.5 rounded-full border shadow-sm relative z-10 border-gray-500/50 bg-gray-400/40"
                                    >
                                        <span className="text-xs font-bold text-white tracking-wide uppercase">
                                            <LockClosedIcon className="w-4 h-4 text-amber-500" />
                                        </span>
                                    </div>
                                </>
                            ) : (
                                user && (
                                    <div className="relative scale-90">
                                        <EnergyBadge active={userData?.birthDate} consuming={loading} cost={-1} />
                                    </div>
                                )
                            )}
                        </button>
                        {isLocked ? (
                            <p className="mt-4 text-rose-600 font-black text-sm flex items-center justify-center gap-1 animate-pulse">
                                {language === 'ko' ? '크레딧이 부족합니다..' : 'not Enough credit'}
                            </p>
                        ) : (
                            <p className="mt-4 text-sm text-slate-400">
                                {language === 'ko'
                                    ? '이미 분석된 운세는 크레딧을 재소모하지 않습니다.'
                                    : 'Fortunes that have already been analyzed do not use credits.'}
                            </p>
                        )}
                        <div className="mt-16 -mx-6">
                            <SazaTalkAppeal />
                        </div>
                    </div>
                ) : (
                    <div className="max-w-lg mx-auto px-6 animate-in slide-in-from-bottom duration-500">
                        <div className="text-center">
                            <div className="flex justify-center mb-3">
                                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-50 dark:bg-violet-900/20 border border-violet-100 dark:border-violet-800 shadow-sm">
                                    <div className="relative flex h-2 w-2">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-violet-500"></span>
                                    </div>
                                    <span className="text-xs font-bold tracking-wider text-violet-600 dark:text-violet-400 uppercase">
                                        Expert Intelligence Analysis
                                    </span>
                                </div>
                            </div>
                            <h2 className=" text-2xl font-black text-slate-800 dark:text-white mb-4 tracking-tight">
                                {language === 'ko' ? '무엇이든 물어보사자' : 'Clear Solutions for Any Concern'}
                                <br />
                                <span className="relative text-violet-600 dark:text-violet-400">
                                    {language === 'ko' ? '1:1 맞춤 사주 솔루션' : 'Personalized 1:1 Saju Solution'}
                                    <div className="absolute inset-0 bg-violet-200/50 dark:bg-violet-900/30 blur-md rounded-full scale-100"></div>
                                </span>
                            </h2>
                            <div className={style.sajuDesc}>

                                {language === 'ko' ? (
                                    <>
                                        <p>27인의 명리 해석을 집대성하여 </p>
                                        <p>어떤 고민도 차분하게 듣고 해결책을 드려요</p>
                                    </>
                                ) : (
                                    <>
                                        <p>Synthesized from 27 expert Myeongni interpretations</p>
                                        <p>listens calmly to your concerns and provides solutions.</p>
                                    </>
                                )}

                            </div>
                        </div>

                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2 text-purple-600">
                                <PencilSquareIcon className="w-5 h-5" />
                                <h3 className="font-bold">
                                    {language === 'ko' ? '당신의 고민을 들려주세요' : 'Tell me what is on your mind'}
                                </h3>
                            </div>
                            {latestSazaTalk && (
                                <button
                                    onClick={() => setIsHistoryOpen(true)}
                                    className="px-3 py-1.5 rounded-full bg-violet-50 dark:bg-violet-900/30 border border-violet-100 dark:border-violet-800 text-violet-600 dark:text-violet-400 text-xs font-bold flex items-center gap-1 hover:bg-violet-100 transition-colors shadow-sm"
                                >
                                    <ClockIcon className="w-3 h-3" />
                                    {language === 'ko' ? '최근 결과' : 'Recent Result'}
                                </button>
                            )}
                        </div>
                        <textarea
                            value={userQuestion}
                            onChange={(e) => setUserQuestion(e.target.value)}
                            placeholder={
                                language === 'ko'
                                    ? '예: 과 동아리 선배 한명이랑 유독 안 맞는데, 제 올해 대인관계 운이 궁금해요!"'
                                    : "Ex: I really don't get along with one of the seniors in my college club. I'm curious about my relationship luck for this year!"
                            }
                            className="w-full h-40 p-4 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-purple-400 dark:focus:ring-purple-500 focus:border-transparent outline-none resize-none text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 shadow-inner placeholder:text-slate-400 dark:placeholder:text-slate-500"
                        />
                        <AnalyzeButton
                            onClick={() => userQuestion.trim() && handleSazaTest(onStart)}
                            disabled={!userQuestion.trim()}
                            loading={loading}
                            isDone={false}
                            label={language === 'ko' ? '사자에게 물어보기' : 'Ask Saza'}
                            color="purple"
                            cost={-1}
                        />
                        <div className="mt-16 -mx-6">
                            <SazaTalkAppeal />
                        </div>

                        {isHistoryOpen && latestSazaTalk && (
                            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
                                <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-slate-100 dark:border-slate-800 animate-in zoom-in-95 duration-300">
                                    <div className="px-6 py-4 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between bg-violet-50/50 dark:bg-violet-900/10">
                                        <div className="flex items-center gap-2 text-violet-600 dark:text-violet-400">
                                            <ClockIcon className="w-5 h-5" />
                                            <h2 className="font-black tracking-tight">
                                                {language === 'ko' ? '최근 상담 내역' : 'Recent History'}
                                            </h2>
                                        </div>
                                        <button
                                            onClick={() => setIsHistoryOpen(false)}
                                            className="p-2 rounded-full hover:bg-white dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 transition-colors"
                                            aria-label="Close"
                                        >
                                            <XMarkIcon className="w-6 h-6" />
                                        </button>
                                    </div>

                                    <div ref={historyContentRef} className="p-6 max-h-[70vh] overflow-y-auto space-y-6">
                                        <div>
                                            <div className="text-xs font-black text-violet-500 uppercase mb-2 tracking-widest">
                                                {language === 'ko' ? '기존 질문' : 'Previous Question'}
                                            </div>
                                            <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                                                <p className="text-sm font-bold text-slate-700 dark:text-slate-200">
                                                    {latestSazaTalk.question}
                                                </p>
                                            </div>
                                        </div>

                                        <div>
                                            <div className="text-xs font-black text-violet-500 uppercase mb-2 tracking-widest">
                                                {language === 'ko' ? '사자의 답변' : "Saza's Answer"}
                                            </div>
                                            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-violet-100/50 dark:border-violet-900/20 shadow-sm overflow-hidden text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                                                {parsedHistoryData && (parsedHistoryData?.contents || parsedHistoryData?.saza) ? (
                                                    <div className="leading-8 w-full">
                                                        {parsedHistoryData?.contents && Array.isArray(parsedHistoryData?.contents) ? (
                                                            parsedHistoryData.contents.map((i, idx) => {
                                                                if (typeof i === 'object' && i !== null) {
                                                                    return (
                                                                        <div key={idx} className="mb-2">
                                                                            {i.title && <strong className="block text-indigo-700 dark:text-indigo-300">{i.title}</strong>}
                                                                            {i.detail && <p>{i.detail}</p>}
                                                                            {!i.title && !i.detail && <p>{JSON.stringify(i)}</p>}
                                                                        </div>
                                                                    );
                                                                }
                                                                return <p key={idx}>{i}</p>;
                                                            })
                                                        ) : (
                                                            <p>{typeof parsedHistoryData?.contents === 'string' ? parsedHistoryData?.contents : ''}</p>
                                                        )}

                                                        {parsedHistoryData?.saza && (
                                                            <div className="mt-4 pt-4 border-t border-slate-50 dark:border-slate-700">
                                                                <strong className="text-indigo-600 dark:text-indigo-400 block mb-1">
                                                                    {language !== 'ko' ? "Saza's Advice" : '사자의 조언'}
                                                                </strong>
                                                                {typeof parsedHistoryData?.saza === 'object' ? (
                                                                    <div className="text-sm">
                                                                        {parsedHistoryData?.saza?.category && (
                                                                            <span className="inline-block px-2 py-0.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded text-xs font-bold mr-2">
                                                                                {parsedHistoryData?.saza?.category}
                                                                            </span>
                                                                        )}
                                                                        <p className="inline italic">"{parsedHistoryData?.saza?.advice}"</p>
                                                                    </div>
                                                                ) : (
                                                                    <p className="italic">"{parsedHistoryData?.saza}"</p>
                                                                )}
                                                            </div>
                                                        )}
                                                        {aiSajuStyle && <div dangerouslySetInnerHTML={{ __html: aiSajuStyle }} />}
                                                    </div>
                                                ) : (
                                                    <div className="text-slate-400 text-xs italic p-2 text-center">
                                                        {language === 'ko' ? '내용을 불러올 수 없습니다.' : 'No content available'}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="px-6 py-2 flex justify-end gap-2 bg-white dark:bg-slate-900 border-t border-slate-50 dark:border-slate-800">
                                        <button
                                            onClick={handleHistoryCopy}
                                            className="flex items-center gap-1 text-xs sm:text-xs text-slate-400 hover:text-slate-600 transition-colors px-2 py-1 rounded-md hover:bg-slate-50 dark:hover:bg-slate-800"
                                        >
                                            <ClipboardDocumentIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                                            {language === 'ko' ? '텍스트 복사' : 'Copy Text'}
                                        </button>
                                        <button
                                            onClick={handleHistoryCapture}
                                            className="flex items-center gap-1 text-xs sm:text-xs text-slate-400 hover:text-slate-600 transition-colors px-2 py-1 rounded-md hover:bg-slate-50 dark:hover:bg-slate-800"
                                        >
                                            <CameraIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                                            {language === 'ko' ? '이미지 저장' : 'Save Image'}
                                        </button>
                                    </div>

                                    <div className="p-6 bg-slate-50/50 dark:bg-slate-800/20 text-center">
                                        <p className="text-sm text-slate-400 break-keep leading-relaxed font-medium">
                                            {language === 'ko'
                                                ? '최근 1건의 내역만 저장되며,\n새로운 질문 시 이전 답변은 사라집니다.'
                                                : 'Only the last session is saved and will be\noverwritten by a new question.'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </>
        );
    };

    useEffect(() => {
        if (loading) {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }, [loading]);

    return (
        <AnalysisStepContainer
            guideContent={renderContent}
            loadingContent={<Loading />}
            resultComponent={(p) => (
                <ViewSazaResult
                    userQuestion={userQuestion}
                    onReset={p.onReset}
                    loading={loading}
                />
            )}
            loadingTime={0}
            defaultStep={initialQuery ? 'input' : 'intro'}
        />
    );
}

export default function SazaTalkChatClient() {
    return (
        <Suspense fallback={<div className="min-h-screen"></div>}>
            <ChatClientContent />
        </Suspense>
    );
}
