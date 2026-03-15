'use client';

import { useRef, useState, useMemo, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { useAuthContext } from '@/contexts/useAuthContext';
import { useUsageLimit } from '@/contexts/useUsageLimit';
import { useLoading } from '@/contexts/useLoadingContext';
import { useLanguage } from '@/contexts/useLanguageContext';
import { UI_TEXT } from '@/data/constants';
import StartButton from '@/ui/StartButton';
import AnalyzeButton from '@/ui/AnalyzeButton';
import { useRouter } from 'next/navigation';
import { LinkIcon, CalendarDaysIcon, HeartIcon, SparklesIcon, HomeModernIcon, UsersIcon, BriefcaseIcon, FaceSmileIcon, UserGroupIcon } from '@heroicons/react/24/outline';
import { useSajuCalculator } from '@/hooks/useSajuCalculator';
import SelBd from './SelBd';
import MatchAppeal from './MatchAppeal';
import { SajuAnalysisService, AnalysisPresets } from '@/lib/SajuAnalysisService';
import SelectPerson from '@/ui/SelectPerson';
import LoadingFourPillar from '@/components/LoadingFourPillar';
import { getEng } from '@/utils/helpers';
import style from '@/data/styleConstants';

export default function MatchClient() {
  const router = useRouter();
  const { sajuDesc, user, userData, selectedProfile, savedProfiles } = useAuthContext()
  const { setAiResult, aiResult, loading, setLoading, handleCancelHelper } = useLoading()
  const targetProfile = selectedProfile || userData;
  // [FIX] birthTime이 별도로 있는 경우 합쳐서 ISO 포맷으로 만듦
  const rawDate = targetProfile?.birthDate;
  const [isButtonClicked, setIsButtonClicked] = useState(false);

  const rawTime = targetProfile?.birthTime || '12:00';
  const inputDate = (targetProfile?.birthTime && rawDate && !rawDate.includes('T'))
    ? `${rawDate}T${rawTime}`
    : rawDate;

  const { isTimeUnknown, gender } = targetProfile || {};
  const [inputDate2, setInputDate2] = useState(() => {
    try {
      const now = new Date();
      const offset = now.getTimezoneOffset() * 60000;
      return new Date(now.getTime() - offset).toISOString().slice(0, 16);
    } catch (e) {
      return '2024-01-01T00:00';
    }
  });
  const [isTimeUnknown2, setIsTimeUnknown2] = useState(false);
  const { saju } = useSajuCalculator(inputDate, isTimeUnknown);
  const { saju: saju2Calculated } = useSajuCalculator(inputDate2, isTimeUnknown2);
  const [saju2, setSaju2] = useState(saju2Calculated);

  // Update saju2 whenever inputDate2 or isTimeUnknown2 changes
  useEffect(() => {
    if (saju2Calculated) {
      setSaju2(saju2Calculated);
    }
  }, [saju2Calculated]);

  const { language } = useLanguage();
  const { setEditCount, MAX_EDIT_COUNT, isLocked } = useUsageLimit();
  const [step, setStep] = useState('intro')
  const [selectedRel, setSelectedRel] = useState(null)
  const [prompt, setPrompt] = useState('');
  const prevData = userData?.usageHistory?.ZMatchAnalysis;


  const [gender2, setGender2] = useState('male');

  const t = (char) => (language !== 'ko' ? getEng(char) : char);
  // const compaEnergy = useConsumeEnergy();
  const onSelect = (id) => {
    const selectedProfile = savedProfiles.find((profile) => profile.id === id);
    if (selectedProfile) {
      setSaju2(selectedProfile.saju);
      setInputDate2(selectedProfile.birthDate + 'T' + selectedProfile.birthTime);
      setIsTimeUnknown2(selectedProfile.isTimeUnknown);
      setGender2(selectedProfile.gender);
    }
  };
  // [UX FIX] Reset AI Result on Mount
  useEffect(() => {
    setAiResult('');
  }, [setAiResult]);

  // [NEW] Reactive Redirect
  useEffect(() => {
    if (isButtonClicked && !loading) {
      router.push('/saju/match/result');
    }
  }, [isButtonClicked, loading, router]);
  const isAnalysisDone = useMemo(() => {

    return !!(
      prevData &&
      prevData.result &&
      SajuAnalysisService.compareSaju(prevData.saju, targetProfile?.saju) &&
      SajuAnalysisService.compareSaju(prevData.saju2, saju2) &&
      prevData.gender === targetProfile?.gender &&
      prevData.gender2 === gender2 &&
      prevData.relationship === selectedRel
    );
  }, [targetProfile, saju2, gender2, selectedRel]);
  const isDisabled2 = !isAnalysisDone && isLocked;

  // Client-side Title Update for Localization (Static Export Support)
  useEffect(() => {
    if (language === 'ko') {
      document.title = '금전 타로 | 부의 흐름과 금전적 성공 가이드';
    } else {
      document.title = 'Wealth Tarot | Guide to Financial Success';
    }
  }, [language]);
  const DISABLED_STYLE = 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200';
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
      prompt: '연인 관계는 서로에 대한 애정과 신뢰를 바탕으로 한 관계입니다. '
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
      prompt: '썸 관계는 서로에 대한 호감은 있지만 아직 연인 관계로 발전하지 않은 관계입니다. '
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
      prompt: '부부 관계는 서로에 대한 애정과 신뢰를 바탕으로 한 관계입니다. '
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
      prompt: '나이차이가 20살 이상 나면 부모자식 관계로 설정. 내담자보다 나이가 많으면 부모. 20살 이하로 차이나면 형제로 설정.'
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
      prompt: '사업 파트너 관계는 서로의 이익을 위해 협력하는 관계입니다. '
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
      prompt: '내담자가 학생의 나이일 경우와 아닐경우 그에 맞게 다르게 대답해줘.'
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
      prompt: '기타 관계는 서로의 이익을 위해 협력하는 관계입니다. 두 사람의 관계가 얼마나 깊은지, 서로에게 얼마나 의지하는지 등을 고려하여 관계를 설정해주세요.'
    },
  ];


  const service = useMemo(() => new SajuAnalysisService({
    user,
    userData: targetProfile,
    language,
    maxEditCount: MAX_EDIT_COUNT,
    setEditCount,
    setLoading,
    setAiResult,
    handleCancelHelper,
  }), [user, userData, language, MAX_EDIT_COUNT, setEditCount, setLoading, setAiResult]);
  const handleSaveMyInfo = (inputDate, gender, isTimeUnknown) => {
    setInputDate2(inputDate);
    setGender2(gender);
    setIsTimeUnknown2(isTimeUnknown);
  }
  const handleStartClick = useCallback(
    async (onstart) => {
      // [UX FIX] 로딩 화면을 먼저 보여줌
      onstart();
      setIsButtonClicked(true);
      // [NEW] 이미 저장된 데이터와 현재 입력값이 같으면 잠시 대기 후 결과 페이지로 이동
      if (isAnalysisDone) {
        console.log('✅ 이미 분석된 데이터가 있어 결과 페이지로 이동합니다.');
        setTimeout(() => {
          router.push('/saju/match/result');
        }, 2000);
        return;
      }

      setAiResult('');
      try {

        if (!saju2?.sky1) {
          alert('상대방 정보를 입력해주세요.');
          setLoading(false);
          return;
        }

        const preset = AnalysisPresets.match({
          saju,
          sajuDesc,
          saju2,
          gender,
          gender2,
          inputDate,
          inputDate2,
          relationship: selectedRel,
          prompt: prompt

        })

        // [CRITICAL FIX] 친구 프로필 분석 시 메인 유저의 saju 데이터 덮어쓰기 방지
        if (targetProfile) {
          preset.buildSaveData = async (result, p, service) => {
            const todayStr = await service.getToday();
            return {
              // saju 필드 생략 (메인 유저 데이터 오염 방지)
              usageHistory: {
                ZMatchAnalysis: {
                  result,
                  saju: targetProfile?.saju,
                  saju2: saju2,
                  gender2: gender2,
                  language: service.language,
                  gender: targetProfile?.gender,
                  relation: selectedRel,
                },
              },
              // 친구 분석은 카운트 증가 안 함 (옵션) -> 일단 기록은 남기되 메인 데이터 보호
              // dailyUsage: { [todayStr]: firestore.increment(1) }, 
            };
          };
        }
        await service.analyze(preset, (result) => {
          console.log('✅ 궁합 분석 완료!');
        });
      } catch (error) {
        console.error(error);
        alert(UI_TEXT.error?.[language] || 'An error occurred.');
        setLoading(false);
      }
    },
    [inputDate, gender, isTimeUnknown, inputDate2, gender2, isTimeUnknown2, selectedRel, language, service, saju, saju2, setAiResult, targetProfile, isAnalysisDone, router, setLoading],
  );

  const renderContent = (onStart) => {
    if (loading) return <LoadingFourPillar saju={selectedProfile?.saju} isTimeUnknown={selectedProfile?.isTimeUnknown} />;
    if (step === 'intro') {
      return (
        <div className="w-full animate-in fade-in slide-in-from-bottom-5 duration-700">
          <div className="relative max-w-4xl mx-auto px-4 mb-12">
            {/* Header */}
            <div className="max-w-lg mx-auto text-center mb-8">
              <h2 className={style.sajuTitle}>
                {language === 'ko' ? '사주로 보는' : 'Reading the Fate'}
                <br />
                <span className="relative text-rose-600 dark:text-rose-500">
                  {language === 'ko' ? '운명적 궁합 & 조화' : 'Destined Match'}
                  <div className="absolute inset-0 bg-rose-200/50 dark:bg-rose-800/60 blur-md rounded-full scale-100"></div>
                </span>
              </h2>
              <p className={style.sajuDesc}>
                <strong className="text-slate-700 dark:text-slate-300">{language === 'ko' ? '두 사람의 에너지 조화' : 'Harmony of Two Energies'}</strong>
                {language === 'ko' ? '와 ' : ' and '}
                <strong className="text-slate-700 dark:text-slate-300">{language === 'ko' ? '서로에게 미치는 영향' : 'Mutual Impact on Fate'}</strong>
                {language === 'ko' ? '을 정밀하게 분석합니다.' : '. Precise Relationship Map Analysis.'}
              </p>


              {/* Decorative divider */}
              <div className="mt-8 flex items-center justify-center gap-3">
                <div className="h-px w-16 bg-gradient-to-r from-transparent via-rose-300 to-rose-400 dark:via-rose-700 dark:to-rose-600"></div>
                <HeartIcon className="w-5 h-5 text-rose-400 dark:text-rose-500" />
                <div className="h-px w-16 bg-gradient-to-l from-transparent via-rose-300 to-rose-400 dark:via-rose-700 dark:to-rose-600"></div>
              </div>
            </div>

            <div className="m-auto mb-6 max-w-sm rounded-2xl overflow-hidden shadow-sm border border-slate-100 dark:border-slate-800">
              <Image
                src="/images/introcard/match_1.webp"
                alt="today's luck"
                width={800}
                height={600}
                className="w-full h-auto"
                priority
              />
            </div>

            {/* Relationship Selection */}
            <div className="mb-12">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-3">
                  {language === 'ko' ? '어떤 관계인가요?' : 'What is your relationship?'}
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {language === 'ko' ? '관계를 선택하면 그에 맞는 정밀한 분석이 진행됩니다' : 'Choose your relationship for tailored analysis'}
                </p>
              </div>

              {/* Centered flex layout for relationship buttons */}
              <div className="flex flex-wrap justify-center gap-3 max-w-xl mx-auto">
                {RELATION_TYPES.map((type) => {
                  const isSelected = selectedRel === type.id;
                  const Icon = type.icon;
                  const labelText = language !== 'ko' ? type.sub : type.label;
                  return (
                    <button
                      key={type.id}
                      onClick={() => { setSelectedRel(type.id); setPrompt(type.prompt) }}
                      className={`
                        relative flex-shrink-0 w-28 sm:w-32 flex flex-col items-center p-4 rounded-2xl border-2 
                        transition-all duration-300 hover:scale-105 active:scale-95
                        ${isSelected
                          ? `${type.activeBorder} ${type.bg} ring-4 shadow-lg`
                          : 'border-slate-200/80 dark:border-slate-700/80 bg-white/80 dark:bg-slate-800/80 hover:border-rose-200 dark:hover:border-rose-800 hover:shadow-md backdrop-blur-sm'
                        }
                      `}
                    >
                      <Icon className={`w-8 h-8 mb-2.5 transition-transform ${isSelected ? 'scale-110' : ''} ${type.color}`} />
                      <span className={`text-xs font-bold text-center leading-tight ${isSelected ? 'text-slate-900 dark:text-slate-100' : 'text-slate-700 dark:text-slate-300'}`}>
                        {labelText}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Start Button */}
            <div className='max-w-lg mx-auto'>
              <StartButton
                onClick={() => setStep('saju')}
                disabled={!selectedRel}
                isDone={false}
                label={language === 'ko' ? '궁합 분석 시작하기' : 'Start Chemistry Analysis'}
                color="rose"
              />
            </div>

          </div>
          <MatchAppeal />
        </div>
      );
    }

    if (step === 'saju') {
      return (
        <div className="mb-8 p-6">
          {/* Header Text */}
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-black text-slate-800 dark:text-white mb-3 tracking-tight">
              {language === 'ko' ? '두 사람의 사주를 입력해주세요' : 'Enter Birth Information'}
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
              {language === 'ko'
                ? '정확한 생년월일과 시간을 입력하면 더욱 정밀한 궁합 분석이 가능합니다'
                : 'Enter accurate birth date and time for precise compatibility analysis'}
            </p>
            <div className="mt-4 flex items-center justify-center gap-2">
              <div className="h-px w-12 bg-gradient-to-r from-transparent to-rose-300 dark:to-rose-700"></div>
              <HeartIcon className="w-5 h-5 text-rose-400 dark:text-rose-500" />
              <div className="h-px w-12 bg-gradient-to-l from-transparent to-rose-300 dark:to-rose-700"></div>
            </div>
          </div>

          <div className='w-full'>
            <div className="relative max-w-2xl mx-auto flex flex-col md:flex-row items-stretch gap-3 md:gap-4 mb-8">
              {/* My Profile */}
              <div className="flex-1 bg-gradient-to-br from-slate-50/80 to-gray-50/50 dark:from-slate-900/40 dark:to-slate-800/20 rounded-3xl p-6 backdrop-blur-sm border border-slate-400/60 dark:border-slate-700/40">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-1 h-5 bg-gradient-to-b from-slate-400 to-slate-600 rounded-full"></div>
                  <span className="text-xs font-black text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                    Me
                  </span>
                </div>

                {/* Birth Info */}
                <div className="flex items-center justify-center gap-2 mb-4 text-xs">
                  <CalendarDaysIcon className="w-3.5 h-3.5 text-slate-400/60" />
                  <div className="font-mono text-slate-700 dark:text-slate-300 text-md">
                    {inputDate
                      ? (isTimeUnknown ? inputDate.split('T')[0] : inputDate.replace('T', ' '))
                      : (language !== 'ko' ? 'Please register' : '정보 등록 필요')}
                  </div>
                  {inputDate && <span className="text-sm">{gender === 'male' ? '👨' : '👩'}</span>}
                  {inputDate && isTimeUnknown && (
                    <span className="text-sm px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400">
                      {UI_TEXT.unknownTime[language]}
                    </span>
                  )}
                </div>

                {/* Saju Display */}
                {saju?.sky1 && (
                  <>
                    <div className="h-px bg-gradient-to-r from-transparent via-slate-200 dark:via-slate-700 to-transparent my-3"></div>
                    <div className="flex flex-wrap justify-center gap-x-4 gap-y-2">
                      <div className="flex flex-col items-center">
                        <span className="text-sm text-slate-400/70 dark:text-slate-500 uppercase mb-1 font-semibold">
                          {UI_TEXT.year[language]}
                        </span>
                        <span className="text-base font-black text-slate-700 dark:text-slate-300 tracking-wider">
                          {t(saju.sky3)}{t(saju.grd3)}
                        </span>
                      </div>
                      <div className="flex flex-col items-center">
                        <span className="text-sm text-slate-400/70 dark:text-slate-500 uppercase mb-1 font-semibold">
                          {UI_TEXT.month[language]}
                        </span>
                        <span className="text-base font-black text-slate-700 dark:text-slate-300 tracking-wider">
                          {t(saju.sky2)}{t(saju.grd2)}
                        </span>
                      </div>
                      <div className="flex flex-col items-center relative">
                        <div className="absolute inset-0 bg-slate-300/20 dark:bg-slate-600/10 blur-lg rounded-full"></div>
                        <span className="text-sm text-slate-600 dark:text-slate-400 uppercase mb-1 font-black relative z-10">
                          {UI_TEXT.day[language]}
                        </span>
                        <span className="text-lg font-black text-slate-700 dark:text-slate-300 tracking-wider relative z-10">
                          {t(saju.sky1)}{t(saju.grd1)}
                        </span>
                      </div>
                      {!isTimeUnknown && (
                        <div className="flex flex-col items-center">
                          <span className="text-sm text-slate-400/70 dark:text-slate-500 uppercase mb-1 font-semibold">
                            {UI_TEXT.hour[language]}
                          </span>
                          <span className="text-base font-black text-slate-700 dark:text-slate-300 tracking-wider">
                            {t(saju.sky0)}{t(saju.grd0)}
                          </span>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>

              {/* VS Icon - Responsive positioning */}
              {/* Mobile: between boxes vertically, Desktop: between boxes horizontally */}
              <div className="hidden md:block absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
                <div className="bg-white dark:bg-slate-800 p-2.5 rounded-full shadow-md border-2 border-slate-300 dark:border-slate-600">
                  <LinkIcon className="w-4 h-4 text-slate-500 dark:text-slate-400 transform -rotate-45" />
                </div>
              </div>
              {/* Mobile version - positioned between the two boxes */}
              <div className="md:hidden flex justify-center -my-6 z-20">
                <div className="bg-white dark:bg-slate-800 p-2.5 rounded-full shadow-md border-2 border-slate-300 dark:border-slate-600">
                  <LinkIcon className="w-4 h-4 text-slate-500 dark:text-slate-400 transform -rotate-45" />
                </div>
              </div>

              {/* Partner Profile */}
              <div className="flex-1 bg-gradient-to-br from-pink-50/60 to-rose-50/40 dark:from-pink-950/20 dark:to-rose-950/10 rounded-3xl p-6 backdrop-blur-sm border border-pink-200/50 dark:border-pink-800/30">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-1 h-5 bg-gradient-to-b from-pink-400 to-rose-500 rounded-full"></div>
                    <span className="text-xs font-black text-pink-600 dark:text-pink-400 uppercase tracking-wider">
                      Target
                    </span>
                  </div>
                  {savedProfiles && savedProfiles.length > 0 && (
                    <div className="flex-1 ml-3 max-w-[180px]">
                      <SelectPerson
                        list={savedProfiles}
                        onSelect={onSelect}
                      />
                    </div>
                  )}
                </div>

                {/* Input Form */}
                <SelBd
                  gender={gender2}
                  inputDate={inputDate2}
                  isTimeUnknown={isTimeUnknown2}
                  setIsTimeUnknown={setIsTimeUnknown2}
                  saju={saju2}
                  handleSaveMyInfo={handleSaveMyInfo}
                  setInputDate={setInputDate2}
                  isSaved={false}
                  setGender={setGender2}
                />
              </div>
            </div></div>
          {/* Main Input Area */}

          <div className='flex max-w-lg mx-auto justify-center align-center'>
            <AnalyzeButton
              onClick={() => handleStartClick(onStart)}
              disabled={loading}
              isDone={isAnalysisDone}
              label={language === 'ko' ? '궁합 분석 시작하기' : 'Start Chemistry Analysis'}
              color="rose"
              cost={-1}
            /></div>
        </div>
      );
    }

    return (
      <div className="max-w-lg mx-auto text-center px-6 animate-in zoom-in-95 duration-500 pt-10">
        <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">{language === 'ko' ? '카드를 골라 주세요.' : 'Choose your Card'}</h3>
        <p className="text-sm text-slate-500 mb-6">{language === 'ko' ? '가장 마음이 가는 한 장을 클릭하세요.' : 'Follow your heart, pick one of six cards'}</p>
        <div className="my-3"><CreditIcon num={-1} /></div>
        <div className="grid grid-cols-3 gap-3 mb-10">

        </div>
      </div>
    );
  };

  // ✅ 4. 스크롤 로직 & 리다이렉트 (loading이 false가 되고 결과가 있을 때 이동)
  useEffect(() => {
    if (isButtonClicked && !loading && prevData?.result && prevData?.result?.length > 0) {
      router.push('/saju/match/result');
    }
  }, [isButtonClicked, prevData, router, isAnalysisDone, loading]);

  return (
    <div className="min-h-screen">
      {loading ? (
        <LoadingFourPillar saju={saju} isTimeUnknown={isTimeUnknown} isAnalysisDone={isAnalysisDone} />
      ) : (
        renderContent(() => setLoading(true))
      )}
    </div>
  );
}
