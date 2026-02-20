'use client';

import React from 'react';
import { useLanguage } from '@/contexts/useLanguageContext';
import { useRouter } from 'next/navigation';

const SoloEscapeBanner = () => {
    const { language } = useLanguage();
    const router = useRouter();
    const isKo = language === 'ko';

    return (
        <div
            className="relative w-full max-w-lg h-[150px] sm:h-[160px] mx-auto overflow-hidden my-4 rounded-[1.5rem] bg-[#F0F9FF] border border-sky-100 shadow-sm transition-all duration-300 active:scale-[0.98] cursor-pointer group"
            onClick={() => router.push('/saju/love/timing')}
        >
            {/* Full Background Image */}
            <div className="absolute inset-0 w-full h-full pointer-events-none">
                <img
                    src="/images/banner/love_timing.png"
                    className="w-full h-full object-cover object-[left_center] transition-transform duration-700 group-hover:scale-[1.03]"
                    alt="Solo Escape Timing"
                />
            </div>

            {/* Subtle Gradient for Text Readability */}
            <div className="absolute inset-0 bg-gradient-to-l from-white/70 via-white/20 to-transparent pointer-events-none" />

            <div className="relative h-full flex items-center justify-end px-6 z-10">
                {/* Text RIGHT */}
                <div className="w-[60%] flex flex-col items-end text-right space-y-1 z-20">
                    <div className="bg-white/90 text-sky-600 px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase tracking-wide mb-1 shadow-sm border border-sky-100">
                        {isKo ? 'D-DAY 분석' : 'TIMING IS EVERYTHING'}
                    </div>

                    <h2 className="text-xl font-bold text-slate-800 leading-tight">
                        {isKo ? '나도 연애할 수 있을까?' : 'When will I'}<br />
                        <span className="text-sky-600/90 text-2xl font-black drop-shadow-sm">
                            {isKo ? '솔로 탈출 시기' : 'Meet the One?'}
                        </span>
                    </h2>

                    <div className="h-px w-12 bg-sky-200 my-2" />

                    <p className="text-xs text-slate-600 font-semibold drop-shadow-sm">
                        {isKo ? '정확한 만남의 시기를 확인하세요' : 'Pinpoint your romance timing'}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default SoloEscapeBanner;
