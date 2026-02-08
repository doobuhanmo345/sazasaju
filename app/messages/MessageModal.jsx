'use client';

import { useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp, doc, updateDoc } from 'firebase/firestore';
import { useAuthContext } from '@/contexts/useAuthContext';
import { XMarkIcon, PaperAirplaneIcon } from '@heroicons/react/24/outline';
import { useLanguage } from '@/contexts/useLanguageContext';

export default function MessageModal({ isOpen, onClose, receiverId = 'admin', receiverName = 'Admin', originalMessageId = null }) {
  const { user, userData } = useAuthContext();
  const [text, setText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const { language } = useLanguage();
  if (!isOpen) return null;

  const handleSend = async () => {
    if (!text.trim() || isSending) return;
    if (!user) {
      alert('You must be logged in to send messages.');
      return;
    }
    setIsSending(true);

    try {
      const msgRef = await addDoc(collection(db, 'direct_messages'), {
        senderId: user.uid,
        senderName: userData?.displayName || user.email || 'Anonymous',
        receiverId: receiverId,
        receiverName: receiverName,
        text: text.trim(),
        isRead: false,
        createdAt: serverTimestamp(),
      });
      const messageId = msgRef.id;

      // 알림 발송 로직
      try {
        if (receiverId === 'admin') {
          await addDoc(collection(db, 'notifications'), {
            targetRole: 'admin',
            title: '새 문의 도착',
            message: `[${userData?.displayName || '유저'}] ${text.trim().substring(0, 30)}${text.length > 30 ? '...' : ''}`,
            type: 'message',
            senderId: user.uid,
            senderName: userData?.displayName || 'User',
            sourceMessageId: messageId,
            isRead: false,
            createdAt: serverTimestamp(),
            targetPath: '/admin', // 관리자는 어드민 페이지로
          });
        } else {
          await addDoc(collection(db, 'notifications'), {
            userId: receiverId,
            title: '새 메시지 도착',
            message: '관리자로부터 새로운 메시지가 도착했습니다.',
            type: 'message',
            sourceMessageId: messageId,
            isRead: false,
            createdAt: serverTimestamp(),
            targetPath: '/messages', // 유저는 메시지함으로
          });
        }
      } catch (notifError) {
        console.error('Error sending notification:', notifError);
      }

      if (originalMessageId) {
        try {
          await updateDoc(doc(db, 'direct_messages', originalMessageId), {
            isProcessed: true
          });
        } catch (updateError) {
          console.error('Error marking as processed:', updateError);
        }
      }

      setText('');
      onClose();
      alert('Message sent successfully!');
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message: ' + (error.message || 'Unknown error'));
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[210] flex items-center justify-center p-6">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl border border-white/20 overflow-hidden transform animate-in zoom-in-95 duration-300">

        {/* Decorative Background */}
        <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-blue-500/10 to-transparent pointer-events-none" />

        {/* Header */}
        <div className="relative p-6 pt-8 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/30 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">
              {language === 'ko' ? '문의하기' : 'Send Message'}
            </h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
              {language === 'ko' ? '수신자: ' : 'To: '} <span className="text-blue-600 font-black">{receiverName}</span>
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
        <div className="relative p-8 space-y-6">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={language === 'ko' ? '문의하시려는 내용을 입력해주세요...' : 'Type your inquiry or message here...'}
            className="w-full h-48 p-5 bg-slate-50 dark:bg-slate-800/50 text-slate-800 dark:text-slate-200 rounded-3xl border border-slate-100 dark:border-slate-800 outline-none focus:ring-2 focus:ring-blue-500/50 transition-all resize-none text-sm leading-relaxed"
          />

          <button
            onClick={handleSend}
            disabled={!text.trim() || isSending}
            className={`w-full py-5 rounded-[1.5rem] font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all active:scale-95 shadow-xl ${isSending || !text.trim()
              ? 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none'
              : 'bg-blue-600 text-white shadow-blue-500/30 hover:bg-blue-700'
              }`}
          >
            {isSending ? (
              <span className="animate-pulse">{language === 'ko' ? '전송 중...' : 'Sending...'}</span>
            ) : (
              <>
                {language === 'ko' ? '메시지 전송하기' : 'Confirm & Send'}
                <PaperAirplaneIcon className="w-4 h-4" />
              </>
            )}
          </button>

          <p className="text-center text-[10px] text-slate-400 font-bold uppercase tracking-widest">
            {language === 'ko'
              ? '관리자 확인 후 답변해 드립니다'
              : 'Admin will reply after review'}
          </p>
        </div>
      </div>
    </div>
  );
}
