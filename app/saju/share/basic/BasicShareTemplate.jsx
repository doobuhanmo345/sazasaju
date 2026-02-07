'use client';

import React, { useState, useEffect } from 'react';
import { CalendarDaysIcon } from '@heroicons/react/24/outline';
import { calculateSajuData } from '@/lib/sajuLogic';
import { toymdt, parseAiResponse } from '@/utils/helpers';
import { ILJU_DATA, ILJU_DATA_EN } from '@/data/ilju_data';
import FourPillarVis from '@/components/FourPillarVis';
import ShareTemplate from '@/app/saju/share/ShareTemplate';

/**
 * BasicShareTemplate - 사주 Basic 콘텐츠 템플릿
 * ShareTemplate wrapper 안에서 사용됨
 */
export default function BasicShareTemplate({ shareData, language = 'ko' }) {
    const [data, setData] = useState(null);
    const [sajuData, setSajuData] = useState(null);

    const { displayName, birthDate, isTimeUnknown, gender, aiResult } = shareData || {};
    const inputDate = birthDate && birthDate.includes('T') ? birthDate : `${birthDate}T00:00`;

    useEffect(() => {
        if (aiResult) {
            const parsedData = parseAiResponse(aiResult);
            if (parsedData) setData(parsedData);
        }
    }, [aiResult]);

    useEffect(() => {
        if (inputDate && gender !== undefined) {
            const calculatedData = calculateSajuData(inputDate, gender, isTimeUnknown, language);
            setSajuData(calculatedData);
        }
    }, [inputDate, gender, isTimeUnknown, language]);

    if (!shareData) {
        return (
            <div className="text-center p-8">
                <p className="text-gray-600">
                    {language === 'ko' ? '공유 데이터를 불러올 수 없습니다.' : 'Unable to load shared data.'}
                </p>
            </div>
        );
    }

    if (!data || !sajuData) {
        return (
            <div className="text-center p-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                <p className="text-gray-600">
                    {language === 'ko' ? '데이터를 분석하는 중...' : 'Analyzing data...'}
                </p>
            </div>
        );
    }

    const { saju, pillars, ohaengCount } = sajuData;
    const isEn = language !== 'ko';
    const iljuKey = pillars.day;
    const iljuInfo = isEn ? ILJU_DATA_EN[iljuKey] || {} : ILJU_DATA[iljuKey] || {};
    const iljuTitle = iljuInfo?.title?.[gender]?.title || iljuKey;
    const iljuDescText = iljuInfo?.title?.[gender]?.desc || '';

    return (
        <ShareTemplate language={language} fortuneType="basic">
            {/* Title Section */}
            <div className="text-center mb-8">
                <div className="flex items-center justify-center gap-2 text-sm text-gray-500 mb-3">
                    <CalendarDaysIcon className="w-4 h-4" />
                    <span>{inputDate.split('T')[0]}</span>
                    <span>·</span>
                    <span>{gender === 'male' ? (isEn ? 'Male' : '남성') : isEn ? 'Female' : '여성'}</span>
                </div>

                <h1 className="text-3xl md:text-4xl font-black text-slate-800 mb-3">
                    {displayName}
                    {language === 'ko' ? '님의 사주' : "'s Saju"}
                </h1>

                <div className="inline-block px-5 py-2 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-full border border-indigo-100">
                    <p className="text-lg font-bold text-indigo-700">{iljuTitle}</p>
                </div>

                {iljuDescText && (
                    <p className="text-sm text-gray-600 mt-3 max-w-md mx-auto">{iljuDescText}</p>
                )}
            </div>

            {/* Four Pillars */}
            <div className="mb-8">
                <FourPillarVis isTimeUnknown={isTimeUnknown} saju={saju} />
            </div>

            {/* Five Elements */}
            <div className="flex justify-center gap-3 text-xs font-semibold text-gray-600 mb-8 flex-wrap">
                {Object.keys(ohaengCount).map((k) => (
                    <span key={k}>
                        {ohaengCount[k] !== 0 && (
                            <span className="px-3 py-1 bg-gray-100 rounded-full">
                                {k.toUpperCase()} {ohaengCount[k]}
                            </span>
                        )}
                    </span>
                ))}
            </div>

            {/* AI Analysis */}
            <div className="report-container">
                {data?.summary && (
                    <section className="my-9">
                        <h2 className="rt-card__title">{isEn ? 'Saju Identity Summary' : '사주 정체성 요약'}</h2>
                        {data?.summary?.desc && <div className="rt-card__text text-left">{data.summary.desc}</div>}
                        {data?.summary?.title && (
                            <div className="my-3">
                                <p className="rt-timing-grid__item">{data.summary.title}</p>
                            </div>
                        )}
                        {data?.keywords && Array.isArray(data.keywords) && data.keywords.length > 0 && (
                            <div className="gap-3 flex justify-center flex-wrap mt-4">
                                {data.keywords.map((keyword, idx) => (
                                    <div key={idx} className="rt-id-card__label">#{keyword}</div>
                                ))}
                            </div>
                        )}
                    </section>
                )}

                {data?.overview?.desc && (
                    <section className="my-9">
                        <h2 className="rt-card__title">{isEn ? 'Overview of Destiny' : '운명의 개요'}</h2>
                        <p className="rt-card__text text-left">{data.overview.desc}</p>
                    </section>
                )}

                {(data?.wealth || data?.job || data?.love || data?.health) && (
                    <section className="my-9">
                        <h2 className="rt-card__title">{isEn ? 'Detailed Analysis' : '상세 분석'}</h2>
                        {data?.wealth && (
                            <div className="rt-card">
                                <div className="rt-ootd-item">
                                    <h3 className="rt-ootd-item__value">{isEn ? 'Wealth & Finance' : '재물운'}</h3>
                                    {data?.wealth?.summary && <p className="rt-ootd-item__label">{data.wealth.summary}</p>}
                                </div>
                                {data?.wealth?.desc && <p className="rt-card__text text-left">{data.wealth.desc}</p>}
                            </div>
                        )}
                        {data?.job && (
                            <div className="rt-card">
                                <div className="rt-ootd-item">
                                    <h3 className="rt-ootd-item__value">{isEn ? 'Career & Success' : '직업운'}</h3>
                                    {data?.job?.summary && <p className="rt-ootd-item__label">{data.job.summary}</p>}
                                </div>
                                {data?.job?.desc && <p className="rt-card__text text-left">{data.job.desc}</p>}
                            </div>
                        )}
                        {data?.love && (
                            <div className="rt-card">
                                <div className="rt-ootd-item">
                                    <h3 className="rt-ootd-item__value">{isEn ? 'Love & Romance' : '애정운'}</h3>
                                    {data?.love?.summary && <p className="rt-ootd-item__label">{data.love.summary}</p>}
                                </div>
                                {data?.love?.desc && <p className="rt-card__text text-left">{data.love.desc}</p>}
                            </div>
                        )}
                        {data?.health && (
                            <div className="rt-card">
                                <div className="rt-ootd-item">
                                    <h3 className="rt-ootd-item__value">{isEn ? 'Health & Wellness' : '건강운'}</h3>
                                    {data?.health?.summary && <p className="rt-ootd-item__label">{data.health.summary}</p>}
                                </div>
                                {data?.health?.desc && <p className="rt-card__text text-left">{data.health.desc}</p>}
                            </div>
                        )}
                    </section>
                )}

                {data?.daewoon && Array.isArray(data.daewoon) && data.daewoon.length > 0 && (
                    <section className="my-9">
                        <h2 className="rt-card__title">{isEn ? 'Major Life Cycles' : '대운 해설'}</h2>
                        <div className="rt-analysis-list__item gap-3">
                            {data.daewoon.map((item, idx) => (
                                <div key={idx} className="rt-gap2">
                                    {item?.name && <span className="rt-analysis-list__sub-title">{item.name}</span>}
                                    {item?.interpretation && <p className="rt-card__text text-left">{item.interpretation}</p>}
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {data?.finalConclusion && (data?.finalConclusion?.title || data?.finalConclusion?.desc) && (
                    <section className="rt-card">
                        <h2 className="rt-card__title">{isEn ? 'Final Conclusion' : '최종 결론'}</h2>
                        <div className="rt-tip-box">
                            {data?.finalConclusion?.title && <span className="rt-tip-box__label">{data.finalConclusion.title}</span>}
                            {data?.finalConclusion?.desc && <p className="rt-card__text text-left">{data.finalConclusion.desc}</p>}
                        </div>
                    </section>
                )}
            </div>
        </ShareTemplate>
    );
}
