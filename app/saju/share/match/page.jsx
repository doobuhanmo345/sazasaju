'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import MatchShareTemplate from './MatchShareTemplate';
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
                setError('Failed to load shared data.');
            }
        }
    }, [searchParams]);

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <div className="bg-red-50 text-red-500 p-4 rounded-lg">
                    {error}
                </div>
            </div>
        );
    }

    if (!shareData) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-600"></div>
            </div>
        );
    }

    return <MatchShareTemplate shareData={shareData} />;
}

export default function MatchSharePage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-600"></div></div>}>
            <ShareContent />
        </Suspense>
    );
}
