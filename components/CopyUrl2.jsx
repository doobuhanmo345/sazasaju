'use client';

import React from 'react';
import { useLanguage } from '@/contexts/useLanguageContext';
import { db } from '@/lib/firebase';
import { setDoc, doc, serverTimestamp } from 'firebase/firestore';
import { useAuthContext } from '@/contexts/useAuthContext';
import { useRouter } from 'next/navigation';
import { SiKakaotalk } from "react-icons/si";

export default function CopyUrl2({ saju, from }) {
    const { language } = useLanguage();
    const { login } = useAuthContext();
    const router = useRouter();
    const isKo = language === 'ko';

    const handleCopy = async () => {
        // 1. 링크 복사
        const url = typeof window !== 'undefined' ? window.location.origin : 'https://sazasaju.com';
        await navigator.clipboard.writeText(url);
        alert(isKo ? '주소가 복사되었습니다!' : 'Link copied to clipboard!');

        // 2. 로그 저장
        try {
            await setDoc(doc(db, 'copy_url_logs', new Date().toISOString()), {
                saju: saju || {},
                language: language,
                origin: from || 'unknown',
                createdAt: serverTimestamp(),
            });
        } catch (e) {
            console.error('로그 저장 실패:', e);
        }
    };

    const handleKakaoLogin = async () => {
        try {
            await login('kakao');
            router.push('/');
        } catch (error) {
            console.error('Kakao Login/Redirect failed:', error);
        }
    };

    return (
        <div className="mt-4 bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-indigo-100 dark:border-slate-700">
            <p className="text-[14px] text-slate-600 dark:text-slate-300 mb-3 font-medium leading-relaxed">
                {isKo
                    ? '더 많은 운세와 맞춤 상담이 필요하신가요? 사자사주에 로그인하고 무료로 확인해보세요!'
                    : 'Need more insights? Login to Saza Saju for full readings!'}
            </p>

            <div className="space-y-2">
                {/* Kakao Login Button */}
                <button
                    onClick={handleKakaoLogin}
                    className="w-full flex items-center justify-center gap-2 p-3 bg-[#FEE500] hover:bg-[#FDD835] text-[#191919] rounded-xl font-bold transition-all active:scale-[0.98] shadow-sm"
                >
                    <SiKakaotalk className="w-5 h-5" />
                    <span className="text-[14px]">{isKo ? '카카오로 3초 만에 시작하기' : 'Continue with Kakao'}</span>
                </button>

                {/* Copy Link Button */}
                <button
                    onClick={handleCopy}
                    className="w-full flex items-center justify-between p-3 bg-indigo-50 dark:bg-slate-700 rounded-xl border border-indigo-100 dark:border-slate-600 active:scale-[0.98] transition-all group"
                >
                    <span className="text-[13px] text-indigo-600 dark:text-indigo-300 font-bold font-mono truncate px-2">
                        {typeof window !== 'undefined' ? window.location.host : 'sazasaju.com'}
                    </span>
                    <span className="shrink-0 bg-indigo-600 text-white text-[12px] font-bold px-3 py-1.5 rounded-lg shadow-sm group-hover:bg-indigo-700">
                        {isKo ? '복사' : 'Copy'}
                    </span>
                </button>
            </div>
        </div>
    );
}
