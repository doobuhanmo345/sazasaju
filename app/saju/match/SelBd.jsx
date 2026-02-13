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
    color = 'pink'
}) {

    const { user } = useAuthContext();
    const { language } = useLanguage();
    const t = (char) => (language !== 'ko' ? getEng(char) : char);

    const THEMES = {
        pink: {
            label: 'text-pink-600/70 dark:text-pink-400/70',
            genderActive: 'bg-pink-100 dark:bg-pink-900/40 text-pink-700 dark:text-pink-300 shadow-sm',
            genderInactive: 'bg-pink-50/30 dark:bg-pink-900/10 text-pink-400/60 dark:text-pink-500/50 hover:bg-pink-50 dark:hover:bg-pink-900/20',
            checkbox: 'text-pink-600 focus:ring-pink-500 border-pink-300',
            input: 'dark:bg-pink-900/10 border-pink-200/50 dark:border-pink-800/30 focus:ring-pink-500/30 focus:border-pink-400',
            divider: 'via-pink-200 dark:via-pink-800',
            sajuLabel: 'text-pink-400/70 dark:text-pink-500',
            sajuVal: 'text-pink-700 dark:text-pink-300',
            dayLabel: 'text-pink-600 dark:text-pink-400',
            dayVal: 'text-pink-600 dark:text-pink-300',
            dayBg: 'bg-pink-300/20 dark:bg-pink-500/10'
        },
        cyan: {
            label: 'text-cyan-600/70 dark:text-cyan-400/70',
            genderActive: 'bg-cyan-100 dark:bg-cyan-900/40 text-cyan-700 dark:text-cyan-300 shadow-sm',
            genderInactive: 'bg-cyan-50/30 dark:bg-cyan-900/10 text-cyan-400/60 dark:text-cyan-500/50 hover:bg-cyan-50 dark:hover:bg-cyan-900/20',
            checkbox: 'text-cyan-600 focus:ring-cyan-500 border-cyan-300',
            input: 'dark:bg-cyan-900/10 border-cyan-200/50 dark:border-cyan-800/30 focus:ring-cyan-500/30 focus:border-cyan-400',
            divider: 'via-cyan-200 dark:via-cyan-800',
            sajuLabel: 'text-cyan-400/70 dark:text-cyan-500',
            sajuVal: 'text-cyan-700 dark:text-cyan-300',
            dayLabel: 'text-cyan-600 dark:text-cyan-400',
            dayVal: 'text-cyan-600 dark:text-cyan-300',
            dayBg: 'bg-cyan-300/20 dark:bg-cyan-500/10'
        }
    };

    const theme = THEMES[color] || THEMES.pink;

    const [inputValue, setInputValue] = useState(() => {
        if (inputDate) return inputDate;
        try {
            const now = new Date();
            const offset = now.getTimezoneOffset() * 60000;
            return new Date(now.getTime() - offset).toISOString().slice(0, 16);
        } catch (e) {
            return '2024-01-01T00:00';
        }
    });

    const [timeUnknown, setTimeUnknown] = useState(() => {
        if (isTimeUnknown) return isTimeUnknown;
        else { return false }
    });

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
        if (typeof handleSaveMyInfo === 'function') {
            handleSaveMyInfo(inputDate, gender, isTimeUnknown);
        }
    }, [inputDate, gender, isTimeUnknown, handleSaveMyInfo])

    return (
        <div className="flex flex-col gap-4">
            <div
                className={`transition-all duration-300 overflow-hidden ${isSaved ? 'max-h-0 opacity-0' : 'max-h-[500px] opacity-100'}`}
            >
                <div className={`space-y-4 ${!user ? 'opacity-50 pointer-events-none grayscale' : ''}`}>
                    {/* Gender Selection */}
                    <div>
                        <label className={`block text-xs font-black uppercase tracking-wider mb-2 ${theme.label}`}>
                            {UI_TEXT.genderLabel[language]}
                        </label>
                        <div className="flex bg-gray-100 dark:bg-slate-700 p-1 rounded-xl">
                            <button
                                onClick={() => setGender('male')}
                                className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${gender === 'male' ? theme.genderActive : theme.genderInactive}`}
                            >
                                {UI_TEXT.male[language]}
                            </button>
                            <button
                                onClick={() => setGender('female')}
                                className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${gender === 'female' ? theme.genderActive : theme.genderInactive}`}
                            >
                                {UI_TEXT.female[language]}
                            </button>
                        </div>
                    </div>

                    {/* Birth Date Input */}
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <label className={`text-sm font-black uppercase tracking-wider ${theme.label}`}>
                                {UI_TEXT.birthLabel[language]}
                            </label>
                            <label className="flex items-center gap-1.5 cursor-pointer hover:opacity-70 transition-opacity">
                                <input
                                    type="checkbox"
                                    checked={timeUnknown}
                                    onChange={(e) => { setTimeUnknown(e.target.checked); setIsTimeUnknown(e.target.checked) }}
                                    className={`w-3 h-3 rounded focus:ring-offset-0 dark:bg-slate-700 ${theme.checkbox}`}
                                />
                                <span className={`text-sm font-semibold ${theme.label}`}>
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
                            className={`w-full px-3 py-2.5 bg-white/50 border rounded-xl outline-none focus:ring-2 dark:text-white text-sm font-medium dark:[color-scheme:dark] transition-all ${theme.input}`}
                        />
                    </div>
                </div>
            </div>

            {/* Saju Display */}
            {saju?.sky1 && (
                <>
                    <div className={`h-px bg-gradient-to-r from-transparent to-transparent ${theme.divider}`}></div>
                    <div className="flex flex-wrap justify-center gap-x-4 gap-y-2">
                        <div className="flex flex-col items-center">
                            <span className={`text-sm uppercase mb-1 font-semibold ${theme.sajuLabel}`}>
                                {UI_TEXT.year[language]}
                            </span>
                            <span className={`text-base font-black tracking-wider ${theme.sajuVal}`}>
                                {t(saju.sky3)}{t(saju.grd3)}
                            </span>
                        </div>

                        <div className="flex flex-col items-center">
                            <span className={`text-sm uppercase mb-1 font-semibold ${theme.sajuLabel}`}>
                                {UI_TEXT.month[language]}
                            </span>
                            <span className={`text-base font-black tracking-wider ${theme.sajuVal}`}>
                                {t(saju.sky2)}{t(saju.grd2)}
                            </span>
                        </div>

                        <div className="flex flex-col items-center relative">
                            <div className={`absolute inset-0 blur-lg rounded-full ${theme.dayBg}`}></div>
                            <span className={`text-sm uppercase mb-1 font-black relative z-10 ${theme.dayLabel}`}>
                                {UI_TEXT.day[language]}
                            </span>
                            <span className={`text-lg font-black tracking-wider relative z-10 ${theme.dayVal}`}>
                                {t(saju.sky1)}{t(saju.grd1)}
                            </span>
                        </div>

                        {!isTimeUnknown && (
                            <div className="flex flex-col items-center">
                                <span className={`text-sm uppercase mb-1 font-semibold ${theme.sajuLabel}`}>
                                    {UI_TEXT.hour[language]}
                                </span>
                                <span className={`text-base font-black tracking-wider ${theme.sajuVal}`}>
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
