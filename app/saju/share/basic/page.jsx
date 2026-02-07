'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import BasicShareTemplate from './BasicShareTemplate';
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
                if (!decompressed) {
                    throw new Error('Decompression failed');
                }
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
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50">
                <div className="text-center p-8 bg-white rounded-xl shadow-lg">
                    <p className="text-red-600 font-semibold">{error}</p>
                    <a href="/" className="mt-4 inline-block text-indigo-600 hover:underline">
                        홈으로 돌아가기
                    </a>
                </div>
            </div>
        );
    }

    if (!shareData) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return <BasicShareTemplate shareData={shareData} language="ko" />;
}

export default function BasicSharePage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        }>
            <ShareContent />
        </Suspense>
    );
}
