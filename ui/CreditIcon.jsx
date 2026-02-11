'use client';

import { BoltIcon } from '@heroicons/react/24/outline';
import { useLanguage } from '@/contexts/useLanguageContext';

export default function CreditIcon({ num }) {
  const { language } = useLanguage();
  return (
    <span
      className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-700 border border-amber-200 
    dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-700/50 py-1 px-3.5 rounded-md text-sm font-bold shadow-sm transition-all duration-300"
    >
      <BoltIcon className="h-4 w-4 fill-amber-500 dark:fill-amber-400 animate-pulse" />

      <span className="tracking-tight">
        {num}
        <span className="text-sm opacity-80 ml-0.5 font-medium">
          {language === 'ko' ? '크레딧' : 'credit'}
        </span>
      </span>
    </span>
  );
}
