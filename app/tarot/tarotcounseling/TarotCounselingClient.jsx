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
import { DateService } from '@/utils/dateService';
import CreditIcon from '@/ui/CreditIcon';
import { TARO_CARDS } from '@/data/tarotConstants';
import {
  ChatBubbleLeftRightIcon,
  PencilSquareIcon,
} from '@heroicons/react/24/outline';
import TarotLoading from '@/app/tarot/TarotLoading';
import StartButton from '@/ui/StartButton';

export default function TarotCounselingPage() {
  const { loading, setLoading, setLoadingType, setAiResult } = useLoading();
  const { userData, user } = useAuthContext();
  const { language } = useLanguage();
  const { setEditCount, MAX_EDIT_COUNT } = useUsageLimit();

  // Client-side Title Update for Localization (Static Export Support)
  useEffect(() => {
    if (language === 'ko') {
      document.title = '타로 심층 상담 |  타로 마스터와의 대화';
    } else {
      document.title = 'Deep Tarot Counseling | AI Tarot Master Session';
    }
  }, [language]);

  const [cardPicked, setCardPicked] = useState();
  const [step, setStep] = useState('intro');
  const [flippedIdx, setFlippedIdx] = useState(null);
  const [userQuestion, setUserQuestion] = useState('');

  const allCards = TARO_CARDS;

  const handleCardPick = async (onStart, index) => {
    if (!userQuestion.trim()) return alert('고민 내용을 입력해주세요.');

    const pickedCard = allCards[Math.floor(Math.random() * allCards.length)];
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
        await service.analyze(TarotPresets.counseling({ pickedCard, userQuestion }));
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
            <ChatBubbleLeftRightIcon className="w-10 h-10 text-purple-600" />
          </div>
          <h2 className="text-3xl font-black text-slate-800 dark:text-white mb-4">{language === 'ko' ? '심층 고민 상담' : 'In-depth tarot counselling'}</h2>
          <p className="text-slate-500 mb-10 text-sm break-keep">
            {language === 'ko' ? <>말 못 할 고민이 있나요? 78장의 카드가<br />당신의 마음을 읽고 해답을 찾아드립니다.</> : 'Is there any unspoken concerns? 78 Tarot card will rad your mind and provide answers'}
          </p>
          <div className="m-auto my-3 max-w-sm rounded-2xl overflow-hidden shadow-sm border border-slate-100 dark:border-slate-800">
            <img src="/images/introcard/tarot_1.webp" alt="sazatalk" className="w-full h-auto" />
          </div>
          <StartButton onClick={() => setStep('input')} color='purple' />
        </div>
      );
    }

    if (step === 'input') {
      return (
        <div className="max-w-lg mx-auto px-6 animate-in slide-in-from-bottom duration-500 pt-10">
          <div className="flex items-center gap-2 mb-4 text-purple-600">
            <PencilSquareIcon className="w-5 h-5" /><h3 className="font-bold">{language === 'ko' ? '당신의 고민을 들려주세요' : 'Tell us what is on your mind'}</h3>
          </div>
          <textarea value={userQuestion} onChange={(e) => setUserQuestion(e.target.value)}
            placeholder={language === 'ko' ? '예: 요즘 대인관계 때문에 너무 힘들어요. 어떻게 하면 좋을까요?' : 'Ex: I am struggling with relationships lately. What should I do?'}
            className="w-full h-40 p-4 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-purple-400 dark:focus:ring-purple-500 focus:border-transparent outline-none resize-none text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 shadow-inner placeholder:text-slate-400 dark:placeholder:text-slate-500"
          />
          <button onClick={() => userQuestion.trim() && setStep('selection')} disabled={!userQuestion.trim()}
            className={classNames('w-full py-4 mt-6 rounded-xl font-bold transition-all', userQuestion.trim() ? 'bg-purple-600 dark:bg-purple-700 text-white shadow-lg shadow-purple-100 dark:shadow-none' : 'bg-slate-200 dark:bg-slate-700 text-slate-400 dark:text-slate-500 cursor-not-allowed')}>
            {language === 'ko' ? '카드로 해답 찾기' : 'Find answers through cards'}
          </button>
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
              <div className="w-full h-full transition-transform duration-700 shadow-xl rounded-md relative" style={{ transformStyle: 'preserve-3d', transform: flippedIdx === i ? 'rotateY(180deg)' : 'rotateY(0deg)' }}>
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

  const ResultComponent = useCallback(() => <ViewTarotResult cardPicked={cardPicked} />, [cardPicked]);

  return (
    <AnalysisStepContainer
      guideContent={renderContent}
      loadingContent={<TarotLoading />}
      resultComponent={ResultComponent}
      loadingTime={0}
    />
  );
}
