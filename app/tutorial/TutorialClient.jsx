'use client';

import React, { useState } from 'react';
import {
    BoltIcon,
    CircleStackIcon,
    TrashIcon,
    ShareIcon,
    BookmarkIcon,
    QuestionMarkCircleIcon,
    ChevronDownIcon,
    ChevronUpIcon,
    ClockIcon,
    ShieldCheckIcon,
    SparklesIcon
} from '@heroicons/react/24/outline';


const faqData = [
    {
        q: "번개(Lightning)는 언제 충전되나요?",
        a: "번개는 매일 정오(낮 12시)를 기준으로 3개씩 자동 충전됩니다. 무료 분석 횟수는 당일 소진이 원칙이며, 남은 번개는 다음 날로 이월되지 않습니다."
    },
    {
        q: "크레딧(Credit)과 번개의 차이점은 무엇인가요?",
        a: "번개는 매일 지급되는 무료 체험 횟수이며, 크레딧은 유료로 구매하거나 이벤트를 통해 획득하는 유료 재화입니다. 크레딧은 번개를 모두 소진한 후 사용되며, 사용하지 않은 크레딧은 영구히 보관됩니다."
    },
    {
        q: "결과가 왜 삭제되나요?",
        a: "쾌적하고 원활한 서비스 제공을 위해 오래된 분석 결과는 순차적으로 삭제됩니다. 보관이 필요한 중요한 결과는 '영구 저장' 기능을 이용하시거나, '공유하기'를 통해 보관 기간을 연장하실 수 있습니다."
    },
    {
        q: "사자톡 영구 저장은 어떻게 하나요?",
        a: "사자톡 결과 화면 하단의 '보관함 저장' 버튼을 누르면 최대 3개까지 영구히 저장할 수 있습니다. 이미 3개가 가득 찼다면 기존 저장된 내용을 삭제 후 새로운 내용을 저장할 수 있습니다."
    },
    {
        q: "공유 받은 링크가 열리지 않아요.",
        a: "공유된 결과 페이지는 생성일로부터 7일간만 유효합니다. 기간이 만료된 페이지는 보안 및 서버 관리를 위해 자동으로 파기되니 주의해 주세요!"
    }
];

