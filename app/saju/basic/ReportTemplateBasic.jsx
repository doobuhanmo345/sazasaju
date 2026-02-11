'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { CalendarDaysIcon } from '@heroicons/react/24/outline';
import { calculateSajuData, createPromptForGemini } from '@/lib/sajuLogic';
import { reportStyleBlue, reportStyleSimple } from '@/data/aiResultConstants';
import { toymdt } from '@/utils/helpers';
import { UI_TEXT, ENG_MAP } from '@/data/saju_data';
import { ILJU_DATA, ILJU_DATA_EN } from '@/data/ilju_data';
import { fetchGeminiAnalysis } from '@/lib/gemini';
import FourPillarVis from '@/components/FourPillarVis';
import { useLanguage } from '@/contexts/useLanguageContext';
import { useAuthContext } from '@/contexts/useAuthContext';
import { aiSajuStyle } from '@/data/saju_data_prompt';
import { useLoading } from '@/contexts/useLoadingContext';
import AfterReport from '@/components/AfterReport';
import { parseAiResponse } from '@/utils/helpers';


const ReportTemplateBasic = ({ shareData }) => {
  const { aiResult } = useLoading();
  const { language } = useLanguage();
  const { userData, selectedProfile } = useAuthContext();
  const [data, setData] = useState(null); // 파싱된 데이터를 담을 로컬 상태
  const scrollElRef = useRef(null);

  const router = useRouter();
  const [sajuData, setSajuData] = useState(null);

  // [FIX] Determine target profile (Friend or Self)
  const targetProfile = shareData || selectedProfile || userData;
  const { displayName, birthDate, isTimeUnknown, gender } = targetProfile || {};

  const bd = birthDate ? toymdt(birthDate) : { year: '', month: '', day: '', time: '' };
  const inputDate = birthDate && birthDate.includes('T') ? birthDate : `${birthDate}T00:00`;
  useEffect(() => {
    if (shareData) {
      // If we have shared data, we use it directly
      const parsedData = parseAiResponse(shareData.aiResult);
      if (parsedData) {
        setData(parsedData);
      }
      return;
    }

    if (!userData) return; // Wait for load
    console.log(data)
    // DB에 저장된 결과가 있으면 로드
    const savedResult = userData?.usageHistory?.ZApiAnalysis?.result;
    if (savedResult) {
      const parsedData = parseAiResponse(savedResult);
      if (parsedData) {
        setData(parsedData); // 파싱 성공 시 데이터 세팅
      }
    } else {
      // 결과가 없으면 메인으로 리다이렉트
      alert("저장된 결과가 없습니다. 다시 분석해주세요.");
      router.replace('/saju/basic');
    }
  }, [userData, router, shareData]);

  const isEn = language !== 'ko';
  const t = (char) => (isEn ? ENG_MAP[char] || char : char);

  useEffect(() => {
    if (inputDate && gender !== undefined) {
      const data = calculateSajuData(inputDate, gender, isTimeUnknown, language);
      setSajuData(data);
    }
  }, [inputDate, gender, isTimeUnknown, language]);

  if (!shareData && !userData) return <div className="p-10 text-center">유저 정보를 불러오는 중입니다...</div>;
  if (!sajuData) return <div className="p-10 text-center animate-pulse">데이터 계산 중...</div>;

  const { saju, pillars, ohaengCount } = sajuData;
  const iljuKey = pillars.day;
  const iljuInfo = isEn ? ILJU_DATA_EN[iljuKey] || {} : ILJU_DATA[iljuKey] || {};
  const iljuTitle = iljuInfo?.title?.[gender]?.title || iljuKey;
  const iljuDescText = iljuInfo?.title?.[gender]?.desc || '';
  // console.log(daewoonList?.slice(1,10));

  const getBarColor = (type) =>
    ({
      wood: 'bg-green-500',
      fire: 'bg-red-500',
      earth: 'bg-yellow-500',
      metal: 'bg-slate-400',
      water: 'bg-blue-600',
    })[type];
  // const data = {
  //   "corePersonality": {
  //     "title": "성격을 관통하는 한 문장",
  //     "metaphor": "이 사람의 기질을 상징하는 비유 (예: 차가운 서리 아래 피어난 꽃)",
  //     "essence": "타고난 기질과 절대 변하지 않는 성격의 중심축",
  //     "strengths": ["강점1", "강점2"],
  //     "risks": ["약점1", "약점2"],
  //     "keywords": ["#키워드1", "#키워드2", "#키워드3"]
  //   },
  //   "personalityOverview": {
  //     "desc": "이 성격이 인생 전반(사회적/개인적)에서 어떻게 작동하는지에 대한 심층 개요"
  //   },
  //   "lensInterpretations": {
  //     "wealth": {
  //       "summary": "돈 앞에서 보이는 성격적 특징",
  //       "desc": "재물을 대하는 태도, 소비 패턴, 투자 시 나타나는 본능적 선택"
  //     },
  //     "job": {
  //       "summary": "사회적 성공과 일에서 보이는 특징",
  //       "desc": "조직 내에서의 위치, 성취를 얻는 방식, 유리한 직무 환경"
  //     },
  //     "love": {
  //       "summary": "관계와 사랑 앞에서 보이는 특징",
  //       "desc": "연애 시 나타나는 반복적인 패턴, 파트너에게 원하는 핵심 가치"
  //     },
  //     "health": {
  //       "summary": "에너지 소모와 몸의 반응 특징",
  //       "desc": "성격적 스트레스가 신체 어디로 가는지, 에너지를 충전하는 방식"
  //     },
  //     "conflict": {
  //       "summary": "갈등과 스트레스 상황에서의 돌발 행동",
  //       "desc": "위기 시 성격이 어떻게 왜곡되거나 폭발하는지, 그때의 심리 상태"
  //     },
  //     "relationship": {
  //       "summary": "사람을 대하는 기본 필터",
  //       "desc": "인맥을 맺는 기준, 사람에게 상처받거나 정을 떼는 포인트"
  //     }
  //   },
  //   "timingAndFlow": {
  //     "principle": "이 성격이 운의 흐름을 타는 기본 원리",
  //     "daewoon": [
  //       { "name": "현재 시기", "interpretation": "지금 이 성격이 어떤 성장을 위해 시험받고 있는가" },
  //       { "name": "다음 시기", "interpretation": "미래의 파도를 타기 위해 지금 성격적으로 준비해야 할 것" },
  //       { "name": "이후 시기", "interpretation": "인생 후반전, 성격이 어떤 완숙한 형태로 변해갈 것인가" }
  //     ]
  //   },
  //   "environmentGuide": {
  //     "summary": "성격을 살리는 최적의 환경 요약",
  //     "desc": "공간, 방향, 라이프스타일 중 이 성격을 빛나게 해줄 개운 조건"
  //   },
  //   "finalConclusion": {
  //     "title": "최종 사용 설명서",
  //     "desc": "성격을 바꾸려 애쓰지 말고, 지금 당장 '이렇게' 활용하라는 마스터의 직언"
  //   }
  // }

  return (
    <div
      id="rt-container"
      className="max-w-2xl rt-container mx-auto flex flex-col items-center transition-colors p-4"
      ref={scrollElRef}
    >
      {/* 1. 명식 카드 */}
      <style>{reportStyleSimple}</style>
      <div className="bg-white dark:bg-slate-800 w-full rounded-xl shadow-xl overflow-hidden mb-8 border border-slate-100 dark:border-slate-700">
        <div className="h-2 w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
        <div className="p-4">
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <CalendarDaysIcon className="w-4 h-4" />
              <span>{inputDate.split('T')[0]}</span>
              <span>{gender === 'male' ? (isEn ? 'Male' : '남성') : isEn ? 'Female' : '여성'}</span>
            </div>
            <div className="border-t border-dashed border-indigo-100 dark:border-slate-600 w-full my-2"></div>

            <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
              {[
                { label: UI_TEXT.year[language], gan: saju.sky3, zhi: saju.grd3 },
                { label: UI_TEXT.month[language], gan: saju.sky2, zhi: saju.grd2 },
                { label: UI_TEXT.day[language], gan: saju.sky1, zhi: saju.grd1, highlight: true },
                {
                  label: UI_TEXT.hour[language],
                  gan: saju.sky0,
                  zhi: saju.grd0,
                  unknown: isTimeUnknown,
                },
              ].map(
                (item, i) =>
                  !item.unknown && (
                    <div
                      key={i}
                      className={`flex flex-col items-center ${item.highlight ? 'relative' : ''}`}
                    >
                      {item.highlight && (
                        <div className="absolute inset-0 bg-indigo-100/50 dark:bg-indigo-500/30 blur-md rounded-full scale-150"></div>
                      )}
                      <span className="text-xs text-indigo-300 dark:text-indigo-400 uppercase mb-0.5 relative z-10">
                        {item.label}
                      </span>
                      <span
                        className={`text-lg font-extrabold tracking-widest leading-none relative z-10 ${item.highlight ? 'text-indigo-600 dark:text-indigo-300 text-xl' : 'text-indigo-900 dark:text-indigo-100'}`}
                      >
                        {t(item.gan)}
                        {t(item.zhi)}
                      </span>
                    </div>
                  ),
              )}
            </div>
            <div className="mt-4 flex justify-center">
              <FourPillarVis isTimeUnknown={isTimeUnknown} saju={saju} />
            </div>
          </div>
        </div>
        <div className="bg-slate-50 dark:bg-slate-900/50 p-4 border-t border-slate-200 dark:border-slate-700">
          <div className="flex w-full h-4 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-700">
            {Object.entries(ohaengCount).map(([type, count]) => (
              <div
                key={type}
                style={{ width: `${(count / (isTimeUnknown ? 6 : 8)) * 100}%` }}
                className={getBarColor(type)}
              />
            ))}
          </div>
          <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mt-1">
            {Object.keys(ohaengCount).map((k) => (
              <span key={k}>
                {ohaengCount[k] !== 0 && (
                  <>
                    {k.toUpperCase()} {ohaengCount[k]}
                  </>
                )}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* 2. AI 분석 결과 */}
      <div
        id="share-card"
        className="w-full bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 mb-6 text-center border border-indigo-50 dark:border-slate-700"
      >
        <div className="mb-4">
          <span className="text-[10px] font-black tracking-[0.3em] text-indigo-400 uppercase">
            WHO AM I?
          </span>
          <h1 className="text-2xl font-extrabold text-slate-800 dark:text-white mt-1">
            {iljuTitle}
          </h1>
          {shareData && (
            <div className="mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300">
              {language === 'ko' ? '공유된 결과' : 'Shared Result'}
            </div>
          )}
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{iljuDescText}</p>
        </div>
        <div className="">
          {/* 내용시작 */}
          <div className="report-container">
            <section className="my-9">
              <h2 className="rt-card__title">
                {isEn ? 'Client Information' : <>{displayName}님의 정보</>}
              </h2>
              <div className="rt-id-card__body">
                <div className="rt-info-row">
                  <span className="rt-info-row__label">BIRTH</span>
                  <span className="rt-info-row__value">
                    {bd.year}.{bd.month}.{bd.day} {isTimeUnknown || <>/{bd.time}</>}
                  </span>
                </div>
                <div className="rt-info-row">
                  <span className="rt-info-row__label">GENDER</span>
                  <span className="rt-info-row__value">
                    {' '}
                    {isEn ? (
                      <span> {gender} </span>
                    ) : (
                      <span>{gender === 'male' ? ' 남성' : ' 여성'}</span>
                    )}
                  </span>
                </div>

                <div className="rt-saju-grid">
                  {isTimeUnknown || (
                    <div className="rt-saju-grid__item">
                      <span>시</span>
                      {saju.sky0}
                      {saju.grd0}
                    </div>
                  )}

                  <div className="rt-saju-grid__item">
                    <span>일</span>
                    {saju.sky1}
                    {saju.grd1}
                  </div>
                  <div className="rt-saju-grid__item">
                    <span>월</span>
                    {saju.sky2}
                    {saju.grd2}
                  </div>
                  <div className="rt-saju-grid__item">
                    <span>년</span>
                    {saju.sky3}
                    {saju.grd3}
                  </div>
                </div>
              </div>
            </section>
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
                  <h3 className="rt-ootd-item__value">{isEn ? 'Wealth & Finance' : '재물운'}</h3>
                  <p className="rt-ootd-item__label">{data?.lensInterpretations?.wealth?.summary}</p>
                </div>
                <p className="rt-card__text text-left">{data?.lensInterpretations?.wealth?.desc}</p>
              </div>

              <div className="rt-card">
                <div className="rt-ootd-item">
                  <h3 className="rt-ootd-item__value">{isEn ? 'Career & Success' : '직업운'}</h3>
                  <p className="rt-ootd-item__label">{data?.lensInterpretations?.job?.summary}</p>
                </div>
                <p className="rt-card__text text-left">{data?.lensInterpretations?.job?.desc}</p>
              </div>

              <div className="rt-card">
                <div className="rt-ootd-item">
                  <h3 className="rt-ootd-item__value">{isEn ? 'Love & Romance' : '애정운'}</h3>
                  <p className="rt-ootd-item__label">{data?.lensInterpretations?.love?.summary}</p>
                </div>
                <p className="rt-card__text text-left">{data?.lensInterpretations?.love?.desc}</p>
              </div>

              <div className="rt-card">
                <div className="rt-ootd-item">
                  <h3 className="rt-ootd-item__value">{isEn ? 'Health & Wellness' : '건강운'}</h3>
                  <p className="rt-ootd-item__label">{data?.lensInterpretations?.health?.summary}</p>
                </div>
                <p className="rt-card__text text-left">{data?.lensInterpretations?.health?.desc}</p>
              </div>

              <div className="rt-card">
                <div className="rt-ootd-item">
                  <h3 className="rt-ootd-item__value">{isEn ? 'Conflict & Stress' : '갈등 대응'}</h3>
                  <p className="rt-ootd-item__label">{data?.lensInterpretations?.conflict?.summary}</p>
                </div>
                <p className="rt-card__text text-left">{data?.lensInterpretations?.conflict?.desc}</p>
              </div>

              <div className="rt-card">
                <div className="rt-ootd-item">
                  <h3 className="rt-ootd-item__value">{isEn ? 'Relationships' : '인간관계'}</h3>
                  <p className="rt-ootd-item__label">{data?.lensInterpretations?.relationship?.summary}</p>
                </div>
                <p className="rt-card__text text-left">{data?.lensInterpretations?.relationship?.desc}</p>
              </div>
            </section>

            <section className="my-9">
              <h2 className="rt-card__title">{isEn ? 'Timing & Life Flow' : '시기와 흐름'}</h2>
              <p className="rt-card__text text-left mb-4">{data?.timingAndFlow?.principle}</p>
              <div className="rt-analysis-list__item gap-3">
                {data?.timingAndFlow?.daewoon?.map((item, idx) => (
                  <div key={idx} className="rt-gap2">
                    <span className="rt-analysis-list__sub-title">{item?.name}</span>
                    <p className="rt-card__text text-left">{item?.interpretation}</p>
                  </div>
                ))}
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
          {/* 내용끝 */}
        </div>
      </div>
      <AfterReport fortuneType="basic" />
    </div>
  );
};

export default ReportTemplateBasic;
