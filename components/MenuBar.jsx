'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  HomeIcon,
  SparklesIcon,
  CircleStackIcon,
  UserCircleIcon,
  XMarkIcon,
  ChevronRightIcon,
  CalendarDaysIcon,
  UserPlusIcon,
  CreditCardIcon,
  PresentationChartLineIcon,
  IdentificationIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';

import { useAuthContext } from '@/contexts/useAuthContext';
import { RiAdminFill } from 'react-icons/ri';
import { GiYinYang } from 'react-icons/gi';
import { SiGoogle, SiKakaotalk, SiNaver } from "react-icons/si";
import { useLanguage } from '@/contexts/useLanguageContext';
import { db } from '@/lib/firebase';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { getRomanizedIlju } from '@/data/sajuInt';

export default function MenuBar() {
  const [activeMenu, setActiveMenu] = useState(null);
  const { user, userData, iljuImagePath, openLoginModal, selectedProfile } = useAuthContext();
  const router = useRouter();
  const { language } = useLanguage();

  const isKo = language === 'ko';
  
  useEffect(() => {
    if (activeMenu) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [activeMenu]);

  const formatBirth = (dateStr) => {
    if (!dateStr || typeof dateStr !== 'string') return isKo ? '정보 없음' : 'No Info';
    try {
      const [datePart, timePart] = dateStr.split('T');
      const [year, month, day] = datePart.split('-');
      const [hour, minute] = (timePart || '00:00').split(':');
      return isKo
        ? `${year}년 ${month}월 ${day}일 </br>${hour}:${minute}`
        : `${month}/${day}/${year} </br>${hour}:${minute}`;
    } catch (e) {
      return isKo ? '형식 오류' : 'Format Error';
    }
  };

  const handleItemClick = async (item) => {
    if (!item.path) {
      try {
        await addDoc(collection(db, 'menu_click_logs'), {
          menuName: item.name,
          uid: user?.uid || 'guest',
          isLoggedIn: !!user,
          timestamp: serverTimestamp(),
          language: language
        });
      } catch (e) {
        console.error('Logging click error:', e);
      }

      alert(isKo ? '준비중입니다.' : 'Coming soon!');
      return;
    }
    router.push(item.path);
    setActiveMenu(null);
  };

  const menuData = useMemo(() => {
    const profileItems = [];

    if (['admin', 'super_admin'].includes(userData?.role)) {
      profileItems.push({
        name: isKo ? '관리자 페이지' : 'Admin Page',
        desc: isKo ? '시스템 제어 및 통계' : 'System Control & Stats',
        icon: <RiAdminFill className="w-6 h-6 text-rose-500" />,
        path: '/admin',
      });
    }
    if (['super_admin'].includes(userData?.role)) {
      profileItems.push({
        name: isKo ? '프롬프트 수정' : 'Edit Prompt',
        desc: isKo ? '사주 프롬프트 수정' : 'Edit prompt for saju',
        icon: <RiAdminFill className="w-6 h-6 text-rose-500" />,
        path: '/admin/editprompt',
      });
    }
    if (userData?.role === 'saju_consultant') {
      profileItems.push({
        name: isKo ? '명리학자 대시보드' : 'Consultant Dashboard',
        desc: isKo ? '상담 요청 관리' : 'Manage Consultations',
        icon: <GiYinYang className="w-6 h-6 text-indigo-500" />,
        path: '/consultant/dashboard',
      });
    }

    if (user) {
      profileItems.push(
        {
          name: isKo ? '프로필 수정' : 'Edit Profile',
          desc: isKo ? '이름, 생년월일 정보 변경' : 'Change Name, Birthdate',
          icon: <UserCircleIcon className="w-6 h-6" />,
          path: '/profile/edit',
        },
        {
          name: isKo ? '생일 관리' : 'Birthday Management',
          desc: isKo ? '생년월일 목록 관리' : 'Manage Birthday List',
          icon: <UserCircleIcon className="w-6 h-6" />,
          path: '/profile/manage',
        },
        {
          name: isKo ? '상담 내역' : 'History',
          desc: isKo ? '내가 본 운세 기록 확인' : 'Check Fortune Records',
          icon: <PresentationChartLineIcon className="w-6 h-6" />,
          path: null,
        },
      );
    }

    return {
      fortune: {
        title: isKo ? '운세보기' : 'Fortunes',
        color: 'text-amber-500',
        sections: [
          {
            subtitle: isKo ? '전통 사주' : 'Traditional Saju',
            items: [
              {
                name: isKo ? '기본 사주 분석' : 'Saju Analysis',
                desc: isKo ? '타고난 성격과 평생의 운명 흐름' : 'Your innate traits and destiny',
                icon: <IdentificationIcon className="w-6 h-6" />,
                path: '/saju/basic',
              },
              {
                name: isKo ? '오늘의 운세' : 'Luck of the day',
                desc: isKo ? '오늘 하루 나의 기운 확인' : 'Daily Energy Check',
                icon: <CalendarDaysIcon className="w-6 h-6" />,
                path: '/saju/todaysluck',
              },
              {
                name: isKo ? '신년 운세' : '2026 Fortune',
                desc: isKo ? '병오년 한 해의 흐름' : 'Flow of the Year',
                icon: <SparklesIcon className="w-6 h-6" />,
                path: '/saju/2026luck',
              },
              {
                name: isKo ? '궁합 보기' : 'Chemistry',
                desc: isKo ? '상대방과의 에너지 조화' : 'Match with Others',
                icon: <UserPlusIcon className="w-6 h-6" />,
                path: '/saju/match',
              },
              {
                name: isKo ? '재물운 분석' : 'Wealth Luck',
                desc: isKo ? '타고난 재복과 부의 흐름' : 'Your innate wealth and financial flow',
                icon: <CircleStackIcon className="w-6 h-6" />,
                path: '/saju/wealth',
              },
              {
                name: isKo ? '사자와의 대화' : 'Chat with SAZA',
                desc: isKo
                  ? '무엇이든 물어보세요, 사자가 답해드립니다'
                  : 'Ask anything, SAZA will answer your questions',
                icon: <ChatBubbleLeftRightIcon className="w-6 h-6" />,
                path: '/saju/sazatalk',
              },
            ],
          },
          {
            subtitle: isKo ? '이벤트' : 'event',
            items: [
              {
                name: isKo ? '인터뷰' : 'Interview Luck',
                desc: isKo
                  ? '떨리는 면접날. 잘 될까?'
                  : 'Important interview today? Check your success rate.',
                icon: <IdentificationIcon className="w-6 h-6" />,
                path: '/saju/interview',
              },
              {
                name: isKo ? '데이트' : 'Date Luck',
                desc: isKo
                  ? '중요한 그날의 데이트, 과연 어떨까'
                  : 'Will your date go well? See your romantic energy.',
                icon: <CalendarDaysIcon className="w-6 h-6" />,
                path: '/saju/date',
              },
              {
                name: isKo ? '길일 선정' : 'Select Day',
                desc: isKo
                  ? '이사, 결혼, 계약 등 중요한 날을 위한 길일 선택'
                  : 'Find the most auspicious days for your important events.',
                icon: <CalendarDaysIcon className="w-6 h-6" />,
                path: '/saju/seldate',
              },  {
                name: isKo ? '출산 택일' : 'Childbirth Selection',
                desc: isKo
                  ? '아이와 부모의 기운에 맞는 조화로운 출산 택일'
                  : 'Find the most auspicious birth dates for your child.',
                icon: <CalendarDaysIcon className="w-6 h-6" />,
                path: '/saju/selbirth',
              },
            ],
          },
          {
            subtitle: isKo ? '신비로운 타로' : 'Mystical Tarot',
            items: [
              {
                name: isKo ? '타로 오늘의 운세' : 'Tarot Luck of the day',
                desc: isKo ? '카드로 보는 오늘 하루' : 'Daily Tarot Reading',
                icon: <CalendarDaysIcon className="w-6 h-6" />,
                path: '/tarot/tarotdaily',
              },
              {
                name: isKo ? '타로 연애운' : 'Tarot Love Fortune',
                desc: isKo ? '사랑과 설렘의 향방' : 'Direction of Love',
                icon: <SparklesIcon className="w-6 h-6" />,
                path: '/tarot/tarotlove',
              },
              {
                name: isKo ? '타로 금전운' : 'Tarot Wealth Luck',
                desc: isKo ? '나의 재물과 풍요의 흐름' : 'Flow of Wealth',
                icon: <CircleStackIcon className="w-6 h-6" />,
                path: '/tarot/tarotmoney',
              },
              {
                name: isKo ? '타로 고민상담' : 'Tarot Counseling',
                desc: isKo ? '해답이 필요한 순간의 조언' : 'Advice for Difficult Moments',
                icon: <PresentationChartLineIcon className="w-6 h-6" />,
                path: '/tarot/tarotcounseling',
              },
            ],
          },
        ],
      },
      credits: {
        title: isKo ? '크레딧 받기' : 'Get Credits',
        color: 'text-emerald-500',
        items: [
          {
            name: isKo ? '포춘쿠키' : 'Fortune Cookie',
            desc: isKo ? '하루 1~5개의 무료 크레딧' : 'Free Daily Credits',
            icon: <CircleStackIcon className="w-6 h-6" />,
            path: '/fortunecookie',
          },
          {
            name: isKo ? '크레딧 상점' : 'Credit Shop',
            desc: isKo ? '준비 중입니다' : 'Coming Soon',
            icon: <CreditCardIcon className="w-6 h-6" />,
            path: null,
          },
        ],
      },
      profile: {
        title: user ? (isKo ? '내 정보 관리' : 'Account') : (isKo ? '마이 페이지' : 'My Page'),
        color: 'text-indigo-500',
        items: profileItems,
      },
    };
  }, [userData, language, isKo, user]);

  const MenuItem = ({ item, color }) => (
    <button
      onClick={() => handleItemClick(item)}
      className="w-full flex items-center justify-between p-3.5 rounded-2xl border border-slate-50 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 active:scale-[0.97] transition-all"
    >
      <div className="flex items-center gap-3.5 text-left">
        <div className={`p-2.5 rounded-xl bg-white dark:bg-slate-800 shadow-sm ${color}`}>
          {React.cloneElement(item.icon, { className: 'w-5 h-5' })}
        </div>
        <div>
          <p className="font-bold text-[14px] text-slate-900 dark:text-white leading-tight">
            {item.name}
          </p>
          <p className="text-[10px] text-slate-400 font-medium mt-0.5">{item.desc}</p>
        </div>
      </div>
      {item.path ? (
        <ChevronRightIcon className="w-4 h-4 text-slate-300" />
      ) : (
        <span className="text-[9px] font-bold text-slate-300 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-md">
          {isKo ? '준비 중' : 'Soon'}
        </span>
      )}
    </button>
  );

  return (
    <>
      <div
        className={`fixed inset-0 z-[60] bg-white dark:bg-slate-950 transition-transform duration-500 ease-in-out ${activeMenu ? 'translate-y-0' : 'translate-y-full'}`}
      >
        {activeMenu &&
          menuData[activeMenu] && (
            <div className="flex flex-col h-full p-6 pb-32 overflow-y-auto">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-black tracking-tighter dark:text-white uppercase">
                  {menuData[activeMenu].title}
                </h2>
                <button
                  onClick={() => setActiveMenu(null)}
                  className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full active:scale-90"
                >
                  <XMarkIcon className="w-6 h-6 dark:text-white" />
                </button>
              </div>

              {activeMenu === 'profile' && (
                <div className="mb-8">
                  {user ? (
                    <>
                      {/* [Sub Display] Logged-in User Info (If checking friend's profile) */}
                      {selectedProfile && selectedProfile.uid !== userData?.uid && (
                        <div 
                          className="mb-4 flex items-center gap-3 p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                          onClick={() => selectProfile(null)} // Click to switch back to self
                        >
                          <div className="relative w-10 h-10 rounded-full overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100">
                             {(() => {
                                // Calculate User's calculate Ilju Image manually
                                const mySaju = userData?.saju;
                                const myGender = userData?.gender || 'female';
                                let myImg = '/images/ilju/default.png';
                                if (mySaju) {
                                  // getRomanizedIlju is needed, but assuming simple mapping or default if not available
                                  // For now, simpler approach: if selectedProfile is friend, iljuImagePath is friend's.
                                  // So we need to recalculate or store user's path.
                                  // Since we can't easily import helper here without verify, let's use a simple fallback or just user icon.
                                  // Actually, let's try to trust the context or just show initials/icon if image fails.
                                  // Better: use a default avatar if calculation is complex, but user wants image.
                                  // Let's rely on standard path format if possible: /images/ilju/[ilju]_[gender].png
                                  
                                  const iljuCode = mySaju.sky1 && mySaju.grd1 ? getRomanizedIlju(mySaju.sky1 + mySaju.grd1) : 'gapja';
                                  myImg = `/images/ilju/${iljuCode}_${myGender}.png`;
                                }
                                return <Image src={myImg} alt="Me" fill className="object-cover" />;
                             })()}
                          </div>
                          <div className="flex-1">
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Logged in as</p>
                            <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{userData?.displayName}</p>
                          </div>
                          <div className="text-xs font-bold text-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 px-2 py-1 rounded-lg">
                            {isKo ? '내 정보로 복귀' : 'Switch to Me'}
                          </div>
                        </div>
                      )}

                      {/* [Main Display] Selected Profile Info (Friend or Self) */}
                      <div className={`relative overflow-hidden p-6 rounded-[2rem] bg-white dark:bg-[#1a1a2e] text-slate-800 dark:text-white shadow-xl border border-slate-100 dark:border-white/5 group transition-colors ${selectedProfile && selectedProfile.uid !== userData?.uid ? 'ring-2 ring-indigo-500 ring-offset-2 dark:ring-offset-slate-950' : ''}`}>
                        {selectedProfile && selectedProfile.uid !== userData?.uid && (
                           <div className="absolute top-0 right-0 bg-indigo-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl shadow-md z-20">
                             {isKo ? '친구 프로필 보는 중' : 'Viewing Friend Profile'}
                           </div>
                        )}

                        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-purple-50 dark:bg-purple-600/10 rounded-full blur-[60px]" />

                        <div className="relative z-10">
                          <div className="flex items-center gap-6">
                            {/* Character Image (Always reflects selectedProfile via iljuImagePath from context) */}
                            <div className="relative shrink-0 w-32 h-32 h-32">
                               <div className="absolute inset-0 bg-gradient-to-tr from-indigo-100 to-purple-100 dark:from-indigo-500/20 dark:to-purple-500/20 rounded-3xl rotate-6 group-hover:rotate-12 transition-transform duration-500" />
                               <div className="absolute inset-0 bg-white/60 dark:bg-white/5 backdrop-blur-md rounded-3xl border border-white dark:border-white/10 shadow-inner" />
                               <div className="relative w-full h-full p-2 hover:scale-110 transition-transform duration-500">
                                  <Image
                                    src={iljuImagePath}
                                    alt="ilju character"
                                    fill
                                    className="object-contain"
                                  />
                               </div>
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                              <div className="mb-3">
                                <p className="text-[10px] font-black text-indigo-500 dark:text-indigo-400 tracking-[0.2em] uppercase mb-1">
                                  {selectedProfile?.uid !== userData?.uid ? (isKo ? 'FRIEND INFO' : 'FRIEND INFO') : 'USER INFORMATION'}
                                </p>
                                <div className="flex items-center gap-2">
                                  <h2 className="text-2xl font-black truncate tracking-tight text-slate-900 dark:text-white">
                                    {selectedProfile?.displayName || userData?.displayName || 'User'}
                                  </h2>
                                  {/* Badges only for main user */}
                                  {selectedProfile?.uid === userData?.uid && (
                                    <>
                                      {userData?.provider?.includes('google') && <SiGoogle className="w-4 h-4 text-[#4285F4]" />}
                                      {userData?.provider?.includes('kakao') && <SiKakaotalk className="w-4 h-4 text-[#FEE500]" />}
                                      {userData?.provider?.includes('naver') && <SiNaver className="w-4 h-4 text-[#03C75A]" />}
                                    </>
                                  )}
                                </div>
                              </div>

                              <div className="space-y-2">
                                {/* Only show phone number if it exists (Main user usually has it, friends don't) */}
                                {(selectedProfile || userData)?.phoneNumber && (
                                  <div className="flex items-center gap-3 text-[13px]">
                                    <span className="text-slate-400 dark:text-white/40 font-bold w-12 text-[10px]">
                                      {isKo ? '연락처' : 'Contact'}
                                    </span>
                                    <span className="font-semibold text-slate-700 dark:text-white/90">
                                      {(selectedProfile || userData).phoneNumber}
                                    </span>
                                  </div>
                                )}
                                <div className="flex items-center gap-3 text-[13px]">
                                  <span className="text-slate-400 dark:text-white/40 font-bold w-12">
                                    {isKo ? '성별' : 'Gender'}
                                  </span>
                                  <span className="font-semibold text-slate-700 dark:text-white/90">
                                    {(selectedProfile || userData)?.gender === 'male'
                                      ? isKo ? '남성' : 'Male'
                                      : isKo ? '여성' : 'Female'}
                                  </span>
                                </div>

                                <div className="w-full h-[1px] bg-slate-100 dark:bg-white/10" />

                                <div className="flex items-center gap-3 text-[13px]">
                                  <span className="text-slate-400 dark:text-white/40 font-bold w-12">
                                    {isKo ? '생일' : 'Birth'}
                                  </span>
                                  <span className="font-semibold text-slate-700 dark:text-white/90">
                                    {(selectedProfile || userData)?.isTimeUnknown ? (
                                      formatBirth((selectedProfile || userData)?.birthDate).slice(0, -10)
                                    ) : (
                                      <div
                                        dangerouslySetInnerHTML={{
                                          __html: formatBirth(
                                              (selectedProfile || userData)?.birthTime 
                                                ? `${(selectedProfile || userData)?.birthDate}T${(selectedProfile || userData)?.birthTime}`
                                                : (selectedProfile || userData)?.birthDate
                                          ),
                                        }}
                                      />
                                    )}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="relative overflow-hidden p-8 rounded-2xl bg-slate-50/50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 flex flex-col items-center text-center transition-all">
                      <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex items-center justify-center mb-5">
                        <SparklesIcon className="w-8 h-8 text-indigo-500" />
                      </div>
                      
                      <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-2">
                        {isKo ? '당신의 운명을 그려보세요' : 'Discover Your Destiny'}
                      </h2>
                      
                      <p className="text-[13px] text-slate-400 dark:text-slate-500 mb-6 leading-relaxed break-keep">
                        {isKo 
                          ? '로그인 한 번으로 정밀한 사주 분석과 매일 새로운 운세를 경험하세요.' 
                          : 'Sign in to unlock personalized Saju insights and daily updates.'}
                      </p>
                      
                      <button
                        onClick={() => {
                          openLoginModal();
                          setActiveMenu(null);
                        }}
                        className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-[14px] transition-all active:scale-95 shadow-lg shadow-indigo-500/20"
                      >
                        {isKo ? '로그인 / 시작하기' : 'Get Started Now'}
                      </button>
                    </div>
                  )}
                </div>
              )}

              <div className="space-y-3">
                {activeMenu === 'fortune'
                  ? menuData.fortune.sections.map((section, sIdx) => (
                      <div key={sIdx} className="space-y-3">
                        <div className="flex items-center gap-2 px-2">
                          <div className="w-1 h-3 bg-indigo-500 rounded-full"></div>
                          <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-widest">
                            {section.subtitle}
                          </h3>
                        </div>
                        <div className="grid grid-cols-1 gap-2">
                          {section.items.map((item, idx) => (
                            <MenuItem key={idx} item={item} color={menuData.fortune.color} />
                          ))}
                        </div>
                      </div>
                    ))
                  : menuData[activeMenu]?.items?.map(
                      (item, idx) => <MenuItem key={idx} item={item} color={menuData[activeMenu].color} />,
                    )}
              </div>
            </div>
          )}
      </div>

      <nav className="fixed bottom-0 left-0 right-0 z-[70] px-6 pb-8 pt-4 bg-white/90 dark:bg-slate-900/95 backdrop-blur-xl border-t border-slate-100 dark:border-slate-800">
        <div className="max-w-md mx-auto flex justify-between items-center">
          <button
            onClick={() => {
              setActiveMenu(null);
              router.push('/');
            }}
            className={`flex flex-col items-center gap-1 ${!activeMenu ? 'text-indigo-600' : 'text-slate-400'}`}
          >
            <HomeIcon className="w-6 h-6" />
            <span className="text-[10px] font-black">{isKo ? '홈' : 'Home'}</span>
          </button>
          <button
            onClick={() => setActiveMenu('fortune')}
            className={`flex flex-col items-center gap-1 ${activeMenu === 'fortune' ? 'text-indigo-600' : 'text-slate-400'}`}
          >
            <SparklesIcon className="w-6 h-6" />
            <span className="text-[10px] font-black">{isKo ? '운세보기' : 'Fortune'}</span>
          </button>
          <button
            onClick={() => setActiveMenu('credits')}
            className={`flex flex-col items-center gap-1 ${activeMenu === 'credits' ? 'text-indigo-600' : 'text-slate-400'}`}
          >
            <CircleStackIcon className="w-6 h-6" />
            <span className="text-[10px] font-black">{isKo ? '크레딧' : 'Credits'}</span>
          </button>
          <button
            onClick={() => setActiveMenu('profile')}
            className={`flex flex-col items-center gap-1 ${activeMenu === 'profile' ? 'text-indigo-600' : 'text-slate-400'}`}
          >

            
            <div className="relative">
              <UserCircleIcon className="w-6 h-6" />
              {user && selectedProfile && (
                <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-sky-500 rounded-full border-2 border-white dark:border-slate-900" />
              )}
            </div>
            <span className="text-[10px] font-black max-w-[4rem] truncate">
              {user && selectedProfile 
                ? selectedProfile.displayName 
                : (user ? (isKo ? '내 정보' : 'Profile') : (isKo ? '마이 페이지' : 'My Page'))
              }
            </span>
          </button>
        </div>
      </nav>
    </>
  );
}
