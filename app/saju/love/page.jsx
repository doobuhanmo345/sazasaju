'use client';

import { useEffect } from 'react';
import { useLanguage } from '@/contexts/useLanguageContext';
import LoveIcons from '@/components/menuicons/LoveIcons';

export default function LoveClient() {
    const { language } = useLanguage();

    useEffect(() => {
        if (language === 'ko') {
            document.title = '애정운 | 사주로 보는 연애운';
        } else {
            document.title = 'Love Fortune | Romance Analysis';
        }
    }, [language]);

    return (
        <div className="w-full min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-red-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
            {/* Hero Section */}
            <div className="relative border-b border-pink-100 dark:border-slate-700">
                <div className="max-w-6xl mx-auto px-4 py-16 text-center">
                    <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-gradient-to-br from-rose-500 to-pink-600 mb-8 shadow-2xl shadow-rose-300 dark:shadow-rose-900/50">
                        <svg className="w-14 h-14 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                    </div>
                    <h1 className="text-5xl sm:text-6xl font-black text-slate-900 dark:text-white mb-6 leading-tight">
                        {language === 'ko' ? '애정운 분석' : 'Love Fortune Analysis'}
                    </h1>
                    <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed">
                        {language === 'ko'
                            ? '사주로 보는 나의 연애운과 애정 패턴을 분석합니다'
                            : 'Analyze your love fortune and romantic patterns through Saju'}
                    </p>
                </div>
            </div>

            {/* Analysis Options */}
            <div className="max-w-6xl mx-auto px-4 py-12">
                <div className="mb-12 text-center">
                    <h2 className="text-3xl font-black text-slate-800 dark:text-slate-100 mb-4">
                        {language === 'ko' ? '어떤 애정운이 궁금하신가요?' : 'Which love fortune are you curious about?'}
                    </h2>
                    <p className="text-slate-600 dark:text-slate-400">
                        {language === 'ko'
                            ? '7가지 애정운 분석 중 원하는 항목을 선택하세요'
                            : 'Choose from 7 different love fortune analyses'}
                    </p>
                </div>

                <LoveIcons />

                {/* Info Section */}
                <div className="mt-16 p-8 bg-white dark:bg-slate-800 rounded-2xl border border-pink-100 dark:border-slate-700 shadow-lg">
                    <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-4">
                        {language === 'ko' ? '💝 애정운 분석 안내' : '💝 Love Fortune Guide'}
                    </h3>
                    <div className="space-y-3 text-slate-600 dark:text-slate-300">
                        <p>
                            {language === 'ko'
                                ? '• 각 분석은 사주 팔자를 기반으로 한 AI 분석입니다'
                                : '• Each analysis is AI-powered based on your Saju (Four Pillars)'}
                        </p>
                        <p>
                            {language === 'ko'
                                ? '• 재회운과 상대방의 진심 분석은 상대방 정보를 입력하면 더 정확합니다'
                                : '• Reunion and Their Feelings analyses are more accurate with partner information'}
                        </p>
                        <p>
                            {language === 'ko'
                                ? '• 한 번 분석한 내용은 크레딧을 재소모하지 않습니다'
                                : '• Previously analyzed fortunes do not consume credits again'}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
