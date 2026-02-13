'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

import {
  Bars3Icon,
  InformationCircleIcon,
  HomeIcon,
  SparklesIcon,
  ArrowRightOnRectangleIcon,
  ArrowLeftOnRectangleIcon,
  BoltIcon,
  ClockIcon,
  GlobeAltIcon,
  ArrowLeftIcon,
} from '@heroicons/react/24/outline';
import Credit from '@/components/Credit';

import { useLanguage } from '@/contexts/useLanguageContext';
import { useAuthContext } from '@/contexts/useAuthContext';
import { useUsageLimit } from '@/contexts/useUsageLimit';
import { useAnalysisMode } from '@/contexts/AnalysisModeContext';
import NotificationList from '@/components/NotificationList';
import AppBanner from '@/components/AppBanner';

const MAIN_MENUS = [
  { id: 'home', ko: '홈', en: 'Home', path: '/', icon: HomeIcon },
  { id: 'fortune', ko: '자주묻는 질문', en: 'FAQ', path: '/tutorial', icon: SparklesIcon },
];

const UTILITY_ITEMS = [
  {
    id: 'help',
    icon: InformationCircleIcon,
    ko: '도움말 / 문의',
    en: 'Help / Contact',
    action: 'SHOW_CONTACT_MODAL',
  },
];

