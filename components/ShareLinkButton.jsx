'use client';

import React, { useState } from 'react';
import { PaperAirplaneIcon, CheckIcon } from '@heroicons/react/24/outline';
import { useLanguage } from '@/contexts/useLanguageContext';
import { useAuthContext } from '@/contexts/useAuthContext';
import { NativeBridge } from '@/utils/nativeBridge';

export default function ShareLinkButton({ fortuneType = 'basic' }) {
    const { language } = useLanguage();
    const { userData, selectedProfile } = useAuthContext();
    const [isCopied, setIsCopied] = useState(false);

    const handleShareLink = async () => {
        try {
            const targetProfile = selectedProfile || userData;
            if (!targetProfile) return;

            const aiResult = targetProfile?.usageHistory?.ZApiAnalysis?.result;
            if (!aiResult) {
                alert(language === 'ko' ? '공유할 분석 결과가 없습니다.' : 'No analysis result to share.');
                return;
            }

            const shareData = {
                displayName: targetProfile.displayName,
                birthDate: targetProfile.birthDate,
                isTimeUnknown: targetProfile.isTimeUnknown,
                gender: targetProfile.gender,
                aiResult: aiResult,
            };

            // Base64 encode for URL (UTF-8 safe)
            const jsonStr = JSON.stringify(shareData);
            const encodedData = btoa(encodeURIComponent(jsonStr).replace(/%([0-9A-F]{2})/g, (match, p1) =>
                String.fromCharCode(parseInt(p1, 16))
            ));

            // Generate share URL based on fortune type
            const shareUrl = `${window.location.origin}/saju/share/${fortuneType}?data=${encodeURIComponent(encodedData)}`;

            // Use NativeBridge for better mobile experience
            const fortuneTypeLabels = {
                basic: language === 'ko' ? '사주' : 'Saju',
                tarot: language === 'ko' ? '타로' : 'Tarot',
                yearly: language === 'ko' ? '신년운세' : 'Yearly Fortune',
            };
            const fortuneLabel = fortuneTypeLabels[fortuneType] || fortuneTypeLabels.basic;

            const shareTitle = language === 'ko' ? `사자사주 ${fortuneLabel} 결과 공유` : `Saza Saju ${fortuneLabel} Result`;
            const shareText = language === 'ko'
                ? `${targetProfile.displayName}님의 ${fortuneLabel} 분석 결과입니다. 확인해보세요!`
                : `Check out ${targetProfile.displayName}'s ${fortuneLabel} analysis!`;

            await NativeBridge.shareUrl(shareUrl, shareTitle, shareText);

            // Also copy to clipboard for web users (UI feedback)
            if (!window.Capacitor?.isNativePlatform()) {
                navigator.clipboard.writeText(shareUrl).then(() => {
                    setIsCopied(true);
                    setTimeout(() => setIsCopied(false), 2000);
                });
            }

        } catch (err) {
            console.error('Error sharing link:', err);
            alert(language === 'ko' ? '링크 공유 중 오류가 발생했습니다.' : 'Error sharing link.');
        }
    };

    return (
        <button
            onClick={handleShareLink}
            className={`flex items-center gap-2 px-8 py-4 rounded-full font-bold transition-all shadow-lg active:scale-95
        ${isCopied
                    ? 'bg-green-600 text-white'
                    : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-indigo-500/20'}`}
        >
            {isCopied ? (
                <>
                    <CheckIcon className="w-5 h-5" />
                    <span>{language === 'ko' ? '링크 복사됨!' : 'Link Copied!'}</span>
                </>
            ) : (
                <>
                    <PaperAirplaneIcon className="w-5 h-5 rotate-[-20deg]" />
                    <span>{language === 'ko' ? '카톡/링크로 보내기' : 'Send to Friend'}</span>
                </>
            )}
        </button>
    );
}
