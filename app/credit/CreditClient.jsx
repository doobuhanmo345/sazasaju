'use client';
import { loadTossPayments, ANONYMOUS } from "@tosspayments/tosspayments-sdk";
import { useEffect, useState } from "react";
import { CircleStackIcon } from '@heroicons/react/24/solid';
import React from 'react';
import { useRouter } from 'next/navigation';
import {
    SparklesIcon,
    BoltIcon,
    ChatBubbleLeftRightIcon,
    ChartBarIcon
} from '@heroicons/react/24/outline';
import { useLanguage } from '@/contexts/useLanguageContext';
import { useUsageLimit } from '@/contexts/useUsageLimit';
import { useAuthContext } from '@/contexts/useAuthContext';
import BackButton from '@/ui/BackButton';
const clientKey = "live_ck_P9BRQmyarYYw2LoNY5NXrJ07KzLN";

export default function CreditClient() {
    const router = useRouter();
    const { language } = useLanguage();
    const { MAX_EDIT_COUNT } = useUsageLimit();
    const { user, userData } = useAuthContext();
    const isKo = language === 'ko';

    // [NEW] Log user visit to credit page
    const hasLogged = React.useRef(false);

    React.useEffect(() => {
        if (!user || !userData) return;

        // Exclude admins and super_admins
        if (userData.role === 'admin' || userData.role === 'super_admin') return;

        if (hasLogged.current) return;
        hasLogged.current = true;

        const logVisit = async () => {
            try {
                const { doc, setDoc, collection, serverTimestamp } = await import('firebase/firestore');
                const { db } = await import('@/lib/firebase');

                // Generate a unique ID for the log entry
                const newDocRef = doc(collection(db, 'menu_click_logs'));
                const uniqueId = newDocRef.id;

                await setDoc(doc(db, 'menu_click_logs', `credit_${uniqueId}`), {
                    userUid: user.uid,
                    userNickname: user.displayName || userData.displayName,
                    enteredAt: serverTimestamp(),
                }, { merge: true });
            } catch (error) {
                // console.error('Failed to log credit page visit:', error);
            }
        };

        logVisit();
    }, [user, userData?.role]);

    const benefits = [
        {
            icon: <CircleStackIcon className="w-5 h-5 text-amber-500" />,
            title: isKo ? '매일 리셋되는 무료 혜택' : 'Daily Free Credits',
            desc: isKo
                ? `매일 ${MAX_EDIT_COUNT}회의 무료 분석 기회`
                : `${MAX_EDIT_COUNT} free credits every day`,
        },
        {
            icon: <ChartBarIcon className="w-5 h-5 text-blue-500" />,
            title: isKo ? '기한 없는 유료 크레딧' : 'Permanent Credits',
            desc: isKo
                ? '구매하신 크레딧은 사라지지 않아요'
                : 'Purchased credits never expire',
        },
        {
            icon: <ChatBubbleLeftRightIcon className="w-5 h-5 text-purple-500" />,
            title: isKo ? '합리적인 프리미엄 기회' : 'Affordable Premium',
            desc: isKo
                ? '단돈 1000원부터 시작하는 고민 해결'
                : 'Start deep dives from just ₩1000',
        }
    ];

    const [selectedProduct, setSelectedProduct] = useState(null);

    const products = [
        {
            id: 'credit_1',
            name: isKo ? '1 크레딧' : '1 Credit',
            subName: isKo ? '라이트' : 'Lite',
            credits: 1,
            price: 1000,
            originalPrice: 1000,
            discount: '',
            desc: isKo ? ['가벼운 단일 사주 분석', '사자톡 추가 질문'] : ['1 analysis ticket', 'Good for quick questions']
        },
        {
            id: 'credit_3',
            name: isKo ? '2+1 크레딧' : '2+1 Credits',
            subName: isKo ? '베스트' : 'Best',
            credits: 3,
            price: 2000,
            originalPrice: 3000,
            discount: '33%',
            desc: isKo ? ['3개의 테마 사주 분석', '보너스 1 크레딧 제공'] : ['Most popular choice', 'Provides 3 tickets'],
            recommended: true,
            popular: true
        },
        {
            id: 'credit_5',
            name: isKo ? '5+5 크레딧' : '5+5 Credits',
            subName: isKo ? '프로' : 'Pro',
            credits: 10,
            price: 5000,
            originalPrice: 10000,
            discount: '50%',
            desc: isKo ? ['전체 테마 사주 분석', '보너스 5 크레딧 제공'] : ['Best value package', 'Deep and thorough analysis']
        }
    ];
    useEffect(() => {
        if (!selectedProduct && products.length > 0) {
            setSelectedProduct(products[0]);
        }
    }, []);

    const handlePayment = async () => {
        if (!user) {
            alert("로그인이 필요합니다.");
            return;
        }

        if (!selectedProduct) {
            alert("상품을 선택해주세요.");
            return;
        }

        try {
            const tossPayments = await loadTossPayments(clientKey);
            const customerKey = user.uid.replace(/[^a-zA-Z0-9-_.= @]/g, '_');
            const payment = tossPayments.payment({ customerKey });

            const safeUid = user.uid.replace(/[^a-zA-Z0-9-_]/g, '_');
            const orderId = `ORD_${safeUid}_${Date.now()}`.substring(0, 64);

            await payment.requestPayment({
                method: "CARD",
                amount: {
                    currency: "KRW",
                    value: selectedProduct.price,
                },
                orderId: orderId,
                orderName: selectedProduct.name,
                successUrl: `${window.location.origin}/credit/success?userId=${user.uid}&creditsToAdd=${selectedProduct.credits}`,
                failUrl: `${window.location.origin}/credit/fail`,
                customerEmail: user.email,
                customerName: user.displayName || "Customer",
            });
        } catch (error) {
            console.error('결제 요청 에러:', error);
        }
    };
    //결제



    return (
        <div className="min-h-screen bg-white dark:bg-slate-950 font-pretendard pb-20">
            <BackButton title={isKo ? '크레딧 구매' : 'Get Credits'} />

            <div className="max-w-4xl mx-auto px-6 pt-24">
                {/* Simple Hero */}
                <div className="mb-14 text-center">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 dark:bg-indigo-900/30 rounded-full text-indigo-600 dark:text-indigo-400 text-[10px] font-black uppercase tracking-widest mb-4">
                        <SparklesIcon className="w-3.5 h-3.5" />
                        <span>Premium Credits</span>
                    </div>
                    <h2 className="text-3xl font-black leading-tight tracking-tight mb-4 text-slate-800 dark:text-white">
                        {isKo ? (
                            <>
                                오늘 무료 분석이 {MAX_EDIT_COUNT - userData?.editCount} 회 남았습니다.<br />
                                <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                                    지금 바로 더 보고싶다면?
                                </span>
                            </>
                        ) : (
                            'Need more than daily credits?'
                        )}
                    </h2>
                    <p className="text-slate-400 dark:text-slate-500 text-sm font-medium leading-relaxed max-w-sm mx-auto">
                        {isKo
                            ? `매일 제공되는 무료 혜택을 모두 사용하셨나요? 크레딧을 추가로 충전하면 기다림 없이 더 깊은 운명 분석을 받아볼 수 있습니다.`
                            : `Used up all your daily free benefits? Recharge credits to continue your destiny analysis without limits.`}
                    </p>
                </div>

                {/* Minimal Benefits Grid */}
                <div className="grid grid-cols-1 gap-4 mb-16 max-w-xl mx-auto">
                    {benefits.map((benefit, idx) => (
                        <div key={idx} className="flex items-start gap-4 p-5 rounded-3xl bg-slate-50/50 dark:bg-slate-900/40 border border-slate-100/50 dark:border-white/[0.03]">
                            <div className="shrink-0 w-12 h-12 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center shadow-sm">
                                {benefit.icon}
                            </div>
                            <div className="flex flex-col justify-center">
                                <h4 className="font-black text-sm text-slate-800 dark:text-white mb-1">{benefit.title}</h4>
                                <p className="text-xs text-slate-400 dark:text-slate-500 font-medium leading-tight">{benefit.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Pricing Selection */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
                    {products.map((product) => {
                        const isSelected = selectedProduct?.id === product.id;
                        return (
                            <div
                                key={product.id}
                                onClick={() => setSelectedProduct(product)}
                                className={`relative rounded-[2.5rem] border-2 cursor-pointer transition-all duration-300 flex flex-col h-full overflow-hidden ${isSelected
                                    ? 'border-indigo-600 md:scale-105 shadow-xl md:z-10 bg-white dark:bg-slate-900'
                                    : 'border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-indigo-200'
                                    }`}
                            >
                                {product.recommended && (
                                    <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-[10px] font-black px-4 py-1.5 rounded-b-xl uppercase tracking-widest shadow-md whitespace-nowrap z-10">
                                        Best Choice
                                    </div>
                                )}

                                <div className="p-8 pb-6 bg-white dark:bg-transparent">
                                    <div className="flex items-center justify-between mb-8">
                                        <div className={`p-3.5 rounded-2xl transition-colors ${isSelected ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 dark:shadow-none' : 'bg-slate-50 dark:bg-slate-800 text-slate-400'}`}>
                                            <CircleStackIcon className="w-6 h-6 stroke-[1.5]" />
                                        </div>
                                        <div className="text-right">
                                            {product.price !== product.originalPrice && (
                                                <div className="text-slate-300 dark:text-slate-600 text-[11px] line-through font-bold mb-0.5">₩{product.originalPrice.toLocaleString()}</div>
                                            )}
                                            <div className="text-xl font-black text-slate-900 dark:text-white">₩{product.price.toLocaleString()}</div>
                                        </div>
                                    </div>

                                    <div className="mb-2 flex items-center gap-2">
                                        <span className="font-black text-2xl text-slate-800 dark:text-white">{product.name}</span>
                                        {product.price !== product.originalPrice && (
                                            <span className="text-[10px] bg-rose-100 dark:bg-rose-900/50 text-rose-600 dark:text-rose-400 font-black px-1.5 py-0.5 rounded">-{product.discount}</span>
                                        )}
                                    </div>

                                    <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">{product.subName}</span>
                                </div>

                                <div className={`p-8 pt-6 mt-auto border-t ${isSelected ? 'bg-indigo-50/50 dark:bg-indigo-900/20 border-indigo-100 dark:border-indigo-500/20' : 'bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-800'}`}>
                                    <ul className="space-y-2.5">
                                        {product.desc.map((descLine, i) => (
                                            <li key={i} className="flex items-start gap-2.5">
                                                <div className={`shrink-0 w-1.5 h-1.5 rounded-full mt-1.5 ${isSelected ? 'bg-indigo-500' : 'bg-slate-300 dark:bg-slate-600'}`} />
                                                <span className={`text-sm font-medium leading-relaxed ${isSelected ? 'text-indigo-900 dark:text-indigo-200' : 'text-slate-500 dark:text-slate-400'}`}>
                                                    {descLine}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        );
                    })}
                </div>
                <div className="flex justify-center">
                    <button
                        className="w-full md:w-96 py-5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-[2rem] font-black text-base transition-all active:scale-[0.98] shadow-xl shadow-slate-200 dark:shadow-none"
                        disabled={!selectedProduct}
                        onClick={handlePayment}
                    >
                        {selectedProduct ? `${selectedProduct.price.toLocaleString()}원 결제하기` : '상품을 선택해주세요'}
                    </button>
                </div>
                <p className="mt-4 text-xs text-center text-slate-400">
                    위 주문 내용을 확인하였으며, 정보 제공 등에 동의합니다.
                </p>





                {/* Footer Note */}
                <p className="mt-12 text-center text-xs text-slate-400 font-medium tracking-tight">
                    {isKo
                        ? '구매하신 크레딧은 유효기간 없이 영구적으로 사용 가능합니다.'
                        : 'Purchased credits have no expiration date and can be used permanently.'}
                </p>
            </div>
        </div>
    );
}
