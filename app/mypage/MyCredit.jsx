import { useAuthContext } from '@/contexts/useAuthContext';
import { useRouter } from 'next/navigation';
import { useUsageLimit } from '@/contexts/useUsageLimit';
import { BoltIcon, CircleStackIcon } from '@heroicons/react/24/solid';
import { useState, useEffect } from 'react';

export default function MyCredit() {
    const { user, userData } = useAuthContext();
    const router = useRouter();
    const { MAX_EDIT_COUNT, editCount } = useUsageLimit();
    const [timeLeft, setTimeLeft] = useState('');
    const [showTimer, setShowTimer] = useState(false);

    const credit = userData?.credits || 0;
    const remainingCount = Math.max(0, MAX_EDIT_COUNT - editCount);

    useEffect(() => {
        const updateTimer = () => {
            const now = new Date();
            const midnight = new Date();
            midnight.setHours(24, 0, 0, 0);
            const diff = midnight - now;

            const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
            const minutes = Math.floor((diff / 1000 / 60) % 60);
            const seconds = Math.floor((diff / 1000) % 60);

            setTimeLeft(`${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`);
        };

        updateTimer();
        const interval = setInterval(updateTimer, 1000);
        return () => clearInterval(interval);
    }, []);

    if (!user) return null;

    return (
        <div className="flex items-center justify-center gap-1.5 ">
            {/* Simple One-Line Credit Info */}
            <div
                onClick={() => setShowTimer(showTimer ? false : true)}
                onMouseEnter={() => setShowTimer(true)}
                onMouseLeave={() => setShowTimer(false)}
                className="flex items-center gap-1.5 cursor-pointer hover:opacity-70 transition-all duration-300 relative group"
            >
                <div className="flex items-center gap-1.5 transition-all duration-300">
                    <BoltIcon className={`w-4 h-4 text-amber-500 ${showTimer ? 'animate-pulse' : ''}`} />
                    <span className="text-base font-black text-slate-800 dark:text-slate-200">
                        {remainingCount}
                    </span>
                </div>

                {/* Midnight Reset Countdown - Zero Box Aesthetic Tooltip */}
                <div className={`absolute left-0 -bottom-8 whitespace-nowrap transition-all duration-500 ${showTimer ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'}`}>
                    <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">
                        Refill in {timeLeft}
                    </span>
                </div>
            </div>

            <span className="text-slate-200 dark:text-slate-800 font-black px-1">·</span>

            <div
                onClick={() => router.push('/credit')}
                className="flex items-center gap-1.5 cursor-pointer hover:opacity-70 transition-opacity"
            >
                <CircleStackIcon className="w-4 h-4 text-indigo-500" />
                <span className="text-sm font-black text-slate-800 dark:text-slate-200">
                    {credit.toLocaleString()}
                    <span className="text-xs ml-0.5 text-slate-400">C</span>
                </span>
            </div>
        </div>
    );
}