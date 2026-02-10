'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import TarotLoading from '@/app/tarot/TarotLoading';
import AnalysisStepContainer from '@/components/AnalysisStepContainer';
import { useAuthContext } from '@/contexts/useAuthContext';
import { useUsageLimit } from '@/contexts/useUsageLimit';
import { useLoading } from '@/contexts/useLoadingContext';
import { useLanguage } from '@/contexts/useLanguageContext';
import { UI_TEXT } from '@/data/constants';
import { classNames } from '@/utils/helpers';
import TarotAnalysisService, { TarotPresets } from '@/lib/TarotAnalysisService';
import { TARO_CARDS } from '@/data/tarotConstants';
import { BanknotesIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import CreditIcon from '@/ui/CreditIcon';
import ViewTarotResult from '@/app/tarot/ViewTarotResult';
import { DateService } from '@/utils/dateService';
import StartButton from '@/ui/StartButton';
import { useRouter } from 'next/navigation';

export default function TarotMoneyPage() {
  const router = useRouter();
  const { loading, setLoading, setLoadingType, setAiResult, aiResult } = useLoading();
  const { userData, user } = useAuthContext();
  const { language } = useLanguage();
  const { setEditCount, MAX_EDIT_COUNT } = useUsageLimit();
  const [cardPicked, setCardPicked] = useState();
  const [flippedIdx, setFlippedIdx] = useState(null);
  const [step, setStep] = useState('intro');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [isButtonClicked, setIsButtonClicked] = useState(false);
  const [isCardPicked, setIsCardPicked] = useState(false);



  // [UX FIX] Reset AI Result on Mount
  useEffect(() => {
    setAiResult('');
  }, [setAiResult]);

  // [NEW] Reactive Redirect
  useEffect(() => {
    if (isButtonClicked && !loading && isCardPicked) {
      router.push('/tarot/tarotmoney/result');
    }
  }, [isButtonClicked, loading, isCardPicked, router]);

  // Client-side Title Update for Localization (Static Export Support)
  useEffect(() => {
    if (language === 'ko') {
      document.title = '금전 타로 | 부의 흐름과 금전적 성공 가이드';
    } else {
      document.title = 'Wealth Tarot | Guide to Financial Success';
    }
  }, [language]);


  const moneyCategories = language === 'ko'
    ? [
      { id: 'business', label: '사업 및 장사운', icon: '💼' },
      { id: 'investment', label: '주식 및 재테크', icon: '📈' },
      { id: 'job', label: '취업 및 승진', icon: '🏆' },
      { id: 'unexpected', label: '뜻밖의 횡재수', icon: '🎁' },
      { id: 'general', label: '전반적인 흐름', icon: '💰' },
    ]
    : [
      { id: 'business', label: 'Business Fortune', icon: '💼' },
      { id: 'investment', label: 'Financial Management Fortune', icon: '📈' },
      { id: 'job', label: 'Career Fortune', icon: '🏆' },
      { id: 'unexpected', label: 'Unexpected windful', icon: '🎁' },
      { id: 'general', label: 'General wealth flow', icon: '💰' },
    ];

  const getMoneyDeck = () => {
    const pentacles = TARO_CARDS.filter((c) => c.suite === 'Pentacles');
    const majorMoney = TARO_CARDS.filter((c) => ['The Sun', 'Wheel of Fortune', 'The Empress', 'The Emperor', 'The Magician'].includes(c.name));
    return [...pentacles, ...majorMoney];
  };

  const handleCardPick = async (onStart, index) => {
    const moneyDeck = getMoneyDeck();
    const pickedCard = moneyDeck[Math.floor(Math.random() * moneyDeck.length)];
    const categoryLabel = moneyCategories.find((c) => c.id === selectedCategory)?.label;
    setCardPicked(pickedCard);
    setFlippedIdx(index);
    setIsButtonClicked(true);

    setTimeout(async () => {
      setFlippedIdx(null);

      onStart(); // Trigger loading UI immediately

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
        await service.analyze(TarotPresets.money({ pickedCard, categoryLabel }));
        setIsCardPicked(true);
      } catch (e) {
        // Error handling
      }
    }, 1000);
  };

  const renderContent = (onStart) => {
    if (loading) return <TarotLoading cardPicked={cardPicked} />;
    if (step === 'intro') {
      return (
        <div className="max-w-lg mx-auto text-center px-6 animate-in fade-in duration-700 pt-10">
          <h2 className="relative text-3xl font-black text-slate-800 dark:text-slate-100 mb-4">
            <div className="opacity-40 absolute left-1/2 -translate-x-1/2 w-20 h-20 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
              <BanknotesIcon className="w-10 h-10 text-amber-600" />
            </div>
            {language === 'ko' ? '황금빛 금전운 분석' : 'Tarot Wealth luck'}
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mb-10 text-sm">
            {language === 'ko' ? <>당신의 재물 흐름과 부의 기회를<br />타로 카드로 정밀하게 진단해 드립니다.</> : 'Diagnose my wealth flow and opportunities'}
          </p>
          <div className="m-auto my-3 max-w-sm rounded-2xl overflow-hidden shadow-sm border border-slate-100 dark:border-slate-800">
            <img src="/images/introcard/tarot_1.webp" alt="sazatalk" className="w-full h-auto" />
          </div>
          <StartButton onClick={() => setStep('category')} color='amber' />
        </div>
      );
    }

    if (step === 'category') {
      return (
        <div className="max-w-lg mx-auto px-6 animate-in slide-in-from-right duration-500 pt-10">
          <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-6 text-center">{language === 'ko' ? '어떤 금전운이 궁금하신가요?' : 'What would you like to know about your wealth luck?'}</h3>
          <div className="space-y-3">
            {moneyCategories.map((cat) => (
              <button key={cat.id} onClick={() => { setSelectedCategory(cat.id); setStep('selection'); }}
                className="w-full p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md flex items-center justify-between hover:border-amber-400 dark:hover:border-amber-500 hover:bg-amber-50 dark:hover:bg-slate-700 transition-all group">
                <div className="flex items-center gap-3"><span className="text-2xl">{cat.icon}</span><span className="font-semibold text-slate-700 dark:text-slate-200">{cat.label}</span></div>
                <ChevronRightIcon className="w-5 h-5 text-slate-300 dark:text-slate-600 group-hover:text-amber-500" />
              </button>
            ))}
          </div>
        </div>
      );
    }

    return (
      <div className="max-w-lg mx-auto text-center px-6 animate-in zoom-in-95 duration-500 pt-10">
        <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">{language === 'ko' ? '카드를 골라 주세요.' : 'Choose your Card'}</h3>
        <p className="text-sm text-slate-500 mb-6">{language === 'ko' ? '가장 마음이 가는 한 장을 클릭하세요.' : 'Follow your heart, pick one of six cards'}</p>
        <div className="my-3"><CreditIcon num={-1} /></div>
        <div className="grid grid-cols-3 gap-3 mb-10">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div key={i} onClick={() => flippedIdx === null && handleCardPick(onStart, i)}
              className={classNames('relative aspect-[2/3] cursor-pointer group', 'transition-all duration-500 [transition-timing-function:cubic-bezier(0.34,1.56,0.64,1)]', flippedIdx === null ? 'hover:-translate-y-10 hover:scale-110 hover:-rotate-3 hover:z-50' : 'pointer-events-none')}
              style={{ transformStyle: 'preserve-3d' }}>
              <div className="w-full h-full transition-transform duration-700 shadow-xl rounded-2xl relative" style={{ transformStyle: 'preserve-3d', transform: flippedIdx === i ? 'rotateY(180deg)' : 'rotateY(0deg)' }}>
                <div className="absolute inset-0 w-full h-full z-10 [backface-visibility:hidden]" style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}>
                  <img src="/images/tarot/cardback.png" alt="tarot card" className="w-full h-full object-cover rounded-2xl border border-white/10" />
                </div>
                <div className="absolute inset-0 w-full h-full z-20 bg-white dark:bg-slate-800 flex items-center justify-center rounded-2xl overflow-hidden" style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
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
      guideContent={renderContent}
      loadingContent={<TarotLoading cardPicked={cardPicked} />}
      resultComponent={null}
      loadingTime={10000000}
    />
  );
}
