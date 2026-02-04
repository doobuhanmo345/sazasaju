'use client';

import { useEffect, useState, useMemo } from 'react';
import {
  CalendarDaysIcon,
  HeartIcon,
  SparklesIcon,
  HomeModernIcon,
  BriefcaseIcon,
  FaceSmileIcon,
  UserGroupIcon,
  UsersIcon,
  LockClosedIcon,
  TicketIcon,
  LinkIcon
} from '@heroicons/react/24/outline';
import { ExclamationTriangleIcon } from '@heroicons/react/24/solid';

import { useAuthContext } from '@/contexts/useAuthContext';
import { useLanguage } from '@/contexts/useLanguageContext';
import { useUsageLimit } from '@/contexts/useUsageLimit';
import { useConsumeEnergy } from '@/hooks/useConsumingEnergy';
import { useSajuCalculator } from '@/hooks/useSajuCalculator';

import Step from '@/components/Step';
import ModifyBd from '@/components/ModifyBd';
import EnergyBadge from '@/ui/EnergyBadge';
import LoadingBar from '@/components/LoadingBar';
import StartButton from '@/ui/StartButton';
import MatchAppeal from '@/app/saju/match/MatchAppeal';
import { SajuAnalysisService, AnalysisPresets } from '@/lib/SajuAnalysisService';
import { parseAiResponse, getEng, classNames } from '@/utils/helpers';
import { UI_TEXT, langPrompt, hanja } from '@/data/constants';
import SelectPerson from '@/ui/SelectPerson';
const RELATION_TYPES = [
  {
    id: 'lover',
    label: '연인',
    sub: 'Lover',
    desc: '깊은 사랑을 나누는 사이',
    descEn: 'A relationship sharing deep love',
    icon: HeartIcon,
    color: 'text-rose-500',
    bg: 'bg-rose-50',
    border: 'border-rose-200',
    activeBorder: 'border-rose-500 ring-rose-200',
  },
  {
    id: 'some',
    label: '썸 / 짝사랑',
    sub: 'Crush / Some',
    desc: '설렘이 시작되는 단계',
    descEn: 'The beginning of heart-fluttering excitement',
    icon: SparklesIcon,
    color: 'text-pink-400',
    bg: 'bg-pink-50',
    border: 'border-pink-200',
    activeBorder: 'border-pink-500 ring-pink-200',
  },
  {
    id: 'married',
    label: '부부',
    sub: 'Spouse',
    desc: '평생을 함께하는 동반자',
    descEn: 'A lifelong partner walking together',
    icon: HomeModernIcon,
    color: 'text-purple-500',
    bg: 'bg-purple-50',
    border: 'border-purple-200',
    activeBorder: 'border-purple-500 ring-purple-200',
  },
  {
    id: 'family',
    label: '부모 / 자식',
    sub: 'Parent / Child',
    desc: '서로를 이끌어주는 소중한 혈연',
    descEn: 'Precious blood ties guiding each other',
    icon: UsersIcon,
    color: 'text-orange-500',
    bg: 'bg-orange-50',
    border: 'border-orange-200',
    activeBorder: 'border-orange-500 ring-orange-200',
  },
  {
    id: 'business',
    label: '사업 파트너',
    sub: 'Business',
    desc: '성공을 위한 비즈니스 관계',
    descEn: 'Strategic partnership for success',
    icon: BriefcaseIcon,
    color: 'text-slate-600',
    bg: 'bg-slate-50',
    border: 'border-slate-200',
    activeBorder: 'border-slate-600 ring-slate-200',
  },
  {
    id: 'friend',
    label: '친구 / 동료',
    sub: 'Friend',
    desc: '격의 없이 편안한 사이',
    descEn: 'Comfortable relationship without barriers',
    icon: FaceSmileIcon,
    color: 'text-emerald-500',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    activeBorder: 'border-emerald-500 ring-emerald-200',
  },
  {
    id: 'etc',
    label: '기타',
    sub: 'Others',
    desc: '그 외의 다양한 관계',
    descEn: 'Various other types of connections',
    icon: UserGroupIcon,
    color: 'text-indigo-400',
    bg: 'bg-indigo-50',
    border: 'border-indigo-200',
    activeBorder: 'border-indigo-500 ring-indigo-200',
  },
];

