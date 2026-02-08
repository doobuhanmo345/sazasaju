'use client';

import { useState } from 'react';
import LoginModal from '@/components/LoginModal';
import { TicketIcon, LockClosedIcon, GiftIcon } from '@heroicons/react/24/outline';
import EnergyBadge from '@/ui/EnergyBadge';
import { classNames } from '@/utils/helpers';
import { useLanguage } from '@/contexts/useLanguageContext';
import { useAuthContext } from '@/contexts/useAuthContext';
import { useUsageLimit } from '@/contexts/useUsageLimit';
import { useLoading } from '@/contexts/useLoadingContext';

const COLOR_MAPS = {
  red: {
    classes: 'bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 shadow-red-200',
    text: 'text-red-500'
  },
  blue: {
    classes: 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-blue-200',
    text: 'text-blue-500'
  },
  indigo: {
    classes: 'bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 shadow-indigo-200',
    text: 'text-indigo-500'
  },
  amber: {
    classes: 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 shadow-amber-200',
    text: 'text-amber-500'
  },
  emerald: {
    classes: 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 shadow-emerald-200',
    text: 'text-emerald-500'
  },
  rose: {
    classes: 'bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-400 hover:to-pink-500 shadow-rose-200',
    text: 'text-rose-500'
  },
  purple: {
    classes: 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-purple-200',
    text: 'text-purple-500'
  }
};

export default function AnalyzeButton({
  onClick,
  disabled = false,
  loading,
  isDone,
  label,
  cost = -1,
  color = 'red'
}) {

  const DISABLED_STYLE = 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200';
  const { language } = useLanguage();
  const { user, userData, login } = useAuthContext();
  const { isLocked } = useUsageLimit();

  const { loading: contextLoading } = useLoading(); // [NEW] Global loading state

  // Combine local loading prop with global loading context and user analyzing state
  const isAnalyzing = loading || contextLoading || userData?.isAnalyzing;

  const lockCheck = () => {
    if (isAnalyzing) return true; // [NEW] Lock if analyzing
    if (isLocked) {
      if (isDone) {
        return false
      } else {
        return true
      }
    } else {
      return false
    }
  }
  const buttonClicked = () => {
    if (isAnalyzing) {
      alert(language === 'ko' ? '다른 분석이 진행 중입니다. 잠시만 기다려주세요.' : 'Another analysis is in progress. Please wait.');
      return;
    }
    if (lockCheck()) {
      alert(language === 'ko' ? '크레딧을 다 사용하셨습니다.' : 'You have used all your credits.');
      return;
    }
    onClick()
  }
  const theme = COLOR_MAPS[color] || COLOR_MAPS.red;

  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  // 1. Guest View: User is not logged in
  if (!user) {
    return (
      <>
        <button
          onClick={() => setIsLoginModalOpen(true)}
          className="w-full relative group px-10 py-5 font-bold rounded-[2rem] shadow-2xl shadow-indigo-100/50 dark:shadow-none transform transition-all flex items-center justify-center gap-3 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 hover:-translate-y-1 active:scale-[0.98] overflow-hidden"
        >
          {/* Subtle hover background effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/40 via-white to-white dark:from-indigo-900/20 dark:via-slate-800 dark:to-slate-800 opacity-0 group-hover:opacity-100 transition-opacity" />


          <GiftIcon className="w-6 h-6 text-indigo-500 relative z-10" />
          <span className="text-slate-800 dark:text-white text-lg tracking-tight relative z-10">
            {language === 'ko' ? '오늘 3회 무료로 시작하기' : 'Start with 3 Free Today'}
          </span>

          {/* Shine effect */}
          <div className="absolute top-0 -inset-full h-full w-1/2 z-5 block transform -skew-x-12 bg-gradient-to-r from-transparent via-white/40 to-transparent group-hover:animate-shine" />
        </button>

        <LoginModal
          isOpen={isLoginModalOpen}
          onClose={() => setIsLoginModalOpen(false)}
        />
      </>
    );
  }

  // 2. Auth View: User is logged in
  return (
    <button
      onClick={buttonClicked}
      disabled={disabled}
      className={classNames(
        'w-full px-10 py-4 font-bold rounded-xl shadow-lg dark:shadow-none transform transition-all flex items-center justify-center gap-2',
        disabled
          ? DISABLED_STYLE
          : `${theme.classes} text-white hover:-translate-y-1`
      )}
    >
      {label || (language === 'ko' ? '운세 확인하기' : 'Check my Luck')}

      {isDone ? (
        <div className="flex items-center backdrop-blur-md bg-white/20 px-2 py-0.5 rounded-full border border-white/30">
          <span className="text-[9px] font-bold text-white uppercase">Free</span>
          <TicketIcon className="w-3 h-3 text-white" />
        </div>
      ) : isLocked ? (
        <div className="mt-1 flex items-center gap-1 backdrop-blur-sm px-2 py-0.5 rounded-full border shadow-sm relative z-10 border-gray-500/50 bg-gray-400/40">
          <span className="text-[9px] font-bold text-white tracking-wide uppercase">
            <LockClosedIcon className={`w-4 h-4 ${theme.text}`} />
          </span>
        </div>
      ) : (
        user && (
          <div className="relative scale-90">
            <EnergyBadge active={userData?.birthDate} consuming={loading} cost={cost} />
          </div>
        )
      )}
    </button>
  );
}
