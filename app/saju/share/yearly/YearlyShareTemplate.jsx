'use client';

import React from 'react';
import ShareTemplate from '@/app/saju/share/ShareTemplate';
import { reportStyleBlue } from '@/data/aiResultConstants';
import { useSearchParams } from 'next/navigation';
import LZString from 'lz-string';

/**
 * YearlyShareTemplate - New Year Fortune Content Template
 * Matches design of ReportTemplateNewYear.jsx
 */
export default function YearlyShareTemplate({ shareData, language }) {
    if (!shareData) return <div className="p-10 text-center text-slate-400">Loading...</div>;

    // Parse AI Result 
    let data = null;
    try {
        if (typeof shareData.aiResult === 'string') {
            // Basic cleanup if needed, similar to other templates
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
    const isEn = language !== 'ko';

    return (
        <ShareTemplate
            language={language}
            fortuneType="yearly"
            gradientColors="from-indigo-900 via-blue-800 to-slate-900"
            headerBadgeText={isEn ? '2026 Fortune Shared' : '2026 신년운세 공유'}
        >
            <div className="sjsj-report-container w-full max-w-2xl mx-auto p-4 animate-in fade-in duration-700">
                {/* Use the style from constants */}
                <div dangerouslySetInnerHTML={{ __html: reportStyleBlue }} />

                {/* Header */}
                <header className="sjsj-header text-center mb-8">
                    <h1 className="sjsj-main-title text-3xl font-black text-slate-800 dark:text-white mb-2">
                        {isEn ? '2026 Year Comprehensive Report' : '2026년 병오년 종합 리포트'}
                    </h1>
                    <p className="sjsj-header-sub text-slate-500 dark:text-slate-400">{data?.year_info?.header_sub}</p>
                    <div className="sjsj-badge-summary inline-block mt-4 px-4 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-xs font-bold rounded-full">{isEn ? '1-Min Summary' : '1분 핵심 요약'}</div>
                </header>

                <div className="sjsj-content-inner space-y-12">
                    {/* Summary Section */}
                    <section className="sjsj-section bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700">
                        <div className="sjsj-section-label mb-6">
                            <h2 className="sjsj-subTitle text-xl font-bold text-slate-800 dark:text-white mb-1">{data?.year_info?.one_line_title}</h2>
                            <p className="sjsj-label-main text-sm text-slate-500 dark:text-slate-400">{data?.year_info?.one_line_label}</p>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            {data?.year_info?.three_keywords?.map((kw, i) => (
                                <div key={i} className="sjsj-premium-card p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-700">
                                    <div className="sjsj-card-title text-sm font-bold text-indigo-600 dark:text-indigo-400 mb-2">{kw.title}</div>
                                    <div className="sjsj-card-desc text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{kw.desc}</div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Comprehensive Analysis */}
                    <section className="sjsj-section space-y-6">
                        <div className="text-center">
                            <h2 className="sjsj-subTitle text-2xl font-black text-slate-800 dark:text-white">
                                {isEn ? '2026 Comprehensive Analysis' : '2026년 병오년 종합 분석'}
                            </h2>
                        </div>
                        <div className="sjsj-info-banner p-4 bg-indigo-600 text-white text-center rounded-2xl font-bold shadow-lg shadow-indigo-200 dark:shadow-none">{data?.total_analysis?.summary_one_line}</div>
                        <div className="sjsj-analysis-box bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="sjsj-keyword-col">
                                    <div className="sjsj-col-title text-fire font-bold text-rose-500 mb-4 pb-2 border-b border-rose-100 dark:border-rose-900/30">
                                        {isEn ? '🔥 Growth Keywords' : '🔥 성장의 키워드'}
                                    </div>
                                    <ul className="sjsj-list space-y-2">
                                        {data?.total_analysis?.growth_keywords?.map((k, i) => (
                                            <li key={i} className="text-sm text-slate-600 dark:text-slate-400 flex gap-2">
                                                <span className="text-rose-400">•</span> {k}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <div className="sjsj-keyword-col">
                                    <div className="sjsj-col-title text-earth font-bold text-amber-600 dark:text-amber-500 mb-4 pb-2 border-b border-amber-100 dark:border-amber-900/30">
                                        {isEn ? '💡 Elements to Utilize' : '💡 활용할 요소'}
                                    </div>
                                    <ul className="sjsj-list space-y-2">
                                        {data?.total_analysis?.utilize_elements?.map((el, i) => (
                                            <li key={i} className="text-sm text-slate-600 dark:text-slate-400 flex gap-2">
                                                <span className="text-amber-400">✓</span> {el}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <div className="sjsj-keyword-col">
                                    <div className="sjsj-col-title text-slate font-bold text-slate-500 mb-4 pb-2 border-b border-slate-100 dark:border-slate-700">
                                        {isEn ? '⚠️ Elements for Caution' : '⚠️ 주의할 요소'}
                                    </div>
                                    <ul className="sjsj-list space-y-2">
                                        {data?.total_analysis?.caution_elements?.map((el, i) => (
                                            <li key={i} className="text-sm text-slate-600 dark:text-slate-400 flex gap-2">
                                                <span className="text-slate-400">△</span> {el}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                        <p className="sjsj-main-content text-slate-700 dark:text-slate-300 leading-relaxed text-justify px-2">{data?.total_analysis?.main_content}</p>

                        <div className="space-y-8 mt-12 bg-slate-50/50 dark:bg-slate-900/30 p-8 rounded-3xl border border-dashed border-slate-200 dark:border-slate-700">
                            <div>
                                <h3 className="sjsj-sub-section-title text-lg font-bold text-rose-500 mb-3 flex items-center gap-2">
                                    <span>❤️</span> {isEn ? 'Love Luck' : '연애운'}
                                </h3>
                                <p className="sjsj-long-text text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{data?.total_analysis?.luck_sections?.love}</p>
                            </div>
                            <div>
                                <h3 className="sjsj-sub-section-title text-lg font-bold text-amber-500 mb-3 flex items-center gap-2">
                                    <span>💰</span> {isEn ? 'Wealth Luck' : '금전운'}
                                </h3>
                                <p className="sjsj-long-text text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{data?.total_analysis?.luck_sections?.money}</p>
                            </div>
                            <div>
                                <h3 className="sjsj-sub-section-title text-lg font-bold text-indigo-500 mb-3 flex items-center gap-2">
                                    <span>💼</span> {isEn ? 'Career Luck' : '직장/사업운'}
                                </h3>
                                <p className="sjsj-long-text text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{data?.total_analysis?.luck_sections?.work}</p>
                            </div>
                        </div>
                    </section>

                    {/* Monthly Analysis */}
                    <section className="sjsj-section space-y-8">
                        <div className="text-center">
                            <h2 className="sjsj-subTitle text-2xl font-black text-slate-800 dark:text-white">
                                {isEn ? 'Monthly Fortune Analysis' : '월별 운세 상세 분석'}
                            </h2>
                        </div>
                        <div className="space-y-6">
                            {data?.monthly_analysis?.map((m) => (
                                <div key={m.month} className="sjsj-month-card bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-md border border-slate-100 dark:border-slate-700 group hover:shadow-xl transition-shadow duration-300">
                                    <div className="sjsj-month-header flex justify-between items-start mb-6">
                                        <div className="sjsj-month-title flex-1">
                                            <h3 className="text-xl font-black text-slate-800 dark:text-white mb-2">
                                                <span className="sjsj-sub-month text-indigo-600 dark:text-indigo-400 mr-2">{isEn ? `Month ${m.month}` : `${m.month}월`}</span>
                                                <span className="text-base text-slate-400 font-medium">({m.ganji})</span>
                                            </h3>
                                            <div className="sjsj-progress-bar w-full h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                                <div className="sjsj-progress-fill h-full bg-indigo-500" style={{ width: `${m.score || 80}%` }}></div>
                                            </div>
                                        </div>
                                        <div className="sjsj-star-rating ml-4 px-3 py-1 bg-amber-50 dark:bg-amber-900/30 text-amber-500 rounded-full text-sm font-bold">{m.stars}</div>
                                    </div>
                                    <div className="sjsj-month-summary-chips flex flex-wrap gap-2 mb-6">
                                        <div className="px-3 py-1 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold rounded-lg border border-emerald-100 dark:border-emerald-900/30">
                                            <span className="mr-1">✓</span> {isEn ? 'Focus: ' : '방향: '} {m.direction}
                                        </div>
                                        <div className="px-3 py-1 bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 text-xs font-bold rounded-lg border border-rose-100 dark:border-rose-900/30">
                                            <span className="mr-1">⚠️</span> {isEn ? 'Caution: ' : '주의: '} {m.caution}
                                        </div>
                                        <div className="px-3 py-1 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 text-xs font-bold rounded-lg border border-indigo-100 dark:border-indigo-900/30">
                                            <span className="mr-1">▷</span> {isEn ? 'Action: ' : '활용: '} {m.utilize}
                                        </div>
                                    </div>
                                    <p className="sjsj-long-text text-sm text-slate-600 dark:text-slate-400 leading-relaxed text-justify mb-4">{m.content}</p>
                                    <div className="sjsj-card-footer pt-4 border-t border-slate-50 dark:border-slate-700 text-xs text-indigo-400 dark:text-indigo-800 italic text-center">
                                        <div className="sjsj-footer-msg">{m.footer_msg}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Key Points */}
                    <section className="sjsj-section bg-slate-900 text-white p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/20 rounded-full blur-[80px] -mr-32 -mt-32"></div>
                        <div className="relative z-10">
                            <div className="sjsj-section-label mb-8">
                                <h2 className="sjsj-subTitle text-2xl font-black mb-2">{isEn ? 'Key Points to Note' : '주의할 점'}</h2>
                                <p className="sjsj-label-main text-indigo-300 text-sm font-medium">{data?.special_periods?.label_main}</p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="sjsj-premium-card bg-white/5 backdrop-blur-sm p-6 rounded-2xl border border-white/10">
                                    <div className="sjsj-card-title text-emerald-400 font-bold mb-6 flex items-center gap-2">
                                        <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
                                        {isEn ? 'Best Months to Utilize' : '활용하면 좋은 달'}
                                    </div>
                                    <ul className="space-y-6">
                                        {data?.special_periods?.utilize_months?.map((item, i) => (
                                            <li key={i} className="sjsj-check group">
                                                <strong className="block text-lg text-white mb-2 group-hover:text-emerald-300 transition-colors">{item.month}</strong>
                                                <p className="sjsj-long-text text-xs text-slate-400 leading-relaxed">
                                                    {item?.reason} <span className="text-emerald-500 font-bold">{item?.tip}</span>
                                                </p>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <div className="sjsj-premium-card bg-white/5 backdrop-blur-sm p-6 rounded-2xl border border-white/10">
                                    <div className="sjsj-card-title text-rose-400 font-bold mb-6 flex items-center gap-2">
                                        <span className="w-2 h-2 bg-rose-400 rounded-full animate-pulse"></span>
                                        {isEn ? 'Months to be Cautious' : '주의해야 할 달'}
                                    </div>
                                    <ul className="space-y-6">
                                        {data?.special_periods?.caution_months?.map((item, i) => (
                                            <li key={i} className="sjsj-check group">
                                                <strong className="block text-lg text-white mb-2 group-hover:text-rose-300 transition-colors">{item.month}</strong>
                                                <p className="sjsj-long-text text-xs text-slate-400 leading-relaxed">
                                                    {item?.reason} <span className="text-rose-500 font-bold">{item?.tip}</span>
                                                </p>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </ShareTemplate>
    );
}
