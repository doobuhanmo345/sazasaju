'use client';

import React from 'react';
import { useLanguage } from '@/contexts/useLanguageContext';

export default function IconWrapper({ title, subTitle, children }) {
  const { language } = useLanguage();

  return (
    <div className="mx-auto w-full max-w-lg rounded-3xl border border-slate-100 bg-white p-6 shadow-sm transition-colors dark:border-slate-800 dark:bg-slate-900 my-3">
      <div className="mb-6 ml-1 text-left">
        <p className="mt-1 text-xs font-medium text-slate-500 dark:text-slate-400">{subTitle}</p>
        <h2 className="text-lg font-extrabold tracking-tight text-slate-900 dark:text-white">
          {title}
        </h2>
      </div>
      {children}
    </div>
  );
}
