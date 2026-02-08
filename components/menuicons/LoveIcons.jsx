'use client';

import { useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/useLanguageContext';

const LoveIcons = () => {
    const router = useRouter();
    const { language } = useLanguage();
    const ko = language === 'ko';

    const LoveNavItems = [
        {
            label: `${ko ? '평생애정운' : 'Lifetime Love Luck'}`,
            path: '/saju/love/lifetime',
            isReady: true,
            desc: ko ? '나의 타고난 평생애정운' : 'My innate lifetime love luck',
            icon: (
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
            ),
        },
        {
            label: `${ko ? '월별 애정운' : 'Monthly Love Luck'}`,
            path: '/saju/love/monthly',
            isReady: true,
            desc: ko ? '나의 월별 애정운은?' : 'Check your monthly love luck',
            icon: (
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
            ),
        },
        {
            label: `${ko ? '재회운' : 'Reunion Luck'}`,
            path: '/saju/love/reunion',
            isReady: true,
            desc: ko ? '나의 재회운은?' : 'Check your reunion luck',
            icon: (
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
            ),
        },
        {
            label: `${ko ? '인연 타이밍' : 'Compatibility Timing'}`,
            path: '/saju/love/timing',
            isReady: true,
            desc: ko ? '인연이 들어오는 시기' : 'When compatibility comes',
            icon: (
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            ),
        },
        {
            label: `${ko ? '궁합' : 'Compatibility'}`,
            path: '/saju/match',
            isReady: true,
            desc: ko ? '나와 맞는 궁합' : 'Compatibility with me',
            icon: (
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
            ),
        },
        {
            label: `${ko ? '잘 맞는 사람' : 'Good Match'}`,
            path: '/saju/love/compatible',
            isReady: true,
            desc: ko ? '나와 잘 맞는 사람' : 'Who matches me well',
            icon: (
                <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.771m.038 3.198a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
            ),
        },
        {
            label: `${ko ? '피해야 할 사람' : 'Avoid'}`,
            path: '/saju/love/avoid',
            isReady: true,
            desc: ko ? '피해야 할 사람' : 'Avoid',
            icon: (
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m0-10.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.75c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.75h-.152c-3.196 0-6.1-1.248-8.25-3.286zm0 13.036h.008v.008H12v-.008z" />
            ),
        },
        {
            label: `${ko ? '상대방의 속마음' : 'Partner Feelings'}`,
            path: '/saju/love/feelings',
            isReady: true,
            desc: ko ? '그 사람의 마음을 알고 싶어요' : 'What does he think?',
            icon: (
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
            ),
        },

    ];

    const handleNavigation = (item) => {
        if (!item.isReady) return;
        router.push(item.path);
    };

    return (
        <div className="flex flex-col sm:grid sm:grid-cols-4 gap-3 sm:gap-y-10 sm:px-0 py-4">
            {LoveNavItems.map((item) => (
                <button
                    key={item.path}
                    onClick={() => handleNavigation(item)}
                    disabled={!item.isReady}
                    className={`group flex flex-row sm:flex-col items-center gap-4 sm:gap-2 p-4 sm:p-0 
                     rounded-3xl bg-white sm:bg-transparent 
                     border border-slate-100 sm:border-none
                     shadow-[0_2px_10px_-3px_rgba(0,0,0,0.05)] sm:shadow-none
                     transition-all active:scale-[0.97] outline-none
                     ${!item.isReady ? 'opacity-50' : ''}`}
                >
                    {/* 아이콘 */}
                    <div className="relative flex h-12 w-12 shrink-0 items-center justify-center text-slate-400 transition-colors group-hover:text-rose-500">
                        {item.isAi && (
                            <span className="absolute -right-2 -top-1 flex items-center gap-1 bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-400 px-2 py-0.5 text-[8px] font-black tracking-widest text-white ring-2 ring-white dark:ring-slate-900 rounded-full animate-pulse z-10 shadow-[0_0_10px_rgba(59,130,246,0.5)]">
                                <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
                                AI
                            </span>
                        )}

                        {!item.isReady && (
                            <span className="absolute -top-1 flex items-center justify-center bg-slate-500 px-1.5 py-0.5 text-[7px] font-bold text-white ring-1 ring-white rounded-md z-10">
                                준비중
                            </span>
                        )}

                        {item.plusCredit && item.isReady && (
                            <span className="absolute -right-2 -top-1 flex items-center justify-center bg-amber-600 px-1.5 py-0.5 text-[8px] font-black italic tracking-tighter text-white ring-2 ring-white rounded-full z-10">
                                + CREDIT
                            </span>
                        )}

                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth="1.5"
                            stroke="currentColor"
                            className="h-7 w-7"
                        >
                            {item.icon}
                        </svg>
                    </div>

                    {/* 텍스트 영역 */}
                    <div className="flex flex-col items-start sm:items-center text-left sm:text-center overflow-hidden">
                        <span className="text-[15px] sm:text-[11px] font-bold text-slate-800 transition-colors group-hover:text-rose-600">
                            {item.label}
                        </span>
                        <span className="sm:hidden text-[12px] text-slate-400 font-medium truncate w-full">
                            {item.desc}
                        </span>
                    </div>

                    {/* 모바일 화살표 */}
                    <div className="sm:hidden ml-auto flex h-8 w-8 items-center justify-center rounded-full bg-slate-50">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={2.5}
                            stroke="currentColor"
                            className="w-3 h-3 text-slate-300"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                        </svg>
                    </div>
                </button>
            ))}
        </div>
    );
};

export default LoveIcons;
