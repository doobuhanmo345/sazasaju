'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { db } from '@/lib/firebase';
import { collection, query, where, onSnapshot, orderBy, doc, updateDoc, writeBatch, deleteDoc } from 'firebase/firestore';
import { useAuthContext } from '@/contexts/useAuthContext';
import { useLanguage } from '@/contexts/useLanguageContext';
import { InboxStackIcon, ChatBubbleLeftRightIcon, UserCircleIcon } from '@heroicons/react/24/outline';
import MessageModal from '@/app/messages/MessageModal';
import SazaTalkResultModal from '@/components/SazaTalkResultModal';
import SazaTalkMessageItem from '@/components/SazaTalkMessageItem';

export default function MessagesPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <MessagesContent />
    </Suspense>
  );
}

function MessagesContent() {
  const { user } = useAuthContext();
  const { language } = useLanguage();
  const searchParams = useSearchParams();
  const view = searchParams.get('view');
  const [messages, setMessages] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const [sazaTalkModalOpen, setSazaTalkModalOpen] = useState(false);
  const [selectedSazaTalk, setSelectedSazaTalk] = useState(null);

  useEffect(() => {
    if (!user) return;
    setCurrentPage(1); // 유저가 바뀌면 페이지 초기화

    // 인덱스 생성 오류를 방지하기 위해 쿼리에서 orderBy를 제거하고 메모리에서 정렬합니다.
    const q_sent = query(collection(db, 'direct_messages'), where('senderId', '==', user.uid));
    const q_received = query(collection(db, 'direct_messages'), where('receiverId', '==', user.uid));
    const q_sazatalk = query(collection(db, 'sazatalk_messages'), where('userId', '==', user.uid));

    const unsubscribeSent = onSnapshot(q_sent, (snap) => {
      const sent = snap.docs.map(doc => ({ id: doc.id, type: 'sent', messageType: 'direct', ...doc.data() }));
      updateMessages(sent, 'sent');
    }, (error) => {
      console.error('Error fetching sent messages:', error);
    });

    const unsubscribeReceived = onSnapshot(q_received, (snap) => {
      const received = snap.docs.map(doc => ({ id: doc.id, type: 'received', messageType: 'direct', ...doc.data() }));
      updateMessages(received, 'received');

      // 읽지 않은 메시지 자동 읽음 처리
      const unread = received.filter(m => !m.isRead);
      if (unread.length > 0) {
        const batch = writeBatch(db);
        unread.forEach(m => {
          batch.update(doc(db, 'direct_messages', m.id), { isRead: true });
        });
        batch.commit().catch(err => console.error('Error marking as read:', err));
      }
    }, (error) => {
      console.error('Error fetching received messages:', error);
    });

    const unsubscribeSazaTalk = onSnapshot(q_sazatalk, (snap) => {
      const sazaTalkMsgs = snap.docs.map(doc => ({ id: doc.id, type: 'sazatalk', messageType: 'sazatalk', ...doc.data() }));
      updateMessages(sazaTalkMsgs, 'sazatalk');

      // 읽지 않은 사자톡 메시지 자동 읽음 처리
      const unread = sazaTalkMsgs.filter(m => !m.isRead);
      if (unread.length > 0) {
        const batch = writeBatch(db);
        unread.forEach(m => {
          batch.update(doc(db, 'sazatalk_messages', m.id), { isRead: true });
        });
        batch.commit().catch(err => console.error('Error marking SazaTalk as read:', err));
      }
    }, (error) => {
      console.error('Error fetching SazaTalk messages:', error);
    });

    return () => {
      unsubscribeSent();
      unsubscribeReceived();
      unsubscribeSazaTalk();
    };
  }, [user?.uid]);

  const [allMsgs, setAllMsgs] = useState({ sent: [], received: [], sazatalk: [] });
  const updateMessages = (newMsgs, type) => {
    setAllMsgs(prev => {
      const updated = { ...prev, [type]: newMsgs };

      // Use a Map to deduplicate messages by ID. 
      // If the same message exists in both 'sent' and 'received' arrays (e.g., user sent a message to themselves),
      // filtering by ID ensures unique keys for React.
      const map = new Map();
      [...updated.sent, ...updated.received, ...updated.sazatalk].forEach(msg => {
        // If message is already present, we keep the one already in the map.
        // Usually 'received' messages are fetched after 'sent' in the logic, or vice versa.
        if (!map.has(msg.id)) {
          map.set(msg.id, msg);
        }
      });

      const merged = Array.from(map.values()).sort((a, b) =>
        (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)
      );

      setMessages(merged);
      return updated;
    });
  };

  useEffect(() => {
    if (view === 'latest_saza' && messages.length > 0) {
      const latestSaza = messages.find(m => m.messageType === 'sazatalk');
      if (latestSaza) {
        setSelectedSazaTalk(latestSaza);
        setSazaTalkModalOpen(true);
        // URL 클린업
        window.history.replaceState({}, '', window.location.pathname);
      }
    }
  }, [view, messages]);

  // SazaTalk message handlers
  const handleSazaTalkClick = (message) => {
    setSelectedSazaTalk(message);
    setSazaTalkModalOpen(true);
  };

  const handleSazaTalkSave = async (messageId) => {
    try {
      await updateDoc(doc(db, 'sazatalk_messages', messageId), { isSaved: true });
      alert(language === 'ko' ? '저장되었습니다!' : 'Saved!');
    } catch (error) {
      console.error('Failed to save SazaTalk message:', error);
      alert(language === 'ko' ? '저장 실패' : 'Failed to save');
    }
  };

  const handleSazaTalkDelete = async (messageId) => {
    if (!confirm(language === 'ko' ? '정말 삭제하시겠습니까?' : 'Are you sure you want to delete?')) {
      return;
    }
    try {
      await deleteDoc(doc(db, 'sazatalk_messages', messageId));
      alert(language === 'ko' ? '삭제되었습니다.' : 'Deleted.');
      setSazaTalkModalOpen(false);
    } catch (error) {
      console.error('Failed to delete SazaTalk message:', error);
      alert(language === 'ko' ? '삭제 실패' : 'Failed to delete');
    }
  };

  // 페이지네이션 계산
  const totalPages = Math.ceil(messages.length / itemsPerPage);
  const currentItems = messages.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black tracking-tighter text-slate-900 dark:text-white uppercase">
            Message <span className="text-purple-600">Box</span>
          </h1>
          <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse"></span>
            Direct Communications
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg hover:scale-105 transition-all active:scale-95 flex items-center gap-2"
        >
          <ChatBubbleLeftRightIcon className="w-4 h-4" />
          {language === 'ko' ? '새 문의하기' : 'New Inquiry'}
        </button>
      </header>

      {/* 미니 게시판 형태의 메시지 리스트 */}
      <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="divide-y divide-slate-50 dark:divide-slate-800/50">
          {currentItems.length > 0 ? (
            currentItems.map((msg) => (
              msg.messageType === 'sazatalk' ? (
                <SazaTalkMessageItem
                  key={msg.id}
                  message={msg}
                  onClick={() => handleSazaTalkClick(msg)}
                  onSave={handleSazaTalkSave}
                  onDelete={handleSazaTalkDelete}
                />
              ) : (
                <div
                  key={msg.id}
                  className="group px-6 py-4 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`p-1.5 rounded-lg shrink-0 ${msg.type === 'sent' ? 'bg-slate-100 dark:bg-slate-800' : 'bg-purple-100 dark:bg-purple-900/30'}`}>
                        <UserCircleIcon className={`w-4 h-4 ${msg.type === 'sent' ? 'text-slate-500' : 'text-purple-600 dark:text-purple-400'}`} />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${msg.type === 'sent' ? 'bg-slate-100 text-slate-500' : 'bg-purple-100 text-purple-600'}`}>
                            {msg.type === 'sent' ? 'Sent' : 'Received'}
                          </span>
                          <span className="text-[10px] font-black text-slate-900 dark:text-white truncate">
                            {msg.type === 'sent' ? msg.receiverName : msg.senderName}
                          </span>
                          {msg.type === 'received' && !msg.isRead && (
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
                          )}
                        </div>
                        <p className="text-xs font-medium text-slate-600 dark:text-slate-400 truncate group-hover:whitespace-normal">
                          {msg.text}
                        </p>
                      </div>
                    </div>
                    <div className="shrink-0 text-right">
                      <span className="text-[9px] font-bold text-slate-400 uppercase">
                        {msg.createdAt ? msg.createdAt.toDate().toLocaleDateString() : '...'}
                      </span>
                    </div>
                  </div>
                </div>
              )
            ))
          ) : (
            <div className="py-20 flex flex-col items-center justify-center text-center">
              <InboxStackIcon className="w-12 h-12 text-slate-100 dark:text-slate-800 mb-4" />
              <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-1">No conversations</h3>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">History will appear here</p>
            </div>
          )}
        </div>

        {/* 페이지네이션 컨트롤 */}
        {totalPages > 1 && (
          <div className="p-4 bg-slate-50/50 dark:bg-slate-800/20 border-t border-slate-50 dark:border-slate-800 flex justify-center items-center gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 text-[10px] font-black text-slate-400 hover:text-purple-600 disabled:opacity-30 uppercase tracking-widest transition-all"
            >
              Prev
            </button>
            <div className="flex gap-1">
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`w-6 h-6 rounded-lg text-[10px] font-black transition-all ${currentPage === i + 1
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-500/30'
                    : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 text-[10px] font-black text-slate-400 hover:text-purple-600 disabled:opacity-30 uppercase tracking-widest transition-all"
            >
              Next
            </button>
          </div>
        )}
      </div>

      <MessageModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />

      {sazaTalkModalOpen && selectedSazaTalk && (
        <SazaTalkResultModal
          question={selectedSazaTalk.question}
          answer={selectedSazaTalk.answer}
          onClose={() => setSazaTalkModalOpen(false)}
          messageId={selectedSazaTalk.id}
          isSaved={selectedSazaTalk.isSaved}
          onSave={handleSazaTalkSave}
          onDelete={handleSazaTalkDelete}
        />
      )}
    </div>
  );
}
