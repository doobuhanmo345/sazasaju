'use client';

import { useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp, writeBatch, doc } from 'firebase/firestore';
import { useAuthContext } from '@/contexts/useAuthContext';
import { XMarkIcon, PaperAirplaneIcon, MegaphoneIcon } from '@heroicons/react/24/outline';

export default function BatchMessageModal({ isOpen, onClose, selectedUsers = [] }) {
    const { user, userData } = useAuthContext();
    const [text, setText] = useState('');
    const [title, setTitle] = useState(''); // For Popup
    const [messageType, setMessageType] = useState('standard'); // 'standard' | 'popup'
    const [isSending, setIsSending] = useState(false);

    if (!isOpen) return null;

    const handleSend = async () => {
        if (!text.trim() || isSending) return;
        setIsSending(true);

        try {
            const batch = writeBatch(db);

            // Process in chunks if too many, but for now assuming < 500
            // Actually writeBatch has 500 limit. 
            // If we are just adding docs, we might use Promise.all for parallel adds instead of batch if we are adding to different collections? 
            // No, batch is better for atomicity but 'direct_messages' are separate docs.

            // Let's use Promise.all for flexibility and because we might be adding to multiple collections per user (DM + Notification)

            const promises = selectedUsers.map(async (targetUser) => {
                console.log(`[BatchMessage] Processing user: ${targetUser.displayName} (${targetUser.id}) - Type: ${messageType}`);

                if (messageType === 'standard') {
                    // 1. Create Direct Message
                    const msgRef = await addDoc(collection(db, 'direct_messages'), {
                        senderId: user.uid,
                        senderName: userData?.displayName || 'Admin',
                        receiverId: targetUser.id,
                        receiverName: targetUser.displayName || 'User',
                        text: text.trim(),
                        isRead: false,
                        createdAt: serverTimestamp(),
                    });

                    // 2. Create Notification (standard)
                    await addDoc(collection(db, 'notifications'), {
                        userId: targetUser.id,
                        title: '새 메시지 도착',
                        message: '관리자로부터 새로운 메시지가 도착했습니다.',
                        type: 'message',
                        sourceMessageId: msgRef.id,
                        isRead: false,
                        createdAt: serverTimestamp(),
                        targetPath: '/messages',
                    });
                } else {
                    // Global Popup Notification
                    console.log(`[BatchMessage] Writing Global Popup for ${targetUser.id}`);
                    await addDoc(collection(db, 'notifications'), {
                        userId: targetUser.id,
                        title: title.trim() || '알림',
                        message: text.trim(),
                        type: 'global_popup',
                        isRead: false,
                        createdAt: serverTimestamp(),
                        senderId: user.uid,
                    });
                }
            });

            await Promise.all(promises);

            setText('');
            setTitle('');
            onClose();
            alert(`Successfully sent to ${selectedUsers.length} users!`);
        } catch (error) {
            console.error('Error sending batch messages:', error);
            alert('Failed to send: ' + error.message);
        } finally {
            setIsSending(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[250] flex items-center justify-center p-6">
            <div
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                onClick={onClose}
            />

            <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl border border-white/20 overflow-hidden">

                {/* Header */}
                <div className="relative p-6 pt-8 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/30 border-b border-slate-100 dark:border-slate-800">
                    <div>
                        <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">
                            Batch Message
                        </h3>
                        <p className="text-sm font-medium text-slate-500 mt-1">
                            Sending to <span className="text-blue-600 font-black">{selectedUsers.length}</span> users
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-400"
                    >
                        <XMarkIcon className="w-6 h-6" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-8 space-y-6">

                    {/* Type Selection */}
                    <div className="flex gap-4">
                        <button
                            onClick={() => setMessageType('standard')}
                            className={`flex-1 p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${messageType === 'standard'
                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                                : 'border-slate-100 dark:border-slate-800 text-slate-400 hover:border-slate-300'
                                }`}
                        >
                            <PaperAirplaneIcon className="w-6 h-6" />
                            <span className="text-xs font-bold uppercase">Standard DM</span>
                        </button>
                        <button
                            onClick={() => setMessageType('popup')}
                            className={`flex-1 p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${messageType === 'popup'
                                ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300'
                                : 'border-slate-100 dark:border-slate-800 text-slate-400 hover:border-slate-300'
                                }`}
                        >
                            <MegaphoneIcon className="w-6 h-6" />
                            <span className="text-xs font-bold uppercase">Global Popup</span>
                        </button>
                    </div>

                    {/* Inputs */}
                    <div className="space-y-4">
                        {messageType === 'popup' && (
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Popup Title</label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="w-full p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-purple-500 outline-none"
                                    placeholder="Announcement Title"
                                />
                            </div>
                        )}

                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Message Content</label>
                            <textarea
                                value={text}
                                onChange={(e) => setText(e.target.value)}
                                placeholder="Type your message..."
                                className="w-full h-32 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                            />
                        </div>
                    </div>

                    {/* Action */}
                    <button
                        onClick={handleSend}
                        disabled={!text.trim() || isSending}
                        className={`w-full py-4 rounded-xl font-black uppercase tracking-widest text-sm text-white shadow-lg transition-transform active:scale-95 ${isSending ? 'bg-slate-400 cursor-not-allowed' :
                            messageType === 'popup' ? 'bg-purple-600 hover:bg-purple-700 shadow-purple-500/30' :
                                'bg-blue-600 hover:bg-blue-700 shadow-blue-500/30'
                            }`}
                    >
                        {isSending ? 'Sending...' : `Send to ${selectedUsers.length} Users`}
                    </button>

                </div>
            </div>
        </div>
    );
}
