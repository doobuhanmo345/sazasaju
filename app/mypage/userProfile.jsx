'use client';

import React from 'react';
import { useAuthContext } from '@/contexts/useAuthContext';
import { useLanguage } from '@/contexts/useLanguageContext';
import { UserCircleIcon, EnvelopeIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { SiGoogle, SiKakaotalk } from 'react-icons/si';

export default function UserProfile() {
    const { userData } = useAuthContext();
    const { language } = useLanguage();
    const isKo = language === 'ko';

    if (!userData) return null;

    const providerId = userData?.providerData?.[0]?.providerId;
    const isKakao = providerId === 'kakao';

    return (
        <div className="space-y-8">
            {/* Account Owner Badge Info - Zero Box Aesthetic */}
            <div className="flex flex-col gap-8">

                {/* Account Identity */}
                <div className="group">
                    <div className="flex items-center gap-3 mb-3">
                        <UserCircleIcon className="w-4 h-4 text-indigo-500 opacity-40 group-hover:opacity-100 transition-opacity" />
                        <span className="text-sm font-black text-slate-500 uppercase tracking-[0.3em]">Account User</span>
                    </div>
                    <div className="flex flex-col gap-2 group-hover:pl-2 transition-all">
                        <h2 className="text-base font-black text-slate-900 dark:text-white tracking-tighter italic">
                            {userData?.displayName || 'User'}
                        </h2>
                        <div className="flex items-center gap-2">
                            {isKakao ? (
                                <SiKakaotalk className="w-3 h-3 text-[#FEE500]" />
                            ) : (
                                <SiGoogle className="w-3 h-3 text-indigo-500" />
                            )}
                            <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
                                {userData?.email || 'Authenticated User'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Membership Status */}
                <div className="group">
                    <div className="flex items-center gap-3 mb-3">
                        <SparklesIcon className="w-4 h-4 text-amber-500 opacity-40 group-hover:opacity-100 transition-opacity" />
                        <span className="text-sm font-black text-slate-500 uppercase tracking-[0.3em]">Access Privilege</span>
                    </div>
                    <h2 className="text-base font-black text-slate-900 dark:text-white tracking-tighter leading-tight italic group-hover:pl-2 transition-all">
                        {userData?.role === 'super_admin' ? (isKo ? '마스터 관리자' : 'Root Master') :
                            userData?.role === 'admin' ? (isKo ? '운영 관리자' : 'System Admin') :
                                (isKo ? '정회원' : 'Official Member')}
                    </h2>
                </div>
            </div>
        </div>
    );
}