import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
  HomeIcon,
  SparklesIcon,
  IdentificationIcon,
  UserCircleIcon
} from '@heroicons/react/24/outline';
import {
  HomeIcon as HomeIconSolid,
  SparklesIcon as SparklesIconSolid,
  IdentificationIcon as IdentificationIconSolid,
  UserCircleIcon as UserCircleIconSolid
} from '@heroicons/react/24/solid';

import { useAuthContext } from '@/contexts/useAuthContext';
import { useLanguage } from '@/contexts/useLanguageContext';

export default function MenuBar() {
  const { user, openLoginModal, selectedProfile } = useAuthContext();
  const router = useRouter();
  const pathname = usePathname();
  const { language } = useLanguage();

  const isKo = language === 'ko';

  return (
    <nav className="fixed -bottom-14 left-0 right-0 z-[70] bg-white/90 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-100 dark:border-slate-800 pt-4 pb-[calc(2.5rem+env(safe-area-inset-bottom,0px)+40px)]">
      <div className="max-w-md mx-auto flex justify-between items-center px-3">
        <button
          onClick={() => router.push('/')}
          className={`relative flex min-w-[82px] flex-col items-center gap-1.5 transition-all duration-200 active:scale-90 px-2 py-2.5 rounded-2xl group ${pathname === '/' ? 'text-indigo-600 active:bg-indigo-100/50' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800/50 active:bg-slate-100 dark:active:bg-slate-800'}`}
        >
          {pathname === '/' && (
            <div className="absolute inset-0 bg-indigo-50 dark:bg-indigo-500/15 rounded-2xl -z-10 animate-in fade-in zoom-in-95 duration-500" />
          )}
          {pathname === '/' ? (
            <HomeIconSolid className="w-6 h-6 transition-transform" />
          ) : (
            <HomeIcon className="w-6 h-6 transition-transform group-hover:scale-110" />
          )}
          <span className="text-[10px] font-black uppercase tracking-widest">{isKo ? '홈' : 'Home'}</span>
        </button>

        <button
          onClick={() => router.push('/fortune')}
          className={`relative flex min-w-[82px] flex-col items-center gap-1.5 transition-all duration-200 active:scale-90 px-2 py-2.5 rounded-2xl group ${pathname === '/fortune' ? 'text-indigo-600 active:bg-indigo-100/50' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800/50 active:bg-slate-100 dark:active:bg-slate-800'}`}
        >
          {pathname === '/fortune' && (
            <div className="absolute inset-0 bg-indigo-50 dark:bg-indigo-500/15 rounded-2xl -z-10 animate-in fade-in zoom-in-95 duration-500" />
          )}
          {pathname === '/fortune' ? (
            <SparklesIconSolid className="w-6 h-6 transition-transform" />
          ) : (
            <SparklesIcon className="w-6 h-6 transition-transform group-hover:scale-110" />
          )}
          <span className="text-[10px] font-black uppercase tracking-widest">{isKo ? '사주' : 'Saju'}</span>
        </button>

        <button
          onClick={() => router.push('/tarot')}
          className={`relative flex min-w-[82px] flex-col items-center gap-1.5 transition-all duration-200 active:scale-90 px-2 py-2.5 rounded-2xl group ${pathname === '/tarot' ? 'text-indigo-600 active:bg-indigo-100/50' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800/50 active:bg-slate-100 dark:active:bg-slate-800'}`}
        >
          {pathname === '/tarot' && (
            <div className="absolute inset-0 bg-indigo-50 dark:bg-indigo-500/15 rounded-2xl -z-10 animate-in fade-in zoom-in-95 duration-500" />
          )}
          {pathname === '/tarot' ? (
            <IdentificationIconSolid className="w-6 h-6 transition-transform" />
          ) : (
            <IdentificationIcon className="w-6 h-6 transition-transform group-hover:scale-110" />
          )}
          <span className="text-[10px] font-black uppercase tracking-widest">{isKo ? '타로' : 'Tarot'}</span>
        </button>

        <button
          onClick={() => {
            if (!user) {
              openLoginModal();
            } else {
              router.push('/mypage');
            }
          }}
          className={`relative flex min-w-[82px] flex-col items-center gap-1.5 transition-all duration-200 active:scale-90 px-2 py-2.5 rounded-2xl group ${pathname === '/mypage' ? 'text-indigo-600 active:bg-indigo-100/50' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800/50 active:bg-slate-100 dark:active:bg-slate-800'}`}
        >
          {pathname === '/mypage' && (
            <div className="absolute inset-0 bg-indigo-50 dark:bg-indigo-500/15 rounded-2xl -z-10 animate-in fade-in zoom-in-95 duration-500" />
          )}
          <div className="relative">
            {pathname === '/mypage' ? (
              <UserCircleIconSolid className="w-6 h-6 transition-transform" />
            ) : (
              <UserCircleIcon className="w-6 h-6 transition-transform group-hover:scale-110" />
            )}
            {user && selectedProfile && (
              <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-sky-500 rounded-full border-2 border-white dark:border-slate-900" />
            )}
          </div>
          <span className="text-[10px] font-black max-w-[4rem] truncate uppercase tracking-widest">
            {user && selectedProfile
              ? selectedProfile.displayName
              : (user ? (isKo ? '내 정보' : 'Profile') : (isKo ? '마이 페이지' : 'My Page'))
            }
          </span>
        </button>
      </div>
    </nav>
  );
}
