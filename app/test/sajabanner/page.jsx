'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '@/contexts/useLanguageContext';

const SazaTalkBanner = () => {
    const { language } = useLanguage();
    const [isExpanded, setIsExpanded] = useState(false);
    const [inputValue, setInputValue] = useState("");
    const containerRef = useRef(null);
    const isKo = language === 'ko';

    const suggestions = [
        isKo ? "이번 달 나에게 찾아올 행운은?" : "What luck will find me this month?",
        isKo ? "지금 이직을 고민 중인데 괜찮을까요?" : "Is it a good time for a job change?",
        isKo ? "그 사람과 나의 인연이 궁금해요" : "Tell me about my connection with them",
    ];

    useEffect(() => {
        function handleClickOutside(event) {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsExpanded(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="w-full max-w-lg mx-auto my-4 px-4" ref={containerRef}>
            <div
                className={`relative w-full overflow-hidden rounded-[2.5rem] transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] ${isExpanded
                    ? 'h-[580px] bg-[#abc1d1] shadow-2xl p-5'
                    : 'h-[230px] sm:h-[250px] bg-[#EEF0FF] shadow-md border border-indigo-100/50'
                    }`}
            >
                {/* --- [1. 닫힌 상태: 기존 배너] --- */}
                {!isExpanded && (
                    <div className="relative h-[160px] flex flex-col justify-center px-8 pt-4">
                        <h2 className="text-xl sm:text-2xl font-light text-slate-900 leading-[1.3] tracking-tight">
                            {isKo ? '답답한 고민,' : 'Tricky problems,'} <br />
                            <span className="font-serif italic font-medium text-indigo-700">
                                {isKo ? '무엇이든 물어보사자' : 'Ask Saza Anything'}
                            </span>
                        </h2>
                        <img
                            src="/images/banner/ama.webp"
                            className="absolute bottom-0 right-2 h-[110%] w-auto object-contain pointer-events-none"
                            alt="mascot"
                        />
                    </div>
                )}

                {/* --- [2. 열린 상태: 리얼 카톡 채팅창] --- */}
                {isExpanded && (
                    <div className="animate-in fade-in duration-300">
                        {/* 사자 프로필 & 진짜 카톡 말풍선 */}
                        <div className="flex items-start mb-6 mt-2">
                            <div className="w-11 h-11 bg-[#f9e000] rounded-[18px] flex items-center justify-center text-2xl mr-2 flex-shrink-0">🦁</div>
                            <div className="flex flex-col">
                                <span className="text-sm text-black/50 mb-1 ml-1">사자 사주</span>
                                <div className="relative bg-white p-3 px-4 rounded-[16px] rounded-tl-none shadow-sm max-w-[240px]">
                                    <p className="text-sm text-black leading-snug">
                                        {isKo ? '반가워요! 어떤 고민이 있나요? 편하게 말씀해 주세요.' : 'Welcome! Tell me your worries.'}
                                    </p>
                                    {/* 말풍선 꼬리 디테일 */}
                                    <div className="absolute left-[-6px] top-0 w-3 h-3 bg-white"
                                        style={{ clipPath: 'polygon(100% 0, 0 0, 100% 100%)' }}></div>
                                </div>
                            </div>
                        </div>

                        {/* 메인 텍스트 에어리어 (시인성 극대화) */}
                        <div className="bg-white rounded-[20px] overflow-hidden shadow-sm flex flex-col">
                            <textarea
                                autoFocus
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                className="w-full min-h-[200px] p-5 text-lg font-black text-black outline-none resize-none leading-relaxed placeholder:font-normal placeholder:text-black/20"
                                placeholder={isKo ? "내용을 입력하세요" : "Enter message"}
                            />
                            {/* 카카오톡 전송 버튼 스타일 */}
                            <div className="flex justify-end p-2 bg-white">
                                <button
                                    className={`w-12 h-10 rounded-[12px] flex items-center justify-center transition-all ${inputValue.trim() ? 'bg-[#f9e000] text-black' : 'bg-[#f5f5f5] text-black/20'
                                        }`}
                                >
                                    <span className="text-sm font-bold">{isKo ? '전송' : 'Send'}</span>
                                </button>
                            </div>
                        </div>

                        {/* 추천 질문 (유저가 보낸 노란 말풍선 느낌) */}
                        <div className="mt-6 flex flex-col items-end space-y-2 max-h-[150px] overflow-y-auto no-scrollbar">
                            {suggestions.map((text, index) => (
                                <button
                                    key={index}
                                    onClick={() => setInputValue(text)}
                                    className="bg-[#f9e000] text-black px-4 py-2.5 rounded-[16px] rounded-tr-[2px] text-sm font-medium shadow-sm active:bg-[#edd400]"
                                >
                                    {text}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* --- [3. 닫힌 상태의 하단 인풋 바] --- */}
                {!isExpanded && (
                    <div className="px-6 pb-6">
                        <div
                            onClick={() => setIsExpanded(true)}
                            className="w-full py-3.5 px-6 bg-white rounded-full shadow-sm flex items-center justify-between cursor-text border border-indigo-50"
                        >
                            <span className="text-sm text-slate-400 font-medium">
                                {isKo ? '고민을 입력해보세요...' : 'Type your worries...'}
                            </span>
                            <div className="bg-[#f9e000] w-7 h-7 rounded-full flex items-center justify-center text-black">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SazaTalkBanner;