'use client';

import { useAuthContext } from '@/contexts/useAuthContext';
import { useLanguage } from '@/contexts/useLanguageContext';
import { useRouter } from 'next/navigation';
import { UserCircleIcon, ChevronRightIcon } from '@heroicons/react/24/solid';

export default function MyInfoBar() {
  const { userData, selectedProfile } = useAuthContext();
  const { language } = useLanguage();
  const router = useRouter();

  // Decide which profile to show: selectedProfile (if valid) or userData (fallback)
  // Actually, context logic says selectedProfile is set to userData initially.
  // But let's be safe.
  const target = selectedProfile || userData;

  if (!target) return null;

  const isMe = !selectedProfile || (selectedProfile.uid === userData?.uid && !selectedProfile.id);


  // Display Name logic
  const displayName = isMe
    ? (userData?.displayName || (language === 'ko' ? '나의 운세' : 'My Fortune'))
    : target.displayName;

  // Birth Date Logic
  const birthDateStr = target?.birthDate ? target.birthDate.split('T')[0].replace(/-/g, '.') : '';
  const birthTimeStr = target?.isTimeUnknown
    ? (language === 'en' ? 'Time Unknown' : '시간 모름')
    : (target?.birthDate && target.birthDate.split('T')[1] ? target.birthDate.split('T')[1] : '');

  return (

    <button
      onClick={() => router.push('/profile/manage')}
      className="w-full flex items-center justify-between group"
    >
      <div className="flex items-center gap-3 text-sm tracking-tight overflow-hidden">

        {/* Profile Icon / Name */}
        <div className="flex items-center gap-2 shrink-0">
          <div className={`p-1 rounded-full ${isMe ? 'bg-indigo-100 text-indigo-500 dark:bg-indigo-500/20 dark:text-indigo-300' : 'bg-purple-100 text-purple-500 dark:bg-purple-500/20 dark:text-purple-300'}`}>
            <UserCircleIcon className="w-4 h-4" />
          </div>
          <span className={`font-bold truncate max-w-[80px] sm:max-w-[120px] ${isMe ? 'text-slate-700 dark:text-slate-200' : 'text-purple-600 dark:text-purple-300'}`}>
            {displayName}
          </span>
        </div>

        <div className="w-px h-3 bg-slate-200 dark:bg-slate-700 shrink-0"></div>

        {/* Birth Info */}
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="font-medium text-slate-600 dark:text-slate-300">{birthDateStr}</span>
          <span className="text-slate-400 dark:text-slate-500 text-xs font-light hidden sm:inline-block">
            {birthTimeStr}
          </span>
        </div>

        {/* Gender Badge */}
        <div
          className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase shrink-0 ${target.gender === 'male'
            ? 'bg-blue-50 text-blue-500 dark:bg-blue-900/30'
            : 'bg-rose-50 text-rose-500 dark:bg-rose-900/30'
            }`}
        >
          {target.gender === 'male' ? 'M' : 'F'}
        </div>
      </div>

      {/* Action Text/Icon */}
      <div className="flex items-center gap-1 text-xs font-bold text-indigo-500 dark:text-indigo-400 opacity-60 group-hover:opacity-100 transition-opacity whitespace-nowrap ml-2">
        <span className="hidden sm:inline">{language === 'ko' ? '변경' : 'Change'}</span>
        <ChevronRightIcon className="w-4 h-4 font-bold " />
      </div>
    </button>
  );
}
