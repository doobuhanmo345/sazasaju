'use client';

import React from 'react';
import Image from 'next/image';
import { useLanguage } from '@/contexts/useLanguageContext';

export default function MaintenancePage() {
    const { language } = useLanguage();
    const isKo = language === 'ko';

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-slate-50 to-slate-100 px-6 text-center">

            {/* Image Container with Border and Shadow */}
            <div className="relative w-64 h-64 mb-8 p-4 bg-white rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.06)] ring-4 ring-white/50">
                <div className="relative w-full h-full rounded-full overflow-hidden bg-amber-50/50">
                    <Image
                        src="/images/brand/saza_maintenance.png"
                        alt="Saza Maintenance"
                        fill
                        className="object-contain p-2"
                        priority
                    />
                </div>
            </div>

            <h1 className="text-3xl md:text-4xl font-black text-slate-800 mb-4 tracking-tight">
                {isKo ? '서비스 점검 중입니다' : 'System Maintenance'}
            </h1>

            <p className="text-slate-500 mb-8 max-w-md break-keep leading-relaxed text-sm md:text-base">
                {isKo
                    ? '더 나은 서비스를 제공하기 위해 서버 점검 및 시스템 업그레이드를 진행하고 있습니다. 이용에 불편을 드려 죄송합니다.'
                    : 'We are currently performing scheduled maintenance to improve our services. We apologize for any inconvenience.'
                }
            </p>

            <div className="mt-2 p-5 bg-white rounded-2xl border border-slate-200/60 shadow-sm max-w-sm w-full mx-auto backdrop-blur-sm">
                <div className="flex flex-col gap-1.5">
                    <span className="text-xs font-bold text-indigo-500 uppercase tracking-wider">
                        {isKo ? '점검 예정 시간' : 'Maintenance Schedule'}
                    </span>
                    <span className="text-sm font-semibold text-slate-700 font-mono bg-slate-50 py-2 px-3 rounded-lg border border-slate-100">
                        {isKo ? '2026.02.15 20:00 ~ 2026.02.17 08:00' : 'Until completion'}
                    </span>
                </div>
            </div>

            {/* Admin Login Button */}
            <div className="mt-12">
                <a
                    href="/login"
                    className="text-xs text-slate-300 hover:text-indigo-500 underline transition-colors"
                >
                    Admin Login
                </a>
            </div>
        </div>
    );
}
