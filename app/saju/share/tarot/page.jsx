'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import TarotShareTemplate from './TarotShareTemplate';
function ShareContent() {
    const searchParams = useSearchParams();
    const [shareData, setShareData] = useState(null);
    const [error, setError] = useState(null);
    const { language } = useLanguage();
    const isKo = language === 'ko'
    useEffect(() => {
        const dataParam = searchParams.get('data');
        if (dataParam) {
            try {
                const decodedDataStr = decodeURIComponent(atob(dataParam).split('').map(c =>
                    '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
                ).join(''));
                const parsedData = JSON.parse(decodedDataStr);
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
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50">
                <div className="text-center p-8 bg-white rounded-xl shadow-lg">
                    <p className="text-red-600 font-semibold">{error}</p>
                    <a href="/" className="mt-4 inline-block text-purple-600 hover:underline">
                        {isKo ? '홈으로 돌아가기' : 'Go to Home'}
                    </a>
                </div>
            </div>
        );
    }

    if (!shareData) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            </div>
        );
    }

    return <TarotShareTemplate shareData={shareData} language={language} />;
}

export default function TarotSharePage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            </div>
        }>
            <ShareContent />
        </Suspense>
    );
}
