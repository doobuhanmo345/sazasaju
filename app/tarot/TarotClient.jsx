'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import {
    SparklesIcon,
    CalendarDaysIcon,
    CircleStackIcon,
    PresentationChartLineIcon,
    ChevronRightIcon
} from '@heroicons/react/24/outline';
import { useLanguage } from '@/contexts/useLanguageContext';


export default function TarotClient() {
    const router = useRouter();
    const { language } = useLanguage();
    const isKo = language === 'ko';

    const tarotItems = [
        {
            name: isKo ? '타로 오늘의 운세' : 'Tarot Luck',
            desc: isKo ? '카드로 보는 오늘 하루의 흐름' : 'Daily Tarot Reading',
            icon: <CalendarDaysIcon />,
            path: '/tarot/tarotdaily',
            color: 'text-purple-500'
        },
        {
            name: isKo ? '타로 연애운' : 'Tarot Love',
            desc: isKo ? '사랑과 설렘, 앞으로의 향방' : 'Direction of Love',
            icon: <SparklesIcon />,
            path: '/tarot/tarotlove',
            color: 'text-rose-500'
        },
        {
            name: isKo ? '타로 금전운' : 'Tarot Wealth',
            desc: isKo ? '나의 재물과 풍요의 흐름' : 'Flow of Wealth',
            icon: <CircleStackIcon />,
            path: '/tarot/tarotmoney',
            color: 'text-emerald-500'
        },
        {
            name: isKo ? '타로 고민상담' : 'Tarot Help',
            desc: isKo ? '해답이 필요한 순간의 조언' : 'Advice for Difficult Moments',
            icon: <PresentationChartLineIcon />,
            path: '/tarot/tarotcounseling',
            color: 'text-indigo-500'
        },
    ];

    return (
        <div className="min-h-screen bg-white dark:bg-slate-950 font-pretendard pb-40">


            {/* Hero Header */}
            <div className="relative pt-24 pb-12 px-6 overflow-hidden">
                {/* Abstract Background Effects */}
                <div className="absolute top-0 right-0 -mr-40 -mt-20 w-[600px] h-[600px] bg-purple-500/[0.04] dark:bg-purple-500/[0.08] rounded-full blur-[60px] pointer-events-none transform-gpu" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-500/[0.04] dark:bg-indigo-500/[0.08] rounded-full blur-[60px] pointer-events-none transform-gpu" />

                <div className="relative z-10 max-w-lg mx-auto text-center">
                    <p className="text-[10px] font-black text-purple-500 dark:text-purple-400 uppercase tracking-[0.4em] mb-3">
                        Mystical Tarot
                    </p>
                    <h1 className="text-4xl font-black text-slate-800 dark:text-white tracking-tighter mb-4">
                        {isKo ? '신비로운 타로' : 'Mystical Tarot'}<span className="text-purple-600">.</span>
                    </h1>
                    <p className="text-sm text-slate-400 dark:text-slate-500 max-w-[280px] mx-auto font-medium leading-relaxed">
                        {isKo
                            ? '카드가 들려주는 신비로운 이야기에\n귀를 기울여 보세요.'
                            : 'Listen to the mystical stories\ntold by the cards.'}
                    </p>
                </div>
            </div>

            {/* tarot List */}
            <div className="max-w-lg grid grid-cols-1 sm:grid-cols-2 gap-4 mx-auto px-6">
                {tarotItems.map((item, idx) => (
                    <button
                        key={idx}
                        onClick={() => router.push(item.path)}
                        className="h-full m-0 group relative flex flex-col items-center justify-between p-6 rounded-[2.5rem] bg-slate-50/50 dark:bg-slate-900/40 border border-slate-100/50 dark:border-white/[0.03] transition-all hover:bg-white dark:hover:bg-slate-900 hover:shadow-2xl hover:shadow-purple-500/5 hover:-translate-y-0.5 active:scale-[0.98]"
                    >
                        <div className="text-lg font-black text-slate-800 dark:text-white leading-tight mb-1">
                            {item.name}
                        </div>
                        <div className="flex relative w-full justify-between gap-3">
                            <div className={`p-4 rounded-3xl bg-white dark:bg-slate-800 shadow-sm transition-transform duration-500 group-hover:scale-110 ${item.color}`}>
                                {React.cloneElement(item.icon, { className: 'w-7 h-7 stroke-[1.2]' })}
                            </div>
                            <div className="text-left">

                                <div className="absolute sm:relative min-w-[60px] top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 sm:min-w-[120px] sm:text-xs text-md text-slate-400 dark:text-slate-500 font-medium tracking-tight">
                                    {item.desc}
                                </div>
                            </div>
                            <ChevronRightIcon className="w-10 h-10 text-slate-300 dark:text-slate-700 group-hover:text-purple-500 transition-colors" />
                        </div>

                    </button>
                ))}
            </div>
        </div>
    );
}
