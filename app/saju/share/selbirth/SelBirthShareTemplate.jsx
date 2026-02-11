'use client';

import ShareTemplate from '../ShareTemplate';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import LZString from 'lz-string';
import { useLanguage } from '@/contexts/useLanguageContext';
import { reportStyleSimple } from '@/data/aiResultConstants';

// shareData passed from Server Component OR via props
export default function SelBirthShareTemplate({ shareData: propShareData }) {
    const searchParams = useSearchParams();
    const [shareData, setShareData] = useState(propShareData || null);
    const { language } = useLanguage();

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

    if (!shareData) return <div className="p-10 text-center text-emerald-500">Loading...</div>;

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

    // Fallback if data is not available yet
    if (!data) return <div className="p-10 text-center text-emerald-500">Processing...</div>;

    const { displayName, birthDate, gender } = shareData;

    // Formatting helpers if needed, but display usually relies on 'data' content

    return (
        <ShareTemplate
            language={language}
            fortuneType="selbirth"
            gradientColors="from-emerald-400 via-teal-500 to-green-600"
            headerBadgeText={language === 'en' ? 'Birth Selection Shared' : '출산 택일 공유'}
        >
            <div className="rt-container is-active">
                <style>{reportStyleSimple}</style>

                {/* HEADER */}
                <header className="rt-header">
                    <div className="rt-tag animate-up">BIRTH DATE SELECTION</div>
                    <h1 className="rt-main-title animate-up">
                        {language === 'en' ? 'Gift of Destiny for' : '아기를 위한 최고의 선물'}
                        <br />
                        <span className="text-highlight">
                            {language === 'en' ? 'Baby Birth Selection' : '명품 출산 택일'}
                        </span>
                    </h1>
                </header>

                {/* PROFILE SECTION - shortened for share card */}
                <section className="rt-section rt-profile animate-up">
                    <div className="rt-id-card border-emerald-500/20 shadow-xl shadow-emerald-900/5">
                        <div className="rt-id-card__header !bg-emerald-600/5 py-4">
                            <span className="rt-id-card__name flex items-center gap-2">
                                <span className="text-xl">👶</span>
                                {language === 'ko' ? '출산 분석 대상' : 'Analysis Target'}
                            </span>
                            <span className="rt-id-card__label !bg-emerald-600 !text-white !opacity-100">PREMIUM</span>
                        </div>
                        <div className="rt-id-card__body p-6 space-y-5">
                            <div className="grid grid-cols-2 gap-4 pb-4 border-b border-slate-50">
                                <div className="rt-info-row !flex-col !items-start gap-1">
                                    <span className="rt-info-row__label !mb-0">{language === 'ko' ? '출산 예정일' : 'DUE DATE'}</span>
                                    <span className="rt-info-row__value font-black text-emerald-600 text-lg">
                                        {data.dueDate || '-'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <main className="rt-main-content">
                    <section className="rt-card animate-up">
                        <h2 className="rt-card__title">
                            {language === 'en' ? '01. Destiny Overview' : '01. 아이의 운명 개요'}
                        </h2>
                        <div className="rt-ootd-wrapper mb-4">
                            <div className="rt-ootd-item">
                                <span className="rt-ootd-item__label">FOCUS</span>
                                <span className="rt-ootd-item__value">{data.keyword}</span>
                            </div>
                        </div>
                        <p className="rt-card__text">{data.overview}</p>
                    </section>

                    <section className="rt-card animate-up">
                        <h2 className="rt-card__title">
                            {language === 'en' ? '02. Top Recommendations' : '02. 추천 출산일 Best'}
                        </h2>
                        <div className="space-y-6">
                            {data.bestDates && data.bestDates.slice(0, 1).map((item, idx) => (
                                <div key={idx} className="bg-slate-50 p-5 rounded-xl border border-emerald-100 relative overflow-hidden">
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="text-xl font-black text-emerald-600 tracking-tight">{item.date}</span>
                                        <span className="text-xs font-bold px-2 py-1 bg-emerald-100 text-emerald-700 rounded shadow-sm">
                                            TOP {idx + 1}
                                        </span>
                                    </div>
                                    <p className="text-sm text-slate-700 leading-relaxed mb-2">
                                        {item.reason}
                                    </p>
                                </div>
                            ))}
                            {data.bestDates && data.bestDates.length > 1 && (
                                <p className="text-center text-xs text-slate-400 mt-2">
                                    {language === 'en' ? 'More dates available in full report.' : '전체 리포트에서 더 많은 날짜를 확인하세요.'}
                                </p>
                            )}
                        </div>
                    </section>
                </main>
            </div>
        </ShareTemplate>
    );
}
