'use client';

import ShareTemplate from '../ShareTemplate';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import LZString from 'lz-string';
import { useLanguage } from '@/contexts/useLanguageContext';
import { reportStyleSimple } from '@/data/aiResultConstants';

// shareData passed from Server Component OR via props
export default function SelDateShareTemplate({ shareData: propShareData, language: propLanguage }) {
    const searchParams = useSearchParams();
    const [shareData, setShareData] = useState(propShareData || null);
    const { language: hookLanguage } = useLanguage();
    const language = propLanguage || hookLanguage;
    const isEn = language !== 'ko';

    useEffect(() => {
        if (propShareData) {
            setShareData(propShareData);
            return;
        }
        const compressedData = searchParams.get('data');
        if (compressedData) {
            try {
                const decompressed = LZString.decompressFromEncodedURIComponent(compressedData);
                if (decompressed) {
                    const parsedData = JSON.parse(decompressed);
                    setShareData(parsedData);
                }
            } catch (err) {
                console.error('Failed to decode share data:', err);
            }
        }
    }, [searchParams]);

    if (!shareData) return <div className="p-10 text-center text-indigo-500">Loading...</div>;

    // Parse AI Result 
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

    // Fallback
    if (!data) return <div className="p-10 text-center text-indigo-500">Processing...</div>;

    const { displayName, birthDate, isTimeUnknown } = shareData;
    const saju = shareData.saju || {};

    // Helper to format date
    const bd = { year: '', month: '', day: '', time: '' };
    if (birthDate) {
        const dateObj = new Date(birthDate);
        bd.year = dateObj.getFullYear();
        bd.month = dateObj.getMonth() + 1;
        bd.day = dateObj.getDate();
        bd.time = birthDate.includes('T') ? birthDate.split('T')[1].substring(0, 5) : '';
    }

    return (
        <ShareTemplate
            language={language}
            fortuneType="seldate"
            gradientColors="from-indigo-500 via-purple-500 to-violet-600"
            headerBadgeText={language !== 'ko' ? 'Auspicious Date Shared' : '길일 선정 공유'}
        >
            <div className="rt-container is-active">
                <style>{reportStyleSimple}</style>

                {/* HEADER */}
                <header className="rt-header">
                    <div className="rt-tag animate-up">AUSPICIOUS DATE REPORT</div>
                    <h1 className="rt-main-title animate-up">
                        {displayName}{language !== 'ko' ? "'s" : '님을 위한'}
                        <br />
                        <span className="text-highlight">
                            {language !== 'ko' ? 'Best Date Selection' : '길일 선정 리포트'}
                        </span>
                    </h1>
                </header>

                {/* PROFILE SECTION */}
                <section className="rt-section rt-profile animate-up">
                    <div className="rt-id-card">
                        <div className="rt-id-card__header">
                            <span className="rt-id-card__name">{displayName}</span>
                            <span className="rt-id-card__label">PERSONAL ID</span>
                        </div>
                        <div className="rt-id-card__body">
                            <div className="rt-info-row">
                                <span className="rt-info-row__label">BIRTH</span>
                                <span className="rt-info-row__value">
                                    {bd.year}.{bd.month}.{bd.day} {isTimeUnknown || <>/{bd.time}</>}
                                </span>
                            </div>
                            <div className="rt-saju-grid">
                                <div className="rt-saju-grid__item"><span>Year</span>{saju.sky3} {saju.grd3}</div>
                                <div className="rt-saju-grid__item"><span>Month</span>{saju.sky2} {saju.grd2}</div>
                                <div className="rt-saju-grid__item"><span>Day</span>{saju.sky1} {saju.grd1}</div>
                            </div>
                        </div>
                    </div>
                </section>

                <main className="rt-main-content">
                    <section className="rt-card animate-up">
                        <h2 className="rt-card__title">
                            {language !== 'ko' ? '01. Purpose & Flow' : '01. 길일 선정 정보'}
                        </h2>
                        <div className="rt-ootd-wrapper mb-4">
                            <div className="rt-ootd-item">
                                <span className="rt-ootd-item__label">PURPOSE</span>
                                <span className="rt-ootd-item__value">{data?.purpose}</span>
                            </div>
                            <div className="rt-ootd-item">
                                <span className="rt-ootd-item__label">KEYWORD</span>
                                <span className="rt-ootd-item__value">{data?.keyword}</span>
                            </div>
                        </div>
                        <p className="rt-card__text">{data?.overview}</p>
                    </section>

                    <section className="rt-card animate-up">
                        <h2 className="rt-card__title">
                            {language !== 'ko' ? '02. Top Recommendations' : '02. 최적의 날짜 추천'}
                        </h2>
                        <div className="space-y-4">
                            {data?.bestDates && data?.bestDates.slice(0, 1).map((item, idx) => (
                                <div key={idx} className="bg-slate-50 p-4 rounded-lg flex flex-col gap-2 border border-slate-100">
                                    <div className="flex items-center justify-between">
                                        <span className="text-lg font-bold text-rose-500">{item.date}</span>
                                        <span className="text-xs font-bold px-2 py-1 bg-white rounded shadow-sm border border-slate-200">
                                            Top {idx + 1}
                                        </span>
                                    </div>
                                    <p className="text-sm text-slate-700"><span className="font-bold mr-2">Why?</span>{item.reason}</p>
                                </div>
                            ))}
                            {data?.bestDates && data?.bestDates.length > 1 && (
                                <p className="text-center text-xs text-slate-400 mt-2">
                                    {language !== 'ko' ? 'More dates available in full report.' : '전체 리포트에서 더 많은 날짜를 확인하세요.'}
                                </p>
                            )}
                        </div>
                    </section>
                </main>
            </div>
        </ShareTemplate>
    );
}
