import { BoltIcon, CurrencyDollarIcon } from "@heroicons/react/24/outline";
import { useUsageLimit } from "@/contexts/useUsageLimit";
import { useRouter } from "next/navigation";
import { useLoading } from '@/contexts/useLoadingContext';
import { useAuthContext } from "@/contexts/useAuthContext";

export default function Credit() {
    const { editCount, MAX_EDIT_COUNT } = useUsageLimit();
    const router = useRouter();

    const { userData, isCookieDone } = useAuthContext();

    return (
        <div className="flex items-center">
            <div className="flex items-center gap-1 px-2 py-1 bg-slate-100/50 dark:bg-slate-800/50 rounded-full backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50">
                {/* Credits Display */}
                <div className="flex items-center gap-0.5 border-r border-slate-300 dark:border-slate-600 pr-1.5 mr-1.5">
                    <CurrencyDollarIcon className="w-3.5 h-3.5 text-indigo-500" />
                    <span className="text-[10px] font-black font-mono text-slate-700 dark:text-slate-200 min-w-[12px] text-center">
                        {userData?.credits || 0}
                    </span>
                </div>

                {/* Edit Count Display */}
                <div className="flex items-center gap-0.5 border-r border-slate-300 dark:border-slate-600 pr-1.5 mr-1.5">
                    <BoltIcon
                        className={`w-3.5 h-3.5 ${MAX_EDIT_COUNT - editCount === 0 ? 'text-red-500' : 'text-amber-500'} fill-current`}
                    />
                    <span
                        className={`text-[10px] font-black font-mono ${MAX_EDIT_COUNT - editCount === 0 ? 'text-red-500' : 'text-slate-700 dark:text-slate-200'}`}
                    >
                        {MAX_EDIT_COUNT - editCount}
                    </span>
                </div>

                <button
                    onClick={() => router.push('/fortunecookie')}
                    disabled={isCookieDone}
                    className={`relative flex text-sm items-center justify-center transition-transform active:scale-90 ${isCookieDone ? 'opacity-40 grayscale' : 'animate-bounce cursor-pointer'}`}
                >
                    <span className="text-sm">🥠</span>
                    {!isCookieDone && (
                        <span className="absolute -top-1 -right-1 w-1.5 h-1.5 bg-red-500 rounded-full animate-ping" />
                    )}
                </button>
            </div>
        </div>
    )
}