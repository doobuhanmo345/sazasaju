'use client';

import React from 'react';
import { useLanguage } from '@/contexts/useLanguageContext';
import { useRouter } from 'next/navigation';

const ReunionBanner = () => {
    const { language } = useLanguage();
    const router = useRouter();
    const isKo = language === 'ko';

    return (
        <div
            className="relative w-full max-w-lg h-[150px] sm:h-[160px] mx-auto overflow-hidden my-4 rounded-[1.5rem] bg-[#FFF0F5] border border-fuchsia-100 shadow-sm transition-all duration-300 active:scale-[0.98] cursor-pointer group"
            onClick={() => router.push('/saju/love/reunion')}
        >
            {/* Soft Background Blob */}
            <div className="absolute -left-10 top-[-20%] w-40 h-40 bg-fuchsia-200/40 blur-3xl rounded-full" />
            <div className="absolute right-[-10%] bottom-[-20%] w-40 h-40 bg-pink-200/40 blur-3xl rounded-full" />

            <div className="relative h-full flex items-center justify-between px-6 pl-8 z-10">
                {/* Text Content (Left) */}
                <div className="flex flex-col justify-center items-start space-y-1 z-20 max-w-[65%]">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-fuchsia-600 bg-white/60 px-2 py-0.5 rounded-sm backdrop-blur-sm border border-fuchsia-100/50">
                        {isKo ? '재회운' : 'REUNION LUCK'}
                    </span>

                    <h2 className="text-xl sm:text-2xl font-bold text-slate-800 leading-tight">
                        {isKo ? '헤어진 우리,' : 'Will we meet'}<br />
                        <span className="text-fuchsia-900/80">
                            {isKo ? '다시 만날 수 있을까?' : 'again?'}
                        </span>
                    </h2>

                    <p className="text-xs text-slate-500 mt-1 font-medium leading-relaxed">
                        {isKo ? '그 사람의 속마음과 재회 타이밍' : 'Check his/her true feelings & timing'}
                    </p>
                </div>

                {/* Image (Right) */}
                <div className="absolute right-[-10px] bottom-[-5px] h-[115%] w-[45%] flex items-end justify-center pointer-events-none">
                    <img
                        src="/images/banner/love_reunion.png"
                        className="h-full w-auto object-contain drop-shadow-md transition-transform duration-500 group-hover:scale-105 group-hover:rotate-1"
                        alt="Reunion Luck"
                    />
                </div>
            </div>
        </div>
    );
};

export default ReunionBanner;
