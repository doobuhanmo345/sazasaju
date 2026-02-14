'use client';

import React, { memo } from 'react';
import MyPageMenuButton from '@/ui/MyPageMenuButton';
import {
    ChevronRightIcon,
    UserCircleIcon,
    PresentationChartLineIcon,
    ArrowLeftOnRectangleIcon,
    UserGroupIcon
} from '@heroicons/react/24/outline';

const MenuSection = memo(({ isKo, userData, handleLogout, router }) => {
    const menuItems = [
        { label: isKo ? '내 정보 수정하기' : 'Modify Core Info', exp: isKo ? '이름, 생년월일, 성별 등 기본 정보 수정' : 'Edit basic information', icon: <UserCircleIcon className="text-indigo-500" />, path: '/mypage/profile/edit' },
        { label: isKo ? '프로필 전환' : 'Switch Active Soul', exp: isKo ? '나의 다른 프로필로 전환' : 'Switch to another profile', icon: <PresentationChartLineIcon className="text-purple-500" />, path: '/mypage/manage/' },
        { label: isKo ? '상담 기록 관리' : 'Temporal Logs', exp: isKo ? '과거 상담 기록 확인 및 관리' : 'Check consultation records', icon: <PresentationChartLineIcon className="text-purple-500" />, path: '/mypage/history' },
        { label: isKo ? '관리자 페이지' : 'Root Access', exp: isKo ? '관리자 전용 페이지' : 'Admin-only page', icon: <PresentationChartLineIcon className="text-purple-500" />, path: '/admin', visible: userData?.role === 'admin' || userData?.role === 'super_admin' },
        { label: isKo ? '프롬프트 수정' : 'Oracle Settings', exp: isKo ? '프롬프트 수정 페이지' : 'Prompt editing page', icon: <PresentationChartLineIcon className="text-purple-500" />, path: '/admin/editprompt', visible: userData?.role === 'super_admin' },
        { label: isKo ? '로그아웃' : 'Disconnect Session', exp: isKo ? '로그아웃' : 'Logout', icon: <ArrowLeftOnRectangleIcon className="text-rose-500" />, action: handleLogout },
    ].filter(item => item.visible !== false);

    return (
        <div className="px-10 max-w-lg mx-auto space-y-12">
            <div className="flex flex-col gap-10">
                {menuItems.map((item, idx) => (
                    <MyPageMenuButton key={idx} item={item} />
                ))}
            </div>
        </div>
    );
});

MenuSection.displayName = 'MenuSection';
export default MenuSection;