export default function TutorialClient() {
    const [openFaq, setOpenFaq] = useState(null);

    return (
        <div className="min-h-screen bg-white dark:bg-slate-950">
            {/* Header - Saza Persona Style */}
            <div className="relative overflow-hidden bg-white dark:bg-slate-900 pt-6 pb-12 sm:pt-16 sm:pb-24 px-6 border-b border-slate-100 dark:border-slate-800">
                <div className="absolute bottom-0 right-0 -mr-20 -mb-20 w-80 h-80 bg-indigo-500/10 dark:bg-indigo-500/20 rounded-full blur-[80px]" />
                <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-purple-500/10 dark:bg-purple-500/20 rounded-full blur-[80px]" />

                <div className="relative z-10 max-w-lg mx-auto text-center flex flex-col items-center">
                    <div className="relative w-28 h-28 sm:w-40 sm:h-40 overflow-hidden rounded-full border-4 border-white shadow-2xl mb-4">
                        <img
                            src="/images/tutorial/saza_teacher.png"
                            alt="Teacher Saza"
                            // w-[200%]를 주고, 중앙 정렬을 위해 left-1/2와 -translate-x-1/2 추가
                            className='absolute top-[-20%] left-1/2 w-[150%] max-w-none -translate-x-1/2'
                        />
                    </div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-xs font-black uppercase tracking-widest mb-4">
                        Saza App Guide
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
                        사자가 직접 알려주는<br />
                        <span className="font-serif italic text-indigo-700 dark:text-indigo-400">사자사주</span> 이용 꿀팁
                    </h1>
                </div>
            </div>

            <div className="max-w-2xl mx-auto px-6 -mt-12 relative z-20 space-y-24 pb-20">

                {/* Section 1: Currency - Open Branding */}
                <div className="space-y-12">
                    <div className="flex flex-col items-center sm:items-start gap-2 pt-10">
                        <div className="flex items-center gap-2 text-indigo-500 font-black text-xs uppercase tracking-[0.2em]">
                            <div className="w-8 h-[2px] bg-indigo-500" />
                            Step 01
                        </div>
                        <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                            사자사주의 <span className="font-serif italic text-indigo-600 dark:text-indigo-400">재화 체계</span>
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 sm:gap-16">
                        {/* Lightning */}
                        <div className="flex flex-col items-center sm:items-start text-center sm:text-left group">
                            <div className="w-16 h-16 rounded-[2rem] bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                                <BoltIcon className="w-8 h-8 text-amber-500" />
                            </div>
                            <h3 className="text-xl font-black text-slate-800 dark:text-slate-100 mb-3 flex items-center gap-2">
                                번개 <span className="text-sm text-slate-400 font-bold uppercase tracking-widest">(Daily)</span>
                            </h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed break-keep">
                                <span className="text-slate-900 dark:text-white font-black underline decoration-amber-200/50 decoration-4 underline-offset-4">매일 밤 12시에 3개씩</span> 정성껏 준비해 둬요. <br />
                                당일 소진이 원칙이니, 사자에게 궁금한 걸 아낌없이 물어보세요!
                            </p>
                        </div>

                        {/* Credits */}
                        <div className="flex flex-col items-center sm:items-start text-center sm:text-left group">
                            <div className="w-16 h-16 rounded-[2rem] bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                                <CircleStackIcon className="w-8 h-8 text-indigo-500" />
                            </div>
                            <h3 className="text-xl font-black text-slate-800 dark:text-slate-100 mb-3 flex items-center gap-2">
                                크레딧 <span className="text-sm text-slate-400 font-bold uppercase tracking-widest">(Permanent)</span>
                            </h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed break-keep">
                                번개를 다 쓰면 사용되는 유료 재화예요. <br />
                                <span className="text-slate-900 dark:text-white font-black underline decoration-indigo-200/50 decoration-4 underline-offset-4">사용 전까지 영구히</span> 사라지지 않고 안전하게 보관됩니다.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Section 2: Data Retention - Open Branding */}
                <div className="space-y-12">
                    <div className="flex flex-col items-center sm:items-start gap-2">
                        <div className="flex items-center gap-2 text-rose-500 font-black text-xs uppercase tracking-[0.2em]">
                            <div className="w-8 h-[2px] bg-rose-500" />
                            Step 02
                        </div>
                        <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                            데이터 <span className="font-serif italic text-rose-600 dark:text-rose-400">보관 가이드</span>
                        </h2>
                    </div>

                    <div className="space-y-12 sm:space-y-16">
                        {/* Auto Delete */}
                        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 group">
                            <div className="w-14 h-14 rounded-2xl bg-rose-50 dark:bg-rose-900/20 flex items-center justify-center shrink-0">
                                <TrashIcon className="w-7 h-7 text-rose-500" />
                            </div>
                            <div className="text-center sm:text-left">
                                <h4 className="font-black text-slate-900 dark:text-white text-xl mb-3">자동 삭제 정책</h4>
                                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed break-keep">
                                    서버 부하를 줄이기 위해 오래된 내역은 사자가 직접 비워요. <br />
                                    최신 분석 결과 위주로 보관되는 점 참고해 주세요.
                                </p>
                            </div>
                        </div>

                        {/* SazaTalk Permanent */}
                        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 group">
                            <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center shrink-0">
                                <BookmarkIcon className="w-7 h-7 text-indigo-500" />
                            </div>
                            <div className="text-center sm:text-left">
                                <h4 className="font-black text-slate-900 dark:text-white text-xl mb-3">사자톡 영구 저장</h4>
                                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed break-keep">
                                    상담 도중 마음에 드는 답변을 발견했다면? <br />
                                    <span className="text-indigo-600 dark:text-indigo-400 font-black decoration-indigo-200 decoration-2 underline-offset-4 underline">최대 3개까지 영구 보관함</span>에 쏙 넣어서 소장할 수 있어요.
                                </p>
                            </div>
                        </div>

                        {/* Share Bonus */}
                        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 group">
                            <div className="w-14 h-14 rounded-2xl bg-sky-50 dark:bg-sky-900/20 flex items-center justify-center shrink-0">
                                <ShareIcon className="w-7 h-7 text-sky-500" />
                            </div>
                            <div className="text-center sm:text-left">
                                <h4 className="font-black text-slate-900 dark:text-white text-xl mb-3">공유 보너스</h4>
                                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed break-keep">
                                    분석 결과를 친구와 공유하면, <br />
                                    해당 내역의 온라인 보관 기간이 <span className="text-sky-600 dark:text-sky-400 font-black decoration-sky-200 decoration-2 underline-offset-4 underline">공유 시점부터 7일간</span> 더 늘어납니다!
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Section 3: FAQ - Minimal Style */}
                <div className="space-y-12">
                    <div className="flex flex-col items-center sm:items-start gap-2">
                        <div className="flex items-center gap-2 text-slate-400 font-black text-xs uppercase tracking-[0.2em]">
                            <div className="w-8 h-[2px] bg-slate-200 dark:bg-slate-700" />
                            FAQ
                        </div>
                        <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">자주 묻는 질문</h2>
                    </div>

                    <div className="space-y-4">
                        {faqData.map((faq, idx) => (
                            <div
                                key={idx}
                                className="border-b border-slate-100 dark:border-slate-800 pb-4 transition-all duration-300"
                            >
                                <button
                                    onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                                    className="w-full py-4 flex items-center justify-between text-left group"
                                >
                                    <span className={`text-lg font-extrabold transition-colors duration-300 ${openFaq === idx ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-800 dark:text-slate-200 group-hover:text-indigo-500'}`}>
                                        {faq.q}
                                    </span>
                                    {openFaq === idx ? (
                                        <ChevronUpIcon className="w-5 h-5 text-indigo-500 shrink-0" />
                                    ) : (
                                        <ChevronDownIcon className="w-5 h-5 text-slate-300 shrink-0 group-hover:text-indigo-300" />
                                    )}
                                </button>
                                {openFaq === idx && (
                                    <div className="pb-6 text-sm font-medium text-slate-500 dark:text-slate-400 leading-relaxed animate-in fade-in slide-in-from-top-2 duration-300 break-keep">
                                        {faq.a}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Bottom CTA */}
                <div className="text-center py-6">
                    <p className="text-sm font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-4">
                        Still have questions?
                    </p>
                    <button
                        onClick={() => window.location.href = 'mailto:doobuhanmo3@gmail.com'}
                        className="px-8 py-3.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black text-sm shadow-xl active:scale-95 transition-all"
                    >
                        1:1 문의하기
                    </button>
                </div>

            </div>
        </div>
    );
}
