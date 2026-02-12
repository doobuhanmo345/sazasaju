'use client';

import React, { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthContext } from '@/contexts/useAuthContext';
import { useLanguage } from '@/contexts/useLanguageContext';
import MyCredit from './MyCredit';
import SelectedProfile from './SelectedProfile';
import UserProfile from './userProfile';

// Sub-components for performance optimization
import MyProfileHero from './components/MyProfileHero';
import QuickAccess from './components/QuickAccess';
import MenuSection from './components/MenuSection';

export default function MyProfileClient() {
    const router = useRouter();
    const { user, userData, iljuImagePath, selectedProfile, logout, selectProfile } = useAuthContext();
    const { language } = useLanguage();
    const isKo = language === 'ko';

    const handleLogout = useCallback(async () => {
        if (confirm(isKo ? '로그아웃 하시겠습니까?' : 'Are you sure you want to log out?')) {
            await logout();
            router.push('/');
        }
    }, [logout, router, isKo]);

    if (!user) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
                <div className="w-20 h-20 bg-white rounded-3xl shadow-sm flex items-center justify-center mb-6">
                    <span className="text-4xl">👤</span>
                </div>
                <h2 className="text-xl font-black text-slate-900 mb-2">로그인이 필요합니다</h2>
                <p className="text-slate-500 mb-8">마이페이지를 이용하시려면 로그인을 해주세요.</p>
                <button
                    onClick={() => router.push('/')}
                    className="w-full max-w-xs py-4 bg-indigo-600 text-white rounded-2xl font-black shadow-lg shadow-indigo-500/20"
                >
                    홈으로 가기
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white dark:bg-slate-950 pb-24 overflow-x-hidden selection:bg-indigo-100 dark:selection:bg-indigo-900/40">

            <MyProfileHero
                iljuImagePath={iljuImagePath}
                selectedProfile={selectedProfile}
                userData={userData}
                isKo={isKo}
                selectProfile={selectProfile}
                router={router}
            />

            <div className="relative z-10 max-w-lg mx-auto flex flex-col items-center px-8 -mt-8">
                <SelectedProfile />
                <MyCredit />
                <QuickAccess isKo={isKo} router={router} />
            </div>

            <div className="mt-12">
                <MenuSection
                    isKo={isKo}
                    userData={userData}
                    handleLogout={handleLogout}
                    router={router}
                />
            </div>

            <div className="px-10 max-w-lg mx-auto mt-20 opacity-20">
                <UserProfile />
            </div>
        </div>
    );
}
