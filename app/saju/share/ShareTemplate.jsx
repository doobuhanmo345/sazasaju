'use client';

import React from 'react';
import { SparklesIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import { reportStyleSimple } from '@/data/aiResultConstants';

/**
 * ShareTemplate - 공통 공유 Wrapper 컴포넌트
 * 
 * 모든 공유 타입에서 사용하는 공통 레이아웃과 CTA를 제공
 * children으로 각 타입별 콘텐츠를 받음
 */
export default function ShareTemplate({
    children,
    language = 'ko',
    fortuneType = 'basic',
    headerBadgeText,
    ctaText,
    ctaSubText,
    gradientColors = 'from-indigo-600 via-purple-600 to-pink-600'
}) {
    const fortuneTypeLabels = {
        basic: { ko: '사주', en: 'Saju' },
        tarot: { ko: '타로', en: 'Tarot' },
        yearly: { ko: '신년운세', en: 'Yearly Fortune' },
        compatibility: { ko: '궁합', en: 'Compatibility' },
    };

    const fortuneLabel = fortuneTypeLabels[fortuneType]?.[language] || fortuneTypeLabels.basic[language];

    const defaultBadgeText = language === 'ko'
        ? `사자사주 ${fortuneLabel} 공유`
        : `SAZA SAJU ${fortuneLabel} Shared`;

    const defaultCtaText = language === 'ko'
        ? `나도 내 ${fortuneLabel}를 확인하고 싶다면?`
        : `Want your own ${fortuneLabel} reading?`;

    const defaultCtaSubText = language === 'ko'
        ? 'AI가 분석하는 나만의 사주·타로·궁합'
        : 'AI-powered Saju, Tarot & Compatibility';

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-slate-50 to-gray-50 pb-24">
            <style>{reportStyleSimple}</style>

            <div className="max-w-3xl mx-auto px-4 py-8">

                <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-white rounded-full shadow-lg border border-indigo-100">
                        {/* 아이콘에도 그라데이션 느낌을 주려면 text-indigo-600 유지 혹은 변경 */}
                        <SparklesIcon className={`w-5 h-5 ${gradientColors}`} />

                        <span className={`text-sm font-bold bg-gradient-to-r ${gradientColors} bg-clip-text text-transparent`}>
                            {headerBadgeText || defaultBadgeText}
                        </span>
                    </div>
                </div>

                {/* Main Container */}
                <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-indigo-100">
                    {/* Decorative Header */}
                    <div className={`h-2 w-full bg-gradient-to-r ${gradientColors}`}></div>
                    {/* Content from children */}
                    <div className="p-6 md:p-8">
                        {children}
                    </div>
                </div>

                {/* Branding Footer */}
                <div className="text-center mt-8 text-sm text-gray-500">
                    <p>Powered by <span className="font-bold text-black">사자사주 (SAZA SAJU)</span></p>
                </div>
            </div>

            {/* Fixed Bottom CTA Bar */}
            <div className={`fixed bottom-0 left-0 right-0 bg-gradient-to-r ${gradientColors} shadow-2xl z-50`}>
                <div className="max-w-3xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex-1">
                            <p className="text-white font-bold text-sm md:text-base">
                                {ctaText || defaultCtaText}
                            </p>
                            <p className="text-white/80 text-xs mt-0.5">
                                {ctaSubText || defaultCtaSubText}
                            </p>
                        </div>
                        <a
                            href="https://sazasaju.vercel.app"
                            className="flex-shrink-0 inline-flex items-center gap-2 px-6 py-3 bg-white text-indigo-600 font-bold rounded-full hover:shadow-xl transition-all active:scale-95"
                        >
                            <span className={`text-sm font-bold bg-gradient-to-r ${gradientColors} bg-clip-text text-transparent`}>
                                {language === 'ko' ? '시작하기' : 'Get Started'}
                            </span>
                            <ArrowRightIcon className={`w-4 h-4`} />
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
