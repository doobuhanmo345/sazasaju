'use client';

import { useState, useEffect } from 'react';
import { useAuthContext } from '@/contexts/useAuthContext';
import { useLoading } from '@/contexts/useLoadingContext';
import { db } from '@/lib/firebase';
import { collection, query, where, orderBy, limit, onSnapshot, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { XMarkIcon, SparklesIcon } from '@heroicons/react/24/outline';

export default function AppBanner() {
    const { user, userData } = useAuthContext();
    const { loading, progress, elapsedTime, onCancel, statusText: globalStatusText } = useLoading();
    const [queueDoc, setQueueDoc] = useState(null);
    const [localStatusText, setLocalStatusText] = useState('');

    // Listen to queue documents (Background Analysis)
    useEffect(() => {
        if (!user?.uid) {
            setQueueDoc(null);
            return;
        }

        const q = query(
            collection(db, 'analysis_queue'),
            where('userId', '==', user.uid),
            orderBy('createdAt', 'desc'),
            limit(1)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            if (snapshot.empty) {
                setQueueDoc(null);
                if (userData?.isAnalyzing && !loading) {
                    // Stale flag detection
                    const startAt = userData.analysisStartedAt?.toMillis ? userData.analysisStartedAt.toMillis() : (userData.analysisStartedAt ? new Date(userData.analysisStartedAt).getTime() : 0);
                    const updateAt = userData.updatedAt?.toMillis ? userData.updatedAt.toMillis() : (userData.updatedAt ? new Date(userData.updatedAt).getTime() : 0);
                    const lastActive = Math.max(startAt, updateAt);
                    const fiveMinsAgo = Date.now() - 5 * 60 * 1000;

                    if (lastActive && lastActive < fiveMinsAgo) {
                        updateDoc(doc(db, 'users', user.uid), { isAnalyzing: false }).catch(console.error);
                    } else {
                        setLocalStatusText('분석 준비 중...');
                    }
                }
                return;
            }

            const docData = snapshot.docs[0];
            const data = docData.data();

            if (data.status === 'pending' || data.status === 'processing') {
                setQueueDoc({ id: docData.id, ...data });
                if (data.status === 'pending') {
                    setLocalStatusText('대기 중...');
                } else if (data.status === 'processing') {
                    setLocalStatusText(data.progressMessage || '분석 중...');
                }
            } else {
                setQueueDoc(null);
            }
        }, (error) => {
            setQueueDoc(null);
        });

        return () => unsubscribe();
    }, [user?.uid, userData?.isAnalyzing, userData?.updatedAt, loading]);

    const handleCancel = async () => {
        if (!loading && !queueDoc) return;
        const confirmCancel = confirm('분석을 취소하시겠습니까?');
        if (!confirmCancel) return;

        const docId = queueDoc?.id;
        const uid = user?.uid;

        // [UI] Update local state immediately for instant dismissal
        onCancel();
        setQueueDoc(null);
        setLocalStatusText('');

        try {
            // [Background] Cleanup Firestore resources
            if (docId) {
                await deleteDoc(doc(db, 'analysis_queue', docId));
            }

            // [Global] Release analysis lock
            if (uid) {
                await updateDoc(doc(db, 'users', uid), { isAnalyzing: false });
            }
        } catch (error) {
            console.error('Failed to cancel analysis:', error);
        }
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const isBackground = !!queueDoc;
    const isDirect = loading;
    const isStaleFlag = (() => {
        if (!userData?.isAnalyzing || loading || isBackground) return false;
        const startAt = userData.analysisStartedAt?.toMillis ? userData.analysisStartedAt.toMillis() : (userData.analysisStartedAt ? new Date(userData.analysisStartedAt).getTime() : 0);
        const updateAt = userData.updatedAt?.toMillis ? userData.updatedAt.toMillis() : (userData.updatedAt ? new Date(userData.updatedAt).getTime() : 0);
        const lastActive = Math.max(startAt, updateAt);
        if (!lastActive) return false;
        return Date.now() - lastActive > 5 * 60 * 1000;
    })();

    const shouldShow = isBackground || isDirect || (userData?.isAnalyzing && !isStaleFlag);
    if (!shouldShow) return null;

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

    return (
        <div className="w-full relative overflow-hidden bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-indigo-100/50 dark:border-indigo-900/30">
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
                            <span className="text-[10px] font-black uppercase tracking-widest text-indigo-500 dark:text-indigo-400">
                                {isBackground ? (queueDoc.analysisTitle || 'Background Analysis') : 'Direct Analysis'}
                            </span>
                            <span className="w-1 h-1 bg-slate-300 dark:bg-slate-600 rounded-full" />
                            <span className="text-[10px] font-bold text-slate-500 tabular-nums">
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
                        <span className="text-[11px] font-black text-indigo-600 dark:text-indigo-400">
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
