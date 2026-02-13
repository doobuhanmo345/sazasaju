'use client';

import React, { useEffect, useState } from 'react';
import { reportStyleSimple } from '@/data/aiResultConstants';
import { useLanguage } from '@/contexts/useLanguageContext';
import { useAuthContext } from '@/contexts/useAuthContext';
import { toymdt, parseAiResponse } from '@/utils/helpers';
import { useLoading } from '@/contexts/useLoadingContext';
import AfterReport from '@/components/AfterReport';

import { useRouter } from 'next/navigation';

export default function ReportTemplateSelDate() {
  const { aiResult } = useLoading();
  const { language } = useLanguage();
  const { userData, selectedProfile } = useAuthContext();
  const targetProfile = selectedProfile || userData;
  const router = useRouter();

  const [data, setData] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // 1. aiResult가 있으면 우선 사용
    if (aiResult) {
      const parsedData = parseAiResponse(aiResult);
      if (parsedData) {
        setData(parsedData);
        return;
      }
    }


    // 2. 없으면 DB에서 로드
    if (userData && !aiResult) {
      const savedResult = userData?.usageHistory?.ZSelDate?.result;
      if (savedResult) {
        const parsed = parseAiResponse(savedResult);
        if (parsed) setData(parsed);
      } else {
        // 데이터 없음 -> 리다이렉트
        router.replace('/saju/seldate');
      }
    }
  }, [aiResult, userData, router]);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  if (!userData) return <div className="p-10 text-center text-slate-400 animate-pulse">Loading User Data...</div>;

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] gap-4">
        <div className="w-8 h-8 rounded-full border-4 border-indigo-200 border-t-indigo-500 animate-spin"></div>
        <div className="text-center text-indigo-400 font-medium animate-pulse text-sm">
          {language !== 'ko' ? 'Retrieving Analysis Results...' : '분석 결과를 불러오는 중입니다...'}
        </div>
      </div>
    );
  }

  const { displayName, birthDate, isTimeUnknown } = targetProfile;
  const saju = targetProfile.saju || {};
  const bd = toymdt(birthDate);

  return (
    <div className={`rt-container ${isLoaded ? 'is-active' : ''}`}>
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
        <p className="rt-desc animate-up">
          {language !== 'ko'
            ? 'Optimal dates selected based on your destiny energy.'
            : '당신의 사주 에너지 흐름에 가장 적합한 길일을 선별했습니다.'}
        </p>
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
              {saju.sky0 && <div className="rt-saju-grid__item"><span>Hour</span>{saju.sky0} {saju.grd0}</div>}
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
              <span className="rt-ootd-item__value">{data.purpose}</span>
            </div>
            <div className="rt-ootd-item">
              <span className="rt-ootd-item__label">KEYWORD</span>
              <span className="rt-ootd-item__value">{data.keyword}</span>
            </div>
          </div>
          <p className="rt-card__text">{data.overview}</p>
        </section>

        <section className="rt-card animate-up">
          <h2 className="rt-card__title">
            {language !== 'ko' ? '02. Top Recommendations' : '02. 최적의 날짜 추천'}
          </h2>
          <div className="space-y-4">
            {data.bestDates && data.bestDates.map((item, idx) => (
              <div key={idx} className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg flex flex-col gap-2 border border-slate-100 dark:border-slate-700">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-rose-500">{item.date}</span>
                  <span className="text-xs font-bold px-2 py-1 bg-white dark:bg-slate-700 rounded shadow-sm border border-slate-200 dark:border-slate-600">
                    Top {idx + 1}
                  </span>
                </div>
                <p className="text-sm text-slate-700 dark:text-slate-300"><span className="font-bold mr-2">Why?</span>{item.reason}</p>
                <p className="text-xs text-slate-500 font-medium"><span className="font-bold mr-2 text-indigo-500">Tip</span>{item.tip}</p>
              </div>
            ))}
          </div>
        </section>

        {data.caution && (
          <section className="rt-card animate-up">
            <h2 className="rt-card__title">{language !== 'ko' ? '03. Dates to Avoid' : '03. 피해야 할 시기'}</h2>
            <div className="rt-analysis-list__item is-warning"><p>{data.caution}</p></div>
          </section>
        )}


        <AfterReport fortuneType="seldate" data={data?.summary} />
      </main>
    </div>
  );
}