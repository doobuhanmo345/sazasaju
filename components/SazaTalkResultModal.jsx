'use client';

import { parseAiResponse } from '@/utils/helpers';
import { aiSajuStyle } from '@/data/aiResultConstants';
import { XMarkIcon, ClipboardDocumentIcon, CameraIcon, TrashIcon } from '@heroicons/react/24/outline';
import { useLanguage } from '@/contexts/useLanguageContext';
import { useRef } from 'react';
import html2canvas from 'html2canvas';

/**
 * Reusable modal for displaying SazaTalk results
 * Can be used from MessagesPage or SazaTalkClient
 */
export default function SazaTalkResultModal({ question, answer, onClose, messageId, isSaved, onSave, onDelete }) {
    const { language } = useLanguage();
    const contentRef = useRef(null);

    const parsedData = parseAiResponse(answer) || {};

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(answer);
            alert(language === 'ko' ? '복사되었습니다.' : 'Copied to clipboard.');
        } catch (err) {
            console.error('Failed to copy text: ', err);
        }
    };

    const handleCapture = async () => {
        if (!contentRef.current) return;

        const original = contentRef.current;
        const container = document.createElement('div');
        container.style.position = 'fixed';
        container.style.top = '0';
        container.style.left = '-9999px';
        container.style.zIndex = '-9999';
        container.style.width = '550px';
        document.body.appendChild(container);

        const clone = original.cloneNode(true);
        clone.style.width = '100%';
        clone.style.height = 'auto';
        clone.style.maxHeight = 'none';
        clone.style.overflow = 'visible';
        clone.style.borderRadius = '0';
        clone.style.background = '#ffffff';

        container.appendChild(clone);
        await new Promise(resolve => setTimeout(resolve, 300));

        try {
            const canvas = await html2canvas(clone, {
                backgroundColor: '#ffffff',
                scale: 2,
                useCORS: true,
                windowWidth: 550,
            });

            const link = document.createElement('a');
            link.download = `sazatalk_${new Date().toISOString().slice(0, 10)}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
        } catch (err) {
            console.error('Failed to capture image: ', err);
            alert(language === 'ko' ? '이미지 저장에 실패했습니다.' : 'Failed to save image.');
        } finally {
            document.body.removeChild(container);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-slate-100 dark:border-slate-800 animate-in zoom-in-95 duration-300">
                {/* Modal Header */}
                <div className="px-6 py-4 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between bg-violet-50/50 dark:bg-violet-900/10">
                    <div className="flex items-center gap-2 text-violet-600 dark:text-violet-400">
                        <span className="text-2xl">🦁</span>
                        <h2 className="font-black tracking-tight">
                            {language === 'ko' ? '사자톡 상담 내역' : 'SazaTalk Consultation'}
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-white dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 transition-colors"
                        aria-label="Close"
                    >
                        <XMarkIcon className="w-6 h-6" />
                    </button>
                </div>

                {/* Modal Content */}
                <div ref={contentRef} className="p-6 max-h-[70vh] overflow-y-auto space-y-6">
                    <div>
                        <div className="text-xs font-black text-violet-500 uppercase mb-2 tracking-widest">
                            {language === 'ko' ? '질문' : 'Question'}
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                            <p className="text-sm font-bold text-slate-700 dark:text-slate-200">
                                {question}
                            </p>
                        </div>
                    </div>

                    <div>
                        <div className="text-xs font-black text-violet-500 uppercase mb-2 tracking-widest">
                            {language === 'ko' ? '사자의 답변' : "Saza's Answer"}
                        </div>
                        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-violet-100/50 dark:border-violet-900/20 shadow-sm overflow-hidden text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                            {parsedData && (parsedData?.contents || parsedData?.saza) ? (
                                <div className="leading-8 w-full">
                                    {parsedData?.contents && Array.isArray(parsedData?.contents) ? (
                                        parsedData.contents.map((i, idx) => {
                                            if (typeof i === 'object' && i !== null) {
                                                return (
                                                    <div key={idx} className="mb-2">
                                                        {i.title && <strong className="block text-indigo-700 dark:text-indigo-300">{i.title}</strong>}
                                                        {i.detail && <p>{i.detail}</p>}
                                                        {!i.title && !i.detail && <p>{JSON.stringify(i)}</p>}
                                                    </div>
                                                );
                                            }
                                            return <p key={idx}>{i}</p>;
                                        })
                                    ) : (
                                        <p>{typeof parsedData?.contents === 'string' ? parsedData?.contents : ''}</p>
                                    )}

                                    {parsedData?.saza && (
                                        <div className="mt-4 pt-4 border-t border-slate-50 dark:border-slate-700">
                                            <strong className="text-indigo-600 dark:text-indigo-400 block mb-1">
                                                {language !== 'ko' ? "Saza's Advice" : '사자의 조언'}
                                            </strong>
                                            {typeof parsedData?.saza === 'object' ? (
                                                <div className="text-sm">
                                                    {parsedData?.saza?.category && (
                                                        <span className="inline-block px-2 py-0.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded text-xs font-bold mr-2">
                                                            {parsedData?.saza?.category}
                                                        </span>
                                                    )}
                                                    <p className="inline italic">"{parsedData?.saza?.advice}"</p>
                                                </div>
                                            ) : (
                                                <p className="italic">"{parsedData?.saza}"</p>
                                            )}
                                        </div>
                                    )}
                                    {aiSajuStyle && <div dangerouslySetInnerHTML={{ __html: aiSajuStyle }} />}
                                </div>
                            ) : (
                                <div className="text-slate-400 text-xs italic p-2 text-center">
                                    {language === 'ko' ? '내용을 불러올 수 없습니다.' : 'No content available'}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="px-6 py-3 flex justify-between items-center bg-white dark:bg-slate-900 border-t border-slate-50 dark:border-slate-800">
                    <div className="flex gap-2">
                        <button
                            onClick={handleCopy}
                            className="flex items-center gap-1 text-xs sm:text-xs text-slate-400 hover:text-slate-600 transition-colors px-2 py-1 rounded-md hover:bg-slate-50 dark:hover:bg-slate-800"
                        >
                            <ClipboardDocumentIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                            {language === 'ko' ? '복사' : 'Copy'}
                        </button>
                        <button
                            onClick={handleCapture}
                            className="flex items-center gap-1 text-xs sm:text-xs text-slate-400 hover:text-slate-600 transition-colors px-2 py-1 rounded-md hover:bg-slate-50 dark:hover:bg-slate-800"
                        >
                            <CameraIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                            {language === 'ko' ? '저장' : 'Save'}
                        </button>
                    </div>

                    {messageId && (
                        <div className="flex gap-2">
                            {onSave && (
                                <button
                                    onClick={() => onSave(messageId)}
                                    className={`px-4 py-2 text-xs font-black uppercase tracking-widest rounded-xl transition-all shadow-sm ${isSaved
                                        ? 'bg-amber-100 text-amber-600 border border-amber-200'
                                        : 'bg-violet-600 text-white hover:bg-violet-700'
                                        }`}
                                >
                                    {isSaved ? (language === 'ko' ? '저장됨' : 'Saved') : (language === 'ko' ? '저장하기' : 'Save')}
                                </button>
                            )}
                            {onDelete && (
                                <button
                                    onClick={() => onDelete(messageId)}
                                    className="px-4 py-2 bg-red-50 text-red-500 hover:bg-red-100 text-xs font-black uppercase tracking-widest rounded-xl transition-all border border-red-100"
                                >
                                    {language === 'ko' ? '삭제' : 'Delete'}
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer Note */}
                {!isSaved && (
                    <div className="p-4 bg-slate-50/50 dark:bg-slate-800/20 text-center">
                        <p className="text-sm text-slate-400 break-keep leading-relaxed font-medium">
                            {language === 'ko'
                                ? '저장하지 않으면 최근 3개만 자동 보관되며,\n새로운 상담 시 오래된 내역은 삭제됩니다.'
                                : 'Only the last 3 unsaved consultations are kept.\nOlder ones will be deleted when new consultations are created.'}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
