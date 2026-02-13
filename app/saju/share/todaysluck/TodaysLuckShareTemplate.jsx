'use client';

import React from 'react';
import ShareTemplate from '@/app/saju/share/ShareTemplate';

/**
 * TodaysLuckShareTemplate - 오늘의 운세 공유 템플릿
 */
export default function TodaysLuckShareTemplate({ shareData, language }) {
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

    const { today, lucky_elements } = aiData || {};

    return (
        <ShareTemplate
            language={language}
            fortuneType="todaysluck"
            gradientColors="from-blue-600 via-indigo-600 to-violet-600"
            headerBadgeText={language === 'ko' ? '오늘의 운세 공유' : 'Daily Fortune Shared'}
        >
            <div className="text-center mb-8">
                <h1 className="text-3xl md:text-4xl font-black text-slate-800 mb-2">
                    {displayName}
                    {language === 'ko' ? '님의 오늘' : "'s Today"}
                </h1>
                <p className="text-gray-500 text-sm">{today?.date}</p>
            </div>

            {/* Score & Summary */}
            <div className="flex flex-col items-center mb-10">
                <div className="relative w-32 h-32 flex items-center justify-center rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 shadow-xl mb-6">
                    <div className="absolute inset-[3px] bg-white rounded-full flex flex-col items-center justify-center">
                        <span className="text-4xl font-black text-slate-800">{today?.score}</span>
                        <span className="text-xs text-gray-400 font-bold">{language === 'ko' ? '점' : 'pt'}</span>
                    </div>
                </div>

                <h2 className="text-xl font-bold text-slate-800 mb-3 px-4">
                    "{today?.summary}"
                </h2>

                <p className="text-gray-600 leading-relaxed text-sm max-w-lg mx-auto">
                    {today?.analysis}
                </p>
            </div>

            {/* Lucky Elements */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                {/* Direction */}
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 text-center">
                    <p className="text-xs font-bold text-blue-500 mb-1 uppercase tracking-wider">
                        {language === 'ko' ? '행운의 방향' : 'Direction'}
                    </p>
                    <p className="font-bold text-slate-800">
                        {lucky_elements?.direction?.title}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                        {lucky_elements?.direction?.desc}
                    </p>
                </div>

                {/* Color */}
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 text-center">
                    <p className="text-xs font-bold text-indigo-500 mb-1 uppercase tracking-wider">
                        {language === 'ko' ? '행운의 컬러' : 'Color'}
                    </p>
                    <p className="font-bold text-slate-800">
                        {lucky_elements?.color?.title}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                        {lucky_elements?.color?.desc}
                    </p>
                </div>

                {/* Keywords */}
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 text-center">
                    <p className="text-xs font-bold text-violet-500 mb-1 uppercase tracking-wider">
                        {language === 'ko' ? '키워드' : 'Keywords'}
                    </p>
                    <div className="flex flex-wrap justify-center gap-1 mt-1">
                        {lucky_elements?.keywords?.tags?.map((tag, idx) => (
                            <span key={idx} className="text-xs font-bold text-slate-700 bg-white px-2 py-0.5 rounded shadow-sm border border-slate-100">
                                #{tag}
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        </ShareTemplate>
    );
}
