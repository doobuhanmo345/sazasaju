'use client';

import React, { memo } from 'react';
import {
    ChevronRightIcon,
    UserCircleIcon,
    PresentationChartLineIcon,
    ArrowRightOnRectangleIcon,
    UserGroupIcon
} from '@heroicons/react/24/outline';

const MenuSection = memo(({ isKo, userData, handleLogout, router }) => {
    const menuItems = [
        { label: isKo ? '내 정보 수정하기' : 'Modify Core Info', exp: '이름, 생년월일, 성별 등 기본 정보 수정', icon: <UserCircleIcon className="text-indigo-500" />, path: '/mypage/profile/edit' },
        { label: isKo ? '프로필 전환' : 'Switch Active Soul', exp: '나의 다른 프로필로 전환', icon: <PresentationChartLineIcon className="text-purple-500" />, path: '/mypage/manage/' },
        { label: isKo ? '상담 기록 관리' : 'Temporal Logs', exp: '과거 상담 기록 확인 및 관리', icon: <PresentationChartLineIcon className="text-purple-500" />, path: '/mypage/history' },
        { label: isKo ? '관리자 페이지' : 'Root Access', exp: '관리자 전용 페이지', icon: <PresentationChartLineIcon className="text-purple-500" />, path: '/admin', visible: userData?.role === 'admin' || userData?.role === 'super_admin' },
        { label: isKo ? '프롬프트 수정' : 'Oracle Settings', exp: '프롬프트 수정 페이지', icon: <PresentationChartLineIcon className="text-purple-500" />, path: '/admin/editprompt', visible: userData?.role === 'super_admin' },
        { label: isKo ? '로그아웃' : 'Disconnect Session', exp: '로그아웃', icon: <ArrowRightOnRectangleIcon className="text-rose-500" />, action: handleLogout },
    ].filter(item => item.visible !== false);

    return (
        <div className="px-10 max-w-lg mx-auto space-y-12">
            <div className="flex flex-col gap-10">
                {menuItems.map((item, idx) => (
                    <button
                        key={idx}
                        onClick={item.action || (() => router.push(item.path))}
                        className="group flex flex-col items-start gap-6 transform-gpu"
                    >
                        <div className="flex items-center gap-3">
                            <UserGroupIcon className="w-5 h-5 text-indigo-600 opacity-40 group-hover:opacity-100" />
                            <span className="text-xs font-black text-slate-400 dark:text-slate-600 uppercase tracking-[0.3em]">{item.exp}</span>
                        </div>
                        <div className="flex items-end gap-3">
                            <span className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter group-hover:text-indigo-600 transition-colors">
                                {item.label}
                            </span>
                            <ChevronRightIcon className="w-8 h-8 text-indigo-600 mb-1 group-hover:translate-x-3 transition-transform" />
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
});

MenuSection.displayName = 'MenuSection';
export default MenuSection;
