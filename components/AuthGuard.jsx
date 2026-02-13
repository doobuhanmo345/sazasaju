'use client';

import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthContext } from '@/contexts/useAuthContext';

/**
 * AuthGuard - Protected route wrapper
 * Redirects to /login if user is not authenticated.
 * Also handles routes ending in /result.
 */
export default function AuthGuard({ children }) {
    const { user, loadingUser } = useAuthContext();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        // Check if path should be protected
        const isMyPage = pathname.startsWith('/mypage');
        const isProfilePage = pathname.startsWith('/profile');
        const isResultPage = pathname.endsWith('/result');

        const shouldProtect = isMyPage || isProfilePage || isResultPage;

        if (!loadingUser && !user && shouldProtect) {
            // Redirect to login with returnUrl
            router.push(`/login?returnUrl=${encodeURIComponent(pathname)}`);
        }
    }, [user, loadingUser, pathname, router]);

    // Determine if we should show a loading state or nothing while redirecting
    const isMyPage = pathname.startsWith('/mypage');
    const isProfilePage = pathname.startsWith('/profile');
    const isResultPage = pathname.endsWith('/result');
    const shouldProtect = isMyPage || isProfilePage || isResultPage;

    if (loadingUser && shouldProtect) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-slate-950 animate-in fade-in duration-500">
                <div className="relative w-16 h-16 mb-6">
                    <div className="absolute inset-0 border-4 border-indigo-100 dark:border-indigo-900 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-indigo-600 rounded-full border-t-transparent animate-spin"></div>
                </div>
                <p className="text-slate-400 font-bold text-sm tracking-widest uppercase">
                    Verifying Access...
                </p>
            </div>
        );
    }

    // If we should protect and no user, don't render children (Effect will redirect)
    if (!user && shouldProtect) {
        return null;
    }

    return children;
}
