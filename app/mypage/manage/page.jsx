'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useAuthContext } from '@/contexts/useAuthContext';
import { useLanguage } from '@/contexts/useLanguageContext';
import {
  UserCircleIcon,
  PlusIcon,
  TrashIcon,
  CheckCircleIcon,
  PencilSquareIcon
} from '@heroicons/react/24/outline';
import { getRomanizedIlju } from '@/data/sajuInt';
import { calculateSaju } from '@/lib/sajuCalculator';
import BackButton from '@/ui/BackButton';
/**
 * 친구/가족 프로필 관리 및 선택 페이지
 */
export default function ProfileManagePage() {
  const router = useRouter();
  const { userData, selectedProfile, savedProfiles, selectProfile, removeProfile } = useAuthContext();
  const { language } = useLanguage();

  const isKo = language === 'ko';

  // Helper to get Ilju image path for any profile
  const getProfileAvatar = (profile) => {
    if (!profile) return '/images/ilju/default.png';

    let targetSaju = profile.saju;
    // If saju is missing but we have birthDate, calculate it on the fly
    if (!targetSaju && profile.birthDate) {
      const effectiveTime = profile.isTimeUnknown ? '12:00' : profile.birthTime || '12:00';
      const inputDateFull = `${profile.birthDate}T${effectiveTime}`;
      targetSaju = calculateSaju(inputDateFull, profile.isTimeUnknown);
    }

    if (!targetSaju || !targetSaju.sky1) return null; // Use fallback icon

    const romanized = getRomanizedIlju(targetSaju.sky1 + targetSaju.grd1);
    const genderSuffix = profile.gender === 'female' ? 'female' : 'male';
    return `/images/ilju/${romanized}_${genderSuffix}.png`;
  };

  // Handle switching profile
  const handleSelect = (profile) => {
    selectProfile(profile);
    router.push('/');
  };

  const handleEditClick = (profile) => {
    router.push(`/mypage/manage/addProfile?id=${profile.id}`);
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (confirm(language === 'ko' ? '정말 삭제하시겠습니까?' : 'Are you sure?')) {
      await removeProfile(id);
    }
  };

  // Render List
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      {/* Hero Section - History Style */}
      <div className="relative overflow-hidden bg-white dark:bg-slate-900 pt-6 pb-12 sm:pt-12 sm:pb-20 px-6 border-b border-slate-100 dark:border-slate-800">
        <div className="absolute bottom-0 right-0 -mr-20 -mb-20 w-80 h-80 bg-indigo-500/10 dark:bg-indigo-500/20 rounded-full blur-[80px]" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-purple-500/10 dark:bg-purple-500/20 rounded-full blur-[80px]" />
        <BackButton title={language === 'ko' ? '프로필 전환' : 'Profile Management'} />
        <div className="relative z-10 max-w-lg mx-auto text-center flex flex-col items-center">
          <div className="relative w-20 h-20 sm:w-28 sm:h-28 overflow-hidden rounded-full border-4 border-white dark:border-slate-800 shadow-2xl mb-4 bg-white dark:bg-slate-800 flex items-center justify-center">
            <img
              src="/images/history/clay_history.png"
              alt="Profiles"
              className='w-full h-full object-cover scale-110'
            />
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-xs font-black uppercase tracking-widest mb-4">
            Profile Management
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
            {language === 'ko' ? (
              <>누구의<br /><span className="font-serif italic text-indigo-700 dark:text-indigo-400">운세</span>를 볼까요?</>
            ) : (
              <>Whose<br /><span className="font-serif italic text-indigo-700 dark:text-indigo-400">Fortune</span> to Check?</>
            )}
          </h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 -mt-2 relative z-20 pb-32">
        <div className="space-y-8">
          {/* My Profile Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 px-2 text-indigo-500 font-black text-sm uppercase tracking-[0.2em]">
              <div className="w-8 h-[2px] bg-indigo-500" />
              {language === "ko" ? '내 프로필' : 'My Profile'}
            </div>

            <div
              onClick={() => handleSelect(userData)}
              className={`group relative flex items-center p-5 sm:p-6 gap-4 transition-all duration-300 rounded-[2rem] overflow-hidden cursor-pointer border ${(userData && selectedProfile?.uid === userData.uid && !selectedProfile.id) ? 'bg-indigo-50/30 dark:bg-indigo-900/10 border-indigo-500 shadow-lg' : 'hover:bg-slate-100/80 dark:hover:bg-slate-900 bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-800 hover:border-indigo-200'}`}
            >
              <div className="w-16 h-16 shrink-0 rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center transition-all duration-500 group-hover:scale-110 shadow-sm overflow-hidden">
                {getProfileAvatar(userData) ? (
                  <img src={getProfileAvatar(userData)} alt="avatar" className="w-full h-full object-cover" />
                ) : (
                  <UserCircleIcon className="w-8 h-8 text-indigo-400" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-black text-base sm:text-lg text-slate-900 dark:text-white">
                    {userData?.displayName || 'Me'}
                  </h3>
                  <span className="text-[10px] font-black text-indigo-500 dark:text-indigo-400 px-2 py-0.5 bg-indigo-50/50 dark:bg-indigo-900/30 rounded-full uppercase tracking-tighter">
                    ME
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  {userData?.birthDate?.split('T')[0]} · {userData?.gender === 'female' ? (language === 'ko' ? '여성' : 'Female') : (language === 'ko' ? '남성' : 'Male')}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={(e) => { e.stopPropagation(); router.push('mypage/profile/edit'); }}
                  className="p-3 hover:bg-white dark:hover:bg-slate-800 rounded-xl transition-all active:scale-90"
                  title={language === "ko" ? '수정' : 'Edit'}
                >
                  <PencilSquareIcon className="w-5 h-5 text-slate-400 dark:text-slate-600 hover:text-indigo-500" />
                </button>
                {(userData && selectedProfile?.uid === userData.uid && !selectedProfile.id) && (
                  <CheckCircleIcon className="w-6 h-6 text-indigo-500" />
                )}
              </div>
            </div>
          </div>

          {/* Saved Profiles Section */}
          {savedProfiles.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 px-2 text-indigo-500 font-black text-sm uppercase tracking-[0.2em]">
                <div className="w-8 h-[2px] bg-indigo-500" />
                {language === "ko" ? `저장된 프로필 (${savedProfiles.length})` : `Saved Profiles (${savedProfiles.length})`}
              </div>

              <div className="grid gap-4">
                {savedProfiles.map(profile => (
                  <div
                    key={profile.id}
                    onClick={() => handleSelect(profile)}
                    className={`hover:bg-slate-100/80 group relative flex items-center p-5 sm:p-6 gap-4 transition-all duration-300 rounded-[2rem] overflow-hidden cursor-pointer border ${(selectedProfile && selectedProfile.id === profile.id) ? 'bg-indigo-50/30 dark:bg-indigo-900/10 border-indigo-500 shadow-lg' : 'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-800 hover:border-indigo-200 '}`}
                  >
                    <div className={`w-14 h-14 shrink-0 rounded-2xl flex items-center justify-center transition-all duration-500 group-hover:scale-110 shadow-sm overflow-hidden ${profile.gender === 'female' ? 'bg-rose-50 dark:bg-rose-900/20' : 'bg-blue-50 dark:bg-blue-900/20'}`}>
                      {getProfileAvatar(profile) ? (
                        <img src={getProfileAvatar(profile)} alt="avatar" className="w-full h-full object-cover" />
                      ) : (
                        <span className={`text-lg font-black ${profile.gender === 'female' ? 'text-rose-400' : 'text-blue-400'}`}>
                          {profile.displayName.charAt(0)}
                        </span>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-black text-base text-slate-900 dark:text-white truncate">
                          {profile.displayName}
                        </h3>
                        <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-tighter ${profile.gender === 'female' ? 'bg-rose-50 text-rose-500 dark:bg-rose-900/30' : 'bg-blue-50 text-blue-500 dark:bg-blue-900/30'}`}>
                          {profile.gender === 'female' ? (language === 'ko' ? '여' : 'F') : (language === 'ko' ? '남' : 'M')}
                        </span>
                        <span className="text-[10px] font-black text-slate-400 border border-slate-100 dark:border-slate-800 px-1.5 py-0.5 rounded-full uppercase tracking-tighter">
                          {profile.relationship}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                        {profile.birthDate} {!profile.isTimeUnknown && profile.birthTime && `(${profile.birthTime})`}
                      </p>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={(e) => { e.stopPropagation(); handleEditClick(profile); }}
                        className="p-3 hover:bg-white dark:hover:bg-slate-800 rounded-xl transition-all active:scale-90"
                      >
                        <PencilSquareIcon className="w-5 h-5 text-slate-300 dark:text-slate-700 hover:text-indigo-500" />
                      </button>
                      {(selectedProfile && selectedProfile.id === profile.id) ? (
                        <CheckCircleIcon className="w-6 h-6 text-indigo-500" />
                      ) : (
                        <button
                          onClick={(e) => handleDelete(e, profile.id)}
                          className="p-3 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl transition-all active:scale-90"
                        >
                          <TrashIcon className="w-5 h-5 text-slate-300 dark:text-slate-700 hover:text-rose-500" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Add Profile Button */}
          <button
            onClick={() => router.push('/mypage/manage/addProfile')}
            className="w-full py-10 bg-white dark:bg-slate-900 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[2.5rem] flex flex-col items-center justify-center gap-3 text-slate-400 hover:text-indigo-500 hover:border-indigo-200 hover:bg-slate-50/50 transition-all group shadow-sm active:scale-[0.98]"
          >
            <div className="w-14 h-14 rounded-2xl bg-slate-50 dark:bg-slate-800 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/30 flex items-center justify-center transition-colors shadow-inner">
              <PlusIcon className="w-6 h-6" />
            </div>
            <span className="font-black text-sm uppercase tracking-widest">
              {language === 'ko' ? '새 프로필 추가하기' : 'Add New Profile'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
