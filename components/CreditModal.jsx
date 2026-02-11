'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthContext } from '@/contexts/useAuthContext';
import { useUsageLimit } from '@/contexts/useUsageLimit';

const CreditModal = ({ isOpen, onClose, onWatchAd, language = 'ko' }) => {
  const { isCookieDone } = useAuthContext();
  const { editCount, credits } = useUsageLimit();
  const router = useRouter();

  const content = {
    ko: {
      title: '잠시 마음을 채울 시간이 필요해요',
      body: '오늘의 무료 크레딧을 모두 사용하셨네요.\n매일 밤 12시, 새로운 기운이 3개씩 충전됩니다.',
      btnConfirm: '내일 다시 올게요',
      fortunecookie: '포춘쿠키 열고 크레딧 충전하기',
      refillText: '충전까지 남은 시간',
    },
    en: {
      title: 'Time to Refill Your Energy',
      body: "You've used all your free credits for today.\n3 new credits will be recharged at midnight.",
      btnConfirm: 'See you tomorrow',
      fortunecookie: 'Open a Fortune Cookie for credits',
      refillText: 'Refill in',
    },
  };

  const t = content[language] || content.ko;
  const [localTimeLeft, setLocalTimeLeft] = useState("");

  useEffect(() => {
    if (!isOpen) return;

    const calculateTimeUntilMidnight = () => {
      const now = new Date();
      const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0);
      const diff = midnight - now;

      const hours = String(Math.floor((diff / (1000 * 60 * 60)) % 24)).padStart(2, '0');
      const minutes = String(Math.floor((diff / (1000 * 60)) % 60)).padStart(2, '0');
      const seconds = String(Math.floor((diff / 1000) % 60)).padStart(2, '0');

      return `${hours}:${minutes}:${seconds}`;
    };

    setLocalTimeLeft(calculateTimeUntilMidnight());

    const timer = setInterval(() => {
      setLocalTimeLeft(calculateTimeUntilMidnight());
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 w-full h-full z-[99999] flex flex-col items-center justify-end sm:justify-center bg-black/60 backdrop-blur-md px-0 sm:px-4">
      {/* Background Overlay - Full Inset */}
      <div className="absolute inset-0 w-full h-full cursor-default" onClick={onClose}></div>

      {/* Modal Box / Bottom Sheet */}
      <div className="relative w-full sm:max-w-sm bg-white dark:bg-slate-900 rounded-t-[2.5rem] sm:rounded-[2.5rem] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] overflow-hidden transition-all transform animate-in slide-in-from-bottom-full sm:slide-in-from-bottom-10 sm:zoom-in-95 duration-500">

        <div className="p-10 text-center">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-purple-200 dark:bg-purple-900/50 blur-2xl rounded-full opacity-50 animate-pulse"></div>
              <div className="relative w-20 h-20 bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-slate-800 dark:to-slate-700 rounded-full flex items-center justify-center text-4xl shadow-inner border border-white dark:border-slate-700">
                ✨
              </div>
            </div>
          </div>

          <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-4 tracking-tight break-keep leading-tight">
            {t.title}
          </h3>

          <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-6 break-keep font-medium">
            {t.body}
          </p>

          <div className="mb-8 px-6 py-2.5 inline-flex items-center gap-2 bg-slate-50 dark:bg-slate-800/50 rounded-full border border-slate-100 dark:border-slate-700">
            <span className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              {t.refillText}
            </span>
            <span className="text-sm font-black text-indigo-500 dark:text-indigo-400 font-mono">{localTimeLeft}</span>
          </div>

          <div className="flex flex-col gap-3">
            <button
              onClick={onClose}
              className="w-full py-4 px-6 bg-slate-900 dark:bg-white dark:text-slate-900 hover:bg-slate-800 text-white font-bold rounded-2xl transition-all active:scale-[0.98] shadow-lg shadow-slate-200 dark:shadow-none"
            >
              {t.btnConfirm}
            </button>

            {/* <button
              onClick={() => {
                router.push('/credit/store');
                onClose();
              }}
              className="w-full py-4 px-6 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl transition-all active:scale-[0.98] shadow-lg shadow-indigo-200 dark:shadow-none flex items-center justify-center gap-2"
            >
              <span className="text-lg">💎</span>
              {t.chargeCredit}
            </button> */}

            {!isCookieDone && (
              <button
                onClick={() => {
                  router.push('/fortunecookie');
                  onClose();
                }}
                className="w-full py-4 px-6 bg-white dark:bg-slate-800 border-2 border-purple-100 dark:border-purple-900/30 hover:border-purple-200 dark:hover:border-purple-700 hover:bg-purple-50 dark:hover:bg-slate-700 text-purple-600 dark:text-purple-400 font-bold rounded-2xl transition-all active:scale-[0.98] flex items-center justify-center gap-2"
              >
                <span className="text-lg">🥠</span>
                {t.fortunecookie}
              </button>
            )}
          </div>

          {/* Mobile Home Indicator Padding */}
          <div className="h-6 sm:hidden"></div>
        </div>
      </div>
    </div>
  );
};

export default CreditModal;
