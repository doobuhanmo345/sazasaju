'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, where, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { useAuthContext } from '@/contexts/useAuthContext';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useLanguage } from '@/contexts/useLanguageContext';

export default function GlobalPopup() {
    const { user } = useAuthContext();
    const { language } = useLanguage();
    const [popupQueue, setPopupQueue] = useState([]);

    // Derived state: always show the first item in the queue
    const currentPopup = popupQueue.length > 0 ? popupQueue[0] : null;

    useEffect(() => {
        if (!user) {
            return;
        }

        console.log("GlobalPopup: Subscribing for user", user.uid);

        // SIMPLIFIED QUERY TO BYPASS INDEX ERROR
        // We fetch all global_popups for this user and filter/sort in memory
        const q = query(
            collection(db, 'notifications'),
            where('userId', '==', user.uid),
            where('type', '==', 'global_popup')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            if (!snapshot.empty) {
                // Filter and sort in memory
                const unreadPopups = snapshot.docs
                    .map(doc => ({ id: doc.id, ...doc.data() }))
                    .filter(data => data.isRead === false)
                    .sort((a, b) => {
                        const tA = a.createdAt?.seconds || 0;
                        const tB = b.createdAt?.seconds || 0;
                        // Sort by Oldest First (FIFO)
                        return tA - tB;
                    });

                console.log(`GlobalPopup: ${unreadPopups.length} unread popups queued.`);
                setPopupQueue(unreadPopups);
            } else {
                setPopupQueue([]);
            }
        }, (error) => {
            console.error("GlobalPopup Query Error:", error);
        });

        return () => unsubscribe();
    }, [user]);

    const handleDismiss = () => {
        if (!currentPopup) return;
        // Just remove from local queue, do NOT update DB (so it shows again on reload)
        const closingId = currentPopup.id;
        setPopupQueue(prev => prev.filter(p => p.id !== closingId));
    };

    const handleDontShowAgain = async () => {
        if (!currentPopup) return;

        try {
            // Optimistically remove
            const closingId = currentPopup.id;
            setPopupQueue(prev => prev.filter(p => p.id !== closingId));

            // Mark as read in DB
            const docRef = doc(db, 'notifications', closingId);
            await updateDoc(docRef, { isRead: true });
        } catch (error) {
            console.error("Error marking popup as read:", error);
        }
    };

    if (!currentPopup) return null;

    return (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-6">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-white/60 backdrop-blur-sm animate-in fade-in duration-300"
                onClick={handleDismiss}
            />

            {/* Modal Container */}
            <div className="relative w-full max-w-sm bg-white dark:bg-slate-900/80 backdrop-blur-2xl rounded-[2.5rem] shadow-2xl shadow-indigo-500/30 border border-white/20 dark:border-slate-800 overflow-visible transform animate-in zoom-in-95 duration-300">

                {/* Decorative Background Blur Elements inside the modal */}
                <div className="absolute -top-24 -left-24 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

                {/* Leaning Mascot */}
                <div className="absolute -top-[115px] left-1/2 -translate-x-1/2 w-32 h-32 pointer-events-none z-20">
                    <img
                        src="/images/brand/login_saza.png"
                        className="w-full h-full object-contain drop-shadow-xl"
                        alt="Notice"
                    />
                </div>

                {/* Header */}
                <div className="relative p-8 pb-0 pt-16 text-center z-10">
                    <h3 className="text-3xl font-black text-slate-800 dark:text-white mb-2">
                        {currentPopup.title || (language === 'ko' ? '알림' : 'Notice')}
                    </h3>
                    {popupQueue.length > 1 && (
                        <div className="inline-flex items-center gap-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider mb-4">
                            <span>+{popupQueue.length - 1} {language === 'ko' ? '개 더 있음' : 'more'}</span>
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="relative p-8 pt-4 space-y-8 z-10">
                    <div className="text-lg text-slate-500 dark:text-slate-400 text-center leading-relaxed whitespace-pre-wrap font-medium">
                        {currentPopup.message}
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={handleDontShowAgain}
                            className="w-full h-14 bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-slate-100 text-white dark:text-slate-900 rounded-2xl flex items-center justify-center gap-2 font-bold text-sm transition-all active:scale-[0.97] shadow-xl shadow-slate-200/20 dark:shadow-none"
                        >
                            {language === 'ko' ? '다시는 보지 않기' : 'Don\'t show again'}
                        </button>
                        <button
                            onClick={handleDismiss}
                            className="w-full h-12 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-bold text-xs transition-colors"
                        >
                            {language === 'ko' ? '닫기' : 'Close'}
                        </button>
                    </div>
                </div>

                {/* Close X (Top Right) */}
                <button
                    onClick={handleDismiss}
                    className="absolute top-4 right-4 p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-400 z-20"
                >
                    <XMarkIcon className="w-6 h-6" />
                </button>
            </div>
        </div>
    );
}
