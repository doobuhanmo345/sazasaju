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
                {/* Dynamic Badge - Smaller on mobile */}
                <div className="mb-1.5 sm:mb-0 sm:mt-2 sm:order-2 bg-indigo-600 text-white text-[9px] sm:text-xs font-black px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full shadow-lg animate-bounce ring-1 sm:ring-2 ring-white whitespace-nowrap">
                    {isKo ? '매일 3회 무료 분석 ✨' : '3 FREE DAILY ANALYSES ✨'}
                </div>

                <div className="sm:order-1 bg-white/95 backdrop-blur-md border border-slate-200 px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl sm:rounded-2xl shadow-md hover:shadow-lg transition-all flex items-center gap-2 active:scale-95 group-hover:border-indigo-300">
                    <span className="text-xs sm:text-sm font-bold text-slate-700">
                        {isKo ? '사자사주 홈' : 'Visit Home'}
                    </span>
                    <div className="w-5 h-5 sm:w-6 sm:h-6 bg-indigo-50 rounded-full flex items-center justify-center text-sm sm:text-sm">
                        🦁
                    </div>
                </div>
            </button>
        </div>
    );
};

export default FloatingHomeButton;
