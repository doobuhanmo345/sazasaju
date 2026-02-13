'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import {
  CircleStackIcon,
  CalendarDaysIcon,
  PresentationChartLineIcon,
  BriefcaseIcon,
} from '@heroicons/react/24/outline';
import { useLanguage } from '@/contexts/useLanguageContext';
import WealthAppeal from '@/app/saju/wealth/WealthAppeal';

export default function WealthLandingPage() {
  const router = useRouter();
  const { language } = useLanguage();

  useEffect(() => {
    if (language === 'ko') {
      document.title = '재물운 분석 | 나의 부와 금전의 흐름';
    } else {
      document.title = 'Wealth Luck Analysis | Path to Financial Success';
    }
  }, [language]);

  const CATEGORIES = [
    {
      id: 'capacity',
      label: '평생 재물운',
      sub: 'Lifetime Wealth',
      desc: '타고난 그릇의 크기와 부자 사주 분석',
      descEn: 'Analysis of innate wealth capacity and potential',
      icon: CircleStackIcon,
      color: 'text-amber-500',
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      activeBorder: 'border-amber-500 ring-amber-200',
      path: '/saju/wealth/capacity',
    },
    {
      id: 'timing',
      label: '올해/내년 흐름',
      sub: 'Yearly Flow',
      desc: '이번 달 운세부터 1년 운세까지 단기 재물운 흐름을 분석해드려요 승부수 타이밍',
      descEn: 'Short-term cash flow and strategic timing',
      icon: CalendarDaysIcon,
      color: 'text-sky-500',
      bg: 'bg-sky-50',
      border: 'border-sky-200',
      activeBorder: 'border-sky-500 ring-sky-200',
      path: '/saju/wealth/timing',
    },
    {
      id: 'investment',
      label: '투자 / 재테크',
      sub: 'Investment',
      desc: '주식, 코인, 부동산 등 투기 적합성',
      descEn: 'Suitability for stocks, crypto, and real estate',
      icon: PresentationChartLineIcon,
      color: 'text-rose-500',
      bg: 'bg-rose-50',
      border: 'border-rose-200',
      activeBorder: 'border-rose-500 ring-rose-200',
      path: '/saju/wealth/investment',
    },
    {
      id: 'business',
      label: '사업 / 창업운',
      sub: 'Business',
      desc: '내 사업을 해도 되는지, 동업이 좋은지',
      descEn: 'Entrepreneurial potential and partnership luck',
      icon: BriefcaseIcon,
      color: 'text-emerald-500',
      bg: 'bg-emerald-50',
      border: 'border-emerald-200',
      activeBorder: 'border-emerald-500 ring-emerald-200',
      path: '/saju/wealth/business',
    },
  ];

  return (
    <div className="w-full animate-in fade-in slide-in-from-bottom-5 duration-700">
      <div className="max-w-lg mx-auto text-center px-6 mb-12">
        <h2 className="text-3xl font-black text-slate-800 dark:text-white mb-4 tracking-tight">
          {language === 'ko' ? '오행으로 읽는' : 'Reading the Five Elements'}
          <br />
          <span className="relative text-emerald-600 dark:text-emerald-500">
            {language === 'ko' ? '평생 재물운 & 투자운' : 'Lifetime Wealth & Investment'}
            <div className="absolute inset-0 bg-emerald-200/50 dark:bg-emerald-800/60 blur-md rounded-full scale-100"></div>
          </span>
        </h2>

        <div className="space-y-4 text-slate-600 dark:text-slate-400 mb-10 leading-relaxed break-keep">
          <p className="text-sm">
            <strong>{language === 'ko' ? '타고난 금전의 그릇' : 'Innate Wealth Capacity'}</strong>
            {language === 'ko' ? '과 ' : ' and '}
            <strong>{language === 'ko' ? '재물이 모이는 시기' : 'Strategic Financial Timing'}</strong>
            {language === 'ko' ? ', 당신의 재물 지도 분석.' : ', Analyzing your financial map.'}
          </p>
          <div className="m-auto max-w-sm rounded-2xl overflow-hidden shadow-sm border border-slate-100 dark:border-slate-800">
            <img src="/images/introcard/wealth_1.webp" alt="wealth" className="w-full h-auto" />
          </div>
        </div>

        <div className="text-center mb-8">
          <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">
            {language === 'ko' ? '어떤 재물운이 궁금하신가요?' : 'What financial insight do you need?'}
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {language === 'ko' ? '주제를 선택하면 그 주제로 당신의 사주를 정밀하게 분석해 드립니다.' : 'Select a topic for a precise analysis based on your Saju.'}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-12">
          {CATEGORIES.map((category) => {
            const Icon = category.icon;
            const labelText = language === 'en' ? category.sub : category.label;
            const descText = language === 'en' ? category.descEn : category.desc;

            return (
              <button
                key={category.id}
                onClick={() => router.push(category.path)}
                className={`
                  relative flex flex-col items-start p-5 rounded-2xl border-2 transition-all duration-200 text-left group
                  border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-indigo-100 dark:hover:border-slate-600 hover:shadow-md
                `}
              >
                <div className="flex items-center justify-between w-full mb-3">
                  <div className={`p-2.5 rounded-xl bg-white dark:bg-slate-900 shadow-sm border border-slate-100 dark:border-slate-700 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className={`w-6 h-6 ${category.color}`} />
                  </div>
                </div>
                <div>
                  <div className="flex items-baseline gap-1.5 mb-0.5">
                    <span className="text-base font-bold text-slate-700 dark:text-slate-200">
                      {labelText}
                    </span>
                    {language !== 'en' && (
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        {category.sub}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 dark:text-slate-500">
                    {descText}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <WealthAppeal />
    </div>
  );
}
