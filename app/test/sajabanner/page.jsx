'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '@/contexts/useLanguageContext';
import AnalyzeButton from '@/ui/AnalyzeButton';

const SazaTalkBanner = () => {

    const language = 'ko';
    const loading = false;
    const isAnalysisDone = false;
    const isDisabled = false;
    const isDisabled2 = false;
    const handleStartClick = () => {
        console.log('handleStartClick');
    };

    return (
        <div className="mx-auto  text-center px-6 animate-in fade-in slide-in-from-bottom-5 duration-700">
            <div>
                <h2 className="text-3xl font-black text-slate-800 dark:text-white mb-4 tracking-tight">
                    {language === 'ko' ? '사업 성패의 결정적 한 수' : "Your Business Success Blueprint"}

                    <br />
                    <span className="relative text-amber-600 dark:text-amber-500">
                        {language === 'ko' ? '창업 시기부터 업종 분석까지' : "From Launch Timing to Best Industry"}
                        <div className="absolute inset-0 bg-amber-200/50 dark:bg-amber-800/60 blur-md rounded-full scale-100"></div>
                    </span>
                </h2>
            </div>
            <div className="space-y-4 text-slate-600 dark:text-slate-400 mb-10 leading-relaxed break-keep">
                {language === 'ko' ? (
                    <>
                        당신의 <strong>사업적 성공 가능성</strong>과 <br />가장 운이 따르는 <strong>최적의 창업 시기</strong>를 분석합니다. <br />
                        나에게 맞는 <strong>업종과 아이템</strong>은 무엇인지, <br />그리고 <strong>동업과 독자 생존</strong> 중 어떤 길이 유리할지 사주학적 마스터 플랜을 확인해 보세요.
                    </>
                ) : (
                    <>
                        Analyze your <strong>entrepreneurial success potential</strong> and <br />find the <strong>optimal timing</strong> to launch your business. <br />
                        Discover the <strong>best industries and items</strong> for you, <br />and determine whether <strong>partnership or going solo</strong> will lead to greater prosperity.
                    </>
                )}

                <div className="m-auto max-w-sm rounded-2xl overflow-hidden shadow-sm border border-slate-100 dark:border-slate-800">
                    <img
                        src="/images/introcard/wealth_startup.webp"
                        alt="today's luck"
                        className="w-full h-auto"
                    />
                </div>
            </div>

            {/* Primary Analyze Button */}
            <div className="mb-12 max-w-lg mx-auto">
                <AnalyzeButton
                    onClick={() => loveEnergy.triggerConsume(handleAnalysis)}
                    disabled={isDisabled || isDisabled2}
                    loading={loading}
                    isDone={isAnalysisDone}
                    label={language === 'ko' ? '확인하기' : 'Check his/her mind'}
                    color="emerald"
                    cost={-1}
                />

            </div>




        </div>
    );
};

export default SazaTalkBanner;