'use client';

import { useMemo, useState, useEffect } from 'react';
import { Solar } from 'lunar-javascript';
import { CalendarDaysIcon } from '@heroicons/react/24/outline';
import {
  GOEGANG_LIST,
  BAEKHO_LIST,
  SAMHAP_MAP,
  OHAENG_MAP,
  RELATION_RULES,
  GWIN_MAP,
  JIJANGGAN_MAP,
  getRomanizedIlju,
  getTenGodType,
  ohaengKorean,
} from '@/data/sajuInt';
import { useAuthContext } from '@/contexts/useAuthContext';
import { ENG_MAP, UI_TEXT, HANJA_MAP } from '@/data/constants';
import { ILJU_DATA, ILJU_DATA_EN } from '@/data/ilju_data';
import html2canvas from 'html2canvas';
import FourPillarVis from '@/components/FourPillarVis';
import { useLanguage } from '@/contexts/useLanguageContext';
import { getEng } from '@/lib/helpers';

const BasicAna = ({ }) => {
  const { language } = useLanguage();
  const [selectedDae, setSelectedDae] = useState(null);
  const { userData } = useAuthContext();
  const handleShare = async (id) => {
    const el = document.getElementById(id);
    if (!el) {
      alert('share-card를 찾을 수 없습니다.');
      return;
    }

    const prevVisibility = el.style.visibility;

    try {
      el.style.visibility = 'visible';

      const imgs = Array.from(el.querySelectorAll('img'));
      await Promise.all(
        imgs.map(
          (img) =>
            new Promise((resolve) => {
              if (img.complete) return resolve();
              img.onload = () => resolve();
              img.onerror = () => resolve();
            }),
        ),
      );

      if (typeof document !== 'undefined' && document.fonts?.ready) {
        await document.fonts.ready;
      }

      const canvas = await html2canvas(el, {
        scale: 2,
        useCORS: true,
        backgroundColor: null,
        logging: false,
      });

      const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png', 1));
      if (!blob) throw new Error('canvas toBlob 실패');

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'share-card.png';
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert('캡쳐 실패: 이미지 CORS 또는 렌더링 문제');
    } finally {
      el.style.visibility = prevVisibility || 'hidden';
    }
  };
  const inputDate = userData?.birthDate;
  const saju = userData?.saju;
  const inputGender = userData?.gender;
  const isTimeUnknown = false;
  const handleSetViewMode = () => { };

  const sajuData = useMemo(() => {
    if (!inputDate || !inputDate.includes('T')) return null;

    try {
      const [datePart, timePart] = inputDate.split('T');
      const [year, month, day] = datePart.split('-').map(Number);
      const [hour, min] = timePart.split(':').map(Number);

      const solar = Solar.fromYmdHms(year, month, day, hour, min, 0);
      const lunar = solar.getLunar();
      const eightChar = lunar.getEightChar();

      const allChars = [
        saju?.sky3,
        saju?.grd3,
        saju?.sky2,
        saju?.grd2,
        saju?.sky1,
        saju?.grd1,
        saju?.sky0,
        saju?.grd0,
      ];

      const ohaengCount = { wood: 0, fire: 0, earth: 0, metal: 0, water: 0 };
      allChars.forEach((char) => {
        const type = OHAENG_MAP[char];
        if (type) ohaengCount[type]++;
      });

      const dayMaster = allChars[4];
      const dayTypes = [OHAENG_MAP[allChars[4]], OHAENG_MAP[allChars[5]]];
      const monthTypes = [OHAENG_MAP[allChars[2]], OHAENG_MAP[allChars[3]]];

      const maxOhaeng = Object.entries(ohaengCount).reduce((a, b) => {
        if (a[1] !== b[1]) {
          return a[1] > b[1] ? a : b;
        }
        const getScore = (type) => {
          if (dayTypes.includes(type)) return 2;
          if (monthTypes.includes(type)) return 1;
          return 0;
        };
        return getScore(a[0]) >= getScore(b[0]) ? a : b;
      });

      const branches = {
        year: allChars[1],
        month: allChars[3],
        day: allChars[5],
        time: allChars[7],
      };
      const stems = {
        year: allChars[0],
        month: allChars[2],
        day: allChars[4],
        time: allChars[6],
      };
      const pillars = {
        year: allChars[0] + allChars[1],
        month: allChars[2] + allChars[3],
        day: allChars[4] + allChars[5],
        time: allChars[6] + allChars[7],
      };

      const isEn = language !== 'ko';
      const ilju = pillars.day;

      const calculateShinsal = (pillars, branches, dayMaster) => {
        const result = [];
        const criteriaBranches = [branches.year, branches.day];

        criteriaBranches.forEach((criteria, index) => {
          const baseLabel =
            index === 0
              ? isEn ? 'Based on Year' : '년지기준'
              : isEn ? 'Based on Day' : '일지기준';

          const group = SAMHAP_MAP[criteria];
          if (!group) return;

          const [element, yeokma, dohwa, hwagae] = group;

          Object.values(branches).forEach((branch) => {
            if (branch === yeokma && index === 0) {
              result.push({
                name: isEn ? 'Yeokma-sal' : '역마살',
                type: baseLabel,
                desc: isEn ? 'Movement, change, and travel' : '이동수, 변동',
              });
            }
            if (branch === dohwa && index === 0) {
              result.push({
                name: isEn ? 'Dohwa-sal' : '도화살',
                type: baseLabel,
                desc: isEn ? 'Popularity, charm, and attraction' : '인기, 매력',
              });
            }
            if (branch === hwagae) {
              result.push({
                name: isEn ? 'Hwagae-sal' : '화개살',
                type: baseLabel,
                desc: isEn ? 'Art, religion, and reflection' : '예술, 종교, 복귀',
              });
            }
          });
        });

        if (BAEKHO_LIST.includes(pillars.day)) {
          result.push({
            name: isEn ? 'Baekho-sal' : '백호살',
            type: isEn ? 'Day Pillar' : '일주',
            desc: isEn ? 'Strong energy, professionalism, and intensity' : '강한 기운, 혈광지사 조심, 프로페셔널',
          });
        }

        if (GOEGANG_LIST.includes(pillars.day)) {
          result.push({
            name: isEn ? 'Goegang-sal' : '괴강살',
            type: isEn ? 'Day Pillar' : '일주',
            desc: isEn ? 'Leadership, intelligence, and strong character' : '우두머리 기질, 총명, 강한 리더십',
          });
        }

        const targets = GWIN_MAP[dayMaster];
        if (targets) {
          Object.values(branches).forEach((branch) => {
            if (targets.includes(branch)) {
              result.push({
                name: isEn ? 'noble gold star' : '천을귀인',
                type: isEn ? 'Day Master Basis' : '일간기준',
                desc: isEn ? 'The ultimate auspicious star, helper, and protector' : '최고의 길신, 조력자, 액땜',
              });
            }
          });
        }

        return [...new Map(result.map((item) => [item.name, item])).values()];
      };

      let finalShinsal = calculateShinsal(pillars, branches, dayMaster);
      const nobleTargets = GWIN_MAP[dayMaster] || [];

      nobleTargets.forEach((target) => {
        Object.entries(branches).forEach(([pos, branch]) => {
          if (branch === target) {
            const posName = {
              year: language !== 'ko' ? 'Year Pillar (Ancestors)' : '년지(조상자리)',
              month: language !== 'ko' ? 'Month Pillar (Social)' : '월지(사회자리)',
              day: language !== 'ko' ? 'Day Pillar (Spouse)' : '일지(배우자자리)',
              time: language !== 'ko' ? 'Hour Pillar (Children/Late Life)' : '시지(자식/말년자리)',
            }[pos];

            finalShinsal.push({
              name: language !== 'ko' ? 'noble gold star' : '천을귀인',
              type: language !== 'ko' ? 'Great Auspicious Star' : '대길신',
              desc: language !== 'ko'
                ? `Located in '${ENG_MAP[branch]}' of your ${posName}. This is the ultimate auspicious star that turns bad luck into good and brings help from noble people at decisive moments.`
                : `사주의 ${posName}인 '${branch}'에 위치하고 있습니다. 이는 흉을 길로 바꾸고 결정적인 순간에 귀인의 도움을 받는 최고의 길신입니다`,
            });
          }
        });
      });

      const gongmangHanja = lunar.getDayXunKong();
      const gongmangTargets = gongmangHanja.split('').map((h) => HANJA_MAP[h]);
      Object.entries(branches).forEach(([pos, branch]) => {
        if (pos === 'day') return;
        if (gongmangTargets.includes(branch)) {
          const posName = {
            year: language !== 'ko' ? 'Year Pillar (Early Life)' : '년지(초년)',
            month: language !== 'ko' ? 'Month Pillar (Social)' : '월지(청년/사회)',
            time: language !== 'ko' ? 'Hour Pillar (Late Life)' : '시지(말년)',
          }[pos];

          finalShinsal.push({
            name: language !== 'ko' ? 'gongmang' : '공망',
            type: language !== 'ko' ? 'emptiness' : '공허',
            desc: language !== 'ko'
              ? `${posName} contains the character '${ENG_MAP[branch]}', which is in Gongmang (Emptiness). During this period, you will find more peace by pursuing spiritual or philosophical values rather than material greed.`
              : `${posName}에 해당하는 '${branch}' 글자가 비어있는 공망입니다. 해당 시기에는 현실적 욕심보다 정신적, 철학적 가치를 추구할 때 마음이 편안해집니다`,
          });
        }
      });

      finalShinsal = [
        ...new Map(finalShinsal.map((item) => [item.name + item.desc, item])).values(),
      ];

      const relations = [];
      const checkPair = (b1, b2, targetName) => {
        const key1 = [b1, b2].join('');
        const key2 = [b2, b1].join('');
        const rule = RELATION_RULES[key1] || RELATION_RULES[key2];
        if (rule) {
          relations.push({ ...rule, target: targetName });
        }
      };

      checkPair(branches.day, branches.month, isEn ? 'Month Branch (Society)' : '월지(사회)');
      checkPair(branches.day, branches.time, isEn ? 'Time Branch (Children)' : '시지(자식)');
      checkPair(branches.day, branches.year, isEn ? 'Year Branch (Ancestors)' : '년지(조상)');
      checkPair(stems.day, stems.month, isEn ? 'Month Stem (Society)' : '월간(사회)');
      checkPair(stems.day, stems.time, isEn ? 'Time Stem (Children)' : '시간(자녀)');
      checkPair(stems.day, stems.year, isEn ? 'Year Stem (Ancestors)' : '년간(조상)');

      const myIljuData = isEn ? ILJU_DATA_EN[ilju] : ILJU_DATA[ilju];

      const jijangganList = {
        time: { branch: branches.time, ...JIJANGGAN_MAP[branches.time] },
        day: { branch: branches.day, ...JIJANGGAN_MAP[branches.day] },
        month: { branch: branches.month, ...JIJANGGAN_MAP[branches.month] },
        year: { branch: branches.year, ...JIJANGGAN_MAP[branches.year] },
      };

      const daewoonList = [];
      let currentDaewoon = null;
      let currentAgeResult = 0;

      try {
        const genderVal = inputGender === 'male' ? 1 : 0;
        const yun = eightChar.getYun(genderVal);
        const daewoonRaw = yun.getDaYun();
        currentAgeResult = new Date().getFullYear() - solar.getYear() + 1;

        if (daewoonRaw && Array.isArray(daewoonRaw)) {
          for (let i = 0; i < daewoonRaw.length; i++) {
            const dy = daewoonRaw[i];
            const startAge = dy.getStartAge();
            const endAge = dy.getEndAge();
            const ganHanja = dy.getGanZhi()[0];
            const zhiHanja = dy.getGanZhi()[1];
            const ganKor = HANJA_MAP[ganHanja];
            const zhiKor = HANJA_MAP[zhiHanja];
            const name = ganKor + zhiKor;
            const ganOhaeng = OHAENG_MAP[ganKor];
            const zhiOhaeng = OHAENG_MAP[zhiKor];

            const item = {
              startAge,
              endAge,
              name,
              ganKor,
              zhiKor,
              ganOhaeng,
              zhiOhaeng,
              desc: `${ganKor}(${ganOhaeng}) / ${zhiKor}(${zhiOhaeng})`,
            };

            const nextDy = daewoonRaw[i + 1];
            const nextStartAge = nextDy ? nextDy.getStartAge() : 999;

            if (currentAgeResult >= startAge && currentAgeResult < nextStartAge) {
              item.isCurrent = true;
              currentDaewoon = item;
            } else {
              item.isCurrent = false;
            }

            daewoonList.push(item);
          }
        }
      } catch (e) {
        console.error('대운 계산 중 오류 발생:', e);
      }

      return {
        pillars,
        myShinsal: finalShinsal,
        myIljuData,
        ilju,
        ohaengCount,
        maxOhaeng,
        relations,
        daewoonList,
        currentDaewoon,
        currentAge: currentAgeResult,
        jijangganList,
      };
    } catch (err) {
      console.error('사주 계산 전체 오류:', err);
      return null;
    }
  }, [saju, inputGender, language, inputDate]);
  console.log(sajuData)
  useEffect(() => {
    if (sajuData?.currentDaewoon) {
      setSelectedDae(sajuData.currentDaewoon);
    }
  }, [sajuData]);

  const handleDaeClick = (dae) => {
    setSelectedDae(dae);
  };

  const getDaewoonStory = (dae, currentAge, pillars) => {
    if (!dae || !pillars?.day) return '';
    const isEn = language !== 'ko';
    const userGan = pillars.day.charAt(0);
    const dGanKor = dae.ganKor;

    // 이 부분은 나중에 saju_data.js로 옮기는 것이 좋음
    const shipSungTable = {
      갑: { 갑: '비견', 을: '겁재', 병: '식신', 정: '상관', 무: '편재', 기: '정재', 경: '편관', 신: '정관', 임: '편인', 계: '정인' },
      을: { 을: '비견', 갑: '겁재', 정: '식신', 병: '상관', 기: '편재', 무: '정재', 신: '편관', 경: '정관', 계: '편인', 임: '정인' },
      병: { 병: '비견', 정: '겁재', 무: '식신', 기: '상관', 경: '편재', 신: '정재', 임: '편관', 계: '정관', 갑: '편인', 을: '정인' },
      정: { 정: '비견', 병: '겁재', 기: '식신', 무: '상관', 신: '편재', 경: '정재', 계: '편관', 임: '정관', 을: '편인', 갑: '정인' },
      무: { 무: '비견', 기: '겁재', 경: '식신', 신: '상관', 임: '편재', 계: '정재', 갑: '편관', 을: '정관', 병: '편인', 정: '정인' },
      기: { 기: '비견', 무: '겁재', 신: '식신', 경: '상관', 계: '편재', 임: '정재', 을: '편관', 갑: '정관', 정: '편인', 병: '정인' },
      경: { 경: '비견', 신: '겁재', 임: '식신', 계: '상관', 갑: '편재', 을: '정재', 병: '편관', 정: '정관', 무: '편인', 기: '정인' },
      신: { 신: '비견', 경: '겁재', 계: '식신', 임: '상관', 을: '편재', 갑: '정재', 정: '편관', 병: '정관', 기: '편인', 무: '정인' },
      임: { 임: '비견', 계: '겁재', 갑: '식신', 을: '상관', 병: '편재', 정: '정재', 무: '편관', 기: '정관', 경: '편인', 신: '정인' },
      계: { 계: '비견', 임: '겁재', 을: '식신', 갑: '상관', 정: '편재', 병: '정재', 기: '편관', 무: '정관', 신: '편인', 경: '정인' },
    };

    const calculatedShipSung = shipSungTable[userGan]?.[dGanKor] || '대운';
    const shipSungMap = {
      비견: { ko: '주체성과 자립', en: 'Independence' },
      겁재: { ko: '경쟁과 사회적 변동', en: 'Competition' },
      식신: { ko: '창의력과 풍요', en: 'Creativity' },
      상관: { ko: '혁신과 도전', en: 'Innovation' },
      편재: { ko: '재물 확장과 모험', en: 'Wealth Expansion' },
      정재: { ko: '안정적 결실과 성실', en: 'Stability' },
      편관: { ko: '책임감과 권위', en: 'Discipline' },
      정관: { ko: '명예와 사회적 인정', en: 'Honor' },
      편인: { ko: '특수 기술과 통찰', en: 'Intuition' },
      정인: { ko: '지원과 학문적 성취', en: 'Support' },
    };

    const ohaengNames = {
      wood: isEn ? 'Wood' : '나무(木)',
      fire: isEn ? 'Fire' : '불(火)',
      earth: isEn ? 'Earth' : '흙(土)',
      metal: isEn ? 'Metal' : '금(金)',
      water: isEn ? 'Water' : '물(水)',
    };

    return `
      <p class="mb-2">이 시기는 <b>${calculatedShipSung}</b>의 기운이 강하게 작용하여, <b>${isEn ? shipSungMap[calculatedShipSung].en : shipSungMap[calculatedShipSung].ko}</b>에 집중하게 되는 10년입니다.</p>
      <p>${dae.ganKor}(${ohaengNames[dae.ganOhaeng]})와 ${dae.zhiKor}(${ohaengNames[dae.zhiOhaeng]})의 조화는 당신의 삶에 새로운 환경과 기회를 제공할 것입니다.</p>
    `;
  };

  if (!sajuData) return null;

  const { ilju, myIljuData, myShinsal, ohaengCount, maxOhaeng, relations, daewoonList, currentAge } = sajuData;

  const getBarColor = (type) => ({
    wood: 'bg-green-500',
    fire: 'bg-red-500',
    earth: 'bg-yellow-500',
    metal: 'bg-slate-400',
    water: 'bg-blue-600',
  })[type];

  const safeIljuRom = ilju ? getRomanizedIlju(ilju) : 'gapja';
  const iljuImgPath = `/images/ilju/${safeIljuRom}_${safeGender}.png`;

  return (
    <div className="w-full flex flex-col gap-6 pt-4 pb-20" id="basic-ana-container">
      <div id="basic-ana-card" className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl overflow-hidden border border-slate-100 dark:border-slate-800">
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-6 text-white text-center">
          <CalendarDaysIcon className="w-10 h-10 mx-auto mb-2 opacity-80" />
          <h2 className="text-2xl font-bold">
            {language !== 'ko' ? 'Innate Destiny Analysis' : '나의 선천적 기질 분석'}
          </h2>
          <p className="text-sm opacity-90 mt-1">
            {language !== 'ko' ? 'Nature, Stars, and Life Path' : '타고난 성향과 운명의 흐름'}
          </p>
        </div>

        <div className="p-6">
          <div className="flex justify-center mb-8">
            <FourPillarVis isTimeUnknown={isTimeUnknown} saju={saju} />
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl mb-8">
            <div className="flex w-full h-4 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-700">
              {Object.entries(ohaengCount).map(([type, count]) => (
                <div
                  key={type}
                  style={{ width: `${(count / (isTimeUnknown ? 6 : 8)) * 100}%` }}
                  className={getBarColor(type)}
                />
              ))}
            </div>
            <div className="flex justify-between mt-2 text-xs text-slate-500 dark:text-slate-400 font-medium">
              {Object.entries(ohaengCount).map(([type, count]) => count > 0 && (
                <span key={type}>{type.toUpperCase()} {count}</span>
              ))}
            </div>
          </div>

          <div className="space-y-8">
            <section>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-1.5 h-6 bg-indigo-500 rounded-full"></div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                  {language !== 'ko' ? 'Personality Signature' : '나의 핵심 기질'}
                </h3>
              </div>
              <div className="bg-indigo-50/50 dark:bg-indigo-900/10 rounded-2xl p-6 border border-indigo-100 dark:border-indigo-900/30 text-center">
                <img src={iljuImgPath} className="w-32 h-32 mx-auto mb-4 drop-shadow-lg" alt="Ilju" />
                <h4 className="text-xl font-extrabold text-slate-900 dark:text-white mb-2">
                  {myIljuData?.title[inputGender]?.title}
                </h4>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-md mx-auto">
                  {myIljuData?.title[inputGender]?.desc}
                </p>
              </div>
              <ul className="mt-6 space-y-3">
                {myIljuData?.desc[inputGender]?.map((item, i) => (
                  <li key={i} className="flex gap-3 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-indigo-400 mt-2"></span>
                    {item}
                  </li>
                ))}
              </ul>
            </section>

            <section>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-1.5 h-6 bg-amber-500 rounded-full"></div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                  {language !== 'ko' ? 'Energy Chemistry' : '에너지 상호작용 (합/충)'}
                </h3>
              </div>
              <div className="grid grid-cols-1 gap-3">
                {relations.map((rel, i) => (
                  <div key={i} className={`p-4 rounded-xl border ${['합', '천간합', '육합', 'Harmony'].includes(rel[language]?.type) ? 'bg-indigo-50/50 border-indigo-100 dark:bg-indigo-900/5 dark:border-indigo-900/30' : 'bg-amber-50/50 border-amber-100 dark:bg-amber-900/5 dark:border-amber-900/30'}`}>
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-bold text-slate-800 dark:text-slate-200">{rel[language].name}</span>
                      <span className={`text-xs font-black px-2 py-0.5 rounded shadow-sm ${['합', '천간합', '육합', 'Harmony'].includes(rel[language]?.type) ? 'bg-indigo-500 text-white' : 'bg-amber-500 text-white'}`}>
                        {rel[language].type}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{rel[language].desc}</p>
                  </div>
                ))}
                {relations.length === 0 && (
                  <p className="text-sm text-slate-500 italic py-4 text-center">
                    {language !== 'ko' ? 'Your energies flow peacefully without major clashes.' : '특별한 충돌 없이 기운이 조화롭게 흐르고 있습니다.'}
                  </p>
                )}
              </div>
            </section>

            <section>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-1.5 h-6 bg-emerald-500 rounded-full"></div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                  {language !== 'ko' ? 'Special Fate Stars' : '나의 운명을 돕는 글자 (신살)'}
                </h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {myShinsal.map((sal, i) => (
                  <div key={i} className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/30">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-slate-800 dark:text-slate-200 text-sm">{sal.name}</span>
                      <span className="text-xs bg-slate-100 dark:bg-slate-700 text-slate-500 px-1.5 py-0.5 rounded">{sal.type}</span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">{sal.desc}</p>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-6 bg-blue-500 rounded-full"></div>
                  <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                    {language !== 'ko' ? 'Luck Cycles (Daewoon)' : '대운의 흐름'}
                  </h3>
                </div>
                <span className="text-xs font-bold px-2 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 rounded-full">
                  {language !== 'ko' ? `Age ${currentAge}` : `현재 ${currentAge}세`}
                </span>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 overflow-x-auto border border-slate-100 dark:border-slate-800">
                <div className="flex gap-3 min-w-max">
                  {daewoonList.map((dae, i) => (
                    <div
                      key={i}
                      onClick={() => handleDaeClick(dae)}
                      className={`flex flex-col items-center justify-center w-16 h-20 rounded-xl border transition-all cursor-pointer ${(selectedDae && selectedDae.startAge === dae.startAge)
                        ? 'bg-blue-600 border-blue-600 text-white shadow-lg transform scale-110'
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400 hover:border-blue-400'
                        }`}
                    >
                      <span className="text-xs opacity-80 mb-1">{dae.startAge}세</span>
                      <span className="font-bold text-sm">
                        {language !== 'ko' ? `${getEng(dae.name[0])} ${getEng(dae.name[1])}` : dae.name}
                      </span>
                      {dae.isCurrent && (
                        <div className={`mt-1 h-1.5 w-1.5 rounded-full ${(selectedDae && selectedDae.startAge === dae.startAge) ? 'bg-white' : 'bg-blue-500'}`}></div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {selectedDae && (
                <div className="mt-4 p-5 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10 rounded-2xl border border-blue-100 dark:border-blue-900/30 animate-in fade-in slide-in-from-top-4">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-white dark:bg-slate-800 shadow-sm flex items-center justify-center font-bold text-blue-600 border border-blue-100 dark:border-blue-900/30">
                      {selectedDae.name[0]}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 dark:text-slate-200">
                        {language !== 'ko' ? `${getEng(selectedDae.name[0])} ${getEng(selectedDae.name[1])}` : selectedDae.name} {language !== 'ko' ? 'Luck Cycle' : '대운'}
                      </h4>
                      <p className="text-xs text-blue-500 font-black tracking-widest uppercase">
                        {selectedDae.startAge} - {selectedDae.endAge} {language !== 'ko' ? 'AGE' : '세'}
                      </p>
                    </div>
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed space-y-2" dangerouslySetInnerHTML={{ __html: getDaewoonStory(selectedDae, currentAge, pillars) }} />
                </div>
              )}
            </section>
          </div>
        </div>

        <div className="p-6 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 gap-3 flex flex-col sm:flex-row">
          <button
            onClick={() => handleShare('basic-ana-card')}
            className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 dark:shadow-none transition-all active:scale-95"
          >
            {language !== 'ko' ? 'Share Result' : '분석 결과 저장'}
          </button>
          {/* <button
            onClick={handleSetViewMode}
            className="flex-1 py-3 bg-white dark:bg-slate-700 text-slate-700 dark:text-white border border-slate-200 dark:border-slate-600 rounded-xl font-bold transition-all hover:bg-slate-50 dark:hover:bg-slate-600"
          >
            {language !== 'ko' ? 'Back' : '돌아가기'}
          </button> */}
        </div>
      </div>
    </div>
  );
};

export default BasicAna;
