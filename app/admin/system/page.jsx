'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import {
    doc,
    updateDoc,
    deleteField,
    onSnapshot,
} from 'firebase/firestore';
import Link from 'next/link';
import {
    TrashIcon,
    ArrowLeftIcon
} from '@heroicons/react/24/outline';
import { useAuthContext } from '@/contexts/useAuthContext';

export default function AdminSystemPage() {
    const { user, userData } = useAuthContext();
    const [maintenanceMode, setMaintenanceMode] = useState(false);
    const [maintenancePeriod, setMaintenancePeriod] = useState('');
    const [maintenanceMessageKo, setMaintenanceMessageKo] = useState('');
    const [maintenanceMessageEn, setMaintenanceMessageEn] = useState('');

    // Maintenance Mode Listener
    useEffect(() => {
        if (!userData || (userData.role !== 'admin' && userData.role !== 'super_admin')) return;
        const unsub = onSnapshot(doc(db, 'settings', 'general'), (doc) => {
            if (doc.exists()) {
                const data = doc.data();
                setMaintenanceMode(data.maintenanceMode || false);
                setMaintenancePeriod(data.maintenancePeriod || '');
                setMaintenanceMessageKo(data.maintenanceMessageKo || '');
                setMaintenanceMessageEn(data.maintenanceMessageEn || '');
            }
        });
        return unsub;
    }, [userData?.uid, userData?.role]);

    const handleToggleMaintenance = async () => {
        const newVal = !maintenanceMode;
        if (!confirm(`시스템 점검 모드를 ${newVal ? '켜시겠습니까?' : '끄시겠습니까?'} \n(켜면 관리자를 제외한 모든 사용자의 접근이 차단됩니다.)`)) return;

        try {
            await import('firebase/firestore').then(({ setDoc, doc }) =>
                setDoc(doc(db, 'settings', 'general'), { maintenanceMode: newVal }, { merge: true })
            );
            alert(`시스템 점검 모드가 ${newVal ? '활성화' : '비활성화'} 되었습니다.`);
        } catch (error) {
            console.error('Failed to toggle maintenance mode:', error);
            alert('설정 변경에 실패했습니다.');
        }
    };

    const handleRemoveField = async (fieldName, label) => {
        const docRef = doc(db, 'users', user.uid);
        const nestedPath = `usageHistory.${fieldName}`;
        if (!confirm(`${label} 데이터를 삭제하시겠습니까?`)) return;

        try {
            await updateDoc(docRef, { [nestedPath]: deleteField() });
            alert(`${label} 데이터가 삭제되었습니다.`);
        } catch (error) {
            console.error(`${label} 삭제 실패:`, error);
            alert('삭제 중 오류가 발생했습니다.');
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
                        System Management
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">시스템 설정 및 데이터 관리</p>
                </header>

                {/* Maintenance Toggle */}
                <section className={`rounded-2xl shadow-sm border p-8 transition-colors ${maintenanceMode ? 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-900/30' : 'bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800'}`}>
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                                <span className={`w-3 h-3 rounded-full ${maintenanceMode ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`}></span>
                                System Maintenance Mode
                            </h3>
                            <p className="text-sm text-gray-500 mt-1">
                                {maintenanceMode
                                    ? '현재 점검 모드가 활성화되어 있습니다.'
                                    : '정상 서비스 중입니다.'}
                            </p>
                        </div>
                        <button
                            onClick={handleToggleMaintenance}
                            className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 ${maintenanceMode ? 'bg-red-600' : 'bg-gray-200 dark:bg-gray-700'}`}
                        >
                            <span className={`${maintenanceMode ? 'translate-x-7' : 'translate-x-1'} inline-block h-6 w-6 transform rounded-full bg-white transition-transform`} />
                        </button>
                    </div>
                    {maintenanceMode && (
                        <div className="mt-6 pt-6 border-t border-red-200 dark:border-red-900/30 space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                                    Maintenance Period (점검 시간)
                                </label>
                                <input
                                    type="text"
                                    placeholder="예: 2026.02.15 20:00 ~ 2026.02.17 08:00"
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-indigo-500"
                                    value={maintenancePeriod || ''}
                                    onChange={(e) => setMaintenancePeriod(e.target.value)}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                                        Message (KR)
                                    </label>
                                    <textarea
                                        rows={3}
                                        placeholder="한국어 점검 메시지"
                                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-indigo-500"
                                        value={maintenanceMessageKo || ''}
                                        onChange={(e) => setMaintenanceMessageKo(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                                        Message (EN)
                                    </label>
                                    <textarea
                                        rows={3}
                                        placeholder="English Maintenance Message"
                                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-indigo-500"
                                        value={maintenanceMessageEn || ''}
                                        onChange={(e) => setMaintenanceMessageEn(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end">
                                <button
                                    onClick={async () => {
                                        try {
                                            // Dynamic import isn't strictly necessary if we import at top, but kept for consistency with original code style if desired.
                                            // However, standard import is better. Using db directly.
                                            const { setDoc } = await import('firebase/firestore');
                                            await setDoc(doc(db, 'settings', 'general'), {
                                                maintenancePeriod,
                                                maintenanceMessageKo,
                                                maintenanceMessageEn
                                            }, { merge: true });
                                            alert('점검 설정이 저장되었습니다.');
                                        } catch (error) {
                                            console.error('Save failed:', error);
                                            alert('저장 실패');
                                        }
                                    }}
                                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors"
                                >
                                    Save Settings
                                </button>
                            </div>
                        </div>
                    )}
                </section>

                {/* Data Management */}
                <section className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-8">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
                        <span className="w-1 h-5 bg-red-500 rounded-full shadow-[0_0_8px_rgba(239,68,68,0.5)]"></span>
                        분석 캐시 데이터 관리 (내 계정)
                    </h3>
                    <div className="grid gap-4">
                        {[
                            { key: 'ZApiAnalysis', label: '기본 사주 분석', color: 'text-blue-500' },
                            { key: 'ZLastDaily', label: '일일 운세 결과', color: 'text-amber-500' },
                            { key: 'ZNewYear', label: '신년 운세 결과', color: 'text-rose-500' },
                            { key: 'ZCookie', label: '포춘 쿠키', color: 'text-emerald-500' },
                        ].map((item) => {
                            const hasData = !!userData?.usageHistory?.[item.key];

                            return (
                                <div key={item.key} className={`flex items-center justify-between p-4 rounded-2xl border transition-all duration-300 ${hasData ? 'bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700' : 'bg-gray-50 dark:bg-slate-900/50 border-gray-100 dark:border-slate-800 opacity-60'}`}>
                                    <div className="flex items-center gap-3">
                                        <div className={`relative flex h-3 w-3`}>
                                            {hasData && <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${item.color.replace('text', 'bg')} opacity-75`}></span>}
                                            <span className={`relative inline-flex rounded-full h-3 w-3 ${hasData ? item.color.replace('text', 'bg') : 'bg-gray-300 dark:bg-gray-700'}`}></span>
                                        </div>
                                        <div>
                                            <p className={`text-sm font-bold ${hasData ? 'text-gray-900 dark:text-white' : 'text-gray-400'}`}>{item.label}</p>
                                            <p className="text-xs text-gray-400 font-medium">{hasData ? '데이터 저장됨' : '비어있음'}</p>
                                        </div>
                                    </div>
                                    <button onClick={() => handleRemoveField(item.key, item.label)} disabled={!hasData} className={`p-3 rounded-xl transition-all ${hasData ? 'bg-red-50 dark:bg-red-900/20 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/40 shadow-sm' : 'bg-gray-100 dark:bg-slate-800 text-gray-300 cursor-not-allowed'}`}>
                                        <TrashIcon className={`w-5 h-5 ${hasData ? 'animate-pulse-slow' : ''}`} />
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                </section>
            </div>
        </div>
    );
}
