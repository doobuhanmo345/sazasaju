'use client';

import { useState, useEffect } from 'react';
import { useAuthContext } from '@/contexts/useAuthContext';
import { useLoading } from '@/contexts/useLoadingContext';
import { db } from '@/lib/firebase';
import { XMarkIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { useRouter, usePathname } from 'next/navigation';
import * as firestore from 'firebase/firestore';
import { addDoc, collection, serverTimestamp, onSnapshot, doc, updateDoc, query, where, orderBy, writeBatch } from 'firebase/firestore';

export default function AppBanner() {
    const { user, userData } = useAuthContext();
    const { progress, elapsedTime, statusText: globalStatusText, queueDoc, localStatusText, isBackground, isDirect, isStaleFlag, handleCancel } = useLoading();
    const router = useRouter();
    const pathname = usePathname();

    const isStaleFlagContext = isStaleFlag; // Rename for clarity if needed, but context provides it.

    // Check if current path should hide the banner
    const isHiddenPath = pathname?.startsWith('/mypage') || pathname?.startsWith('/credit') || pathname?.startsWith('/tutorial')
    const shouldShow = (isBackground || isDirect || (userData?.isAnalyzing && !isStaleFlag)) && !isHiddenPath;
    //isbackground true => 분석중, 새로고침해도 유지


    const handleAnalyzing = async (userData) => {
        // [Global] Release analysis lock
        if (userData?.uid) {
            await updateDoc(doc(db, 'users', userData?.uid), { isAnalyzing: false });
        }
    }

    //isbackground true => 분석중, 새로고침해도 유지
    //isDirect true => 분석중, 새로고침하면 유지 안됨
    //UserData?.isAnalyzing true => 분석중인거를 기록해놓기 위한 데이터
    //useEffect로 분석중이면 banner를 유지하고, 분석이 끝나면 banner를 없앤다.
    useEffect(() => {
        if (userData?.isAnalyzing) {
            if (!isDirect && !isBackground) {
                handleAnalyzing(userData);
                return;
            } else if (!isDirect && isBackground) {
                return;
            } else if (!isDirect && !isBackground) {
                handleAnalyzing(userData);
                return;
            } else {
                return;
            }
        }
    }, [isBackground, isDirect, userData?.isAnalyzing]);
    // console.log(isBackground, isDirect, userData?.isAnalyzing)

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };
    // Enhanced Progress Logic:
    // 1. Direct: Use context's simulated progress
    // 2. Background - Pending: Stall at 5%
    // 3. Background - Processing: Scale context progress to start from 10%
    let displayProgress = progress;
    if (isBackground) {
        if (queueDoc.status === 'pending') {
            displayProgress = 5;
        } else {
            // Scale 0-100 to 10-99
            displayProgress = 10 + (progress * 0.89);
        }
    }

    // Use elapsedTime from context for direct, or estimate from queueDoc for background
    const displayTime = isDirect ? elapsedTime : (queueDoc?.createdAt ? Math.floor((Date.now() - queueDoc.createdAt.toMillis()) / 1000) : 0);
    if (!shouldShow) return null;
    return (
        <div className="w-full relative overflow-hidden bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-indigo-100/50 dark:border-indigo-900/30">
            {/* Progress Bar Background */}
            <div className="absolute bottom-0 left-0 w-full h-[3px] bg-slate-100 dark:bg-slate-800" />

            {/* Animated Progress Fill */}
            <div
                className="absolute bottom-0 left-0 h-[3px] bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 transition-all duration-1000 ease-out z-10"
                style={{ width: `${displayProgress}%` }}
            >
                <div className="absolute inset-0 w-full h-full bg-[linear-gradient(90deg,transparent_25%,rgba(255,255,255,0.4)_50%,transparent_75%)] animate-[shimmer_2s_infinite]" />
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between gap-4">
                <div className="flex items-center gap-4 overflow-hidden">
                    {/* Pulsing Status Icon */}
                    <div className="relative flex-shrink-0">
                        <div className="absolute inset-0 bg-indigo-500 rounded-full animate-ping opacity-20" />
                        <div className="relative w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/20">
                            <SparklesIcon className="w-4 h-4 text-white animate-pulse" />
                        </div>
                    </div>

                    <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-xs font-black uppercase tracking-widest text-indigo-500 dark:text-indigo-400">
                                {isBackground ? (queueDoc.analysisTitle || 'Background Analysis') : 'Direct Analysis'}
                            </span>
                            <span className="w-1 h-1 bg-slate-300 dark:bg-slate-600 rounded-full" />
                            <span className="text-xs font-bold text-slate-500 tabular-nums">
                                {formatTime(displayTime)}
                            </span>
                        </div>
                        <h4 className="text-sm font-bold text-slate-800 dark:text-white truncate">
                            {isDirect ? (globalStatusText || '분석 중...') : (localStatusText || '서버 연결 중...')}
                        </h4>
                    </div>
                </div>

                <div className="flex items-center gap-3 flex-shrink-0">
                    <div className="hidden sm:flex flex-col items-end mr-2">
                        <span className="text-sm font-black text-indigo-600 dark:text-indigo-400">
                            {Math.round(displayProgress)}%
                        </span>
                    </div>

                    <button
                        onClick={handleCancel}
                        className="group flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-900/20 text-slate-600 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-full transition-all duration-200 border border-slate-200 dark:border-slate-700 hover:border-rose-200 dark:hover:border-rose-900/50"
                    >
                        <XMarkIcon className="w-3.5 h-3.5 transition-transform group-hover:rotate-90" />
                        <span className="text-xs font-bold whitespace-nowrap">취소하기</span>
                    </button>
                </div>
            </div>

            <style jsx>{`
                @keyframes shimmer {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(100%); }
                }
            `}</style>
        </div>
    );
}
