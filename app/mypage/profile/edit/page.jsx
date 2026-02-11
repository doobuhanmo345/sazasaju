'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthContext } from '@/contexts/useAuthContext';
import { useLanguage } from '@/contexts/useLanguageContext';
import {
  UserIcon,
  CalendarIcon,
  ClockIcon,
  ChevronLeftIcon,
  CheckIcon,
  EnvelopeIcon,
  AcademicCapIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';
import FourPillarVis from '@/components/FourPillarVis';
import { useSajuCalculator } from '@/hooks/useSajuCalculator';
import { DateService } from '@/utils/dateService';
import CityInput from '@/ui/CityInput';
import { calculateSaju } from '@/lib/sajuCalculator';
import { getRomanizedIlju } from '@/data/sajuInt';
import BackButton from '@/ui/BackButton';

export default function EditProfilePage() {
  const { user, userData, updateProfileData } = useAuthContext();
  const { language } = useLanguage();
  const router = useRouter();

  // Form State
  const [formData, setFormData] = useState({
    displayName: '',
    birthDate: '',
    birthTime: '12:00',
    isTimeUnknown: false,
    gender: 'female',
    birthCity: '',
  });

  const [isSaving, setIsSaving] = useState(false);

  // 1. Sync initial values
  useEffect(() => {
    if (userData) {
      const bDate = userData.birthDate ? userData.birthDate.split('T')[0] : '';
      const bTime = userData.birthDate ? userData.birthDate.split('T')[1] : '12:00';

      setFormData({
        displayName: userData.displayName || user?.displayName || '',
        birthDate: bDate,
        birthTime: bTime,
        isTimeUnknown: !!userData.isTimeUnknown,
        gender: userData.gender || 'female',
        birthCity: userData.birthCity || '',
      });
    }
  }, [userData, user]);

  // 2. Real-time calculation string
  const effectiveTime = formData.isTimeUnknown ? '12:00' : formData.birthTime || '12:00';
  const InputDateFull = `${formData.birthDate || '2000-01-01'}T${effectiveTime}`;

  // 3. Saju Hook
  const { saju: manse } = useSajuCalculator(InputDateFull, formData.isTimeUnknown);

  // Get Ilju image path
  const getIljuImage = () => {
    if (!manse || !manse.sky1) return null;
    const romanized = getRomanizedIlju(manse.sky1 + manse.grd1);
    const genderSuffix = formData.gender === 'female' ? 'female' : 'male';
    return `/images/ilju/${romanized}_${genderSuffix}.png`;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e) => {
    const checked = e.target.checked;
    setFormData((prev) => ({
      ...prev,
      isTimeUnknown: checked,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      // 불필요한 네트워크 fetch 제거하여 저장 속도 개선
      const todayDate = new Date().toISOString();
      const updateData = {
        displayName: formData.displayName,
        birthDate: `${formData.birthDate}T${effectiveTime}`,
        birthCity: formData.birthCity,
        isTimeUnknown: formData.isTimeUnknown,
        gender: formData.gender,
        updatedAt: todayDate,
        saju: manse,
      };

      await updateProfileData(updateData);
      // alert 대신 즉시 뒤로가기 수행 (사용자 체감 속도 향상)
      router.back();
    } catch (error) {
      console.error('Save failed:', error);
      alert(language === 'ko' ? '저장 중 오류가 발생했습니다.' : 'Error saving profile.');
    } finally {
      setIsSaving(false);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      {/* Hero Section - History Style */}
      <div className="relative overflow-hidden bg-white dark:bg-slate-900 pt-6 pb-16 sm:pt-12 sm:pb-20 px-6 border-b border-slate-100 dark:border-slate-800">
        <div className="absolute bottom-0 right-0 -mr-20 -mb-20 w-80 h-80 bg-indigo-500/10 dark:bg-indigo-500/20 rounded-full blur-[80px]" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-purple-500/10 dark:bg-purple-500/20 rounded-full blur-[80px]" />
        <BackButton title={language === 'ko' ? '내 정보 수정' : 'Edit Profile'} />
        <div className="relative z-10 max-w-lg mx-auto text-center flex flex-col items-center">
          {/* Back Button integrated into Hero */}


          {/* Profile / Ilju Image in Hero */}
          <div className="relative w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-white dark:border-slate-800 shadow-2xl mb-4 bg-white dark:bg-slate-800 flex items-center justify-center">
            {getIljuImage() ? (
              <img
                src={getIljuImage()}
                alt="Ilju Symbol"
                className="w-full h-full object-cover scale-110"
              />
            ) : (
              <img
                src={user?.photoURL || '/images/ilju/default.png'}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            )}
            {user?.photoURL && getIljuImage() && (
              <img
                src={user.photoURL}
                className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full border-2 border-white dark:border-slate-800 shadow-sm object-cover"
                alt="Social profile"
              />
            )}
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-xs font-black uppercase tracking-widest mb-4">
            {language === 'ko' ? '내 정보 수정' : 'Edit Profile'}
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
            {language === 'ko' ? (
              <>개인정보 및<br /><span className="font-serif italic text-indigo-700 dark:text-indigo-400">사주 프로필 관리</span></>
            ) : (
              <>Profile &<br /><span className="font-serif italic text-indigo-700 dark:text-indigo-400">Saju Settings</span></>
            )}
          </h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 -mt-12 relative z-20 pb-20">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-xl overflow-hidden p-6 sm:p-10 space-y-8">
            <div className="space-y-6">
              {/* Email */}
              <div>
                <label className="block text-xs font-black text-indigo-500 uppercase tracking-wider mb-2 ml-1">
                  {language === 'ko' ? '이메일 (수정 불가)' : 'Email (Read Only)'}
                </label>
                <div className="relative">
                  <EnvelopeIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    value={user?.email || ''}
                    readOnly
                    className="w-full bg-gray-100/50 dark:bg-slate-950/50 border border-gray-100 dark:border-slate-800 rounded-2xl pl-12 pr-4 py-4 text-gray-500 cursor-not-allowed outline-none font-medium"
                  />
                </div>
              </div>

              {/* Name */}
              <div>
                <label className="block text-xs font-black text-indigo-500 uppercase tracking-wider mb-2 ml-1">
                  {language === 'ko' ? '이름' : 'Name'}
                </label>
                <div className="relative">
                  <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    name="displayName"
                    value={formData.displayName}
                    onChange={handleChange}
                    className="w-full bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl pl-12 pr-4 py-4 text-gray-800 dark:text-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all font-bold shadow-sm"
                    required
                  />
                </div>
              </div>

              {/* Gender */}
              <div>
                <label className="block text-xs font-black text-indigo-500 uppercase tracking-wider mb-2 ml-1">
                  {language === 'ko' ? '성별' : 'Gender'}
                </label>
                <div className="flex gap-2 p-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl font-bold">
                  {['male', 'female'].map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, gender: g }))}
                      className={`flex-1 py-3 rounded-xl text-sm transition-all duration-300 ${formData.gender === g
                        ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-300 shadow-md ring-1 ring-slate-100 dark:ring-slate-700'
                        : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'
                        }`}
                    >
                      {g === 'male'
                        ? language === 'ko' ? '남성' : 'Male'
                        : language === 'ko' ? '여성' : 'Female'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Live Saju */}
              {manse?.sky1 && (
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-700">
                  <label className="block text-xs font-black text-indigo-500 uppercase tracking-wider mb-3 ml-1">
                    {language === 'ko' ? '실시간 만세력 확인' : 'Live Saju Preview'}
                  </label>
                  <div className="w-full overflow-x-auto touch-pan-x pb-2 custom-scrollbar bg-slate-50 dark:bg-slate-950 p-4 rounded-3xl border border-slate-100 dark:border-slate-800">
                    <div className="min-w-[250px]">
                      <FourPillarVis isTimeUnknown={formData.isTimeUnknown} saju={manse} />
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 font-bold">
                {/* Birth Date */}
                <div>
                  <label className="block text-xs font-black text-indigo-500 uppercase tracking-wider mb-2 ml-1">
                    {language === 'ko' ? '생년월일' : 'Birth Date'}
                  </label>
                  <div className="relative">
                    <CalendarIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="date"
                      name="birthDate"
                      value={formData.birthDate}
                      onChange={handleChange}
                      className="w-full bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl pl-12 pr-4 py-4 text-gray-800 dark:text-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all shadow-sm"
                      required
                    />
                  </div>
                </div>

                {/* Birth Time */}
                <div>
                  <div className="flex justify-between items-center mb-2 ml-1">
                    <label className="text-xs font-black text-indigo-500 uppercase tracking-wider">
                      {language === 'ko' ? '태어난 시간' : 'Birth Time'}
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={formData.isTimeUnknown}
                        onChange={handleCheckboxChange}
                        className="w-4 h-4 rounded border-slate-300 dark:border-slate-700 text-indigo-600 focus:ring-indigo-500 bg-white dark:bg-slate-900"
                      />
                      <span className="text-xs font-bold text-gray-500 dark:text-gray-400 group-hover:text-indigo-500 transition-colors">
                        {language === 'ko' ? '시간 모름' : 'Unknown'}
                      </span>
                    </label>
                  </div>

                  <div className="relative">
                    <ClockIcon
                      className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${formData.isTimeUnknown ? 'text-gray-300 dark:text-slate-800' : 'text-gray-400'}`}
                    />
                    <input
                      type="time"
                      name="birthTime"
                      value={formData.isTimeUnknown ? '12:00' : formData.birthTime}
                      onChange={handleChange}
                      disabled={formData.isTimeUnknown}
                      className={`w-full border rounded-2xl pl-12 pr-4 py-4 outline-none transition-all font-bold shadow-sm ${formData.isTimeUnknown
                        ? 'bg-slate-100 dark:bg-slate-950 border-transparent text-slate-300 dark:text-slate-800 cursor-not-allowed shadow-none'
                        : 'bg-white dark:bg-slate-950 border-slate-100 dark:border-slate-800 text-gray-800 dark:text-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500'
                        }`}
                      required={!formData.isTimeUnknown}
                    />
                  </div>
                </div>
              </div>

              {/* Birth City */}
              <div>
                <label className="block text-xs font-black text-indigo-500 uppercase tracking-wider mb-2 ml-1">
                  {language === 'ko' ? '태어난 도시' : 'City of Birth'}
                </label>
                <CityInput
                  name="birthCity"
                  value={formData.birthCity || ''}
                  language={language}
                  onChange={handleChange}
                  className="w-full"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 h-20">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 py-4.5 border-2 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 rounded-2xl font-black text-base hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all active:scale-95 flex items-center justify-center"
            >
              {language === 'ko' ? '취소' : 'Cancel'}
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex-[2] py-4.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black text-base shadow-xl hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSaving ? (
                <div className="w-5 h-5  border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <CheckIcon className="w-5 h-5" />
                  {language === 'ko' ? '저장하기' : 'Save Changes'}
                </>
              )}
            </button>
          </div>

          {/* Consultant Apply Link - History Styled */}
          {userData?.role === 'user' && (
            <button
              type="button"
              onClick={() => router.push('/apply-saju-consultant')}
              className="w-full flex items-center justify-between p-6 bg-gradient-to-br from-indigo-500 via-indigo-600 to-purple-600 rounded-[2rem] text-white shadow-xl shadow-indigo-500/20 hover:translate-y-[-2px] transition-all group overflow-hidden relative"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl group-hover:scale-125 transition-transform duration-500" />
              <div className="relative z-10 flex items-center gap-5">
                <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm group-hover:scale-110 transition-transform">
                  <AcademicCapIcon className="w-7 h-7 text-white" />
                </div>
                <div className="text-left font-black">
                  <p className="text-xs opacity-80 uppercase tracking-widest mb-1">
                    {language === 'ko' ? '전문가 활동' : 'Expert Activity'}
                  </p>
                  <p className="text-xl">
                    {language === 'ko' ? '명리학자 신청하기' : 'Apply as Consultant'}
                  </p>
                </div>
              </div>
              <ChevronRightIcon className="relative z-10 w-6 h-6 opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
            </button>
          )}
        </form>
      </div>
    </div>
  );
}
