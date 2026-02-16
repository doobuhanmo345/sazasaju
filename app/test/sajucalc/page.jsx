'use client';

import { useMemo, useState, useEffect } from 'react';
import { Solar } from 'lunar-javascript';
import { CalendarDaysIcon } from '@heroicons/react/24/outline';
import {
    GOEGANG_LIST,
    BAEKHO_LIST,
    SAMHAP_MAP,
    OHAENG_MAP,
    RELATION_RULES,
    GWIN_MAP,
    JIJANGGAN_MAP,
    getRomanizedIlju,
    getTenGodType,
    ohaengKorean,
} from '@/data/sajuInt';
import { useAuthContext } from '@/contexts/useAuthContext';
import { ENG_MAP, UI_TEXT, HANJA_MAP } from '@/data/constants';
import { ILJU_DATA, ILJU_DATA_EN } from '@/data/ilju_data';
import html2canvas from 'html2canvas';
import FourPillarVis from '@/components/FourPillarVis';
import { useLanguage } from '@/contexts/useLanguageContext';
import { getEng } from '@/lib/helpers';

export default function SazaCalc() {
    const { userData } = useAuthContext();
    const { language } = useLanguage()
    const { birthDate: inputDate, saju, gender: inputGender } = userData;
    const sajuData = useMemo(() => {
        if (!inputDate || !inputDate.includes('T')) return null;

        try {
            const [datePart, timePart] = inputDate.split('T');
            const [year, month, day] = datePart.split('-').map(Number);
            const [hour, min] = timePart.split(':').map(Number);

            const solar = Solar.fromYmdHms(year, month, day, hour, min, 0);
            const lunar = solar.getLunar();
            const eightChar = lunar.getEightChar();

            const allChars = [
                saju?.sky3,
                saju?.grd3,
                saju?.sky2,
                saju?.grd2,
                saju?.sky1,
                saju?.grd1,
                saju?.sky0,
                saju?.grd0,
            ];

            const ohaengCount = { wood: 0, fire: 0, earth: 0, metal: 0, water: 0 };
            allChars.forEach((char) => {
                const type = OHAENG_MAP[char];
                if (type) ohaengCount[type]++;
            });

            const dayMaster = allChars[4];
            const dayTypes = [OHAENG_MAP[allChars[4]], OHAENG_MAP[allChars[5]]];
            const monthTypes = [OHAENG_MAP[allChars[2]], OHAENG_MAP[allChars[3]]];

            const maxOhaeng = Object.entries(ohaengCount).reduce((a, b) => {
                if (a[1] !== b[1]) {
                    return a[1] > b[1] ? a : b;
                }
                const getScore = (type) => {
                    if (dayTypes.includes(type)) return 2;
                    if (monthTypes.includes(type)) return 1;
                    return 0;
                };
                return getScore(a[0]) >= getScore(b[0]) ? a : b;
            });

            const branches = {
                year: allChars[1],
                month: allChars[3],
                day: allChars[5],
                time: allChars[7],
            };
            const stems = {
                year: allChars[0],
                month: allChars[2],
                day: allChars[4],
                time: allChars[6],
            };
            const pillars = {
                year: allChars[0] + allChars[1],
                month: allChars[2] + allChars[3],
                day: allChars[4] + allChars[5],
                time: allChars[6] + allChars[7],
            };

            const isEn = language !== 'ko';

            const calculateShinsal = (pillars, branches, dayMaster) => {
                const result = [];
                const criteriaBranches = [branches.year, branches.day];

                criteriaBranches.forEach((criteria, index) => {
                    const baseLabel =
                        index === 0
                            ? isEn ? 'Based on Year' : '년지기준'
                            : isEn ? 'Based on Day' : '일지기준';

                    const group = SAMHAP_MAP[criteria];
                    if (!group) return;

                    const [element, yeokma, dohwa, hwagae] = group;

                    Object.values(branches).forEach((branch) => {
                        if (branch === yeokma && index === 0) {
                            result.push({
                                name: isEn ? 'Yeokma-sal' : '역마살',
                                type: baseLabel,
                                desc: isEn ? 'Movement, change, and travel' : '이동수, 변동',
                            });
                        }
                        if (branch === dohwa && index === 0) {
                            result.push({
                                name: isEn ? 'Dohwa-sal' : '도화살',
                                type: baseLabel,
                                desc: isEn ? 'Popularity, charm, and attraction' : '인기, 매력',
                            });
                        }
                        if (branch === hwagae) {
                            result.push({
                                name: isEn ? 'Hwagae-sal' : '화개살',
                                type: baseLabel,
                                desc: isEn ? 'Art, religion, and reflection' : '예술, 종교, 복귀',
                            });
                        }
                    });
                });

                if (BAEKHO_LIST.includes(pillars.day)) {
                    result.push({
                        name: isEn ? 'Baekho-sal' : '백호살',
                        type: isEn ? 'Day Pillar' : '일주',
                        desc: isEn ? 'Strong energy, professionalism, and intensity' : '강한 기운, 혈광지사 조심, 프로페셔널',
                    });
                }

                if (GOEGANG_LIST.includes(pillars.day)) {
                    result.push({
                        name: isEn ? 'Goegang-sal' : '괴강살',
                        type: isEn ? 'Day Pillar' : '일주',
                        desc: isEn ? 'Leadership, intelligence, and strong character' : '우두머리 기질, 총명, 강한 리더십',
                    });
                }

                const targets = GWIN_MAP[dayMaster];
                if (targets) {
                    Object.values(branches).forEach((branch) => {
                        if (targets.includes(branch)) {
                            result.push({
                                name: isEn ? 'noble gold star' : '천을귀인',
                                type: isEn ? 'Day Master Basis' : '일간기준',
                                desc: isEn ? 'The ultimate auspicious star, helper, and protector' : '최고의 길신, 조력자, 액땜',
                            });
                        }
                    });
                }

                return [...new Map(result.map((item) => [item.name, item])).values()];
            };

            let finalShinsal = calculateShinsal(pillars, branches, dayMaster);
            const nobleTargets = GWIN_MAP[dayMaster] || [];

            nobleTargets.forEach((target) => {
                Object.entries(branches).forEach(([pos, branch]) => {
                    if (branch === target) {
                        const posName = {
                            year: language !== 'ko' ? 'Year Pillar (Ancestors)' : '년지(조상자리)',
                            month: language !== 'ko' ? 'Month Pillar (Social)' : '월지(사회자리)',
                            day: language !== 'ko' ? 'Day Pillar (Spouse)' : '일지(배우자자리)',
                            time: language !== 'ko' ? 'Hour Pillar (Children/Late Life)' : '시지(자식/말년자리)',
                        }[pos];

                        finalShinsal.push({
                            name: language !== 'ko' ? 'noble gold star' : '천을귀인',
                            type: language !== 'ko' ? 'Great Auspicious Star' : '대길신',
                            desc: language !== 'ko'
                                ? `Located in '${ENG_MAP[branch]}' of your ${posName}. This is the ultimate auspicious star that turns bad luck into good and brings help from noble people at decisive moments.`
                                : `사주의 ${posName}인 '${branch}'에 위치하고 있습니다. 이는 흉을 길로 바꾸고 결정적인 순간에 귀인의 도움을 받는 최고의 길신입니다`,
                        });
                    }
                });
            });

            const gongmangHanja = lunar.getDayXunKong();
            const gongmangTargets = gongmangHanja.split('').map((h) => HANJA_MAP[h]);
            Object.entries(branches).forEach(([pos, branch]) => {
                if (pos === 'day') return;
                if (gongmangTargets.includes(branch)) {
                    const posName = {
                        year: language !== 'ko' ? 'Year Pillar (Early Life)' : '년지(초년)',
                        month: language !== 'ko' ? 'Month Pillar (Social)' : '월지(청년/사회)',
                        time: language !== 'ko' ? 'Hour Pillar (Late Life)' : '시지(말년)',
                    }[pos];

                    finalShinsal.push({
                        name: language !== 'ko' ? 'gongmang' : '공망',
                        type: language !== 'ko' ? 'emptiness' : '공허',
                        desc: language !== 'ko'
                            ? `${posName} contains the character '${ENG_MAP[branch]}', which is in Gongmang (Emptiness). During this period, you will find more peace by pursuing spiritual or philosophical values rather than material greed.`
                            : `${posName}에 해당하는 '${branch}' 글자가 비어있는 공망입니다. 해당 시기에는 현실적 욕심보다 정신적, 철학적 가치를 추구할 때 마음이 편안해집니다`,
                    });
                }
            });

            finalShinsal = [
                ...new Map(finalShinsal.map((item) => [item.name + item.desc, item])).values(),
            ];

            const relations = [];
            const checkPair = (b1, b2, targetName) => {
                const key1 = [b1, b2].join('');
                const key2 = [b2, b1].join('');
                const rule = RELATION_RULES[key1] || RELATION_RULES[key2];
                if (rule) {
                    relations.push({ ...rule, target: targetName });
                }
            };

            checkPair(branches.day, branches.month, isEn ? 'Month Branch (Society)' : '월지(사회)');
            checkPair(branches.day, branches.time, isEn ? 'Time Branch (Children)' : '시지(자식)');
            checkPair(branches.day, branches.year, isEn ? 'Year Branch (Ancestors)' : '년지(조상)');
            checkPair(stems.day, stems.month, isEn ? 'Month Stem (Society)' : '월간(사회)');
            checkPair(stems.day, stems.time, isEn ? 'Time Stem (Children)' : '시간(자녀)');
            checkPair(stems.day, stems.year, isEn ? 'Year Stem (Ancestors)' : '년간(조상)');

            // const myIljuData = isEn ? ILJU_DATA_EN[ilju] : ILJU_DATA[ilju];

            const jijangganList = {
                time: { branch: branches.time, ...JIJANGGAN_MAP[branches.time] },
                day: { branch: branches.day, ...JIJANGGAN_MAP[branches.day] },
                month: { branch: branches.month, ...JIJANGGAN_MAP[branches.month] },
                year: { branch: branches.year, ...JIJANGGAN_MAP[branches.year] },
            };



            return {
                pillars,
                myShinsal: finalShinsal,
                ohaengCount,
                maxOhaeng,
                relations,
                jijangganList,
            };
        } catch (err) {
            console.error('사주 계산 전체 오류:', err);
            return null;
        }
    }, [saju, inputGender, language, inputDate]);
    console.log(sajuData)

    const generatePrompt = () => {
        const maxOhaeng = `${sajuData.maxOhaeng?.[0]}이 가장 많다: ${sajuData.maxOhaeng?.[1]}개 `
        const shinsal = sajuData.myShinsal.map((item) => `${item.type}으로 ${item.name}이 있다: ${item.desc} `).join('\n')
        const relations = sajuData.relations.map((item) => `${item.target}에 ${item?.ko?.name}: ${item?.ko?.desc} `).join('\n')
        const jijangganList = Object.entries(sajuData.jijangganList).map(([key, value]) => `${key}의 지지 ${value.branch}의 지장간 : ${value.main}${value.middle || ''}${value.initial} `).join('\n')
        const pillars = Object.entries(sajuData.pillars).map(([key, value]) => `${key}의 pillar: ${value} `).join('\n')
        const ohaengCount = Object.entries(sajuData.ohaengCount).map(([key, value]) => `${key}: ${value} `).join('\n')

        const result = { pillars, jijangganList, maxOhaeng, ohaengCount, shinsal, relations, }
        const desc = Object.entries(result).map(([key, value]) => ` ${key} : ${value} `)

        return desc

    }
    const prompt = generatePrompt()
    console.log('prompt', prompt)
    return (
        <div>


            ㅇㅇㅇ
        </div>
    )
}   