export default function MatchPage() {
  const { language } = useLanguage();
  const { user, userData, selectedProfile,savedProfiles } = useAuthContext();
  // 컨텍스트 스위칭
  const targetProfile = selectedProfile || userData;
  const { birthDate: inputDate, isTimeUnknown, gender, saju } = targetProfile || {};
//컨텍스트 스위칭 끝
  const { MAX_EDIT_COUNT, isLocked, setEditCount, editCount } = useUsageLimit();

  const [mounted, setMounted] = useState(false);

const onSelect = (id) => {
  console.log(id)
  const selectedProfile = savedProfiles.find((profile) => profile.id === id)
  console.log(selectedProfile)
  setSaju2(selectedProfile.saju)
  // const bd = getOriginalDate(selectedProfile.birthDate)
  setInputDate2(selectedProfile.birthDate+'T'+selectedProfile.birthTime )
  setIsTimeUnknown2(selectedProfile.isTimeUnknown)
  setGender2(selectedProfile.gender)
}
  // Client-side Title Update for Localization (Static Export Support)
  useEffect(() => {
    if (language === 'ko') {
      document.title = '정밀 궁합 분석 | 두 사람의 오행 조화와 인연';
    } else {
      document.title = 'Compatibility Analysis | Harmony of Spirits';
    }
  }, [language]);

  useEffect(() => {
    setMounted(true);
  }, []);


  const [aiResult, setAiResult] = useState('');
  const [step, setStep] = useState(0);
  const [selectedRel, setSelectedRel] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isCachedLoading, setIsCachedLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [data, setData] = useState(null);

  const [gender2, setGender2] = useState('male');
  const [isTimeUnknown2, setIsTimeUnknown2] = useState(false);
  const [isSaved2, setIsSaved2] = useState(false);
  const [inputDate2, setInputDate2] = useState(() => {
    try {
      const now = new Date();
      const offset = now.getTimezoneOffset() * 60000;
      return new Date(now.getTime() - offset).toISOString().slice(0, 16);
    } catch (e) {
      return '2024-01-01T00:00';
    }
  });
     const { saju: saju2Init } = useSajuCalculator(inputDate2, isTimeUnknown2);
const [saju2, setSaju2] = useState(saju2Init);

// saju2Init(계산 결과)이 바뀔 때마다 saju2 상태를 업데이트
useEffect(() => {
  if (saju2Init) {
    setSaju2(saju2Init);
  }
}, [saju2Init]); // 의존성 배열에 saju2Init을 넣습니다.
  const t = (char) => (language === 'en' ? getEng(char) : char);

  const compaEnergy = useConsumeEnergy();
  const totalStep = 4;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [step]);

  useEffect(() => {
    let interval;
    if (loading) {
      setProgress(0);
      interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 99) return 99;
          return prev + (isCachedLoading ? 25 : 1);
        });
      }, isCachedLoading ? 50 : 232);
    } else {
      setProgress(100);
    }
    return () => clearInterval(interval);
  }, [loading, isCachedLoading]);

  const service = useMemo(() => new SajuAnalysisService({
    user,
    userData,
    language,
    maxEditCount: MAX_EDIT_COUNT,
    setEditCount,
    setLoading,
    setAiResult,
  }), [user, userData, language, MAX_EDIT_COUNT, setEditCount, setLoading, setAiResult]);

  const handleMatch = async () => {
    setAiResult('');
    try {
      await service.analyze(
        AnalysisPresets.match({
          saju,
          saju2,
          gender,
          gender2,
          inputDate,
          inputDate2,
          relationship: selectedRel,
          language,
        })
      );
      setStep(4);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (aiResult) {
      const parsedData = parseAiResponse(aiResult);
      if (parsedData) {
        setData(parsedData);
      }
    }
  }, [aiResult]);

  const handleStartClick = () => setStep(1);
  const handleBack = () => step > 1 && setStep(step - 1);
  const handleRelationshipNext = () => {
    if (selectedRel) {
      setStep(2);
      setAiResult('');
    }
  };
  const handleSaveInfo2 = () => {
    setStep(3);
    setIsSaved2(true);
  };

  const isAnalysisDone = useMemo(() => {
    if (!userData?.usageHistory?.ZMatchAnalysis) return false;
    const cached = userData.usageHistory.ZMatchAnalysis;
    return (
      cached.language === language &&
      cached.gender === gender &&
      cached.relationship === selectedRel &&
      SajuAnalysisService.compareSaju(cached.saju, saju) &&
      SajuAnalysisService.compareSaju(cached.saju2, saju2)
    );
  }, [userData, language, gender, selectedRel, saju, saju2]);

  const DISABLED_STYLE = 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200';
  const isDisabled = (loading && !compaEnergy.isConsuming) || !user || loading;
  const isDisabled2 = !isAnalysisDone && isLocked;

  if (!mounted) return null;

  return (
    <main className="min-h-screen ">
      <div className="w-full">
        {step > 0 && (
          <Step
            step={step}
            totalStep={totalStep}
            title={
              step === 1 ? 'Select Relationship' : step === 2 ? 'Enter Birth Details' : step === 3 ? 'Confirm Data' : 'Analysis Result'
            }
            onBack={handleBack}
          />
        )}

        {step === 0 && (
          <div className="w-full animate-in fade-in slide-in-from-bottom-5 duration-700">
            <div className="max-w-lg mx-auto text-center px-6 mb-12">
              <h2 className="text-3xl font-black text-slate-800 dark:text-white mb-4 tracking-tight">
                {language === 'ko' ? '사주로 보는' : 'Reading the Fate'}
                <br />
                <span className="relative text-rose-600 dark:text-rose-500">
                  {language === 'ko' ? '운명적 궁합 & 조화' : 'Destined Match & Harmony'}
                  <div className="absolute inset-0 bg-rose-200/50 dark:bg-rose-800/60 blur-md rounded-full scale-100"></div>
                </span>
              </h2>

              <div className="space-y-4 text-slate-600 dark:text-slate-400 mb-10 leading-relaxed break-keep">
                <p className="text-sm">
                  <strong>{language === 'ko' ? '두 사람의 에너지 조화' : 'Harmony of Two Energies'}</strong>
                  {language === 'ko' ? '와 ' : ' and '}
                  <strong>{language === 'ko' ? '서로에게 미치는 영향' : 'Mutual Impact on Fate'}</strong>
                  {language === 'ko' ? ', 정밀한 관계 지도 분석.' : ', Precise Relationship Map Analysis.'}
                </p>
                <div className="m-auto max-w-sm rounded-2xl overflow-hidden shadow-sm border border-slate-100 dark:border-slate-800">
                  <img src="/images/introcard/match_1.webp" alt="match" className="w-full h-auto" />
                </div>
              </div>

              <StartButton
                onClick={handleStartClick}
                disabled={loading}
                isDone={false}
                label={language === 'ko' ? '궁합 분석 시작하기' : 'Start Match Analysis'}
                color="rose"
              />
            </div>
            <MatchAppeal />
          </div>
        )}

        {step === 1 && (
          <div className="w-full max-w-3xl mx-auto px-1 animate-in fade-in duration-500">
            <div className="flex flex-col gap-6">
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">
                  {language === 'ko' ? '어떤 관계인가요?' : 'What is your relationship?'}
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                  {language === 'ko' ? '관계를 선택하면 그에 맞는 정밀한 분석이 진행됩니다.' : 'Choosing a relationship allows for a more tailored analysis.'}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                {RELATION_TYPES.map((type) => {
                  const isSelected = selectedRel === type.id;
                  const Icon = type.icon;
                  const labelText = language === 'en' ? type.sub : type.label;
                  return (
                    <button
                      key={type.id}
                      onClick={() => setSelectedRel(type.id)}
                      className={`relative flex flex-col items-center p-5 rounded-2xl border-2 transition-all duration-200 ${isSelected ? `${type.activeBorder} ${type.bg}` : 'border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-rose-100'}`}
                    >
                      <Icon className={`w-8 h-8 mb-3 ${type.color}`} />
                      <span className={`text-sm font-bold ${isSelected ? 'text-slate-900' : 'text-slate-700 dark:text-slate-200'}`}>{labelText}</span>
                    </button>
                  );
                })}
              </div>

              <div className="mt-4 flex justify-end">
                <button
                  disabled={!selectedRel}
                  onClick={handleRelationshipNext}
                  className={`px-8 py-3 rounded-xl font-bold text-white shadow-lg ${selectedRel ? 'bg-indigo-600 hover:bg-indigo-500' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
                >
                  {language === 'en' ? 'Next' : '다음'}
                </button>
              </div>
            </div>
          </div>
        )}

       {step === 2 && (
          <div className="w-full max-w-5xl mx-auto px-1 animate-fadeIn">
            <div className="flex flex-col md:flex-row items-stretch gap-4 md:gap-6">
              <div className="flex-1 bg-white dark:bg-slate-800 rounded-2xl border border-indigo-100 dark:border-indigo-900 shadow-sm overflow-hidden flex flex-col transition-all hover:shadow-md">
                <div className="h-1.5 w-full bg-gradient-to-r from-blue-500 to-indigo-600"></div>

                <div className="p-5 flex flex-col h-full justify-center">
                  <div className="mb-4 flex items-center">
                    <span className="px-3 py-1 rounded-md text-[11px] font-extrabold bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-300 tracking-widest border border-indigo-100 dark:border-indigo-800">
                      ME
                    </span>
                  </div>

                  <div className="flex items-center justify-center gap-2 bg-slate-50 dark:bg-slate-700/30 py-3 rounded-xl mb-6 text-sm font-medium text-slate-500 dark:text-slate-400 border border-slate-100 dark:border-slate-700">
                    <CalendarDaysIcon className="w-4 h-4 text-indigo-400" />
                    <span className="font-mono tracking-wide text-slate-700 dark:text-slate-300">
                      {inputDate 
                        ? (isTimeUnknown ? inputDate.split('T')[0] : inputDate.replace('T', ' '))
                        : (language ==='en' ? 'Please register your info' : '정보를 먼저 등록해주세요')}
                    </span>
                    {inputDate && <span className="text-lg ml-1">{gender === 'male' ? '👨' : '👩'}</span>}
                    {inputDate && isTimeUnknown && (
                      <span className="text-[10px] bg-white dark:bg-slate-600 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-500 text-slate-400">
                        {UI_TEXT.unknownTime[language]}
                      </span>
                    )}
                  </div>

                  <div className="flex-1 flex items-center justify-center">
                    {saju?.sky1 && (
                      <div className="flex flex-wrap justify-center gap-x-4 gap-y-2">
                        <div className="flex flex-col items-center">
                          <span className="text-xs text-indigo-300 dark:text-indigo-600 uppercase mb-0.5">
                            {UI_TEXT.year[language]}
                          </span>
                          <span className="text-lg font-extrabold text-indigo-900 dark:text-indigo-100 tracking-widest leading-none">
                            {t(saju.sky3)}
                            {t(saju.grd3)}
                          </span>
                        </div>
                        <div className="flex flex-col items-center">
                          <span className="text-xs text-indigo-300 dark:text-indigo-600 uppercase mb-0.5">
                            {UI_TEXT.month[language]}
                          </span>
                          <span className="text-lg font-extrabold text-indigo-900 dark:text-indigo-100 tracking-widest leading-none">
                            {t(saju.sky2)}
                            {t(saju.grd2)}
                          </span>
                        </div>
                        <div className="flex flex-col items-center relative">
                          <div className="absolute inset-0 bg-indigo-100/50 dark:bg-indigo-500/20 blur-md rounded-full transform scale-150"></div>
                          <span className="text-xs text-indigo-500 dark:text-indigo-400 font-bold uppercase mb-0.5 relative z-10">
                            {UI_TEXT.day[language]}
                          </span>
                          <span className="text-xl font-black text-indigo-600 dark:text-indigo-200 tracking-widest leading-none relative z-10 drop-shadow-sm">
                            {t(saju.sky1)}
                            {t(saju.grd1)}
                          </span>
                        </div>
                        {!isTimeUnknown && (
                          <div className="flex flex-col items-center">
                            <span className="text-xs text-indigo-300 dark:text-indigo-600 uppercase mb-0.5">
                              {UI_TEXT.hour[language]}
                            </span>
                            <span className="text-lg font-extrabold text-indigo-900 dark:text-indigo-100 tracking-widest leading-none">
                              {t(saju.sky0)}
                              {t(saju.grd0)}
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-center -my-3 md:my-0 md:-mx-5 z-10">
                <div className="bg-white dark:bg-slate-700 p-2.5 rounded-full shadow-md border border-slate-200 dark:border-slate-600">
                  <LinkIcon className="w-5 h-5 text-slate-400 dark:text-slate-300 transform -rotate-45" />
                </div>
              </div>

              <div className="flex-1 bg-white dark:bg-slate-800 rounded-2xl border border-emerald-100 dark:border-emerald-900 shadow-sm overflow-hidden flex flex-col transition-all hover:shadow-md">
                <div className="h-1.5 w-full bg-gradient-to-r from-emerald-400 to-teal-500"></div>

                <div className="p-5 flex flex-col h-full justify-center">
                  <div className="mb-2 flex items-center">
                    <span className="px-3 py-1 rounded-md text-[11px] font-extrabold bg-emerald-50 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-300 tracking-widest border border-emerald-100 dark:border-emerald-800">
                      TARGET
                    </span>
                  </div>

                  <div className="flex-1 flex flex-col justify-center">

                    {savedProfiles && savedProfiles.length > 0 && (
                      <div className="mb-6 px-1">
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">
                          {language === 'ko' ? '불러오기' : 'Load Profile'}
                        </label>
                        <SelectPerson 
                          list={savedProfiles} 
                          onSelect={onSelect} 
                        />
                      </div>
                    )}
                    <ModifyBd
                      gender={gender2}
                      inputDate={inputDate2}
                      isTimeUnknown={isTimeUnknown2}
                      setIsTimeUnknown={setIsTimeUnknown2}
                      saju={saju2}
                      handleSaveMyInfo={handleSaveInfo2}
                      setInputDate={setInputDate2}
                      isSaved={false}
                      setGender={setGender2}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

      {step === 3 && (
        <div className="w-full max-w-4xl mx-auto px-1 animate-fadeIn">
          <div className="text-center mb-8">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">
              {language === 'en' ? 'Is the information correct?' : '정보가 맞나요?'}
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              {language === 'en' ? (
                <>Precise analysis will begin based on this information. <br />Please go back if you need to make changes.</>
              ) : (
                <>입력하신 정보를 바탕으로 정밀 분석을 시작합니다. <br />수정이 필요하면 이전 단계로 돌아가주세요.</>
              )}
            </p>
          </div>
          <div className="flex justify-center mb-8">
            {(() => {
              const relData = RELATION_TYPES.find((r) => r.id === selectedRel);
              const RelIcon = relData?.icon || UserGroupIcon;
              const relLabel = relData ? (language === 'en' ? relData.sub : relData.label) : (language === 'en' ? 'Not Selected' : '선택 안함');
              return (
                <div className={`flex items-center gap-3 px-6 py-3 rounded-2xl border-2 shadow-sm ${relData?.bg || 'bg-slate-50'} ${relData?.border || 'border-slate-200'} dark:bg-slate-800 dark:border-slate-700`}>
                  <div className={`p-2 rounded-full bg-white dark:bg-slate-900 shadow-sm ${relData?.color || 'text-slate-400'}`}>
                    <RelIcon className="w-6 h-6" />
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">RELATIONSHIP</span>
                    <span className="text-lg font-bold text-slate-700 dark:text-slate-200">{relLabel}</span>
                  </div>
                </div>
              );
            })()}
          </div>
          <div className="flex flex-col sm:flex-row gap-4 items-stretch justify-center relative">
            <div className="flex-1 bg-white dark:bg-slate-800 p-5 rounded-2xl border border-indigo-100 dark:border-indigo-900 shadow-sm flex flex-col items-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1.5 bg-indigo-500"></div>
              <span className="mb-4 px-2.5 py-1 rounded-full text-[10px] font-bold bg-indigo-50 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-300 uppercase tracking-widest">ME</span>
              <div className="text-center mb-4">
                <div className="text-lg font-bold text-slate-700 dark:text-slate-200 font-mono">{inputDate.split('T')[0]}</div>
                <div className="text-sm text-slate-500 dark:text-slate-400 mt-1 flex items-center justify-center gap-2">
                  <span>{gender === 'male' ? (language === 'en' ? 'Male 👨' : '남성 👨') : (language === 'en' ? 'Female 👩' : '여성 👩')}</span>
                  <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                  <span>{isTimeUnknown ? (language === 'en' ? 'Time Unknown' : '시간 모름') : inputDate.split('T')[1]}</span>
                </div>
              </div>
              <div className="flex gap-3 opacity-80">
                <div className="flex flex-col items-center p-2 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                  <span className="text-xs text-slate-400 mb-1">{language === 'en' ? 'Day Pillar' : '일주'}</span>
                  <span className="font-bold text-indigo-600 dark:text-indigo-300">{t(saju.sky1)}{t(saju.grd1)}</span>
                </div>
              </div>
            </div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 md:static md:translate-x-0 md:translate-y-0 md:flex md:items-center">
              <div className="bg-white dark:bg-slate-700 p-2 rounded-full shadow-md border border-slate-100 dark:border-slate-600">
                <span className="font-black text-slate-300 text-xs">VS</span>
              </div>
            </div>
            <div className="flex-1 bg-white dark:bg-slate-800 p-5 rounded-2xl border border-emerald-100 dark:border-emerald-900 shadow-sm flex flex-col items-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1.5 bg-emerald-500"></div>
              <span className="mb-4 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-300 uppercase tracking-widest">TARGET</span>
              <div className="text-center mb-4">
                <div className="text-lg font-bold text-slate-700 dark:text-slate-200 font-mono">{inputDate2.split('T')[0]}</div>
                <div className="text-sm text-slate-500 dark:text-slate-400 mt-1 flex items-center justify-center gap-2">
                  <span>{gender2 === 'male' ? (language === 'en' ? 'Male 👨' : '남성 👨') : (language === 'en' ? 'Female 👩' : '여성 👩')}</span>
                  <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                  <span>{isTimeUnknown2 ? (language === 'en' ? 'Time Unknown' : '시간 모름') : inputDate2.split('T')[1]}</span>
                </div>
              </div>
              <div className="flex gap-3 opacity-80">
                <div className="flex flex-col items-center p-2 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                  <span className="text-xs text-slate-400 mb-1">{language === 'en' ? 'Day Pillar' : '일주'}</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-300">{saju2?.sky1 ? `${t(saju2.sky1)}${t(saju2.grd1)}` : '-'}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="my-5 flex justify-center">
            {loading && <LoadingBar progress={progress} loadingType={'compati'} isCachedLoading={isCachedLoading} />}
          </div>
          <div className="flex justify-center">
            <button
              onClick={() => compaEnergy.triggerConsume(handleMatch)}
              disabled={isDisabled || isDisabled2}
              className={classNames(
                'w-full sm:w-auto px-10 py-4 font-bold rounded-xl shadow-lg dark:shadow-none transform transition-all flex items-center justify-center gap-2',
                isDisabled ? DISABLED_STYLE : 'bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-indigo-200 hover:-translate-y-1',
              )}
            >
              <SparklesIcon className="w-5 h-5 animate-pulse" />
              <span>{language === 'en' ? 'Start Chemistry Analysis' : '궁합 분석 시작하기'}</span>
              {!!isAnalysisDone ? (
                <div className="flex items-center gap-1 backdrop-blur-md bg-white/20 px-2 py-0.5 rounded-full border border-white/30">
                  <span className="text-[9px] font-bold text-white uppercase">Free</span>
                  <TicketIcon className="w-3 h-3 text-white" />
                </div>
              ) : isLocked ? (
                <div className="mt-1 flex items-center gap-1 backdrop-blur-sm px-2 py-0.5 rounded-full border shadow-sm relative z-10 border-gray-500/50 bg-gray-400/40">
                  <LockClosedIcon className="w-4 h-4 text-amber-500" />
                </div>
              ) : user && (
                <div className="relative scale-90">
                  <EnergyBadge active={userData?.birthDate} consuming={loading} cost={-1} />
                </div>
              )}
            </button>
          </div>
          {isLocked ? (
            <p className="text-center mt-4 text-rose-600 font-black text-sm flex items-center justify-center gap-1 animate-pulse">
              <ExclamationTriangleIcon className="w-4 h-4" /> {language === 'ko' ? '크레딧이 부족합니다..' : 'not Enough credit'}
            </p>
          ) : (
            <p className="text-center mt-4 text-[11px] text-slate-400">
              {language === 'ko' ? '이미 분석된 운세는 크래딧을 재소모하지 않습니다.' : 'Fortunes that have already been analyzed do not use credits.'}
            </p>
          )}
        </div>
      )}

      {step === 4 && (
        <div className="w-full max-w-4xl mx-auto px-1 animate-fadeIn">
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm p-4 mb-4 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500"></div>
            <div className="flex justify-between items-start mb-3">
              <span className="text-[10px] font-black tracking-tighter text-slate-400 uppercase">MATCH ANALYSIS</span>
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-slate-50 dark:bg-slate-700/50 border border-slate-100 dark:border-slate-600">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">RELATION</span>
                <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                  {(() => {
                    const r = RELATION_TYPES.find((t) => t.id === selectedRel);
                    return r ? (language === 'en' ? r.sub : r.label) : selectedRel;
                  })()}
                </span>
              </div>
            </div>
            <div className="grid grid-cols-[1fr_auto_1fr] items-center">
              <div className="flex flex-col items-center text-center">
                <span className="text-[9px] font-black text-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 px-1.5 py-0.5 rounded mb-1">ME</span>
                <div className="flex flex-col sm:flex-row items-center gap-1">
                  <span className="text-base font-bold text-slate-700 dark:text-slate-200">{inputDate.split('T')[0].slice(2)}</span>
                  <span className="text-xs text-slate-400">{gender === 'male' ? 'M 👨' : 'F 👩'}</span>
                </div>
              </div>
              <div className="px-3 flex flex-col items-center justify-center">
                <div className="w-8 h-8 rounded-full border border-slate-100 dark:border-slate-700 flex items-center justify-center bg-slate-50 dark:bg-slate-900/50 shadow-inner">
                  <span className="text-[10px] font-black text-slate-300">VS</span>
                </div>
              </div>
              <div className="flex flex-col items-center text-center">
                <span className="text-[9px] font-black text-emerald-500 bg-emerald-50 dark:bg-emerald-900/30 px-1.5 py-0.5 rounded mb-1">TARGET</span>
                <div className="flex flex-col sm:flex-row items-center gap-1">
                  <span className="text-base font-bold text-slate-700 dark:text-slate-200">{inputDate2.split('T')[0].slice(2)}</span>
                  <span className="text-xs text-slate-400">{gender2 === 'male' ? 'M 👨' : 'F 👩'}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-indigo-50/30 dark:bg-slate-800/50 rounded-2xl border border-indigo-100/50 dark:border-slate-700 p-5 sm:p-6 shadow-sm">
            {!!data && (
              <div className="flex flex-col gap-8 py-2 animate-up">
                <section className="text-center">
                  <span className="font-xs font-bold tracking-[0.2em] text-slate-400 uppercase mb-2 block">Match Identity</span>
                  <h2 className="text-xl font-black text-slate-800 dark:text-white mb-1">{data.matchIdentity}</h2>
                  <p className="text-sm text-indigo-500 font-semibold">{data.title}</p>
                  <div className="mt-6 max-w-[240px] mx-auto">
                    <div className="flex justify-between items-end mb-1.5 px-0.5">
                      <span className="font-xs font-bold text-slate-400 uppercase">Compatibility</span>
                      <span className="text-xl font-black text-slate-800 dark:text-white leading-none">{data.score}%</span>
                    </div>
                    <div className="h-1 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-500 transition-all duration-1000" style={{ width: `${data.score}%` }} />
                    </div>
                  </div>
                </section>
                <section className="border-t border-slate-100 dark:border-slate-800 pt-6 text-center">
                  <p className="text-[14px] leading-relaxed text-slate-600 dark:text-slate-400 italic mb-4">"{data.vibe}"</p>
                  <div className="flex flex-wrap justify-center gap-2">
                    {data.keywords.map((word, i) => <span key={i} className="text-[10px] font-medium text-slate-400">#{word}</span>)}
                  </div>
                </section>
                <section className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-6 border-t border-slate-100 dark:border-slate-800 pt-6">
                  <div>
                    <h4 className="font-xs font-black text-indigo-500 uppercase tracking-widest mb-2">Analysis: Me</h4>
                    <p className="text-[13px] leading-relaxed text-slate-500 dark:text-slate-400">{data.insights.me}</p>
                  </div>
                  <div>
                    <h4 className="font-xs font-black text-indigo-500 uppercase tracking-widest mb-2">Analysis: Target</h4>
                    <p className="text-[13px] leading-relaxed text-slate-500 dark:text-slate-400">{data.insights.target}</p>
                  </div>
                </section>
                <section className="space-y-6 border-t border-slate-100 dark:border-slate-800 pt-6">
                  <div>
                    <h4 className="font-xs font-black text-slate-800 uppercase tracking-widest mb-2">{language ==='en' ? 'Synergy' : '관계 시너지'}</h4>
                    <p className="text-[13px] leading-relaxed text-slate-500 dark:text-slate-400">{data.insights.synergyPros}</p>
                  </div>
                  <div>
                    <h4 className="font-xs font-black text-slate-800 uppercase tracking-widest mb-2">{language ==='en' ? 'Points of Friction' : '주의할 지점'}</h4>
                    <p className="text-[13px] leading-relaxed text-slate-500 dark:text-slate-400">{data.insights.synergyCons}</p>
                  </div>
                </section>
                <section className="grid grid-cols-1 sm:grid-cols-2 gap-6 border-t border-slate-100 dark:border-slate-800 pt-6">
                  <div>
                    <h4 className="font-xs font-black text-slate-400 uppercase tracking-widest mb-3">Strengths</h4>
                    <ul className="space-y-1.5">
                      {data.pros.map((item, i) => <li key={i} className="text-[13px] text-slate-500 flex gap-2"><span className="text-indigo-300">·</span> {item}</li>)}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-xs font-black text-slate-400 uppercase tracking-widest mb-3">Cautions</h4>
                    <ul className="space-y-1.5">
                      {data.cons.map((item, i) => <li key={i} className="text-[13px] text-slate-500 flex gap-2"><span className="text-indigo-300">·</span> {item}</li>)}
                    </ul>
                  </div>
                </section>
                <section className="border-t border-slate-100 dark:border-slate-800 pt-6 pb-4">
                  <h4 className="font-xs font-black text-indigo-500 uppercase tracking-widest mb-3 text-center">Master's Conclusion</h4>
                  <p className="text-[14px] font-medium text-slate-700 dark:text-slate-200 leading-relaxed text-center max-w-md mx-auto mb-4">{data.advice}</p>
                  <p className="text-[13px] leading-relaxed text-slate-500 dark:text-slate-400 text-center">{data.insights.solution}</p>
                  <div className="mt-8 pt-6 border-t border-slate-50 dark:border-slate-900 text-center">
                    <span className="text-xs text-slate-800 font-bold italic">{data.insights.ctaChat}</span>
                  </div>
                </section>
              </div>
            )}
          </div>
          <div className="mt-8 text-center">
            <button onClick={() => setStep(1)} className="text-sm text-slate-400 hover:text-indigo-500 underline underline-offset-4 transition-all">
              {language === 'en' ? 'Check Another Match' : '다른 궁합 보러가기'}
            </button>
          </div>
        </div>
      )}
    </div>
  </main>
  );
}
