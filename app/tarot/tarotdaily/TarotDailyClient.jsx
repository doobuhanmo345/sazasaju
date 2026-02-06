'use client';

import { useRef, useState, useEffect, useMemo } from 'react';
import AnalysisStepContainer from '@/components/AnalysisStepContainer';
import ViewTarotResult from '@/app/tarot/ViewTarotResult';
import { useAuthContext } from '@/contexts/useAuthContext';
import { useUsageLimit } from '@/contexts/useUsageLimit';
import { useLoading } from '@/contexts/useLoadingContext';
import { useLanguage } from '@/contexts/useLanguageContext';
import { UI_TEXT } from '@/data/constants';
import { classNames } from '@/utils/helpers';
import TarotAnalysisService, { TarotPresets } from '@/lib/TarotAnalysisService';
import { TARO_CARDS } from '@/data/tarotConstants';
import { SparklesIcon } from '@heroicons/react/24/outline';
import CreditIcon from '@/ui/CreditIcon';
import TarotLoading from '@/app/tarot/TarotLoading';
import { DateService } from '@/utils/dateService';
import StartButton from '@/ui/StartButton';
import { useRouter } from 'next/navigation';

export default function TarotDailyPage() {
  const router = useRouter();
  const { setLoadingType, setAiResult, aiResult } = useLoading();
  const [loading, setLoading] = useState(false);
  const { userData, user } = useAuthContext();
  const { language } = useLanguage();
  const { setEditCount, MAX_EDIT_COUNT } = useUsageLimit();



  // [UX FIX] Reset AI Result on Mount
  useEffect(() => {
    setAiResult('');
  }, [setAiResult]);

  // [NEW] Reactive Redirect
  useEffect(() => {
    if (!loading && aiResult && aiResult.length > 0) {
      router.push('/saju/tarot/tarotdaily/result');
    }
  }, [loading, aiResult, router]);

  // Client-side Title Update for Localization (Static Export Support)
  useEffect(() => {
    if (language === 'ko') {
      document.title = '오늘의 타로 | 당신을 위한 하루 가이드';
    } else {
      document.title = 'Daily Tarot | Your Daily Guidance';
    }
  }, [language]);

  const [flippedIdx, setFlippedIdx] = useState(null);
  const [step, setStep] = useState('intro');
  const [cardPicked, setCardPicked] = useState();

  const handleCardPick = async (onStart, index) => {
    const majorOnly = TARO_CARDS.filter((card) => card.type === 'major');
    const pickedCard = majorOnly[Math.floor(Math.random() * majorOnly.length)];
    setCardPicked(pickedCard);
    setFlippedIdx(index);

    setTimeout(async () => {
      setFlippedIdx(null);
      onStart(); // Trigger loading

      const service = new TarotAnalysisService({
        user,
        userData,
        language,
        maxEditCount: MAX_EDIT_COUNT,
        uiText: UI_TEXT,
        setEditCount,
        setLoading,
        setLoadingType,
        setAiResult,
        onStart,
      });

      try {
        await service.analyze(TarotPresets.daily({ pickedCard }));
      } catch (e) {
        // error
      }
    }, 1000);
  };

  const tarotContent = (onStart) => {
    if (loading) return <TarotLoading cardPicked={cardPicked} />;

    if (step === 'intro') {
      return (
        <div className="max-w-lg mx-auto text-center px-6 animate-in fade-in duration-700 pt-10">
          <h2 className="text-3xl font-black text-slate-800 dark:text-white mb-4">
            {language === 'ko' ? <>오늘의 <span className="text-indigo-600">타로 운명</span></> : <>Tarot <span className="text-indigo-600">Luck of the day</span></>}
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mb-8 text-sm break-keep">
            {language === 'ko' ? '무의식이 이끄는 오늘의 조언을 확인해보세요.' : 'Follow your unconsciousness to check out the advice of the day.'}
          </p>
          <div className="mb-10 flex justify-center">
            <div className="m-auto max-w-sm rounded-2xl overflow-hidden shadow-sm border border-slate-100 dark:border-slate-800">
              <img src="/images/introcard/tarot_1.webp" alt="sazatalk" className="w-full h-auto" />
            </div>
          </div>
          <StartButton onClick={() => setStep('selection')} color='indigo' />
        </div>
      );
    }

    return (
      <div className="max-w-lg mx-auto text-center px-6 animate-in zoom-in-95 duration-500 pt-10">
        <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">
          {language === 'ko' ? '카드를 골라 주세요.' : 'Choose your Card'}
        </h3>
        <p className="text-sm text-slate-500 mb-6">
          {language === 'ko' ? '가장 마음이 가는 한 장을 클릭하세요.' : 'Follow your heart, pick one of six cards'}
        </p>
        <div className="my-3"><CreditIcon num={-1} /></div>
        <div className="grid grid-cols-3 gap-3 md:gap-4 mb-10">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              onClick={() => flippedIdx === null && handleCardPick(onStart, i)}
              className={classNames(
                'relative aspect-[2/3] cursor-pointer group',
                'transition-all duration-500 [transition-timing-function:cubic-bezier(0.34,1.56,0.64,1)]',
                flippedIdx === null ? 'hover:-translate-y-10 hover:scale-110 hover:-rotate-3 hover:z-50' : 'pointer-events-none',
              )}
              style={{ transformStyle: 'preserve-3d' }}
            >
              <div
                className="w-full h-full transition-transform duration-700 shadow-xl rounded-md relative"
                style={{
                  transformStyle: 'preserve-3d',
                  transform: flippedIdx === i ? 'rotateY(180deg)' : 'rotateY(0deg)',
                }}
              >
                <div className="absolute inset-0 w-full h-full z-10 [backface-visibility:hidden]" style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}>
                  <img src="/images/tarot/cardback.png" alt="tarot card" className="w-full h-full object-cover rounded-md border border-white/10" />
                </div>
                <div className="absolute bg-white inset-0 w-full h-full z-20 bg-white dark:bg-slate-800 flex items-center justify-center rounded-md overflow-hidden" style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
                  {cardPicked && <img src={`/images/tarot/${cardPicked.id}.jpg`} alt={cardPicked.kor} className="w-full h-full object-cover" />}
                </div>
              </div>
              <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-[80%] h-8 bg-black/20 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            </div>
          ))}
        </div>
      </div>
    );
  };



  return (
    <AnalysisStepContainer
      guideContent={tarotContent}
      loadingContent={<TarotLoading cardPicked={cardPicked} />}
      resultComponent={null}
      loadingTime={10000000}
    />
  );
}
