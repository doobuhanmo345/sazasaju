'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
    ChevronRightIcon,
    CalendarDaysIcon,
    SparklesIcon,
    UserCircleIcon,
    PresentationChartLineIcon,
    EnvelopeIcon,
    QuestionMarkCircleIcon,
    CircleStackIcon,
    ArrowRightOnRectangleIcon,
    ArrowLeftIcon,
    UserGroupIcon,
    ArrowPathIcon
} from '@heroicons/react/24/outline';
import { SiGoogle, SiKakaotalk } from 'react-icons/si';
import BackButton from '@/ui/BackButton';
import { useAuthContext } from '@/contexts/useAuthContext';
import { useLanguage } from '@/contexts/useLanguageContext';
import MyCredit from './MyCredit';
import SelectedProfile from './SelectedProfile';
import UserProfile from './userProfile';

export default function MyProfileClient() {
    const router = useRouter();
    const { user, userData, iljuImagePath, selectedProfile, logout, selectProfile } = useAuthContext();
    const { language } = useLanguage();
    const isKo = language === 'ko';

    if (!user) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
                <div className="w-20 h-20 bg-white rounded-3xl shadow-sm flex items-center justify-center mb-6">
                    <UserCircleIcon className="w-10 h-10 text-slate-300" />
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
    console.log(selectedProfile)
    const handleLogout = async () => {
        if (confirm(isKo ? '로그아웃 하시겠습니까?' : 'Are you sure you want to log out?')) {
            await logout();
            router.push('/');
        }
    };

    return (
        <div className="min-h-screen bg-white dark:bg-slate-950 pb-24 overflow-x-hidden selection:bg-indigo-100 dark:selection:bg-indigo-900/40">
            {/* Zero-Box Hero Section - Fluid Content Identity */}
            <div className="relative pt-24 pb-9 px-8">
                {/* Massive ephemeral blu rs providing structure without borders */}
                <div className="absolute top-[-10%] right-[-10%] w-[120%] h-[120%] bg-white dark:bg-slate-950 -z-10" />
                <div className="absolute top-0 right-0 -mr-40 -mt-20 w-[800px] h-[800px] bg-indigo-500/[0.04] dark:bg-indigo-500/[0.08] rounded-full blur-[160px] pointer-events-none" />
                <div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] bg-purple-500/[0.04] dark:bg-purple-500/[0.08] rounded-full blur-[160px] pointer-events-none" />

                <BackButton />

                <div className="relative z-10 max-w-lg mx-auto flex flex-col items-center">
                    {/* Floating Avatar - Pure visual, no container box */}
                    <div className="relative">
                        <div className="absolute inset-[-30%] bg-indigo-500/[0.08] dark:bg-indigo-500/[0.12] rounded-full blur-3xl" />
                        <div className="absolute inset-[-80%] bg-indigo-500/[0.08] dark:bg-indigo-500/[0.12] rounded-full blur-3xl" />
                        <div className="absolute bottom-[150px] right-[100px] w-80 h-80 bg-indigo-500/10 dark:bg-indigo-500/20 rounded-full blur-[80px]" />
                        <div className="absolute bottom-[150px] left-[100px] w-80 h-80 bg-purple-500/10 dark:bg-purple-500/20 rounded-full blur-[80px]" />
                        <div className="relative w-32 h-32 sm:w-40 sm:h-40 flex items-center justify-center">
                            {/* Simple Text Identity Badge - Top Center */}
                            <div className="absolute -top-6 left-1/2 -translate-x-1/2 z-30 whitespace-nowrap text-center">
                                <span className={`text-[11px] font-black uppercase tracking-[0.4em] ${selectedProfile?.uid !== userData?.uid ? 'text-purple-500' : 'text-indigo-500'}`}>
                                    {selectedProfile?.uid !== userData?.uid ? (selectedProfile?.relationship || (isKo ? '다른 인연' : 'Connection')) : (isKo ? 'Me' : 'Me')}
                                </span>
                            </div>

                            <Image
                                src={iljuImagePath}
                                alt="Profile"
                                fill
                                className="object-contain drop-shadow-[0_24px_48px_rgba(79,70,229,0.1)] transition-all duration-500"
                            />
                            {/* Profile Switch Button - Bottom Right */}
                            <button
                                onClick={() => {
                                    if (selectedProfile?.uid !== userData?.uid) {
                                        selectProfile(userData);
                                    } else {
                                        router.push('/mypage/manage');
                                    }
                                }}
                                className="absolute bottom-1 right-1 w-9 h-9 bg-white dark:bg-slate-900 rounded-full shadow-md border border-slate-100 dark:border-slate-800 flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:scale-110 active:scale-95 transition-all z-20"
                                aria-label="Switch Profile"
                            >
                                <ArrowPathIcon className="w-5 h-5 stroke-[2]" />
                            </button>
                        </div>
                    </div>

                    <div className="text-center w-full">
                        <div className="flex items-center justify-center gap-2 mb-6">
                            {selectedProfile?.uid === userData?.uid && (
                                <div className="flex items-center gap-2 opacity-40">
                                    {userData?.providerData?.some(data => data.providerId === 'kakao') ? (
                                        <SiKakaotalk className="w-2.5 h-2.5 text-[#FEE500]" />
                                    ) : (
                                        <SiGoogle className="w-2.5 h-2.5 text-indigo-500" />
                                    )}
                                    <span className="text-[10px] font-black text-slate-500 dark:text-slate-500 uppercase tracking-[0.3em]">
                                        Verified Member
                                    </span>
                                </div>
                            )}
                        </div>

                        <h1 className="text-5xl sm:text-6xl font-black text-slate-900 dark:text-white tracking-tighter leading-[0.8] mb-8">
                            {selectedProfile?.displayName || userData?.displayName || 'User'}
                            <span className="text-indigo-600 animate-pulse">.</span>
                        </h1>
                        <SelectedProfile />

                        <MyCredit />
                    </div>

                    {/* Quick Access Icons - Pure Glyphs, Spaced with Whitespace */}
                    <div className="grid grid-cols-4 gap-8 w-full pt-9 pb-6">
                        {[
                            { label: isKo ? '분석 기록' : 'History', icon: <PresentationChartLineIcon />, path: '/mypage/history', color: 'text-rose-500' },
                            { label: isKo ? '메시지' : 'Messages', icon: <EnvelopeIcon />, path: '/messages', color: 'text-slate-500' },
                            { label: isKo ? '도움말' : 'Guide', icon: <QuestionMarkCircleIcon />, path: '/tutorial', color: 'text-sky-500' },
                            { label: isKo ? '크레딧 충전' : 'Credit', icon: <CircleStackIcon />, path: '/credit', color: 'text-indigo-500' },
                        ].map((item, idx) => (
                            <button
                                key={idx}
                                onClick={() => router.push(item.path)}
                                className="relative flex flex-col items-center gap-4 p-4 rounded-3xl bg-white/40 dark:bg-slate-900/40 border border-white/60 dark:border-white/[0.03] shadow-[0_8px_32px_rgba(0,0,0,0.04)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.2)] backdrop-blur-md hover:scale-105 active:scale-95 transition-all duration-300 group overflow-hidden"
                            >
                                {/* Subtle inner glow effect */}
                                <div className={`absolute inset-0 bg-gradient-to-br ${item.color.replace('text-', 'from-')}/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

                                <div className={`w-9 h-9 ${item.color} group-hover:scale-110 transition-all duration-500 drop-shadow-[0_0_15px_rgba(79,70,229,0.15)] relative z-10`}>
                                    {React.cloneElement(item.icon, { className: 'w-full h-full stroke-[1.2]' })}
                                </div>
                                <span className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest group-hover:text-slate-900 dark:group-hover:text-white transition-colors relative z-10">
                                    {item.label}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Main Content Body - Zero Borders, Zero Cards */}
            <div className="px-10 max-w-lg mx-auto space-y-12">

                {/* Profile Link - Zero Box Typography CTA */}

                {/* Menu Rows - Pure Open Lists */}
                <div className="pt-0">
                    {/* <span className="text-xs font-black text-slate-300 dark:text-slate-700 uppercase tracking-[0.4em] block text-center sm:text-left">Menu</span> */}

                    <div className="flex flex-col gap-10">
                        {[
                            { label: isKo ? '내 정보 수정하기' : 'Modify Core Info', exp: '이름, 생년월일, 성별 등 기본 정보 수정', icon: <UserCircleIcon className="text-indigo-500" />, path: 'mypage/profile/edit' },
                            { label: isKo ? '프로필 전환' : 'Switch Active Soul', exp: '나의 다른 프로필로 전환', icon: <PresentationChartLineIcon className="text-purple-500" />, path: 'mypage/manage/' },
                            { label: isKo ? '상담 기록 관리' : 'Temporal Logs', exp: '과거 상담 기록 확인 및 관리', icon: <PresentationChartLineIcon className="text-purple-500" />, path: 'mypage/history' },
                            { label: isKo ? '관리자 페이지' : 'Root Access', exp: '관리자 전용 페이지', icon: <PresentationChartLineIcon className="text-purple-500" />, path: '/admin', visible: userData?.role === 'admin' || 'super_admin' },
                            { label: isKo ? '프롬프트 수정' : 'Oracle Settings', exp: '프롬프트 수정 페이지', icon: <PresentationChartLineIcon className="text-purple-500" />, path: '/admin/editprompt', visible: userData?.role === 'super_admin' },
                            { label: isKo ? '로그아웃' : 'Disconnect Session', exp: '로그아웃', icon: <ArrowRightOnRectangleIcon className="text-rose-500" />, action: handleLogout },
                        ].filter(item => item.visible !== false).map((item, idx) => (

                            <button
                                key={idx}
                                onClick={() => router.push(item.path)}
                                className="group flex flex-col items-start gap-6"
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
            </div>
        </div>
    );
}
