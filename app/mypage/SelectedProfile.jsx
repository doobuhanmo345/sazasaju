'use client';

import React from 'react';
import { useAuthContext } from '@/contexts/useAuthContext';
import { useLanguage } from '@/contexts/useLanguageContext';
import { CalendarDaysIcon, SparklesIcon } from '@heroicons/react/24/outline';

export default function SelectedProfile() {
    const { userData, selectedProfile } = useAuthContext();
    const { language } = useLanguage();
    const isKo = language === 'ko';

    const formatBirth = (dateStr) => {
        if (!dateStr || typeof dateStr !== 'string') return isKo ? '정보 없음' : 'No Info';
        try {
            const [datePart, timePart] = dateStr.split('T');
            const [year, month, day] = datePart.split('-');
            const [hour, minute] = (timePart || '00:00').split(':');
            return isKo
                ? `${year}년 ${month}월 ${day}일 ${hour}:${minute}`
                : `${month}/${day}/${year} ${hour}:${minute}`;
        } catch (e) {
            return isKo ? '형식 오류' : 'Format Error';
        }
    };

    const target = selectedProfile || userData;

    if (!target) return null;

    return (
        <div className="relative -top-5">
            {/* Core Data Block - Zero Box Aesthetic */}
            <div className="flex flex-col ">
                {/* Birth Data - Pure Text Hierarchy */}
                <div className="group">
                    <div className="flex items-center justify-center gap-3 mb-3">
                        <CalendarDaysIcon className="w-4 h-4 text-indigo-500 opacity-40 group-hover:opacity-100 transition-opacity" />
                        <span className="text-xs font-black text-slate-500 uppercase tracking-[0.3em]">Birth </span>
                        <h2 className="text-sm font-black text-slate-900 dark:text-white tracking-tighter leading-tight italic group-hover:pl-2 transition-all">
                            {target?.isTimeUnknown ? (
                                formatBirth(target?.birthDate).slice(0, -6)
                            ) : (
                                <span
                                    dangerouslySetInnerHTML={{
                                        __html: formatBirth(
                                            target?.birthTime
                                                ? `${target?.birthDate}T${target?.birthTime}`
                                                : target?.birthDate
                                        ),
                                    }}
                                />
                            )}
                        </h2>
                    </div>

                </div>

                {/* Gender - Minimal Labeling */}
                <div className="group">
                    <div className="flex items-center justify-center gap-3 mb-3">
                        <SparklesIcon className="w-4 h-4 text-amber-500 opacity-40 group-hover:opacity-100 transition-opacity" />
                        <span className="text-xs font-black text-slate-500 uppercase tracking-[0.3em]">Gender</span>
                        <h2 className="text-sm font-black text-slate-900 dark:text-white tracking-tighter leading-tight italic capitalize group-hover:pl-2 transition-all">
                            {target?.gender === 'male' ? (isKo ? '남성' : 'Male') : (isKo ? '여성' : 'Female')}
                        </h2>
                    </div>

                </div>
            </div>
        </div>
    );
}