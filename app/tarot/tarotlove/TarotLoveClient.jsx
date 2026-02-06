'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
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
import {
  HeartIcon,
  ChevronRightIcon,
  UserGroupIcon,
  UserMinusIcon,
  ArrowsRightLeftIcon,
} from '@heroicons/react/24/outline';
import CreditIcon from '@/ui/CreditIcon';
import TarotLoading from '@/app/tarot/TarotLoading';
import { DateService } from '@/utils/dateService';
import StartButton from '@/ui/StartButton';

export default function TarotLovePage() {
  const { setLoadingType, setAiResult } = useLoading();
  const [loading, setLoading] = useState(false)
  const { userData, user } = useAuthContext();
  const { language } = useLanguage();
  const { setEditCount, MAX_EDIT_COUNT } = useUsageLimit();

  // Client-side Title Update for Localization (Static Export Support)
  useEffect(() => {
    if (language === 'ko') {
      document.title = '연애 타로 | 당신의 사랑과 인연의 흐름';
    } else {
      document.title = 'Love Tarot | Insights into Romance & Connections';
    }
  }, [language]);

  const [cardPicked, setCardPicked] = useState();
  const [flippedIdx, setFlippedIdx] = useState(null);
  const [step, setStep] = useState('intro');
  const [loveType, setLoveType] = useState('');

  const loveTypes = language === 'ko'
    ? [
      { id: 'solo', label: '새로운 인연 (솔로)', icon: <UserMinusIcon className="w-6 h-6" />, desc: '앞으로 다가올 인연과 나의 매력' },
      { id: 'couple', label: '현재 관계 (커플)', icon: <UserGroupIcon className="w-6 h-6" />, desc: '상대방의 속마음과 우리의 미래' },
      { id: 'reunion', label: '과거의 인연 (재회)', icon: <ArrowsRightLeftIcon className="w-6 h-6" />, desc: '그 사람의 소식과 다시 만날 가능성' },
    ]
    : [
      { id: 'solo', label: 'New relationship', icon: <UserMinusIcon className="w-6 h-6" />, desc: 'upcoming fate connection and my charm' },
      { id: 'couple', label: 'Current relationship', icon: <UserGroupIcon className="w-6 h-6" />, desc: "opponent's inner thoughts and our future" },
      { id: 'reunion', label: 'Past relationship', icon: <ArrowsRightLeftIcon className="w-6 h-6" />, desc: 'Possibility of meeting again' },
    ];

  const handleCardPick = async (onStart, index) => {
    const pickedCard = TARO_CARDS[Math.floor(Math.random() * TARO_CARDS.length)];
    const typeLabel = loveTypes.find((t) => t.id === loveType)?.label;

    setCardPicked(pickedCard);
    setFlippedIdx(index);

    setTimeout(async () => {
      setFlippedIdx(null);

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
        await service.analyze(TarotPresets.love({ pickedCard, typeLabel }));
      } catch (e) {
        // Error is alerted in the service
      }
    }, 1000);
  };

  const renderContent = (onStart) => {
    if (loading) return <TarotLoading cardPicked={cardPicked} />;
    if (step === 'intro') {
      return (
        <div className="max-w-lg mx-auto text-center px-6 animate-in fade-in duration-700 pt-10">
          <div className="opacity-40 absolute left-1/2 -translate-x-1/2 w-20 h-20 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <HeartIcon className="w-10 h-10 text-rose-500 fill-rose-500 animate-pulse" />
          </div>
          <h2 className="text-3xl font-black text-slate-800 dark:text-slate-100 mb-4">{language === 'ko' ? '타로 연애운' : 'Love Fortune'}</h2>
          <p className="text-slate-500 dark:text-slate-400 mb-10 text-sm">
            {language === 'ko' ? <>새로운 인연에서 부터 현재 인연, 그리고 과거의 인연<br />궁합이나 관계에 대해서 알려드립니다.</> : <>From the past to future, Check out the love and relationship status</>}
          </p>
          <div className="m-auto my-3 max-w-sm rounded-2xl overflow-hidden shadow-sm border border-slate-100 dark:border-slate-800">
            <img src="/images/introcard/tarot_1.webp" alt="sazatalk" className="w-full h-auto" />
          </div>
          <StartButton onClick={() => setStep('type_select')} color='rose' />
        </div>
      );
    }

    if (step === 'type_select') {
      return (
        <div className="max-w-lg mx-auto px-6 animate-in slide-in-from-right duration-500 pt-10">
          <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-6 text-center">{language === 'ko' ? '현재 당신의 상황은?' : 'What is your current situation?'}</h3>
          <div className="space-y-4">
            {loveTypes.map((t) => (
              <button key={t.id} onClick={() => { setLoveType(t.id); setStep('selection'); }}
                className="w-full p-5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl flex items-center gap-4 hover:border-rose-400 dark:hover:border-rose-500 hover:bg-rose-50 dark:hover:bg-slate-700 transition-all text-left group">
                <div className="w-12 h-12 bg-slate-50 dark:bg-slate-900 rounded-full flex items-center justify-center text-rose-500 group-hover:bg-white dark:group-hover:bg-slate-800 transition-colors">{t.icon}</div>
                <div className="flex-1"><div className="font-bold text-slate-800 dark:text-slate-100">{t.label}</div><div className="text-xs text-slate-500 dark:text-slate-400">{t.desc}</div></div>
                <ChevronRightIcon className="w-5 h-5 text-slate-300 dark:text-slate-600 group-hover:text-rose-500" />
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
                  <img src="/images/tarot/cardback.png" alt="tarot card" className="w-full h-full object-cover rounded-md border border-white/10" />
                </div>
                <div className="absolute inset-0 w-full h-full z-20 bg-white dark:bg-slate-800 flex items-center justify-center rounded-md overflow-hidden" style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
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

  useEffect(() => {
    if (loading) window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [loading]);

  const ResultComponent = useCallback(() => <ViewTarotResult cardPicked={cardPicked} loading={loading} />, [cardPicked, loading]);

  return (
    <AnalysisStepContainer
      guideContent={renderContent}
      loadingContent={<TarotLoading />}
      resultComponent={ResultComponent}
      loadingTime={0}
    />
  );
}
