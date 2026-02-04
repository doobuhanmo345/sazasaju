'use client';

import React, { useState } from 'react';
import { toPng } from 'html-to-image';
import { NativeBridge } from '@/utils/nativeBridge';
import { ShareIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import { useLanguage } from '@/contexts/useLanguageContext';

export default function ShareButton({ targetId, fileName = 'saza-result.png' }) {
  const { language } = useLanguage();
  const [isGenerating, setIsGenerating] = useState(false);

  const handleShare = async () => {
    const element = document.getElementById(targetId);
    if (!element) {
      console.error('Target element not found:', targetId);
      return;
    }

    setIsGenerating(true);
    try {
      // 1. Capture element as PNG base64
      // We set style to ensure background is white if it's transparent
      const dataUrl = await toPng(element, { 
        backgroundColor: '#ffffff',
        cacheBust: true,
      });

      // 2. Pass to NativeBridge
      await NativeBridge.shareImage(dataUrl, fileName);
    } catch (err) {
      console.error('Error generating image:', err);
      alert(language === 'ko' ? '이미지 생성 중 오류가 발생했습니다.' : 'Error generating image.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <button
      onClick={handleShare}
      disabled={isGenerating}
      className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold transition-all shadow-md active:scale-95
        ${isGenerating 
          ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
          : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-lg'}`}
    >
      {isGenerating ? (
        <>
          <div className="w-4 h-4 border-2 border-indigo-500 border-t-white rounded-full animate-spin"></div>
          <span>{language === 'ko' ? '생성 중...' : 'Generating...'}</span>
        </>
      ) : (
        <>
          <ShareIcon className="w-5 h-5" />
          <span>{language === 'ko' ? '결과 공유하기' : 'Share Result'}</span>
        </>
      )}
    </button>
  );
}
