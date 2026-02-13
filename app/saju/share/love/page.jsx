'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import LZString from 'lz-string';
import LoveShareTemplate from './LoveShareTemplate';
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
            <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
                <div className="text-center bg-white p-8 rounded-2xl shadow-lg max-w-sm w-full">
                    <div className="w-12 h-12 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                        </svg>
                    </div>
                    <p className="text-gray-800 font-bold mb-2">{error}</p>
                    <a href="/" className="text-sm text-indigo-600 font-bold hover:underline">
                        {isKo ? '홈으로 돌아가기' : 'Go to Home'}
                    </a>
                </div>
            </div>
        );
    }

    if (!shareData) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return <LoveShareTemplate shareData={shareData} language={language} />;
}

export default function LoveSharePage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
            </div>
        }>
            <ShareContent />
        </Suspense>
    );
}
