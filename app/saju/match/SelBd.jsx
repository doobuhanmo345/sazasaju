'use client';
import { useState, useEffect } from 'react';
import { UI_TEXT, BD_EDIT_UI } from '@/data/constants';
import { CalendarDaysIcon } from '@heroicons/react/24/outline';
import { useLanguage } from '@/contexts/useLanguageContext';
import { useAuthContext } from '@/contexts/useAuthContext';
import { getEng } from '@/utils/helpers';

export default function SelBd({
    gender,
    inputDate,
    isTimeUnknown,
    setIsTimeUnknown,
    saju,
    handleSaveMyInfo,
    setInputDate,
    isSaved,
    setGender,
}) {

    const { user } = useAuthContext();
    const { language } = useLanguage();
    const t = (char) => (language === 'en' ? getEng(char) : char);
    const [inputValue, setInputValue] = useState(() => {
        // 1. 외부에서 받아온 값이 있으면 우선 사용
        if (inputDate) return inputDate;

        // 2. 값이 없으면 현재 시간으로 초기화 (기존 로직 유지)
        try {
            const now = new Date();
            const offset = now.getTimezoneOffset() * 60000;
            return new Date(now.getTime() - offset).toISOString().slice(0, 16);
        } catch (e) {
            return '2024-01-01T00:00';
        }
    });

    const [timeUnknown, setTimeUnknown] = useState(() => {
        // 1. 외부에서 받아온 값이 있으면 우선 사용
        if (isTimeUnknown) return isTimeUnknown;
        else { return false }
    });

    // props가 변경될 때 내부 상태 업데이트
    useEffect(() => {
        if (inputDate) {
            setInputValue(inputDate);
        }
    }, [inputDate]);

    useEffect(() => {
        if (isTimeUnknown !== undefined) {
            setTimeUnknown(isTimeUnknown);
        }
    }, [isTimeUnknown]);
    useEffect(() => {
        handleSaveMyInfo(inputDate, gender, isTimeUnknown);

    }, [inputDate, gender, isTimeUnknown])
    console.log(inputDate)
    return (
        <div className="flex flex-col gap-4">
            <div
                className={`transition-all duration-300 overflow-hidden ${isSaved ? 'max-h-0 opacity-0' : 'max-h-[500px] opacity-100'}`}
            >
                <div className={`space-y-4 ${!user ? 'opacity-50 pointer-events-none grayscale' : ''}`}>
                    {/* Gender Selection */}
                    <div>
                        <label className="block text-xs font-black text-pink-600/70 dark:text-pink-400/70 uppercase tracking-wider mb-2">
                            {UI_TEXT.genderLabel[language]}
                        </label>
                        <div className="flex bg-gray-100 dark:bg-slate-700 p-1 rounded-xl">
                            <button
                                onClick={() => setGender('male')}
                                className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${gender === 'male' ? 'bg-pink-100 dark:bg-pink-900/40 text-pink-700 dark:text-pink-300 shadow-sm' : 'bg-pink-50/30 dark:bg-pink-900/10 text-pink-400/60 dark:text-pink-500/50 hover:bg-pink-50 dark:hover:bg-pink-900/20'}`}
                            >
                                {UI_TEXT.male[language]}
                            </button>
                            <button
                                onClick={() => setGender('female')}
                                className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${gender === 'female' ? 'bg-pink-100 dark:bg-pink-900/40 text-pink-700 dark:text-pink-300 shadow-sm' : 'bg-pink-50/30 dark:bg-pink-900/10 text-pink-400/60 dark:text-pink-500/50 hover:bg-pink-50 dark:hover:bg-pink-900/20'}`}
                            >
                                {UI_TEXT.female[language]}
                            </button>
                        </div>
                    </div>

                    {/* Birth Date Input */}
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <label className="text-sm font-black text-pink-600/70 dark:text-pink-400/70 uppercase tracking-wider">
                                {UI_TEXT.birthLabel[language]}
                            </label>
                            <label className="flex items-center gap-1.5 cursor-pointer hover:opacity-70 transition-opacity">
                                <input
                                    type="checkbox"
                                    checked={timeUnknown}
                                    onChange={(e) => { setTimeUnknown(e.target.checked); setIsTimeUnknown(e.target.checked) }}
                                    className="w-3 h-3 text-pink-600 rounded focus:ring-pink-500 dark:bg-slate-700 border-pink-300"
                                />
                                <span className="text-sm font-semibold text-pink-600/70 dark:text-pink-400/70">
                                    {UI_TEXT.unknownTime[language]}
                                </span>
                            </label>
                        </div>
                        <input
                            type={timeUnknown ? 'date' : 'datetime-local'}
                            value={timeUnknown ? inputValue.split('T')[0] : inputValue}
                            onChange={(e) => {
                                let val = e.target.value;
                                if (timeUnknown) val += 'T00:00';
                                setInputValue(val);
                                setInputDate(val);
                            }}
                            className="w-full px-3 py-2.5 bg-white/50 dark:bg-pink-900/10 border border-pink-200/50 dark:border-pink-800/30 rounded-xl outline-none focus:ring-2 focus:ring-pink-500/30 focus:border-pink-400 dark:text-white text-sm font-medium dark:[color-scheme:dark] transition-all"
                        />
                    </div>
                </div>
            </div>

            {/* Saju Display */}
            {saju?.sky1 && (
                <>
                    <div className="h-px bg-gradient-to-r from-transparent via-pink-200 dark:via-pink-800 to-transparent"></div>
                    <div className="flex flex-wrap justify-center gap-x-4 gap-y-2">
                        <div className="flex flex-col items-center">
                            <span className="text-sm text-pink-400/70 dark:text-pink-500 uppercase mb-1 font-semibold">
                                {UI_TEXT.year[language]}
                            </span>
                            <span className="text-base font-black text-pink-700 dark:text-pink-300 tracking-wider">
                                {t(saju.sky3)}{t(saju.grd3)}
                            </span>
                        </div>

                        <div className="flex flex-col items-center">
                            <span className="text-sm text-pink-400/70 dark:text-pink-500 uppercase mb-1 font-semibold">
                                {UI_TEXT.month[language]}
                            </span>
                            <span className="text-base font-black text-pink-700 dark:text-pink-300 tracking-wider">
                                {t(saju.sky2)}{t(saju.grd2)}
                            </span>
                        </div>

                        <div className="flex flex-col items-center relative">
                            <div className="absolute inset-0 bg-pink-300/20 dark:bg-pink-500/10 blur-lg rounded-full"></div>
                            <span className="text-sm text-pink-600 dark:text-pink-400 uppercase mb-1 font-black relative z-10">
                                {UI_TEXT.day[language]}
                            </span>
                            <span className="text-lg font-black text-pink-600 dark:text-pink-300 tracking-wider relative z-10">
                                {t(saju.sky1)}{t(saju.grd1)}
                            </span>
                        </div>

                        {!isTimeUnknown && (
                            <div className="flex flex-col items-center">
                                <span className="text-sm text-pink-400/70 dark:text-pink-500 uppercase mb-1 font-semibold">
                                    {UI_TEXT.hour[language]}
                                </span>
                                <span className="text-base font-black text-pink-700 dark:text-pink-300 tracking-wider">
                                    {t(saju.sky0)}{t(saju.grd0)}
                                </span>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}
