'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import {
    SparklesIcon,
    CircleStackIcon,
    CalendarDaysIcon,
    UserPlusIcon,
    IdentificationIcon,
    ChatBubbleLeftRightIcon,
    BriefcaseIcon,
    HeartIcon,
    ArrowPathIcon,
    ClockIcon,
    UserGroupIcon,
    ShieldExclamationIcon,
    MagnifyingGlassIcon,
    UserMinusIcon,
    PresentationChartLineIcon,
    ChevronRightIcon
} from '@heroicons/react/24/outline';
import { useLanguage } from '@/contexts/useLanguageContext';
import BackButton from '@/ui/BackButton';

export default function FortuneClient() {
    const router = useRouter();
    const { language } = useLanguage();
    const isKo = language === 'ko';

    const fortuneSections = [
        {
            subtitle: isKo ? '전통 사주' : 'Traditional Saju',
            items: [
                {
                    name: isKo ? '기본 사주 분석' : 'Saju Analysis',
                    desc: isKo ? '타고난 성격과 평생의 운명 흐름' : 'Your innate traits and destiny',
                    icon: <IdentificationIcon />,
                    path: '/saju/basic',
                    color: 'text-indigo-500'
                },
                {
                    name: isKo ? '오늘의 운세' : 'Luck of the day',
                    desc: isKo ? '오늘 하루 나의 기운 확인' : 'Daily Energy Check',
                    icon: <CalendarDaysIcon />,
                    path: '/saju/todaysluck',
                    color: 'text-amber-500'
                },
                {
                    name: isKo ? '신년 운세' : '2026 Fortune',
                    desc: isKo ? '병오년 한 해의 흐름' : 'Flow of the Year',
                    icon: <SparklesIcon />,
                    path: '/saju/2026luck',
                    color: 'text-rose-500'
                },
                {
                    name: isKo ? '궁합 보기' : 'Chemistry',
                    desc: isKo ? '상대방과의 에너지 조화' : 'Match with Others',
                    icon: <UserPlusIcon />,
                    path: '/saju/match',
                    color: 'text-sky-500'
                },
                {
                    name: isKo ? '재물운 분석' : 'Wealth Luck',
                    desc: isKo ? '타고난 재복과 부의 흐름' : 'Your innate wealth and financial flow',
                    icon: <CircleStackIcon />,
                    path: '/saju/wealth',
                    color: 'text-emerald-500'
                },
                {
                    name: isKo ? '사자와의 대화' : 'Chat with SAZA',
                    desc: isKo ? '무엇이든 물어보세요, 사자가 답해드립니다' : 'Ask anything, SAZA will answer',
                    icon: <ChatBubbleLeftRightIcon />,
                    path: '/saju/sazatalk',
                    color: 'text-indigo-400'
                },
            ],
        },
        {
            subtitle: isKo ? '재물운 상세' : 'Wealth Detail',
            items: [
                {
                    name: isKo ? '평생 재물운' : 'Lifetime Wealth',
                    desc: isKo ? '타고난 그릇의 크기와 부자 사주' : 'Innate wealth capacity',
                    icon: <CircleStackIcon />,
                    path: '/saju/wealth/capacity',
                    color: 'text-emerald-600'
                },
                {
                    name: isKo ? '올해/내년 흐름' : 'Yearly Flow',
                    desc: isKo ? '단기적 자금 흐름과 기회' : 'Short-term cash flow',
                    icon: <CalendarDaysIcon />,
                    path: '/saju/wealth/timing',
                    color: 'text-amber-600'
                },
                {
                    name: isKo ? '투자 / 재테크' : 'Investment',
                    desc: isKo ? '주식, 코인, 부동산 적합성' : 'Investment suitability',
                    icon: <PresentationChartLineIcon />,
                    path: '/saju/wealth/investment',
                    color: 'text-indigo-600'
                },
                {
                    name: isKo ? '사업 / 창업운' : 'Business',
                    desc: isKo ? '사업가 자질과 창업 시기' : 'Entrepreneurial potential',
                    icon: <BriefcaseIcon />,
                    path: '/saju/wealth/business',
                    color: 'text-slate-600'
                },
            ],
        },
        {
            subtitle: isKo ? '애정운 상세' : 'Love Detail',
            items: [
                {
                    name: isKo ? '평생애정운' : 'Lifetime Love',
                    desc: isKo ? '타고난 연애 스타일과 운명' : 'Innate love style and path',
                    icon: <HeartIcon />,
                    path: '/saju/love/lifetime',
                    color: 'text-rose-500'
                },
                {
                    name: isKo ? '월별 애정운' : 'Monthly Love',
                    desc: isKo ? '이번 달 나의 연애 기운' : 'Monthly romantic energy',
                    icon: <CalendarDaysIcon />,
                    path: '/saju/love/monthly',
                    color: 'text-pink-500'
                },
                {
                    name: isKo ? '재회운' : 'Reunion Luck',
                    desc: isKo ? '돌아선 마음이 다시 닿을까' : 'Will the heart come back?',
                    icon: <ArrowPathIcon />,
                    path: '/saju/love/reunion',
                    color: 'text-indigo-500'
                },
                {
                    name: isKo ? '인연 타이밍' : 'Love Timing',
                    desc: isKo ? '연인이 나타나는 결정적 시기' : 'Specific timing for love',
                    icon: <ClockIcon />,
                    path: '/saju/love/timing',
                    color: 'text-sky-500'
                },
                {
                    name: isKo ? '잘 맞는 사람' : 'Good Match',
                    desc: isKo ? '나를 빛나게 해줄 찰떡궁합' : 'Who is the best match for you',
                    icon: <UserGroupIcon />,
                    path: '/saju/love/compatible',
                    color: 'text-purple-500'
                },
                {
                    name: isKo ? '피해야 할 사람' : 'Avoid',
                    desc: isKo ? '에너지를 깎아먹는 인연' : 'People you should avoid',
                    icon: <ShieldExclamationIcon />,
                    path: '/saju/love/avoid',
                    color: 'text-slate-500'
                },
                {
                    name: isKo ? '상대방의 속마음' : 'Partner Feelings',
                    desc: isKo ? '숨겨진 진심과 생각 열어보기' : 'Check their hidden feelings',
                    icon: <MagnifyingGlassIcon />,
                    path: '/saju/love/feelings',
                    color: 'text-indigo-400'
                },
            ],
        },
        {
            subtitle: isKo ? '이벤트' : 'Event',
            items: [
                {
                    name: isKo ? '인터뷰' : 'Interview Luck',
                    desc: isKo ? '중요한 면접날. 잘 될까?' : 'Success rate for interview',
                    icon: <IdentificationIcon />,
                    path: '/saju/interview',
                    color: 'text-indigo-500'
                },
                {
                    name: isKo ? '데이트' : 'Date Luck',
                    desc: isKo ? '중요한 그날의 데이트, 과연 어떨까' : 'Will your date go well?',
                    icon: <HeartIcon />,
                    path: '/saju/date',
                    color: 'text-rose-500'
                },
                {
                    name: isKo ? '길일 선정' : 'Select Day',
                    desc: isKo ? '이사, 결혼, 계약 등을 위한 길일 선택' : 'Find auspicious days',
                    icon: <CalendarDaysIcon />,
                    path: '/saju/seldate',
                    color: 'text-amber-500'
                },
                {
                    name: isKo ? '출산 택일' : 'Childbirth Selection',
                    desc: isKo ? '아이와 부모의 기운에 맞는 출산 택일' : 'Auspicious birth dates',
                    icon: <UserMinusIcon />,
                    path: '/saju/selbirth',
                    color: 'text-sky-600'
                },
            ],
        },

    ];

    return (
        <div className="min-h-screen bg-white dark:bg-slate-950 font-pretendard pb-40">

            {/* Hero Header */}
            <div className="relative pt-24 pb-12 px-6 overflow-hidden">
                {/* Abstract Background Effects */}
                <div className="absolute top-0 right-0 -mr-40 -mt-20 w-[600px] h-[600px] bg-indigo-500/[0.04] dark:bg-indigo-500/[0.08] rounded-full blur-[60px] pointer-events-none transform-gpu" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-500/[0.04] dark:bg-purple-500/[0.08] rounded-full blur-[60px] pointer-events-none transform-gpu" />

                <div className="relative z-10 max-w-lg mx-auto text-center">
                    <p className="text-[10px] font-black text-indigo-500 dark:text-indigo-400 uppercase tracking-[0.4em] mb-3">
                        Destiny Library
                    </p>
                    <h1 className="text-4xl font-black text-slate-800 dark:text-white tracking-tighter mb-4">
                        {isKo ? '운세보기' : 'Fortunes'}<span className="text-indigo-600">.</span>
                    </h1>
                    <p className="text-sm text-slate-400 dark:text-slate-500 max-w-[280px] mx-auto font-medium leading-relaxed">
                        {isKo
                            ? '당신의 운명을 구성하는 우주의 언어와\n신비로운 카드의 조언을 만나보세요.'
                            : 'Discover the language of the universe and\nthe wisdom of mystical cards.'}
                    </p>
                </div>
            </div>

            {/* Content Body */}
            <div className="max-w-lg mx-auto px-6 space-y-12">
                {fortuneSections.map((section, sIdx) => (
                    <div key={sIdx} className="space-y-6">
                        <div className="flex items-center gap-3 px-1">
                            <div className="w-1.5 h-4 bg-indigo-500 dark:bg-indigo-400 rounded-full" />
                            <h3 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">
                                {section.subtitle}
                            </h3>
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                            {section.items.map((item, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => router.push(item.path)}
                                    className="group relative flex items-center justify-between p-5 rounded-[2rem] bg-slate-50/50 dark:bg-slate-900/40 border border-slate-100/50 dark:border-white/[0.03] transition-all hover:bg-white dark:hover:bg-slate-900 hover:shadow-2xl hover:shadow-indigo-500/5 hover:-translate-y-0.5 active:scale-[0.98]"
                                >
                                    <div className="flex items-center gap-5">
                                        <div className={`p-3.5 rounded-2xl bg-white dark:bg-slate-800 shadow-sm transition-transform duration-500 group-hover:scale-110 ${item.color}`}>
                                            {React.cloneElement(item.icon, { className: 'w-6 h-6 stroke-[1.2]' })}
                                        </div>
                                        <div className="text-left">
                                            <p className="text-[15px] font-black text-slate-800 dark:text-white leading-tight mb-1">
                                                {item.name}
                                            </p>
                                            <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium tracking-tight">
                                                {item.desc}
                                            </p>
                                        </div>
                                    </div>
                                    <ChevronRightIcon className="w-4 h-4 text-slate-300 dark:text-slate-700 group-hover:text-indigo-500 transition-colors" />
                                </button>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
