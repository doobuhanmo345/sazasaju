'use client';

import { useLoading } from '@/contexts/useLoadingContext';
import { useAuthContext } from '@/contexts/useAuthContext';
import { useState, useEffect } from 'react';
import { parseAiResponse } from '@/utils/helpers';
import ViewTarotResult from '@/app/tarot/ViewTarotResult';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/useLanguageContext';
import { doc, updateDoc, increment, deleteField } from 'firebase/firestore';
import { db } from '@/lib/firebase';

// Map storageKey to parent page path
const getParentPath = (storageKey) => {
    const pathMap = {
        'tarotDaily': '/tarot/tarotdaily',
        'tarotLove': '/tarot/tarotlove',
        'tarotMoney': '/tarot/tarotmoney',
        'tarotCounseling': '/tarot/tarotcounseling',
    };
    return pathMap[storageKey] || '/tarot';
};

/**
 * Shared Report Template for Tarot.
 * @param {string} storageKey - The key in userData.usageHistory (e.g., 'tarotLove', 'tarotMoney')
 */
export default function ReportTemplateTarot({ storageKey }) {
    const { aiResult } = useLoading();
    const { userData } = useAuthContext();
    const [data, setData] = useState(null);
    const [cardInfo, setCardInfo] = useState({ id: null });
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const { language } = useLanguage();

    useEffect(() => {
        // 1. Context Result (Fresh Analysis)
        if (aiResult) {
            const parsedData = parseAiResponse(aiResult);
            if (parsedData) {
                setData(parsedData);
                setLoading(false);
                return;
            }
        }

        // 2. Persistence (Saved Result)
        if (userData && !aiResult && storageKey) {
            const saved = userData?.usageHistory?.[storageKey];
            if (saved && saved.result) {
                const parsed = parseAiResponse(saved.result);

                const isValid =
                    parsed &&
                    parsed.title &&
                    parsed.subTitle &&
                    parsed.cardName &&
                    parsed.tags?.length > 0 &&
                    parsed.description &&
                    parsed.analysisTitle &&
                    parsed.analysisList?.length > 0 &&
                    parsed.adviceTitle &&
                    parsed.adviceList?.length > 0 &&
                    parsed.footerTags?.length > 0;

                if (isValid) {
                    setData(parsed);
                    // Reconstruct card info if available
                    if (saved.cardId) {
                        setCardInfo({
                            id: saved.cardId,
                            kor: saved.cardKor,
                            name: saved.cardName
                        });
                    }
                    setLoading(false);
                } else {
                    const restoreCredit = async () => {
                        if (userData?.uid) {
                            const userRef = doc(db, 'users', userData.uid);
                            try {
                                await updateDoc(userRef, {
                                    Credits: increment(1),
                                    [`usageHistory.${storageKey}`]: deleteField(),
                                });
                                alert(
                                    language !== 'ko'
                                        ? '1 Credit has been refunded due to incomplete analysis data. Please try again.'
                                        : '분석 에러로 데이터가 충분하지 않아 1 크레딧이 환불되었습니다. 다시 시도해주세요.'
                                );
                            } catch (error) {
                                console.error('Failed to restore credit:', error);
                            }
                        }
                        router.push(getParentPath(storageKey));
                    };
                    restoreCredit();
                }
            } else {
                // No data -> redirect
                router.push(getParentPath(storageKey));
            }
        }
    }, [aiResult, userData, storageKey, router, language]);

    // Loading State
    if (loading || !data) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-6">
                <div className="relative w-12 h-12">
                    <div className="absolute inset-0 border-2 border-purple-100 rounded-full"></div>
                    <div className="absolute inset-0 border-2 border-t-purple-500 rounded-full animate-spin"></div>
                </div>
                <p className="text-purple-900/60 font-medium animate-pulse tracking-widest text-sm">
                    Reading your aura...
                </p>
            </div>
        );
    }

    return (
        <ViewTarotResult
            data={data}
            cardPicked={cardInfo?.id ? cardInfo : {}}
            loading={false}
        />
    );
}
