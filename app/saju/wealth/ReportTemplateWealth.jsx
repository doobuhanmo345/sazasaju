'use client';

import { useEffect, useState } from 'react';
import { useAuthContext } from '@/contexts/useAuthContext';
import { useLanguage } from '@/contexts/useLanguageContext';
import { SparklesIcon, UserGroupIcon, ArrowRightIcon, ArrowDownIcon } from '@heroicons/react/24/outline';
import { parseAiResponse } from '@/utils/helpers';
import LoadingBar from '@/components/LoadingBar';
import { useRouter } from 'next/navigation';
import { useLoading } from '@/contexts/useLoadingContext';
export default function ReportTemplateWealth({ storageKey }) {
    const { userData } = useAuthContext();
    const { language } = useLanguage();
    const router = useRouter();
    const { aiResult } = useLoading()
    const [data, setData] = useState(null);


    useEffect(() => {


        // 2. 없으면 DB에서 로드 (persistence)
        if (userData) {
            // NOTE: Today's Luck usually stored in ZLastDaily
            // We should check if the saved date matches 'today' ideally, but strictly following the prompt pattern:
            // Just load what is there. The Client side checks validity before redirecting anyway.
            const savedResult = userData?.usageHistory?.ZWealth?.result;
            if (savedResult) {
                const parsed = parseAiResponse(savedResult);
                if (parsed) {
                    setData(parsed);
                }
            } else {
                // No Data -> Redirect
                router.replace('/saju/wealth');
            }
        }
    }, [userData, router]);

    if (!data) return <div className="p-10 text-center">No Result Found</div>;

    // We need to reconstruct the "Topic" and "Detail" labels from the saved data if possible.
    // The saved data in ZWealth has 'ques' and 'ques2' fields which store the description/label.
    const savedRecord = userData?.usageHistory?.[storageKey];
    const topicLabel = savedRecord?.ques || 'Wealth Analysis';
    const detailLabel = savedRecord?.ques2 || '';

    return (
        <div className="w-full max-w-4xl mx-auto px-1 animate-in fade-in duration-500">
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-5 mb-8 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500"></div>
                <div className="flex flex-col gap-6">
                    <div className="flex justify-center">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Topic</span>
                            <span className="text-sm font-bold text-slate-700 dark:text-slate-200 flex items-center">
                                {topicLabel}
                                {detailLabel && (
                                    <>
                                        <span className="mx-2 text-slate-300 dark:text-slate-500 font-normal">/</span>
                                        <span className="text-indigo-600 dark:text-indigo-400">{detailLabel}</span>
                                    </>
                                )}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="prose prose-slate dark:prose-invert max-w-none bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-2xl shadow-sm border border-indigo-50 dark:border-slate-700">
                <div className="bg-indigo-50/30 dark:bg-slate-800/50 rounded-2xl border border-indigo-100/50 dark:border-slate-700 p-5 sm:p-6 shadow-sm">
                    <div className="flex flex-col gap-8 py-2">
                        <section className="text-center">
                            <h2 className="text-xl font-black text-slate-800 dark:text-white mb-1">{data?.header?.title}</h2>
                            <p className="text-sm text-indigo-500 font-semibold">{data?.header?.summary}</p>
                        </section>
                        <section className="border-t border-slate-100 dark:border-slate-800 pt-6 text-center">
                            <p className="mb-4">{data?.header?.keywordSummary}</p>
                            <div className="flex flex-wrap justify-center gap-2">
                                {data?.header?.keywords?.map((word, i) => (
                                    <span key={i} className="text-[10px] font-medium text-slate-400">#{word}</span>
                                ))}
                            </div>
                        </section>
                        <section className="grid grid-cols-1 gap-y-6 border-t border-slate-100 dark:border-slate-800 pt-6">
                            <div>
                                {data?.contents?.map((content, i) => (
                                    <div key={i} className="mb-5">
                                        <h4 className="text-sm font-black text-slate-600 uppercase tracking-widest mb-2">{content?.title}</h4>
                                        <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400">{content?.desc}</p>
                                    </div>
                                ))}
                            </div>
                        </section>
                        <section className="border-t border-slate-100 dark:border-slate-800 pt-6 pb-4">
                            <h4 className="text-xs font-black text-indigo-500 uppercase tracking-widest mb-3 text-center">Master's Conclusion</h4>
                            <p className="text-[14px] font-medium text-slate-700 dark:text-slate-200 leading-relaxed text-center max-w-md mx-auto mb-4">{data?.conclusion?.title}</p>
                            <p className="text-[13px] leading-relaxed text-slate-500 dark:text-slate-400 text-center">{data?.conclusion?.desc}</p>
                            <div className="mt-8 pt-6 border-t border-slate-50 dark:border-slate-900 text-center">
                                <span className="text-xs text-slate-800 font-bold italic">{data?.tosaza} {language === 'ko' ? '사자에게 물어보기를 이용해 보세요.' : 'Try asking Saza more questions.'}</span>
                            </div>
                        </section>
                    </div>
                </div>
            </div>

            <div className="mt-8 text-center">
                <button
                    onClick={() => window.location.href = '/saju/wealth'} // Simple redirect back
                    className="text-sm text-slate-400 hover:text-indigo-500 underline underline-offset-4 transition-colors"
                >
                    {language === 'en' ? 'Check Another Topic' : '다른 재물운 보기'}
                </button>
            </div>
        </div>
    );
}
