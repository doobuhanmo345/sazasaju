'use client'

import React from 'react';
import { ChevronRightIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';

export default function MyPageMenuButton({ idx, item }) {
    const router = useRouter();
    return (
        <button
            key={idx}
            onClick={item.action || (() => router.push(item.path))}
            className="group flex flex-col items-start gap-3 transform-gpu"
        >
            <div className="flex items-center gap-3">
                <div className="w-5 h-5 opacity-40 group-hover:opacity-100 transition-opacity">
                    {item.icon}
                </div>
                <span className="text-xs font-black text-slate-400 dark:text-slate-600 uppercase tracking-[0.3em]">{item.exp}</span>
            </div>
            <div className="flex items-end gap-3">
                <span className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter group-hover:text-indigo-600 transition-colors">
                    {item.label}
                </span>
                <ChevronRightIcon className="w-8 h-8 text-indigo-600 mb-1 group-hover:translate-x-3 transition-transform" />
            </div>
        </button>
    )
}