import ShareTemplate from '../ShareTemplate';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import LZString from 'lz-string';
import { useLanguage } from '@/contexts/useLanguageContext';
import { reportStyleSimple } from '@/data/aiResultConstants';

export default function InterviewShareTemplate() {
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

    if (!shareData) return <div className="p-10 text-center text-blue-500">Loading...</div>;

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
    if (!data) return <div className="p-10 text-center text-blue-500">Processing...</div>;

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
            fortuneType="interview"
            gradientColors="from-blue-500 via-indigo-500 to-slate-500"
            headerBadgeText={language === 'en' ? 'Strategy Shared' : '합격 전략 공유'}
        >
            <div className="rt-container is-active">
                <style>{`
                  /* Reusing style from ReportTemplateInterview but scoping it or inlining critical parts */
                  /* For simplicity, we can rely on reportStyleSimple + custom styles defined in the original file */
                  ${reportStyleSimple}
                  .rt-id-card { background: #fff; border-radius: 20px; padding: 20px; box-shadow: 0 10px 25px rgba(37,99,235,0.1); border: 1px solid rgba(37,99,235,0.1); }
                  .rt-id-card__header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 20px; border-bottom: 1px dashed #cbd5e1; padding-bottom: 10px; }
                  .rt-id-card__name { font-size: 1.4rem; font-weight: 800; color: #0f172a; }
                  .rt-id-card__label { font-size: 0.6rem; color: #fff; background: #0f172a; padding: 3px 10px; border-radius: 100px; font-weight: 700; }
                  .rt-info-row { display: flex; margin-bottom: 8px; font-size: 0.8rem; }
                  .rt-info-row__label { width: 60px; color: #94a3b8; font-weight: 600; }
                  .rt-info-row__value { color: #334155; font-weight: 700; }
                  .rt-saju-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 5px; margin-top: 20px; }
                  .rt-saju-grid__item { background: #0f172a; color: #fff; border-radius: 12px; padding: 8px 2px; text-align: center; font-size: 0.8rem; font-weight: 700; }
                  .rt-saju-grid__item span { display: block; font-size: 0.55rem; color: #94a3b8; margin-bottom: 2px; }
                `}</style>

                {/* HEADER */}
                <header className="rt-header">
                    <div className="rt-tag animate-up">SUCCESS STRATEGY REPORT</div>
                    <h1 className="rt-main-title animate-up">
                        {displayName}{language === 'en' ? "'s" : '님의'}
                        <br />
                        <span className="text-highlight">
                            {language === 'en' ? 'Interview Success Analysis' : '면접 합격운 분석 리포트'}
                        </span>
                    </h1>
                </header>

                {/* PROFILE SECTION */}
                <section className="rt-section rt-profile animate-up">
                    <div className="rt-id-card">
                        <div className="rt-id-card__header">
                            <span className="rt-id-card__name">{displayName}</span>
                            <span className="rt-id-card__label">CANDIDATE ID</span>
                        </div>
                        <div className="rt-id-card__body">
                            <div className="rt-info-row">
                                <span className="rt-info-row__label">BIRTH</span>
                                <span className="rt-info-row__value">
                                    {bd.year}.{bd.month}.{bd.day} {isTimeUnknown || <>/{bd.time}</>}
                                </span>
                            </div>
                            <div className="rt-info-row">
                                <span className="rt-info-row__label">TARGET</span>
                                <span className="rt-info-row__value">{data.interviewType}</span>
                            </div>
                            <div className="rt-saju-grid">
                                {saju.sky0 && <div className="rt-saju-grid__item"><span>Hour</span>{saju.sky0} {saju.grd0}</div>}
                                <div className="rt-saju-grid__item"><span>Day</span>{saju.sky1} {saju.grd1}</div>
                                <div className="rt-saju-grid__item"><span>Month</span>{saju.sky2} {saju.grd2}</div>
                                <div className="rt-saju-grid__item"><span>Year</span>{saju.sky3} {saju.grd3}</div>
                            </div>
                        </div>
                    </div>
                </section>

                <main className="rt-main-content">
                    {/* 01. Vibe Strategy */}
                    <section className="rt-card animate-up">
                        <h2 className="rt-card__title">
                            {language === 'en' ? '01. Vibe Strategy for Success' : '01. 합격을 부르는 Vibe 전략'}
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

                    {/* 02. Success Index */}
                    <section className="rt-card animate-up">
                        <h2 className="rt-card__title">
                            {language === 'en' ? '02. Interview Success Index' : '02. 면접 합격 지수'}
                        </h2>
                        <div className="rt-score-box">
                            <div className="rt-score-box__label">
                                {language === 'en' ? 'Final Pass Probability' : '최종 합격 가능성'}
                            </div>
                            <div className="rt-score-box__val">
                                {data.passIndex}
                                <span>%</span>
                            </div>
                            <div className="rt-progress">
                                <div
                                    className="rt-progress__fill"
                                    style={{ width: `${data.passIndex}%` }}
                                ></div>
                            </div>
                        </div>
                        <div className="rt-timing-grid">
                            <div className="rt-timing-grid__item">
                                <span>{language === 'en' ? 'Golden Time' : '면접 골든 타임'}</span>
                                <strong>{data.section02?.goldenTime}</strong>
                            </div>
                            <div className="rt-timing-grid__item">
                                <span>{language === 'en' ? 'Lucky Item' : '행운의 아이템'}</span>
                                <strong>{data.section02?.luckyItem}</strong>
                            </div>
                        </div>
                    </section>
                </main>
            </div>
        </ShareTemplate>
    );
}
