'use client';

import { useState, useEffect } from 'react';
import { useAuthContext } from '@/contexts/useAuthContext';
import { SajuAnalysisService, AnalysisPresets } from '@/lib/SajuAnalysisService';
import { calculateSajuData, createPromptForGemini } from '@/lib/sajuLogic'; // [MODIFIED]
import Link from 'next/link'; // [NEW]
import { ArrowLeftIcon } from '@heroicons/react/24/outline'; // [NEW]

// ...



import { useLoading } from '@/contexts/useLoadingContext';
import { useLanguage } from '@/contexts/useLanguageContext';

export default function PromptPreviewPage() {
    const { userData, selectedProfile, sajuDesc } = useAuthContext();
    const { language } = useLanguage();
    const [selectedPreset, setSelectedPreset] = useState('daily');
    const [generatedPrompt, setGeneratedPrompt] = useState('');
    const [generatedVars, setGeneratedVars] = useState({});
    const [loading, setLoading] = useState(false);
    const [params, setParams] = useState({});

    const targetProfile = selectedProfile || userData;


    // Initialize generic params based on profile
    useEffect(() => {
        if (targetProfile) {
            setParams({
                saju: targetProfile.saju,
                gender: targetProfile.gender,
                sajuDesc: sajuDesc,
                inputDate: targetProfile.birthDate,
                // Add more default params as needed for specific presets
                question: '내년 재물운은 어떨까요?',
                startDate: new Date().toISOString().split('T')[0],
                endDate: new Date(Date.now() + 86400000 * 7).toISOString().split('T')[0],
                q1: '상대방의 속마음이 궁금해요',
                q2: '우리 관계가 발전할 수 있을까요?',
            });
        }
    }, [targetProfile, sajuDesc]);

    const handleGenerate = async () => {
        if (!targetProfile) {
            alert('프로필을 불러오는 중입니다.');
            return;
        }

        setLoading(true);
        try {
            // Mock context for Service
            const mockContext = {
                user: { uid: 'test-uid' },
                userData: targetProfile,
                language: language,
                // Mock other necessary context methods
                setLoading: () => { },
                setAiResult: () => { },
                langPrompt: (lang) => (lang === 'ko' ? '한국어로 답변해줘' : 'Answer in English'),
                uiText: {},
            };

            const service = new SajuAnalysisService(mockContext);
            let presetConfig;
            let fullPrompt = '';
            let variables = {};

            // Select preset config
            switch (selectedPreset) {
                case 'daily':
                    presetConfig = AnalysisPresets.daily({ ...params, selectedDate: new Date().toISOString().split('T')[0] });
                    break;
                case 'newYear':
                    presetConfig = AnalysisPresets.newYear({ ...params });
                    break;
                case 'basic': {
                    // [NEW] Calculate Saju Data for Basic Analysis
                    const { birthDate, birthTime, gender } = targetProfile;
                    const inputDate = `${birthDate}T${birthTime || '00:00'}`;
                    const sajuData = calculateSajuData(inputDate, gender, !birthTime, language);

                    if (!sajuData) {
                        throw new Error('사주 데이터 계산 실패');
                    }

                    // Generate directly to capture variables
                    const { prompt, variables: vars } = await createPromptForGemini(sajuData, language);
                    fullPrompt = prompt;
                    variables = vars;

                    presetConfig = AnalysisPresets.basic({ ...params }, sajuData);
                    break;
                }
                case 'wealth':
                    presetConfig = AnalysisPresets.wealth({ ...params });
                    break;
                case 'love':
                    presetConfig = AnalysisPresets.love({ ...params });
                    break;
                case 'match':
                    presetConfig = AnalysisPresets.match({ ...params, saju2: targetProfile.saju, gender2: 'female' }); // Mock partner
                    break;
                case 'saza':
                    presetConfig = AnalysisPresets.saza({ ...params });
                    break;
                case 'dailySpecific':
                    presetConfig = AnalysisPresets.dailySpecific({ ...params, type: 'date', selectedDate: new Date().toISOString().split('T')[0] });
                    break;
                case 'selDate':
                    presetConfig = AnalysisPresets.selDate({ ...params });
                    break;
                case 'selbirth':
                    presetConfig = AnalysisPresets.selBirth({ ...params, birthMethod: 'natural', babyGender: 'any' });
                    break;
                // Add other cases...
                default:
                    presetConfig = AnalysisPresets.daily({ ...params, selectedDate: new Date().toISOString().split('T')[0] });
            }

            if (!fullPrompt) {
                if (presetConfig.useCustomPromptBuilder && presetConfig.customPromptBuilder) {
                    fullPrompt = await presetConfig.customPromptBuilder(presetConfig.params, service);
                    variables = { info: 'Custom Builder used - vars not available directly' };
                } else {
                    const prompts = await service.fetchPrompts(presetConfig.promptPaths);
                    // Simulate buildPromptVars
                    variables = presetConfig.buildPromptVars(prompts, presetConfig.params, service);
                    fullPrompt = service.replaceVariables(prompts[presetConfig.promptPaths[0]], variables);
                }
            }

            // Add language instruction same as real service
            // Only add if not basic, because createPromptForGemini might handle it? 
            // Actually createPromptForGemini includes it? No, checking logic.
            // createPromptForGemini uses template which might not have it.
            // Let's check logic. SajuAnalysisService adds it at line 468.

            // For basic, createPromptForGemini does NOT seem to include standard lang instruction wrapper.
            // Wait, createPromptForGemini uses DB templates.

            // Let's blindly add it for consistency with service unless it's basic and we suspect double add.
            // SajuAnalysisService adds it *after* getting prompt from builder.
            // So we should add it here too.

            const languageInstruction = service.langPrompt(service.language);
            // Check if already includes to avoid dupes (rough check)
            if (!fullPrompt.includes(languageInstruction)) {
                fullPrompt = `${languageInstruction}\n\n${fullPrompt}\n\n${languageInstruction}`;
            }


            setGeneratedPrompt(fullPrompt);
            setGeneratedVars(variables);

        } catch (error) {
            console.error('Error generating prompt:', error);
            setGeneratedPrompt(`Error: ${error.message}`);
            setGeneratedVars({});
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-4 max-w-6xl mx-auto flex gap-4">
            <div className="w-1/2">
                <h1 className="text-2xl font-bold mb-4">Prompt Preview Tool</h1>

                <div className="mb-4 space-y-2">
                    <label className="block font-medium">Select Preset:</label>
                    <select
                        value={selectedPreset}
                        onChange={(e) => setSelectedPreset(e.target.value)}
                        className="border p-2 rounded w-full"
                    >
                        <option value="daily">Today's Luck (daily)</option>
                        <option value="newYear">New Year (newYear)</option>
                        <option value="basic">Basic Saju (basic)</option>
                        <option value="wealth">Wealth (wealth)</option>
                        <option value="love">Love (love)</option>
                        <option value="match">Match (match)</option>
                        <option value="saza">SazaTalk (saza)</option>
                        <option value="dailySpecific">Specific Date / Interview (dailySpecific)</option>
                        <option value="selDate">Select Date (selDate)</option>
                        <option value="selbirth">Select Birth (selbirth)</option>
                    </select>
                </div>

                <div>
                    <button
                        onClick={handleGenerate}
                        disabled={loading}
                        className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded w-full flex items-center justify-center gap-2"
                    >
                        {loading ? 'Generating...' : 'Generate Prompt'}
                    </button>
                </div>

                <div className="mt-6">
                    <h2 className="text-xl font-semibold mb-2">Generated Prompt:</h2>
                    <div className="bg-gray-100 p-4 rounded whitespace-pre-wrap border h-[600px] overflow-y-auto font-mono text-sm">
                        {generatedPrompt || 'Click Generate to see the prompt...'}
                    </div>
                </div>
            </div>

            <div className="w-1/2 mt-16">
                <h2 className="text-xl font-semibold mb-2">Variables (Vars):</h2>
                <div className="bg-gray-50 p-4 rounded border h-[600px] overflow-y-auto font-mono text-xs">
                    {Object.keys(generatedVars).length > 0 ? (
                        <pre>{JSON.stringify(generatedVars, null, 2)}</pre>
                    ) : (
                        <p className="text-gray-500">No variables captured yet.</p>
                    )}
                </div>

                <div className="mt-4 text-sm text-gray-500">
                    <p>Current Profile: {targetProfile?.displayName || 'Loading...'}</p>
                    <p>Saju Desc Available: {sajuDesc ? 'Yes' : 'No'}</p>
                </div>
            </div>

        </div>
    );
}
