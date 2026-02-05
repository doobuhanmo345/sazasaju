'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useLanguage } from '@/contexts/useLanguageContext';
import { useRouter } from 'next/navigation';
import { useSajuCalculator } from '@/hooks/useSajuCalculator';
import { ref, get, child } from 'firebase/database';
import { database } from '@/lib/firebase';
import { setDoc, doc, getDoc, arrayUnion } from 'firebase/firestore';
import {
  ChevronLeftIcon,
  PencilSquareIcon,

} from '@heroicons/react/24/solid';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuthContext } from '@/contexts/useAuthContext';
import { classNames, parseAiResponse } from '@/utils/helpers';
import { fetchGeminiAnalysis } from '@/lib/gemini';
import AmaKr from './AmaKr';
import CopyUrl2 from '@/components/CopyUrl2';

export default function SazaTalkAdKrPage() {
  const router = useRouter();
  const [guestId, setGuestId] = useState();
  const [step, setStep] = useState(0.5);
  const { setLanguage } = useLanguage();
  const { user, userData, loadingUser } = useAuthContext();
  const [userQuestion, setUserQuestion] = useState('올해 저의 재물운이 궁금합니다!');
  const [loading, setLoading] = useState(false);

  // Client-side Title Update for Localization (Static Export Support)
  useEffect(() => {
    // This is a Korean specific ad page, but we follow the pattern for consistency
    document.title = '사자톡 프리미엄 상담 | 질문하면 바로 답해주는  사주';
  }, []);

  useEffect(() => {
    if (loadingUser) return;
    if (userData) return;
    let id = localStorage.getItem('guest_id');
    if (!id) {
      id = `guest_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('guest_id', id);
    }
    setGuestId(id);
    logStep(step, id);
  }, [step, userData, loadingUser]);

  const logStep = async (stepName, currentGuestId, extraData = {}) => {
    if (userData) return;
    try {
      await addDoc(collection(db, 'sazatalk_funnel_logs'), {
        step: stepName,
        uid: currentGuestId || guestId,
        isLoggedIn: false,
        timestamp: serverTimestamp(),
        ...extraData,
      });
    } catch (e) {
      console.error('Log Error: ', e);
    }
  };

  useEffect(() => setLanguage('ko'), [setLanguage]);

  const [gender, setGender] = useState('');
  const [birthData, setBirthData] = useState({
    year: '',
    month: '',
    day: '',
    hour: '',
    minute: '',
  });
  const [timeUnknown, setTimeUnknown] = useState(false);

  const memoizedBirthDate = useMemo(() => {
    const { year, month, day, hour, minute } = birthData;
    if (!year || !month || !day) return null;
    const pad = (n) => n?.toString().padStart(2, '0') || '00';
    const formatted = `${year}-${pad(month)}-${pad(day)}T${timeUnknown ? '12' : pad(hour)}:${timeUnknown ? '00' : pad(minute)}`;
    return new Date(formatted);
  }, [birthData, timeUnknown]);

  const { saju } = useSajuCalculator(memoizedBirthDate, timeUnknown);

  const isYearDone = birthData.year.length === 4;
  const isMonthDone = birthData.month.length >= 1;
  const isDayDone = birthData.day.length >= 1;
  const isHourDone = birthData.hour.length >= 1;
  const isMinuteDone = birthData.minute.length >= 1;

  // Mock Data for dev/testing when no real result exists
  const mockData = {
    contents: [
      "당신의 사주에는 '불'의 기운이 강하게 나타납니다. 이는 열정과 추진력을 의미하지만, 때로는 급한 성격으로 이어질 수 있습니다.",
      "올해는 새로운 도전을 하기에 매우 좋은 시기입니다. 특히 상반기에는 귀인의 도움이 있을 것으로 보입니다.",
      "다만, 재물운에 있어서는 신중한 투자가 필요합니다. 충동적인 지출을 자제하고 계획적인 소비를 하시는 것이 좋습니다."
    ],
    saza: "불처럼 뜨거운 열정을 가지셨네요! 하지만 가끔은 차분하게 주위를 둘러보는 여유도 필요해요. 🦁"
  };

  const [aiResult, setAiResult] = useState();
  const [data, setData] = useState(mockData); // Initialize with mockData by default


  useEffect(() => {
    if (aiResult) {
      const parsedData = parseAiResponse(aiResult);
      if (parsedData) setData(parsedData);
    }
  }, [aiResult]);

  const getProgress = () => {
    let score = 0;
    if (gender) score += 20;
    if (isYearDone) score += 20;
    if (isMonthDone) score += 20;
    if (isDayDone) score += 20;
    if (timeUnknown) score += 20;
    else {
      if (isHourDone) score += 10;
      if (isMinuteDone) score += 10;
    }
    return score;
  };

  const handleBack = () => {
    if (step === 'input') {
      setBirthData({ year: '', month: '', day: '', hour: '', minute: '' });
      setTimeUnknown(false);
      setGender(null);
      setStep(1);
    } else if (step === 1) {
      setStep(0.5);
    } else if (step === 'result') {
      setStep('input');
    }
  };

  const sortObject = (obj) => {
    if (obj === null || typeof obj !== 'object') return obj;
    return Object.keys(obj).sort().reduce((acc, key) => {
      acc[key] = sortObject(obj[key]);
      return acc;
    }, {});
  };

  const isFormValid = getProgress() === 100;

  const handleAskSaza = async () => {
    const currentId = guestId || user?.uid;
    if (!currentId) return alert('잠시 후 다시 시도하거나 페이지를 새로고침 해주세요.');

    try {
      const docRef = doc(db, 'sazatalkad_logs', currentId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const existingData = docSnap.data();
        if (JSON.stringify(sortObject(existingData.saju)) === JSON.stringify(sortObject(saju))) {
          alert('사자사주 홈페이지에 방문해 보세요! 로그인만 하면 무료로 하루에 세 개씩 프리미엄 리포트를 확인할 수 있어요.');
          router.push('/');
          return;
        }
      }
    } catch (e) {
      console.error('Check Error:', e);
    }

    if (!userQuestion.trim()) return alert('질문을 입력해주세요.');
    setLoading(true);

    try {
      const dbRef = ref(database);
      const [basicSnap, strictSnap, formatSnap] = await Promise.all([
        get(child(dbRef, 'prompt/saza_basic')),
        get(child(dbRef, `prompt/saza_strict`)),
        get(child(dbRef, `prompt/saza_format`)),
      ]);

      const sajuInfo = `성별:${gender}, 생년${birthData.year} 생월${birthData.month} 생일${birthData.day}, 팔자:${JSON.stringify(saju)}. 호칭:${userData?.displayName || '의뢰자'}`;
      const todayInfo = `현재 시각:${new Date().toLocaleString()}. 2026년=병오년. `;

      const replacements = {
        '{{STRICT_PROMPT}}': strictSnap.val() || '',
        '{{SAZA_FORMAT}}': formatSnap.val() || '',
        '{{myQuestion}}': userQuestion,
        '{{sajuInfo}}': sajuInfo,
        '{{todayInfo}}': todayInfo,
        '{{langPrompt}}': '**한국어로 150~200 단어로**',
        '{{hanjaPrompt}}': '',
      };

      let fullPrompt = basicSnap.val();
      Object.entries(replacements).forEach(([key, value]) => {
        fullPrompt = fullPrompt.split(key).join(value || '');
      });

      const safeDate = new Date().toISOString().replace(/[:.]/g, '-');
      const result = await fetchGeminiAnalysis(fullPrompt);

      await setDoc(doc(db, 'sazatalkad_logs', currentId), {
        id: currentId,
        date: safeDate,
        user: !!user,
        saju: saju,
        question_history: arrayUnion({ question: userQuestion, timestamp: new Date().toISOString() }),
      }, { merge: true });

      setAiResult(result);
      setStep('result');
    } catch (e) {
      alert(e);
    } finally {
      setLoading(false);
    }
  };

  const handleNextStep = () => {
    const { year, month, day } = birthData;
    const y = parseInt(year);
    const m = parseInt(month);
    const d = parseInt(day);
    if (!y || y < 1900 || y > 2030) return alert('연도를 1900~2030년 사이로 입력해주세요.');
    if (!m || m < 1 || m > 12) return alert('월을 1~12월 사이로 입력해주세요.');
    const lastDay = new Date(y, m, 0).getDate();
    if (!d || d < 1 || d > lastDay) return alert(`${m}월은 ${lastDay}일까지 있습니다.`);
    handleAskSaza();
  };

  const Loading = () => {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
      const duration = 60000; // 60 seconds
      const interval = 100;
      const steps = duration / interval;
      const increment = 100 / steps;

      const timer = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(timer);
            return 100;
          }
          return prev + increment;
        });
      }, interval);

      return () => clearInterval(timer);
    }, []);

    return (
      <div className="bg-indigo-50 min-h-screen flex flex-col items-center justify-center overflow-hidden px-6">
        <div className="relative flex items-center justify-center w-72 h-72">
          <div className="absolute w-44 h-44 rounded-full border-2 border-indigo-200 border-dashed animate-[spin_10s_linear_infinite] opacity-40"></div>
          <div className="relative flex flex-col items-center z-10">
            <div className="absolute inset-0 bg-indigo-400/20 blur-3xl rounded-full scale-150"></div>
            <span className="text-8xl select-none drop-shadow-lg mb-2">🦁</span>
            <div className="bg-indigo-600 text-white text-[10px] font-black px-3 py-1 rounded-full tracking-widest animate-pulse">ANALYZING</div>
          </div>
        </div>
        <h2 className="text-2xl font-black text-slate-800 mt-8 mb-4">사자가 분석 중...</h2>

        {/* Progress Bar */}
        <div className="w-full max-w-xs bg-slate-200 rounded-full h-2.5 mb-2 overflow-hidden">
          <div
            className="bg-indigo-600 h-2.5 rounded-full transition-all duration-100 ease-linear"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <p className="text-sm text-indigo-500 font-bold mb-6">{Math.round(progress)}%</p>

        <p className="text-[15px] text-slate-500 font-bold mt-2 text-center break-keep">
          사자와 27명의 명리학자가 함께 당신의 사주를 풀고 있어요
        </p>
        <p className="text-sm text-rose-500 font-bold mt-4 animate-pulse text-center break-keep">
          잠시만 기다려 주세요! <br /> 페이지를 벗어나면 분석이 중단될 수 있습니다.
        </p>
      </div>
    );
  };

  if (loading) return <Loading />;

  return (
    <div className="">
      {step !== 0.5 && step !== 'result' && (
        <button onClick={handleBack} className="absolute left-5 top-6 z-20 p-2 rounded-full bg-white text-indigo-600 shadow-md border border-slate-100"><ChevronLeftIcon className="w-6 h-6 stroke-[3px]" /></button>
      )}
      <div className="mx-auto">
        {step === 0.5 && <AmaKr setStep={() => setStep(1)} question={userQuestion} setQuestion={setUserQuestion} />}
        {step === 1 && (
          <div className="min-h-screen bg-indigo-50 font-sans text-slate-800 px-6 py-10">
            <div className="text-center mb-8">
              <div className="flex justify-center items-center gap-1.5 mb-4">
                <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-xl">🦁</div>
                <span className="text-xl font-bold tracking-tight text-slate-900">사자사주</span>
              </div>
              <h2 className="text-lg font-black leading-tight">생년월일을 바탕으로 나의 오행을 분석합니다</h2>
            </div>
            <div className="space-y-3">
              <div className="flex gap-2">
                {['male', 'female'].map((g) => (
                  <button key={g} onClick={() => setGender(g)} className={`flex-1 py-4 rounded-2xl border-2 font-bold shadow-sm ${gender === g ? 'border-indigo-600 bg-white text-indigo-600' : 'border-white bg-white/50 text-slate-400'}`}>{g === 'male' ? '남성' : '여성'}</button>
                ))}
              </div>
              {gender && <input type="number" placeholder="태어난 연도(YYYY)" value={birthData.year} className="w-full p-5 bg-white rounded-2xl border-2 border-transparent focus:border-indigo-600 outline-none font-bold text-center shadow-sm" onChange={(e) => setBirthData({ ...birthData, year: e.target.value.slice(0, 4) })} />}
              {isYearDone && <input type="number" placeholder="태어난 월(MM)" value={birthData.month} className="w-full p-5 bg-white rounded-2xl border-2 border-transparent focus:border-indigo-600 outline-none font-bold text-center shadow-sm" onChange={(e) => setBirthData({ ...birthData, month: e.target.value.slice(0, 2) })} />}
              {isMonthDone && isYearDone && <input type="number" placeholder="태어난 날(DD)" value={birthData.day} className="w-full p-5 bg-white rounded-2xl border-2 border-transparent focus:border-indigo-600 outline-none font-bold text-center shadow-sm" onChange={(e) => setBirthData({ ...birthData, day: e.target.value.slice(0, 2) })} />}
              {isDayDone && (
                <label className="flex items-center gap-2 cursor-pointer w-fit mx-auto py-2 group"><input type="checkbox" checked={timeUnknown} onChange={(e) => setTimeUnknown(e.target.checked)} className="w-5 h-5 accent-indigo-600" /><span className="text-md font-bold text-slate-400 group-hover:text-indigo-600">시간을 몰라요</span></label>
              )}
            </div>
            <div className="w-full h-2.5 bg-white rounded-full overflow-hidden shadow-sm border border-indigo-200 mt-4"><div className="h-full bg-indigo-600 transition-all duration-700" style={{ width: `${getProgress()}%` }} /></div>
            {isFormValid && <button onClick={handleNextStep} className="w-full py-5 bg-indigo-600 text-white rounded-full font-bold text-lg shadow-lg mt-8">나의 사주 오행 분석하기</button>}
          </div>
        )}
      </div>
      {step === 'input' && (
        <div className="max-w-lg min-h-screen mx-auto px-6 py-9 bg-slate-50">
          <div className="text-center"><h2 className="text-2xl font-black text-slate-800 mb-4 tracking-tight">무엇이든 물어보사자<br /><span className="text-indigo-600">1:1 맞춤 사주 솔루션</span></h2><p className="text-sm text-slate-600 mb-10">27인의 명리 해석을 학습한 AI가 어떤 고민도 차분하게 듣고 해결책을 드려요</p></div>
          <div className="flex items-center gap-2 mb-4 text-indigo-600"><PencilSquareIcon className="w-5 h-5" /><h3 className="font-bold">당신의 고민을 들려주세요</h3></div>
          <textarea value={userQuestion} onChange={(e) => setUserQuestion(e.target.value)} placeholder="예: 올해 대인관계 운이 궁금해요!" className="w-full h-40 p-4 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-400 outline-none resize-none bg-white placeholder:text-slate-400" />
          <button onClick={() => userQuestion.trim() && handleAskSaza()} disabled={!userQuestion.trim()} className={classNames('w-full py-4 mt-6 rounded-xl font-bold', userQuestion.trim() ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-200 text-slate-400 cursor-not-allowed')}>물어보기</button>
        </div>
      )}
      {step === 'result' && (
        <div className="fixed inset-0 z-50 flex flex-col bg-indigo-50 dark:bg-slate-900">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 bg-indigo-50 dark:bg-slate-900 border-b border-indigo-100/50 dark:border-slate-800">
            <div className="flex items-center space-x-3 cursor-pointer" onClick={() => router.push('/')}>
              <button className="p-1 text-slate-500 dark:text-slate-400">
                <ChevronLeftIcon className="w-6 h-6" />
              </button>
              <span className="font-bold text-[17px] text-slate-800 dark:text-white">SazaTalk</span>
            </div>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto scrollbar-hide">
            <div className="w-full max-w-lg mx-auto p-5 pb-10 space-y-6">
              {/* User Question Bubble */}
              {userQuestion && (
                <div className="flex justify-end animate-in slide-in-from-right-5 duration-500">
                  <div className="max-w-[85%] bg-indigo-600 text-white px-4 py-3 rounded-[18px] rounded-tr-[2px] shadow-sm">
                    <p className="text-[14px] font-bold leading-relaxed">{userQuestion}</p>
                  </div>
                </div>
              )}

              {/* Saza Answer Bubble */}
              <div className="flex items-start animate-in slide-in-from-left-5 duration-500 delay-150">
                <div className="w-11 h-11 bg-indigo-500 rounded-[18px] flex items-center justify-center text-2xl mr-2 flex-shrink-0 shadow-sm text-white">🦁</div>
                <div className="flex flex-col max-w-[90%]">
                  <span className="text-[12px] text-slate-500 dark:text-slate-400 mb-1 ml-1 font-bold">사자</span>
                  <div className="relative bg-white dark:bg-slate-800 p-4 rounded-[16px] rounded-tl-none shadow-sm">
                    <div className="space-y-3 text-[15px] text-slate-800 dark:text-slate-100 leading-relaxed font-medium">
                      {data.contents?.map((paragraph, idx) => (
                        <p key={idx}>{paragraph}</p>
                      ))}
                      <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
                        <strong className="text-indigo-600 dark:text-indigo-400">사자의 조언:</strong> {data.saza}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Copy URL Component separate from chat */}
              <div className="animate-in slide-in-from-bottom-5 duration-500 delay-300">
                <CopyUrl2 saju={saju} from="sazatalk_ad" />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
