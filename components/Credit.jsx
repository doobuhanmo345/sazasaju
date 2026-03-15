import { useState, useEffect } from "react";
import { BoltIcon, CurrencyDollarIcon } from "@heroicons/react/24/outline";
import { useUsageLimit } from "@/contexts/useUsageLimit";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/contexts/useAuthContext";
import { CircleStackIcon } from '@heroicons/react/24/solid';

export default function Credit() {
    const { editCount, MAX_EDIT_COUNT } = useUsageLimit();
    const router = useRouter();
    const { userData, isCookieDone } = useAuthContext();
    const [timeLeft, setTimeLeft] = useState(null);
    const [showTime, setShowTime] = useState(false);

    useEffect(() => {
        if (!showTime) return;

        const calculateTimeLeft = () => {
            const now = new Date();
            const midnight = new Date();
            midnight.setHours(24, 0, 0, 0);
            const diff = midnight - now;

            const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
            const minutes = Math.floor((diff / 1000 / 60) % 60);
            const seconds = Math.floor((diff / 1000) % 60);

            return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        };

        setTimeLeft(calculateTimeLeft());
        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);

        const hideTimer = setTimeout(() => {
            setShowTime(false);
        }, 5000);

        return () => {
            clearInterval(timer);
            clearTimeout(hideTimer);
        };
    }, [showTime]);


    return (
        <div className="flex items-center">
            <div className={`flex items-center gap-1 px-2 py-1 bg-slate-100/50 dark:bg-slate-800/50 rounded-full backdrop-blur-sm border ${!userData ? 'border-slate-300/50 dark:border-slate-600/50 opacity-80' : 'border-slate-200/50 dark:border-slate-700/50'}`}>
                {/* Credits Display - Click to go to purchase */}
                <button
                    onClick={() => userData ? router.push('/credit') : router.push('/login')}
                    className="flex items-center gap-0.5 border-r border-slate-300 dark:border-slate-600 pr-1.5 mr-1.5 hover:opacity-70 transition-opacity"
                >
                    <CircleStackIcon className={`w-3.5 h-3.5 ${userData ? 'text-indigo-500' : 'text-slate-400 dark:text-slate-500'}`} />
                    <span className={`text-xs font-black font-mono min-w-[12px] text-center ${userData ? 'text-slate-700 dark:text-slate-200' : 'text-slate-400 dark:text-slate-500'}`}>
                        {userData ? (userData?.credits || 0) : '-'}
                    </span>
                </button>

                {/* Edit Count Display - Click to see countdown */}
                <button
                    onClick={() => userData ? setShowTime(!showTime) : router.push('/login')}
                    className="flex items-center gap-0.5 border-r border-slate-300 dark:border-slate-600 pr-1.5 mr-1.5 hover:opacity-70 transition-opacity group relative"
                >
                    <BoltIcon
                        className={`w-3.5 h-3.5 ${!userData ? 'text-slate-400 dark:text-slate-500' : (MAX_EDIT_COUNT - editCount === 0 ? 'text-red-500' : 'text-amber-500')} fill-current group-active:scale-125 transition-transform`}
                    />
                    <span
                        className={`text-[11px] font-black font-mono ${!userData ? 'text-slate-400 dark:text-slate-500' : (MAX_EDIT_COUNT - editCount === 0 ? 'text-red-500' : 'text-slate-700 dark:text-slate-200')}`}
                    >
                        {userData ? (showTime ? timeLeft : (MAX_EDIT_COUNT - editCount)) : '-'}
                    </span>
                </button>

                <button
                    onClick={() => userData ? router.push('/fortunecookie') : router.push('/login')}
                    disabled={userData && isCookieDone}
                    className={`relative flex text-sm items-center justify-center transition-transform active:scale-90 ${!userData || isCookieDone ? 'opacity-40 grayscale' : 'animate-bounce cursor-pointer'} ${!userData && 'cursor-pointer hover:opacity-70'}`}
                >
                    <span className="text-sm">🥠</span>
                    {userData && !isCookieDone && (
                        <span className="absolute -top-1 -right-1 w-1.5 h-1.5 bg-red-500 rounded-full animate-ping" />
                    )}
                </button>
            </div>
        </div>
    )
}