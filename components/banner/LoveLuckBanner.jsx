'use client';

import React from 'react';
import { useLanguage } from '@/contexts/useLanguageContext';
import { useRouter } from 'next/navigation';

const LoveLuckBanner = () => {
    const { language } = useLanguage();
    const router = useRouter();
    const isKo = language === 'ko';

    return (
        <div
            className="relative w-full max-w-lg h-[150px] sm:h-[160px] mx-auto overflow-hidden my-4 rounded-[1.5rem] bg-[#F0FDF4] border border-emerald-100 shadow-sm transition-all duration-300 active:scale-[0.98] cursor-pointer group"
            onClick={() => router.push('/saju/love/lifetime')}
        >
            {/* Full Background Image */}
            <div className="absolute inset-0 w-full h-full pointer-events-none">
                <img
                    src="/images/banner/love_lifetime.png"
                    className="w-full h-full object-cover object-[right_center] transition-transform duration-1000 group-hover:scale-[1.03]"
                    alt="Lifetime Love Luck"
                />
            </div>

            {/* Subtle Gradient for Text Readability */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#F0FDF4]/90 via-[#F0FDF4]/40 to-transparent pointer-events-none" />

            <div className="relative h-full flex items-center justify-between px-6 sm:px-8 z-20">

                {/* Text Section (Left-Center) */}
                <div className="z-30 flex flex-col justify-center items-start space-y-1 max-w-[60%]">
                    <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-white/80 px-2 py-0.5 rounded-full border border-emerald-200/60 shadow-sm backdrop-blur-sm">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        {isKo ? '평생 애정운' : 'LIFETIME LOVE'}
                    </span>

                    <h2 className="text-xl sm:text-2xl font-bold text-slate-800 leading-snug drop-shadow-sm">
                        {isKo ? '나의 ' : 'Your '}<span className="text-emerald-700 underline decoration-emerald-400/50 decoration-4 underline-offset-2">{isKo ? '타고난 연애' : 'Love'}</span><br />
                        {isKo ? '패턴 완전 분석' : 'Pattern Analysis'}
                    </h2>

                    <button className="mt-2 bg-white/90 backdrop-blur-md text-xs font-bold text-emerald-700 px-3 py-1 rounded-full shadow-sm border border-emerald-200/50 group-hover:bg-emerald-600 group-hover:text-white group-hover:border-emerald-600 transition-colors duration-300 flex items-center gap-1">
                        {isKo ? '확인하기' : 'Check Now'}
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LoveLuckBanner;
