'use client';

import React, { useState } from 'react';
import { PaperAirplaneIcon, CheckIcon } from '@heroicons/react/24/outline';
import { useLanguage } from '@/contexts/useLanguageContext';
import { useAuthContext } from '@/contexts/useAuthContext';
import { NativeBridge } from '@/utils/nativeBridge';
import LZString from 'lz-string';

export default function ShareLinkButton({ fortuneType = 'basic', storageKey }) {
    const { language } = useLanguage();
    const { userData, selectedProfile } = useAuthContext();
    const [isCopied, setIsCopied] = useState(false);

    const handleShareLink = async () => {
        try {
            const targetProfile = selectedProfile || userData;
            if (!targetProfile) return;

            // Determine storage key
            let targetStorageKey = storageKey;
            if (!targetStorageKey) {
                const typeToKeyMap = {
                    basic: 'ZApiAnalysis',
                    todaysluck: 'ZLastDaily',
                    yearly: 'ZNewYear',
                    wealthCapacity: 'ZWealthCapacity',
                    wealthBusiness: 'ZWealthBusiness',
                    wealthInvestment: 'ZWealthInvestment',
                    wealthTiming: 'ZWealthTiming',
                    loveAvoid: "ZLoveAvoid",
                    loveCompatible: "ZLoveCompatible",
                    loveFeelings: "ZLoveFeelings",
                    loveLifetime: "ZLoveLifetime",
                    loveMonthly: "ZLoveMonthly",
                    loveReunion: "ZLoveReunion",
                    loveTiming: "ZLoveTiming",
                    date: 'Zfirstdate',
                    selbirth: 'ZSelBirth',
                    seldate: 'ZSelDate',
                    interview: 'Zinterview',
                    match: 'ZMatchAnalysis',
                    saza: 'Zsazatalk',
                    // wealth & love should usually be provided via storageKey prop
                };
                targetStorageKey = typeToKeyMap[fortuneType];
            }
            const historyItem = userData?.usageHistory?.[targetStorageKey];
            const aiResult = historyItem?.result;
            const question = historyItem?.question;


            const shareData = {
                displayName: targetProfile.displayName,
                birthDate: targetProfile.birthDate,
                isTimeUnknown: targetProfile.isTimeUnknown,
                gender: targetProfile.gender,
                aiResult: aiResult,
                userQuestion: question || historyItem,
            };

            // Compress using LZString for client-side legacy support
            const jsonStr = JSON.stringify(shareData);
            let shareUrl = '';

            // Hybrid Strategy:
            // If data is small (< 1000 chars), create direct client-side link (no expiration)
            // If data is large, use Vercel KV (7-day expiration)
            if (jsonStr.length < 1000) {
                const compressed = LZString.compressToEncodedURIComponent(jsonStr);
                // Direct link: /saju/share/[type]?data=...
                shareUrl = `${window.location.origin}/saju/share/${fortuneType}?data=${compressed}`;
            } else {
                // Server-side link: /saju/share/[type]/[id]
                const response = await fetch('/api/saju/share', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: jsonStr, // Send raw JSON string
                });

                if (!response.ok) throw new Error('Failed to generate short link');

                const result = await response.json();
                // Construct URL based on directory structure: /saju/share/[type]/[id]
                shareUrl = `${window.location.origin}/saju/share/${fortuneType}/${result.id}`;
            }

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
            const shareDataLink = {
                title: 'SAZA SAJU',
                text: language === 'ko' ? '사자(SAZA)에서 당신의 운세를 확인해보세요!' : 'Check your fortune at SAZA SAJU!',
                url: shareUrl, // Share the home page URL or current URL
            };

            // Try Native Share
            if (navigator.share) {
                try {
                    await navigator.share(shareDataLink);
                } catch (err) {
                    console.log('Error sharing:', err);
                }
            } else {
                // Fallback to Clipboard Copy
                try {
                    await navigator.clipboard.writeText(shareData.url);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                } catch (err) {
                    console.error('Failed to copy keys', err);
                }
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
                    <span>{language === 'ko' ? '결과 공유하기' : 'Send to Friend'}</span>
                </>
            )}
        </button>
    );
}
