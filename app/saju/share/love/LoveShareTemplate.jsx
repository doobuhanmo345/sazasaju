'use client';

import React from 'react';
import ShareTemplate from '@/app/saju/share/ShareTemplate';
import { HeartIcon } from '@heroicons/react/24/outline';

/**
 * LoveShareTemplate - 애정운 공유 템플릿
 */
export default function LoveShareTemplate({ shareData, language }) {
    const { displayName, aiResult } = shareData || {};
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

    const { header, contents, conclusion } = aiData || {};

    return (
        <ShareTemplate
            language={language}
            fortuneType="love" // Will trigger Pink/Rose gradient in ShareTemplate (if configured) or default
            gradientColors="from-pink-500 via-rose-500 to-red-500"
            headerBadgeText={language === 'ko' ? '애정운 분석 공유' : 'Love Analysis Shared'}
        >
            <div className="text-center mb-8">
                <div className="inline-flex items-center gap-1 mb-2 px-3 py-1 bg-pink-50 text-pink-600 rounded-full text-xs font-bold uppercase tracking-wider">
                    <HeartIcon className="w-3 h-3" />
                    <span>{displayName}{language === 'ko' ? '님의 애정운' : "'s Love Luck"}</span>
                </div>

                <h1 className="text-2xl md:text-3xl font-black text-slate-800 mb-3 leading-tight">
                    {header?.title}
                </h1>

                <p className="text-pink-600 font-bold text-lg">
                    {header?.summary}
                </p>
            </div>

            {/* Keywords */}
            {header?.keywords && (
                <div className="flex flex-wrap justify-center gap-2 mb-8">
                    {header.keywords.map((word, i) => (
                        <span key={i} className="px-3 py-1 bg-pink-50 text-pink-700 text-xs font-bold rounded-full border border-pink-100">
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
                            <span className="w-1.5 h-1.5 rounded-full bg-pink-500"></span>
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
                <div className="bg-gradient-to-br from-pink-50 to-rose-50 p-6 rounded-2xl border border-pink-100 text-center">
                    <h3 className="font-bold text-pink-800 mb-2">
                        {conclusion.title}
                    </h3>
                    <p className="text-sm text-pink-700 leading-relaxed">
                        {conclusion.desc}
                    </p>
                </div>
            )}
        </ShareTemplate>
    );
}
