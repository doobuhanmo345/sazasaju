'use client';

import React from 'react';
import ShareTemplate from '@/app/saju/share/ShareTemplate';
import { HeartIcon, SparklesIcon, CheckCircleIcon, ExclamationCircleIcon, LightBulbIcon, ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';
import { useLanguage } from '@/contexts/useLanguageContext';
/**
 * MatchShareTemplate - 궁합 분석 결과 공유 템플릿
 * Matches design of ReportTemplateMatch.jsx
 */
// shareData passed from Server Component OR via props
export default function MatchShareTemplate({ shareData, language }) {
    if (!shareData) return <div className="p-10 text-center text-slate-400">Loading...</div>;

    const isKo = language === 'ko';
    // Parse AI Result if needed
    let data = null;
    try {
        if (typeof shareData.aiResult === 'string') {
            const cleaned = shareData.aiResult.replace(/```json/g, '').replace(/```/g, '');
            data = JSON.parse(cleaned);
        } else {
            data = shareData.aiResult;
        }
    } catch (e) {
        console.error("JSON Parse Error", e);
    }

    if (!data) return <div className="p-10 text-center text-rose-500">Data Processing Error</div>;

    const { displayName } = shareData;


    // Default label if not found in data
    const relationLabel = data.relation || (isKo ? '궁합' : 'Relationship');

    return (
        <ShareTemplate
            language={language}
            fortuneType="match"
            // Use a Pink/Rose gradient for Match
            gradientColors="from-rose-500 via-pink-500 to-red-500"
            headerBadgeText={isKo ? '궁합 분석 결과 공유' : 'Compatibility Analysis Shared'}
        >
            <div className="w-full max-w-4xl mx-auto px-4 py-8 animate-in fade-in duration-500">
                {/* Score Header */}
                <div className="bg-gradient-to-br from-rose-50 to-pink-50 dark:from-rose-950/20 dark:to-pink-950/10 rounded-3xl border-2 border-rose-200 dark:border-rose-800 shadow-lg p-8 mb-8 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-rose-400 via-pink-400 to-rose-500"></div>

                    <div className="text-center mb-6">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/80 dark:bg-slate-800/80 border border-rose-200 dark:border-rose-700 mb-4">
                            <HeartIcon className="w-4 h-4 text-rose-500" />
                            <span className="text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider">
                                {relationLabel} {isKo ? '분석' : 'Analysis'}
                            </span>
                        </div>

                        <div className="mb-4">
                            <div className="text-6xl font-black text-rose-600 dark:text-rose-400 mb-2">
                                {data.score}
                                <span className="text-3xl text-rose-400 dark:text-rose-500">{isKo ? '점' : 'pt'}</span>
                            </div>
                            <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden max-w-xs mx-auto">
                                <div
                                    className="h-full bg-gradient-to-r from-rose-400 to-pink-500 rounded-full transition-all duration-1000"
                                    style={{ width: `${data.score}%` }}
                                ></div>
                            </div>
                        </div>

                        <h1 className="text-2xl md:text-3xl font-black text-slate-800 dark:text-white mb-3">
                            {data.title}
                        </h1>
                        <p className="text-base text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                            {data.vibe}
                        </p>
                    </div>

                    {/* Keywords */}
                    <div className="flex flex-wrap justify-center gap-2 mt-6">
                        {data.keywords?.map((keyword, i) => (
                            <span
                                key={i}
                                className="px-3 py-1.5 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-full text-xs font-semibold text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-700"
                            >
                                #{keyword}
                            </span>
                        ))}
                    </div>

                    {/* Match Identity */}
                    {data.matchIdentity && (
                        <div className="mt-6 text-center">
                            <p className="text-sm text-slate-500 dark:text-slate-400 italic">
                                "{data.matchIdentity}"
                            </p>
                        </div>
                    )}
                </div>

                {/* Insights Section */}
                <div className="grid md:grid-cols-2 gap-6 mb-8">
                    {/* Me */}
                    <div className="bg-gradient-to-br from-slate-50 to-gray-50 dark:from-slate-900/40 dark:to-slate-800/20 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-1 h-6 bg-gradient-to-b from-slate-400 to-slate-600 rounded-full"></div>
                            <h3 className="text-lg font-black text-slate-700 dark:text-slate-300">
                                {isKo ? '나의 특성' : 'My Traits'}
                            </h3>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                            {data.insights?.me}
                        </p>
                    </div>

                    {/* Target */}
                    <div className="bg-gradient-to-br from-pink-50 to-rose-50 dark:from-pink-950/20 dark:to-rose-950/10 rounded-2xl p-6 border border-pink-200 dark:border-pink-800">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-1 h-6 bg-gradient-to-b from-pink-400 to-rose-500 rounded-full"></div>
                            <h3 className="text-lg font-black text-pink-700 dark:text-pink-300">
                                {isKo ? '상대방의 특성' : 'Partner\'s Traits'}
                            </h3>
                        </div>
                        <p className="text-sm text-pink-900/70 dark:text-pink-200/70 leading-relaxed">
                            {data.insights?.target}
                        </p>
                    </div>
                </div>

                {/* Pros & Cons */}
                <div className="grid md:grid-cols-2 gap-6 mb-8">
                    {/* Pros */}
                    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-emerald-200 dark:border-emerald-800 shadow-sm">
                        <div className="flex items-center gap-2 mb-4">
                            <CheckCircleIcon className="w-6 h-6 text-emerald-500" />
                            <h3 className="text-lg font-black text-emerald-700 dark:text-emerald-400">
                                {isKo ? '장점' : 'Strengths'}
                            </h3>
                        </div>
                        <ul className="space-y-3">
                            {data.pros?.map((pro, i) => (
                                <li key={i} className="flex gap-2 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                                    <span className="text-emerald-500 mt-1">•</span>
                                    <span>{pro}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Cons */}
                    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-amber-200 dark:border-amber-800 shadow-sm">
                        <div className="flex items-center gap-2 mb-4">
                            <ExclamationCircleIcon className="w-6 h-6 text-amber-500" />
                            <h3 className="text-lg font-black text-amber-700 dark:text-amber-400">
                                {isKo ? '주의할 점' : 'Challenges'}
                            </h3>
                        </div>
                        <ul className="space-y-3">
                            {data.cons?.map((con, i) => (
                                <li key={i} className="flex gap-2 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                                    <span className="text-amber-500 mt-1">•</span>
                                    <span>{con}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Synergy Analysis */}
                <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/20 dark:to-purple-950/10 rounded-2xl p-6 border border-indigo-200 dark:border-indigo-800 mb-8">
                    <div className="flex items-center gap-2 mb-4">
                        <SparklesIcon className="w-6 h-6 text-indigo-500" />
                        <h3 className="text-lg font-black text-indigo-700 dark:text-indigo-400">
                            {isKo ? '시너지 분석' : 'Synergy Analysis'}
                        </h3>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <h4 className="text-sm font-bold text-emerald-600 dark:text-emerald-400 mb-2">
                                {isKo ? '✨ 긍정적 시너지' : '✨ Positive Synergy'}
                            </h4>
                            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                                {data.insights?.synergyPros}
                            </p>
                        </div>

                        <div>
                            <h4 className="text-sm font-bold text-amber-600 dark:text-amber-400 mb-2">
                                {isKo ? '⚠️ 주의할 시너지' : '⚠️ Challenging Synergy'}
                            </h4>
                            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                                {data?.insights?.synergyCons}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Advice & Solution */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm mb-8">
                    <div className="flex items-center gap-2 mb-4">
                        <LightBulbIcon className="w-6 h-6 text-yellow-500" />
                        <h3 className="text-lg font-black text-slate-700 dark:text-slate-300">
                            {isKo ? '관계 발전을 위한 조언' : 'Advice for Growth'}
                        </h3>
                    </div>

                    <div className="space-y-4">
                        <div className="p-4 bg-yellow-50 dark:bg-yellow-900/10 rounded-xl border border-yellow-200 dark:border-yellow-800">
                            <p className="text-sm font-semibold text-yellow-900 dark:text-yellow-200">
                                {data?.advice}
                            </p>
                        </div>

                        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                            {data?.insights?.solution}
                        </p>
                    </div>
                </div>

                {/* CTA Chat */}
                <div className="bg-gradient-to-r from-rose-100 to-pink-100 dark:from-rose-900/20 dark:to-pink-900/20 rounded-2xl p-6 border border-rose-200 dark:border-rose-800 text-center">
                    <ChatBubbleLeftRightIcon className="w-8 h-8 text-rose-500 mx-auto mb-3" />
                    <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed max-w-2xl mx-auto">
                        {data.insights?.ctaChat}
                    </p>
                </div>
            </div>
        </ShareTemplate>
    );
}
