'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import {
    SparklesIcon,
    BoltIcon,
    ChatBubbleLeftRightIcon,
    ChartBarIcon,
    ChevronLeftIcon,
    ClockIcon
} from '@heroicons/react/24/outline';
import { useLanguage } from '@/contexts/useLanguageContext';
import { useUsageLimit } from '@/contexts/useUsageLimit';

export default function CreditInfoPage() {
    const router = useRouter();
    const { language } = useLanguage();
    const { MAX_EDIT_COUNT } = useUsageLimit();
    const isKo = language === 'ko';

    const benefits = [
        {
            icon: <BoltIcon className="w-5 h-5 text-amber-500" />,
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
                ? '단돈 990원부터 시작하는 고민 해결'
                : 'Start deep dives from just ₩990',
        }
    ];

    const plans = [
        {
            name: isKo ? '라이트' : 'Lite',
            credits: '1',
            price: '990',
            originalPrice: '1500',
            discount: '34%',
        },
        {
            name: isKo ? '베스트' : 'Best',
            credits: '3',
            price: '1990',
            originalPrice: '3990',
            discount: '50%',
            recommended: true,
        },
    ];

    return (
        <div className="min-h-screen bg-white dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100 pb-20">
            {/* Navbar Style Header */}
            <div className="sticky top-0 z-30 bg-white/90 dark:bg-slate-950/90 backdrop-blur-sm">
                <div style={{ paddingTop: 'env(safe-area-inset-top)' }} />
                <div className="max-w-xl mx-auto px-6 h-14 flex items-center justify-between">
                    <button
                        onClick={() => router.back()}
                        className="p-1 -ml-1 hover:opacity-60 transition-opacity"
                    >
                        <ChevronLeftIcon className="w-6 h-6 stroke-2" />
                    </button>
                    <h1 className="text-xl font-bold tracking-tight">{isKo ? '크레딧 구매' : 'Get Credits'}</h1>
                    <div className="w-8" /> {/* Spacer for balance */}
                </div>
            </div>

            <div className="max-w-xl mx-auto px-6 py-10">
                {/* Simple Hero */}
                <div className="mb-14">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 dark:bg-indigo-900/30 rounded-full text-indigo-600 dark:text-indigo-400 text-sm font-black uppercase tracking-widest mb-4">
                        <SparklesIcon className="w-3.5 h-3.5" />
                        <span>Premium Credits</span>
                    </div>
                    <h2 className="text-4xl font-black leading-tight tracking-tight mb-4">
                        {isKo ? (
                            <>
                                하루 {MAX_EDIT_COUNT}개의 크레딧이<br />
                                <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                                    모자라다면?
                                </span>
                            </>
                        ) : (
                            'Need more than daily credits?'
                        )}
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 text-lg font-medium leading-relaxed">
                        {isKo
                            ? `매일 제공되는 무료 혜택을 모두 사용하셨나요? 크레딧을 추가로 충전하면 기다림 없이 더 깊은 운명 분석을 받아볼 수 있습니다.`
                            : `Used up all your daily free benefits? Recharge credits to continue your destiny analysis without limits.`}
                    </p>
                </div>

                {/* Minimal Benefits Grid */}
                <div className="grid grid-cols-1 gap-8 mb-16">
                    {benefits.map((benefit, idx) => (
                        <div key={idx} className="flex items-start gap-4">
                            <div className="shrink-0 w-10 h-10 bg-slate-50 dark:bg-slate-900 rounded-xl flex items-center justify-center">
                                {benefit.icon}
                            </div>
                            <div>
                                <h4 className="font-bold text-lg mb-0.5">{benefit.title}</h4>
                                <p className="text-md text-slate-500 dark:text-slate-500 font-medium">{benefit.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Pricing Selection */}
                <div className="space-y-4 mb-16">
                    {plans.map((plan, idx) => (
                        <div
                            key={idx}
                            className={`relative p-6 rounded-[24px] border-2 transition-all duration-300 ${plan.recommended
                                ? 'border-indigo-600 bg-indigo-50/30 dark:bg-indigo-900/10 shadow-xl shadow-indigo-100 dark:shadow-none'
                                : 'border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900'
                                }`}
                        >
                            {plan.recommended && (
                                <div className="absolute -top-3 left-6 bg-indigo-600 text-white text-xs font-black px-3 py-1 rounded-full uppercase tracking-widest">
                                    Best Choice
                                </div>
                            )}

                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className={`p-2.5 rounded-xl ${plan.recommended ? 'bg-indigo-600 text-white' : 'bg-slate-50 dark:bg-slate-800 text-slate-400'}`}>
                                        <BoltIcon className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-black text-xl">{plan.credits} Credits</span>
                                            <span className="text-xs bg-rose-100 dark:bg-rose-900/50 text-rose-600 dark:text-rose-400 font-black px-1.5 py-0.5 rounded">-{plan.discount}</span>
                                        </div>
                                        <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">{plan.name} Package</span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-slate-300 dark:text-slate-600 text-xs line-through font-bold mb-0.5">₩{plan.originalPrice}</div>
                                    <div className="text-2xl font-black text-slate-900 dark:text-white">₩{plan.price}</div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Minimal Coming Soon Banner */}
                <div className="pt-12 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2 mb-4">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                        <span className="text-sm font-black text-indigo-500 tracking-widest uppercase">System Update</span>
                    </div>
                    <h3 className="text-lg font-bold mb-3">
                        {isKo ? '자동 결제 시스템 준비 중' : 'Automated Store Coming Soon'}
                    </h3>
                    <p className="text-md text-slate-600 dark:text-slate-400 mb-8 leading-relaxed break-keep">
                        {isKo
                            ? '더욱 편리한 이용을 위해 토스페이먼츠 연동을 진행하고 있습니다. 지금 즉시 크레딧 충전이 필요하신 분은 문의하기를 통해 도와드릴게요!'
                            : 'We are currently integrating Toss Payments for a seamless experience. If you need credits right away, please contact us!'}
                    </p>
                    <button
                        onClick={() => router.push('/messages?tab=inquiry')}
                        className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-bold transition-transform active:scale-[0.98]"
                    >
                        {isKo ? '크레딧 충전 문의하기' : 'Inquire Now'}
                    </button>
                </div>

                {/* Footer Note */}
                <p className="mt-10 text-center text-sm text-indigo-700 dark:text-indigo-400 font-medium">
                    {isKo
                        ? '구매하신 크레딧은 유효기간 없이 영구적으로 사용 가능합니다.'
                        : 'Purchased credits have no expiration date and can be used permanently.'}
                </p>
            </div>
        </div>
    );
}
