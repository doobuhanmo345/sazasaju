'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useLanguage } from '@/contexts/useLanguageContext';
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
import AmaEn from './AmaEn';

export default function SazaTalkAdEnPage() {
  const [guestId, setGuestId] = useState('');
  const [step, setStep] = useState(0.5);
  const { setLanguage } = useLanguage();
  const { user, userData, loadingUser } = useAuthContext();
  const [userQuestion, setUserQuestion] = useState('');
  const [loading, setLoading] = useState(false);

  // Client-side Title Update for Localization (Static Export Support)
  useEffect(() => {
    // This is an English specific ad page
    document.title = 'SazaTalk Global | Interactive AI Saju for International Users';
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

  useEffect(() => setLanguage('en'), [setLanguage]);

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
    if (!currentId) return alert('Please try again in a moment or refresh the page.');

    try {
      const docRef = doc(db, 'sazatalkad_logs', currentId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const existingData = docSnap.data();
        if (JSON.stringify(sortObject(existingData.saju)) === JSON.stringify(sortObject(saju))) {
          alert('Visit our website! Log in to get 3 premium reports daily for free.');
          return;
        }
      }
    } catch (e) {
      console.error('Check Error:', e);
    }

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
    if (!y || y < 1900 || y > 2030) return alert('Enter year 1900-2030');
    if (!m || m < 1 || m > 12) return alert('Enter month 1-12');
    const lastDay = new Date(y, m, 0).getDate();
    if (!d || d < 1 || d > lastDay) return alert(`Day must be 1-${lastDay}`);
    handleAskSaza();
  };

  const Loading = () => (
    <div className="bg-[#FDF5F0] min-h-screen flex flex-col items-center justify-center overflow-hidden px-6">
      <div className="relative flex items-center justify-center w-72 h-72">
        <div className="absolute w-44 h-44 rounded-full border-2 border-orange-200 border-dashed animate-[spin_10s_linear_infinite] opacity-40"></div>
        <div className="relative flex flex-col items-center z-10">
          <div className="absolute inset-0 bg-orange-400/20 blur-3xl rounded-full scale-150"></div>
          <span className="text-8xl select-none drop-shadow-lg mb-2">🦁</span>
          <div className="bg-[#F47521] text-white text-[10px] font-black px-3 py-1 rounded-full tracking-widest animate-pulse">ANALYZING</div>
        </div>
      </div>
      <h2 className="text-2xl font-black text-[#4A3428] mt-8">Saza is Analyzing...</h2>
      <p className="text-[15px] text-[#8B6E5E] font-bold mt-2">Saza and 27 Saju masters are analyzing together</p>
    </div>
  );

  if (loading) return <Loading />;

  return (
    <div className="bg-white">
      {step !== 0.5 && step !== 'result' && (
        <button onClick={handleBack} className="absolute left-5 top-6 z-20 p-2 rounded-full bg-white text-indigo-600 shadow-md border border-slate-100"><ChevronLeftIcon className="w-6 h-6 stroke-[3px]" /></button>
      )}
      <div className="max-w-3xl mx-auto">
        {step === 0.5 && <AmaEn setStep={() => setStep(1)} question={userQuestion} setQuestion={setUserQuestion} />}
        {step === 1 && (
          <div className="min-h-screen bg-[#FDF5F0] font-sans text-[#4A3428] px-6 py-10">
            <div className="text-center mb-8">
              <div className="flex justify-center items-center gap-1.5 mb-4">
                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center text-xl">🦁</div>
                <span className="text-xl font-bold tracking-tight text-[#333]">Saza Saju</span>
              </div>
              <h2 className="text-lg font-black leading-tight">Analyzing your Five Elements based on your birth date.</h2>
            </div>
            <div className="space-y-3">
              <div className="flex gap-2">
                {['male', 'female'].map((g) => (
                  <button key={g} onClick={() => setGender(g)} className={`flex-1 py-4 rounded-2xl border-2 font-bold shadow-sm ${gender === g ? 'border-[#F47521] bg-white text-[#F47521]' : 'border-white bg-white/50 text-[#C4B5A9]'}`}>{g === 'male' ? 'Male' : 'Female'}</button>
                ))}
              </div>
              {gender && <input type="number" placeholder="Birth Year(YYYY)" value={birthData.year} className="w-full p-5 bg-white rounded-2xl border-2 border-transparent focus:border-[#F47521] outline-none font-bold text-center shadow-sm" onChange={(e) => setBirthData({ ...birthData, year: e.target.value.slice(0, 4) })} />}
              {isYearDone && <input type="number" placeholder="Birth Month(MM)" value={birthData.month} className="w-full p-5 bg-white rounded-2xl border-2 border-transparent focus:border-[#F47521] outline-none font-bold text-center shadow-sm" onChange={(e) => setBirthData({ ...birthData, month: e.target.value.slice(0, 2) })} />}
              {isMonthDone && isYearDone && <input type="number" placeholder="Birth Day(DD)" value={birthData.day} className="w-full p-5 bg-white rounded-2xl border-2 border-transparent focus:border-[#F47521] outline-none font-bold text-center shadow-sm" onChange={(e) => setBirthData({ ...birthData, day: e.target.value.slice(0, 2) })} />}
              {isDayDone && (
                <label className="flex items-center gap-2 cursor-pointer w-fit mx-auto py-2 group"><input type="checkbox" checked={timeUnknown} onChange={(e) => setTimeUnknown(e.target.checked)} className="w-5 h-5 accent-[#F47521]" /><span className="text-md font-bold text-[#C4B5A9] group-hover:text-[#F47521]">time unknown</span></label>
              )}
            </div>
            <div className="w-full h-2.5 bg-white rounded-full overflow-hidden shadow-sm border border-orange-50 mt-4"><div className="h-full bg-[#F47521] transition-all duration-700" style={{ width: `${getProgress()}%` }} /></div>
            {isFormValid && <button onClick={handleNextStep} className="w-full py-5 bg-[#F47521] text-white rounded-full font-bold text-lg shadow-lg mt-8">Analyze My Five Elements</button>}
          </div>
        )}
      </div>
      {step === 'input' && (
        <div className="max-w-lg min-h-screen mx-auto px-6 py-9">
          <div className="text-center"><h2 className="text-2xl font-black text-slate-800 mb-4 tracking-tight">Clear Solutions for Any Concern<br /><span className="text-violet-600">Personalized 1:1 Saju Solution</span></h2><p className="text-sm text-slate-600 mb-10">AI trained on 27 expert Myeongni interpretations listens calmly to your concerns and provides solutions.</p></div>
          <div className="flex items-center gap-2 mb-4 text-purple-600"><PencilSquareIcon className="w-5 h-5" /><h3 className="font-bold">Tell me what is on your mind</h3></div>
          <textarea value={userQuestion} onChange={(e) => setUserQuestion(e.target.value)} placeholder="Ex: I'm curious about my relationship luck for this year!" className="w-full h-40 p-4 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-purple-400 outline-none resize-none bg-white placeholder:text-slate-400" />
          <button onClick={() => userQuestion.trim() && handleAskSaza()} disabled={!userQuestion.trim()} className={classNames('w-full py-4 mt-6 rounded-xl font-bold', userQuestion.trim() ? 'bg-purple-600 text-white shadow-lg' : 'bg-slate-200 text-slate-400 cursor-not-allowed')}>Ask Saza</button>
        </div>
      )}
      {step === 'result' && (
        <div className="gap-3 min-h-screen m-10">
          {userQuestion && <div className="flex justify-end"><div className="max-w-[80%] bg-indigo-600 text-white p-4 rounded-2xl rounded-tr-none shadow-md"><p className="text-sm font-bold">{userQuestion}</p></div></div>}
          <div className="flex justify-start mt-6"><div className="leading-8 w-full bg-slate-100 p-5 rounded-2xl rounded-tl-none shadow-sm"><div className="leading-8 w-full bg-white p-6 rounded-[24px] shadow-sm">{data.contents?.map((i, idx) => (<p key={idx}>{i}</p>))}<br /><strong>Saza's Advice: {data.saza}</strong></div></div></div>
        </div>
      )}
    </div>
  );
}
