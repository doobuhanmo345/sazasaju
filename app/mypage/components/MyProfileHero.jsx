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
            {/* Background Decoration - Optimized Watercolor */}
            <div className="absolute inset-0 pointer-events-none select-none">
                <div className="absolute inset-0 bg-slate-50 dark:bg-slate-950" />

                {/* 1. 우상단: 메인 레이어 (가장 큼, GPU 가속) */}
                <div
                    className="absolute -top-[10%] -right-[15%] w-[80vw] h-[60vh] 
        bg-indigo-500/10 dark:bg-indigo-900/20
        blur-[60px] rotate-12 transform-gpu will-change-transform
        [clip-path:polygon(20%_0%,_100%_0%,_100%_60%,_60%_100%,_0%_80%)]"
                />

                {/* 2. 우중앙: 보조 레이어 (blur 낮춤) */}
                <div
                    className="absolute top-[25%] -right-[5%] w-[40vw] h-[40vh] 
        bg-purple-400/10 dark:bg-purple-800/10
        blur-[50px] -rotate-12 transform-gpu"
                />

                {/* 3. 좌중앙: 포인트 레이어 */}
                <div
                    className="absolute top-[10%] -left-[10%] w-[50vw] h-[50vh] 
        bg-rose-400/5 dark:bg-rose-900/10
        blur-[60px] transform-gpu"
                />

                {/* Texture: 이 녀석이 성능 대비 '고급짐' 효율이 제일 좋습니다 */}
                <div className="absolute inset-0 opacity-[0.05] dark:opacity-[0.1] mix-blend-overlay bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')]" />
            </div>
            <BackButton title={isKo ? '마이페이지' : 'My Page'} />

            <div className="relative z-10 max-w-lg mx-auto flex flex-col items-center">
                {/* Floating Avatar */}
                <div className="relative">

                    <div className="absolute inset-[-80%] bg-white/[0.6] dark:bg-indigo-500/[0.1] rounded-full blur-2xl transform-gpu" />

                    <div className="relative w-32 h-32 sm:w-40 sm:h-40 flex items-center justify-center transform-gpu shadow-[0_32px_64px_rgba(79,70,229,0.15)] rounded-full bg-white/20 dark:bg-slate-900/20 backdrop-blur-sm">
                        {/* Identity Badge */}
                        <div className="absolute -top-6 left-1/2 -translate-x-1/2 z-10 whitespace-nowrap text-center">
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

                <div className="text-center w-full mt-8 z-30">
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