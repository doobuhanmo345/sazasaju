'use client';

import React from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useAuthContext } from '@/contexts/useAuthContext';
import { useLanguage } from '@/contexts/useLanguageContext';
import { SiGoogle, SiKakaotalk } from "react-icons/si";
import Image from 'next/image';

export default function LoginModal({ isOpen, onClose }) {
  const { login } = useAuthContext();
  const { language } = useLanguage();

  if (!isOpen) return null;

  const handleProviderLogin = async (provider) => {
    await login(provider);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-md animate-in slide-in-from-bottom duration-500">

        {/* Leaning Saza mascot */}
        <div className="relative h-28 -mb-10 z-20 pointer-events-none">
          <div className="absolute -top-[100px] left-1/2 -translate-x-1/2 bottom-0 w-48 h-48">
            <img
              src="/images/brand/login_saza.png"
              className="w-full h-full object-contain"
              alt="leaning mascot"
            />
          </div>
        </div>

        <div className="relative w-full bg-white dark:bg-slate-900 rounded-t-[2.5rem] sm:rounded-[2.5rem] shadow-2xl overflow-hidden border border-white/20">

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
              <h2 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">
                {language === 'ko' ? '사자사주 로그인' : 'Login to SAZA SAJU'}
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                {language === 'ko' ? '오늘의 운세와 정밀 리포트를 확인하세요' : 'Discover your daily fortune and reports'}
              </p>
            </div>

            {/* Social Buttons */}
            <div className="space-y-4">
              {/* Kakao */}
              <button
                onClick={() => handleProviderLogin('kakao')}
                className="w-full h-14 bg-[#FEE500] hover:bg-[#FDD835] text-[#191919] rounded-2xl flex items-center justify-center gap-3 font-bold transition-all active:scale-[0.98] shadow-lg shadow-yellow-500/10"
              >
                <SiKakaotalk className="w-6 h-6" />
                <span>{language === 'ko' ? '카카오로 시작하기' : 'Continue with Kakao'}</span>
              </button>



              {/* Google */}
              <button
                onClick={() => handleProviderLogin('google')}
                className="w-full h-14 bg-white dark:bg-white text-slate-700 rounded-2xl flex items-center justify-center gap-3 font-bold transition-all active:scale-[0.98] shadow-lg shadow-slate-200 dark:shadow-none border border-slate-100"
              >
                <SiGoogle className="w-5 h-5 text-[#4285F4]" />
                <span>{language === 'ko' ? 'Google로 시작하기' : 'Continue with Google'}</span>
              </button>
            </div>

            {/* Footer Text */}
            <p className="mt-10 text-center text-xs text-slate-400 px-6 leading-relaxed">
              {language === 'ko'
                ? '로그인 시 사자사주의 서비스 이용약관 및 개인정보 처리방침에 동의하게 됩니다.'
                : 'By logging in, you agree to SAZA SAJU\'s Terms of Service and Privacy Policy.'}
            </p>
          </div>
        </div>
      </div>
    </div>

  );
}
