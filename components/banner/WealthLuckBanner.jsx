'use client';

import React from 'react';
import { useLanguage } from '@/contexts/useLanguageContext';
import { useRouter } from 'next/navigation';

const WealthLuckBanner = () => {
    const { language } = useLanguage();
    const router = useRouter();
    const isKo = language === 'ko';

    return (
        <div
            className="relative w-full max-w-lg h-[150px] sm:h-[160px] mx-auto overflow-hidden my-4 rounded-[1.5rem] bg-[#FFFBEB] border border-amber-100 shadow-sm transition-all duration-300 active:scale-[0.98] cursor-pointer group hover:shadow-md hover:border-amber-200"
            onClick={() => router.push('/saju/wealth/capacity')}
        >
            {/* Full Background Image */}
            <div className="absolute inset-0 w-full h-full pointer-events-none">
                <img
                    src="/images/banner/wealth_1.png"
                    className="w-full h-full object-cover object-[right_center] transition-transform duration-1000 group-hover:scale-[1.03]"
                    alt="Wealth Luck"
                />
            </div>

            {/* Subtle Gradient for Text Readability */}
            <div className="absolute inset-0 bg-gradient-to-r from-amber-50/90 via-amber-50/40 to-transparent pointer-events-none" />

            {/* Shine Effect (Optional, kept for extra flair on interaction) */}
            <div className="absolute top-0 -left-[100%] w-1/2 h-full bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-[-25deg] transition-all duration-1000 group-hover:left-[200%] z-10 pointer-events-none" />

            <div className="relative h-full flex items-center justify-between px-6 pl-8 z-20 w-full">

                {/* Text Content (Left) */}
                <div className="flex flex-col justify-center items-start space-y-1 z-30 max-w-[60%]">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 bg-white/80 px-2 py-0.5 rounded-sm border border-amber-200/60 shadow-sm backdrop-blur-sm">
                        {isKo ? '평생 재물운' : 'WEALTH LUCK'}
                    </span>

                    <h2 className="text-xl sm:text-2xl font-bold text-slate-800 leading-tight drop-shadow-sm">
                        {isKo ? '나는 언제쯤' : 'When will I'}<br />
                        <span className="text-amber-700 font-extrabold">
                            {isKo ? '부자가 될까?' : 'be Rich?'}
                        </span>
                    </h2>

                    <div className="inline-flex items-center gap-1 bg-white/70 backdrop-blur-md rounded-full px-2.5 py-0.5 mt-1 border border-amber-200/50 shadow-sm">
                        <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse" />
                        <span className="text-[10px] font-bold text-amber-900/90">
                            {isKo ? '타고난 부의 그릇 분석' : 'Wealth Capacity Analysis'}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WealthLuckBanner;
