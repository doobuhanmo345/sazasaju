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
    writeBatch,
    serverTimestamp,
    deleteDoc,
    addDoc,
} from 'firebase/firestore';
import {
    CheckIcon,
    XMarkIcon,
    ArrowLeftIcon
} from '@heroicons/react/24/outline';
import { useAuthContext } from '@/contexts/useAuthContext';

export default function AdminConsultantsPage() {
    const { user, userData } = useAuthContext();
    const [applications, setApplications] = useState([]);
    const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
    const [selectedApp, setSelectedApp] = useState(null);
    const [rejectReason, setRejectReason] = useState('');

    // Load Applications
    useEffect(() => {
        if (!userData || (userData.role !== 'admin' && userData.role !== 'super_admin')) return;

        const q = query(collection(db, 'consultant_applications'), where('status', '==', 'pending'));
        const unsubscribe = onSnapshot(q, (snap) => {
            setApplications(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
        });

        return unsubscribe;
    }, [userData?.uid, userData?.role]);

    const openRejectModal = (app) => {
        setSelectedApp(app);
        setRejectReason('');
        setIsRejectModalOpen(true);
    };

    const handleRejectConfirm = async () => {
        if (!selectedApp) return;
        if (!rejectReason.trim()) {
            alert('거절 사유를 입력해주세요.');
            return;
        }

        try {
            await addDoc(collection(db, 'notifications'), {
                userId: selectedApp.uid,
                title: '전문가 신청 반려 안내',
                message: `명리학자 신청이 반려되었습니다. 사유: ${rejectReason}`,
                type: 'reject',
                isRead: false,
                createdAt: serverTimestamp(),
                targetPath: '/consultant/apply',
            });

            const appRef = doc(db, 'consultant_applications', selectedApp.id);
            await deleteDoc(appRef);

            setApplications((prev) => prev.filter((item) => item.id !== selectedApp.id));
            setIsRejectModalOpen(false);
            setSelectedApp(null);
            setRejectReason('');

            alert('거절 처리와 알림 전송이 완료되었습니다.');
        } catch (error) {
            console.error('거절 처리 중 상세 에러:', error.code, error.message);
            alert(`오류 발생: ${error.message}`);
        }
    };

    const handleApprove = async (app) => {
        if (!confirm(`${app.displayName} 님을 명리학자로 승인하시겠습니까?`)) return;

        const batch = writeBatch(db);
        const appRef = doc(db, 'consultant_applications', app.id);
        const applicantUserRef = doc(db, 'users', app.uid);

        batch.update(appRef, { status: 'approved', reviewedAt: serverTimestamp() });
        batch.update(applicantUserRef, { role: 'saju_consultant', status: 'active' });

        try {
            await batch.commit();
            alert('승인이 완료되었습니다.');
        } catch (error) {
            console.error('승인 처리 실패:', error);
            alert('처리 중 오류가 발생했습니다.');
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
                        Consultant Applications
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">명리학자 신청 승인/거절</p>
                </header>

                <section className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-8">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-6 flex items-center gap-2">
                        <span className="w-1 h-5 bg-purple-500 rounded-full shadow-[0_0_8px_rgba(168,85,247,0.5)]"></span>
                        승인 대기 목록
                    </h3>

                    <div className="space-y-6">
                        {applications.length === 0 ? (
                            <p className="text-center py-10 text-gray-400 italic text-sm border-2 border-dashed border-gray-100 dark:border-gray-800 rounded-3xl">
                                대기 중인 신청 건이 없습니다.
                            </p>
                        ) : (
                            applications.map((app) => (
                                <div key={app.id} className="flex flex-col lg:flex-row items-stretch justify-between p-6 rounded-[2rem] border border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl shadow-gray-100/50 dark:shadow-none gap-6 transition-all hover:border-purple-200 dark:hover:border-purple-900/30">
                                    <div className="flex-grow space-y-5 text-left">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center text-purple-600 dark:text-purple-400 font-black text-xl">
                                                {app.displayName?.charAt(0)}
                                            </div>
                                            <div>
                                                <h4 className="text-lg font-black text-gray-900 dark:text-white leading-tight">{app.displayName}</h4>
                                                <p className="text-sm text-gray-500 font-medium">{app.email}</p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 dark:bg-slate-800/50 p-5 rounded-[1.5rem]">
                                            <div className="space-y-4">
                                                <div>
                                                    <p className="text-xs font-black text-purple-500 uppercase tracking-widest mb-1">소개 및 포부</p>
                                                    <p className="text-sm text-gray-700 dark:text-gray-300 font-medium leading-relaxed italic line-clamp-2">"{app.bio || '등록된 소개가 없습니다.'}"</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs font-black text-purple-500 uppercase tracking-widest mb-1">전문 경력</p>
                                                    <p className="text-sm font-bold text-gray-900 dark:text-gray-100 line-clamp-1">{app.experience || '경력 정보 없음'}</p>
                                                </div>
                                            </div>
                                            <div className="flex flex-col">
                                                <p className="text-xs font-black text-purple-500 uppercase tracking-widest mb-3">상담 방식</p>
                                                <div className="flex flex-wrap gap-2">
                                                    {(app.consultationMethods || []).map((method) => (
                                                        <span key={method} className="px-3 py-1 bg-white dark:bg-slate-900 rounded-full text-sm font-bold text-gray-600 dark:text-gray-400 border border-gray-100 dark:border-slate-700 shadow-sm">
                                                            {method === 'text' && '💬 채팅'}
                                                            {method === 'video' && '📹 화상'}
                                                            {method === 'offline' && '📍 대면'}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-row lg:flex-col items-center justify-center lg:w-40 border-t lg:border-t-0 lg:border-l border-gray-100 dark:border-slate-800 pt-6 lg:pt-0 lg:pl-6 gap-3">
                                        <button onClick={() => handleApprove(app)} className="flex-1 lg:flex-none w-full py-4 lg:py-5 bg-purple-600 hover:bg-purple-700 text-white rounded-2xl font-black text-sm flex flex-col items-center justify-center gap-1 group shadow-lg shadow-purple-200 dark:shadow-none">
                                            <CheckIcon className="w-6 h-6 group-hover:scale-110 transition-transform" />
                                            <span>최종 승인</span>
                                        </button>
                                        <button onClick={() => openRejectModal(app)} className="flex-1 lg:flex-none w-full py-3 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl text-xs font-bold transition-all">
                                            신청 거절
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </section>

                {isRejectModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                        <div className="bg-white dark:bg-slate-900 w-full max-w-xl rounded-[2.5rem] p-8 shadow-2xl animate-in zoom-in-95 duration-200">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-black text-gray-900 dark:text-white">반려 사유 입력</h3>
                                <button onClick={() => setIsRejectModalOpen(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                                    <XMarkIcon className="w-6 h-6 text-gray-400" />
                                </button>
                            </div>
                            <p className="text-sm text-gray-500 mb-4 font-medium">
                                <span className="text-purple-600 font-bold">{selectedApp?.displayName}</span>님께 전달될 메시지를 입력해주세요.
                            </p>
                            <textarea
                                value={rejectReason}
                                onChange={(e) => setRejectReason(e.target.value)}
                                placeholder="예: 실무 경력 증빙이 부족하여 반려되었습니다."
                                className="w-full h-32 p-4 bg-gray-50 dark:bg-slate-800 border-none rounded-2xl text-gray-800 dark:text-white focus:ring-2 focus:ring-purple-500 outline-none transition-all font-medium mb-6 resize-none"
                            />
                            <div className="flex gap-3">
                                <button onClick={() => setIsRejectModalOpen(false)} className="flex-1 py-4 bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300 rounded-2xl font-bold hover:bg-gray-200 transition-all">취소</button>
                                <button onClick={handleRejectConfirm} className="flex-[2] py-4 bg-red-500 hover:bg-red-600 text-white rounded-2xl font-bold shadow-lg shadow-red-100 dark:shadow-none transition-all">거절 확정</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
