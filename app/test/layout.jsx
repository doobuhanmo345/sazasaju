'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthContext } from '@/contexts/useAuthContext';

export default function AdminLayout({ children }) {
    const { user, userData, loadingUser } = useAuthContext();
    const router = useRouter();
    const [isAuthorized, setIsAuthorized] = useState(false);

    useEffect(() => {
        if (!loadingUser) {
            if (!user) {
                alert('로그인이 필요합니다.');
                router.push('/');
                return;
            }

            if (userData?.role !== 'admin' && userData?.role !== 'super_admin') {
                alert('관리자 권한이 필요합니다.');
                router.push('/');
                return;
            }

            setIsAuthorized(true);
        }
    }, [user, userData, loadingUser, router]);

    if (loadingUser || !isAuthorized) {
        return (
            <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-gray-500 font-medium animate-pulse">Checking permissions...</p>
                </div>
            </div>
        );
    }

    return <>{children}</>;
}
