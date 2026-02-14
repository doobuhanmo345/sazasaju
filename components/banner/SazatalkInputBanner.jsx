'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { useLanguage } from '@/contexts/useLanguageContext';
import { useRouter } from 'next/navigation';
import { useAuthContext } from '@/contexts/useAuthContext';
import { useLoading } from '@/contexts/useLoadingContext';
import { useUsageLimit } from '@/contexts/useUsageLimit';
import { SajuAnalysisService, AnalysisPresets } from '@/lib/SajuAnalysisService';
import { UI_TEXT, langPrompt, hanja } from '@/data/constants';
import { classNames, parseAiResponse } from '@/utils/helpers';

const SazatalkInputBanner = () => {
    const router = useRouter();
    const { language } = useLanguage();
    const { user, userData, selectedProfile } = useAuthContext();
    const { setLoading, setAiResult, handleCancelHelper } = useLoading();
    const { setEditCount, MAX_EDIT_COUNT } = useUsageLimit();
    const [isOpen, setIsOpen] = useState(false);
    const [inputValue, setInputValue] = useState("");
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const scrollRef = useRef(null);

    const isKo = language === 'ko';

    const [messages, setMessages] = useState([
        {
            id: 'welcome',
            role: 'saza',
            text: isKo
                ? '안녕하세요! 오늘 어떤 고민이 있으신가요? 사자가 정성껏 사주를 풀이해 드릴게요.'
                : 'Hello! What worries do you have today? I will interpret your Saju with care.'
        }
    ]);

    const suggestions = [
        isKo ? "이번 달 나에게 찾아올 행운은?" : "What luck will find me this month?",
        isKo ? "지금 이직을 고민 중인데 괜찮을까요?" : "Is it a good time for a job change?",
        isKo ? "그 사람과 나의 인연이 궁금해요" : "Tell me about my connection with them",
    ];

    const targetProfile = selectedProfile || userData;
    const [progress, setProgress] = useState(0);

    // 자동 스크롤
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isAnalyzing]);

    // 로딩바 진행 로직 (40초 기준)
    useEffect(() => {
        let interval;
        if (isAnalyzing) {
            setProgress(0);
            const startTime = Date.now();
            const duration = 40000; // 40초

            interval = setInterval(() => {
                const elapsed = Date.now() - startTime;
                const newProgress = Math.min(98, (elapsed / duration) * 100);
                setProgress(newProgress);
            }, 100);
        } else {
            if (progress > 0) {
                setProgress(100);
                const timer = setTimeout(() => {
                    setProgress(0);
                }, 500);
                return () => clearTimeout(timer);
            }
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [isAnalyzing]);

    // 모달 열릴 때 스크롤 방지
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            document.documentElement.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
            document.documentElement.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
            document.documentElement.style.overflow = '';
        };
    }, [isOpen]);

    return (
        <>
            {/* 1. 메인 배너 (하단에 인풋 바 내장) */}
            <div className="relative w-full max-w-lg  mx-auto  my-4 rounded-[1rem] border border-indigo-100/50 shadow-md transition-all duration-300 active:scale-[0.98] cursor-pointer group">
                <div
                    className="relative w-full h-[240px] sm:h-[260px] bg-[#EEF0FF] rounded-[1rem] shadow-md border border-indigo-100/50 overflow-hidden flex flex-col"
                >
                    {/* 상단: 배너 콘텐츠 */}
                    <div className="relative h-[160px] flex flex-col justify-center px-6 pt-4 cursor-pointer" onClick={() => setIsOpen(true)}>
                        <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-indigo-200/40 blur-3xl rounded-full z-0" />
                        <div className="relative z-10">
                            <h2 className="text-2xl sm:text-3xl font-light text-slate-900 leading-[1.3] tracking-tight">
                                {isKo ? '답답한 고민,' : 'Tricky problems,'} <br />
                                <div className="flex sm:flex-row flex-col gap-2 py-3">
                                    <div className="font-serif italic font-medium text-indigo-700">
                                        {isKo ? '사자톡에 ' : 'Ask Saza'}
                                    </div>
                                    <div className="font-serif italic font-medium text-indigo-700">
                                        {isKo ? '물어보사자' : 'Anything'}
                                    </div>
                                </div>
                            </h2>
                        </div>
                        <img
                            src="/images/banner/sazatalk_main_clay.png"
                            className="absolute bottom-[-70px] xs:right-12 right-[-10px] xs:h-[180%] h-[150%] w-auto object-contain pointer-events-none z-10"
                            alt="mascot"
                        />
                    </div>

                    {/* 하단: 클릭 유도 인풋 바 (시인성 강화) */}
                    <div className="px-3 pb-3 mt-auto z-20">
                        <div
                            onClick={() => setIsOpen(true)}
                            className="w-full py-3.5 px-3 bg-white/90 rounded-2xl shadow-sm flex items-center justify-between cursor-text border border-indigo-50 hover:border-indigo-200 transition-all group"
                        >
                            <span className="text-md text-slate-500 font-medium">
                                {isKo ? '사자에게 고민을 털어놓으세요...' : 'Share your worries with Saza...'}
                            </span>
                            <div className="bg-[#f9e000] w-8 h-8 rounded-full flex items-center justify-center text-black shadow-sm group-hover:scale-110 transition-transform">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 2. 카카오톡 스타일 전체 화면 모달 */}
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-end justify-center bg-[#abc1d1] sm:bg-black/50 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="relative w-full max-w-lg h-full sm:h-[90vh] bg-[#abc1d1] sm:rounded-t-[32px] overflow-hidden flex flex-col animate-in slide-in-from-bottom-full duration-500">

                        {/* 헤더 */}
                        <div className="flex items-center justify-between px-5 pt-9 pb-4 bg-indigo-50 dark:bg-slate-900 border-b border-indigo-100/50 dark:border-slate-800">
                            <div className="flex items-center space-x-3">
                                <button onClick={() => setIsOpen(false)} className="p-1 text-slate-500 dark:text-slate-400">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M15 18l-6-6 6-6" /></svg>
                                </button>
                                <span className="font-bold text-lg text-slate-800 dark:text-white">SazaTalk</span>
                            </div>
                            <button onClick={() => setIsOpen(false)} className="text-sm font-bold text-slate-500 dark:text-slate-500">
                                {isKo ? '닫기' : 'Close'}
                            </button>
                        </div>

                        {/* 채팅창 내부 */}
                        <div
                            ref={scrollRef}
                            className="flex-1 overflow-y-auto p-5 space-y-6 scrollbar-hide bg-indigo-50 dark:bg-slate-900 scroll-smooth"
                        >
                            {messages.map((msg, idx) => (
                                <div key={msg.id || idx} className={classNames("flex items-start", msg.role === 'user' ? "justify-end" : "justify-start")}>
                                    {msg.role === 'saza' && (
                                        <div className="w-10 h-10 rounded-[15px] flex items-center justify-center mr-2 flex-shrink-0 shadow-sm bg-white overflow-hidden border border-indigo-100">
                                            <Image
                                                src="/images/brand/saza_teacher.png"
                                                alt="Saza"
                                                width={40}
                                                height={40}
                                                className="object-cover w-full h-full"
                                            />
                                        </div>
                                    )}
                                    <div className={classNames("flex flex-col", msg.role === 'user' ? "items-end" : "items-start")}>
                                        {msg.role === 'saza' && (
                                            <span className="text-sm text-slate-500 dark:text-slate-400 mb-1 ml-1 font-bold">{isKo ? '사자' : 'Saza'}</span>
                                        )}
                                        <div className={classNames(
                                            "relative p-3.5 px-4 rounded-[16px] shadow-sm max-w-[280px] text-sm leading-snug font-medium",
                                            msg.role === 'user'
                                                ? "bg-indigo-600 text-white rounded-tr-none"
                                                : "bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-tl-none"
                                        )}>
                                            <p className="whitespace-pre-wrap">{msg.text}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {/* 분석 중 애니메이션 */}
                            {isAnalyzing && (
                                <div className="flex items-start">
                                    <div className="w-10 h-10 rounded-[15px] flex items-center justify-center mr-2 flex-shrink-0 shadow-sm bg-white overflow-hidden border border-indigo-100">
                                        <Image
                                            src="/images/brand/saza_teacher.png"
                                            alt="Saza Analyzing"
                                            width={40}
                                            height={40}
                                            className="object-cover w-full h-full animate-pulse"
                                        />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-sm text-slate-500 dark:text-slate-400 mb-1 ml-1 font-bold">{isKo ? '사자' : 'Saza'}</span>
                                        <div className="bg-white dark:bg-slate-800 p-3.5 px-5 rounded-[16px] rounded-tl-none shadow-sm flex items-center gap-1.5">
                                            <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:0s]"></div>
                                            <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                                            <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* 추천 질문 (제일 아래에 노출하거나 초기 환영인사 뒤에만 노출) */}
                            {messages.length === 1 && !isAnalyzing && (
                                <div className="flex flex-col items-end space-y-3 pt-4">
                                    <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1 pr-1">
                                        {isKo ? '추천 고민' : 'Suggestions'}
                                    </div>
                                    {suggestions.map((text, index) => (
                                        <button
                                            key={index}
                                            onClick={() => setInputValue(text)}
                                            className="bg-indigo-600 text-white px-4 py-3 rounded-[18px] rounded-tr-[2px] text-sm font-bold shadow-sm active:bg-indigo-700 max-w-[85%] animate-in slide-in-from-right-5"
                                            style={{ animationDelay: `${index * 100}ms` }}
                                        >
                                            {text}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* 하단 텍스트 에어리어 */}
                        <div className="relative bg-white dark:bg-slate-800 p-4 pb-10 sm:pb-6 border-t border-slate-100 dark:border-slate-700 flex flex-col">
                            {(isAnalyzing || progress > 0) && (
                                <div className="absolute top-0 left-0 w-full h-1 bg-indigo-50 dark:bg-slate-700 overflow-hidden">
                                    <div
                                        className="h-full bg-indigo-500 transition-all duration-300 ease-out"
                                        style={{ width: `${progress}%` }}
                                    ></div>
                                </div>
                            )}
                            <textarea
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                className="w-full min-h-[140px] max-h-[300px] py-2 text-base font-black text-slate-900 dark:text-white outline-none resize-none leading-relaxed placeholder:font-normal placeholder:text-slate-300 dark:placeholder:text-slate-500 bg-transparent"
                                placeholder={isKo ? "고민을 무엇이든 물어보세요!\n(ex. 작년에 헤어진 인연과 재회할 수 있을까요?)" : "Ask anything"}
                            />
                            <div className="flex justify-end mt-2">
                                <button
                                    disabled={!inputValue.trim() || isAnalyzing}
                                    onClick={async () => {
                                        if (!inputValue.trim() || isAnalyzing) return;

                                        const question = inputValue.trim();
                                        setInputValue("");

                                        // 1. 유저 메시지 추가
                                        const userMsg = { id: Date.now().toString(), role: 'user', text: question };
                                        setMessages(prev => [...prev, userMsg]);

                                        // 2. 비로그인 처리
                                        if (!user) {
                                            setTimeout(() => {
                                                setMessages(prev => [...prev, {
                                                    id: 'login-req',
                                                    role: 'saza',
                                                    text: isKo
                                                        ? '상담을 진행하려면 로그인이 필요해요. 로그인 후 사자에게 다시 물어봐 주세요!'
                                                        : 'Please log in to proceed with the consultation.'
                                                }]);
                                            }, 800);
                                            return;
                                        }

                                        // 3. 사주 정보 확인
                                        if (!targetProfile?.birthDate) {
                                            setTimeout(() => {
                                                setMessages(prev => [...prev, {
                                                    id: 'saju-req',
                                                    role: 'saza',
                                                    text: isKo
                                                        ? '정확한 상담을 위해 사주 정보(생년월일)를 먼저 등록해 주세요.'
                                                        : 'Please register your Saju info first for an accurate reading.'
                                                }]);
                                            }, 800);
                                            return;
                                        }

                                        // 4. 분석 시작
                                        setIsAnalyzing(true);
                                        try {
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
                                                handleCancelHelper,
                                            });

                                            // 4. 이전 대화 기록 추출 (최근 10개 메시지 = 약 5회 분량)
                                            const chatHistory = messages
                                                .slice(1) // 환영 인사 제외
                                                .map(m => `${m.role === 'user' ? 'User' : 'Saza'}: ${m.text}`)
                                                .slice(-20)
                                                .join('\n');

                                            const result = await service.analyze(
                                                AnalysisPresets.saza({
                                                    saju: targetProfile.saju,
                                                    gender: targetProfile.gender,
                                                    inputDate: targetProfile.birthDate,
                                                    question: question,
                                                    history: chatHistory, // [NEW] 히스토리 전달
                                                })
                                            );

                                            if (result) {
                                                const parsed = parseAiResponse(result);

                                                if (parsed && (parsed.contents || parsed.saza)) {
                                                    // 하나씩 순차적으로 추가 (약간의 딜레이)
                                                    const parts = [];
                                                    if (Array.isArray(parsed.contents)) {
                                                        parsed.contents.forEach(c => {
                                                            if (typeof c === 'string') parts.push(c);
                                                            else if (c.detail) parts.push(c.detail);
                                                        });
                                                    } else if (typeof parsed.contents === 'string') {
                                                        parts.push(parsed.contents);
                                                    }

                                                    if (parsed.saza) {
                                                        const sazaAdvice = typeof parsed.saza === 'object' ? parsed.saza.advice : parsed.saza;
                                                        parts.push(sazaAdvice);
                                                    }

                                                    // 순차적으로 메시지 추가
                                                    for (let i = 0; i < parts.length; i++) {
                                                        // 각 메시지 전에 1초의 간격 (로딩 점이 보이도록)
                                                        await new Promise(r => setTimeout(r, 1000));

                                                        setMessages(prev => [...prev, {
                                                            id: `${Date.now()}-${i}`,
                                                            role: 'saza',
                                                            text: parts[i]
                                                        }]);
                                                    }
                                                } else {
                                                    // 파싱 실패 시 통짜 전송
                                                    setMessages(prev => [...prev, {
                                                        id: Date.now().toString(),
                                                        role: 'saza',
                                                        text: result
                                                    }]);
                                                }
                                            }
                                        } catch (error) {
                                            console.error("Banner SazaTalk Error:", error);
                                            setMessages(prev => [...prev, {
                                                id: 'error',
                                                role: 'saza',
                                                text: isKo ? '죄송해요. 상담 중에 오류가 발생했어요. 다시 시도해 주세요.' : 'Sorry, an error occurred. Please try again.'
                                            }]);
                                        } finally {
                                            setIsAnalyzing(false);
                                        }
                                    }}
                                    className={`w-16 h-11 rounded-[14px] flex items-center justify-center transition-all ${inputValue.trim() && !isAnalyzing ? 'bg-indigo-600 text-white shadow-md active:scale-95' : 'bg-slate-100 dark:bg-slate-700 text-slate-300 dark:text-slate-500 font-normal'
                                        }`}
                                >
                                    <span className="text-sm font-bold">{isKo ? '전송' : 'Send'}</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default SazatalkInputBanner;