'use client';

import { useUsageLimit } from '@/contexts/useUsageLimit';
import { useAuthContext } from '@/contexts/useAuthContext';
import { setDoc, doc, increment } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useState } from 'react';
import { UI_TEXT } from '@/data/constants';
import { useLanguage } from '@/contexts/useLanguageContext';
import { FORTUNE_DB, FORTUNE_DB_KR } from '@/data/fortuneCookie';
import { BoltIcon } from '@heroicons/react/24/outline';
import CreditIcon from '@/ui/CreditIcon';

const getLuckyResult = (lang) => {
  const rand = Math.floor(Math.random() * 200) + 1;
  const db = lang === 'en' ? FORTUNE_DB : FORTUNE_DB_KR;

  if (rand <= 6) {
    return {
      reduction: 5,
      msg: db.super[Math.floor(Math.random() * db.super.length)],
      type: 'SUPER',
    };
  } else if (rand <= 20) {
    return {
      reduction: 3,
      msg: db.lucky[Math.floor(Math.random() * db.lucky.length)],
      type: 'LUCKY',
    };
  } else {
    return {
      reduction: 1,
      msg: db.normal[Math.floor(Math.random() * db.normal.length)],
      type: 'NORMAL',
    };
  }
};

export default function FortuneCookiePage() {
  const { editCount, setEditCount } = useUsageLimit();
  const { language } = useLanguage();
  const { user, userData } = useAuthContext();
  const [loading, setLoading] = useState(false);

  const [selectedId, setSelectedId] = useState(null);
  const [fortuneMessage, setFortuneMessage] = useState('');
  const [rewardAmount, setRewardAmount] = useState(0);
  const [showCoin, setShowCoin] = useState(false);

  const todayStr = new Date().toLocaleDateString('en-CA');

  const [step, setStep] = useState(() => {
    return userData?.usageHistory?.ZCookie?.today === todayStr ? 'selection' : 'intro';
  });

  const handleStart = () => {
    setStep('selection');
  };

  const handleFortuneCookie = async (index) => {
    if (!user) return alert(UI_TEXT.loginReq[language]);
    if (loading) return;

    setSelectedId(index);
    setLoading(true);

    try {
      const data = userData.usageHistory || {};
      const currentCount = editCount;
      const { today: lastToday } = data.ZCookie || {};

      if (lastToday === todayStr) {
        setLoading(false);
        setSelectedId(null);
        return alert(
          language === 'en'
            ? 'Already claimed! See you tomorrow.'
            : '오늘의 보너스 수령완료! 내일 다시 찾아주세요.'
        );
      }

      const result = getLuckyResult(language);
      const reductionAmount = result.reduction;
      const resultMsg = result.msg;
      const newCount = currentCount - reductionAmount;

      await setDoc(
        doc(db, 'users', user.uid),
        {
          editCount: increment(-result.reduction),
          lastEditDate: todayStr,
          usageHistory: { ZCookie: { today: todayStr, msg: resultMsg } },
          dailyUsage: { [todayStr]: increment(1) },
        },
        { merge: true }
      );

      await new Promise((resolve) => setTimeout(resolve, 1500));

      setEditCount(newCount);
      setFortuneMessage(resultMsg);
      setRewardAmount(reductionAmount);
      setShowCoin(true);

      setTimeout(() => {
        setEditCount(newCount);
      }, 600);
    } catch (e) {
      alert(`Error: ${e.message}`);
      setSelectedId(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen pt-20 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-2xl mx-auto p-4">
        <style jsx>{`
          .cookie-emoji {
            transition: transform 0.3s ease;
          }
          .cookie-item:hover .cookie-emoji {
            transform: scale(1.1) translateY(-10px);
          }
          .flying-coin-animation {
            position: absolute;
            top: 50%;
            left: 50%;
            font-size: 40px;
            z-index: 999;
            animation: flyUp 0.8s forwards ease-in;
          }
          @keyframes flyUp {
            0% {
              transform: translate(-50%, -50%) scale(1);
              opacity: 1;
            }
            100% {
              transform: translate(150px, -500px) scale(0.5);
              opacity: 0;
            }
          }
        `}</style>
        
        <div className="text-center mb-6 mt-2 animate-in fade-in slide-in-from-top-4 duration-700">
          <p className="text-xs font-bold text-indigo-400 dark:text-indigo-400 tracking-[0.2em] uppercase mb-2">
            get Extra Credit
          </p>
          <h1 className="text-3xl sm:text-4xl font-extrabold font-serif text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-600 dark:from-indigo-300 dark:via-violet-300 dark:to-indigo-300 drop-shadow-sm">
            {language === 'ko' ? '포춘쿠키' : 'Fortune Cookie'}
          </h1>

          <div className="flex justify-center gap-2 mt-4 opacity-50">
            <div className="w-1 h-1 rounded-full bg-indigo-400"></div>
            <div className="w-1 h-1 rounded-full bg-indigo-400"></div>
            <div className="w-1 h-1 rounded-full bg-indigo-400"></div>
          </div>
        </div>

        {step === 'intro' ? (
          <div className="flex flex-col items-center text-center px-6 animate-in fade-in zoom-in-95 duration-700">
            <p className="mb-2 text-slate-800 dark:text-white text-sm leading-relaxed break-keep">
              {language === 'ko'
                ? '포춘쿠키로 운세 보고 최대 5 크레딧 추가 획득!'
                : 'Check your fortune and get up to 5 bonus credits!'}
            </p>
            <div className="mb-6">
              <CreditIcon num={language === 'ko' ? '최대 +5' : 'Max +5 '} />
            </div>
            <div className="m-auto max-w-sm rounded-2xl overflow-hidden mb-8">
              <img
                src="/images/introcard/cookie_2.webp"
                alt="cookie started"
                className="w-60 h-auto mx-auto"
              />
            </div>

            <button
              onClick={handleStart}
              className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold rounded-xl shadow-lg hover:scale-105 transition-transform active:scale-95"
            >
              {language === 'ko' ? '쿠키 고르러 가기' : 'Pick a Cookie'}
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-center min-h-[400px]">
            {!loading && !fortuneMessage && userData?.usageHistory?.ZCookie?.today === todayStr ? (
              <div className="animate-in fade-in duration-700 flex flex-col items-center my-6 w-full">
                <div className="fortune-label mb-2 px-3 py-1 bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-200 text-xs font-bold rounded-full shadow-sm border border-amber-200 dark:border-amber-800">
                  {language === 'en' ? "Today's Message" : '오늘의 메시지'}
                </div>
                <div className="fortune-paper relative bg-[#fffdf5] dark:bg-slate-800 px-8 py-10 rounded-sm shadow-[0_4px_10px_rgba(0,0,0,0.1)] border-t-4 border-amber-400 max-w-sm w-full text-center overflow-hidden">
                  <div className="absolute inset-0 opacity-10 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/natural-paper.png')] dark:invert"></div>
                  <span className="absolute top-4 left-4 text-4xl text-amber-200 dark:text-amber-900/50 font-serif leading-none select-none">
                    “
                  </span>
                  <p className="relative z-10 text-gray-700 dark:text-gray-200 text-lg font-medium leading-relaxed break-keep">
                    {userData.usageHistory.ZCookie.msg}
                  </p>
                  <span className="absolute bottom-2 right-4 text-4xl text-amber-200 dark:text-amber-900/50 font-serif leading-none select-none">
                    ”
                  </span>
                  <div className="absolute bottom-0 left-0 w-full h-1 bg-[radial-gradient(circle,theme(colors.amber.200)_1px,transparent_1px)] dark:bg-[radial-gradient(circle,theme(colors.amber.900)_1px,transparent_1px)] bg-[length:8px_8px]"></div>
                </div>
              </div>
            ) : (
              <div className="w-full">
                {fortuneMessage ? (
                  <div className="fortune-result-wrapper animate-in fade-in duration-700 max-w-lg mx-auto relative">
                    {showCoin && <div className="flying-coin-animation">⚡</div>}
                    <div className="text-center">
                      <div className="m-auto max-w-sm rounded-2xl overflow-hidden shadow-sm border border-slate-100 dark:border-slate-800 mb-6">
                        <img
                          src="/images/introcard/cookie_result.webp"
                          alt="cookie result"
                          className="w-full h-auto"
                        />
                      </div>
                      <p className="text-slate-800 dark:text-amber-100 text-xl font-bold leading-relaxed mb-6 break-keep px-4">
                        {fortuneMessage}
                      </p>
                      <div className="flex justify-center">
                        <CreditIcon num={`+${rewardAmount}`} />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center animate-in fade-in duration-500">
                    <div className="text-slate-600 dark:text-slate-400 font-medium mb-6">
                      {language === 'en' ? (
                        'Choose a cookie to check your fortune!'
                      ) : (
                        <>
                          <p>오늘의 격언을 담은</p>
                          <p>
                            포춘 쿠키 <strong className="text-indigo-600 dark:text-indigo-400">하나를 골라주세요</strong>
                          </p>
                        </>
                      )}
                    </div>
                    <div className="m-auto max-w-sm rounded-2xl overflow-hidden mb-8">
                      <img
                        src="/images/introcard/cookie_1.webp"
                        alt="select cookie"
                        className="w-60 h-auto mx-auto"
                      />
                    </div>
                    <div className="flex gap-8 items-center justify-center">
                      {[0, 1, 2].map((idx) => (
                        <div
                          key={idx}
                          onClick={() => handleFortuneCookie(idx)}
                          className={`
                            flex flex-col items-center cursor-pointer transition-all duration-300 cookie-item
                            ${selectedId === idx && loading ? 'animate-bounce' : 'hover:scale-110'}
                            ${selectedId !== null && selectedId !== idx ? 'opacity-40 grayscale blur-[1px]' : 'opacity-100'}
                          `}
                        >
                          <div
                            className={`text-[72px] drop-shadow-lg cookie-emoji ${selectedId === idx && loading ? 'animate-pulse' : ''}`}
                          >
                            🥠
                          </div>
                          <div className="w-[40px] h-[8px] bg-black/5 dark:bg-white/10 rounded-[50%] mt-2"></div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
