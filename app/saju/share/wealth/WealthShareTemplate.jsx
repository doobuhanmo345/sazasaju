'use client';

import React from 'react';
import ShareTemplate from '@/app/saju/share/ShareTemplate';
import { SparklesIcon } from '@heroicons/react/24/outline';

/**
 * WealthShareTemplate - 재물운 공유 템플릿
 */
export default function WealthShareTemplate({ shareData, language }) {
    console.log(language)
    const { displayName, aiResult } = shareData || {};
    // aiResult might be a string (JSON) or an object
    const aiData = typeof aiResult === 'string' ? JSON.parse(aiResult) : aiResult;

    if (!shareData) {
        return (
            <div className="text-center p-8">
                <p className="text-gray-600">
                    {language === 'ko' ? '공유 데이터를 불러올 수 없습니다.' : 'Unable to load shared data.'}
                </p>
            </div>
        );
    }

    // Extract data from standard Wealth report structure
    const { header, contents, conclusion } = aiData || {};

    return (
        <ShareTemplate
            language={language}
            fortuneType="wealth" // Will trigger Gold/Amber gradient in ShareTemplate (if configured) or default
            gradientColors="from-amber-500 via-orange-500 to-yellow-500"
            headerBadgeText={language === 'ko' ? '재물운 분석 공유' : 'Wealth Analysis Shared'}
        >
            <div className="text-center mb-8">
                <div className="inline-flex items-center gap-1 mb-2 px-3 py-1 bg-amber-50 text-amber-600 rounded-full text-xs font-bold uppercase tracking-wider">
                    <SparklesIcon className="w-3 h-3" />
                    <span>{displayName}{language === 'ko' ? '님의 재물운' : "'s Wealth"}</span>
                </div>

                <h1 className="text-2xl md:text-3xl font-black text-slate-800 mb-3 leading-tight">
                    {header?.title}
                </h1>

                <p className="text-amber-600 font-bold text-lg">
                    {header?.summary}
                </p>
            </div>

            {/* Keywords */}
            {header?.keywords && (
                <div className="flex flex-wrap justify-center gap-2 mb-8">
                    {header.keywords.map((word, i) => (
                        <span key={i} className="px-3 py-1 bg-amber-50 text-amber-700 text-xs font-bold rounded-full border border-amber-100">
                            #{word}
                        </span>
                    ))}
                </div>
            )}

            <div className="h-px w-full bg-slate-100 mb-8"></div>

            {/* Main Contents */}
            <div className="space-y-8 mb-8">
                {contents?.map((item, idx) => (
                    <div key={idx} className="bg-slate-50/50 p-5 rounded-2xl border border-slate-100">
                        <h3 className="font-bold text-slate-800 mb-2 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                            {item.title}
                        </h3>
                        <p className="text-sm text-slate-600 leading-relaxed">
                            {item.desc}
                        </p>
                    </div>
                ))}
            </div>

            {/* Conclusion */}
            {conclusion && (
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-6 rounded-2xl border border-amber-100 text-center">
                    <h3 className="font-bold text-amber-800 mb-2">
                        {conclusion.title}
                    </h3>
                    <p className="text-sm text-amber-700 leading-relaxed">
                        {conclusion.desc}
                    </p>
                </div>
            )}
        </ShareTemplate>
    );
}
