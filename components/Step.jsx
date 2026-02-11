'use client';

import React from 'react';
import { ChevronLeftIcon } from '@heroicons/react/24/outline';
import { useLanguage } from '@/contexts/useLanguageContext';

const Step = ({ step, totalStep, title, onBack }) => {
  const { language } = useLanguage();
  return (
    <div className="w-full mb-8 px-1 relative">
      <div className="flex items-end justify-between mb-3">
        <div className="flex flex-col gap-1">
          <span className="text-xs font-bold text-indigo-500 dark:text-indigo-400 tracking-widest uppercase">
            STEP {step.toString().padStart(2, '0')}
          </span>
          <div className="flex">
            <div className="flex items-center ">
              {step > 1 && (
                <button
                  onClick={onBack}
                  className="
        group flex items-center px-2 py-1.5 mx-2 rounded-full 
        transition-all duration-300 ease-out
        bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm
        border border-slate-200/60 dark:border-slate-700/50
        shadow-sm hover:shadow-md
        text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400
      "
                >
                  <ChevronLeftIcon className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-300" />
                </button>
              )}
            </div>
            <h2 className="text-lg sm:text-xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">
              {title}
            </h2>
          </div>
        </div>

        <div className="text-xs font-mono font-medium text-slate-400 mb-1">
          <span className="text-indigo-600 dark:text-indigo-400 font-bold text-base">{step}</span>
          <span className="mx-1">/</span>
          {totalStep}
        </div>
      </div>
      <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-700/50 rounded-full overflow-hidden flex">
        {Array.from({ length: totalStep }).map((_, index) => {
          const isActive = index + 1 <= step;
          return (
            <div
              key={index}
              className={`h-full flex-1 transition-all duration-500 ease-out 
            ${index !== 0 ? 'border-l-2 border-white dark:border-slate-800' : ''} 
            ${isActive
                  ? 'bg-gradient-to-r from-indigo-500 to-indigo-400 shadow-sm'
                  : 'bg-transparent'
                }
          `}
            />
          );
        })}
      </div>
    </div>
  );
};

export default Step;
