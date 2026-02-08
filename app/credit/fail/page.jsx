
'use client';
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { XCircleIcon } from "@heroicons/react/24/solid";

export default function FailPage() {
    const searchParams = useSearchParams();
    const message = searchParams.get("message");
    const code = searchParams.get("code");

    return (
        <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 pb-28">
            <div className="max-w-sm w-full bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none animate-in fade-in zoom-in-95 duration-500">

                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-50 dark:bg-red-900/20 mb-5">
                        <XCircleIcon className="w-8 h-8 text-red-500" />
                    </div>
                    <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">
                        결제 실패
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">
                        결제 처리 중 문제가 발생했습니다.
                    </p>
                </div>

                <div className="bg-red-50/50 dark:bg-red-900/10 rounded-2xl p-5 text-center mb-8 border border-red-100 dark:border-red-900/20">
                    <p className="text-xs font-bold text-red-400 uppercase tracking-wider mb-2">
                        Issue Detail
                    </p>
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300 break-keep">
                        {message || '알 수 없는 오류'}
                        {code && <span className="block text-xs text-red-400 mt-1 font-mono">{code}</span>}
                    </p>
                </div>

                <div className="flex gap-3">
                    <Link
                        href="/"
                        className="flex-1 py-4 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-sm text-center hover:bg-slate-200 transition-colors"
                    >
                        홈으로
                    </Link>
                    <Link
                        href="/credit/store"
                        className="flex-[1.5] py-4 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-sm text-center transition-all active:scale-95"
                    >
                        다시 시도
                    </Link>
                </div>
            </div>
        </div>
    );
}
