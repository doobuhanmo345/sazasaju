'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthContext } from '@/contexts/useAuthContext';
import { useLanguage } from '@/contexts/useLanguageContext';
import {
  SparklesIcon,
  ShieldCheckIcon,
  ChatBubbleLeftRightIcon,
  ChevronLeftIcon,
  CheckIcon,
} from '@heroicons/react/24/solid';
import { CakeIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useSajuCalculator } from '@/hooks/useSajuCalculator';
import { calculateSajuData } from '@/lib/sajuLogic';
import dayStem from '@/data/dayStem.json';
import FourPillarVis from '@/components/FourPillarVis';
import CityInput from '@/ui/CityInput';

export default function BeforeLoginPage() {
  const router = useRouter();
  const { user, userData, openLoginModal } = useAuthContext();
  const { language, setLanguage } = useLanguage();

  const [isSaving, setIsSaving] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [step, setStep] = useState(1);
  const [gender, setGender] = useState('');
  const birthInit = {
    year: '',
    month: '',
    day: '',
    hour: '',
    minute: '',
  };
  const [birthData, setBirthData] = useState(birthInit);
  const [timeUnknown, setTimeUnknown] = useState(false);
  const [birthCity, setBirthCity] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

  const [showIntro, setShowIntro] = useState(true);

  const pad = (n) => n?.toString().padStart(2, '0') || '00';

  const memoizedBirthDate = useMemo(() => {
    const { year, month, day, hour, minute } = birthData;
    if (!year || !month || !day) return null;
    const formatted = `${year}-${pad(month)}-${pad(day)}T${timeUnknown ? '12' : pad(hour)}:${timeUnknown ? '00' : pad(minute)}`;
    return new Date(formatted);
  }, [birthData, timeUnknown]);

  const { saju } = useSajuCalculator(memoizedBirthDate, timeUnknown);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowIntro(false);
    }, 4500);
    return () => clearTimeout(timer);
  }, []);

  const handleNextStep = () => {
    const { year, month, day, hour, minute } = birthData;
    const y = parseInt(year);
    const m = parseInt(month);
    const d = parseInt(day);
    const h = parseInt(hour);
    const min = parseInt(minute);

    if (!y || y < 1900 || y > 2030) {
      alert(language === 'ko' ? '연도를 1900~2030년 사이로 입력해주세요.' : 'Please enter a year between 1900-2030.');
      return;
    }
    if (!m || m < 1 || m > 12) {
      alert(language === 'ko' ? '월을 1~12월 사이로 입력해주세요.' : 'Please enter a month between 1-12.');
      return;
    }
    const lastDayOfMonth = new Date(y, m, 0).getDate();
    if (!d || d < 1 || d > lastDayOfMonth) {
      alert(language === 'ko' ? `${m}월은 ${lastDayOfMonth}일까지 있습니다. 다시 확인해주세요.` : `${month}/${m} only has ${lastDayOfMonth} days. Please check again.`);
      return;
    }
    if (!timeUnknown) {
      if (isNaN(h) || h < 0 || h > 23) {
        alert(language === 'ko' ? ' 시간을 0~23시 사이로 입력해주세요.' : 'Please enter hours between 0-23.');
        return;
      }
      if (isNaN(min) || min < 0 || min > 59) {
        alert(language === 'ko' ? '분을 0~59분 사이로 입력해주세요.' : 'Please enter minutes between 0-59.');
        return;
      }
    }
    setStep(3);
  };

  const handleEdit = () => {
    setBirthData(birthInit);
    setGender(null);
    setTimeUnknown(false);
    setStep(2);
  };

  const [tryLogin, setTryLogin] = useState(false);

  useEffect(() => {
    if (user && userData?.birthDate) {
      router.push('/');
    }
  }, [user, userData, router]);

  useEffect(() => {
    if (!tryLogin || !user) return;
    const checkUser = async () => {
      if (!userData) return;
      if (userData.birthDate) {
        router.push('/');
      } else {
        alert(language === 'ko' ? '사주 정보를 입력해주세요.' : 'Please enter info.');
        setStep(2);
        setTryLogin(false);
      }
    };
    checkUser();
  }, [user, userData, tryLogin, language, router]);

  useEffect(() => {
    const saveAndRedirect = async () => {
      if (user?.uid && step === 5) {
        try {
          setIsSaving(true);
          const userRef = doc(db, 'users', user.uid);
          const birthDate = `${birthData.year}-${pad(birthData.month)}-${pad(birthData.day)}T${timeUnknown ? '12' : pad(birthData.hour)}:${timeUnknown ? '00' : pad(birthData.minute)}`;

          await setDoc(
            userRef,
            {
              uid: user.uid,
              saju: saju,
              birthDate: birthDate,
              birthCity: birthCity,
              phoneNumber: phoneNumber,
              gender: gender,
              isTimeUnknown: timeUnknown,
              createdAt: userData?.createdAt || new Date(),
              updatedAt: new Date(),
              status: userData?.status || 'active',
              role: userData?.role || 'user',
              editCount: userData?.editCount || 0,
              lastLoginDate: new Date().toLocaleDateString('en-CA'),
              displayName: user.displayName || '',
              email: userData?.email || user.email || '',
              usageHistory: userData?.usageHistory || {
                ZLastDaily: null,
                ZNewYear: null,
                ZApiAnalysis: null,
                ZWealth: null,
                ZMatchAnalysis: null,
                ZCookie: null,
              },
              question_history: userData?.question_history || [],
            },
            { merge: true },
          );
          router.push('/');
        } catch (err) {
          console.error('저장 오류:', err);
        } finally {
          setIsSaving(false);
        }
      }
    };
    saveAndRedirect();
  }, [user, step, birthData, gender, timeUnknown, saju, userData, birthCity, router]);

  const sajuDataState = useMemo(() => {
    if (!birthData.year || !birthData.month || !birthData.day || !gender) {
      return null;
    }
    const dateStr = `${birthData.year}-${pad(birthData.month)}-${pad(birthData.day)}T${timeUnknown ? '12' : pad(birthData.hour)}:${timeUnknown ? '00' : pad(birthData.minute)}`;
    try {
      return calculateSajuData(dateStr, gender, timeUnknown, language);
    } catch (error) {
      console.error('사주 계산 중 오류:', error);
      return null;
    }
  }, [birthData, gender, timeUnknown, language]);

  const sajuTranslations = {
    elements: {
      wood: { ko: '나무 (Wood)', en: 'Wood (Growth)', color: '#22c55e', emoji: '🌳' },
      fire: { ko: '불 (Fire)', en: 'Fire (Passion)', color: '#ef4444', emoji: '🔥' },
      earth: { ko: '흙 (Earth)', en: 'Earth (Stability)', color: '#eab308', emoji: '🌍' },
      metal: { ko: '쇠 (Metal)', en: 'Metal (Logic)', color: '#94a3b8', emoji: '💎' },
      water: { ko: '물 (Water)', en: 'Water (Wisdom)', color: '#3b82f6', emoji: '🌊' },
    },
    shinsal: {
      Dohwa: { ko: '도화살', en: 'Irresistible Charm', desc_ko: '사람을 홀리는 치명적인 매력', desc_en: 'Magnetic charisma that naturally attracts others' },
      Yeokma: { ko: '역마살', en: 'Dynamic Wanderer', desc_ko: '세상을 누비는 활동적인 에너지', desc_en: 'Active energy for global movement and change' },
      Hwagae: { ko: '화개살', en: 'Artistic Soul', desc_ko: '깊은 고독 속에서 피어나는 예술성', desc_en: 'Deep artistic sensitivity and inner wisdom' },
      Baekho: { ko: '백호살', en: 'Power Authority', desc_ko: '압도적인 카리스마와 전문성', desc_en: 'Overwhelming professional charisma and drive' },
      Geuigo: { ko: '귀문관살', en: 'Sharp Intuition', desc_ko: '천재적인 영감과 날카로운 직관', desc_en: 'Genius-like inspiration and keen intuition' },
      Cheoneul: { ko: '천을귀인', en: 'Heavenly Patron', desc_ko: '하늘이 돕는 최고의 인복과 행운', desc_en: 'Divine protection and supreme luck from others' },
      Hongyeom: { ko: '홍염살', en: 'Sweet Seduction', desc_ko: '다정하고 매혹적인 붉은 에너지', desc_en: 'Sweet and seductive personal attraction' },
      Yangin: { ko: '양인살', en: 'Iron Will', desc_ko: '어떤 역경도 뚫고 나가는 강철 의지', desc_en: 'Steel-like determination to overcome any obstacle' },
    },
  };

  const skyToKey = {
    갑: 'wood', 을: 'wood', 병: 'fire', 정: 'fire', 무: 'earth', 기: 'earth', 경: 'metal', 신: 'metal', 임: 'water', 계: 'water',
  };

  const generatePreview = (data, lang) => {
    if (!data || !data.saju) return {};
    const isKo = lang === 'ko';

    const coreSky = data?.saju?.sky1;
    const coreKey = skyToKey[coreSky] || 'wood';
    const coreInfo = sajuTranslations.elements[coreKey];
    const coreText = isKo ? `당신은 ${coreInfo.ko}의 기질을 타고난 사람입니다.` : `You are naturally gifted with the spirit of ${coreInfo.en}.`;

    const maxOhaengKey = data.maxOhaeng?.[0] || 'wood';
    const maxValue = data.maxOhaeng?.[1] || 0;
    const maxInfo = sajuTranslations.elements[maxOhaengKey];
    const dominantText = isKo ? `${maxInfo.emoji}${maxInfo.ko} 에너지가 압도적입니다 (강도: ${maxValue}/8).` : `Your ${maxInfo.emoji}${maxInfo.en} energy is overwhelming (Intensity: ${maxValue}/8).`;

    const talentText = data?.myShinsal && data.myShinsal.length > 0
      ? data.myShinsal.map((s) => {
        const t = sajuTranslations.shinsal[s.name];
        if (t) return isKo ? `[${t.ko}: ${t.desc_ko}]` : `[${t.en}: ${t.desc_en}]`;
        return `[${s.name}: ${s.desc}]`;
      }).join(' ')
      : isKo ? '특별한 잠재력을 분석 중입니다.' : 'Analyzing your hidden potentials...';

    const dw = data.currentDaewoon;
    const daewoonText = dw ? (isKo ? `${dw.startAge}세부터 ${dw.endAge}세까지 인생의 큰 전환점이 시작됩니다.` : `A major turning point in your life begins from age ${dw.startAge} to ${dw.endAge}.`) : '';

    return { coreText, dominantText, talentText, daewoonText, coreColor: coreInfo.color, coreEmoji: coreInfo.emoji };
  };

  const preview = sajuDataState ? generatePreview(sajuDataState, language) : {};

  const getProgress = () => {
    let score = 0;
    if (gender) score += 20;
    if (birthData.year.length === 4) score += 20;
    if (birthData.month && parseInt(birthData.month) >= 1 && parseInt(birthData.month) <= 12) score += 20;
    if (birthData.day && parseInt(birthData.day) >= 1 && parseInt(birthData.day) <= 31) score += 20;
    if (timeUnknown) {
      score += 20;
    } else {
      if (birthData.hour.length >= 1) score += 10;
      if (birthData.minute.length >= 1) score += 10;
    }
    return score;
  };

  const isFormValid = getProgress() === 100;

  const handleLoginAndSave = async () => {
    setStep(5);
    setTryLogin(true);
    if (!user) {
      try {
        openLoginModal();
      } catch (e) {
        console.error(e);
        setStep(3);
        setTryLogin(false);
      }
    }
  };

  if (showIntro && step === 1) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-950 flex flex-col items-center justify-center p-10 text-center overflow-hidden">
        <div className="space-y-10">
          <p className="text-indigo-600 font-black text-sm tracking-[0.4em] animate-pulse">SAZA SAJU</p>
          <div className="space-y-6">
            <h2 className="text-3xl font-light text-slate-900 dark:text-white leading-snug tracking-tighter">
              <span className="block animate-in fade-in slide-in-from-bottom-4 duration-1000">
                {language === 'ko' ? '복잡한 절차 없이' : 'No complex steps,'}
              </span>
              <span className="block animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-300">
                {language === 'ko' ? '무료로 사주를 분석하는' : 'Get your free Saju analysis'}
              </span>
              <span className="block animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-500">
                {language === 'ko' ? <> <span className="text-indigo-600 font-bold">사자사주</span>에 오신 것을 환영해요. </> : <> Welcome to <span className="text-indigo-600 font-bold">Saza Saju</span>. </>}
              </span>
            </h2>
            <div className="animate-in fade-in duration-1000 delay-1000 fill-mode-both">
              <p className="text-slate-400 text-lg">
                {language === 'ko' ? <> 생일만 넣으면 <span className="text-indigo-600 font-bold italic underline">매일 3개씩</span> </> : <> Just enter your birthday for <span className="text-indigo-600 font-bold italic underline">3 free reports daily</span> </>}
              </p>
              <p className="text-slate-400 text-lg">
                {language === 'ko' ? '정밀한 분석 결과를 확인할 수 있어요.' : 'Discover your destiny with precision.'}
              </p>
            </div>
          </div>
          <div className="flex justify-center items-center gap-2 animate-in fade-in duration-1000 delay-1500 fill-mode-both">
            {[0, 1, 2].map((i) => (
              <div key={i} className="w-2 h-2 bg-indigo-200 dark:bg-indigo-800 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6">
      {step > 1 && !isAnalyzing && (
        <button
          onClick={handleBack}
          className="absolute left-5 top-6 z-20 p-2 rounded-full bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xl border border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 active:scale-90 transition-all"
        >
          <ChevronLeftIcon className="w-6 h-6" />
        </button>
      )}

      <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl p-8 space-y-6 border border-slate-100 dark:border-slate-800">
        <div className="flex justify-center gap-2 mb-2">
          {[1, 2, 3, 4, 5].map((s) => (
            <div key={s} className={`h-1.5 rounded-full transition-all duration-500 ${step >= s ? 'w-8 bg-indigo-500' : 'w-2 bg-slate-200 dark:bg-slate-700'}`} />
          ))}
        </div>

        {step === 1 && (
          <div className="space-y-6 animate-in fade-in">
            <h2 className="text-2xl font-black text-center dark:text-white">{language === 'ko' ? '언어를 선택해주세요' : 'Select Language'}</h2>
            <div className="grid grid-cols-2 gap-4">
              <button onClick={() => { setLanguage('ko'); setStep(2); }} className="p-4 rounded-2xl border-2 border-slate-100 dark:border-slate-800 font-bold dark:text-white hover:border-indigo-500 transition-all">한국어</button>
              <button onClick={() => { setLanguage('en'); setStep(2); }} className="p-4 rounded-2xl border-2 border-slate-100 dark:border-slate-800 font-bold dark:text-white hover:border-indigo-500 transition-all">English</button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
            <div className="text-center">
              <CakeIcon className="w-12 h-12 text-amber-500 mx-auto mb-2" />
              <h2 className="text-2xl font-black dark:text-white">{language === 'ko' ? '생년월일을 바탕으로 나의 오행을 분석합니다' : 'Analyzing your Five Elements...'}</h2>
            </div>

            <div className="space-y-4">
              <div className="flex gap-2">
                {['male', 'female'].map((g) => (
                  <button key={g} onClick={() => setGender(g)} className={`flex-1 p-4 rounded-xl border-2 font-bold transition-all duration-300 ${gender === g ? 'border-indigo-500 bg-indigo-50 text-indigo-600' : 'border-slate-100 dark:border-slate-800 dark:text-white'}`}>{g === 'male' ? (language === 'ko' ? '남성' : 'Male') : (language === 'ko' ? '여성' : 'Female')}</button>
                ))}
              </div>

              <div className={`grid transition-all duration-500 ease-in-out ${gender ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}><div className="overflow-hidden"><input type="number" placeholder={language === 'ko' ? '태어난 연도를 입력해주세요' : 'Birth year'} value={birthData.year} className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-xl dark:text-white border-2 border-transparent focus:border-indigo-500 outline-none font-bold text-center mt-1" onChange={(e) => setBirthData({ ...birthData, year: e.target.value.slice(0, 4) })} /></div></div>
              <div className={`grid transition-all duration-500 ease-in-out ${birthData.year.length === 4 ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}><div className="overflow-hidden"><input type="number" placeholder={language === 'ko' ? '태어난 월' : 'Birth month'} value={birthData.month} className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-xl dark:text-white border-2 border-transparent focus:border-indigo-500 outline-none font-bold text-center mt-1" onChange={(e) => setBirthData({ ...birthData, month: e.target.value.slice(0, 2) })} /></div></div>
              <div className={`grid transition-all duration-500 ease-in-out ${birthData.month.length >= 1 ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}><div className="overflow-hidden"><input type="number" placeholder={language === 'ko' ? '태어난 날' : 'Birth day'} value={birthData.day} className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-xl dark:text-white border-2 border-transparent focus:border-indigo-500 outline-none font-bold text-center mt-1" onChange={(e) => setBirthData({ ...birthData, day: e.target.value.slice(0, 2) })} /></div></div>
              <div className={`grid transition-all duration-500 ease-in-out ${birthData.day.length >= 1 ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}><div className="overflow-hidden space-y-4 pt-1">
                {!timeUnknown && (<div className="flex items-center gap-2 w-full">
                  <input type="number" placeholder="시" value={birthData.hour} className="flex-1 min-w-0 p-4 bg-slate-50 dark:bg-slate-800 rounded-xl dark:text-white border-2 border-transparent focus:border-indigo-500 outline-none font-bold text-center" onChange={(e) => setBirthData({ ...birthData, hour: e.target.value.slice(0, 2) })} />
                  <span className="font-bold dark:text-white text-xl px-1">:</span>
                  <input type="number" placeholder="분" value={birthData.minute} className="flex-1 min-w-0 p-4 bg-slate-50 dark:bg-slate-800 rounded-xl dark:text-white border-2 border-transparent focus:border-indigo-500 outline-none font-bold text-center" onChange={(e) => setBirthData({ ...birthData, minute: e.target.value.slice(0, 2) })} />
                </div>)}
                <label className="flex items-center gap-3 cursor-pointer w-fit group ml-1"><input type="checkbox" checked={timeUnknown} onChange={(e) => setTimeUnknown(e.target.checked)} className="w-5 h-5 accent-indigo-500" /><span className="text-sm font-bold text-slate-500 group-hover:text-indigo-500 transition-colors uppercase tracking-widest">{language === 'ko' ? '태어난 시간을 몰라요' : 'Unknown Time'}</span></label>
              </div></div>
            </div>

            <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner"><div className="h-full bg-indigo-500 transition-all duration-700 ease-out rounded-full shadow-[0_0_8px_rgba(79,70,229,0.4)]" style={{ width: `${getProgress()}%` }} /></div>
            {isFormValid && (<button onClick={handleNextStep} className="w-full py-4 bg-indigo-600 text-white rounded-xl font-black shadow-lg animate-in fade-in zoom-in-95 duration-300 active:scale-95 transition-all mt-4">{language === 'ko' ? '나의 사주 오행 분석하기' : 'Analyze My Five Elements'}</button>)}
          </div>
        )}

        {step === 3 && (
          <div className="space-y-5 text-center animate-in slide-in-from-right-4">
            <div className="space-y-1">
              <SparklesIcon className="w-10 h-10 text-yellow-400 mx-auto animate-bounce" />
              <h2 className="text-xl font-black dark:text-white">{language === 'ko' ? '입력 정보 확인' : 'Check Your Info'}</h2>
            </div>

            <div className="p-5 bg-slate-50 dark:bg-slate-800/50 rounded-[2rem] border-2 border-dashed border-indigo-200 dark:border-indigo-900">
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 border border-slate-100 dark:border-slate-800 shadow-sm">
                <div className="grid grid-cols-2 gap-y-4 gap-x-2 text-left">
                  <div className="space-y-1"><p className="text-[10px] font-black text-slate-400 uppercase">{language === 'en' ? 'Gender' : '성별'}</p><p className="text-sm font-black dark:text-white">{gender === 'male' ? (language === 'ko' ? '남성 ♂' : 'Male ♂') : (language === 'ko' ? '여성 ♀' : 'Female ♀')}</p></div>
                  <div className="space-y-1"><p className="text-[10px] font-black text-slate-400 uppercase">{language === 'en' ? 'Birth Date' : '생년월일'}</p><p className="text-sm font-black dark:text-white">{birthData.year}.{birthData.month}.{birthData.day}</p></div>
                  <div className="space-y-1"><p className="text-[10px] font-black text-slate-400 uppercase">{language === 'en' ? 'Birth Time' : '시분'}</p><p className="text-sm font-black dark:text-white">{timeUnknown ? (language === 'ko' ? '시간 모름' : 'Unknown') : `${birthData.hour}:${birthData.minute}`}</p></div>
                  <div className="flex items-end justify-end"><button onClick={handleEdit} className="px-3 py-1.5 bg-white dark:bg-slate-700 rounded-lg text-[11px] font-black text-indigo-600 dark:text-indigo-400 shadow-sm border border-slate-100 dark:border-slate-600 active:scale-95 transition-all">{language === 'ko' ? '정보 수정' : 'Edit Info'}</button></div>
                </div>
              </div>

              {!!sajuDataState && <div className="mt-4"><FourPillarVis saju={saju} isTimeUnknown={timeUnknown} /></div>}
            </div>

            <div className="mt-3 bg-slate-50 text-sm dark:bg-slate-800/50 rounded-2xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm text-left">
              <div className="py-2 space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-1000">
                <section><div className="flex items-center gap-2 mb-3"><span className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-lg">{preview.coreEmoji}</span><h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{language === 'ko' ? 'Identity' : 'Identity'}</h3></div><p className="text-lg font-black dark:text-white leading-snug break-keep">{preview.coreText}</p></section>
                <div className="space-y-6 border-l-2 border-slate-100 dark:border-slate-800 ml-4 pl-6">
                  <section className="relative"><div className="absolute -left-[31px] top-1 w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.6)]" /><h4 className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-1">Dominant Energy</h4><p className="text-[15px] font-bold text-slate-700 dark:text-slate-200">{preview.dominantText}</p></section>
                  <section className="relative"><div className="absolute -left-[31px] top-1 w-2 h-2 rounded-full bg-emerald-500" /><h4 className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">Hidden Talents</h4><div className="text-[14px] font-semibold text-slate-600 dark:text-slate-300 leading-relaxed">{preview.talentText}</div></section>
                </div>
              </div>
            </div>

            <div className="pt-4 space-y-4">
              <div>
                <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">{language === 'ko' ? '태어난 장소 (선택)' : 'Birth Place (Optional)'}</p>
                <CityInput value={birthCity} onChange={(e) => setBirthCity(e.target.value)} language={language} className="!p-4 !rounded-xl !border-2 !border-slate-100 dark:!border-slate-800 !bg-slate-50 dark:!bg-slate-800 !text-sm !font-bold" />
              </div>
              <div>
                <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">{language === 'ko' ? '휴대폰 번호 (선택)' : 'Phone Number (Optional)'}</p>
                <input
                  type="tel"
                  placeholder="010-0000-0000"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full p-4 rounded-xl border-2 border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-sm font-bold outline-none focus:border-indigo-500 transition-all dark:text-white"
                />
              </div>
              <button onClick={handleLoginAndSave} className="w-full py-5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black shadow-xl shadow-indigo-200 dark:shadow-none transition-all active:scale-95">{language === 'ko' ? '로그인하고 리포트 확인하기' : 'Log in to See Report'}</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
