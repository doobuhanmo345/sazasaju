'use client';

import React from 'react';
import ShareTemplate from '@/app/saju/share/ShareTemplate';

/**
 * TarotShareTemplate - 타로 콘텐츠 템플릿
 * ShareTemplate wrapper 안에서 사용됨
 */
export default function TarotShareTemplate({ shareData, language = 'ko' }) {
    const { displayName, aiResult } = shareData || {};

    if (!shareData) {
        return (
            <div className="text-center p-8">
                <p className="text-gray-600">
                    {language === 'ko' ? '공유 데이터를 불러올 수 없습니다.' : 'Unable to load shared data.'}
                </p>
            </div>
        );
    }

    return (
        <ShareTemplate
            language={language}
            fortuneType="tarot"
            gradientColors="from-purple-600 via-pink-600 to-rose-600"
        >
            <div className="text-center mb-8">
                <h1 className="text-3xl md:text-4xl font-black text-slate-800 mb-3">
                    {displayName}
                    {language === 'ko' ? '님의 타로' : "'s Tarot"}
                </h1>
                <p className="text-gray-600">
                    {language === 'ko' ? '타로 공유 기능은 곧 추가됩니다.' : 'Tarot sharing coming soon.'}
                </p>
            </div>

            {/* TODO: 타로 카드 결과 렌더링 */}
            <div className="text-center py-12">
                <p className="text-gray-500">타로 템플릿 구현 예정</p>
            </div>
        </ShareTemplate>
    );
}
