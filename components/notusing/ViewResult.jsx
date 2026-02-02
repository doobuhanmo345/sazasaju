'use client';

import { useMemo, useEffect, useRef } from 'react';
import AfterReport from '@/components/AfterReport';
import { useLoading } from '@/contexts/useLoadingContext';
import { aiSajuStyle, reportStyle } from '@/data/aiResultConstants';

export default function ViewResult({}) {
  const { loading, aiResult } = useLoading();
  const scrollElRef = useRef(null);
  const activeTabRef = useRef(0);

  const pureHtml = useMemo(() => {
    if (!aiResult) return '';
    let cleanedResponse = aiResult.trim();
    const startMarker = /^\s*```html\s*|^\s*```\s*/i;
    const endMarker = /\s*```\s*$/;
    cleanedResponse = cleanedResponse.replace(startMarker, '').replace(endMarker, '');
    return cleanedResponse.trim();
  }, [aiResult]);

  const handleSubTitleClick = (index) => {
    if (index === undefined) index = activeTabRef.current;
    activeTabRef.current = index;

    const container = scrollElRef.current;
    if (!container) return;

    const tiles = container.querySelectorAll('.subTitle-tile');
    const cards = container.querySelectorAll('.report-card');

    if (tiles.length === 0) return;

    tiles.forEach((t) => t.classList.remove('active'));
    cards.forEach((c) => {
      c.style.display = 'none';
      c.classList.remove('active');
    });

    if (tiles[index]) tiles[index].classList.add('active');
    if (cards[index]) {
      cards[index].style.display = 'block';
      cards[index].classList.add('active');
    }
  };

  useEffect(() => {
    window.handleSubTitleClick = handleSubTitleClick;

    if (pureHtml) {
      const timer = setTimeout(() => {
        handleSubTitleClick(0);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [pureHtml]);

  if (loading) return <>로딩중</>;

  return (
    <>
      <div ref={scrollElRef} className="max-w-lg m-auto">
        <div dangerouslySetInnerHTML={{ __html: pureHtml }} />
        <div dangerouslySetInnerHTML={{ __html: reportStyle }} />
        <div dangerouslySetInnerHTML={{ __html: aiSajuStyle }} />
        <AfterReport />
      </div>
    </>
  );
}
