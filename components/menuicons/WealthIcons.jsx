'use client';

import { useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/useLanguageContext';

const WealthIcons = () => {
    const router = useRouter();
    const { language } = useLanguage();
    const ko = language === 'ko';

    const WealthNavItems = [
        {
            label: `${ko ? '재물복' : 'Wealth Capacity'}`,
            path: '/saju/wealth/capacity',
            isReady: true,
            // plusCredit: true,
            desc: ko ? '나의 타고난 재물복' : 'My innate wealth',
            icon: (
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125"
                />
            ),
        },
        {
            label: `${ko ? '사업운' : 'Business Luck'}`,
            path: '/saju/wealth/business',
            isReady: true,
            desc: ko ? '사업의 성공운' : 'Business success',
            icon: (
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z"
                />
            ),
        },
        {
            label: `${ko ? '재물 타이밍' : 'Wealth Timing'}`,
            path: '/saju/wealth/timing',
            isReady: true,
            desc: ko ? '재물이 들어오는 시기' : 'When wealth comes',
            icon: (
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5m-9-6h.008v.008H12v-.008zM12 15h.008v.008H12V15zm0 2.25h.008v.008H12v-.008zM9.75 15h.008v.008H9.75V15zm0 2.25h.008v.008H9.75v-.008zM7.5 15h.008v.008H7.5V15zm0 2.25h.008v.008H7.5v-.008zm6.75-4.5h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V15zm0 2.25h.008v.008h-.008v-.008zm2.25-4.5h.008v.008H16.5v-.008zm0 2.25h.008v.008H16.5V15z"
                />
            ),
        },
        {
            label: `${ko ? '투자/재테크' : 'Investment'}`,
            path: '/saju/wealth/investment',
            isReady: true,
            desc: ko ? '주식, 코인, 부동산 투자' : 'Stocks, crypto, real estate',
            icon: (
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"
                />
            ),
        },

    ];

    const handleNavigation = (item) => {
        if (!item.isReady) return;
        router.push(item.path);
    };

    return (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-around gap-3 sm:gap-0  sm:px-0 py-4">
            {WealthNavItems.map((item) => (
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

export default WealthIcons;
