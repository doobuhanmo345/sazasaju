'use client';

import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/useLanguageContext';
import { useLoading } from '@/contexts/useLoadingContext';

export default function TarotLoading({ cardPicked }) {
  const { language } = useLanguage();
  const { progress: globalProgress, statusText: globalStatusText } = useLoading();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (globalProgress !== undefined) {
      setProgress(globalProgress);
      return;
    }
    // 마운트 직후 애니메이션 시작 (Fallback)
    const timer = setTimeout(() => {
      setProgress(100);
    }, 100);
    return () => clearTimeout(timer);
  }, [globalProgress]);

  return (
    <div className="flex flex-col items-center justify-center px-6 overflow-hidden min-h-[60vh] relative">
      {/* 배경 신비로운 빛 효과 (카드 뒤에서 은은하게 퍼짐) */}
      <div className="absolute w-64 h-64 bg-amber-500/10 blur-[100px] rounded-full animate-pulse" />

      {/* 1. 수직 축 회전 컨테이너 (기존 로직 유지 + 부드러운 상하 부유 추가) */}
      <div className="mt-10 [perspective:1000px] animate-[vertical-spin_4s_infinite_linear] [transform-style:preserve-3d]">
        {/* 상하로 둥둥 떠 있는 느낌을 주는 추가 레이어 */}
        <div className="animate-[magic-float_4s_infinite_ease-in-out] [transform-style:preserve-3d]">
          {/* 2. 30도 기울기 유지 레이어 (사용자님 요청 고정) */}
          <div className="w-32 h-48 -rotate-[30deg] [transform-style:preserve-3d] relative">
            {/* 3. 실제 카드 본체 */}
            <div className="w-full h-full relative [transform-style:preserve-3d]">
              {/* [카드 뒷면] - 테두리 광택 및 그림자 강화 */}
              <div
                className="absolute inset-0 w-full h-full z-20 rounded-lg overflow-hidden border border-white/30 shadow-[0_0_20px_rgba(251,191,36,0.1)]"
                style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
              >
                <img
                  src="/images/tarot/cardback.png"
                  alt="tarot card back"
                  className="w-full h-full object-cover"
                />
                {/* 카드 표면 은은한 빛 반사 효과 */}
                <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent opacity-60" />
              </div>

              {/* [카드 앞면] */}
              <div
                className="absolute inset-0 w-full h-full z-10 bg-slate-900 flex flex-col items-center justify-center rounded-lg shadow-2xl overflow-hidden border border-amber-500/20"
                style={{
                  backfaceVisibility: 'hidden',
                  WebkitBackfaceVisibility: 'hidden',
                  transform: 'rotateY(180deg)',
                }}
              >
                {cardPicked ? (
                  <img
                    src={`/images/tarot/${cardPicked.id}.jpg`}
                    alt={cardPicked.kor}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-slate-800 animate-pulse" />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 로딩 텍스트 부분 - 가독성과 감성 강화 */}
      <div className="mt-24 text-center w-full max-w-[280px]">
        <div className="flex justify-center gap-1.5 mb-4">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-bounce"
              style={{ animationDelay: `${i * 0.2}s` }}
            />
          ))}
        </div>
        <p className="text-amber-700 dark:text-amber-500 font-serif italic text-base tracking-widest animate-pulse mb-6">
          {globalStatusText || (language === 'ko' ? '운명의 카드를 해석하고 있습니다' : 'Interpreting your destiny...')}
        </p>

        {/* 30초 로딩 프로그래스 바 */}
        <div className="relative w-full h-1.5 bg-amber-500/10 rounded-full overflow-hidden border border-amber-500/5">
          <div
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-amber-400 to-amber-600 shadow-[0_0_10px_rgba(245,158,11,0.5)] transition-all ease-linear duration-[30000ms]"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="mt-2 flex justify-between px-1">
          <span className="text-xs text-amber-600/40 font-mono uppercase tracking-tighter">
            {globalProgress !== undefined ? 'Synchronized' : 'Simulating'}
          </span>
          <span className="text-xs text-amber-600/40 font-mono">{Math.round(progress)}%</span>
        </div>
      </div>

      {/* 필요한 커스텀 애니메이션 스타일 */}
      <style jsx>{`
        @keyframes vertical-spin {
          from { transform: rotateY(0deg); }
          to { transform: rotateY(360deg); }
        }
        @keyframes magic-float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
        }
      `}</style>
    </div>
  );
}
