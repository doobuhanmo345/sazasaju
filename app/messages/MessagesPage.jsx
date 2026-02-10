'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { db } from '@/lib/firebase';
import { collection, query, where, onSnapshot, orderBy, doc, updateDoc, writeBatch, deleteDoc, arrayUnion } from 'firebase/firestore';
import { useAuthContext } from '@/contexts/useAuthContext';
import { useLanguage } from '@/contexts/useLanguageContext';
import { InboxStackIcon, ChatBubbleLeftRightIcon, UserCircleIcon, DocumentTextIcon, CheckIcon, TrashIcon } from '@heroicons/react/24/outline';
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
  const { user, userData } = useAuthContext();
  const { language } = useLanguage();
  const searchParams = useSearchParams();
  const view = searchParams.get('view');
  const [messages, setMessages] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const [sazaTalkModalOpen, setSazaTalkModalOpen] = useState(false);
  const [selectedSazaTalk, setSelectedSazaTalk] = useState(null);
  const [replyTo, setReplyTo] = useState(null); // { id, name }
  const [activeTab, setActiveTab] = useState('direct'); // 'direct' | 'sazatalk' | 'analysis'

  // URL 파라미터로 탭 제어 (?tab=sazatalk)
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === 'sazatalk' || tab === 'direct' || tab === 'analysis') {
      setActiveTab(tab);
    }
  }, [searchParams]);

  useEffect(() => {
    if (!user) return;
    setCurrentPage(1); // 유저가 바뀌면 페이지 초기화

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // 인덱스 생성 오류를 방지하기 위해 쿼리에서 orderBy를 제거하고 메모리에서 정렬합니다.
    const q_sent = query(collection(db, 'direct_messages'), where('senderId', '==', user.uid));

    // 관리자라면 'admin' 수신 메시지까지 함께 가져옴
    const isAdmin = userData?.role === 'admin' || userData?.role === 'super_admin';
    const receiverIds = [user.uid];
    if (isAdmin) receiverIds.push('admin');

    const q_received = query(collection(db, 'direct_messages'), where('receiverId', 'in', receiverIds));

    // AI 상담용: 사자톡 메시지 + 분석 완료 알림 (최근 7일치)
    const q_sazatalk = query(
      collection(db, 'sazatalk_messages'),
      where('userId', '==', user.uid),
      where('createdAt', '>=', sevenDaysAgo),
      orderBy('createdAt', 'desc')
    );
    const q_analysis = query(
      collection(db, 'notifications'),
      where('userId', '==', user.uid),
      where('type', '==', 'analysis'),
      where('createdAt', '>=', sevenDaysAgo),
      orderBy('createdAt', 'desc')
    );

    const unsubscribeSent = onSnapshot(q_sent, (snap) => {
      const sent = snap.docs.map(doc => ({ id: doc.id, type: 'sent', messageType: 'direct', ...doc.data() }));
      updateMessages(sent, 'sent');
    }, (error) => {
      console.error('Error fetching sent messages:', error);
    });

    const unsubscribeReceived = onSnapshot(q_received, (snap) => {
      const received = snap.docs.map(doc => ({ id: doc.id, type: 'received', messageType: 'direct', ...doc.data() }));
      updateMessages(received, 'received');
    }, (error) => {
      console.error('Error fetching received messages:', error);
    });

    const unsubscribeSazaTalk = onSnapshot(q_sazatalk, (snap) => {
      const sazaTalkMsgs = snap.docs.map(doc => ({ id: doc.id, type: 'sazatalk', messageType: 'sazatalk', ...doc.data() }));
      updateMessages(sazaTalkMsgs, 'sazatalk');
    }, (error) => {
      console.error('Error fetching SazaTalk logs:', error);
    });

    const unsubscribeAnalysis = onSnapshot(q_analysis, (snap) => {
      const analysisLogs = snap.docs.map(doc => ({ id: doc.id, type: 'analysis_log', messageType: 'analysis', ...doc.data() }));
      updateMessages(analysisLogs, 'analysis');
    }, (error) => {
      console.error('Error fetching analysis logs:', error);
    });

    return () => {
      unsubscribeSent();
      unsubscribeReceived();
      unsubscribeSazaTalk();
      unsubscribeAnalysis();
    };
  }, [user?.uid, userData?.role]);

  const [allMsgs, setAllMsgs] = useState({ sent: [], received: [], sazatalk: [], analysis: [] });

  // 탭 변경 시 또는 메시지 업데이트 시 표시될 목록 필터링
  useEffect(() => {
    const map = new Map();
    let source = [];

    if (activeTab === 'direct') {
      source = [...allMsgs.sent, ...allMsgs.received];
    } else if (activeTab === 'analysis') {
      source = allMsgs.analysis;
    } else if (activeTab === 'sazatalk') {
      // 3+3 로직: 저장된 것 최대 3개 + 최근 것 최대 3개 (날짜순 정렬 후 슬라이스)
      const sortedSaza = [...allMsgs.sazatalk].sort((a, b) =>
        (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)
      );
      const saved = sortedSaza.filter(m => m.isSaved).slice(0, 3);
      const recent = sortedSaza.filter(m => !m.isSaved).slice(0, 3);
      source = [...saved, ...recent];
    }

    // Soft delete 필터링: 본인이 삭제한 메시지는 숨김
    source = source.filter(msg => {
      if (msg.messageType === 'direct') {
        return !msg.deletedBy?.includes(user?.uid);
      }
      return true;
    });

    source.forEach(msg => {
      if (!map.has(msg.id)) {
        map.set(msg.id, msg);
      }
    });

    const merged = Array.from(map.values()).sort((a, b) => {
      // 사자톡 탭인 경우 "최근 상담"을 최상단으로 (isSaved: false 우선)
      if (activeTab === 'sazatalk') {
        const aSaved = !!a.isSaved;
        const bSaved = !!b.isSaved;
        if (aSaved !== bSaved) {
          return aSaved ? 1 : -1; // Recent (false) comes first
        }
      }
      return (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0);
    });

    setMessages(merged);
    setCurrentPage(1); // 탭 바뀌면 첫 페이지로
  }, [activeTab, allMsgs]);

  const updateMessages = (newMsgs, type) => {
    setAllMsgs(prev => ({ ...prev, [type]: newMsgs }));
  };

  // 자동 읽음 처리 로직 (탭 진입 시)
  useEffect(() => {
    if (!user) return;

    if (activeTab === 'direct' && allMsgs.received.length > 0) {
      const unread = allMsgs.received.filter(m => !m.isRead);
      if (unread.length > 0) {
        const batch = writeBatch(db);
        unread.forEach(m => {
          batch.update(doc(db, 'direct_messages', m.id), { isRead: true });
        });
        batch.commit().catch(err => console.error('Error marking messages as read:', err));
      }
    } else if (activeTab === 'sazatalk' && allMsgs.sazatalk.length > 0) {
      const unread = allMsgs.sazatalk.filter(m => !m.isRead);
      if (unread.length > 0) {
        const batch = writeBatch(db);
        unread.forEach(m => {
          batch.update(doc(db, 'sazatalk_messages', m.id), { isRead: true });
        });
        batch.commit().catch(err => console.error('Error marking SazaTalk as read:', err));
      }
    } else if (activeTab === 'analysis' && allMsgs.analysis.length > 0) {
      const unread = allMsgs.analysis.filter(m => !m.isRead);
      if (unread.length > 0) {
        const batch = writeBatch(db);
        unread.forEach(m => {
          batch.update(doc(db, 'notifications', m.id), { isRead: true });
        });
        batch.commit().catch(err => console.error('Error marking reports as read:', err));
      }
    }
  }, [activeTab, allMsgs.received, allMsgs.sazatalk, allMsgs.analysis, user?.uid]);

  useEffect(() => {
    if (view === 'latest_saza' && allMsgs.sazatalk.length > 0) {
      const latestSaza = [...allMsgs.sazatalk].sort((a, b) =>
        (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)
      )[0];

      if (latestSaza) {
        // 모달을 열 때 선택한 메시지의 ID만 저장하거나, 
        // 전체 객체를 저장하되 렌더링 시 최신 데이터를 검색해서 사용하도록 합니다.
        setSelectedSazaTalk(latestSaza);
        setSazaTalkModalOpen(true);
        window.history.replaceState({}, '', window.location.pathname);
      }
    }
  }, [view, allMsgs.sazatalk]);

  // 현재 모달에서 보여줄 최신 데이터 가져오기 (실시간 업데이트 반영용)
  const currentSazaTalkData = selectedSazaTalk
    ? allMsgs.sazatalk.find(m => m.id === selectedSazaTalk.id) || selectedSazaTalk
    : null;

  // SazaTalk message handlers
  const handleSazaTalkClick = (message) => {
    setSelectedSazaTalk(message);
    setSazaTalkModalOpen(true);
  };

  const handleSazaTalkSave = async (messageId, currentSavedStatus) => {
    const newStatus = !currentSavedStatus;

    // 낙관적 업데이트 (즉시 UI 반영)
    setAllMsgs(prev => ({
      ...prev,
      sazatalk: prev.sazatalk.map(m =>
        m.id === messageId ? { ...m, isSaved: newStatus } : m
      )
    }));

    try {
      await updateDoc(doc(db, 'sazatalk_messages', messageId), { isSaved: newStatus });
      alert(newStatus
        ? (language === 'ko' ? '저장되었습니다!' : 'Saved!')
        : (language === 'ko' ? '저장이 취소되었습니다.' : 'Unsaved!')
      );
    } catch (error) {
      console.error('Failed to toggle SazaTalk save:', error);
      // 실패 시 롤백
      setAllMsgs(prev => ({
        ...prev,
        sazatalk: prev.sazatalk.map(m =>
          m.id === messageId ? { ...m, isSaved: currentSavedStatus } : m
        )
      }));
      alert(language === 'ko' ? '처리 실패' : 'Failed to process');
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

  const handleDeleteMessage = async (messageId) => {
    const isAdmin = userData?.role === 'admin' || userData?.role === 'super_admin';
    const confirmMsg = isAdmin
      ? (language === 'ko' ? '이 메시지를 영구 삭제하시겠습니까? (관리자 전용)' : 'Permanently delete this message? (Admin only)')
      : (language === 'ko' ? '이 메시지를 삭제하시겠습니까?' : 'Delete this message?');

    if (!confirm(confirmMsg)) return;

    try {
      if (isAdmin) {
        // 관리자는 하드 삭제
        await deleteDoc(doc(db, 'direct_messages', messageId));
      } else {
        // 일반 유저는 소프트 삭제 (본인에게 안 보이도록 플래그만 추가)
        await updateDoc(doc(db, 'direct_messages', messageId), {
          deletedBy: arrayUnion(user.uid)
        });
      }
    } catch (error) {
      console.error('Delete failed:', error);
      alert('Delete failed');
    }
  };

  const handleDeleteAnalysisLog = async (logId) => {
    if (!confirm(language === 'ko' ? '이 기록을 삭제하시겠습니까?' : 'Delete this log?')) return;
    try {
      await deleteDoc(doc(db, 'notifications', logId));
    } catch (error) {
      console.error('Delete failed:', error);
      alert('Delete failed');
    }
  };

  const handleReply = (msg) => {
    setReplyTo({
      id: msg.senderId,
      name: msg.senderName
    });
    setIsModalOpen(true);
  };

  const handleNewInquiry = () => {
    setReplyTo(null); // Default to Admin
    setIsModalOpen(true);
  };

  // 페이지네이션 계산
  const totalPages = Math.ceil(messages.length / itemsPerPage);
  const currentItems = messages.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  if (!user) return null;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
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
          onClick={handleNewInquiry}
          className="px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg hover:scale-105 transition-all active:scale-95 flex items-center gap-2"
        >
          <ChatBubbleLeftRightIcon className="w-4 h-4" />
          {language === 'ko' ? '새 문의하기' : 'New Inquiry'}
        </button>
      </header>

      {/* 탭 헤더 */}
      <div className="flex gap-1 bg-slate-100 dark:bg-slate-800/50 p-1 rounded-[1.5rem] mb-6 overflow-x-auto no-scrollbar">
        {[
          { id: 'direct', label: language === 'ko' ? '메시지' : 'Messages', count: allMsgs.received.filter(m => !m.isRead).length },
          { id: 'sazatalk', label: language === 'ko' ? '사자톡' : 'SazaTalk', count: allMsgs.sazatalk.filter(m => !m.isRead).length },
          { id: 'analysis', label: language === 'ko' ? '리포트' : 'Reports', count: allMsgs.analysis.filter(m => !m.isRead).length }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 min-w-[100px] py-3 px-4 rounded-[1.2rem] text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 whitespace-nowrap ${activeTab === tab.id
              ? 'bg-white dark:bg-slate-900 text-purple-600 shadow-sm'
              : 'text-slate-400 hover:text-slate-600'
              }`}
          >
            {tab.label}
            {tab.count > 0 && (
              <span className="w-4 h-4 rounded-full bg-red-500 text-white text-[8px] flex items-center justify-center animate-pulse">
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* 사자톡 보관 안내 문구 */}
      {activeTab === 'sazatalk' && (
        <div className="mb-6 px-6 py-4 bg-purple-50/50 dark:bg-purple-900/10 rounded-2xl border border-purple-100/50 dark:border-purple-800/30">
          <p className="text-[10px] font-bold text-purple-600 dark:text-purple-400 leading-relaxed uppercase tracking-wider">
            {language === 'ko'
              ? '💡 저장된 상담(최대 3개)은 안전하게 보관되며, 최근 상담(최대 3개)은 새로운 상담 시 자동으로 업데이트됩니다.'
              : '💡 Saved consults (max 3) are kept safe, while recent consults (max 3) are auto-updated with new sessions.'}
          </p>
        </div>
      )}

      {/* 미니 게시판 형태의 메시지 리스트 */}
      <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="divide-y divide-slate-50 dark:divide-slate-800/50">
          {currentItems.length > 0 ? (
            currentItems.map((msg, idx) => {
              const isSaved = !!msg.isSaved;
              const prevIsSaved = idx > 0 ? !!currentItems[idx - 1].isSaved : null;
              const showSectionHeader = activeTab === 'sazatalk' && (
                idx === 0 || (prevIsSaved !== isSaved)
              );
              const sectionLabel = isSaved
                ? (language === 'ko' ? '저장된 상담' : 'Saved Consults')
                : (language === 'ko' ? '최근 상담' : 'Recent Consults');

              return (
                <React.Fragment key={msg.id}>
                  {showSectionHeader && (
                    <div className="px-6 py-2 bg-slate-50/50 dark:bg-slate-800/30 border-y border-slate-100 dark:border-slate-800">
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                        {sectionLabel}
                      </span>
                    </div>
                  )}
                  {msg.messageType === 'sazatalk' ? (
                    <SazaTalkMessageItem
                      message={msg}
                      onClick={() => handleSazaTalkClick(msg)}
                      onSave={() => handleSazaTalkSave(msg.id, msg.isSaved)}
                      onDelete={handleSazaTalkDelete}
                    />
                  ) : msg.messageType === 'analysis' ? (
                    <div
                      onClick={() => {
                        let url = msg.targetPath;
                        console.log(url);
                        if (typeof url === 'object' && url?.path) {
                          url = url.path;
                        }
                        if (url) window.location.href = url;
                      }}
                      className="group px-6 py-4 hover:bg-blue-50/50 dark:hover:bg-blue-900/10 cursor-pointer transition-colors"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="p-1.5 rounded-lg shrink-0 bg-blue-100 dark:bg-blue-900/30">
                            <DocumentTextIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                              <span className="px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-widest bg-blue-100 text-blue-600">
                                {language === 'ko' ? '리포트' : 'Report'}
                              </span>
                              <span className="text-[10px] font-black text-slate-900 dark:text-white truncate">
                                {language === 'ko' ? '분석 리포트' : 'Analysis Report'}
                              </span>
                            </div>
                            <p className="text-xs font-medium text-slate-600 dark:text-slate-400 truncate group-hover:whitespace-normal">
                              {msg.message}
                            </p>
                          </div>
                        </div>
                        <div className="shrink-0 flex flex-col items-end gap-2 text-right">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteAnalysisLog(msg.id);
                              }}
                              className="p-1.5 text-slate-300 hover:text-red-500 transition-colors"
                            >
                              <TrashIcon className="w-4 h-4" />
                            </button>
                            <span className="text-[9px] font-bold text-slate-400 uppercase">
                              {msg.createdAt ? msg.createdAt.toDate().toLocaleDateString() : '...'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div
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
                        <div className="shrink-0 flex flex-col items-end gap-2 text-right">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteMessage(msg.id);
                              }}
                              className="p-1.5 text-slate-200 hover:text-red-500 transition-colors"
                            >
                              <TrashIcon className="w-3.5 h-3.5" />
                            </button>
                            <div className="flex items-center gap-1.5">
                              {msg.isRead ? (
                                <div className="flex items-center gap-0.5 text-[8px] font-black text-blue-500 uppercase tracking-tighter">
                                  <CheckIcon className="w-2.5 h-2.5" />
                                  Read
                                </div>
                              ) : (
                                <div className="text-[8px] font-black text-slate-300 uppercase tracking-tighter">
                                  Sent
                                </div>
                              )}
                              <span className="text-[9px] font-bold text-slate-400 uppercase">
                                {msg.createdAt ? msg.createdAt.toDate().toLocaleDateString() : '...'}
                              </span>
                            </div>
                          </div>
                          {msg.type === 'received' && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleReply(msg);
                              }}
                              className="px-3 py-1 bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400 rounded-lg text-[8px] font-black uppercase tracking-widest hover:scale-105 transition-all"
                            >
                              Reply
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </React.Fragment>
              );
            })
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
        receiverId={replyTo?.id || 'admin'}
        receiverName={replyTo?.name || 'Admin'}
      />

      {sazaTalkModalOpen && currentSazaTalkData && (
        <SazaTalkResultModal
          question={currentSazaTalkData.question}
          answer={currentSazaTalkData.answer}
          onClose={() => setSazaTalkModalOpen(false)}
          messageId={currentSazaTalkData.id}
          isSaved={!!currentSazaTalkData.isSaved}
          onSave={() => handleSazaTalkSave(currentSazaTalkData.id, currentSazaTalkData.isSaved)}
          onDelete={handleSazaTalkDelete}
        />
      )}
    </div>
  );
}
