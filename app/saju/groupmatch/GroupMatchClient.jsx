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
import { ChevronLeftIcon, LinkIcon, CalendarDaysIcon, HeartIcon, SparklesIcon, HomeModernIcon, UsersIcon, BriefcaseIcon, FaceSmileIcon, UserGroupIcon } from '@heroicons/react/24/outline';
import { useSajuCalculator } from '@/hooks/useSajuCalculator';
import SelBd from './SelBd';
import { SajuAnalysisService, AnalysisPresets } from '@/lib/SajuAnalysisService';
import SelectPerson from '@/ui/SelectPerson';
import LoadingFourPillar from '@/components/LoadingFourPillar';
import { getEng } from '@/utils/helpers';
import style from '@/data/styleConstants';

function MemberInput({ member, index, updateMember, savedProfiles, onSelect, onRemove, canRemove, selectedRel }) {
    const { saju } = useSajuCalculator(member.inputDate, member.isTimeUnknown);

    useEffect(() => {
        if (saju && saju.sky1 && JSON.stringify(saju) !== JSON.stringify(member.saju)) {
            updateMember(member.id, { saju });
        }
    }, [saju?.sky1, saju?.sky2, saju?.sky3, saju?.sky0, saju?.grd0, saju?.grd1, saju?.grd2, saju?.grd3, member.id]);

    const handleSaveMyInfo = (inputDate, gender, isTimeUnknown) => {
        updateMember(member.id, { inputDate, gender, isTimeUnknown });
    };

    return (
        <div className="flex-1 bg-gradient-to-br from-pink-50/60 to-rose-50/40 dark:from-pink-950/20 dark:to-rose-950/10 rounded-3xl p-6 backdrop-blur-sm border border-pink-200/50 dark:border-pink-800/30 mb-4 w-full relative">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <div className="w-1 h-5 bg-gradient-to-b from-pink-400 to-rose-500 rounded-full"></div>
                    <span className="text-xs font-black text-pink-600 dark:text-pink-400 uppercase tracking-wider">
                        Member {index + 1}
                    </span>
                </div>
                <div className="flex items-center gap-3">
                    {savedProfiles && savedProfiles.length > 0 && (
                        <div className="w-[140px]">
                            <SelectPerson list={savedProfiles} onSelect={onSelect} />
                        </div>
                    )}
                    {canRemove && (
                        <button onClick={onRemove} className="text-slate-400 hover:text-red-500 p-1 text-sm font-bold bg-white/50 dark:bg-slate-800/50 w-7 h-7 rounded-full flex items-center justify-center">
                            ✕
                        </button>
                    )}
                </div>
            </div>

            {selectedRel === 'family' && (
                <div className="mb-4">
                    <label className="block text-xs font-black uppercase tracking-wider mb-2 text-pink-700 dark:text-pink-300">
                        {index + 1}번째 멤버의 가족 역할
                    </label>
                    <input
                        type="text"
                        placeholder="예: 둘째, 엄마, 사위 등"
                        value={member.role || ''}
                        onChange={(e) => updateMember(member.id, { role: e.target.value })}
                        className="w-full bg-white/50 dark:bg-slate-800/50 border border-pink-200 dark:border-pink-800/50 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-rose-300 dark:focus:border-rose-700 transition-colors"
                    />
                </div>
            )}
            {selectedRel === 'team' && (
                <div className="mb-4">
                    <label className="block text-xs font-black uppercase tracking-wider mb-3 text-pink-700 dark:text-pink-300">
                        나와의 직급 관계
                    </label>
                    <div className="flex bg-white/50 dark:bg-slate-800/50 p-1.5 rounded-xl border border-pink-100 dark:border-pink-900/30">
                        {['상사/선배', '동기/동급', '후배/부하'].map(pos => (
                            <button
                                key={pos}
                                onClick={() => updateMember(member.id, { role: pos })}
                                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${member.role === pos
                                    ? 'bg-pink-500 text-white shadow-sm'
                                    : 'text-slate-500 hover:bg-pink-50 dark:hover:bg-slate-700'
                                    }`}
                            >
                                {pos}
                            </button>
                        ))}
                    </div>
                </div>
            )}
            <SelBd
                gender={member.gender}
                inputDate={member.inputDate}
                isTimeUnknown={member.isTimeUnknown}
                setIsTimeUnknown={(val) => updateMember(member.id, { isTimeUnknown: val })}
                saju={member.saju || saju}
                handleSaveMyInfo={handleSaveMyInfo}
                setInputDate={(val) => updateMember(member.id, { inputDate: val })}
                isSaved={false}
                setGender={(val) => updateMember(member.id, { gender: val })}
            />
        </div>
    );
}

export default function GroupMatchClient() {
    const router = useRouter();
    const { sajuDesc, user, userData, selectedProfile, savedProfiles } = useAuthContext();
    const { setAiResult, aiResult, loading, setLoading, handleCancelHelper } = useLoading();
    const targetProfile = selectedProfile || userData;
    const rawDate = targetProfile?.birthDate;
    const [isButtonClicked, setIsButtonClicked] = useState(false);

    const rawTime = targetProfile?.birthTime || '12:00';
    const inputDate = (targetProfile?.birthTime && rawDate && !rawDate.includes('T'))
        ? `${rawDate}T${rawTime}`
        : rawDate;

    const { isTimeUnknown, gender } = targetProfile || {};

    const getDefaultDate = () => {
        try {
            const now = new Date();
            const offset = now.getTimezoneOffset() * 60000;
            return new Date(now.getTime() - offset).toISOString().slice(0, 16);
        } catch (e) {
            return '2024-01-01T00:00';
        }
    };

    const [members, setMembers] = useState([
        { id: Date.now() + 1, inputDate: getDefaultDate(), isTimeUnknown: false, gender: 'female', saju: null, role: '' },
        { id: Date.now() + 2, inputDate: getDefaultDate(), isTimeUnknown: false, gender: 'male', saju: null, role: '' }
    ]);

    const { saju } = useSajuCalculator(inputDate, isTimeUnknown);

    const updateMember = useCallback((id, updates) => {
        setMembers(prev => prev.map(m => m.id === id ? { ...m, ...updates } : m));
    }, []);

    const addMember = () => {
        if (members.length >= 5) {
            alert('그룹 멤버는 최대 5명까지만 추가할 수 있습니다.');
            return;
        }
        setMembers(prev => [...prev, { id: Date.now(), inputDate: getDefaultDate(), isTimeUnknown: false, gender: 'female', saju: null, role: '' }]);
    };

    const removeMember = (id) => {
        if (members.length <= 2) {
            alert('최소 2명의 파트너가 필요합니다.');
            return;
        }
        setMembers(prev => prev.filter(m => m.id !== id));
    };

    const onSelectMember = (profileId, memberId) => {
        const p = savedProfiles.find(x => x.id === profileId);
        if (p) {
            updateMember(memberId, {
                saju: p.saju,
                inputDate: p.birthDate + 'T' + p.birthTime,
                isTimeUnknown: p.isTimeUnknown,
                gender: p.gender
            });
        }
    };

    const { language } = useLanguage();
    const { setEditCount, MAX_EDIT_COUNT, isLocked } = useUsageLimit();
    const [step, setStep] = useState('intro');
    const [selectedRel, setSelectedRel] = useState(null);
    const [prompt, setPrompt] = useState('');
    const [myRole, setMyRole] = useState('');
    const prevData = userData?.usageHistory?.ZGroupMatchAnalysis;

    const t = (char) => (language !== 'ko' ? getEng(char) : char);

    useEffect(() => {
        setAiResult('');
    }, [setAiResult]);

    useEffect(() => {
        if (isButtonClicked && !loading) {
            router.push('/saju/groupmatch/result');
        }
    }, [isButtonClicked, loading, router]);

    const isAnalysisDone = useMemo(() => {
        return !!(
            prevData &&
            prevData.result &&
            SajuAnalysisService.compareSaju(prevData.saju, targetProfile?.saju) &&
            prevData.members?.length === members.length &&
            members.every((m, i) => SajuAnalysisService.compareSaju(prevData.members[i]?.saju, m.saju)) &&
            members.every((m, i) => prevData.members[i]?.gender === m.gender) &&
            prevData.gender === targetProfile?.gender &&
            prevData.relationship === selectedRel
        );
    }, [targetProfile, members, selectedRel, prevData]);

    const isDisabled2 = !isAnalysisDone && isLocked;

    console.log(members)

    useEffect(() => {
        if (language === 'ko') {
            document.title = '그룹 궁합 | 여러 사람의 조화와 인연 분석';
        } else {
            document.title = 'Group Match | Harmony of Multiple Energies';
        }
    }, [language]);

    const DISABLED_STYLE = 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200';
    const RELATION_TYPES = [
        {
            id: 'team',
            label: '팀 / 동료',
            sub: 'Team',
            desc: '조직 구성원 간의 조화',
            descEn: 'Harmony among team members',
            icon: UsersIcon,
            color: 'text-indigo-500',
            bg: 'bg-indigo-50',
            border: 'border-indigo-200',
            activeBorder: 'border-indigo-500 ring-indigo-200',
            prompt: '팀, 동료 관계로서 그룹 전체의 조화, 각 개인의 역할, 서로간의 시너지 효과와 발생 가능한 갈등 및 해결 방안을 상세히 분석해주세요.'
        },
        {
            id: 'family',
            label: '가족',
            sub: 'Family',
            desc: '가족 구성원 전체의 조화',
            descEn: 'Harmony among family members',
            icon: HomeModernIcon,
            color: 'text-orange-500',
            bg: 'bg-orange-50',
            border: 'border-orange-200',
            activeBorder: 'border-orange-500 ring-orange-200',
            prompt: '가족 관계로서 그룹 전체의 조화, 서로간의 시너지 효과와 원만한 가족 관계를 위한 팁을 분석해주세요.'
        },
        {
            id: 'friends',
            label: '친구 모임',
            sub: 'Friends',
            desc: '친구들 간의 케미스트리',
            descEn: 'Chemistry among friends',
            icon: FaceSmileIcon,
            color: 'text-emerald-500',
            bg: 'bg-emerald-50',
            border: 'border-emerald-200',
            activeBorder: 'border-emerald-500 ring-emerald-200',
            prompt: '친목 모임으로서 서로 간의 케미스트리, 누구와 누가 특히 잘 맞는지, 갈등의 소지가 있는지 재미있게 분석해주세요.'
        },
        {
            id: 'project',
            label: '프로젝트 멤버',
            sub: 'Project',
            desc: '단기 협업을 위한 궁합',
            descEn: 'Match for short-term collaboration',
            icon: BriefcaseIcon,
            color: 'text-slate-600',
            bg: 'bg-slate-50',
            border: 'border-slate-200',
            activeBorder: 'border-slate-600 ring-slate-200',
            prompt: '프로젝트 멤버로서 각자의 강점과 단점을 보완할 수 있는 조합인지, 원활한 프로젝트 진행을 위한 조언을 해주세요.'
        }
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

    const handleStartClick = useCallback(
        async (onstart) => {
            onstart();
            setIsButtonClicked(true);

            if (isAnalysisDone) {
                console.log('✅ 이미 분석된 데이터가 있어 결과 페이지로 이동합니다.');
                setTimeout(() => {
                    router.push('/saju/groupmatch/result');
                }, 2000);
                return;
            }

            setAiResult('');
            try {
                if (members.some(m => !m.saju?.sky1)) {
                    alert('모든 멤버의 정보를 입력해주세요.');
                    setLoading(false);
                    return;
                }

                if (members.length < 2) {
                    alert('최소 2명의 그룹 멤버가 필요합니다.');
                    setLoading(false);
                    return;
                }

                const membersConverted = members.map((m, idx) => {
                    const s = m.saju || {};
                    let roleStr = '';
                    if (selectedRel === 'family' && m.role) roleStr = `(가족 역할: ${m.role}) `;
                    else if (selectedRel === 'team' && m.role) roleStr = `(직급: ${m.role}) `;
                    return `[멤버 ${idx + 1}] ${roleStr}성별: ${m.gender}, ${s.sky3 || ''}${s.grd3 || ''}연주 ${s.sky2 || ''}${s.grd2 || ''}월주 ${s.sky1 || ''}${s.grd1 || ''}일주 ${s.sky0 || ''}${s.grd0 || ''}시주`.trim();
                });

                let myRoleStr = '';
                if (selectedRel === 'family' && myRole) myRoleStr = `(가족 역할: ${myRole}) `;
                else if (selectedRel === 'team' && myRole) myRoleStr = `(직급: ${myRole}) `;
                membersConverted.unshift(`[나(Me)] ${myRoleStr}성별: ${gender}, ${saju?.sky3 || ''}${saju?.grd3 || ''}연주 ${saju?.sky2 || ''}${saju?.grd2 || ''}월주 ${saju?.sky1 || ''}${saju?.grd1 || ''}일주 ${saju?.sky0 || ''}${saju?.grd0 || ''}시주`.trim());

                const preset = AnalysisPresets.groupMatch({
                    saju,
                    sajuDesc,
                    gender,
                    inputDate,
                    members,
                    membersConverted,
                    relationship: selectedRel,
                    prompt: prompt
                });

                if (targetProfile) {
                    preset.buildSaveData = async (result, p, service) => {
                        const todayStr = await service.getToday();
                        return {
                            usageHistory: {
                                ZGroupMatchAnalysis: {
                                    result,
                                    saju: targetProfile?.saju,
                                    gender: targetProfile?.gender,
                                    members: p.members.map(m => ({ saju: m.saju, gender: m.gender, inputDate: m.inputDate })),
                                    language: service.language,
                                    relationship: selectedRel,
                                    updatedAt: new Date().toISOString(),
                                },
                            },
                        };
                    };
                }
                await service.analyze(preset, (result) => {
                    console.log('✅ 그룹 궁합 분석 완료!');
                });
            } catch (error) {
                console.error(error);
                alert(UI_TEXT.error?.[language] || 'An error occurred.');
                setLoading(false);
            }
        },
        [inputDate, gender, isTimeUnknown, selectedRel, language, service, saju, members, setAiResult, targetProfile, isAnalysisDone, router, setLoading, prompt]
    );

    const renderContent = (onStart) => {
        if (loading) return <LoadingFourPillar saju={selectedProfile?.saju} isTimeUnknown={selectedProfile?.isTimeUnknown} />;
        if (step === 'intro') {
            return (
                <div className="w-full animate-in fade-in slide-in-from-bottom-5 duration-700">
                    <div className="relative max-w-4xl mx-auto px-4 mb-12">
                        <div className="max-w-lg mx-auto text-center mb-8">
                            <h2 className={style.sajuTitle}>
                                {language === 'ko' ? '다함께 보는' : 'Group Destiny'}
                                <br />
                                <span className="relative text-rose-600 dark:text-rose-500">
                                    {language === 'ko' ? '그룹 궁합 & 시너지' : 'Group Match Synergy'}
                                    <div className="absolute inset-0 bg-rose-200/50 dark:bg-rose-800/60 blur-md rounded-full scale-100"></div>
                                </span>
                            </h2>
                            <p className={style.sajuDesc}>
                                <strong className="text-slate-700 dark:text-slate-300">{language === 'ko' ? '본인 제외 2명에서 5명까지' : 'From 2 to 5 people'}</strong>
                                {language === 'ko' ? '의 ' : ', '}
                                <strong className="text-slate-700 dark:text-slate-300">{language === 'ko' ? '에너지 흐름과 조화' : 'flow of energy and harmony'}</strong>
                                {language === 'ko' ? '를 분석합니다.' : '.'}
                            </p>

                            <div className="mt-8 flex items-center justify-center gap-3">
                                <div className="h-px w-16 bg-gradient-to-r from-transparent via-rose-300 to-rose-400 dark:via-rose-700 dark:to-rose-600"></div>
                                <UsersIcon className="w-5 h-5 text-rose-400 dark:text-rose-500" />
                                <div className="h-px w-16 bg-gradient-to-l from-transparent via-rose-300 to-rose-400 dark:via-rose-700 dark:to-rose-600"></div>
                            </div>
                        </div>

                        <div className="m-auto mb-6 max-w-sm rounded-2xl overflow-hidden shadow-sm border border-slate-100 dark:border-slate-800">
                            <Image
                                src="/images/introcard/match_1.webp"
                                alt="group match"
                                width={800}
                                height={600}
                                className="w-full h-auto"
                                priority
                            />
                        </div>

                        <div className="mb-12">
                            <div className="text-center mb-8">
                                <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-3">
                                    {language === 'ko' ? '어떤 그룹인가요?' : 'What kind of group?'}
                                </h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                    {language === 'ko' ? '관계를 선택하면 그에 맞는 정밀한 분석이 진행됩니다' : 'Choose to get tailored analysis'}
                                </p>
                            </div>

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

                        <div className='max-w-lg mx-auto'>
                            <StartButton
                                onClick={() => setStep('saju')}
                                disabled={!selectedRel}
                                isDone={false}
                                label={language === 'ko' ? '그룹 궁합 시작하기' : 'Start Group Match'}
                                color="rose"
                            />
                        </div>
                    </div>
                </div>
            );
        }

        if (step === 'saju') {
            return (
                <div className="mb-8 p-6">
                    <div className="text-center mb-6 relative">
                        <button
                            onClick={() => setStep('intro')}
                            className="absolute left-0 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-slate-800 rounded-full transition-all"
                        >
                            <ChevronLeftIcon className="w-6 h-6" />
                        </button>
                        <h2 className="text-2xl md:text-3xl font-black text-slate-800 dark:text-white mb-3 tracking-tight">
                            {language === 'ko' ? '그룹 멤버의 사주를 입력해주세요' : 'Enter Group Information'}
                        </h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                            {language === 'ko'
                                ? '본인 제외 최소 2명에서 최대 5명까지 선택 가능합니다.'
                                : 'Select 2 to 5 members in your group.'}
                        </p>
                        <div className="mt-4 flex items-center justify-center gap-2">
                            <div className="h-px w-12 bg-gradient-to-r from-transparent to-rose-300 dark:to-rose-700"></div>
                            <UsersIcon className="w-5 h-5 text-rose-400 dark:text-rose-500" />
                            <div className="h-px w-12 bg-gradient-to-l from-transparent to-rose-300 dark:to-rose-700"></div>
                        </div>
                    </div>

                    <div className='w-full'>
                        <div className="relative max-w-3xl mx-auto flex flex-col items-center gap-4 mb-8">
                            <div className="w-full max-w-md bg-gradient-to-br from-slate-50/80 to-gray-50/50 dark:from-slate-900/40 dark:to-slate-800/20 rounded-3xl p-6 backdrop-blur-sm border border-slate-400/60 dark:border-slate-700/40">
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="w-1 h-5 bg-gradient-to-b from-slate-400 to-slate-600 rounded-full"></div>
                                    <span className="text-xs font-black text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                                        Me
                                    </span>
                                </div>

                                {selectedRel === 'family' && (
                                    <div className="mb-4">
                                        <label className="block text-xs font-black uppercase tracking-wider mb-2 text-slate-700 dark:text-slate-300">
                                            나의 가족 역할
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="예: 첫째, 아빠, 막내딸 등"
                                            value={myRole}
                                            onChange={(e) => setMyRole(e.target.value)}
                                            className="w-full bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-rose-300 dark:focus:border-rose-700 transition-colors"
                                        />
                                    </div>
                                )}

                                {selectedRel === 'team' && (
                                    <div className="mb-4">
                                        <label className="block text-xs font-black uppercase tracking-wider mb-3 text-slate-700 dark:text-slate-300">
                                            나의 직급/위치
                                        </label>
                                        <div className="flex bg-white/50 dark:bg-slate-800/50 p-1.5 rounded-xl border border-slate-200 dark:border-slate-700/50">
                                            {['팀장/리더', '중간 관리자', '팀원/실무자'].map(pos => (
                                                <button
                                                    key={pos}
                                                    onClick={() => setMyRole(pos)}
                                                    className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${myRole === pos
                                                        ? 'bg-slate-600 dark:bg-slate-500 text-white shadow-sm'
                                                        : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700/50'
                                                        }`}
                                                >
                                                    {pos}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

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

                            <div className="flex justify-center my-2 z-20">
                                <div className="bg-white dark:bg-slate-800 p-2 rounded-full shadow-md border border-slate-300 dark:border-slate-600">
                                    <LinkIcon className="w-4 h-4 text-slate-500 dark:text-slate-400 transform -rotate-45" />
                                </div>
                            </div>

                            <div className="w-full max-w-3xl grid grid-cols-1 md:grid-cols-2 gap-4">
                                {members.map((member, idx) => (
                                    <MemberInput
                                        key={member.id}
                                        member={member}
                                        index={idx}
                                        updateMember={updateMember}
                                        savedProfiles={savedProfiles}
                                        onSelect={(id) => onSelectMember(id, member.id)}
                                        onRemove={() => removeMember(member.id)}
                                        canRemove={members.length > 2}
                                        selectedRel={selectedRel}
                                    />
                                ))}
                            </div>

                            {members.length < 5 && (
                                <div className="flex justify-center mt-2 mb-4 w-full">
                                    <button
                                        onClick={addMember}
                                        className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 font-bold hover:bg-rose-100 dark:hover:bg-rose-900/50 transition-colors border border-rose-200 dark:border-rose-800"
                                    >
                                        <UsersIcon className="w-5 h-5" />
                                        <span>멤버 추가 하기 ({members.length}/5)</span>
                                    </button>
                                </div>
                            )}

                        </div>
                    </div>

                    <div className='flex max-w-lg mx-auto justify-center align-center mt-6'>
                        <AnalyzeButton
                            onClick={() => handleStartClick(onStart)}
                            disabled={loading}
                            isDone={isAnalysisDone}
                            label={language === 'ko' ? '그룹 궁합 분석 시작하기' : 'Start Group Match'}
                            color="rose"
                            cost={-1}
                        />
                    </div>
                </div>
            );
        }

        return null;
    };

    useEffect(() => {
        if (isButtonClicked && !loading && prevData?.result && prevData?.result?.length > 0) {
            router.push('/saju/groupmatch/result');
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
