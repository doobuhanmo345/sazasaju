'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthContext } from '@/contexts/useAuthContext';
import { useLanguage } from '@/contexts/useLanguageContext';
import {
  UserCircleIcon,
  PlusIcon,
  TrashIcon,
  CheckCircleIcon,
  UserPlusIcon,
  PencilSquareIcon // Import Added
} from '@heroicons/react/24/outline';
import CityInput from '@/ui/CityInput';

/**
 * 친구/가족 프로필 관리 및 선택 페이지
 */
export default function ProfileManagePage() {
  const router = useRouter();
  const { userData, selectedProfile, savedProfiles, selectProfile, addProfile, removeProfile, updateSavedProfile } = useAuthContext();
  const { language } = useLanguage();
  
  const [isAdding, setIsAdding] = useState(false);
  const [editingProfileId, setEditingProfileId] = useState(null); // Track editing ID
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

  // Handle switching profile
  const handleSelect = (profile) => {
    // If editing, don't select
    if (editingProfileId) return; 
    selectProfile(profile);
    router.push('/'); 
  };

  const handleEditClick = (profile) => {
    setEditingProfileId(profile.id);
    setFormData({
      displayName: profile.displayName,
      birthDate: profile.birthDate,
      birthTime: profile.birthTime,
      isTimeUnknown: profile.isTimeUnknown,
      gender: profile.gender,
      birthCity: profile.birthCity,
      relationship: profile.relationship
    });
    setIsAdding(true);
  };

  // Handle adding/updating profile
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.displayName || !formData.birthDate || !formData.birthCity) {
        alert(language === 'ko' ? '모든 정보를 입력해주세요.' : 'Please fill all fields.');
        return;
    }
    
    setLoading(true);
    try {
      if (editingProfileId) {
        // Update existing
        await updateSavedProfile(editingProfileId, formData);
      } else {
        // Add new
        await addProfile(formData);
      }
      
      setIsAdding(false);
      setEditingProfileId(null);
      // Reset form
      setFormData({
        displayName: '',
        birthDate: '',
        birthTime: '12:00',
        isTimeUnknown: false,
        gender: 'male',
        birthCity: '',
        relationship: 'friend'
      });
    } catch (error) {
      console.error('Failed to save profile:', error);
      alert(language === 'ko' ? '저장 실패: ' + error.message : 'Failed to save: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (confirm(language === 'ko' ? '정말 삭제하시겠습니까?' : 'Are you sure?')) {
      await removeProfile(id);
    }
  };

  // Render Add/Edit Form
  if (isAdding) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 px-4 py-8 pb-32">
        <div className="max-w-md mx-auto space-y-8">
          <header className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              {language === 'ko' 
                ? (editingProfileId ? '프로필 수정' : '프로필 추가') 
                : (editingProfileId ? 'Edit Profile' : 'Add Profile')}
            </h2>
            <button 
              onClick={() => {
                setIsAdding(false);
                setEditingProfileId(null);
                setFormData({
                    displayName: '',
                    birthDate: '',
                    birthTime: '12:00',
                    isTimeUnknown: false,
                    gender: 'male',
                    birthCity: '',
                    relationship: 'friend'
                  });
              }}
              className="text-sm text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
            >
              {language === 'ko' ? '취소' : 'Cancel'}
            </button>
          </header>

          <form onSubmit={handleSubmit} className="space-y-6 bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-white/5">
            {/* Name */}
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">Name</label>
              <input 
                type="text" 
                value={formData.displayName}
                onChange={e => setFormData({...formData, displayName: e.target.value})}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Name"
                required
              />
            </div>

            {/* Relation */}
            <div>
               <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">Relationship</label>
               <select
                 value={formData.relationship}
                 onChange={e => setFormData({...formData, relationship: e.target.value})}
                 className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 outline-none"
               >
                 <option value="friend">{language === 'ko' ? '친구' : 'Friend'}</option>
                 <option value="family">{language === 'ko' ? '가족' : 'Family'}</option>
                 <option value="partner">{language === 'ko' ? '연인' : 'Partner'}</option>
                 <option value="other">{language === 'ko' ? '기타' : 'Other'}</option>
               </select>
            </div>

            {/* Gender */}
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">Gender</label>
              <div className="flex gap-2">
                {['male', 'female'].map(g => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setFormData({...formData, gender: g})}
                    className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${
                      formData.gender === g 
                        ? 'bg-indigo-500 text-white shadow-md' 
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                    }`}
                  >
                    {g === 'male' ? (language === 'ko' ? '남성' : 'Male') : (language === 'ko' ? '여성' : 'Female')}
                  </button>
                ))}
              </div>
            </div>

            {/* Date */}
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">Birth Date</label>
              <input 
                type="date" 
                value={formData.birthDate}
                onChange={e => setFormData({...formData, birthDate: e.target.value})}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 outline-none"
                required
              />
            </div>

            {/* Time */}
            <div>
              <div className="flex justify-between mb-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Birth Time</label>
                <label className="flex items-center gap-2 text-xs text-slate-500">
                  <input 
                    type="checkbox" 
                    checked={formData.isTimeUnknown}
                    onChange={e => setFormData({...formData, isTimeUnknown: e.target.checked})}
                  />
                  {language === 'ko' ? '시간 모름' : 'Unknown'}
                </label>
              </div>
              <input 
                type="time" 
                value={formData.birthTime}
                onChange={e => setFormData({...formData, birthTime: e.target.value})}
                disabled={formData.isTimeUnknown}
                className={`w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 outline-none ${formData.isTimeUnknown ? 'opacity-50' : ''}`}
                required={!formData.isTimeUnknown}
              />
            </div>

            {/* City */}
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">Birth City</label>
              <CityInput 
                value={formData.birthCity}
                onChange={e => setFormData({...formData, birthCity: e.target.value})}
                language={language}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 outline-none"
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-indigo-600 text-white font-bold py-4 rounded-xl shadow-lg active:scale-[0.98] transition-all disabled:opacity-50"
            >
              {loading ? 'Saving...' : (language === 'ko' ? '저장하기' : 'Save Profile')}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Render List
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 px-4 py-8 pb-32">
       <div className="max-w-md mx-auto space-y-8">
          <header>
             <h1 className="text-3xl font-light text-slate-900 dark:text-white mb-2">
               {language === 'ko' ? '프로필 선택' : 'Switch Profile'}
             </h1>
             <p className="text-slate-500 text-sm">
               {language === 'ko' ? '누구의 운세를 볼까요?' : 'Whose fortune do you want to check?'}
             </p>
          </header>

          <div className="space-y-4">
             {/* My Profile */}
             <div 
               onClick={() => handleSelect(null)} // Null selects self
               className={`relative p-5 rounded-2xl border transition-all cursor-pointer flex items-center gap-4 ${
                 (!selectedProfile || (userData && selectedProfile.uid === userData.uid))
                   ? 'bg-white dark:bg-slate-900 border-indigo-500 ring-1 ring-indigo-500 shadow-md' 
                   : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:border-indigo-200'
               }`}
             >
                <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                  <UserCircleIcon className="w-8 h-8 text-slate-400" />
                </div>
                <div className="flex-1">
                   <h3 className="font-bold text-slate-900 dark:text-white">
                     {userData?.displayName || 'Me'}
                     <span className="ml-2 text-xs font-normal text-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-0.5 rounded-full">ME</span>
                   </h3>
                   <p className="text-xs text-slate-500 mt-1">
                     {userData?.birthDate?.split('T')[0]}
                   </p>
                </div>
                {(!selectedProfile || (userData && selectedProfile.uid === userData.uid)) && (
                   <CheckCircleIcon className="w-6 h-6 text-indigo-500" />
                )}
             </div>

             {/* Divider */}
             {savedProfiles.length > 0 && (
               <div className="text-xs font-bold text-slate-400 uppercase tracking-widest pt-4 pb-2">
                 {language === 'ko' ? '저장된 프로필' : 'Saved Profiles'}
               </div>
             )}

             {/* Saved Profiles */}
             {savedProfiles.map(profile => (
               <div 
                 key={profile.id}
                 onClick={() => handleSelect(profile)}
                 className={`relative p-5 rounded-2xl border transition-all cursor-pointer flex items-center gap-4 ${
                   (selectedProfile && selectedProfile.id === profile.id)
                     ? 'bg-white dark:bg-slate-900 border-indigo-500 ring-1 ring-indigo-500 shadow-md' 
                     : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:border-indigo-200'
                 }`}
               >
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    profile.gender === 'female' ? 'bg-rose-50 dark:bg-rose-900/20' : 'bg-blue-50 dark:bg-blue-900/20'
                  }`}>
                    <span className={`text-lg font-bold ${
                      profile.gender === 'female' ? 'text-rose-400' : 'text-blue-400'
                    }`}>
                      {profile.displayName.charAt(0)}
                    </span>
                  </div>
                  <div className="flex-1">
                     <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                       {profile.displayName}
                       <span className="text-[10px] uppercase font-normal text-slate-400 border border-slate-200 dark:border-slate-700 px-1.5 py-0.5 rounded">
                         {profile.relationship}
                       </span>
                     </h3>
                   <p className="text-xs text-slate-500 mt-1">
                       {profile.birthDate} 
                       {!profile.isTimeUnknown && profile.birthTime && (
                         <span className="ml-1 text-slate-400">
                           ({profile.birthTime})
                         </span>
                       )}
                     </p>
                  </div>
                  
                  {/* Edit Button */}
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditClick(profile);
                    }}
                    className="p-2 text-slate-300 hover:text-indigo-500 transition-colors"
                  >
                    <PencilSquareIcon className="w-5 h-5" />
                  </button>

                  {(selectedProfile && selectedProfile.id === profile.id) ? (
                     <CheckCircleIcon className="w-6 h-6 text-indigo-500" />
                  ) : (
                    <button 
                      onClick={(e) => handleDelete(e, profile.id)}
                      className="p-2 text-slate-300 hover:text-red-500 transition-colors"
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  )}
               </div>
             ))}

             {/* Add Button */}
             <button 
               onClick={() => setIsAdding(true)}
               className="w-full py-4 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl flex items-center justify-center gap-2 text-slate-400 hover:text-indigo-500 hover:border-indigo-200 transition-all group"
             >
               <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/30 flex items-center justify-center transition-colors">
                 <PlusIcon className="w-5 h-5" />
               </div>
               <span className="font-bold text-sm">
                 {language === 'ko' ? '새 프로필 추가' : 'Add New Profile'}
               </span>
             </button>
          </div>
       </div>
    </div>
  );
}
