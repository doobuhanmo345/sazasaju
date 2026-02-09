'use client';

import { useState, useEffect } from 'react';

export const AnalysisStepContainer = ({
  guideContent, // 안내 페이지에 보여줄 JSX
  loadingContent, // 로딩 페이지에 보여줄 JSX
  resultComponent: ResultComponent, // 최종 결과 컴포넌트
  loadingTime = 2500, // 로딩 지속 시간 (기본값 2.5초)
  onStart, // 시작 버튼 클릭 시 추가 로직 (선택)
}) => {
  const [stage, setStage] = useState('guide'); // guide, loading, result

  const handleStart = () => {
    if (onStart) onStart();
    setStage('loading');
  };

  const handleReset = () => {
    setStage('guide');
  };

  useEffect(() => {
    if (stage === 'loading') {
      const timer = setTimeout(() => {
        setStage('result');
      }, loadingTime);
      return () => clearTimeout(timer);
    }
  }, [stage, loadingTime]);

  // 단계 변경 시 화면 맨 위로 스크롤
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [stage]);

  return (
    <div className="w-full transition-all duration-500">
      {/* 1. 안내 단계 */}
      {stage === 'guide' && (
        <div className="animate-in fade-in duration-700">{guideContent(handleStart)}</div>
      )}

      {/* 2. 로딩 단계 */}
      {stage === 'loading' && (
        <div className="animate-in zoom-in-95 fade-in duration-500">{loadingContent}</div>
      )}

      {/* 3. 결과 단계 */}
      {stage === 'result' && (
        <div className="animate-in slide-in-from-bottom-4 fade-in duration-1000">
          <ResultComponent onReset={handleReset} />
        </div>
      )}
    </div>
  );
};

export default AnalysisStepContainer;
