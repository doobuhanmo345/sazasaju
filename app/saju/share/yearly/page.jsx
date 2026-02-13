'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import YearlyShareTemplate from './YearlyShareTemplate';
import LZString from 'lz-string';
import { useLanguage } from '@/contexts/useLanguageContext';

function ShareContent() {
    const searchParams = useSearchParams();
    const [shareData, setShareData] = useState(null);
    const [error, setError] = useState(null);
    const { language } = useLanguage();
    const isKo = language === 'ko'
    useEffect(() => {
        const compressedData = searchParams.get('data');
        if (compressedData) {
            try {
                const decompressed = LZString.decompressFromEncodedURIComponent(compressedData);
                if (!decompressed) throw new Error('Decompression failed');
                const parsedData = JSON.parse(decompressed);
                setShareData(parsedData);
            } catch (err) {
                console.error('Failed to decode share data:', err);
                setError(isKo ? '유효하지 않은 공유 링크입니다.' : 'Invalid share link.');
            }
        } else {
            setError(isKo ? '공유 데이터가 없습니다.' : 'No share data.');
        }
    }, [searchParams]);

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-orange-50">
                <div className="text-center p-8 bg-white rounded-xl shadow-lg">
                    <p className="text-red-600 font-semibold">{error}</p>
                    <a href="/" className="mt-4 inline-block text-amber-600 hover:underline">
                        {isKo ? '홈으로 돌아가기' : 'Go to Home'}
                    </a>
                </div>
            </div>
        );
    }

    if (!shareData) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-orange-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
            </div>
        );
    }

    return <YearlyShareTemplate shareData={shareData} language={language} />;
}

export default function YearlySharePage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-orange-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
            </div>
        }>
            <ShareContent />
        </Suspense>
    );
}
