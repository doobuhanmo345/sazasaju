'use client';

import React, { useEffect, useState, useMemo } from 'react';
import SajuIntroSection from '@/app/ad/SajuIntroSection2';
import { useLanguage } from '@/contexts/useLanguageContext';
import { useSajuCalculator } from '@/hooks/useSajuCalculator';
import { ref, get, child } from 'firebase/database';
import { database } from '@/lib/firebase';
import { setDoc, doc, increment, arrayUnion } from 'firebase/firestore';
import {
  ChatBubbleLeftRightIcon,
  CakeIcon,
  ChevronLeftIcon,
  PencilSquareIcon,
} from '@heroicons/react/24/solid';
import { calculateSajuData } from '@/lib/sajuLogic';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuthContext } from '@/contexts/useAuthContext';
import dayStem from '@/data/dayStem.json';
import dayBranch from '@/data/dayBranch.json';
import { classNames } from '@/utils/helpers';
import { fetchGeminiAnalysis } from '@/lib/gemini';
import { parseAiResponse } from '@/utils/helpers';

export default function SazaTalkAdPage() {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showEmailInput, setShowEmailInput] = useState(false);
  const [guestId, setGuestId] = useState('');
  const [sajuData, setSajuData] = useState();
  const [step, setStep] = useState(0.5); // '0.5' '1', 'input' 'result'
  const { language, setLanguage } = useLanguage();
  const { user, userData, loadingUser } = useAuthContext();
  const [userQuestion, setUserQuestion] = useState('');
  const [loading, setLoading] = useState(false);

  // 1. 비회원용 익명 ID 생성 및 관리
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

  useEffect(() => setLanguage('en'), [step, setLanguage]);

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

  const pad = (n) => n?.toString().padStart(2, '0') || '00';

  const { saju } = useSajuCalculator(memoizedBirthDate, timeUnknown);

  const isYearDone = birthData.year.length === 4;
  const isMonthDone = birthData.month.length >= 1;
  const isDayDone = birthData.day.length >= 1;
  const isHourDone = birthData.hour.length >= 1;
  const isMinuteDone = birthData.minute.length >= 1;

  const [aiResult, setAiResult] = useState();
  const [data, setData] = useState({});

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

  const isFormValid = getProgress() === 100;

  const handleNextStep = () => {
    const { year, month, day, hour, minute } = birthData;
    const y = parseInt(year);
    const m = parseInt(month);
    const d = parseInt(day);
    const h = parseInt(hour);
    const min = parseInt(minute);

    if (!y || y < 1900 || y > 2030) return alert('Enter year 1900-2030');
    if (!m || m < 1 || m > 12) return alert('Enter month 1-12');
    const lastDayOfMonth = new Date(y, m, 0).getDate();
    if (!d || d < 1 || d > lastDayOfMonth) return alert(`Day must be 1-${lastDayOfMonth}`);
    if (!timeUnknown) {
      if (isNaN(h) || h < 0 || h > 23) return alert('Enter hours 0-23');
      if (isNaN(min) || min < 0 || min > 59) return alert('Enter minutes 0-59');
    }
    setStep('input');
  };

  const handleAskSaza = async () => {
    if (!userQuestion.trim()) return alert('Please enter your question.');
    setLoading(true);

    try {
      const dbRef = ref(database);
      const [basicSnap, strictSnap, formatSnap] = await Promise.all([
        get(child(dbRef, 'prompt/saza_basic')),
        get(child(dbRef, `prompt/saza_strict`)),
        get(child(dbRef, `prompt/saza_format`)),
      ]);

      const sajuInfo = `Gender:${gender}, Birth:${birthData.year}-${birthData.month}-${birthData.day}, Pillars:${JSON.stringify(saju)}. Name:${userData?.displayName || 'guest'}`;
      const todayInfo = `Current time:${new Date().toLocaleString()}. 2026 is Year of the Fire Horse. `;

      const replacements = {
        '{{STRICT_PROMPT}}': strictSnap.val() || '',
        '{{SAZA_FORMAT}}': formatSnap.val() || '',
        '{{myQuestion}}': userQuestion,
        '{{sajuInfo}}': sajuInfo,
        '{{todayInfo}}': todayInfo,
        '{{langPrompt}}': '**Please answer in English with 150~200 words**',
        '{{hanjaPrompt}}': '',
      };

      let fullPrompt = basicSnap.val();
      Object.entries(replacements).forEach(([key, value]) => {
        fullPrompt = fullPrompt.split(key).join(value || '');
      });

      const result = await fetchGeminiAnalysis(fullPrompt);
      const timestamp = new Date().getTime();
      const userId = guestId || user?.uid;

      if (userId) {
        const docId = `${timestamp}_${userId}`;
        await setDoc(doc(db, 'sazatalkad_logs', docId), {
          id: userId,
          user: !!user,
          saju: saju,
          question_history: arrayUnion({ question: userQuestion, timestamp: new Date().toISOString() }),
        }, { merge: true });
      }

      setAiResult(result);
      setStep('result');
    } catch (e) {
      alert(e);
    } finally {
      setLoading(false);
    }
  };

  const Loading = () => (
    <div className="bg-white min-h-screen flex flex-col items-center justify-center overflow-hidden transform-gpu">
      <div className="relative flex items-center justify-center w-64 h-64">
        <div className="absolute w-40 h-40 rounded-full border border-indigo-100 animate-[spin_3s_linear_infinite] opacity-50 will-change-transform"></div>
        <div className="absolute w-48 h-48 animate-[spin_3s_linear_infinite] will-change-transform"><span className="absolute top-0 left-1/2 -translate-x-1/2 text-2xl">✨</span></div>
        <div className="absolute w-32 h-32 animate-[spin_5s_linear_infinite_reverse] will-change-transform"><span className="absolute bottom-0 left-1/2 -translate-x-1/2 text-xl">⭐</span></div>
        <div className="absolute w-56 h-56 animate-[spin_7s_linear_infinite] will-change-transform"><span className="absolute left-0 top-1/2 -translate-y-1/2 text-xl">🌙</span></div>
        <div className="relative flex flex-col items-center z-10">
          <div className="absolute inset-0 bg-indigo-500/10 blur-2xl rounded-full"></div>
          <span className="text-7xl select-none drop-shadow-lg">🦁</span>
          <span className="text-sm font-bold text-indigo-500 mt-2 tracking-tighter animate-pulse">ANALYZING</span>
        </div>
      </div>
      <div className="mt-4 text-center px-4 transform-gpu">
        <h2 className="text-xl font-black text-slate-700 mb-2">Saza is Analyzing...</h2>
        <p className="text-sm text-slate-500 font-bold">Saza and 27 Saju masters are analyzing together</p>
      </div>
    </div>
  );

  if (loading) return <Loading />;

  return (
    <div className="bg-white">
      {step !== 0.5 && step !== 'result' && (
        <button onClick={handleBack} className="absolute left-5 top-6 z-20 p-2 rounded-full bg-white text-indigo-600 shadow-md border border-slate-100 hover:bg-slate-50 transition-all"><ChevronLeftIcon className="w-6 h-6 stroke-[3px]" /></button>
      )}
      <div className="max-w-3xl mx-auto px-6">
        {step === 0.5 && <div className="min-h-screen bg-slate-50 font-sans"><SajuIntroSection setStep={setStep} language={language} /></div>}
        {step === 1 && (
          <div className="space-y-4 py-10 min-h-screen font-sans text-slate-900 px-6">
            <h2 className="text-center text-md font-black">Analyzing your Five Elements based on your birth date.</h2>
            <div className="flex gap-2">
              {['male', 'female'].map((g) => (
                <button key={g} onClick={() => setGender(g)} className={`flex-1 py-3 rounded-xl border-2 font-bold transition-all ${gender === g ? 'border-indigo-500 bg-indigo-50 text-indigo-600' : 'border-slate-100'}`}>{g === 'male' ? 'Male' : 'Female'}</button>
              ))}
            </div>
            {gender && <input type="number" placeholder="Birth Year(YYYY)" value={birthData.year} className="w-full p-4 bg-slate-50 rounded-xl border-2 border-transparent focus:border-indigo-500 outline-none font-bold text-center" onChange={(e) => setBirthData({ ...birthData, year: e.target.value.slice(0, 4) })} />}
            {isYearDone && <input type="number" placeholder="Birth Month(MM)" value={birthData.month} className="w-full p-4 bg-slate-50 rounded-xl border-2 border-transparent focus:border-indigo-500 outline-none font-bold text-center" onChange={(e) => setBirthData({ ...birthData, month: e.target.value.slice(0, 2) })} />}
            {isMonthDone && isYearDone && <input type="number" placeholder="Birth Day(DD)" value={birthData.day} className="w-full p-4 bg-slate-50 rounded-xl border-2 border-transparent focus:border-indigo-500 outline-none font-bold text-center" onChange={(e) => setBirthData({ ...birthData, day: e.target.value.slice(0, 2) })} />}
            {isDayDone && !timeUnknown && (
              <>
                <input type="number" placeholder="Birth Hour (HH)" className="w-full py-4 bg-slate-50 rounded-xl border-2 border-transparent focus:border-indigo-500 outline-none font-bold text-center" onChange={(e) => setBirthData({ ...birthData, hour: e.target.value.slice(0, 2) })} />
                <input type="number" placeholder="Birth Minute (mm)" className="w-full py-4 bg-slate-50 rounded-xl border-2 border-transparent focus:border-indigo-500 outline-none font-bold text-center" onChange={(e) => setBirthData({ ...birthData, minute: e.target.value.slice(0, 2) })} />
              </>
            )}
            {isDayDone && (
              <label className="flex items-center gap-2 cursor-pointer w-fit mx-auto"><input type="checkbox" checked={timeUnknown} onChange={(e) => setTimeUnknown(e.target.checked)} className="w-4 h-4 accent-indigo-500" /><span className="text-lg font-bold text-slate-500">time unknown</span></label>
            )}
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden shadow-inner"><div className="h-full bg-indigo-500 transition-all duration-700" style={{ width: `${getProgress()}%` }} /></div>
            {isFormValid && <button onClick={handleNextStep} className="w-full py-4 bg-indigo-600 text-white rounded-xl font-black shadow-lg hover:scale-[1.02] active:scale-95 transition-all">Analyze My Five Elements</button>}
          </div>
        )}
      </div>

      {step === 'input' && (
        <div className="max-w-lg min-h-screen mx-auto px-6 py-9">
          <div className="text-center">
            <h2 className="text-2xl font-black text-slate-800 mb-4 tracking-tight">Clear Solutions for Any Concern<br /><span className="relative text-violet-600">Personalized 1:1 Saju Solution</span></h2>
            <p className="text-sm text-slate-600 mb-10 leading-relaxed">AI trained on 27 expert Myeongni interpretations listens calmly to your concerns and provides solutions.</p>
          </div>
          <div className="flex items-center gap-2 mb-4 text-purple-600"><PencilSquareIcon className="w-5 h-5" /><h3 className="font-bold">Tell me what is on your mind</h3></div>
          <textarea value={userQuestion} onChange={(e) => setUserQuestion(e.target.value)} placeholder="Ex: I'm curious about my relationship luck for this year!" className="w-full h-40 p-4 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-purple-400 outline-none resize-none bg-white shadow-inner placeholder:text-slate-400" />
          <button onClick={() => userQuestion.trim() && handleAskSaza()} disabled={!userQuestion.trim()} className={classNames('w-full py-4 mt-6 rounded-xl font-bold transition-all', userQuestion.trim() ? 'bg-purple-600 text-white shadow-lg shadow-purple-100' : 'bg-slate-200 text-slate-400 cursor-not-allowed')}>Ask Saza</button>
        </div>
      )}
      {step === 'result' && (
        <div className="gap-3 min-h-screen m-10">
          {userQuestion && <div className="flex justify-end"><div className="max-w-[80%] bg-indigo-600 text-white p-4 rounded-2xl rounded-tr-none shadow-md"><p className="text-sm font-bold">{userQuestion}</p></div></div>}
          <div className="flex justify-start mt-6"><div className="leading-8 w-full bg-slate-100 p-5 rounded-2xl rounded-tl-none shadow-sm"><div className="leading-8 w-full bg-white p-6 rounded-[24px] shadow-sm">{data.contents?.map((i, idx) => (<p key={idx}>{i}</p>))}<strong>Saza's Advice: {data.saza}</strong></div></div></div>
          <div className="mt-8 p-6 bg-white border-2 border-dashed border-indigo-200 rounded-2xl text-center">
            <p className="text-gray-600 font-medium mb-4">For a deeper analysis, visit Saza Saju!</p>
            <div onClick={() => { navigator.clipboard.writeText('https://koreansaju.vercel.app'); alert('Link copied to clipboard!'); }} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg border border-gray-200 cursor-pointer hover:bg-indigo-50 transition-colors group">
              <span className="text-indigo-600 font-mono text-sm">koreansaju.vercel.app</span>
              <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded font-bold group-hover:bg-indigo-600 group-hover:text-white transition-colors">COPY</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
