'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import YearlyShareTemplate from './YearlyShareTemplate';
import LZString from 'lz-string';

function ShareContent() {
    const searchParams = useSearchParams();
    const [shareData, setShareData] = useState(null);
    const [error, setError] = useState(null);

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
                setError('유효하지 않은 공유 링크입니다.');
            }
        } else {
            setError('공유 데이터가 없습니다.');
        }
    }, [searchParams]);

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-orange-50">
                <div className="text-center p-8 bg-white rounded-xl shadow-lg">
                    <p className="text-red-600 font-semibold">{error}</p>
                    <a href="/" className="mt-4 inline-block text-amber-600 hover:underline">
                        홈으로 돌아가기
                    </a>
                </div>
            </div>
        );
    }
    console.log(shareData)

    if (!shareData) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-orange-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
            </div>
        );
    }

    return <YearlyShareTemplate shareData={shareData} language="ko" />;
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
