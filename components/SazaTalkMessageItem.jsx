'use client';

import { useLanguage } from '@/contexts/useLanguageContext';

/**
 * Message item component for SazaTalk messages in inbox
 */
export default function SazaTalkMessageItem({ message, onClick, onSave, onDelete }) {
    const { language } = useLanguage();

    const formatTimestamp = (timestamp) => {
        if (!timestamp) return '';
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return language === 'ko' ? '방금 전' : 'Just now';
        if (diffMins < 60) return language === 'ko' ? `${diffMins}분 전` : `${diffMins}m ago`;
        if (diffHours < 24) return language === 'ko' ? `${diffHours}시간 전` : `${diffHours}h ago`;
        if (diffDays < 7) return language === 'ko' ? `${diffDays}일 전` : `${diffDays}d ago`;
        return date.toLocaleDateString();
    };

    return (
        <div
            onClick={onClick}
            className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer border-b border-slate-100 dark:border-slate-800 last:border-b-0"
        >
            <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                    {/* Sender */}
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-xl">🦁</span>
                        <span className="font-black text-sm text-violet-600 dark:text-violet-400">
                            {language === 'ko' ? '사자 (Saza)' : 'Saza'}
                        </span>
                        {message.isSaved && (
                            <span className="px-2 py-0.5 bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 text-[9px] font-bold rounded-full">
                                {language === 'ko' ? '저장됨' : 'Saved'}
                            </span>
                        )}
                        {!message.isRead && (
                            <span className="w-2 h-2 bg-violet-500 rounded-full"></span>
                        )}
                    </div>

                    {/* Question Preview */}
                    <p className="text-sm text-slate-700 dark:text-slate-300 font-medium line-clamp-2 mb-1">
                        "{message.question}"
                    </p>

                    {/* Timestamp */}
                    <p className="text-[10px] text-slate-400 dark:text-slate-500">
                        {formatTimestamp(message.createdAt)}
                    </p>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                    {!message.isSaved && onSave && (
                        <button
                            onClick={() => onSave(message.id)}
                            className="px-2 py-1 text-[10px] font-bold text-violet-600 dark:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-900/20 rounded-lg transition-colors"
                        >
                            💾
                        </button>
                    )}
                    {message.isSaved && onDelete && (
                        <button
                            onClick={() => onDelete(message.id)}
                            className="px-2 py-1 text-[10px] font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        >
                            🗑️
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
