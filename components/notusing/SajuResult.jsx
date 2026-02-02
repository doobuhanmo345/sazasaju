'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { CalendarDaysIcon } from '@heroicons/react/24/outline';
import html2canvas from 'html2canvas';
import { calculateSajuData } from '@/lib/sajuLogic';
import {
  UI_TEXT,
  ENG_MAP,
  SHIP_SUNG_TABLE,
  SHIP_SUNG_MAP,
  PILLAR_DETAILS,
} from '@/data/saju_data';
import { ILJU_DATA, ILJU_DATA_EN } from '@/data/ilju_data';
import FourPillarVis from '@/components/FourPillarVis';
import { useLanguage } from '@/contexts/useLanguageContext';
import { useAuthContext } from '@/contexts/useAuthContext';
import { aiSajuStyle } from '@/data/saju_data_prompt';

const SajuResult = ({ aiResult }) => {
  const { userData } = useAuthContext();
  const { language } = useLanguage();
  const activeTabRef = useRef(0);
  const scrollElRef = useRef(null);

  const [sajuData, setSajuData] = useState(null);
  const [selectedDae, setSelectedDae] = useState(null);
  const [aiAnalysis] = useState(aiResult);
  const [loading] = useState(false);

  useEffect(() => {
    if (userData?.birthDate) {
      const { birthDate, gender, isTimeUnknown } = userData;
      const data = calculateSajuData(birthDate, gender, isTimeUnknown, language);
      if (data) {
        setSajuData(data);
        if (data.currentDaewoon) setSelectedDae(data.currentDaewoon);
      }
    }
  }, [userData, language]);

  const pureHtml = useMemo(() => {
    if (!aiAnalysis) return '';
    let cleanedResponse = aiAnalysis.trim();
    const startMarker = /^\s*```html\s*|^\s*```\s*/i;
    const endMarker = /\s*```\s*$/;
    cleanedResponse = cleanedResponse.replace(startMarker, '').replace(endMarker, '');
    return cleanedResponse.trim();
  }, [aiAnalysis]);

  const handleSubTitleClick = (index) => {
    if (index === undefined) index = activeTabRef.current;
    activeTabRef.current = index;

    const container = scrollElRef.current;
    if (!container) return;

    const tiles = container.querySelectorAll('.subTitle-tile');
    const cards = container.querySelectorAll('.report-card');

    if (tiles.length === 0) return;

    tiles.forEach((t) => t.classList.remove('active'));
    cards.forEach((c) => {
      c.style.display = 'none';
      c.classList.remove('active');
    });

    if (tiles[index]) tiles[index].classList.add('active');
    if (cards[index]) {
      cards[index].style.display = 'block';
      cards[index].classList.add('active');
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.handleSubTitleClick = handleSubTitleClick;
      return () => {
        delete window.handleSubTitleClick;
      };
    }
  }, []);

  const isEn = language === 'en';
  const t = (char) => (isEn ? ENG_MAP[char] || char : char);

  if (!userData) return <div className="p-10 text-center">유저 정보를 불러오는 중입니다...</div>;
  if (!sajuData) return <div className="p-10 text-center animate-pulse">데이터 계산 중...</div>;

  const { birthDate, gender, isTimeUnknown } = userData;
  const inputDate = birthDate && birthDate.includes('T') ? birthDate : `${birthDate}T00:00`;
  const inputGender = gender;

  const { saju, pillars, ohaengCount, relations, myShinsal, daewoonList, currentAge } = sajuData;
  const iljuKey = pillars.day;
  const iljuInfo = isEn ? ILJU_DATA_EN[iljuKey] || {} : ILJU_DATA[iljuKey] || {};
  const iljuTitle = iljuInfo?.title?.[inputGender]?.title || iljuKey;
  const iljuDescText = iljuInfo?.title?.[inputGender]?.desc || '';

  const getBarColor = (type) =>
    ({
      wood: 'bg-green-500',
      fire: 'bg-red-500',
      earth: 'bg-yellow-500',
      metal: 'bg-slate-400',
      water: 'bg-blue-600',
    })[type];

  return (
    <div
      className="max-w-2xl mx-auto flex flex-col items-center gap-6 transition-colors p-4"
      ref={scrollElRef}
    >
      {/* 1. 명식 카드 */}
      <div className="bg-white dark:bg-slate-800 w-full rounded-xl shadow-xl overflow-hidden border border-slate-100 dark:border-slate-700">
        <div className="h-2 w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
        <div className="p-4">
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <CalendarDaysIcon className="w-4 h-4" />
              <span>{inputDate.split('T')[0]}</span>
              <span>
                {inputGender === 'male' ? (isEn ? 'Male' : '남성') : isEn ? 'Female' : '여성'}
              </span>
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
        className="w-full bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 text-center border border-indigo-50 dark:border-slate-700"
      >
        <div className="mb-4">
          <span className="text-[10px] font-black tracking-[0.3em] text-indigo-400 uppercase">
            WHO AM I?
          </span>
          <h1 className="text-2xl font-extrabold text-slate-800 dark:text-white mt-1">
            {iljuTitle}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{iljuDescText}</p>
        </div>
        <div className="prose prose-stone dark:prose-invert leading-loose text-justify text-sm mx-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-6 gap-3">
              <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
              <p className="text-indigo-500 font-bold animate-pulse">
                {isEn ? 'AI is analyzing...' : 'AI가 분석 중입니다...'}
              </p>
            </div>
          ) : (
            <div>
              <div dangerouslySetInnerHTML={{ __html: pureHtml }} />
              <div dangerouslySetInnerHTML={{ __html: aiSajuStyle }} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SajuResult;
