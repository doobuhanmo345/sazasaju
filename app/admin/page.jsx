'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { useAuthContext } from '@/contexts/useAuthContext';

export default function AdminDashboardPage() {
  const { user, userData } = useAuthContext();
  const [newCount, setNewCount] = useState(0);
  const [newCredit, setNewCredit] = useState(0);

  // Initialize state with current user data
  useEffect(() => {
    if (userData?.editCount !== undefined) {
      const maxCount = ['admin', 'super_admin'].includes(userData?.role) ? 10 : 3;
      setNewCount(maxCount - userData.editCount);
    }
    if (userData?.credits !== undefined) {
      setNewCredit(userData.credits);
    }
  }, [userData]);

  // Update Edit Count
  const handleUpdateCount = async () => {
    if (!user?.uid) {
      alert("유저 정보를 찾을 수 없습니다.");
      return;
    }
    try {
      const maxCount = ['admin', 'super_admin'].includes(userData?.role) ? 10 : 3;
      // editCount in DB allows 'maxCount - editCount' remaining edits.
      // So if I want 'newCount' remaining, I should set DB to 'maxCount - newCount'.
      // Ex: Want 3 remaining. Max 10. DB should be 7 (used). 10 - 7 = 3 remaining.
      const targetUsedCount = maxCount - Number(newCount);

      console.log(`[Overview] Updating Edit Count for ${user.uid}`);
      console.log(`[Overview] Max: ${maxCount}, Desired Remaining: ${newCount}, Setting Used to: ${targetUsedCount}`);

      const docRef = doc(db, 'users', user.uid);
      await updateDoc(docRef, { editCount: targetUsedCount });

      // Force a reload or wait for context update (Context might be slow)
      alert(`성공! 설정값: ${newCount}회 남음 (DB 저장값: ${targetUsedCount}회 사용)`);
    } catch (error) {
      console.error('[Overview] 수정 실패:', error);
      alert(`수정 실패: ${error.message}`);
    }
  };

  // Update Credits
  const handleUpdateCredit = async () => {
    if (!user?.uid) {
      alert("유저 정보를 찾을 수 없습니다.");
      return;
    }
    try {
      console.log(`[Overview] Updating Credits for ${user.uid} to ${newCredit}`);

      const docRef = doc(db, 'users', user.uid);
      await updateDoc(docRef, { credits: Number(newCredit) });

      alert(`성공! 이제 ${newCredit} 크레딧 보유중입니다.`);
    } catch (error) {
      console.error('[Overview] 크레딧 수정 실패:', error);
      alert(`크레딧 수정 실패: ${error.message}`);
    }
  };

  // Role check handled by layout, but safe to keep for direct component robustness
  if (!user || (userData?.role !== 'admin' && userData?.role !== 'super_admin')) {
    return <div className="p-10 text-center">접근 권한이 없습니다.</div>;
  }

  return (
    <div className="max-w-5xl mx-auto">
      <header className="mb-10 text-center md:text-left">
        <h1 className="text-3xl font-black text-gray-900 dark:text-gray-100 tracking-tight mb-2">
          Dashboard Overview
        </h1>
        <p className="text-gray-500">
          시스템 현황 및 빠른 바로가기
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        {/* Welcome Section */}
        <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 lg:col-span-2 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" /></svg>
          </div>
          <h3 className="text-gray-500 text-sm font-bold uppercase tracking-widest mb-2 relative z-10">Welcome Back</h3>
          <p className="text-3xl font-black text-gray-900 dark:text-white mb-4 relative z-10">{userData?.displayName}님</p>
          <p className="text-sm text-indigo-500 font-bold relative z-10 bg-indigo-50 dark:bg-indigo-900/30 inline-block px-3 py-1 rounded-full">
            Role: {userData?.role}
          </p>
        </div>

        {/* Admin Tools: Self Edit Count */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col justify-center">
          <h3 className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
            My Edit Count
          </h3>
          <div className="flex gap-2">
            <input
              type="number"
              value={newCount}
              onChange={(e) => setNewCount(e.target.value)}
              className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-700 rounded-xl text-lg font-bold text-gray-900 dark:text-gray-100 outline-none focus:ring-2 focus:ring-blue-500 transition-all text-center"
            />
            <button
              onClick={handleUpdateCount}
              className="shrink-0 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all active:scale-95"
            >
              Save
            </button>
          </div>
          <p className="text-xs text-center mt-3 text-gray-400">
            Current: <span className="font-bold text-blue-500">{(['admin', 'super_admin'].includes(userData?.role) ? 10 : 3) - (userData?.editCount || 0)}</span> remaining
          </p>
        </div>

        {/* Admin Tools: Self Credits */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col justify-center">
          <h3 className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            My Credits
          </h3>
          <div className="flex gap-2">
            <input
              type="number"
              value={newCredit}
              onChange={(e) => setNewCredit(e.target.value)}
              className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-700 rounded-xl text-lg font-bold text-gray-900 dark:text-gray-100 outline-none focus:ring-2 focus:ring-emerald-500 transition-all text-center"
            />
            <button
              onClick={handleUpdateCredit}
              className="shrink-0 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition-all active:scale-95"
            >
              Save
            </button>
          </div>
          <p className="text-xs text-center mt-3 text-gray-400">
            Current: <span className="font-bold text-emerald-500">{userData?.credits || 0}</span> credits
          </p>
        </div>

        {/* Placeholders for system stats */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 opacity-60 grayscale lg:col-span-2">
          <h3 className="text-gray-500 text-sm font-medium uppercase tracking-wider mb-1">System Health</h3>
          <p className="text-xl font-bold text-gray-900 dark:text-white">Operational</p>
          <p className="text-xs text-gray-400 mt-2">More metrics coming soon</p>
        </div>
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-3xl p-8 text-center border border-blue-100 dark:border-blue-900/30">
        <p className="text-blue-800 dark:text-blue-100 font-medium text-sm">
          💡 Tip: Use the navigation bar above to access specific management tools.
        </p>
      </div>
    </div>
  );
}
