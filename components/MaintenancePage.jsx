'use client';

import React from 'react';
import Image from 'next/image';
import { useLanguage } from '@/contexts/useLanguageContext';

export default function MaintenancePage() {
    const { language } = useLanguage();
    const isKo = language === 'ko';

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 px-6 text-center">
            <div className="relative w-64 h-64 mb-6">
                <Image
                    src="/images/brand/saza_maintenance.png"
                    alt="Saza Maintenance"
                    fill
                    className="object-contain"
                    priority
                />
            </div>

            <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-4">
                {isKo ? '서비스 점검 중입니다' : 'System Maintenance'}
            </h1>

            <div className="space-y-2 text-slate-600 max-w-md mx-auto leading-relaxed">
                <p>
                    {isKo
                        ? '더 나은 서비스를 제공하기 위해 서버 점검 및 업데이트를 진행하고 있습니다.'
                        : 'We are currently performing scheduled maintenance to improve our services.'}
                </p>
                <p>
                    {isKo
                        ? '이용에 불편을 드려 죄송합니다. 잠시만 기다려 주세요.'
                        : 'We apologize for the inconvenience. Please check back soon.'}
                </p>
            </div>

            <div className="mt-10 p-4 bg-indigo-50 rounded-xl border border-indigo-100 max-w-sm w-full">
                <p className="text-xs text-indigo-800 font-bold mb-1">
                    {isKo ? '점검 시간' : 'Maintenance Time'}
                </p>
                <p className="text-sm text-indigo-600">
                    {isKo ? '작업 완료 시까지' : 'Until completion'}
                </p>
            </div>

            {/* Admin Login Button */}
            <div className="mt-8">
                <a
                    href="/login"
                    className="text-xs text-gray-300 hover:text-indigo-500 underline transition-colors"
                >
                    Admin Login
                </a>
            </div>
        </div>
    );
}
