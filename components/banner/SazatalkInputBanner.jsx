'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '@/contexts/useLanguageContext';
import { useRouter } from 'next/navigation';

const SazatalkInputBanner = () => {
    const router = useRouter();
    const { language } = useLanguage();
    const [isOpen, setIsOpen] = useState(false);
    const [inputValue, setInputValue] = useState("");
    const isKo = language === 'ko';

    const suggestions = [
        isKo ? "이번 달 나에게 찾아올 행운은?" : "What luck will find me this month?",
        isKo ? "지금 이직을 고민 중인데 괜찮을까요?" : "Is it a good time for a job change?",
        isKo ? "그 사람과 나의 인연이 궁금해요" : "Tell me about my connection with them",
    ];

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
            <div className="relative w-full max-w-lg  mx-auto  my-4 rounded-[2rem] border border-indigo-100/50 shadow-md transition-all duration-300 active:scale-[0.98] cursor-pointer group">
                <div
                    className="relative w-full h-[240px] sm:h-[260px] bg-[#EEF0FF] rounded-[2.5rem] shadow-md border border-indigo-100/50 overflow-hidden flex flex-col"
                >
                    {/* 상단: 배너 콘텐츠 */}
                    <div className="relative h-[160px] flex flex-col justify-center px-8 pt-4 cursor-pointer" onClick={() => setIsOpen(true)}>
                        <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-indigo-200/40 blur-3xl rounded-full z-0" />
                        <div className="relative z-10">
                            <h2 className="text-xl sm:text-2xl font-light text-slate-900 leading-[1.3] tracking-tight">
                                {isKo ? '답답한 고민,' : 'Tricky problems,'} <br />
                                <span className="font-serif italic font-medium text-indigo-700">
                                    {isKo ? '무엇이든 물어보사자' : 'Ask Saza Anything'}
                                </span>
                            </h2>
                        </div>
                        <img
                            src="/images/banner/ama.webp"
                            className="absolute bottom-0 right-2 h-[110%] w-auto object-contain pointer-events-none z-20"
                            alt="mascot"
                        />
                    </div>

                    {/* 하단: 클릭 유도 인풋 바 (시인성 강화) */}
                    <div className="px-6 pb-6 mt-auto">
                        <div
                            onClick={() => setIsOpen(true)}
                            className="w-full py-3.5 px-6 bg-white/90 rounded-full shadow-sm flex items-center justify-between cursor-text border border-indigo-50 hover:border-indigo-200 transition-all group"
                        >
                            <span className="text-[14px] text-slate-500 font-medium">
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
                        <div className="flex items-center justify-between px-5 py-4 bg-indigo-50 dark:bg-slate-900 border-b border-indigo-100/50 dark:border-slate-800">
                            <div className="flex items-center space-x-3">
                                <button onClick={() => setIsOpen(false)} className="p-1 text-slate-500 dark:text-slate-400">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M15 18l-6-6 6-6" /></svg>
                                </button>
                                <span className="font-bold text-[17px] text-slate-800 dark:text-white">SazaTalk</span>
                            </div>
                            <button onClick={() => setIsOpen(false)} className="text-[14px] font-bold text-slate-500 dark:text-slate-500">
                                {isKo ? '닫기' : 'Close'}
                            </button>
                        </div>

                        {/* 채팅창 내부 */}
                        <div className="flex-1 overflow-y-auto p-5 space-y-6 scrollbar-hide bg-indigo-50 dark:bg-slate-900">
                            <div className="flex items-start">
                                <div className="w-11 h-11 bg-indigo-500 rounded-[18px] flex items-center justify-center text-2xl mr-2 flex-shrink-0 shadow-sm text-white">🦁</div>
                                <div className="flex flex-col">
                                    <span className="text-[12px] text-slate-500 dark:text-slate-400 mb-1 ml-1 font-bold">{isKo ? '사자' : 'Saza'}</span>
                                    <div className="relative bg-white dark:bg-slate-800 p-3.5 px-4 rounded-[16px] rounded-tl-none shadow-sm max-w-[260px]">
                                        <p className="text-[15px] text-slate-900 dark:text-slate-100 leading-snug font-medium">
                                            {isKo ? '안녕하세요! 오늘 어떤 고민이 있으신가요? 사자가 정성껏 사주를 풀이해 드릴게요.' : 'Hello! What worries do you have today? I will interpret your Saju with care.'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* 추천 질문 (유저 말풍선) */}
                            <div className="flex flex-col items-end space-y-3">
                                {suggestions.map((text, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setInputValue(text)}
                                        className="bg-indigo-600 text-white px-4 py-3 rounded-[18px] rounded-tr-[2px] text-[14px] font-bold shadow-sm active:bg-indigo-700 max-w-[85%] animate-in slide-in-from-right-5"
                                        style={{ animationDelay: `${index * 100}ms` }}
                                    >
                                        {text}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* 하단 텍스트 에어리어 */}
                        <div className="bg-white dark:bg-slate-800 p-4 pb-10 sm:pb-6 border-t border-slate-100 dark:border-slate-700 flex flex-col">
                            <textarea
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                className="w-full min-h-[140px] max-h-[300px] py-2 text-[19px] font-black text-slate-900 dark:text-white outline-none resize-none leading-relaxed placeholder:font-normal placeholder:text-slate-300 dark:placeholder:text-slate-500 bg-transparent"
                                placeholder={isKo ? "무엇이든 물어보세요" : "Ask anything"}
                            />
                            <div className="flex justify-end mt-2">
                                <button
                                    onClick={() => {
                                        if (inputValue.trim()) {
                                            router.push(`/saju/sazatalk?q=${encodeURIComponent(inputValue)}`);
                                        }
                                    }}
                                    className={`w-16 h-11 rounded-[14px] flex items-center justify-center transition-all ${inputValue.trim() ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-100 dark:bg-slate-700 text-slate-300 dark:text-slate-500 font-normal'
                                        }`}
                                >
                                    <span className="text-[15px] font-bold">{isKo ? '전송' : 'Send'}</span>
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