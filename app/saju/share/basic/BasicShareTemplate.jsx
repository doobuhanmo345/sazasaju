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
                <section className="my-9">
                    <h2 className="rt-card__title">
                        {isEn ? 'Core Personality' : '핵심 성격'}
                    </h2>

                    <div className="rt-card__text text-left">{data?.corePersonality?.essence}</div>
                    <div className="my-3">
                        <p className="rt-timing-grid__item">{data?.corePersonality?.title}</p>
                        <p className="text-sm text-gray-600 italic my-2">{data?.corePersonality?.metaphor}</p>
                        <div className="gap-3 flex justify-center flex-wrap">
                            {data?.corePersonality?.keywords?.map((keyword, idx) => (
                                <div key={idx} className="rt-id-card__label">
                                    {keyword}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="mt-4 gap-3">
                        <div className="rt-card">
                            <h4 className="font-bold text-sm mb-2">{isEn ? 'Strengths' : '강점'}</h4>
                            <ul className="text-sm space-y-1">
                                {data?.corePersonality?.strengths?.map((item, idx) => (
                                    <li key={idx}>• {item}</li>
                                ))}
                            </ul>
                        </div>
                        <div className="rt-card">
                            <h4 className="font-bold text-sm mb-2">{isEn ? 'Risks' : '약점'}</h4>
                            <ul className="text-sm space-y-1">
                                {data?.corePersonality?.risks?.map((item, idx) => (
                                    <li key={idx}>• {item}</li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </section>

                <section className="my-9">
                    <h2 className="rt-card__title">
                        {isEn ? 'Personality Overview' : '성격 개요'}
                    </h2>
                    <p className="rt-card__text text-left">{data?.personalityOverview?.desc}</p>
                </section>

                <section className="my-9">
                    <h2 className="rt-card__title">{isEn ? 'Personality Through Different Lenses' : '관점별 성격 해석'}</h2>

                    <div className="rt-card">
                        <div className="rt-ootd-item">
                            <h3 className="rt-ootd-item__value">{data?.lensInterpretations?.wealth?.summary}</h3>

                        </div>
                        <p className="rt-card__text text-left">{data?.lensInterpretations?.wealth?.desc}</p>
                    </div>

                    <div className="rt-card">
                        <div className="rt-ootd-item">
                            <h3 className="rt-ootd-item__value">{data?.lensInterpretations?.job?.summary}</h3>

                        </div>
                        <p className="rt-card__text text-left">{data?.lensInterpretations?.job?.desc}</p>
                    </div>

                    <div className="rt-card">
                        <div className="rt-ootd-item">
                            <h3 className="rt-ootd-item__value">{data?.lensInterpretations?.love?.summary}</h3>

                        </div>
                        <p className="rt-card__text text-left">{data?.lensInterpretations?.love?.desc}</p>
                    </div>

                    <div className="rt-card">
                        <div className="rt-ootd-item">
                            <h3 className="rt-ootd-item__value">{data?.lensInterpretations?.health?.summary}</h3>

                        </div>
                        <p className="rt-card__text text-left">{data?.lensInterpretations?.health?.desc}</p>
                    </div>

                    <div className="rt-card">
                        <div className="rt-ootd-item">
                            <h3 className="rt-ootd-item__value">{data?.lensInterpretations?.conflict?.summary}</h3>

                        </div>
                        <p className="rt-card__text text-left">{data?.lensInterpretations?.conflict?.desc}</p>
                    </div>

                    <div className="rt-card">
                        <div className="rt-ootd-item">
                            <h3 className="rt-ootd-item__value">{data?.lensInterpretations?.relationship?.summary}</h3>

                        </div>
                        <p className="rt-card__text text-left">{data?.lensInterpretations?.relationship?.desc}</p>
                    </div>
                </section>

                <section className="my-9">
                    <h2 className="rt-card__title">{isEn ? 'Timing & Life Flow' : '시기와 흐름'}</h2>
                    <p className="rt-card__text text-left mb-4">{data?.timingAndFlow?.principle}</p>
                    <div className="rt-analysis-list__item gap-3">
                        <div className="rt-card">
                            <h3 className="font-bold mb-2">{data?.timingAndFlow?.daewoon?.[0]?.name}</h3>
                            <p className="rt-card__text text-left">{data?.timingAndFlow?.daewoon?.[0]?.interpretation}</p>
                        </div>
                        <div className="rt-card">
                            <h3 className="font-bold mb-2">{data?.timingAndFlow?.daewoon?.[1]?.name}</h3>
                            <p className="rt-card__text text-left">{data?.timingAndFlow?.daewoon?.[1]?.interpretation}</p>
                        </div>
                        <div className="rt-card">
                            <h3 className="font-bold mb-2">{data?.timingAndFlow?.daewoon?.[2]?.name}</h3>
                            <p className="rt-card__text text-left">{data?.timingAndFlow?.daewoon?.[2]?.interpretation}</p>
                        </div>
                        {/* {data?.timingAndFlow?.daewoon?.map((item, idx) => (
                  <div key={idx} className="rt-gap2">
                    <span className="rt-analysis-list__sub-title">{item?.name}</span>
                    <p className="rt-card__text text-left">{item?.interpretation}</p>
                  </div>
                ))} */}
                    </div>
                </section>

                <section className="my-9">
                    <h2 className="rt-card__title">{isEn ? 'Optimal Environment' : '최적의 환경'}</h2>
                    <div className="rt-card">
                        <h3 className="font-bold mb-2">{data?.environmentGuide?.summary}</h3>
                        <p className="rt-card__text text-left">{data?.environmentGuide?.desc}</p>
                    </div>
                </section>

                <section className="rt-card">
                    <h2 className="rt-card__title">{isEn ? 'Final User Manual' : '최종 사용 설명서'}</h2>
                    <div className="rt-tip-box">
                        <span className="rt-tip-box__label">{data?.finalConclusion?.title}</span>
                        <p className="rt-card__text text-left">{data?.finalConclusion?.desc}</p>
                    </div>
                </section>
            </div>
        </ShareTemplate>
    );
}
