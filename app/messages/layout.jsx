'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthContext } from '@/contexts/useAuthContext';

export default function MyPageLayout({ children }) {
    const { user, loadingUser, openLoginModal } = useAuthContext();
    const router = useRouter();
    const [isAuthorized, setIsAuthorized] = useState(false);

    useEffect(() => {
        // Wait for auth check to complete
        if (!loadingUser) {
            if (!user) {
                // Option 1: Redirect to Home
                // alert('로그인이 필요한 서비스입니다.');
                // router.push('/');

                // Option 2: Just show Login Modal (better UX)
                // openLoginModal();
                // setIsAuthorized(false); // stays false, showing loading/protected UI

                // As per user request "cannot enter", redirect is safer.
                alert('로그인이 필요한 페이지입니다.');
                router.push('/');
            } else {
                setIsAuthorized(true);
            }
        }
    }, [user, loadingUser, router]);

    // If loading or not authorized yet, show loading/spinner or nothing
    // If user is not logged in, they will be redirected, so we just show spinner until then
    if (loadingUser || !isAuthorized) {
        return (
            <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-gray-500 font-medium animate-pulse">Checking access...</p>
                </div>
            </div>
        );
    }

    return <>{children}</>;
}
