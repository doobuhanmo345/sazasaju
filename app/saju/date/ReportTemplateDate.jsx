'use client';

import React, { useEffect, useState } from 'react';
import { reportStyleSimple } from '@/data/aiResultConstants';
import { useLanguage } from '@/contexts/useLanguageContext';
import { useAuthContext } from '@/contexts/useAuthContext';
import { toymdt } from '@/utils/helpers';
import { useLoading } from '@/contexts/useLoadingContext';
import { parseAiResponse } from '@/utils/helpers';
import AfterReport from '@/components/AfterReport';
import { useRouter } from 'next/navigation';

const ReportTemplateDate = ({ }) => {
  const { aiResult } = useLoading();
  const { language } = useLanguage();
  const { userData, selectedProfile } = useAuthContext();
  const router = useRouter();

  const targetProfile = selectedProfile || userData;

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

    // 2. 없으면 DB에서 로드 (persistence)
    if (userData && !aiResult) {
      // NOTE: First Date uses 'dailySpecific' type with 'firstdate' subtype -> Zfirstdate
      const savedResult = userData?.usageHistory?.Zfirstdate?.result;
      if (savedResult) {
        const parsed = parseAiResponse(savedResult);
        if (parsed) {
          setData(parsed);
        }
      } else {
        // No Data -> Redirect
        router.replace('/saju/date');
      }
    }
  }, [aiResult, userData, router]);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  if (!userData) {
    return <div className="p-10 text-center text-rose-500 animate-pulse">유저 정보를 불러오는 중입니다...</div>;
  }

  // [NEW] Loading State (match Basic Saju style)
  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] gap-4">
        <div className="w-8 h-8 rounded-full border-4 border-rose-200 border-t-rose-500 animate-spin"></div>
        <div className="text-center text-rose-400 font-medium animate-pulse text-sm">
          {language === 'en' ? 'Retrieving Date Analysis...' : '데이트 운세 데이터를 불러오는 중...'}
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

      {/* [RT-HEADER] 메인 타이틀 영역 */}
      <header className="rt-header">
        <div className="rt-tag animate-up">
          {language === 'en' ? 'PREMIUM ROMANCE DOSSIER' : 'PREMIUM ROMANCE DOSSIER'}
        </div>
        <h1 className="rt-main-title animate-up">
          {displayName}
          {language === 'en' ? "'s" : '님을 위한'}
          <br />
          <span className="text-highlight">
            {language === 'en' ? 'First Encounter Destiny Report' : '첫만남 운명 리포트'}
          </span>
        </h1>
        <p className="rt-desc animate-up">
          {language === 'en'
            ? 'A custom analysis combining your destiny energy with meeting data.'
            : '사주 에너지와 현재의 만남 데이터를 결합한 커스텀 분석입니다.'}
        </p>
      </header>

      {/* [RT-PROFILE] 유저 정보 카드 섹션 */}
      <section className="rt-section rt-profile animate-up">
        <div className="rt-id-card">
          <div className="rt-id-card__header">
            <span className="rt-id-card__name">{displayName}</span>
            <span className="rt-id-card__label">PERSONAL ID</span>
          </div>
          <div className="rt-id-card__body">
            <div className="rt-info-row">
              <span className="rt-info-row__label">{language === 'en' ? 'BIRTH' : 'BIRTH'}</span>
              <span className="rt-info-row__value">
                {bd.year}.{bd.month}.{bd.day}
                {isTimeUnknown || <>/{bd.time}</>}
              </span>
            </div>
            <div className="rt-info-row">
              <span className="rt-info-row__label">{language === 'en' ? 'DATE' : 'DATE'}</span>
              <span className="rt-info-row__value">{data.meetingDate}</span>
            </div>
            <div className="rt-info-row">
              <span className="rt-info-row__label">{language === 'en' ? 'STATUS' : 'STATUS'}</span>
              <span className="rt-info-row__value">{data.temperature}</span>
            </div>
            <div className="rt-saju-grid">
              {saju.grd0 && (
                <div className="rt-saju-grid__item">
                  <span>{language === 'en' ? 'Hour' : '시'}</span>
                  {saju.sky0} {saju.grd0}
                </div>
              )}

              <div className="rt-saju-grid__item">
                <span>{language === 'en' ? 'Day' : '일'}</span>
                {saju.sky1} {saju.grd1}
              </div>
              <div className="rt-saju-grid__item">
                <span>{language === 'en' ? 'Month' : '월'}</span>
                {saju.sky2} {saju.grd2}
              </div>
              <div className="rt-saju-grid__item">
                <span>{language === 'en' ? 'Year' : '년'}</span>
                {saju.sky3} {saju.grd3}
              </div>
            </div>
          </div>
        </div>
      </section>

      <main className="rt-main-content">
        {/* 01. OOTD 가이드 */}
        <section className="rt-card animate-up">
          <h2 className="rt-card__title">
            {language === 'en' ? '01. Vibe & OOTD Strategy' : '01. 상대에게 각인될 OOTD 전략'}
          </h2>
          <div className="rt-ootd-wrapper">
            <div className="rt-ootd-item">
              <span className="rt-ootd-item__label">MOOD</span>
              <span className="rt-ootd-item__value">"{data.section01?.mood}"</span>
            </div>
            <div className="rt-ootd-item">
              <span className="rt-ootd-item__label">POINT</span>
              <span className="rt-ootd-item__value">{data.section01?.point}</span>
            </div>
          </div>
          <p className="rt-card__text">{data.section01?.description}</p>
        </section>

        {/* 02. 심리 분석 */}
        <section className="rt-card animate-up">
          <h2 className="rt-card__title">
            {language === 'en' ? '02. Psychological Insights' : '02. 관계 심리 인사이트'}
          </h2>
          <div className="rt-analysis-list">
            <div className="rt-analysis-list__item">
              <span className="rt-analysis-list__sub-title">
                {language === 'en' ? "Partner's Inner Thoughts" : '상대의 속마음'}
              </span>
              <p>{data.section02?.innerThoughts}</p>
            </div>
            <div className="rt-analysis-list__item is-warning">
              <span className="rt-analysis-list__sub-title">
                {language === 'en' ? 'Conversation Warnings' : '대화 주의사항'}
              </span>
              <p>{data.section02?.warning}</p>
            </div>
            <div className="rt-analysis-list__item is-success">
              <span className="rt-analysis-list__sub-title">
                {language === 'en' ? 'Green Light Signals' : '확실한 호감 신호'}
              </span>
              <p>{data.section02?.signal}</p>
            </div>
          </div>
        </section>

        {/* 03. 케미 지수 */}
        <section className="rt-card animate-up">
          <h2 className="rt-card__title">
            {language === 'en' ? '03. Chemistry & Timing' : '03. 케미스트리 & 타이밍'}
          </h2>
          <div className="rt-score-box">
            <div className="rt-score-box__label">
              {language === 'en' ? 'Interaction Chemistry Score' : '대화 티키타카 지수'}
            </div>
            <div className="rt-score-box__val">
              {data.section03?.chemistryScore}
              <span>{language === 'en' ? 'pt' : '점'}</span>
            </div>
            <div className="rt-progress">
              <div
                className="rt-progress__fill"
                style={{ width: isLoaded ? `${data.section03?.chemistryScore}%` : '0%' }}
              ></div>
            </div>
          </div>
          <div className="rt-timing-grid">
            <div className="rt-timing-grid__item">
              <span>{language === 'en' ? 'Golden Time' : '골든 타임'}</span>
              <strong>{data.section03?.goldenTime}</strong>
            </div>
            <div className="rt-timing-grid__item">
              <span>{language === 'en' ? 'Recommended Place' : '추천 장소'}</span>
              <strong>{data.section03?.location}</strong>
            </div>
          </div>
        </section>

        {/* 04. 애프터 가이드 */}
        <section className="rt-card animate-up">
          <h2 className="rt-card__title">
            {language === 'en' ? '04. After Guide & Future' : '04. 애프터 가이드 & 미래'}
          </h2>
          <div className="rt-tip-box">
            <span className="rt-tip-box__label">
              {language === 'en' ? 'Who should reach out first?' : '누가 먼저 연락할까?'}
            </span>
            <p>{data.section04?.contactAdvice}</p>
          </div>
          <div className="rt-final-badge">
            {language === 'en' ? 'Possibility of Romance' : '연인 발전 가능성'}{' '}
            <span>{data.section04?.possibility}</span>
          </div>
        </section>
      </main>

      <footer className="rt-footer animate-up">
        <button className="rt-btn-primary">
          {language === 'en' ? 'Save Full Report' : '전체 리포트 저장하기'}
        </button>
      </footer>

      <AfterReport />
    </div>
  );
};

export default ReportTemplateDate;
