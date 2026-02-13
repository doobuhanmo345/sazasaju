'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircleIcon } from '@heroicons/react/24/solid';
import Link from 'next/link';
import { useAuthContext } from '@/contexts/useAuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function SuccessPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { user, refreshUserData } = useAuthContext(); // refreshUserData 함수 필요
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [addedCredits, setAddedCredits] = useState(0);
    const [totalCredits, setTotalCredits] = useState(null); // Re-add this state
    const hasConfirmed = useRef(false);

    useEffect(() => {
        const confirm = async () => {
            if (hasConfirmed.current) return;
            hasConfirmed.current = true;

            const paymentKey = searchParams.get('paymentKey');
            const orderId = searchParams.get('orderId');
            const amount = searchParams.get('amount');
            const userId = searchParams.get('userId');
            const creditsToAdd = parseInt(searchParams.get('creditsToAdd'));

            if (!paymentKey || !orderId || !amount || !userId || !creditsToAdd) {
                setError('결제 정보가 올바르지 않습니다.');
                setLoading(false);
                return;
            }

            try {
                // 서버에 결제 확인 요청
                const response = await fetch('/api/payments/confirm', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        paymentKey,
                        orderId,
                        amount: parseInt(amount),
                        userId,
                        creditsToAdd,
                    }),
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || '결제 확인에 실패했습니다.');
                }

                const result = await response.json();
                console.log('✅결제 확인 성공:', result);

                setAddedCredits(creditsToAdd);

                // Use the returned totalCredits directly to avoid race condition
                if (result.totalCredits !== undefined) {
                    setTotalCredits(result.totalCredits);
                } else {
                    // Fallback to fetch if API didn't return it (though it should now)
                    if (user) {
                        const userDocRef = doc(db, 'users', userId);
                        const userDoc = await getDoc(userDocRef);
                        if (userDoc.exists()) {
                            const userData = userDoc.data();
                            console.log('✅업데이트된 크레딧 (Fallback):', userData.credits);
                            setTotalCredits(userData.credits);
                        }
                    }
                }

                // Still refresh context for other components
                if (refreshUserData) {
                    await refreshUserData();
                }


                setLoading(false);

            } catch (err) {
                console.error('😡Payment Confirmation Error:', err);
                setError(err.message);
                setLoading(false);

                setTimeout(() => {
                    router.push(`/credit/fail?message=${encodeURIComponent(err.message)}`);
                }, 2000);
            }
        };

        confirm();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                    <p className="text-slate-600 dark:text-slate-400">결제 확인 중...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center px-4">
                <div className="max-w-md w-full bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 text-center">
                    <div className="text-red-500 mb-4">
                        <svg className="w-16 h-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                        결제 확인 실패
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400 mb-6">
                        {error}
                    </p>
                    <Link
                        href="/credit/store"
                        className="inline-block px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 transition-colors"
                    >
                        다시 시도
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 pb-28">
            <div className="max-w-sm w-full bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none animate-in fade-in zoom-in-95 duration-500">

                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-50 dark:bg-indigo-900/20 mb-5">
                        <CheckCircleIcon className="w-8 h-8 text-indigo-500" />
                    </div>
                    <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">
                        결제 완료
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">
                        크레딧 충전이 성공적으로<br />완료되었습니다.
                    </p>
                </div>

                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-6 text-center mb-8">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                        Total Credits
                    </p>
                    <div className="flex items-center justify-center gap-1.5">
                        <span className="text-3xl font-black text-slate-900 dark:text-white">
                            +{addedCredits}
                        </span>
                        <span className="text-sm font-bold text-slate-400 mt-2">C</span>
                    </div>
                </div>

                <Link
                    href="/"
                    className="block w-full py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm transition-all text-center shadow-lg shadow-indigo-200 dark:shadow-none"
                >
                    확인
                </Link>
            </div>
        </div>
    );
}