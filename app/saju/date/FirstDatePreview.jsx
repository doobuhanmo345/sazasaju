'use client';
import React from 'react';
import { useLanguage } from '@/contexts/useLanguageContext';
import ReportHid from '@/components/ReportHid';
import AnalyzeButton from '@/ui/AnalyzeButton';

export default function FirstDatePreview({ onStart, isDisabled }) {
  const { language } = useLanguage();

  return (
    <>
      <style>{`
        .rt-id-card {
          background: #fff;
          border-radius: 1.5rem;
          padding: 1.5rem;
          border: 1px solid #f1f5f9;
          box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
        }
        .dark .rt-id-card {
          background: #0f172a;
          border-color: #1e293b;
        }
        .rt-id-card__header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
          padding-bottom: 0.75rem;
          border-bottom: 1px dashed #f1f5f9;
        }
        .dark .rt-id-card__header {
          border-color: #1e293b;
        }
        .rt-id-card__name {
          font-weight: 900;
          font-size: 1.125rem;
          color: #1e293b;
        }
        .dark .rt-id-card__name {
          color: #f8fafc;
        }
        .rt-id-card__label {
          font-size: 0.625rem;
          font-weight: 900;
          background: #0f172a;
          color: #fff;
          padding: 0.25rem 0.5rem;
          border-radius: 9999px;
        }
        .rt-info-row {
          display: flex;
          justify-content: space-between;
          font-size: 0.75rem;
          margin-bottom: 0.5rem;
        }
        .rt-info-row__label {
          color: #94a3b8;
        }
        .rt-info-row__value {
          font-weight: 700;
          color: #334155;
        }
        .dark .rt-info-row__value {
          color: #cbd5e1;
        }
        .rt-saju-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 0.5rem;
          margin-top: 1rem;
          padding-top: 1rem;
          border-top: 1px solid #f1f5f9;
        }
        .dark .rt-saju-grid {
          border-color: #1e293b;
        }
        .rt-saju-grid__item {
          text-align: center;
          font-size: 0.625rem;
          font-weight: 700;
        }
        .rt-saju-grid__item span {
          display: block;
          font-size: 0.5rem;
          color: #94a3b8;
          margin-bottom: 0.25rem;
        }
        .rt-ootd-wrapper {
          display: flex;
          gap: 0.75rem;
          margin-bottom: 1rem;
        }
        .rt-ootd-item {
          flex: 1;
          background: #f8fafc;
          padding: 0.75rem;
          border-radius: 1rem;
          border: 1px solid #f1f5f9;
        }
        .dark .rt-ootd-item {
          background: #1e293b33;
          border-color: #1e293b;
        }
        .rt-ootd-item__label {
          display: block;
          font-size: 0.5rem;
          font-weight: 700;
          color: #f43f5e;
          margin-bottom: 0.25rem;
        }
        .rt-ootd-item__value {
          font-size: 0.8125rem;
          font-weight: 900;
        }
        .rt-analysis-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        .rt-analysis-list__item {
          background: #fff1f2;
          padding: 1rem;
          border-radius: 1.25rem;
          border: 1px solid #ffe4e6;
        }
        .dark .rt-analysis-list__item {
          background: #0f172a33;
          border-color: #f43f5e33;
        }
        .rt-analysis-list__sub-title {
          display: block;
          font-size: 0.625rem;
          font-weight: 900;
          color: #f43f5e;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 0.25rem;
        }
      `}</style>

      <div className="mx-4 my-10 flex flex-col items-center">
        <div className="flex items-center gap-2 px-3 py-1 rounded-full border border-rose-200 dark:border-rose-900 bg-rose-50/50 dark:bg-rose-900/20 mb-3">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
          </span>
          <span className="text-sm font-bold text-rose-600 dark:text-rose-400 tracking-tight uppercase">
            Preview Mode
          </span>
        </div>

        <div className="text-center">
          <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">
            {language === 'ko' ? '데이트날 최고의 결과를 가져오는 사자의 조언' : "A Perfect Date Plan by Saza"}
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed max-w-sm mx-auto break-keep text-center">
            {language === 'ko'
              ? '상대에게 잊히지 않을 첫인상을 남기는 비법과 성공적인 애프터를 위한 인사이트를 미리 확인하세요'
              : 'Get the secret to leaving an unforgettable impression and insights for a successful after-date'}
          </p>
        </div>
      </div>

      <div className="sjsj-report-container !mx-0 !p-0 bg-transparent">
        <div className="sjsj-content-inner !p-0">
          {/* Profile Card Mockup - Final alignment with ReportTemplateDate */}
          <div className="px-6 grayscale opacity-40 select-none pointer-events-none max-w-md mx-auto w-full mb-10">
            <div className="rt-id-card">
              <div className="rt-id-card__header">
                <span className="rt-id-card__name">CANDIDATE</span>
                <span className="rt-id-card__label">RO-ID</span>
              </div>
              <div className="rt-id-card__body">
                <div className="rt-info-row">
                  <span className="rt-info-row__label">BIRTH</span>
                  <span className="rt-info-row__value">1996.08.14 / 14:30</span>
                </div>
                <div className="rt-info-row">
                  <span className="rt-info-row__label">DATE</span>
                  <span className="rt-info-row__value">2026.01.26</span>
                </div>
                <div className="rt-info-row">
                  <span className="rt-info-row__label">STATUS</span>
                  <span className="rt-info-row__value">36.5°C</span>
                </div>
                <div className="rt-saju-grid">
                  <div className="rt-saju-grid__item"><span>시</span>庚 辰</div>
                  <div className="rt-saju-grid__item"><span>일</span>戊 午</div>
                  <div className="rt-saju-grid__item"><span>월</span>丙 申</div>
                  <div className="rt-saju-grid__item"><span>년</span>丙 子</div>
                </div>
              </div>
            </div>
          </div>

          {/* 1. Vibe & OOTD Section */}
          <section className="relative sjsj-section !p-0 !mb-10 overflow-hidden rounded-[2rem]">
            <div className="px-6 pt-6 opacity-40 grayscale select-none pointer-events-none max-w-md mx-auto w-full">
              <div className="sjsj-section-label">
                <h2 className="sjsj-subTitle">{language === 'ko' ? '01. 맞춤 OOTD 전략' : '01. Vibe & OOTD Strategy'}</h2>
              </div>
              <div className="rt-ootd-wrapper">
                <div className="rt-ootd-item">
                  <span className="rt-ootd-item__label">MOOD</span>
                  <span className="rt-ootd-item__value">"{language === 'ko' ? '세련된 지성미' : 'Sophisticated'}"</span>
                </div>
                <div className="rt-ootd-item">
                  <span className="rt-ootd-item__label">POINT</span>
                  <span className="rt-ootd-item__value">{language === 'ko' ? '실버 액세서리' : 'Silver Detail'}</span>
                </div>
              </div>
              <p className="sjsj-long-text">
                {language === 'ko'
                  ? '당신의 오늘은 부드러움보다는 차분하고 이성적인 매력이 돋보이는 날입니다. 셔츠나 블라우스에 심플한 시계를 매치하여 전문적인 느낌을...'
                  : "Your charm today is more calm and rational than soft. Match a shirt or blouse with a simple watch to give a professional feel..."}
              </p>
            </div>
            <ReportHid
              themeColor="#F43F5E"
              gradientColor="#FFF1F2"
              badge={['1', language === 'ko' ? '전략' : 'Strategy']}
              title={language === 'ko' ? <>상대를 사로잡는 <span className="text-rose-500">첫인상의 마법</span></> : <>The <span className="text-rose-500">Magic of First Impression</span> to Captivate</>}
              des={language === 'ko' ? '당신의 에너지와 가장 잘 어울리는 무드와 디테일한 스타일링 포인트를 제안합니다.' : 'Suggests the mood and detailed styling points that best match your energy.'}
              hClass="h-[600px]"
              mClass="mt-[-300px]"
            />
          </section>

          {/* 2. Psychological Insights Section */}
          <section className="relative sjsj-section !p-0 !mb-10 overflow-hidden rounded-[2rem]">
            <div className="px-6 pt-6 select-none pointer-events-none opacity-40 grayscale max-w-md mx-auto w-full">
              <div className="sjsj-section-label">
                <h2 className="sjsj-subTitle">{language === 'ko' ? '02. 관계 심리 리딩' : '02. Psychological Insights'}</h2>
              </div>
              <div className="rt-analysis-list mb-6">
                <div className="rt-analysis-list__item">
                  <span className="rt-analysis-list__sub-title">
                    {language === 'ko' ? '상대의 속마음' : "Partner's Inner Thoughts"}
                  </span>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    {language === 'ko' ? '당신의 예의 바르고 배려심 넘치는 모습에 안도하면서도, 호기심을 느끼고 있습니다.' : 'Relieved by your polite and caring manner, yet feeling curious.'}
                  </p>
                </div>
                <div className="rt-analysis-list__item">
                  <span className="rt-analysis-list__sub-title">
                    {language === 'ko' ? '대화 매너' : 'Talk Tip'}
                  </span>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    {language === 'ko' ? '최근 본 영화나 가벼운 취미 이야기로 화제를 전환하면 훨씬 자연스러운 대화가 가능합니다.' : 'Switching to light hobbies or recent movies will make the conversation much more natural.'}
                  </p>
                </div>
              </div>
            </div>
            <ReportHid
              themeColor="#F43F5E"
              gradientColor="#FFF1F2"
              badge={['2', language === 'ko' ? '심리' : 'Psychology']}
              title={language === 'ko' ? <>말하지 않아도 통하는 <span className="text-rose-500">심리 공략</span></> : <>The <span className="text-rose-500">Psychology Strategy</span> Connecting without Words</>}
              des={language === 'ko' ? '상대방의 마음을 편안하게 열고 깊은 교감을 이끌어내는 대화의 기술을 알려드립니다.' : 'Teaches conversation skills to open the partner’s heart comfortably and lead deep connection.'}
              hClass="h-[500px]"
              mClass="mt-[-250px]"
            />
          </section>
        </div>
      </div>
    </>
  );
}
