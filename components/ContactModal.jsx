'use client';

import { useState } from 'react';
import { useLanguage } from '@/contexts/useLanguageContext';

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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-2xl max-w-sm w-full">
        <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
          {language === 'ko' ? '도움말 및 문의' : 'Help & Contact'}
        </h3>
        <p className="mb-4 text-gray-700 dark:text-gray-300">
          {language === 'ko'
            ? '궁금한 점이나 문의사항은 아래 이메일로 편하게 보내주세요.'
            : 'Click the email below to copy it for inquiries or bug reports.'}
        </p>

        <a
          href="#"
          onClick={handleCopyEmail}
          className={`block w-full text-center py-3 font-bold rounded-lg transition-colors 
            ${
              isCopied
                ? 'bg-green-500 text-white hover:bg-green-600'
                : 'bg-indigo-500 text-white hover:bg-indigo-600'
            }`}
        >
          {isCopied
            ? language === 'ko'
              ? '✅ 복사 완료!'
              : '✅ Copied!'
            : email}
        </a>

        <button
          onClick={onClose}
          className="mt-4 w-full py-2 text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
        >
          {language === 'ko' ? '닫기' : 'Close'}
        </button>
      </div>
    </div>
  );
}
