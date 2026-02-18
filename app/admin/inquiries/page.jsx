'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import {
    doc,
    collection,
    onSnapshot,
    query,
    where,
    getDocs,
    writeBatch,
    updateDoc,
} from 'firebase/firestore';
import {
    CheckIcon,
    ArrowLeftIcon
} from '@heroicons/react/24/outline';
import { useAuthContext } from '@/contexts/useAuthContext';
import MessageModal from '@/app/messages/MessageModal';

export default function AdminInquiriesPage() {
    const { user, userData } = useAuthContext();
    const [messages, setMessages] = useState([]);
    const [adminPage, setAdminPage] = useState(1);
    const itemsPerPage = 10;
    const [isReplyModalOpen, setIsReplyModalOpen] = useState(false);
    const [selectedUserForReply, setSelectedUserForReply] = useState(null);
    const [selectedMsgId, setSelectedMsgId] = useState(null);
    const [showProcessed, setShowProcessed] = useState(false);

    // Load Messages
    useEffect(() => {
        if (!userData || (userData.role !== 'admin' && userData.role !== 'super_admin')) return;

        const q = query(collection(db, 'direct_messages'), where('receiverId', '==', 'admin'));
        const unsubscribe = onSnapshot(q, (snap) => {
            setMessages(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })).sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)));
        }, (error) => {
            console.error('Error loading admin inquiries:', error);
        });

        return unsubscribe;
    }, [userData?.uid, userData?.role]);

    const openReplyModal = (msg) => {
        setSelectedUserForReply({
            uid: msg.senderId,
            displayName: msg.senderName
        });
        setSelectedMsgId(msg.id);
        setIsReplyModalOpen(true);
    };

    const handleMarkProcessed = async (msgId, status = true) => {
        try {
            await updateDoc(doc(db, 'direct_messages', msgId), { isProcessed: status });

            if (status) {
                const q_notif = query(collection(db, 'notifications'), where('sourceMessageId', '==', msgId));
                const snap = await getDocs(q_notif);
                if (!snap.empty) {
                    const batch = writeBatch(db);
                    snap.docs.forEach(d => batch.delete(d.ref));
                    await batch.commit();
                }
            }
        } catch (err) {
            console.error(err);
            alert('Failed to update status');
        }
    };

    if (!user || (userData?.role !== 'admin' && userData?.role !== 'super_admin')) {
        return <div className="p-10 text-center">접근 권한이 없습니다.</div>;
    }

    return (
        <div className="bg-gray-50 dark:bg-gray-900 transition-colors duration-300 max-w-xl m-auto min-h-screen">
            <div className="max-w-xl mx-auto space-y-8 p-4">
                <header className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-8">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">
                        Inquiry Board
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">사용자 문의 관리</p>
                </header>

                <section className="bg-white dark:bg-gray-900 rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
                    <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/20">
                        <h3 className="text-sm font-black text-gray-800 dark:text-gray-200 flex items-center gap-2 uppercase tracking-tighter">
                            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></span>
                            Inquiry Board
                        </h3>
                        <div className="flex items-center gap-3">
                            <span className="text-xs font-black text-slate-400 uppercase tracking-widest">{showProcessed ? 'Viewing All' : 'Active Only'}</span>
                            <button
                                onClick={() => setShowProcessed(!showProcessed)}
                                className={`relative w-9 h-5 rounded-full transition-all duration-300 ${showProcessed ? 'bg-blue-600' : 'bg-slate-200 dark:bg-slate-700'}`}
                            >
                                <div className={`absolute top-1 w-3 h-3 bg-white rounded-full shadow-sm transition-transform duration-300 ${showProcessed ? 'translate-x-5' : 'translate-x-1'}`}></div>
                            </button>
                        </div>
                    </div>

                    <div className="divide-y divide-gray-50 dark:divide-slate-800/50">
                        {(() => {
                            const filtered = messages.filter(m => showProcessed || !m.isProcessed);
                            const totalPages = Math.ceil(filtered.length / itemsPerPage);
                            const currentItems = filtered.slice((adminPage - 1) * itemsPerPage, adminPage * itemsPerPage);

                            if (filtered.length === 0) {
                                return (
                                    <div className="py-16 text-center text-slate-400">
                                        <p className="text-sm font-bold uppercase tracking-widest">No inquiries found in this view</p>
                                    </div>
                                );
                            }

                            return (
                                <>
                                    {currentItems.map((msg) => (
                                        <div
                                            key={msg.id}
                                            className={`group px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors ${msg.isProcessed
                                                ? 'bg-slate-50/30 dark:bg-slate-900/10'
                                                : 'hover:bg-blue-50/30 dark:hover:bg-blue-900/5'
                                                }`}
                                        >
                                            <div className="flex-grow min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className={`w-1.5 h-1.5 rounded-full ${msg.isProcessed ? 'bg-slate-300' : 'bg-blue-500'}`}></span>
                                                    <span className="text-xs font-black text-slate-900 dark:text-white uppercase truncate max-w-[120px]">
                                                        {msg.senderName}
                                                    </span>
                                                    <span className="text-xs font-bold text-slate-400 dark:text-slate-600">
                                                        {msg.createdAt ? new Date(msg.createdAt.seconds * 1000).toLocaleDateString() : 'Pending'}
                                                    </span>
                                                </div>
                                                <p className={`text-xs font-medium leading-normal truncate group-hover:whitespace-normal ${msg.isProcessed ? 'text-slate-400 italic line-through decoration-slate-300' : 'text-slate-600 dark:text-slate-400'}`}>
                                                    {msg.text}
                                                </p>
                                            </div>

                                            <div className="flex items-center gap-2 shrink-0">
                                                {!msg.isProcessed ? (
                                                    <>
                                                        <button
                                                            onClick={() => openReplyModal(msg)}
                                                            className="px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl text-xs font-black uppercase tracking-widest hover:scale-105 transition-all shadow-md"
                                                        >
                                                            Reply
                                                        </button>
                                                        <button
                                                            onClick={() => handleMarkProcessed(msg.id, true)}
                                                            className="p-2 text-slate-300 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-xl transition-all"
                                                            title="Mark as Done"
                                                        >
                                                            <CheckIcon className="w-5 h-5" />
                                                        </button>
                                                    </>
                                                ) : (
                                                    <button
                                                        onClick={() => handleMarkProcessed(msg.id, false)}
                                                        className="px-3 py-1.5 text-xs font-black text-slate-400 hover:text-blue-600 uppercase tracking-widest bg-slate-100 dark:bg-slate-800 rounded-lg transition-all"
                                                    >
                                                        Cancel / Restore
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))}

                                    {/* Pagination */}
                                    {totalPages > 1 && (
                                        <div className="p-4 bg-slate-50/50 dark:bg-slate-800/20 flex justify-center items-center gap-2">
                                            <button
                                                onClick={() => setAdminPage(p => Math.max(1, p - 1))}
                                                disabled={adminPage === 1}
                                                className="px-3 py-1 text-xs font-black text-slate-400 hover:text-blue-600 disabled:opacity-30 uppercase tracking-widest"
                                            >
                                                Prev
                                            </button>
                                            <div className="flex gap-1">
                                                {[...Array(totalPages)].map((_, i) => (
                                                    <button
                                                        key={i}
                                                        onClick={() => setAdminPage(i + 1)}
                                                        className={`w-6 h-6 rounded-lg text-xs font-black transition-all ${adminPage === i + 1
                                                            ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30'
                                                            : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                                                            }`}
                                                    >
                                                        {i + 1}
                                                    </button>
                                                ))}
                                            </div>
                                            <button
                                                onClick={() => setAdminPage(p => Math.min(totalPages, p + 1))}
                                                disabled={adminPage === totalPages}
                                                className="px-3 py-1 text-xs font-black text-slate-400 hover:text-blue-600 disabled:opacity-30 uppercase tracking-widest"
                                            >
                                                Next
                                            </button>
                                        </div>
                                    )}
                                </>
                            );
                        })()}
                    </div>
                </section>

                <MessageModal
                    isOpen={isReplyModalOpen}
                    onClose={() => setIsReplyModalOpen(false)}
                    receiverId={selectedUserForReply?.uid}
                    receiverName={selectedUserForReply?.displayName}
                    originalMessageId={selectedMsgId}
                />
            </div>
        </div>
    );
}
