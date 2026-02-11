'use client';

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
import BackButton from '@/ui/BackButton';

export default function CreditClient() {
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
                ? '단돈 1000원부터 시작하는 고민 해결'
                : 'Start deep dives from just ₩1000',
        }
    ];

    const plans = [
        {
            name: isKo ? '라이트' : 'Lite',
            credits: '1',
            price: '1000',
            originalPrice: '1000',
            discount: '',
        },
        {
            name: isKo ? '베스트' : 'Best',
            credits: '3',
            price: '2000',
            originalPrice: '3990',
            discount: '50%',
            recommended: true,
        },
    ];

    return (
        <div className="min-h-screen bg-white dark:bg-slate-950 font-pretendard pb-20">
            <BackButton title={isKo ? '크레딧 구매' : 'Get Credits'} />

            <div className="max-w-xl mx-auto px-6 pt-24">
                {/* Simple Hero */}
                <div className="mb-14 text-center">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 dark:bg-indigo-900/30 rounded-full text-indigo-600 dark:text-indigo-400 text-[10px] font-black uppercase tracking-widest mb-4">
                        <SparklesIcon className="w-3.5 h-3.5" />
                        <span>Premium Credits</span>
                    </div>
                    <h2 className="text-3xl font-black leading-tight tracking-tight mb-4 text-slate-800 dark:text-white">
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
                    <p className="text-slate-400 dark:text-slate-500 text-sm font-medium leading-relaxed max-w-sm mx-auto">
                        {isKo
                            ? `매일 제공되는 무료 혜택을 모두 사용하셨나요? 크레딧을 추가로 충전하면 기다림 없이 더 깊은 운명 분석을 받아볼 수 있습니다.`
                            : `Used up all your daily free benefits? Recharge credits to continue your destiny analysis without limits.`}
                    </p>
                </div>

                {/* Minimal Benefits Grid */}
                <div className="grid grid-cols-1 gap-6 mb-16">
                    {benefits.map((benefit, idx) => (
                        <div key={idx} className="flex items-start gap-4 p-4 rounded-3xl bg-slate-50/50 dark:bg-slate-900/40 border border-slate-100/50 dark:border-white/[0.03]">
                            <div className="shrink-0 w-10 h-10 bg-white dark:bg-slate-800 rounded-xl flex items-center justify-center shadow-sm">
                                {benefit.icon}
                            </div>
                            <div>
                                <h4 className="font-black text-sm text-slate-800 dark:text-white mb-0.5">{benefit.title}</h4>
                                <p className="text-xs text-slate-400 dark:text-slate-500 font-medium leading-tight">{benefit.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Pricing Selection */}
                <div className="space-y-4 mb-16">
                    {plans.map((plan, idx) => (
                        <div
                            key={idx}
                            className={`relative p-6 rounded-[2.5rem] border-2 transition-all duration-300 ${plan.recommended
                                ? 'border-indigo-600 bg-indigo-50/20 dark:bg-indigo-900/10'
                                : 'border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900'
                                }`}
                        >
                            {plan.recommended && (
                                <div className="absolute -top-3 left-8 bg-indigo-600 text-white text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest">
                                    Best Choice
                                </div>
                            )}

                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className={`p-3 rounded-2xl ${plan.recommended ? 'bg-indigo-600 text-white' : 'bg-slate-50 dark:bg-slate-800 text-slate-400'}`}>
                                        <BoltIcon className="w-5 h-5 stroke-[1.5]" />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-black text-lg text-slate-800 dark:text-white">{plan.credits} Credits</span>
                                            {plan.price !== plan.originalPrice && (
                                                <span className="text-[10px] bg-rose-100 dark:bg-rose-900/50 text-rose-600 dark:text-rose-400 font-black px-1.5 py-0.5 rounded">-{plan.discount}</span>
                                            )}
                                        </div>
                                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{plan.name} Package</span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    {plan.price !== plan.originalPrice && (
                                        <div className="text-slate-300 dark:text-slate-600 text-xs line-through font-bold mb-0.5">₩{plan.originalPrice}</div>
                                    )}
                                    <div className="text-2xl font-black text-slate-900 dark:text-white">₩{plan.price}</div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Minimal Inquiry Banner */}
                <div className="pt-12 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2 mb-4">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                        <span className="text-[10px] font-black text-indigo-500 tracking-widest uppercase">System Update</span>
                    </div>
                    <h3 className="text-xl font-black mb-3 text-slate-800 dark:text-white">
                        {isKo ? '자동 결제 시스템 준비 중' : 'Automated Store Coming Soon'}
                    </h3>
                    <p className="text-sm text-slate-400 dark:text-slate-500 mb-8 leading-relaxed break-keep font-medium">
                        {isKo
                            ? '더욱 편리한 이용을 위해 토스페이먼츠 연동을 진행하고 있습니다. 지금 즉시 크레딧 충전이 필요하신 분은 문의하기를 통해 도와드릴게요!'
                            : 'We are currently integrating Toss Payments for a seamless experience. If you need credits right away, please contact us!'}
                    </p>
                    <button
                        onClick={() => router.push('/messages?tab=inquiry')}
                        className="w-full py-5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-[2rem] font-black text-sm transition-all active:scale-[0.98] shadow-xl shadow-slate-200 dark:shadow-none"
                    >
                        {isKo ? '크레딧 충전 문의하기' : 'Inquire Now'}
                    </button>
                </div>

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
