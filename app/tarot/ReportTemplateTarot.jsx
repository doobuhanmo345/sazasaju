'use client';

import { useLoading } from '@/contexts/useLoadingContext';
import { useAuthContext } from '@/contexts/useAuthContext';
import { useState, useEffect } from 'react';
import { parseAiResponse } from '@/utils/helpers';
import ViewTarotResult from '@/app/tarot/ViewTarotResult';

/**
 * Shared Report Template for Tarot.
 * @param {string} storageKey - The key in userData.usageHistory (e.g., 'ZtarotLove', 'ZtarotMoney')
 */
export default function ReportTemplateTarot({ storageKey }) {
    const { aiResult } = useLoading();
    const { userData } = useAuthContext();
    const [data, setData] = useState(null);
    const [cardInfo, setCardInfo] = useState({ id: null });

    useEffect(() => {
        // 1. Context Result (Fresh Analysis)
        if (aiResult) {
            const parsedData = parseAiResponse(aiResult);
            if (parsedData) {
                setData(parsedData);
            }
        }

        // 2. Persistence (Saved Result)
        if (userData && !aiResult && storageKey) {
            const saved = userData?.usageHistory?.[storageKey];
            if (saved && saved.result) {
                const parsed = parseAiResponse(saved.result);
                if (parsed) {
                    setData(parsed);
                    // Reconstruct card info if available
                    if (saved.cardId) {
                        setCardInfo({
                            id: saved.cardId,
                            kor: saved.cardKor,
                            name: saved.cardName
                        });
                    }
                }
            }
        }
    }, [aiResult, userData, storageKey]);

    // Loading State
    if (!data) {
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
            cardPicked={cardInfo.id ? cardInfo : {}}
            loading={false}
        />
    );
}
