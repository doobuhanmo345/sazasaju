'use client';
import React from 'react';
import { useLanguage } from '@/contexts/useLanguageContext';
import ReportHid from '@/components/ReportHid';
import AnalyzeButton from '@/ui/AnalyzeButton';

export default function SelBirthPreview({ onStart, isDisabled }) {
  const { language } = useLanguage();

  return (
    <div className="mt-16 text-left max-w-3xl mx-auto">
      <div className="mx-4 my-10 flex flex-col items-center">
        <div className="flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-200 bg-emerald-50/50 mb-3">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-sm font-bold text-emerald-600 tracking-tight uppercase">
            Preview Mode
          </span>
        </div>

        <div className="text-center">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">
            {language === 'ko' ? '아이에게 주는 첫 번째 명품 선물' : "The First Premium Gift for Your Baby"}
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed max-w-[280px] mx-auto break-keep text-center">
            {language === 'ko'
              ? '축복받은 운명의 기운을 담은 최적의 출산일과 상세 분석 리포트를 확인하세요'
              : 'Check the optimal birth dates with blessed destiny energy and a detailed analysis report'}
          </p>
        </div>
      </div>

      <div className="sjsj-report-container !mx-0 !p-0 bg-transparent">
        <div className="sjsj-content-inner !p-0">
          <section className="relative sjsj-section !p-0 !mb-10 overflow-hidden rounded-[2rem]">
            <div className="px-6 pt-6 opacity-40 grayscale contrast-75 select-none pointer-events-none max-w-md mx-auto w-full">
              {/* Profile Card Mockup - matching ReportTemplateSelBirth */}
              <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 mb-8 shadow-sm">
                <div className="flex justify-between items-center mb-6 pb-4 border-b border-dashed border-slate-100 dark:border-slate-800">
                  <span className="text-sm font-black text-slate-800 dark:text-white flex items-center gap-2">
                    <span className="text-lg">👶</span>
                    {language === 'ko' ? '출산 분석 대상' : 'Analysis Target'}
                  </span>
                  <span className="text-xs bg-emerald-600 text-white px-3 py-1 rounded-full font-black">PREMIUM</span>
                </div>
                <div className="grid grid-cols-2 gap-4 pb-4 border-b border-slate-50 dark:border-white/5 opacity-60">
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-slate-400 font-bold uppercase">{language === 'ko' ? '출산 예정일' : 'DUE DATE'}</span>
                    <span className="text-sm font-black text-emerald-600">2026.05.12</span>
                  </div>
                  <div className="flex flex-col gap-1 text-right">
                    <span className="text-xs text-slate-400 font-bold uppercase self-end">{language === 'ko' ? '아이 성별' : "BABY'S GENDER"}</span>
                    <span className="text-sm font-black text-slate-800 dark:text-slate-200 self-end uppercase">BOY</span>
                  </div>
                </div>
              </div>

              <div className="sjsj-section-label">
                <h2 className="sjsj-subTitle">{language === 'ko' ? '01. 아이의 운명 개요' : '01. Destiny Overview'}</h2>
              </div>
              <p className="sjsj-long-text">
                {language === 'ko'
                  ? '태어날 아이의 사주에 흐르는 강한 금(Metal)의 기운은 변치 않는 의지와 결단력을 상징합니다. 부모님의 기운과 조화를 이루어 대인관계에서 신뢰를 얻고...'
                  : "The strong Metal energy in your baby's destiny symbolizes unchanging will and determination. It harmonizes with the parents' energy to gain trust in relationships..."}
              </p>
            </div>
            <ReportHid
              gradientColor="#ECFDF5"
              themeColor="#10B981"
              badge={['1', language === 'ko' ? '개요' : 'Overview']}
              title={language === 'ko' ? <>아이의 미래를 그리는 <span className="text-emerald-500">운명의 지도</span></> : <>The <span className="text-emerald-500">Map of Destiny</span> for Baby's Future</>}
              des={language === 'ko' ? '아이의 타고난 기질과 잠재력을 명리학적으로 분석하여 핵심 테마를 제시합니다.' : "Provides core themes by analyzing the baby's innate temperament and potential through Sajuology."}
              hClass="h-[600px]"
              mClass="mt-[-300px]"
            />
          </section>

          {/* 2. Recommended Birth Dates Section */}
          <section className="relative sjsj-section !p-0 !mb-10 overflow-hidden rounded-[2rem]">
            <div className="px-6 pt-6 select-none pointer-events-none opacity-40 grayscale max-w-md mx-auto w-full">
              <div className="sjsj-section-label">
                <h2 className="sjsj-subTitle">{language === 'ko' ? '02. 추천 출산일 Best' : '02. Recommended Dates'}</h2>
              </div>
              <div className="space-y-4 mb-6">
                {[
                  {
                    date: '2026.05.12',
                    rank: 'Top 1',
                    why: language === 'ko' ? '식신생재격의 귀한 명조로, 평생 의식주가 풍족하고 재능을 발휘하기 좋은 날입니다.' : 'A precious destiny of financial flow, ensuring lifelong abundance and great talent expression.',
                    tip: language === 'ko' ? '이 날 태어난 아이는 창의적 활동을 통해 자아를 실현하는 힘이 강합니다.' : 'A child born on this day has a strong power to realize self through creative activities.'
                  }
                ].map((item, idx) => (
                  <div key={idx} className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-xl border border-emerald-100 dark:border-emerald-900/30 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-3 opacity-10">
                      <span className="text-4xl">👶</span>
                    </div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight">{item.date}</span>
                      <span className="text-xs font-bold px-2 py-1 bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 rounded shadow-sm">
                        TOP {idx + 1}
                      </span>
                    </div>
                    <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed mb-2">
                      <span className="font-bold mr-2 text-slate-900 dark:text-white block mb-1">{language === 'ko' ? '사주 분석' : 'Saju Analysis'}</span>
                      {item.why}
                    </p>
                  </div>
                ))}
              </div>
            </div>
            <ReportHid
              gradientColor="#ECFDF5"
              themeColor="#10B981"
              badge={['2', language === 'ko' ? '추천' : 'Best']}
              title={language === 'ko' ? <>축복 속에 선별된 <span className="text-emerald-500">최상의 출산일</span></> : <>The <span className="text-emerald-500">Best Dates</span> Selected in Blessing</>}
              des={language === 'ko' ? '부모님의 사주와 합을 이루며 아이의 운그릇을 극대화하는 날짜를 제안합니다.' : "Suggests dates that align with the parents' Saju and maximize the baby's destiny potential."}
              hClass="h-[600px]"
              mClass="mt-[-300px]"
            />
          </section>

          {/* 3. Dates to Avoid Section */}
          <section className="relative sjsj-section !p-0 !mb-8 overflow-hidden rounded-[2rem]">
            <div className="px-6 pt-6 select-none pointer-events-none opacity-40 grayscale max-w-md mx-auto w-full">
              <div className="sjsj-section-label">
                <h2 className="sjsj-subTitle">{language === 'ko' ? '03. 피해야 할 시기' : '03. Dates to Avoid'}</h2>
              </div>
              <div className="sjsj-info-banner !bg-red-50 !text-red-700 !border-red-100 mb-6">
                {language === 'ko'
                  ? '이 시기는 부모님과 아이의 기운이 서로 충돌하거나, 일간이 지나치게 신약해질 우려가 있어 신중한 검토가 필요합니다.'
                  : "During this period, energies may clash or the child's self-energy may become too weak, requiring careful review."}
              </div>
            </div>
            <ReportHid
              gradientColor="#ECFDF5"
              themeColor="#10B981"
              badge={['3', language === 'ko' ? '주의' : 'Caution']}
              title={language === 'ko' ? <>리스크를 최소화하는 <span className="text-red-500">신중한 선택</span></> : <>A <span className="text-red-500">Prudent Choice</span> to Minimize Risk</>}
              des={language === 'ko' ? '흉운이 겹치는 기간을 미리 파악하여 불필요한 시행착오와 손실을 예방해 드립니다.' : 'Identify overlapping periods of bad luck in advance to prevent unnecessary trial and error.'}
              hClass="h-[500px]"
              mClass="mt-[-250px]"
            />
          </section>
        </div>
      </div>

    </div>
  );
}
