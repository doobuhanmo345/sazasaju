'use client';

import React, { memo } from 'react';
import {
    PresentationChartLineIcon,
    EnvelopeIcon,
    QuestionMarkCircleIcon,
    CircleStackIcon
} from '@heroicons/react/24/outline';

const QuickAccess = memo(({ isKo, router }) => {
    const items = [
        { label: isKo ? '분석 기록' : 'History', icon: <PresentationChartLineIcon />, path: '/mypage/history', color: 'text-rose-500' },
        { label: isKo ? '메시지' : 'Messages', icon: <EnvelopeIcon />, path: '/messages', color: 'text-slate-500' },
        { label: isKo ? '도움말' : 'Guide', icon: <QuestionMarkCircleIcon />, path: '/tutorial', color: 'text-sky-500' },
        { label: isKo ? '크레딧 충전' : 'Credit', icon: <CircleStackIcon />, path: '/credit', color: 'text-indigo-500' },
    ];

    return (
        <div className="grid grid-cols-4 gap-2.5 sm:gap-6 w-full pt-9 pb-6">
            {items.map((item, idx) => (
                <button
                    key={idx}
                    onClick={() => router.push(item.path)}
                    className="relative w-full flex flex-col items-center gap-2 sm:gap-4 p-3 sm:p-5 rounded-2xl sm:rounded-3xl bg-white/40 dark:bg-slate-900/40 border border-white/60 dark:border-white/[0.03] shadow-[0_4px_20px_rgba(0,0,0,0.03)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.2)] backdrop-blur-sm hover:scale-105 active:scale-95 transition-all duration-300 group overflow-hidden transform-gpu"
                >
                    <div className={`absolute inset-0 bg-gradient-to-br ${item.color.replace('text-', 'from-')}/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                    <div className={`w-7 h-7 sm:w-9 sm:h-9 ${item.color} group-hover:scale-110 transition-all duration-500 relative z-10`}>
                        {React.cloneElement(item.icon, { className: 'w-full h-full stroke-[1.2]' })}
                    </div>
                    <span className="text-[10px] sm:text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-tighter sm:tracking-widest group-hover:text-slate-900 dark:group-hover:text-white transition-colors relative z-10 text-center line-clamp-1">
                        {item.label}
                    </span>
                </button>
            ))}
        </div>
    );
});

QuickAccess.displayName = 'QuickAccess';
export default QuickAccess;
