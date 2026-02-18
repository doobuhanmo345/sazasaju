'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, limit, getDocs, startAfter, where, doc, updateDoc } from 'firebase/firestore';
import { useAuthContext } from '@/contexts/useAuthContext';
import {
    MagnifyingGlassIcon,
    PencilSquareIcon,
    EnvelopeIcon,
    XMarkIcon
} from '@heroicons/react/24/outline';
import MessageModal from '@/app/messages/MessageModal';
import BatchMessageModal from './BatchMessageModal';

export default function AdminUsersPage() {
    const { user, userData } = useAuthContext();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [lastVisible, setLastVisible] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    // Message Modal State
    const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
    const [selectedUserForMessage, setSelectedUserForMessage] = useState(null);

    // Edit Modal State
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [editForm, setEditForm] = useState({ credits: 0, editCount: 0 });

    // View Mode State
    const [viewMode, setViewMode] = useState('credits');
    const [availableKeys, setAvailableKeys] = useState([]);

    // Batch Selection State
    const [selectedUserIds, setSelectedUserIds] = useState(new Set());
    const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);

    const USERS_PER_PAGE = 20;

    // Dynamically extract keys from loaded users
    useEffect(() => {
        if (users.length > 0) {
            const keys = new Set();
            users.forEach(u => {
                Object.keys(u).forEach(k => keys.add(k));
            });
            // Filter out large/unnecessary keys if needed, or keep all as requested
            // Let's sort them alphabetically
            setAvailableKeys(Array.from(keys).sort());
        }
    }, [users]);

    // If the current viewMode is not in valid keys (and we have keys), reset or keep? 
    // We'll trust the state persistence for now, but defaulting to 'credits' or first available is strict.

    const handleSelectAll = (e) => {
        if (e.target.checked) {
            const allIds = new Set(users.map(u => u.id));
            setSelectedUserIds(allIds);
        } else {
            setSelectedUserIds(new Set());
        }
    };

    const handleSelectUser = (id) => {
        const newSelected = new Set(selectedUserIds);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelectedUserIds(newSelected);
    };

    const fetchUsers = async (isNext = false) => {
        setLoading(true);
        try {
            let userList = [];
            let nextLastVisible = null;

            if (searchTerm) {
                // Perform two queries for OR condition (Name OR Email)
                const emailQuery = query(
                    collection(db, 'users'),
                    where('email', '>=', searchTerm),
                    where('email', '<=', searchTerm + '\uf8ff'),
                    limit(USERS_PER_PAGE)
                );

                const nameQuery = query(
                    collection(db, 'users'),
                    where('displayName', '>=', searchTerm),
                    where('displayName', '<=', searchTerm + '\uf8ff'),
                    limit(USERS_PER_PAGE)
                );

                const [emailSnap, nameSnap] = await Promise.all([getDocs(emailQuery), getDocs(nameQuery)]);

                // Merge results using Map to avoid duplicates
                const userMap = new Map();
                [...emailSnap.docs, ...nameSnap.docs].forEach(doc => {
                    userMap.set(doc.id, { id: doc.id, ...doc.data() });
                });

                userList = Array.from(userMap.values());
            } else {
                let q = query(
                    collection(db, 'users'),
                    orderBy('createdAt', 'desc'),
                    limit(USERS_PER_PAGE)
                );

                if (isNext && lastVisible) {
                    q = query(
                        collection(db, 'users'),
                        orderBy('createdAt', 'desc'),
                        startAfter(lastVisible),
                        limit(USERS_PER_PAGE)
                    );
                }

                const querySnapshot = await getDocs(q);
                userList = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                nextLastVisible = querySnapshot.docs[querySnapshot.docs.length - 1];
            }

            if (isNext) {
                setUsers(prev => {
                    // Merge and deduplicate just in case
                    const combined = [...prev, ...userList];
                    const unique = Array.from(new Map(combined.map(item => [item.id, item])).values());
                    return unique;
                });
            } else {
                setUsers(userList);
            }

            if (nextLastVisible) {
                setLastVisible(nextLastVisible);
            }
        } catch (error) {
            console.error("Error fetching users: ", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (userData?.role === 'admin' || userData?.role === 'super_admin') {
            fetchUsers();
        }
    }, [userData]);

    const handleSearch = (e) => {
        e.preventDefault();
        fetchUsers(false);
    };

    const openEditModal = (targetUser) => {
        setEditingUser(targetUser);

        // Calculate Remaining based on user role
        const maxCount = ['admin', 'super_admin'].includes(targetUser.role) ? 10 : 3;
        const currentUsed = targetUser.editCount !== undefined ? targetUser.editCount : 0;
        const remaining = Math.max(0, maxCount - currentUsed);

        setEditForm({
            credits: targetUser.credits || 0,
            remainingEdits: remaining // We act on Remaining, not Used
        });
        setIsEditModalOpen(true);
    };

    const handleSaveEdit = async () => {
        if (!editingUser) return;

        console.log(`[Admin] Attempting to update user: ${editingUser.id}`);

        try {
            // Calculate 'Used' to delete from Max
            const maxCount = ['admin', 'super_admin'].includes(editingUser.role) ? 10 : 3;
            // Used = Max - Remaining
            const newUsedCount = Math.max(0, maxCount - Number(editForm.remainingEdits));

            const userRef = doc(db, 'users', editingUser.id);
            const newData = {
                credits: Number(editForm.credits),
                editCount: newUsedCount
            };

            await updateDoc(userRef, newData);
            console.log('[Admin] Firestore update successful');

            // Update local state
            setUsers(prev => prev.map(u =>
                u.id === editingUser.id
                    ? { ...u, ...newData }
                    : u
            ));

            setIsEditModalOpen(false);
            setEditingUser(null);
            alert('성공적으로 변경되었습니다. (Updated Successfully)');
        } catch (error) {
            console.error("[Admin] Update failed:", error);
            alert(`업데이트 실패 (Update Failed): ${error.message}`);
        }
    };

    const openMessageModal = (targetUser) => {
        setSelectedUserForMessage({
            uid: targetUser.id,
            displayName: targetUser.displayName
        });
        setIsMessageModalOpen(true);
    };

    // Format any value for display
    const formatValue = (val) => {
        if (val === undefined || val === null) return <span className="text-gray-300">-</span>;

        // Firestore Timestamp
        if (typeof val === 'object' && val.seconds) {
            return new Date(val.seconds * 1000).toLocaleString();
        }

        // Date object
        if (val instanceof Date) {
            return val.toLocaleString();
        }

        // Arrays
        if (Array.isArray(val)) {
            return `[${val.length} items]`;
        }

        // Objects
        if (typeof val === 'object') {
            return JSON.stringify(val);
        }

        // Booleans
        if (typeof val === 'boolean') {
            return val ? 'True' : 'False';
        }

        return String(val);
    };

    const renderDynamicColumnHeader = () => {
        return viewMode || 'Select Field';
    };

    const renderDynamicColumnValue = (u) => {
        const val = u[viewMode];
        return (
            <div className="text-sm text-gray-600 dark:text-gray-400 font-medium truncate max-w-[200px]" title={String(val)}>
                {formatValue(val)}
            </div>
        );
    };

    if (!user || (userData?.role !== 'admin' && userData?.role !== 'super_admin')) {
        return <div className="p-10 text-center">접근 권한이 없습니다.</div>;
    }

    return (
        <div className="max-w-7xl mx-auto space-y-8">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-gray-900 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 p-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">
                        User Management
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">전체 사용자 목록 및 관리</p>
                </div>

                <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto items-center">
                    {selectedUserIds.size > 0 && (
                        <button
                            onClick={() => setIsBatchModalOpen(true)}
                            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-sm transition-all shadow-lg shadow-blue-500/20 active:scale-95 whitespace-nowrap"
                        >
                            Send to {selectedUserIds.size} Users
                        </button>
                    )}
                    {/* View Mode Selector - Dynamic */}
                    <select
                        value={viewMode}
                        onChange={(e) => setViewMode(e.target.value)}
                        className="px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl text-sm font-bold text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 max-w-[200px]"
                    >
                        {availableKeys.map(key => (
                            <option key={key} value={key}>{key}</option>
                        ))}
                        {availableKeys.length === 0 && <option value="credits">Loading fields...</option>}
                    </select>

                    <form onSubmit={handleSearch} className="relative w-full md:w-96">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                        </div>
                        <input
                            type="text"
                            className="block w-full pl-10 pr-3 py-3 border border-gray-200 dark:border-gray-700 rounded-2xl leading-5 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition duration-150 ease-in-out"
                            placeholder="Search by Name or Email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </form>
                </div>
            </header>

            <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-100 dark:divide-gray-800">
                        <thead className="bg-gray-50 dark:bg-gray-900/50">
                            <tr>
                                <th scope="col" className="px-4 py-5 text-center">
                                    <input
                                        type="checkbox"
                                        className="w-5 h-5 rounded-lg border-2 border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                                        onChange={handleSelectAll}
                                        checked={users.length > 0 && selectedUserIds.size === users.length}
                                    />
                                </th>
                                <th scope="col" className="px-8 py-5 text-left text-xs font-black text-gray-400 uppercase tracking-widest pl-2">
                                    User
                                </th>
                                {/* Hidden on small screens if needed, but keeping for now */}
                                <th scope="col" className="px-6 py-5 text-left text-xs font-black text-gray-400 uppercase tracking-widest hidden md:table-cell">
                                    Email
                                </th>
                                <th scope="col" className="px-6 py-5 text-left text-xs font-black text-gray-400 uppercase tracking-widest">
                                    {renderDynamicColumnHeader()}
                                </th>
                                <th scope="col" className="px-6 py-5 text-right text-xs font-black text-gray-400 uppercase tracking-widest">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-100 dark:divide-gray-800">
                            {loading && users.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-8 py-12 text-center text-gray-500">
                                        Loading users...
                                    </td>
                                </tr>
                            ) : (
                                users.map((u) => (
                                    <tr key={u.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                        <td className="px-4 py-5 text-center">
                                            <input
                                                type="checkbox"
                                                className="w-5 h-5 rounded-lg border-2 border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                                                checked={selectedUserIds.has(u.id)}
                                                onChange={() => handleSelectUser(u.id)}
                                            />
                                        </td>
                                        <td className="px-8 py-5 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="h-10 w-10 flex-shrink-0">
                                                    {u.photoURL ? (
                                                        <img className="h-10 w-10 rounded-full object-cover" src={u.photoURL} alt="" />
                                                    ) : (
                                                        <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold">
                                                            {u.displayName ? u.displayName.charAt(0) : '?'}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-bold text-gray-900 dark:text-gray-100">{u.displayName || 'No Name'}</div>
                                                    <div className="text-xs text-gray-400 md:hidden">{u.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 whitespace-nowrap hidden md:table-cell">
                                            <div className="text-sm text-gray-500">{u.email}</div>
                                        </td>
                                        <td className="px-6 py-5 whitespace-nowrap text-sm text-gray-500">
                                            {renderDynamicColumnValue(u)}
                                        </td>
                                        <td className="px-6 py-5 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => openMessageModal(u)}
                                                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all"
                                                    title="Send Message"
                                                >
                                                    <EnvelopeIcon className="w-5 h-5" />
                                                </button>
                                                <button
                                                    onClick={() => openEditModal(u)}
                                                    className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-all"
                                                    title="Edit User"
                                                >
                                                    <PencilSquareIcon className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>

                    {!loading && users.length === 0 && (
                        <div className="p-12 text-center text-gray-400 font-medium">
                            No users found.
                        </div>
                    )}

                    {/* Load More Trigger */}
                    {lastVisible && !loading && !searchTerm && (
                        <div className="p-4 bg-gray-50 dark:bg-gray-800/50 text-center cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors" onClick={() => fetchUsers(true)}>
                            <span className="text-sm font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest">Load More Users</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Edit User Modal */}
            {isEditModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md p-6 border border-gray-100 dark:border-gray-800">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h3 className="text-lg font-black text-gray-900 dark:text-gray-100 tracking-tight">Edit User</h3>
                                <p className="text-sm text-gray-500">{editingUser?.displayName} ({editingUser?.email})</p>
                            </div>
                            <button onClick={() => setIsEditModalOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                                <XMarkIcon className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Permanent Credits</label>
                                <input
                                    type="number"
                                    className="w-full px-4 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 outline-none focus:border-blue-500 font-bold"
                                    value={editForm.credits}
                                    onChange={(e) => setEditForm({ ...editForm, credits: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-blue-500 uppercase tracking-wider mb-1">Remaining Daily Edits</label>
                                <input
                                    type="number"
                                    className="w-full px-4 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 outline-none focus:border-blue-500 font-bold"
                                    value={editForm.remainingEdits}
                                    onChange={(e) => setEditForm({ ...editForm, remainingEdits: e.target.value })}
                                />
                                <p className="text-[10px] text-gray-400 mt-1">
                                    Calculated as: {['admin', 'super_admin'].includes(editingUser?.role) ? 10 : 3} (Max) - Used Count
                                </p>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 mt-8">
                            <button
                                onClick={() => setIsEditModalOpen(false)}
                                className="px-4 py-2 text-sm font-bold text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSaveEdit}
                                className="px-6 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-lg shadow-blue-500/30"
                            >
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Message Modal */}
            <MessageModal
                isOpen={isMessageModalOpen}
                onClose={() => setIsMessageModalOpen(false)}
                receiverId={selectedUserForMessage?.uid}
                receiverName={selectedUserForMessage?.displayName}
            />

            <BatchMessageModal
                isOpen={isBatchModalOpen}
                onClose={() => setIsBatchModalOpen(false)}
                selectedUsers={users.filter(u => selectedUserIds.has(u.id))}
            />
        </div>
    );
}
