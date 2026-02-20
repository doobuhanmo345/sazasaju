'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthContext } from '@/contexts/useAuthContext';
import { useLanguage } from '@/contexts/useLanguageContext';
import {
    UserPlusIcon,
    CheckIcon
} from '@heroicons/react/24/outline';
import CityInput from '@/ui/CityInput';
import BackButton from '@/ui/BackButton';

function AddProfileContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const profileId = searchParams.get('id');

    const { savedProfiles, addProfile, updateSavedProfile } = useAuthContext();
    const { language } = useLanguage();
    const [loading, setLoading] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        displayName: '',
        birthDate: '',
        birthTime: '12:00',
        isTimeUnknown: false,
        gender: 'male',
        birthCity: '',
        relationship: 'friend'
    });

    // Populate form if in edit mode
    useEffect(() => {
        if (profileId) {
            const profileToEdit = savedProfiles.find(p => p.id === profileId);
            if (profileToEdit) {
                setFormData({
                    displayName: profileToEdit.displayName || '',
                    birthDate: profileToEdit.birthDate || '',
                    birthTime: profileToEdit.birthTime || '12:00',
                    isTimeUnknown: profileToEdit.isTimeUnknown || false,
                    gender: profileToEdit.gender || 'male',
                    birthCity: profileToEdit.birthCity || '',
                    relationship: profileToEdit.relationship || 'friend'
                });
            }
        }
    }, [profileId, savedProfiles]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.displayName || !formData.birthDate || !formData.birthCity) {
            alert(language === 'ko' ? '모든 정보를 입력해주세요.' : 'Please fill all fields.');
            return;
        }

        setLoading(true);
        try {
            if (profileId) {
                await updateSavedProfile(profileId, formData);
            } else {
                await addProfile(formData);
            }
            router.push('/mypage/manage');
        } catch (error) {
            console.error('Failed to save profile:', error);
            alert(language === 'ko' ? '저장 실패: ' + error.message : 'Failed to save: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const isKo = language === 'ko';

    return (
        <div className="min-h-screen bg-white dark:bg-slate-950">
            {/* Hero Section */}
            <div className="relative overflow-hidden bg-white dark:bg-slate-900 pt-6 pb-20 sm:pt-12 sm:pb-20 px-6 border-b border-slate-100 dark:border-slate-800">
                <div className="absolute bottom-0 right-0 -mr-20 -mb-20 w-80 h-80 bg-indigo-500/10 dark:bg-indigo-500/20 rounded-full blur-[80px]" />
                <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-purple-500/10 dark:bg-purple-500/20 rounded-full blur-[80px]" />
                <BackButton title={isKo ? '프로필 추가/수정' : 'Update Profile'} />
                <div className="relative z-10 max-w-lg mx-auto text-center flex flex-col items-center">

                    <div className="relative w-20 h-20 sm:w-28 sm:h-28 overflow-hidden rounded-full border-4 border-white dark:border-slate-800 shadow-2xl mb-4 bg-white dark:bg-slate-800 flex items-center justify-center">
                        <UserPlusIcon className="w-10 h-10 text-indigo-500" />
                    </div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-xs font-black uppercase tracking-widest mb-4">
                        {profileId ? (isKo ? '프로필 수정' : 'Edit Profile') : (isKo ? '새 프로필 추가' : 'Add New Profile')}
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
                        {isKo ? (
                            <><span className="font-serif italic text-indigo-700 dark:text-indigo-400">정보</span>를<br />입력해 주세요</>
                        ) : (
                            <>Enter<br /><span className="font-serif italic text-indigo-700 dark:text-indigo-400">Information</span></>
                        )}
                    </h1>
                </div>
            </div>

            <div className="max-w-2xl mx-auto px-6 -mt-12 relative z-20 pb-32">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-xl overflow-hidden p-6 sm:p-10 space-y-8">
                        <div className="space-y-6">
                            {/* Name */}
                            <div>
                                <label className="block text-xs font-black text-indigo-500 uppercase tracking-wider mb-2 ml-1">
                                    {isKo ? '이름' : 'Name'}
                                </label>
                                <input
                                    type="text"
                                    value={formData.displayName}
                                    onChange={e => setFormData({ ...formData, displayName: e.target.value })}
                                    className="w-full bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl px-4 py-4 text-gray-800 dark:text-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all font-bold shadow-sm"
                                    placeholder={isKo ? '이름을 입력하세요' : 'Enter name'}
                                    required
                                />
                            </div>

                            {/* Relationship */}
                            <div>
                                <label className="block text-xs font-black text-indigo-500 uppercase tracking-wider mb-2 ml-1">
                                    {isKo ? '관계' : 'Relationship'}
                                </label>
                                <select
                                    value={formData.relationship}
                                    onChange={e => setFormData({ ...formData, relationship: e.target.value })}
                                    className="w-full bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl px-4 py-4 text-gray-800 dark:text-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all font-bold shadow-sm appearance-none"
                                >
                                    <option value="friend">{isKo ? '친구' : 'Friend'}</option>
                                    <option value="family">{isKo ? '가족' : 'Family'}</option>
                                    <option value="partner">{isKo ? '연인' : 'Partner'}</option>
                                    <option value="other">{isKo ? '기타' : 'Other'}</option>
                                </select>
                            </div>

                            {/* Gender */}
                            <div>
                                <label className="block text-xs font-black text-indigo-500 uppercase tracking-wider mb-2 ml-1">
                                    {isKo ? '성별' : 'Gender'}
                                </label>
                                <div className="flex gap-2 p-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl font-bold">
                                    {['male', 'female'].map(g => (
                                        <button
                                            key={g}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, gender: g })}
                                            className={`flex-1 py-3 rounded-xl text-sm transition-all duration-300 ${formData.gender === g
                                                ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-300 shadow-md ring-1 ring-slate-100 dark:ring-slate-700'
                                                : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'
                                                }`}
                                        >
                                            {g === 'male' ? (isKo ? '남성' : 'Male') : (isKo ? '여성' : 'Female')}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Date */}
                            <div>
                                <label className="block text-xs font-black text-indigo-500 uppercase tracking-wider mb-2 ml-1">
                                    {isKo ? '생년월일' : 'Birth Date'}
                                </label>
                                <input
                                    type="date"
                                    value={formData.birthDate}
                                    onChange={e => setFormData({ ...formData, birthDate: e.target.value })}
                                    className="w-full bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl px-4 py-4 text-gray-800 dark:text-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all font-bold shadow-sm"
                                    required
                                />
                            </div>

                            {/* Time */}
                            <div>
                                <div className="flex justify-between items-center mb-2 ml-1">
                                    <label className="text-xs font-black text-indigo-500 uppercase tracking-wider">
                                        {isKo ? '태어난 시간' : 'Birth Time'}
                                    </label>
                                    <label className="flex items-center gap-1.5 cursor-pointer group">
                                        <input
                                            type="checkbox"
                                            checked={formData.isTimeUnknown}
                                            onChange={e => setFormData({ ...formData, isTimeUnknown: e.target.checked })}
                                            className="w-4 h-4 rounded border-slate-300 dark:border-slate-700 text-indigo-600 focus:ring-indigo-500 bg-white dark:bg-slate-900"
                                        />
                                        <span className="text-xs font-bold text-gray-500 dark:text-gray-400 group-hover:text-indigo-500 transition-colors">
                                            {isKo ? '시간 모름' : 'Unknown'}
                                        </span>
                                    </label>
                                </div>
                                <input
                                    type="time"
                                    value={formData.birthTime}
                                    onChange={e => setFormData({ ...formData, birthTime: e.target.value })}
                                    disabled={formData.isTimeUnknown}
                                    className={`w-full border rounded-2xl px-4 py-4 outline-none transition-all font-bold shadow-sm ${formData.isTimeUnknown
                                        ? 'bg-slate-100 dark:bg-slate-950 border-transparent text-slate-300 dark:text-slate-800 cursor-not-allowed shadow-none'
                                        : 'bg-white dark:bg-slate-950 border-slate-100 dark:border-slate-800 text-gray-800 dark:text-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500'
                                        }`}
                                    required={!formData.isTimeUnknown}
                                />
                            </div>

                            {/* City */}
                            <div>
                                <label className="block text-xs font-black text-indigo-500 uppercase tracking-wider mb-2 ml-1">
                                    {isKo ? '태어난 도시' : 'City of Birth'}
                                </label>
                                <CityInput
                                    value={formData.birthCity}
                                    onChange={e => setFormData({ ...formData, birthCity: e.target.value })}
                                    language={language}
                                    className="w-full"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-4 h-20">
                        <button
                            type="button"
                            onClick={() => router.back()}
                            className="flex-1 py-4.5 border-2 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 rounded-2xl font-black text-base hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all active:scale-95 flex items-center justify-center"
                        >
                            {isKo ? '취소' : 'Cancel'}
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-[2] py-4.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black text-base shadow-xl hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <div className="flex items-center gap-2">
                                    <CheckIcon className="w-5 h-5" />
                                    {isKo ? '저장하기' : 'Save Profile'}
                                </div>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default function AddProfilePage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-white dark:bg-slate-950 flex items-center justify-center">Loading...</div>}>
            <AddProfileContent />
        </Suspense>
    );
}
