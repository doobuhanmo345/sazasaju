'use client';

import React from 'react';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

/**
 * 범용 확인 모달. window.confirm() 대체용.
 * Props:
 *   isOpen: boolean
 *   title: string
 *   message: string
 *   confirmLabel: string  (default: '확인')
 *   cancelLabel: string   (default: '취소')
 *   onConfirm: () => void
 *   onCancel: () => void
 *   danger: boolean       (확인 버튼을 red로)
 */
export default function ConfirmModal({
    isOpen,
    title = '확인',
    message,
    confirmLabel = '확인',
    cancelLabel = '취소',
    onConfirm,
    onCancel,
    danger = false,
}) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200"
                onClick={onCancel}
            />

            {/* Modal */}
            <div className="relative w-full max-w-sm mx-4 sm:mx-auto animate-in slide-in-from-bottom duration-300 mb-8 sm:mb-0">
                <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-slate-100 dark:border-slate-700">
                    {/* Body */}
                    <div className="p-7 text-center">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 ${danger ? 'bg-red-50' : 'bg-slate-100'}`}>
                            <ExclamationTriangleIcon className={`w-7 h-7 ${danger ? 'text-red-500' : 'text-slate-500'}`} />
                        </div>
                        <h2 className="text-lg font-black text-slate-800 dark:text-white mb-2">{title}</h2>
                        {message && (
                            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{message}</p>
                        )}
                    </div>

                    {/* Buttons */}
                    <div className="flex border-t border-slate-100 dark:border-slate-700 divide-x divide-slate-100 dark:divide-slate-700">
                        <button
                            onClick={onCancel}
                            className="flex-1 py-4 text-sm font-bold text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                        >
                            {cancelLabel}
                        </button>
                        <button
                            onClick={onConfirm}
                            className={`flex-1 py-4 text-sm font-black transition-colors ${danger
                                    ? 'text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20'
                                    : 'text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20'
                                }`}
                        >
                            {confirmLabel}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
