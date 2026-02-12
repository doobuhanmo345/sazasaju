'use client';

import React, { memo } from 'react';
import Image from 'next/image';
import { ArrowPathIcon } from '@heroicons/react/24/outline';
import BackButton from '@/ui/BackButton';

const MyProfileHero = memo(({
    iljuImagePath,
    selectedProfile,
    userData,
    isKo,
    selectProfile,
    router
}) => {
    return (
        <div className="relative pt-24 pb-9 px-8">
            {/* Background Decoration - Optimized blurs */}
            <div className="absolute top-[-10%] right-[-10%] w-[120%] h-[120%] bg-white dark:bg-slate-950 -z-10" />
            <div className="absolute top-0 right-0 -mr-20 -mt-10 w-[400px] h-[400px] bg-indigo-500/[0.03] dark:bg-indigo-500/[0.06] rounded-full blur-[40px] pointer-events-none transform-gpu" />
            <div className="absolute bottom-[-10%] left-[-5%] w-[300px] h-[300px] bg-purple-500/[0.03] dark:bg-purple-500/[0.06] rounded-full blur-[40px] pointer-events-none transform-gpu" />

            <BackButton title={isKo ? '마이페이지' : 'My Page'} />

            <div className="relative z-10 max-w-lg mx-auto flex flex-col items-center">
                {/* Floating Avatar */}
                <div className="relative">
                    <div className="absolute inset-[-30%] bg-indigo-500/[0.06] dark:bg-indigo-500/[0.1] rounded-full blur-2xl transform-gpu" />
                    <div className="absolute inset-[-80%] bg-indigo-500/[0.06] dark:bg-indigo-500/[0.1] rounded-full blur-2xl transform-gpu" />
                    <div className="absolute bottom-[150px] right-[100px] w-80 h-80 bg-indigo-500/5 dark:bg-indigo-500/10 rounded-full blur-[60px] transform-gpu" />
                    <div className="absolute bottom-[150px] left-[100px] w-80 h-80 bg-purple-500/5 dark:bg-purple-500/10 rounded-full blur-[60px] transform-gpu" />

                    <div className="relative w-32 h-32 sm:w-40 sm:h-40 flex items-center justify-center transform-gpu shadow-[0_32px_64px_rgba(79,70,229,0.15)] rounded-full bg-white/20 dark:bg-slate-900/20 backdrop-blur-sm">
                        {/* Identity Badge */}
                        <div className="absolute -top-6 left-1/2 -translate-x-1/2 z-30 whitespace-nowrap text-center">
                            <span className={`text-[11px] font-black uppercase tracking-[0.4em] ${selectedProfile?.uid !== userData?.uid ? 'text-purple-500' : 'text-indigo-500'}`}>
                                {selectedProfile?.uid !== userData?.uid ? (selectedProfile?.relationship || (isKo ? '다른 인연' : 'Connection')) : (isKo ? 'Me' : 'Me')}
                            </span>
                        </div>

                        <Image
                            src={iljuImagePath}
                            alt="Profile"
                            fill
                            priority
                            className="object-contain transition-all duration-500 p-2"
                        />

                        <button
                            onClick={() => {
                                if (selectedProfile?.uid !== userData?.uid) {
                                    selectProfile(userData);
                                } else {
                                    router.push('/mypage/manage');
                                }
                            }}
                            className="absolute bottom-1 right-1 w-9 h-9 bg-white dark:bg-slate-900 rounded-full shadow-md border border-slate-100 dark:border-slate-800 flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:scale-110 active:scale-95 transition-all z-20"
                            aria-label="Switch Profile"
                        >
                            <ArrowPathIcon className="w-5 h-5 stroke-[2]" />
                        </button>
                    </div>
                </div>

                <div className="text-center w-full mt-8">
                    <h1 className="text-5xl sm:text-6xl font-black text-slate-900 dark:text-white tracking-tighter leading-[0.8] mb-8">
                        {selectedProfile?.displayName || userData?.displayName || 'User'}
                        <span className="text-indigo-600 animate-pulse">.</span>
                    </h1>
                </div>
            </div>
        </div>
    );
});

MyProfileHero.displayName = 'MyProfileHero';
export default MyProfileHero;
