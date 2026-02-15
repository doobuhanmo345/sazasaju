'use client';

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { useLanguage } from '@/contexts/useLanguageContext';
import { useRouter } from 'next/navigation';
import { useAuthContext } from '@/contexts/useAuthContext';
import { useLoading } from '@/contexts/useLoadingContext';
import { useUsageLimit } from '@/contexts/useUsageLimit';
import { SajuAnalysisService, AnalysisPresets } from '@/lib/SajuAnalysisService';
import { UI_TEXT, langPrompt, hanja } from '@/data/constants';
import { classNames, parseAiResponse } from '@/utils/helpers';
import EnergyBadge from '@/ui/EnergyBadge';

const SazaTalkLoveBanner = ({ saju = null, relation = null }) => {
    const router = useRouter();
    const { language } = useLanguage();
    const { user, userData, selectedProfile } = useAuthContext();
    const { setLoading, setAiResult, handleCancelHelper } = useLoading();
    const { setEditCount, MAX_EDIT_COUNT } = useUsageLimit();
    const [isOpen, setIsOpen] = useState(false);
    const [inputValue, setInputValue] = useState("");
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [mounted, setMounted] = useState(false);
    const scrollRef = useRef(null);

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

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

    const getSuggestions = () => {
        if (relation === 'business') {
            return [
                isKo ? "이 사람과 사업을 같이 해도 될까요?" : "Can I do business with this person?",
                isKo ? "우리의 파트너십이 성공할까요?" : "Will our partnership be successful?",
                isKo ? "주의해야 할 점은 무엇인가요?" : "What should I be careful about?"
            ];
        }
        if (relation === 'Friend') {
            return [
                isKo ? "우리 우정은 오래 지속될까요?" : "Will our friendship last long?",
                isKo ? "우리는 서로에게 어떤 존재인가요?" : "What do we mean to each other?",
                isKo ? "같이 하면 좋은 활동은 무엇인가요?" : "What activities are good for us?"
            ];
        }
        if (relation === 'Parent / Child') {
            return [
                isKo ? "우리 아이의 숨겨진 재능은?" : "What is my child's hidden talent?",
                isKo ? "아이를 더 잘 이해하려면?" : "How can I understand my child better?",
                isKo ? "갈등을 어떻게 해결하면 좋을까요?" : "How should we resolve conflicts?"
            ];
        }
        if (relation === 'Others') {
            return [
                isKo ? "이 사람과 더 친해질 수 있을까요?" : "Can I get closer to this person?",
                isKo ? "상대방은 저를 어떻게 생각하나요?" : "What does this person think of me?",
                isKo ? "우리 관계의 발전 가능성은?" : "Is there potential for our relationship?"
            ];
        }
        // Default (Love)
        return [
            isKo ? "나의 인연은 어디서 만날 수 있을까요?" : "Where can I meet my soulmate?",
            isKo ? "우리에게 맞는 데이트 장소는?" : "What's the perfect date spot for us?",
            isKo ? "그 사람과 결혼해도 될까요" : "Should I marry him/her?",
        ];
    };

    const suggestions = getSuggestions();

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
            <div className="relative max-w-md mx-auto  my-4 rounded-[1rem] border border-rose-100/50 shadow-md transition-all duration-300 active:scale-[0.98] cursor-pointer group">
                <div
                    className="relative w-full h-[180px] bg-rose-100 rounded-[1rem] shadow-md border border-rose-100/50 overflow-hidden flex flex-col"
                >
                    {/* 하단: 클릭 유도 인풋 바 (시인성 강화) */}
                    <div className="absolute bottom-0 right-0 px-3 pb-3 mt-auto z-20">
                        <div
                            onClick={() => setIsOpen(true)}
                            className="w-[270px] h-[80px] py-3.5 px-3 bg-white/70 rounded-2xl shadow-sm flex items-center justify-between cursor-text border border-rose-50 hover:border-rose-200 transition-all group"
                        ><div className='flex'><div className="text-md text-slate-500 font-medium">
                            {isKo ? <div>추가로 더 궁금한게 있으신가요? <br />사자가 대답해 드릴게요.</div> : <div>Do you have any other questions? <br />Saza will answer them for you.</div>}
                        </div></div>

                            <div className="bg-[#f9e000] w-8 h-8 rounded-full flex items-center justify-center text-black shadow-sm group-hover:scale-110 transition-transform">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                            </div>
                        </div>
                    </div>
                    {/* 상단: 배너 콘텐츠 */}
                    <div className="relative h-[150px] flex flex-col justify-center px-6 pt-4 cursor-pointer" onClick={() => setIsOpen(true)}>
                        <img
                            src={(() => {
                                if (relation === 'Friend') return "/images/banner/saza_match_friend.png";
                                if (relation === 'business') return "/images/banner/saza_match_business.png";
                                if (relation === 'Parent / Child') return "/images/banner/saza_match_family.png";

                                return "/images/banner/sazatalk_love.png";
                            })()}
                            className=
                            "absolute pointer-events-none z-10 xs:left-12 left-[-10px] -top-26 xs:h-[180%] h-[150%] w-auto object-contain"

                            alt="mascot"
                        />

                        <div className="relative z-10 flex flex-row justify-end text-right">
                            <h2 className="absolute top-[-70px] text-2xl sm:text-3xl font-light text-slate-900 tracking-tight">
                                {isKo ? '더 알고 싶은' : 'Find your destiny,'} <br />

                                <div className="font-serif italic font-medium text-rose-500">
                                    {isKo ? '질문' : 'Check your'}
                                </div>


                            </h2>
                        </div>

                    </div>


                </div>
            </div>

            {/* 2. 카카오톡 스타일 전체 화면 모달 (Portal 사용) */}
            {isOpen && mounted && createPortal(
                <div className="fixed inset-0 z-[9999] flex items-end justify-center bg-[#abc1d1] sm:bg-black/50 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="relative w-full max-w-lg h-full sm:h-[90vh] bg-[#abc1d1] sm:rounded-t-[32px] overflow-hidden flex flex-col animate-in slide-in-from-bottom-full duration-500">

                        {/* 헤더 */}
                        <div className="flex items-center justify-between px-5 pt-9 pb-4 bg-rose-100 dark:bg-slate-900 border-b border-rose-100/50 dark:border-slate-800">
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
                            className="flex-1 overflow-y-auto p-5 space-y-6 scrollbar-hide bg-rose-100 dark:bg-slate-900 scroll-smooth"
                        >
                            {messages.map((msg, idx) => (
                                <div key={msg.id || idx} className={classNames("flex items-start", msg.role === 'user' ? "justify-end" : "justify-start", msg.role === 'saza-advice' ? "justify-center w-full my-2" : "")}>
                                    {(msg.role === 'saza') && (
                                        <div className="w-10 h-10 rounded-[15px] flex items-center justify-center mr-2 flex-shrink-0 shadow-sm bg-white overflow-hidden border border-rose-100">
                                            <img
                                                src="/images/brand/saza_flower.png"
                                                alt="Saza"
                                                className="object-cover w-12 h-12"
                                            />
                                        </div>
                                    )}

                                    {msg.role === 'saza-advice' ? (
                                        <div className="w-full max-w-sm bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-4 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
                                            <div className="absolute top-2 left-2 text-amber-200/50 text-4xl font-serif">"</div>
                                            <div className="flex flex-col items-center text-center relative z-10">
                                                <div className="w-12 h-12 rounded-full border-2 border-white shadow-sm overflow-hidden mb-2">
                                                    <Image
                                                        src="/images/brand/saza_flower.png"
                                                        alt="Saza"
                                                        width={48}
                                                        height={48}
                                                        className="object-cover w-full h-full"
                                                    />
                                                </div>
                                                <h4 className="text-xs font-bold text-amber-600 uppercase tracking-widest mb-2">Saza's Advice</h4>
                                                <p className="text-sm text-slate-700 font-medium leading-relaxed break-keep">
                                                    {msg.text}
                                                </p>
                                            </div>
                                            <div className="absolute bottom-[-10px] right-2 text-amber-200/50 text-6xl font-serif rotate-180">"</div>
                                        </div>
                                    ) : (
                                        <div className={classNames("flex flex-col", msg.role === 'user' ? "items-end" : "items-start")}>
                                            {msg.role === 'saza' && (
                                                <span className="text-sm text-slate-500 dark:text-slate-400 mb-1 ml-1 font-bold">{isKo ? '사자' : 'Saza'}</span>
                                            )}
                                            <div className={classNames(
                                                "relative p-3.5 px-4 rounded-[16px] shadow-sm max-w-[280px] text-sm leading-snug font-medium",
                                                msg.role === 'user'
                                                    ? "bg-rose-600 text-white rounded-tr-none"
                                                    : "bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-tl-none"
                                            )}>
                                                <p className="whitespace-pre-wrap">{msg.text}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}

                            {/* 분석 중 애니메이션 */}
                            {isAnalyzing && (
                                <div className="flex items-start">
                                    <div className="w-10 h-10 rounded-[15px] flex items-center justify-center mr-2 flex-shrink-0 shadow-sm bg-white overflow-hidden border border-rose-100">
                                        <Image
                                            src="/images/brand/saza_flower.png"
                                            alt="Saza Analyzing"
                                            width={40}
                                            height={40}
                                            className="object-cover w-full h-full animate-pulse"
                                        />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-sm text-slate-500 dark:text-slate-400 mb-1 ml-1 font-bold">{isKo ? '사자' : 'Saza'}</span>
                                        <div className="bg-white dark:bg-slate-800 p-3.5 px-5 rounded-[16px] rounded-tl-none shadow-sm flex items-center gap-1.5">
                                            <div className="w-1.5 h-1.5 bg-rose-400 rounded-full animate-bounce [animation-delay:0s]"></div>
                                            <div className="w-1.5 h-1.5 bg-rose-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                                            <div className="w-1.5 h-1.5 bg-rose-400 rounded-full animate-bounce [animation-delay:0.4s]"></div>
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
                                            className="bg-rose-600 text-white px-4 py-3 rounded-[18px] rounded-tr-[2px] text-sm font-bold shadow-sm active:bg-rose-700 max-w-[85%] animate-in slide-in-from-right-5"
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
                                <div className="absolute top-0 left-0 w-full h-1 bg-rose-50 dark:bg-slate-700 overflow-hidden">
                                    <div
                                        className="h-full bg-rose-500 transition-all duration-300 ease-out"
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
                                                .filter(m => m.role === 'user' || m.role === 'saza-advice') // [Modified] content가 아닌 saza(advice)만 포함
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
                                                    category: 'love',
                                                    sajuOther: saju
                                                })
                                            );

                                            if (result) {
                                                const parsed = parseAiResponse(result);

                                                if (parsed && (parsed.contents || parsed.saza)) {
                                                    // 하나씩 순차적으로 추가 (약간의 딜레이)
                                                    const parts = [];
                                                    if (Array.isArray(parsed.contents)) {
                                                        parsed.contents.forEach(c => {
                                                            if (typeof c === 'string') parts.push({ type: 'content', text: c });
                                                            else if (c.detail) parts.push({ type: 'content', text: c.detail });
                                                        });
                                                    } else if (typeof parsed.contents === 'string') {
                                                        parts.push({ type: 'content', text: parsed.contents });
                                                    }

                                                    if (parsed.saza) {
                                                        const sazaAdvice = typeof parsed.saza === 'object' ? parsed.saza.advice : parsed.saza;
                                                        parts.push({ type: 'advice', text: sazaAdvice });
                                                    }

                                                    // 순차적으로 메시지 추가
                                                    for (let i = 0; i < parts.length; i++) {
                                                        // 각 메시지 전에 1초의 간격 (로딩 점이 보이도록)
                                                        await new Promise(r => setTimeout(r, 1000));

                                                        setMessages(prev => [...prev, {
                                                            id: `${Date.now()}-${i}`,
                                                            role: parts[i].type === 'advice' ? 'saza-advice' : 'saza',
                                                            text: parts[i].text
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
                                    className={`w-[99px] h-[45px] rounded-[14px] flex flex-row items-center justify-center gap-2 transition-all ${inputValue.trim() && !isAnalyzing ? 'bg-rose-600 text-white shadow-md active:scale-95' : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-500 font-normal'
                                        }`}
                                >
                                    <EnergyBadge active={true} consuming={isAnalyzing} loading={isAnalyzing} cost={-1} />
                                    <div className="text-sm font-bold">{isKo ? '전송' : 'Send'}</div>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </>
    );
};

export default SazaTalkLoveBanner;