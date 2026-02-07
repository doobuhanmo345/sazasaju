'use client';

import React, { useState } from 'react';
import { ShareIcon, LinkIcon, CheckIcon } from '@heroicons/react/24/outline';
import { useLanguage } from '@/contexts/useLanguageContext';

export default function ShareButton() {
  const { language } = useLanguage();
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const shareData = {
      title: 'SAZA SAJU',
      text: language === 'ko' ? '사자(SAZA)에서 당신의 운세를 확인해보세요!' : 'Check your fortune at SAZA SAJU!',
      url: window.location.origin, // Share the home page URL or current URL
    };

    // Try Native Share
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      // Fallback to Clipboard Copy
      try {
        await navigator.clipboard.writeText(shareData.url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy keys', err);
      }
    }
  };

  return (
    <button
      onClick={handleShare}
      className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold transition-all shadow-md active:scale-95 bg-slate-800 text-white hover:bg-slate-900 hover:shadow-lg`}
    >
      {copied ? (
        <>
          <CheckIcon className="w-5 h-5 text-green-400" />
          <span>{language === 'ko' ? '복사됨!' : 'Copied!'}</span>
        </>
      ) : (
        <>
          <ShareIcon className="w-5 h-5" />
          <span>{language === 'ko' ? '사이트 공유하기' : 'Share Site'}</span>
        </>
      )}
    </button>
  );
}
