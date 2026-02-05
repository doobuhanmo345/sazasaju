'use client';
import React from 'react';
import { useLanguage } from '@/contexts/useLanguageContext';
import ReportHid from '@/components/ReportHid';
import AnalyzeButton from '@/ui/AnalyzeButton';
import { ExclamationTriangleIcon, LockClosedIcon } from '@heroicons/react/24/solid';

export default function TodaysLuckPreview({ onStart, isDisabled, isDisabled2, loading, isDone, isLocked }) {
  const { language } = useLanguage();

  return (
    <div className="mt-16 text-left max-w-3xl mx-auto">
      <div className="mx-4 my-10 flex flex-col items-center">
        <div className="flex items-center gap-2 px-3 py-1 rounded-full border border-amber-200 bg-amber-50/50 mb-3">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
          </span>
          <span className="text-[11px] font-bold text-amber-600 tracking-tight uppercase">
            Preview Mode
          </span>
        </div>

        <div className="text-center">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">
            {language === 'ko' ? '오늘의 운세 미리보기' : "Today's Luck Preview"}
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed max-w-[280px] mx-auto break-keep text-center">
            {language === 'ko'
              ? '당신의 하루를 위한 맞춤형 조언과 운세 흐름을 미리 확인하세요'
              : 'Preview customized advice and luck flow for your day'}
          </p>
        </div>
      </div>

      <div className="space-y-8">
        {/* 1. 오늘의 총운 & 점수 (Score Gauge Style) */}
        <section className="relative overflow-hidden bg-white dark:bg-slate-900 rounded-[2rem]">
          <div className="px-6 py-8 flex flex-col items-center">
            <h2 className="text-xl font-black text-slate-800 dark:text-white mb-6">
              {language === 'ko' ? '오늘의 총운' : "Today's Overview"}
            </h2>

            {/* Blurred Content: Score Circle Gauge */}
            <div className="opacity-40 grayscale select-none pointer-events-none mb-6 flex flex-col items-center w-full max-w-md mx-auto">
              {/* Fake Gauge */}
              <div className="relative w-40 h-40 rounded-full flex items-center justify-center mb-6"
                style={{ background: 'conic-gradient(#f59e0b 75%, #f3f4f6 0)' }}> {/* Amber-500 */}
                <div className="absolute inset-[10px] bg-white dark:bg-slate-900 rounded-full flex flex-col items-center justify-center z-10">
                  <span className="text-4xl font-extrabold text-slate-800 dark:text-white">85</span>
                  <span className="text-sm font-bold text-slate-400">POINT</span>
                </div>
              </div>

              <p className="text-lg font-bold text-slate-800 dark:text-white mb-2 text-center">"{language === 'ko' ? '기분 좋은 하루!' : 'Good Day!'}"</p>
              <p className="text-sm text-slate-500 dark:text-slate-400 text-center leading-relaxed max-w-sm">
                {language === 'ko'
                  ? '오늘은 전반적으로 안정적인 기운이 감도는 날입니다. 큰 걱정거리 없이 계획했던 일들을 차분하게 마무리할 수 있으며...'
                  : 'A day with generally stable energy. You can calmly finish planned tasks without big worries...'}
              </p>
            </div>
          </div>

          <ReportHid
            gradientColor="#FAF7F4"
            badge={['1', language === 'ko' ? '총운' : 'Overview']}
            title={
              language === 'ko' ? (
                <>
                  당신의 하루를 관통하는 <span className="text-amber-500">운명의 핵심</span>
                </>
              ) : (
                <>
                  The <span className="text-amber-500">Core of Destiny</span> Piercing Your Day
                </>
              )
            }
            des={
              language === 'ko'
                ? '오늘 하루 예상되는 기운의 흐름과 종합 점수를 분석해 드립니다.'
                : "Analyzes the expected energy flow and overall score for today."
            }
            hClass="h-[400px]"
            mClass="mt-[-300px]"
            btnColor="amber"
          />
        </section>


        {/* 2. 행운의 치트키 (List Style) */}
        <section className="relative overflow-hidden bg-white dark:bg-slate-900 rounded-[2rem]">
          <div className="px-6 py-8">
            <h2 className="text-xl font-black text-slate-800 dark:text-white mb-6 text-center">
              {language === 'ko' ? '행운의 치트키' : 'Lucky Charm'}
            </h2>

            <div className="opacity-40 grayscale select-none pointer-events-none mb-6 space-y-4 max-w-md mx-auto w-full">
              {/* Fake List Items */}
              <div className="py-4 border-b border-slate-100 dark:border-slate-800">
                <div className="text-xs font-bold text-amber-500 mb-1">{language === 'ko' ? '행운의 방향' : 'Direction'}</div>
                <div className="font-bold text-slate-800 dark:text-white">East</div>
                <div className="text-xs text-slate-400 mt-0.5">The direction where energy rises</div>
              </div>
              <div className="py-4 border-b border-slate-100 dark:border-slate-800">
                <div className="text-xs font-bold text-amber-500 mb-1">{language === 'ko' ? '행운의 컬러' : 'Color'}</div>
                <div className="font-bold text-slate-800 dark:text-white">Golden Yellow</div>
                <div className="text-xs text-slate-400 mt-0.5">Color that boosts wealth luck</div>
              </div>
              <div className="py-4">
                <div className="text-xs font-bold text-amber-500 mb-1">{language === 'ko' ? '키워드' : 'Keywords'}</div>
                <div className="font-bold text-slate-800 dark:text-white">Challenge, Passion</div>
                <div className="text-xs text-slate-400 mt-0.5">Keywords to focus on today</div>
              </div>
            </div>
          </div>

          <ReportHid
            gradientColor="#FAF7F4"
            badge={['2', language === 'ko' ? '치트키' : 'CheatKey']}
            title={
              language === 'ko' ? (
                <>
                  당신의 운을 틔워줄 <span className="text-amber-500">행운의 치트키</span>
                </>
              ) : (
                <>
                  Lucky <span className="text-amber-500">Cheat Keys</span> for You
                </>
              )
            }
            des={
              language === 'ko'
                ? '오늘 더 좋은 기운을 불러오는 방향, 컬러, 그리고 당신만의 핵심 키워드를 확인하세요.'
                : "Check the direction, color, and your own core keywords that bring in better energy today."
            }
            hClass="h-[400px]"
            mClass="mt-[-300px]"
            btnColor="amber"
          />
        </section>

        {/* 3. 상세 분석 (Category List Style) */}
        <section className="relative overflow-hidden bg-white dark:bg-slate-900 rounded-[2rem]">
          <div className="px-6 py-8">
            <h2 className="text-xl font-black text-slate-800 dark:text-white mb-6 text-center">
              {language === 'ko' ? '카테고리별 상세 분석' : 'Category Deep Dive'}
            </h2>

            <div className="opacity-40 grayscale select-none pointer-events-none mb-6 space-y-6 max-w-md mx-auto w-full">
              {/* Fake Detail Items */}
              <div>
                <div className="text-lg font-bold text-slate-800 dark:text-white mb-2 relative inline-block">
                  {language === 'ko' ? '연애운' : 'Love Luck'}
                  <span className="absolute bottom-0 left-0 w-full h-2 bg-amber-100 dark:bg-amber-900/30 -z-10 rounded-sm"></span>
                </div>
                <p className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">
                  [{language === 'ko' ? '따뜻한 마음을 확인하는 시간' : 'Time to confirm warm hearts'}]
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                  {language === 'ko' ? '그동안 소원했던 관계가 회복되거나...' : 'Relationships that have been distant are restored...'}
                </p>
              </div>
              <div>
                <div className="text-lg font-bold text-slate-800 dark:text-white mb-2 relative inline-block">
                  {language === 'ko' ? '금전운' : 'Wealth Luck'}
                  <span className="absolute bottom-0 left-0 w-full h-2 bg-amber-100 dark:bg-amber-900/30 -z-10 rounded-sm"></span>
                </div>
                <p className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">
                  [{language === 'ko' ? '소소한 행운이 따르는 날' : 'Small luck follows'}]
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                  {language === 'ko' ? '생각지도 못한 곳에서 이익이 발생하거나...' : 'Profit comes from unexpected places...'}
                </p>
              </div>
            </div>
          </div>

          <ReportHid
            gradientColor="#FAF7F4"
            badge={['3', language === 'ko' ? '상세분석' : 'Analytics']}
            title={
              language === 'ko' ? (
                <>
                  놓치면 안 될 <span className="text-amber-500">생활 밀착형 조언</span>
                </>
              ) : (
                <>
                  Life-oriented <span className="text-amber-500">Advice You Can't Miss</span>
                </>
              )
            }
            des={
              language === 'ko'
                ? '재물, 애정, 직장, 건강, 학업까지 당신이 궁금한 모든 분야의 운세를 짚어드립니다.'
                : "We cover fortunes in all areas you are curious about, including wealth, love, work, health, and studies."
            }
            hClass="h-[400px]"
            mClass="mt-[-280px]"
            btnColor="amber"
          />
        </section>
      </div>


    </div>
  );
}
