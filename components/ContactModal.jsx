'use client';

import { useState } from 'react';
import { useLanguage } from '@/contexts/useLanguageContext';
import { EnvelopeIcon, XMarkIcon } from '@heroicons/react/24/outline';

export default function ContactModal({ onClose, email }) {
  const [isCopied, setIsCopied] = useState(false);
  const { language } = useLanguage();

  const handleCopyEmail = async (e) => {
    e.preventDefault();

    try {
      await navigator.clipboard.writeText(email);
      setIsCopied(true);

      setTimeout(() => {
        setIsCopied(false);
        onClose();
      }, 2000);
    } catch (err) {
      console.error('클립보드 복사 실패:', err);
      window.location.href = `mailto:${email}?subject=${language === 'ko' ? '[문의사항]' : '[Inquiry]'}`;
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-t-[2.5rem] sm:rounded-[2.5rem] shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-500 border border-white/20">

        {/* Decorative Background */}
        <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-indigo-500/20 to-transparent pointer-events-none" />

        <div className="relative p-8 pt-10">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-6 right-6 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-400"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>

          {/* Header */}
          <div className="text-center mb-10 space-y-2">
            <div className="mx-auto w-12 h-12 bg-indigo-50 dark:bg-indigo-500/10 rounded-2xl flex items-center justify-center mb-4">
              <EnvelopeIcon className="w-6 h-6 text-indigo-500" />
            </div>
            <h2 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">
              {language === 'ko' ? '도움말 및 문의' : 'Help & Contact'}
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium break-keep">
              {language === 'ko'
                ? '궁금한 점이나 문의사항은 아래 이메일로 편하게 보내주세요.'
                : 'Click the email below to copy it for inquiries or bug reports.'}
            </p>
          </div>

          {/* Action Area */}
          <div className="space-y-4">
            <button
              onClick={handleCopyEmail}
              className={`w-full h-14 font-bold rounded-2xl transition-all active:scale-[0.98] shadow-lg
                ${isCopied
                  ? 'bg-emerald-500 text-white shadow-emerald-500/20'
                  : 'bg-indigo-600 text-white shadow-indigo-600/20 hover:bg-indigo-700'
                }`}
            >
              {isCopied
                ? language === 'ko'
                  ? '✅ 복사 완료!'
                  : '✅ Copied!'
                : email}
            </button>

            <button
              onClick={onClose}
              className="w-full h-12 text-slate-500 dark:text-slate-400 font-bold hover:bg-slate-50 dark:hover:bg-white/5 rounded-2xl transition-colors"
            >
              {language === 'ko' ? '나중에 하기' : 'Maybe Later'}
            </button>
          </div>

          {/* Optional: Add help text or version info if needed */}
          <p className="mt-8 text-center text-xs text-slate-400 px-6 leading-relaxed">
            {language === 'ko'
              ? '보내주신 의견은 사자사주 서비스 품질 개선을 위해 소중하게 사용됩니다.'
              : 'Your feedback is invaluable for improving SAZA SAJU service quality.'}
          </p>
        </div>
      </div>
    </div>
  );
}
