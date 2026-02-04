'use client';

import { useState, useEffect } from 'react';
import { useAuthContext } from '@/contexts/useAuthContext';
import { useLanguage } from '@/contexts/useLanguageContext';
import { useUsageLimit } from '@/contexts/useUsageLimit';

import MainIcons from '@/components/menuicons/MainIcons';
import SubIcons from '@/components/menuicons/SubIcons';
import SelIcons from '@/components/menuicons/SelIcons';
import SazaTalkBanner from '@/components/banner/SazaTalkBanner';
import NewYearBanner from '@/components/banner/NewYearBanner';
import MyInfoBar from '@/components/MyInfoBar';
import ImageBanner from '@/components/banner/ImageBanner';
import BasicAnaBanner from '@/components/banner/BasicAnaBanner';
import IconWrapper from '@/components/menuicons/IconWrapper';
import SazaTalkInputBanner from '@/components/banner/SazatalkInputBanner';


export default function HomeClient() {
  const { user, userData } = useAuthContext();
  const { language } = useLanguage();
  const { setEditCount } = useUsageLimit();

  // Client-side Title Update for Localization (Static Export Support)
  useEffect(() => {
    if (language === 'ko') {
      document.title = '사자사주 (SAZA SAJU) |  사주 & 타로 분석';
    } else {
      document.title = 'SAZA SAJU | AI Saju & Tarot Analysis';
    }
  }, [language]);

  const [isTimeUnknown, setIsTimeUnknown] = useState(false);
  const [gender, setGender] = useState('female');
  const [isSaved, setIsSaved] = useState(false);

  const [inputDate, setInputDate] = useState(() => {
    try {
      const now = new Date();
      const offset = now.getTimezoneOffset() * 60000;
      return new Date(now.getTime() - offset).toISOString().slice(0, 16);
    } catch (e) {
      return '2024-01-01T00:00';
    }
  });

  // Data Sync Effect
  useEffect(() => {
    if (user && userData) {
      if (userData.birthDate) {
        setInputDate(userData.birthDate);
        setIsSaved(true);
      } else {
        setIsSaved(false);
      }

      if (userData.gender) setGender(userData.gender);
      if (userData.isTimeUnknown !== undefined) setIsTimeUnknown(userData.isTimeUnknown);

      setEditCount(userData.editCount || 0);
    } else if (!user) {
      setIsSaved(false);
      setEditCount(0);
    }
  }, [user, userData, setEditCount]);

  return (
    <div className="pb-12 px-3">
      {/* MyInfo Bar - Conditional Render */}
      {!!user && (
        <div className="w-full max-w-lg bg-white/70 dark:bg-slate-800/60 rounded-lg border border-indigo-50 dark:border-indigo-500/30 shadow-sm backdrop-blur-md mx-auto mb-2 p-2 px-4 dark:text-white flex items-center justify-between">
          {userData?.birthDate ? (
            <MyInfoBar />
          ) : (
            <span className="text-xs text-slate-400 mx-auto">
              {language === 'ko' ? '데이터가 없습니다.' : 'No Data'}
            </span>
          )}
        </div>
      )}

      {/* Banners */}
      <ImageBanner />
      <SazaTalkInputBanner />
      <NewYearBanner />

      <BasicAnaBanner inputDate={inputDate} isTimeUnknown={isTimeUnknown} gender={gender} />

      <IconWrapper
        title={
          <>
            {language === 'ko'
              ? '당신의 명식으로 풀어낸 맞춤 운세'
              : 'Personalized Korean Saju report'}
          </>
        }
        subTitle={
          <>
            {language === 'ko'
              ? '타고난 기운을 분석한 1:1 정밀 리포트'
              : 'Report based on my innate energy '}
          </>
        }
      >
        <MainIcons />
      </IconWrapper>

      {/* New Selection Icons Section */}
      <IconWrapper
        title={
          <>
            {language === 'ko' ? '중요한 날을 위한 분석' : 'Analysis for Important Days'}
          </>
        }
        subTitle={
          <>
            {language === 'ko'
              ? '면접, 만남, 출산... 그 날의 기운을 미리 확인하세요'
              : 'Interview, Date, Birth... Check the energy of the day in advance'}
          </>
        }
      >
        <SelIcons />
      </IconWrapper>

      <IconWrapper
        title={<>{language === 'ko' ? '감성 운세' : 'Emotional Fortune'}</>}
        subTitle={
          <>
            {language === 'ko'
              ? '내 마음의 소리에 귀 기울이는 시간'
              : 'Time to listen to my inner sound'}
          </>
        }
      >
        <SubIcons />
      </IconWrapper>
    </div>
  );
}
