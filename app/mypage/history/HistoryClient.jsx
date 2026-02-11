'use client';

import React, { useMemo, useState } from 'react';
import { useAuthContext } from '@/contexts/useAuthContext';
import { useLanguage } from '@/contexts/useLanguageContext';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { doc, updateDoc, deleteField } from 'firebase/firestore';
import {
    ChevronLeftIcon,
    PresentationChartLineIcon,
    SparklesIcon,
    CalendarDaysIcon,
    IdentificationIcon,
    CircleStackIcon,
    ChatBubbleLeftRightIcon,
    ChevronRightIcon,
    TrashIcon,
    BriefcaseIcon,
    HeartIcon,
    ArrowPathIcon,
    ClockIcon,
    UserGroupIcon,
    ShieldExclamationIcon,
    MagnifyingGlassIcon,
    UserMinusIcon,
    ArrowLeftIcon
} from '@heroicons/react/24/outline';
import BackButton from '@/ui/BackButton';

const TYPE_CONFIG = {
    // 전통 사주
    ZApiAnalysis: {
        label_ko: '기본 사주 분석', label_en: 'Saju Analysis',
        icon: IdentificationIcon, color: 'text-indigo-500', bg: 'bg-indigo-50', path: '/saju/basic/result',
        category: 'saju'
    },
    ZLastDaily: {
        label_ko: '오늘의 운세', label_en: 'Daily Luck',
        icon: CalendarDaysIcon, color: 'text-emerald-500', bg: 'bg-emerald-50', path: '/saju/todaysluck/result',
        category: 'saju'
    },
    ZNewYear: {
        label_ko: '신년 운세', label_en: '2026 Fortune',
        icon: SparklesIcon, color: 'text-amber-500', bg: 'bg-amber-50', path: '/saju/2026luck/result',
        category: 'saju'
    },
    ZMatchAnalysis: {
        label_ko: '궁합 분석', label_en: 'Match Analysis',
        icon: UserGroupIcon, color: 'text-rose-500', bg: 'bg-rose-50', path: '/saju/match/result',
        category: 'saju'
    },
    ZCookie: {
        label_ko: '포춘쿠키', label_en: 'Fortune Cookie',
        icon: CircleStackIcon, color: 'text-rose-500', bg: 'bg-rose-50', path: '/fortunecookie',
        category: 'others'
    },

    // 재물운 상세
    ZWealthCapacity: {
        label_ko: '평생 재물운', label_en: 'Lifetime Wealth',
        icon: CircleStackIcon, color: 'text-indigo-500', bg: 'bg-indigo-50', path: '/saju/wealth/capacity/result',
        category: 'saju'
    },
    ZWealthTiming: {
        label_ko: '올해/내년 재물운', label_en: 'Yearly Wealth Flow',
        icon: CalendarDaysIcon, color: 'text-indigo-500', bg: 'bg-indigo-50', path: '/saju/wealth/timing/result',
        category: 'saju'
    },
    ZWealthInvestment: {
        label_ko: '투자 / 재테크운', label_en: 'Investment Luck',
        icon: PresentationChartLineIcon, color: 'text-emerald-500', bg: 'bg-emerald-50', path: '/saju/wealth/investment/result',
        category: 'saju'
    },
    ZWealthBusiness: {
        label_ko: '사업 / 창업운', label_en: 'Business Luck',
        icon: BriefcaseIcon, color: 'text-slate-600', bg: 'bg-slate-50', path: '/saju/wealth/business/result',
        category: 'saju'
    },

    // 애정운 상세
    ZLoveLifetime: {
        label_ko: '평생애정운', label_en: 'Lifetime Love',
        icon: HeartIcon, color: 'text-rose-500', bg: 'bg-rose-50', path: '/saju/love/lifetime/result',
        category: 'saju'
    },
    ZLoveMonthly: {
        label_ko: '월별 애정운', label_en: 'Monthly Love',
        icon: CalendarDaysIcon, color: 'text-rose-500', bg: 'bg-rose-50', path: '/saju/love/monthly/result',
        category: 'saju'
    },
    ZLoveReunion: {
        label_ko: '재회운', label_en: 'Reunion Luck',
        icon: ArrowPathIcon, color: 'text-indigo-500', bg: 'bg-indigo-50', path: '/saju/love/reunion/result',
        category: 'saju'
    },
    ZLoveTiming: {
        label_ko: '인연 타이밍', label_en: 'Love Timing',
        icon: ClockIcon, color: 'text-amber-500', bg: 'bg-amber-50', path: '/saju/love/timing/result',
        category: 'saju'
    },
    ZLoveCompatible: {
        label_ko: '나와 잘 맞는 사람', label_en: 'Good Match',
        icon: UserGroupIcon, color: 'text-emerald-500', bg: 'bg-emerald-50', path: '/saju/love/compatible/result',
        category: 'saju'
    },
    ZLoveAvoid: {
        label_ko: '피해야 할 사람', label_en: 'Avoid',
        icon: ShieldExclamationIcon, color: 'text-rose-600', bg: 'bg-rose-50', path: '/saju/love/avoid/result',
        category: 'saju'
    },
    ZLoveFeelings: {
        label_ko: '상대방의 속마음', label_en: 'Partner Feelings',
        icon: MagnifyingGlassIcon, color: 'text-indigo-600', bg: 'bg-indigo-50', path: '/saju/love/feelings/result',
        category: 'saju'
    },

    // 이벤트
    ZInterview: {
        label_ko: '인터뷰 / 면접운', label_en: 'Interview Luck',
        icon: IdentificationIcon, color: 'text-indigo-500', bg: 'bg-indigo-50', path: '/saju/interview/result',
        category: 'saju'
    },
    ZDate: {
        label_ko: '데이트운', label_en: 'Date Luck',
        icon: HeartIcon, color: 'text-rose-500', bg: 'bg-rose-50', path: '/saju/date/result',
        category: 'saju'
    },
    ZSelDate: {
        label_ko: '길일 선정', label_en: 'Select Day',
        icon: CalendarDaysIcon, color: 'text-indigo-500', bg: 'bg-indigo-50', path: '/saju/seldate/result',
        category: 'saju'
    },
    ZSelBirth: {
        label_ko: '출산 택일', label_en: 'Childbirth Selection',
        icon: UserMinusIcon, color: 'text-indigo-400', bg: 'bg-indigo-50', path: '/saju/selbirth/result',
        category: 'saju'
    },

    // 타로
    ZTarotDaily: {
        label_ko: '타로 오늘의 운세', label_en: 'Tarot Daily',
        icon: CalendarDaysIcon, color: 'text-indigo-500', bg: 'bg-indigo-50', path: '/tarot/tarotdaily/result',
        category: 'tarot'
    },
    ZTarotLove: {
        label_ko: '타로 연애운', label_en: 'Tarot Love',
        icon: SparklesIcon, color: 'text-rose-500', bg: 'bg-rose-50', path: '/tarot/tarotlove/result',
        category: 'tarot'
    },
    ZTarotMoney: {
        label_ko: '타로 금전운', label_en: 'Tarot Wealth',
        icon: CircleStackIcon, color: 'text-emerald-500', bg: 'bg-emerald-50', path: '/tarot/tarotmoney/result',
        category: 'tarot'
    },
    ZTarotCounseling: {
        label_ko: '타로 고민상담', label_en: 'Tarot Counseling',
        icon: PresentationChartLineIcon, color: 'text-purple-500', bg: 'bg-purple-50', path: '/tarot/tarotcounseling/result',
        category: 'tarot'
    },
    ZSazaTalk: {
        label_ko: '사자톡 상담', label_en: 'SazaTalk Consulting',
        icon: ChatBubbleLeftRightIcon, color: 'text-violet-500', bg: 'bg-violet-50', path: '/saju/sazatalk/result',
        category: 'saju'
    }
};

