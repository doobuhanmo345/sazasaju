import ShareTemplate from '../ShareTemplate';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import LZString from 'lz-string';
import { useLanguage } from '@/contexts/useLanguageContext';
import { reportStyleSimple } from '@/data/aiResultConstants';

export default function DateShareTemplate() {
    const searchParams = useSearchParams();
    const [shareData, setShareData] = useState(null);
    const { language } = useLanguage();

    useEffect(() => {
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

    if (!shareData) return <div className="p-10 text-center text-rose-500">Loading...</div>;

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

    const { displayName, birthDate, isTimeUnknown, gender } = shareData;
    const saju = shareData.saju || {}; // Might need to re-calculate if not passed, but let's assume passed for now or handle gracefully

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
            fortuneType="date"
            gradientColors="from-rose-500 via-pink-500 to-red-500"
            headerBadgeText={language === 'en' ? 'Date Analysis Shared' : '데이트 운세 공유'}
        >
            <div className="rt-container is-active">
                <style>{reportStyleSimple}</style>

                {/* HEADER */}
                <header className="rt-header">
                    <div className="rt-tag animate-up">PREMIUM ROMANCE DOSSIER</div>
                    <h1 className="rt-main-title animate-up">
                        {displayName}{language === 'en' ? "'s" : '님의'}
                        <br />
                        <span className="text-highlight">
                            {language === 'en' ? 'First Encounter Destiny Report' : '첫만남 운명 리포트'}
                        </span>
                    </h1>
                </header>

                {/* PROFILE */}
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
                            <div className="rt-info-row">
                                <span className="rt-info-row__label">DATE</span>
                                <span className="rt-info-row__value">{data?.meetingDate}</span>
                            </div>
                            <div className="rt-info-row">
                                <span className="rt-info-row__label">STATUS</span>
                                <span className="rt-info-row__value">{data?.temperature}</span>
                            </div>
                        </div>
                    </div>
                </section>

                <main className="rt-main-content">
                    {/* 01. OOTD */}
                    <section className="rt-card animate-up">
                        <h2 className="rt-card__title">
                            {language === 'en' ? '01. Vibe & OOTD Strategy' : '01. 상대에게 각인될 OOTD 전략'}
                        </h2>
                        <div className="rt-ootd-wrapper">
                            <div className="rt-ootd-item">
                                <span className="rt-ootd-item__label">MOOD</span>
                                <span className="rt-ootd-item__value">"{data?.section01?.mood}"</span>
                            </div>
                            <div className="rt-ootd-item">
                                <span className="rt-ootd-item__label">POINT</span>
                                <span className="rt-ootd-item__value">{data?.section01?.point}</span>
                            </div>
                        </div>
                        <p className="rt-card__text">{data?.section01?.description}</p>
                    </section>

                    {/* 03. Score */}
                    <section className="rt-card animate-up">
                        <h2 className="rt-card__title">
                            {language === 'en' ? '03. Chemistry & Timing' : '03. 케미스트리 & 타이밍'}
                        </h2>
                        <div className="rt-score-box">
                            <div className="rt-score-box__label">
                                {language === 'en' ? 'Interaction Chemistry Score' : '대화 티키타카 지수'}
                            </div>
                            <div className="rt-score-box__val">
                                {data?.section03?.chemistryScore}
                                <span>{language === 'en' ? 'pt' : '점'}</span>
                            </div>
                            <div className="rt-progress">
                                <div
                                    className="rt-progress__fill"
                                    style={{ width: `${data?.section03?.chemistryScore}%` }}
                                ></div>
                            </div>
                        </div>
                    </section>
                </main>

            </div>
        </ShareTemplate>
    );
}
