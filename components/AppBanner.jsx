'use client';

import { useState, useEffect } from 'react';
import { useAuthContext } from '@/contexts/useAuthContext';
import { useLoading } from '@/contexts/useLoadingContext';
import { db } from '@/lib/firebase';
import { collection, query, where, orderBy, limit, onSnapshot, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { XMarkIcon } from '@heroicons/react/24/outline';

export default function AppBanner() {
    const { user, userData } = useAuthContext();
    const { loading, setLoading } = useLoading();
    const [queueDoc, setQueueDoc] = useState(null);
    const [statusText, setStatusText] = useState(''); // [FIX] Initialize empty to avoid flicker

    // Listen to queue documents
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
                // If isAnalyzing is true but no queue doc, it's either direct analysis 
                // or a stale flag from a previous crash/refresh.
                if (userData?.isAnalyzing) {
                    // [NEW] Stale flag detection: check if updatedAt is older than 5 mins
                    const updatedAt = userData.updatedAt ? new Date(userData.updatedAt) : null;
                    const fiveMinsAgo = new Date(Date.now() - 5 * 60 * 1000);

                    if (updatedAt && updatedAt < fiveMinsAgo) {
                        console.log('[AppBanner] Stale analysis flag detected, clearing...');
                        // Auto-clear stale flag
                        updateDoc(doc(db, 'users', user.uid), { isAnalyzing: false }).catch(console.error);
                    } else {
                        setStatusText('분석 준비 중...');
                    }
                }
                return;
            }

            const docData = snapshot.docs[0];
            const data = docData.data();

            // Only show if status is pending or processing
            if (data.status === 'pending' || data.status === 'processing') {
                setQueueDoc({ id: docData.id, ...data });

                // Set status text based on current status
                if (data.status === 'pending') {
                    setStatusText('대기 중...');
                } else if (data.status === 'processing') {
                    setStatusText(data.progressMessage || '분석 중...');
                }
            } else {
                setQueueDoc(null);
            }
        }, (error) => {
            setQueueDoc(null);
        });

        return () => unsubscribe();
    }, [user?.uid, userData?.isAnalyzing, userData?.updatedAt]); // [MOD] Added dependencies

    const handleCancel = async () => {
        const confirmCancel = confirm('분석을 취소하시겠습니까?');
        if (!confirmCancel) return;

        try {
            // Delete the queue document if it exists (background analysis)
            if (queueDoc) {
                await deleteDoc(doc(db, 'analysis_queue', queueDoc.id));
            }

            // Release the global lock (works for both direct and background)
            if (user?.uid) {
                await updateDoc(doc(db, 'users', user.uid), { isAnalyzing: false });
            }

            setQueueDoc(null);
            setStatusText('');
            setLoading(false);
            alert('분석이 취소되었습니다.');
        } catch (error) {
            console.error('Failed to cancel analysis:', error);
            alert('취소 중 오류가 발생했습니다.');
        }
    };

    // Show banner if:
    // 1. Queue document exists (background analysis), OR
    // 2. isAnalyzing flag is true (direct analysis), OR
    // 3. loading state is true (immediate feedback)
    const shouldShow = queueDoc || userData?.isAnalyzing || loading;

    if (!shouldShow) return null;

    return (
        <div className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg">
            <div className=" px-4 py-2 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    {/* Animated spinner */}
                    <div className="animate-spin h-3 w-3 border-2 border-white border-t-transparent rounded-full"></div>

                    <div>
                        <p className="font-bold text-sm">🔮 분석 진행 중 <span className="text-xs opacity-90">{statusText}</span></p>

                    </div>
                </div>

                <button
                    onClick={handleCancel}
                    className="flex items-center gap-2 px-2 py-1 bg-white/20 hover:bg-white/30 rounded-lg transition-all text-xs font-medium"
                >
                    <XMarkIcon className="h-3 w-3" />
                    취소
                </button>
            </div>
        </div>
    );
}