export default function HistoryClient() {
    const { user, userData, loadingUser } = useAuthContext();
    const { language } = useLanguage();
    const router = useRouter();
    const isKo = language === 'ko';

    const categories = [
        { id: 'saju', label: isKo ? '사주' : 'Saju' },
        { id: 'tarot', label: isKo ? '타로' : 'Tarot' },
        { id: 'others', label: isKo ? '기타' : 'Others' },
    ];

    const allHistoryItems = useMemo(() => {
        if (!userData?.usageHistory) return [];

        const items = [];
        const hist = userData.usageHistory;

        Object.keys(hist).forEach(key => {
            const data = hist[key];
            if (!data) return;

            const standardKey = Object.keys(TYPE_CONFIG).find(k => k.toLowerCase() === key.toLowerCase());

            let config;
            if (standardKey) {
                config = TYPE_CONFIG[standardKey];
            } else if (key.toLowerCase().startsWith('tarot')) {
                // Dynamic Tarot categorization
                config = {
                    label_ko: '타로 상담', label_en: 'Tarot Consultation',
                    icon: SparklesIcon, color: 'text-rose-500', bg: 'bg-rose-50', path: '/tarot',
                    category: 'tarot'
                };
            } else {
                return;
            }

            const timestamp = data.updatedAt || data.timestamp || data.date || data.today;

            items.push({
                id: key,
                type: standardKey || key,
                label: isKo ? config.label_ko : config.label_en,
                icon: config.icon,
                color: config.color,
                bg: config.bg,
                path: config.path,
                title: data.question || data.purpose || data.q1 || '',
                timestamp: timestamp ? new Date(timestamp) : new Date(0),
                displayDate: timestamp ? new Date(timestamp).toLocaleDateString(language, { year: 'numeric', month: '2-digit', day: '2-digit' }) : '',
                category: config.category || (key.toLowerCase().startsWith('ztarot') ? 'tarot' : 'saju'),
                raw: data
            });
        });

        return items.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    }, [userData, isKo, language]);

    const groupedHistory = useMemo(() => {
        return categories.map(cat => ({
            ...cat,
            items: allHistoryItems.filter(item => item.category === cat.id)
        })).filter(group => group.items.length > 0);
    }, [allHistoryItems, categories]);

    const handleDelete = async (e, key) => {
        e.stopPropagation();
        if (!user?.uid) return;

        const confirmMsg = isKo ? '이 상담 내역을 삭제하시겠습니까?' : 'Do you want to delete this consultation history?';
        if (!window.confirm(confirmMsg)) return;

        try {
            const userRef = doc(db, 'users', user.uid);
            await updateDoc(userRef, {
                [`usageHistory.${key}`]: deleteField()
            });
        } catch (err) {
            console.error('Error deleting history entry:', err);
            alert(isKo ? '삭제 중 오류가 발생했습니다.' : 'An error occurred during deletion.');
        }
    };

    if (loadingUser) {
        return (
            <div className="min-h-screen bg-white dark:bg-slate-950 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white dark:bg-slate-950">
            {/* Hero Section - Tutorial Style */}
            <div className="relative overflow-hidden bg-white dark:bg-slate-900 pt-6 pb-12 sm:pt-12 sm:pb-20 px-6 border-b border-slate-100 dark:border-slate-800">
                <div className="absolute bottom-0 right-0 -mr-20 -mb-20 w-80 h-80 bg-indigo-500/10 dark:bg-indigo-500/20 rounded-full blur-[80px]" />
                <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-purple-500/10 dark:bg-purple-500/20 rounded-full blur-[80px]" />

                {/* Glassy Back Button */}
                <BackButton title={isKo ? '상담 기록' : 'Consultation History'} />

                <div className="relative z-10 max-w-lg mx-auto text-center flex flex-col items-center">
                    <div className="relative w-20 h-20 sm:w-28 sm:h-28 overflow-hidden rounded-full border-4 border-white shadow-2xl mb-4 bg-white dark:bg-slate-800 flex items-center justify-center">
                        <img
                            src="/images/history/clay_history_bg.png"
                            alt="Consultation Records"
                            className='w-full h-full object-cover scale-110'
                        />
                    </div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-xs font-black uppercase tracking-widest mb-4">
                        Consultation History
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
                        사자와 함께한<br />
                        <span className="font-serif italic text-indigo-700 dark:text-indigo-400">상담의 기록들</span>
                    </h1>
                </div>
            </div>

            <div className="max-w-2xl mx-auto px-6 -mt-12 relative z-20 pb-20">
                {allHistoryItems.length === 0 ? (
                    <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-xl p-12 text-center">
                        <div className="w-20 h-20 bg-indigo-50 dark:bg-indigo-900/20 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
                            <PresentationChartLineIcon className="w-10 h-10 text-indigo-400" />
                        </div>
                        <p className="text-slate-500 dark:text-slate-400 font-bold text-lg mb-8">
                            {isKo ? '아직 상담 내역이 없어요.' : 'No consultation history yet.'}
                        </p>
                        <button
                            onClick={() => router.push('/')}
                            className="px-8 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black text-sm shadow-xl active:scale-95 transition-all"
                        >
                            {isKo ? '첫 상담 받으러 가기' : 'Get your first consultation'}
                        </button>
                    </div>
                ) : (
                    <div className="space-y-16">


                        {/* Sections by Category */}
                        {groupedHistory.map((group) => (
                            <div key={group.id} className="space-y-6">
                                <div className="flex flex-col items-center sm:items-start gap-1">
                                    <div className="flex flex-col items-center sm:items-start gap-2 pt-10">
                                        <div className="flex items-center gap-2 text-indigo-500 font-black text-xs uppercase tracking-[0.2em]">
                                            <div className="w-8 h-[2px] bg-indigo-500" />
                                            {isKo ? `총 ${group.items.length}건의 기록` : `Total ${group.items.length} records`}
                                        </div>
                                        <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                                            <span className="font-serif italic text-indigo-600 dark:text-indigo-400"> {group.label === 'Others' ? '기타' : group.label}</span>  내역
                                        </h2>
                                    </div>

                                </div>

                                <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-xl overflow-hidden p-2 sm:p-4">
                                    {group.items.map((item) => (
                                        <div
                                            key={item.id}
                                            className="group relative border-b border-slate-50 dark:border-slate-800/50 last:border-0 hover:bg-slate-200/50 dark:hover:bg-slate-800/20 transition-all duration-300 rounded-2xl overflow-hidden"
                                        >
                                            <div className="flex items-center p-4 gap-4">
                                                <button
                                                    onClick={() => router.push(item.path)}
                                                    className="flex-1 flex items-center gap-4 text-left min-w-0"
                                                >
                                                    <div className={`w-14 h-14 shrink-0 rounded-[1.25rem] ${item.bg} dark:bg-opacity-10 flex items-center justify-center transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 shadow-sm`}>
                                                        <item.icon className={`w-7 h-7 ${item.color}`} />
                                                    </div>

                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <h3 className="font-black text-sm sm:text-base text-slate-900 dark:text-white">
                                                                {item.label}
                                                            </h3>
                                                            <span className="hidden sm:block text-xs font-black text-slate-400 dark:text-slate-600 px-2 py-0.5 bg-slate-100 dark:bg-slate-800/50 rounded-full uppercase tracking-tighter shrink-0">
                                                                {item.displayDate}
                                                            </span>
                                                        </div>
                                                        {item.title ? (
                                                            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium line-clamp-1 break-all pr-2">
                                                                {item.title}
                                                            </p>
                                                        ) : (
                                                            <p className="text-sm text-slate-350 dark:text-slate-600 font-bold uppercase tracking-tight">
                                                                {isKo ? '분석 완료' : 'Analysis Completed'}
                                                            </p>
                                                        )}
                                                    </div>
                                                </button>

                                                <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                                                    <button
                                                        onClick={(e) => handleDelete(e, item.id)}
                                                        className="dark:text-slate-700 p-3 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl group/trash transition-all active:scale-90"
                                                        title={isKo ? '삭제' : 'Delete'}
                                                    >
                                                        <TrashIcon className="w-5 h-5 text-slate-400 dark:text-slate-700 group-hover/trash:text-rose-500 transition-colors" />
                                                    </button>
                                                    <button
                                                        onClick={() => router.push(item.path)}
                                                        className="p-3 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-xl group/go transition-all active:scale-90"
                                                    >
                                                        <ChevronRightIcon className="w-5 h-5 text-slate-400 dark:text-slate-700 group-hover/go:text-indigo-500 transition-transform group-hover/go:translate-x-0.5" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}

                        {/* Bottom CTA - Tutorial Style */}
                        <div className="text-center py-6">
                            <p className="text-sm font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-4">
                                Looking for more guidance?
                            </p>
                            <button
                                onClick={() => router.push('/tutorial')}
                                className="px-8 py-3.5 border-2 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 rounded-2xl font-black text-sm hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all active:scale-95"
                            >
                                {isKo ? '이용 가이드 보기' : 'View App Guide'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