export default function NavBar() {
  const { language, setLanguage } = useLanguage();
  const { user, logout, userData, isCookieDone, openLoginModal, openContactModal } = useAuthContext();
  const { analysisMode, setAnalysisMode } = useAnalysisMode();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  // useUsageLimit hook handles defaults internally
  const { editCount, MAX_EDIT_COUNT } = useUsageLimit();

  const router = useRouter();
  const pathname = usePathname();

  const menuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleMainNavigate = (path) => {
    router.push(path);
    setIsMenuOpen(false);
  };

  const handleUtilityClick = (item) => {
    if (item.action === 'SHOW_CONTACT_MODAL' && openContactModal) {
      openContactModal();
    }
    setIsMenuOpen(false);
  };

  const handleAuthAction = () => {
    if (user) {
      if (window.confirm(language === 'ko' ? '로그아웃 하시겠습니까?' : 'Do you want to logout?')) {
        logout();
      }
    } else {
      openLoginModal();
    }
    setIsMenuOpen(false);
  };


  // Hydration fix for client-side only rendering of sensitive parts if needed, 
  // but for Navbar, most parts should be fine. 
  // We use standard Next.js Image for logos.

  const logoSrc = false
    ? (language === 'ko' ? '/assets/Logo_Kor_DarkMode.png' : '/assets/Logo_Eng_DarkMode.png')
    : (language === 'ko' ? '/assets/Logo_Kor.png' : '/assets/Logo_Eng.png');

  return (

    <div className='w-full fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md transition-all border-b border-transparent data-[scrolled=true]:border-slate-100 select-none'>
      <div style={{ paddingTop: 'env(safe-area-inset-top)' }} />
      <div className="flex w-full items-center pt-5 pb-2 px-3 justify-between py-3 max-w-xl m-auto ">

        {/* [Left] Logo or Back Button */}
        <div
          className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
          onClick={() => pathname === '/' ? router.push('/') : router.back()}
        >
          {pathname === '/' ? (
            <div className="relative h-[40px] w-[120px]">
              <Image
                src={logoSrc}
                alt="Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
          ) : (
            <div className="flex items-center gap-1 pl-1 py-1">
              <ArrowLeftIcon className="w-5 h-5 text-slate-800 dark:text-white stroke-2" />
              <span className="text-sn font-bold text-slate-800 dark:text-white">{language === 'ko' ? '뒤로' : 'Back'}</span>
            </div>
          )}
        </div>



        {/* [Right] Utility Buttons */}

        <div className="flex items-center gap-1">
          {/* Credit & Fortune Cookie Mini Bar */}
          <Credit />

          {/* Notification List */}
          <NotificationList />

          {/* Hamburger Menu */}
          <div className="relative ml-1" ref={menuRef}>
            <button
              onClick={() => toggleMenu()}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors text-gray-700 dark:text-gray-300"
            >
              <Bars3Icon className="w-6 h-6" />
            </button>

            {isMenuOpen && (
              <div className="absolute right-0 mt-3 w-64 origin-top-right bg-white dark:bg-slate-800 rounded-2xl shadow-xl ring-1 ring-black ring-opacity-5 z-50 overflow-hidden border border-gray-100 dark:border-gray-700 animate-in fade-in zoom-in-95 duration-200">
                <div className="p-2 space-y-1">
                  {/* Menu List */}
                  <p className="px-3 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
                    Menu
                  </p>
                  {MAIN_MENUS.map((menu) => (
                    <div
                      key={menu.id}
                      onClick={() => handleMainNavigate(menu.path)}
                      className={`flex items-center p-3 cursor-pointer rounded-xl transition-colors ${pathname === menu.path ? 'bg-indigo-50 text-indigo-600 font-bold' : 'text-gray-700 dark:text-gray-200 hover:bg-gray-50'}`}
                    >
                      <menu.icon className="w-5 h-5 mr-3" />
                      <span>{language === 'ko' ? menu.ko : menu.en}</span>
                    </div>
                  ))}

                  <div className="h-px bg-gray-100 dark:bg-gray-700 my-2 mx-2" />

                  {/* Settings Section */}
                  <p className="px-3 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
                    Settings
                  </p>

                  {/* Language Toggle */}
                  <div
                    onClick={() => setLanguage(language === 'ko' ? 'en' : 'ko')}
                    className="flex items-center p-3 cursor-pointer rounded-xl hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors text-gray-700 dark:text-gray-200"
                  >
                    <GlobeAltIcon className="w-5 h-5 mr-3 text-indigo-500" />
                    <div className="flex-1 font-medium">
                      {language === 'ko' ? '언어 변경' : 'Language'}
                    </div>
                    <div className="flex gap-1 text-xs font-black">
                      <span className={language === 'ko' ? 'text-indigo-600' : 'text-gray-400'}>
                        KO
                      </span>
                      <span className="text-gray-300">/</span>
                      <span className={language !== 'ko' ? 'text-indigo-600' : 'text-gray-400'}>
                        EN
                      </span>
                    </div>
                  </div>

                  {/* Analysis Mode Toggle */}
                  <div className="p-2">
                    <div className="flex bg-gray-100 dark:bg-slate-900 rounded-xl p-1 gap-1 border border-gray-200 dark:border-slate-800">
                      <button
                        onClick={() => setAnalysisMode('direct')}
                        className={`flex-1 flex flex-col items-center justify-center py-2 px-1 rounded-lg transition-all ${analysisMode === 'direct' ? 'bg-white dark:bg-slate-700 shadow-sm text-indigo-600' : 'text-gray-400 hover:text-gray-600'}`}
                      >
                        <BoltIcon className={`w-4 h-4 mb-0.5 ${analysisMode === 'direct' ? 'text-indigo-500' : ''}`} />
                        <span className="text-xs font-black tracking-tighter">DIRECT</span>
                        <span className="text-xs opacity-60 leading-tight">{language === 'ko' ? '빠른 결과' : 'Fast Result'}</span>
                      </button>
                      <button
                        onClick={() => setAnalysisMode('background')}
                        className={`flex-1 flex flex-col items-center justify-center py-2 px-1 rounded-lg transition-all ${analysisMode === 'background' ? 'bg-white dark:bg-slate-700 shadow-sm text-indigo-600' : 'text-gray-400 hover:text-gray-600'}`}
                      >
                        <ClockIcon className={`w-4 h-4 mb-0.5 ${analysisMode === 'background' ? 'text-indigo-500' : ''}`} />
                        <span className="text-xs font-black tracking-tighter">BACKEND</span>
                        <span className="text-xs opacity-60 leading-tight">{language === 'ko' ? '자동 저장' : 'Auto Save'}</span>
                      </button>
                    </div>
                  </div>

                  {UTILITY_ITEMS.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => handleUtilityClick(item)}
                      className="flex items-center p-3 cursor-pointer rounded-xl hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors text-gray-700 dark:text-gray-200"
                    >
                      <item.icon className="w-5 h-5 mr-3" />
                      <span className="font-medium">{language === 'ko' ? item.ko : item.en}</span>
                    </div>
                  ))}

                  <div className="h-px bg-gray-100 dark:bg-gray-700 my-2 mx-2" />

                  {/* Login / Logout */}
                  <div
                    onClick={() => handleAuthAction()}
                    className={`flex items-center p-3 cursor-pointer rounded-xl transition-colors ${user ? 'text-red-500 hover:bg-red-50' : 'text-indigo-600 hover:bg-indigo-50'}`}
                  >
                    {user ? (
                      <ArrowLeftOnRectangleIcon className="w-5 h-5 mr-3" />
                    ) : (
                      <ArrowRightOnRectangleIcon className="w-5 h-5 mr-3" />
                    )}
                    <span className="font-bold">
                      {user
                        ? language === 'ko'
                          ? '로그아웃'
                          : 'Logout'
                        : language === 'ko'
                          ? '로그인'
                          : 'Login'}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

    </div>

  );
}
