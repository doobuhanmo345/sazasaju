'use client';

import React, { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthContext } from '@/contexts/useAuthContext';
import { useLanguage } from '@/contexts/useLanguageContext';
import { SiGoogle, SiKakaotalk } from "react-icons/si";
import { SparklesIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';

function LoginContent() {
    const { login, user, loadingUser } = useAuthContext();
    const { language } = useLanguage();
    const router = useRouter();
    const searchParams = useSearchParams();
    const returnUrl = searchParams.get('returnUrl') || '/';

    useEffect(() => {
        if (!loadingUser && user) {
            router.replace(returnUrl);
        }
    }, [user, loadingUser, returnUrl, router]);

    const handleProviderLogin = async (provider) => {
        try {
            await login(provider);
            // AuthContext will handle state change, and useEffect will redirect
        } catch (err) {
            console.error('Login Error:', err);
        }
    };

    if (loadingUser) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white dark:bg-slate-950">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 relative overflow-hidden">
            {/* Decorative Background Elements */}
            <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-indigo-500/10 to-transparent pointer-events-none" />
            <div className="absolute -top-24 -left-24 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl" />
            <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />

            <div className="w-full max-w-md relative z-10">
                {/* Logo/Icon */}
                <div className="flex flex-col items-center mb-24">

                    <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter mb-2">
                        SAZASAJU
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 font-medium text-center break-keep">
                        {language === 'ko'
                            ? '당신의 운명을 가장 명확하게 풀이해 드립니다'
                            : 'The clearest interpretation for your destiny'}
                    </p>

                </div>

                {/* Leaning Saza mascot */}
                <div className="relative h-28 -mb-10 z-20 pointer-events-none">
                    <div className="absolute -top-[100px] left-1/2 -translate-x-1/2 bottom-0 w-48 h-48">
                        <img
                            src="/images/brand/login_saza.png"
                            className="w-full h-full object-contain"
                            alt="leaning mascot"
                        />
                    </div>
                </div>

                {/* Login Box */}
                <div className="bg-white dark:bg-slate-900/50 backdrop-blur-xl rounded-[2.5rem] p-8 shadow-2xl shadow-indigo-500/10 border border-white/20 dark:border-slate-800 relative z-10">
                    <div className="text-center mb-8">
                        <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-2">
                            {language === 'ko' ? '로그인 / 시작하기' : 'Join or Sign In'}
                        </h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            {language === 'ko' ? '간편 로그인으로 서비스를 시작하세요' : 'Continue with simple social login'}
                        </p>
                    </div>

                    <div className="space-y-4">
                        {/* Kakao */}
                        <button
                            onClick={() => handleProviderLogin('kakao')}
                            className="w-full h-14 bg-[#FEE500] hover:bg-[#FDD835] text-[#191919] rounded-2xl flex items-center justify-center gap-4 font-bold transition-all active:scale-[0.97] shadow-lg shadow-yellow-500/10 group"
                        >
                            <SiKakaotalk className="w-6 h-6 transition-transform group-hover:scale-110" />
                            <span>{language === 'ko' ? '카카오로 계속하기' : 'Continue with Kakao'}</span>
                        </button>

                        {/* Google */}
                        <button
                            onClick={() => handleProviderLogin('google')}
                            className="w-full h-14 bg-white dark:bg-slate-800 text-slate-700 dark:text-white rounded-2xl flex items-center justify-center gap-4 font-bold transition-all active:scale-[0.97] shadow-lg shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-700 group"
                        >
                            <SiGoogle className="w-5 h-5 text-[#4285F4] transition-transform group-hover:scale-110" />
                            <span>{language === 'ko' ? 'Google로 계속하기' : 'Continue with Google'}</span>
                        </button>
                    </div>

                    <p className="mt-10 text-center text-[10px] text-slate-400 dark:text-slate-500 leading-relaxed uppercase tracking-widest font-bold">
                        {language === 'ko'
                            ? 'By signing in, you agree to our Terms and Privacy Policy'
                            : 'By signing in, you agree to our Terms and Privacy Policy'}
                    </p>
                </div>

                {/* Back navigation or Home link */}
                <button
                    onClick={() => router.push('/')}
                    className="mt-8 mx-auto flex items-center gap-2 text-slate-400 hover:text-indigo-600 transition-colors text-sm font-bold"
                >
                    {language === 'ko' ? '홈으로 돌아가기' : 'Back to Home'}
                </button>
            </div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-white dark:bg-slate-950">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        }>
            <LoginContent />
        </Suspense>
    );
}
