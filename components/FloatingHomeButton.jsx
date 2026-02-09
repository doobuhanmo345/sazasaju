'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

const FloatingHomeButton = ({ language = 'ko' }) => {
    const router = useRouter();
    const isKo = language === 'ko';

    return (
        <div className="fixed bottom-6 right-4 sm:bottom-auto sm:top-8 sm:right-8 z-[100]">
            <button
                onClick={() => router.push('/')}
                className="group relative flex flex-col items-end"
                aria-label={isKo ? '사자사주 홈으로 이동' : 'Go to Saza Saju Home'}
            >
                {/* Dynamic Badge for Free Analysis - Appear above button on mobile, below on desktop */}
                <div className="mb-2 sm:mb-0 sm:mt-2 sm:order-2 bg-indigo-600 text-white text-[10px] font-black px-2.5 py-1 rounded-full shadow-lg animate-bounce ring-2 ring-white whitespace-nowrap">
                    {isKo ? '매일 3회 무료 분석 ✨' : '3 FREE DAILY ANALYSES ✨'}
                </div>

                <div className="sm:order-1 bg-white/90 backdrop-blur-md border border-slate-200 px-4 py-2.5 rounded-2xl shadow-sm hover:shadow-md transition-all flex items-center gap-2 active:scale-95 group-hover:border-indigo-300">
                    <span className="text-sm font-bold text-slate-700">
                        {isKo ? '사자사주 홈' : 'Visit Home'}
                    </span>
                    <div className="w-6 h-6 bg-indigo-50 rounded-full flex items-center justify-center text-[14px]">
                        🦁
                    </div>
                </div>
            </button>
        </div>
    );
};

export default FloatingHomeButton;
