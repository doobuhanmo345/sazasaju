'use client';

import React, { useEffect } from 'react';
import Image from 'next/image';
import { IoShareOutline } from 'react-icons/io5';
import { useLanguage } from '@/contexts/useLanguageContext';

const messages = {
  ko: {
    metaNotice: '안전한 사용 환경을 위한 안내',
    noticeTitle: '외부 브라우저 사용 안내',
    mainText: '원활한 서비스 이용을 위해 외부 브라우저(Safari/Chrome)로 이동해주세요!',
    buttonText: '외부 브라우저에서 계속 진행',
    failTitle: '자동 전환 실패 시 (iOS 사용자):',
    step1: '1. 화면 우측 하단의 [공유 아이콘]을 눌러주세요.',
    step2: '2. 열린 메뉴에서 [Safari로 열기]를 선택해 주세요.',
    openInSafari: 'Safari로 열기',
    alertFail: "자동 전환이 실패했습니다. 화면 하단의 메뉴를 눌러 'Safari로 열기'를 직접 선택해주세요。",
    langToggle: 'Switch to English',
  },
  en: {
    metaNotice: 'Notice for Secure Usage Environment',
    noticeTitle: 'External Browser Required',
    mainText: 'Please switch to an external browser (Safari/Chrome) for smooth service!',
    buttonText: 'Continue in External Browser',
    failTitle: 'If Auto-Switch Fails (iOS Users):',
    step1: '1. Please tap the [Share Icon] located at the bottom right.',
    step2: '2. Select [Open in Safari] from the opened menu.',
    openInSafari: 'Open in Safari',
    alertFail: "Automatic switch failed. Please manually select 'Open in Safari' from the menu at the bottom of your screen.",
    langToggle: '한국어로 전환',
  },
};

export default function OpenInBrowserPage() {
  const { language: lang, setLanguage: setLang } = useLanguage();
  const t = messages[lang] || messages.ko;
  const [appType, setAppType] = React.useState('default');

  React.useEffect(() => {
    const ua = navigator.userAgent.toLowerCase();
    if (ua.includes('instagram')) setAppType('instagram');
    else if (ua.includes('kakaotalk')) setAppType('kakaotalk');
    else setAppType('default');
  }, []);

  const handleOpenExternal = () => {
    const userAgent = navigator.userAgent.toLowerCase();
    const targetUrl = window.location.origin;
    const encodedUrl = encodeURIComponent(targetUrl);

    if (userAgent.includes('android')) {
      const intentUrl = `intent://${targetUrl.replace(/^https?:\/\//, '')}#Intent;scheme=https;package=com.android.chrome;end`;
      window.location.href = intentUrl;
      return;
    }

    if (appType === 'kakaotalk') {
      window.location.href = `kakaotalk://web/openExternal?url=${encodedUrl}`;
      return;
    }

    alert(
      lang === 'ko'
        ? "브라우저 메뉴에서 'Safari로 열기'를 선택해주세요!"
        : "Please select 'Open in Safari' from the menu!"
    );
  };

  const toggleLang = () => {
    setLang(lang === 'ko' ? 'en' : 'ko');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 bg-[#fffcfc] text-slate-800 font-pretendard relative overflow-hidden">
      {/* Ultra-minimalist Floating Arrow */}
      {appType === 'instagram' ? (
        <div className="fixed top-4 right-4 z-[50] animate-pulse-slide opacity-40 hover:opacity-100 transition-opacity">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" className="rotate-[-45deg] text-rose-300">
            <path d="M7 17L17 7M17 7H7M17 7V17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      ) : (
        <div className="fixed bottom-4 right-4 z-[50] animate-pulse-slide-reverse opacity-40 hover:opacity-100 transition-opacity">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" className="rotate-[45deg] text-rose-300">
            <path d="M7 17L17 7M17 7H7M17 7V17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      )}

      {/* Simplified Glassmorphism Styles */}
      <style jsx>{`
        @keyframes pulse-slide {
          0%, 100% { transform: translate(0, 0); opacity: 0.3; }
          50% { transform: translate(6px, -6px); opacity: 0.8; }
        }
        @keyframes pulse-slide-reverse {
          0%, 100% { transform: translate(0, 0); opacity: 0.3; }
          50% { transform: translate(6px, 6px); opacity: 0.8; }
        }
        .animate-pulse-slide { animation: pulse-slide 2.5s infinite ease-in-out; }
        .animate-pulse-slide-reverse { animation: pulse-slide-reverse 2.5s infinite ease-in-out; }
      `}</style>

      {/* Soft Luminous Backgrounds */}
      <div className="absolute top-[-20%] right-[-20%] w-[500px] h-[500px] bg-rose-50/50 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-indigo-50/30 blur-[100px] rounded-full" />

      {/* Minimal Language Toggle */}
      <button
        onClick={toggleLang}
        className="fixed top-8 left-8 text-[11px] font-bold tracking-[0.2em] text-slate-300 hover:text-rose-400 transition-colors uppercase z-20"
      >
        {lang === 'ko' ? 'EN' : 'KO'}
      </button>

      <div className="w-full max-w-[360px] relative z-10 animate-in fade-in duration-1000">
        {/* Intro */}
        <div className="mb-14 text-center">
          <div className="w-20 h-20 mx-auto mb-8 relative group">
            <div className="absolute inset-0 bg-rose-200 blur-2xl opacity-20" />
            <div className="relative w-full h-full rounded-full border-2 border-white shadow-xl overflow-hidden ring-4 ring-rose-50/50">
              <Image src="/images/sajaProfile.png" alt="Saza" fill className="object-cover" />
            </div>
          </div>
          <h1 className="text-xl font-bold tracking-tight mb-3 text-slate-800">
            {lang === 'ko' ? '새로운 창이 필요해요' : 'Connection Required'}
          </h1>
          <p className="text-[14px] text-slate-500 leading-relaxed font-medium break-keep">
            {lang === 'ko' 
              ? '더 원활한 서비스를 위해 외부 브라우저(Safari/Chrome)로 전환이 필요합니다.' 
              : 'Please switch to an external browser for smooth service.'}
          </p>
        </div>

        {/* Action Area */}
        <div className="space-y-12">
          {/* Main Button */}
          <button 
            onClick={handleOpenExternal} 
            className="w-full py-5 px-6 text-[15px] font-bold bg-white border border-rose-100 text-rose-500 rounded-2xl shadow-xl shadow-rose-100/30 transition-all active:scale-[0.97] hover:bg-rose-50"
          >
            {t.buttonText}
          </button>

          {/* Minimal Instruction Guide */}
          <div className="pt-12 text-center">
            <p className="text-[10px] font-bold text-slate-300 tracking-[0.2em] uppercase mb-8">Manual Method</p>
            
            <div className="space-y-4">
              <p className="text-sm text-slate-600 font-medium break-keep">
                {appType === 'instagram' 
                  ? (lang === 'ko' ? '1. 우측 상단 메뉴 선택' : '1. Tap top right menu')
                  : (lang === 'ko' ? '1. 우측 하단 공유 아이콘 선택' : '1. Tap bottom right share')
                }
              </p>
              <p className="text-sm text-slate-600 font-medium break-keep leading-loose">
                2. <span className="text-rose-400 font-extrabold bg-rose-50/80 px-2 py-1 rounded">[{t.openInSafari}]</span> 눌러 완료
              </p>
            </div>
          </div>
        </div>

        <footer className="mt-20 text-center opacity-30">
          <p className="text-[9px] font-black text-slate-400 tracking-[0.4em] uppercase">Saza Saju Premium</p>
        </footer>
      </div>
    </div>
  );
}
