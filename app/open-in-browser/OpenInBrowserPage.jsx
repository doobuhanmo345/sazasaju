'use client';

import { useEffect } from 'react';
import { IoShareOutline } from 'react-icons/io5';
import Image from 'next/image';
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
    alertFail:
      "자동 전환이 실패했습니다. 화면 하단의 메뉴를 눌러 'Safari로 열기'를 직접 선택해주세요。",
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
    alertFail:
      "Automatic switch failed. Please manually select 'Open in Safari' from the menu at the bottom of your screen.",
    langToggle: '한국어로 전환',
  },
};

function HighlightedText({ text, highlight }) {
  if (!text || !text.includes(`[${highlight}]`)) return <span>{text}</span>;
  const parts = text.split(`[${highlight}]`);
  return (
    <span>
      {parts.map((part, index) => (
        <span key={index}>
          {part}
          {index < parts.length - 1 && <span className="font-bold text-gray-800 whitespace-nowrap">[{highlight}]</span>}
        </span>
      ))}
    </span>
  );
}

function IconInText({ text, lang }) {
  const searchTag = lang === 'ko' ? '[공유 아이콘]' : '[Share Icon]';
  const [before, after] = text.split(searchTag);
  if (!after) return <span>{text}</span>;
  const highlightText = lang === 'ko' ? '공유 아이콘' : 'Share Icon';
  return (
    <span>
      {before}
      <span className="whitespace-nowrap inline-flex items-center font-bold">
        {highlightText}
        <IoShareOutline className="inline-block ml-1 mr-1 text-lg text-blue-600" />
      </span>
      {after}
    </span>
  );
}

export default function OpenInBrowserPage() {
  const { language: lang, setLanguage: setLang } = useLanguage();
  const t = messages[lang];
  
  useEffect(() => {
    const userAgent = navigator.userAgent.toLowerCase();
    const isInApp =
      userAgent.includes('kakaotalk') ||
      userAgent.includes('instagram') ||
      userAgent.includes('naver') ||
      userAgent.includes('fb') ||
      userAgent.includes('line');

    if (!isInApp) {
      // 외부 브라우저에서 열렸으면 메인으로 이동
      window.location.replace('/');
    }
  }, []);

  const handleOpenExternal = () => {
    const userAgent = navigator.userAgent.toLowerCase();
    const targetUrl = window.location.origin;
    const encodedUrl = encodeURIComponent(targetUrl);

    // Android (크롬 강제 실행)
    if (userAgent.includes('android')) {
      const intentUrl = `intent://${targetUrl.replace(/^https?:\/\//, '')}#Intent;scheme=https;package=com.android.chrome;end`;
      window.location.href = intentUrl;
      return;
    }

    // 카카오톡
    if (userAgent.includes('kakaotalk')) {
      window.location.href = `kakaotalk://web/openExternal?url=${encodedUrl}`;
      return;
    }

    // iOS (인스타/페이스북) - 수동 가이드
    const guideSection = document.getElementById('ios-guide');
    if (guideSection) {
      guideSection.scrollIntoView({ behavior: 'smooth' });
      guideSection.style.border = '4px solid #ff3b30';
      setTimeout(() => {
        guideSection.style.border = '2px solid #ff3b30';
      }, 500);
    }

    alert(
      lang === 'ko'
        ? "아이폰은 상단 메뉴의 '외부 브라우저로 열기'를 눌러야 로그인이 가능합니다!"
        : "For iPhone, please tap 'Open in external' from the top menu to login!",
    );
  };

  const toggleLang = () => {
    setLang(lang === 'ko' ? 'en' : 'ko');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-5 text-center bg-gray-100">
      {/* 언어 선택 버튼 */}
      <button
        className="fixed top-5 right-5 text-[15px] font-black cursor-pointer text-white bg-blue-600 px-5 py-2.5 rounded-full shadow-lg border-2 border-white z-[9999] flex items-center gap-2 transition-all hover:scale-105"
        onClick={toggleLang}
      >
        <span className="text-lg">🌐</span>
        {t.langToggle}
      </button>

      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden mt-5">
        <div className="bg-gray-50 px-8 py-4 text-left border-b border-gray-200">
          <p className="text-gray-600 text-sm m-0">🛡️ {t.metaNotice}</p>
        </div>

        <div className="p-8">
          <div className="flex flex-col items-center mb-5 relative">
            <div className="relative bg-blue-50 rounded-2xl px-5 py-4 max-w-[85%] text-center text-gray-800 text-base leading-relaxed shadow-sm">
              {t.mainText}
              <div className="absolute bottom-[-10px] left-1/2 -translate-x-1/2 w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[10px] border-t-blue-50"></div>
            </div>
            <Image
              src="/images/sajaProfile.png"
              alt="Master"
              width={80}
              height={80}
              className="w-20 h-20 rounded-full object-cover border-2 border-gray-300 mt-5"
            />
          </div>

          <button
            onClick={handleOpenExternal}
            className="w-full px-6 py-3.5 text-lg font-bold bg-blue-600 text-white border-none rounded-lg cursor-pointer shadow-lg hover:bg-blue-700 transition-colors"
          >
            {t.buttonText}
          </button>

          <div id="ios-guide" className="mt-9 p-5 bg-gray-50 rounded-lg text-left leading-relaxed border border-gray-200">
            <p className="font-bold">{t.failTitle}</p>
            <ol className="pl-1 mt-2.5 mb-0">
              <li className="mb-1.5">
                <IconInText text={t.step1} lang={lang} />
              </li>
              <li>
                <HighlightedText text={t.step2} highlight={t.openInSafari} />
              </li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
