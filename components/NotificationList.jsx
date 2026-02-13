'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { collection, query, where, onSnapshot, updateDoc, doc, getFirestore, writeBatch } from 'firebase/firestore';
import { useAuthContext } from '@/contexts/useAuthContext';
import { BellIcon, CheckIcon, XMarkIcon, InboxIcon, ChatBubbleLeftEllipsisIcon } from '@heroicons/react/24/outline';
import { useLanguage } from '@/contexts/useLanguageContext';


export default function NotificationList() {
  const { user, userData, openMessageModal } = useAuthContext();
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  // const [isMessageModalOpen, setIsMessageModalOpen] = useState(false); // Removed local state
  const [selectedUserForReply, setSelectedUserForReply] = useState(null);
  const [selectedMsgId, setSelectedMsgId] = useState(null);
  const dropdownRef = useRef(null);
  const { language } = useLanguage();
  const router = useRouter();

  const handleNotificationClick = async (note) => {
    // 1. Mark as read
    if (!note.isRead) {
      await handleMarkAsRead(note.id);
    }
    // 2. Redirect if targetPath exists
    if (note.targetPath) {
      const dest = typeof note.targetPath === 'object' ? note.targetPath.path : note.targetPath;
      if (dest) {
        router.push(dest);
        setIsOpen(false); // Close dropdown
      }
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  // 알림창 바깥 클릭 시 닫기 로직
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const [personalNotifications, setPersonalNotifications] = useState([]);
  const [roleNotifications, setRoleNotifications] = useState([]);

  useEffect(() => {
    if (!user) return;

    // 1. 개인 알림 감시
    const q_personal = query(collection(db, 'notifications'), where('userId', '==', user.uid));
    const unsub_personal = onSnapshot(q_personal, (snap) => {
      setPersonalNotifications(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    }, err => console.error('😡Personal notif error:', err));

    // 2. 관리자용 역할 알림 감시 (관리자/슈퍼관리자만)
    let unsub_role = () => { };
    if (userData?.role === 'admin' || userData?.role === 'super_admin') {
      const q_role = query(collection(db, 'notifications'), where('targetRole', '==', 'admin'));
      unsub_role = onSnapshot(q_role, (snap) => {
        setRoleNotifications(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      }, err => {
        if (err.code === 'permission-denied') {
          console.warn('Role notification permission denied (normal for non-admins).');
        } else {
          console.error('😡Role notif error:', err);
        }
      });
    } else {
      setRoleNotifications([]);
    }

    return () => {
      unsub_personal();
      unsub_role();
    };
  }, [user, userData?.role]);

  // 알림 합치기 및 정렬
  useEffect(() => {
    const merged = [...personalNotifications, ...roleNotifications].sort((a, b) => {
      const timeA = a.createdAt?.seconds || 0;
      const timeB = b.createdAt?.seconds || 0;
      return timeB - timeA;
    });
    setNotifications(merged.slice(0, 15));
  }, [personalNotifications, roleNotifications]);

  const handleMarkAsRead = async (id) => {
    try {
      await updateDoc(doc(db, 'notifications', id), { isRead: true });
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllAsRead = async () => {
    const unreadNotes = notifications.filter(n => !n.isRead);
    if (unreadNotes.length === 0) return;

    try {
      const batch = writeBatch(db);
      unreadNotes.forEach(note => {
        const docRef = doc(db, 'notifications', note.id);
        batch.update(docRef, { isRead: true });
      });
      await batch.commit();
    } catch (err) {
      console.error('Error marking all as read:', err);
    }
  };

  const displayNotifications = useMemo(() => {
    const unread = notifications.filter(n => !n.isRead);
    const read = notifications.filter(n => n.isRead).slice(0, 3);
    // Combine and maintain original sort (which is already sorted by date in the useEffect)
    return [...unread, ...read].sort((a, b) => {
      const timeA = a.createdAt?.seconds || 0;
      const timeB = b.createdAt?.seconds || 0;
      return timeB - timeA;
    });
  }, [notifications]);

  if (!user) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* 상단 벨 아이콘 버튼 */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors group"
      >
        <BellIcon
          className={`w-6 h-6 ${unreadCount > 0 ? 'text-purple-600' : 'text-gray-500 dark:text-gray-400'}`}
        />

        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 text-[9px] text-white items-center justify-center font-black">
              {unreadCount}
            </span>
          </span>
        )}
      </button>

      {/* 드롭다운 알림창 */}
      {isOpen && (
        <div className="z-50 absolute right-0 mt-2 w-72 sm:w-80 bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-gray-100 dark:border-slate-800 overflow-hidden z-[100] animate-in fade-in zoom-in-95 duration-200 origin-top-right">
          <div className="p-4 bg-gray-50/50 dark:bg-slate-800/50 border-b border-gray-100 dark:border-slate-800 flex justify-between items-center">
            <span className="text-xs font-black text-gray-800 dark:text-white flex items-center gap-2">
              <BellIcon className="w-3.5 h-3.5 text-purple-500" />
              {language === 'ko' ? '알림' : 'Notification'}
            </span>
            <div className="flex items-center gap-3">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="flex items-center gap-1 text-xs font-black text-purple-600 hover:text-purple-700 transition-colors"
                  title={language === 'ko' ? '모두 읽음' : 'Mark all read'}
                >
                  <CheckIcon className="w-3 h-3 stroke-[3px]" />
                  {language === 'ko' ? '모두 확인' : 'Mark all'}
                </button>
              )}
              <button onClick={() => setIsOpen(false)}>
                <XMarkIcon className="w-4 h-4 text-gray-400 hover:text-gray-600" />
              </button>
            </div>
          </div>


          <div className="max-h-80 overflow-y-auto p-3 space-y-2">
            {displayNotifications.length > 0 ? (
              displayNotifications.map((note) => (
                <div
                  key={note.id}
                  onClick={() => handleNotificationClick(note)}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer ${note.isRead
                    ? 'bg-gray-50/50 dark:bg-slate-800/30 border-gray-100 dark:border-slate-800 hover:bg-gray-100/50'
                    : 'bg-white dark:bg-slate-800 border-purple-50 dark:border-purple-900/20 shadow-sm hover:bg-purple-50 dark:hover:bg-slate-700'
                    }`}
                >
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex-grow">
                      <p
                        className={`text-sm font-bold leading-snug ${note.isRead ? 'text-gray-400 dark:text-gray-500' : 'text-gray-900 dark:text-white'
                          }`}
                      >
                        {note.message}
                      </p>
                      {/* 관리자용 즉시 답장 버튼 */}
                      {(userData?.role === 'admin' || userData?.role === 'super_admin') && note.type === 'message' && !note.isRead && (
                        <button
                          onClick={() => {
                            openMessageModal(note.senderId, note.senderName, note.sourceMessageId);
                          }}
                          className="mt-2 px-3 py-1 bg-purple-600 text-white rounded-lg text-[8px] font-black uppercase tracking-widest hover:bg-purple-700 transition-all active:scale-95"
                        >
                          {language === 'ko' ? '답장하기' : 'Reply'}
                        </button>
                      )}
                    </div>
                    {!note.isRead && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMarkAsRead(note.id);
                        }}
                        className="shrink-0 p-2 bg-purple-50 dark:bg-purple-900/30 rounded-xl text-purple-600 hover:bg-purple-200 transition-colors shadow-sm active:scale-90"
                        title={language === 'ko' ? '확인' : 'Mark as read'}
                      >
                        <CheckIcon className="w-4 h-4 stroke-[3px]" />
                      </button>
                    )}
                  </div>
                  <p className="text-[8px] text-gray-400 mt-1.5 font-bold">
                    {note.createdAt?.toDate().toLocaleString()}
                  </p>
                </div>
              ))
            ) : (
              <div className="py-8 flex flex-col items-center justify-center text-center">
                <InboxIcon className="w-8 h-8 text-gray-200 mb-2" />
                <p className="text-sm font-bold text-gray-400">
                  {language === 'ko' ? '새로운 메시지가 없습니다.' : 'No new messages.'}
                </p>
              </div>
            )}
          </div>
          <div className="p-3 bg-gray-50/50 dark:bg-slate-800/50 border-t border-gray-100 dark:border-slate-800">
            <button
              onClick={() => {
                openMessageModal();
                setIsOpen(false);
              }}
              className="w-full py-2.5 bg-white dark:bg-slate-900 text-purple-600 dark:text-purple-400 rounded-xl text-xs font-black uppercase tracking-widest border border-purple-100 dark:border-purple-900/30 flex items-center justify-center gap-2 hover:bg-purple-50 transition-all shadow-sm active:scale-95"
            >
              <ChatBubbleLeftEllipsisIcon className="w-3.5 h-3.5" />
              {language === 'ko' ? '관리자 문의하기' : 'Inquiry to Admin'}
            </button>
            <button
              onClick={() => {
                router.push('/messages')
                setIsOpen(false);
              }}
              className="w-full mt-2 py-1.5 text-xs font-bold text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors"
            >
              {language === 'ko' ? '메시지 함으로 이동' : 'Go to Message Box'}
            </button>
          </div>
        </div>
      )}

      {/* Local MessageModal Removed */}
    </div>
  );
}
