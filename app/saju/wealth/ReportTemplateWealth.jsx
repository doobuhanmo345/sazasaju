'use client';

import { useEffect, useState } from 'react';
import { useAuthContext } from '@/contexts/useAuthContext';
import { useLanguage } from '@/contexts/useLanguageContext';
import { SparklesIcon } from '@heroicons/react/24/outline';
import { parseAiResponse } from '@/utils/helpers';
import { useRouter } from 'next/navigation';
import { useLoading } from '@/contexts/useLoadingContext';
import AfterReport from '@/components/AfterReport';
import { doc, updateDoc, increment, deleteField } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function ReportTemplateWealth({ storageKey }) {
    const { userData } = useAuthContext();
    const { language } = useLanguage();
    const router = useRouter();
    const { aiResult } = useLoading();
    const [data, setData] = useState(null);

    useEffect(() => {
        if (aiResult) {
            const parsedData = parseAiResponse(aiResult);
            if (parsedData) setData(parsedData);
        }

        if (userData && !aiResult) {
            const savedResult = userData?.usageHistory?.[storageKey]?.result;
            if (savedResult) {
                const parsed = parseAiResponse(savedResult);

                const isValid =
                    parsed &&
                    parsed.header?.title &&
                    parsed.header?.summary &&
                    parsed.contents?.length > 0 &&
                    parsed.conclusion?.title &&
                    parsed.summary;

                if (isValid) {
                    setData(parsed);
                } else {
                    const restoreCredit = async () => {
                        if (userData?.uid) {
                            const userRef = doc(db, 'users', userData.uid);
                            try {
                                await updateDoc(userRef, {
                                    Credits: increment(1),
                                    [`usageHistory.${storageKey}`]: deleteField(),
                                });
                                alert(
                                    language !== 'ko'
                                        ? '1 Credit has been refunded due to incomplete analysis data. Please try again.'
                                        : '분석 에러로 데이터가 충분하지 않아 1 크레딧이 환불되었습니다. 다시 시도해주세요.'
                                );
                            } catch (error) {
                                console.error('Failed to restore credit:', error);
                            }
                        }
                        router.replace('/saju/wealth');
                    };
                    restoreCredit();
                }
            } else {
                router.replace('/saju/wealth');
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userData, router, language, storageKey]);

    if (!data) return <div className="p-10 text-center">No Result Found</div>;

    const savedRecord = userData?.usageHistory?.[storageKey];
    const topicLabel = savedRecord?.ques || 'Wealth Analysis';
    const detailLabel = savedRecord?.ques2 || '';

    return (
        <div className="w-full max-w-3xl mx-auto px-4 py-8 animate-in fade-in duration-700">
            {/* Header Section */}
            <div className="text-center mb-12">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200 dark:border-amber-800 mb-4">
                    <SparklesIcon className="w-4 h-4 text-amber-500" />
                    <span className="text-xs font-bold text-amber-700 dark:text-amber-300 uppercase tracking-wider">
                        {topicLabel}
                    </span>
                </div>

            </div>

            {/* Main Content */}
            <div className="space-y-12">
                {/* Title & Summary */}
                <section className="text-center space-y-3">
                    <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white leading-tight">
                        {data?.header?.title}
                    </h1>
                    <p className="text-lg text-amber-600 dark:text-amber-400 font-semibold">
                        {data?.header?.summary}
                    </p>
                </section>

                {/* Keywords */}
                {data?.header?.keywordSummary && (
                    <section className="text-center space-y-4">
                        <p className="text-base text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl mx-auto">
                            {data?.header?.keywordSummary}
                        </p>
                        <div className="flex flex-wrap justify-center gap-2">
                            {data?.header?.keywords?.map((word, i) => (
                                <span
                                    key={i}
                                    className="px-3 py-1 text-xs font-semibold text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 rounded-full border border-slate-200 dark:border-slate-700"
                                >
                                    #{word}
                                </span>
                            ))}
                        </div>
                    </section>
                )}

                {/* Divider */}
                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-slate-200 dark:border-slate-700"></div>
                    </div>
                    <div className="relative flex justify-center">
                        <span className="px-4 bg-white dark:bg-slate-900 text-xs text-slate-400 uppercase tracking-widest">
                            Analysis
                        </span>
                    </div>
                </div>

                {/* Content Sections */}
                <section className="space-y-8">
                    {data?.contents?.map((content, i) => (
                        <div key={i} className="space-y-2">
                            <h3 className="text-sm font-black text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                                {content?.title}
                            </h3>
                            <p className="text-base text-slate-700 dark:text-slate-300 leading-relaxed">
                                {content?.desc}
                            </p>
                        </div>
                    ))}
                </section>

                {/* Divider */}
                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-slate-200 dark:border-slate-700"></div>
                    </div>
                    <div className="relative flex justify-center">
                        <span className="px-4 bg-white dark:bg-slate-900 text-xs text-slate-400 uppercase tracking-widest">
                            Conclusion
                        </span>
                    </div>
                </div>

                {/* Conclusion */}
                <section className="text-center space-y-4 py-8">
                    <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 leading-relaxed max-w-xl mx-auto">
                        {data?.conclusion?.title}
                    </h3>
                    <p className="text-base text-slate-600 dark:text-slate-400 leading-relaxed max-w-2xl mx-auto">
                        {data?.conclusion?.desc}
                    </p>
                </section>

                {/* Saza CTA */}
                {data?.tosaza && (
                    <div className="text-center pt-8 border-t border-slate-100 dark:border-slate-800">
                        <p className="text-sm text-slate-500 dark:text-slate-400 italic">
                            {data?.tosaza}{' '}
                            <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                                {language === 'ko' ? '사자에게 물어보기를 이용해 보세요.' : 'Try asking Saza more questions.'}
                            </span>
                        </p>
                    </div>
                )}
            </div>

            {/* Share & Back Button */}
            <div className="mt-16 text-center flex flex-col items-center gap-4">

                <button
                    onClick={() => router.push('/saju/wealth')}
                    className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-amber-600 dark:hover:text-amber-400 transition-colors rounded-xl border border-slate-200 dark:border-slate-700 hover:border-amber-300 dark:hover:border-amber-600"
                >
                    ← {language !== 'ko' ? 'Check Another Topic' : '다른 재물운 보기'}
                </button>
                <AfterReport fortuneType="wealth" storageKey={storageKey} data={data?.summary} />
            </div>
        </div>
    );
}
