'use client';

import React from 'react';
import ShareTemplate from '@/app/saju/share/ShareTemplate';
import ViewSazaResult from '@/app/saju/sazatalk/ViewSazaResult';

/**
 * SazaShareTemplate - 사자톡 공유 콘텐츠 템플릿
 */
export default function SazaShareTemplate({ shareData, language = 'ko' }) {
    const { aiResult, displayName, userQuestion } = shareData || {};

    if (!shareData) {
        return (
            <div className="text-center p-8">
                <p className="text-gray-600">
                    {language === 'ko' ? '공유 데이터를 불러올 수 없습니다.' : 'Unable to load shared data.'}
                </p>
            </div>
        );
    }
    const parsedResult = typeof aiResult === 'string' ? JSON.parse(aiResult) : aiResult;
    return (
        <ShareTemplate language={language} fortuneType="saza">

            <div className="flex flex-col gap-3 mt-2">
                <div className="text-center mb-8">
                    <h1 className="text-3xl md:text-4xl font-black text-slate-800 mb-3">
                        {displayName}
                        {language === 'ko' ? '님의 사자톡 결과' : "'s SazaTalk Result"}
                    </h1>
                    <p className="text-sm text-gray-500">
                        {language === 'ko' ? '사자와의 특별한 상담 내용입니다.' : 'A special consultation with Saza.'}
                    </p>
                </div>
                <div className="relative mx-auto w-full max-w-[4200px] h-[844px] bg-[#1a1a1c] rounded-[60px] p-[12px] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.3)] border border-white/10">
                    {/* 1. 내부 액정 화면 (전체 높이 100%) */}
                    <div className="relative w-full h-full bg-[#FCF9F6] rounded-[48px] overflow-hidden flex flex-col">
                        {/* 2. 상단 고정 영역: 다이내믹 아일랜드 & 프로필 */}
                        <div className="shrink-0 pt-3 pb-3 bg-gradient-to-b from-[#F2ECE4] via-[#F2ECE4]/90 to-transparent z-[1]">
                            <div className="w-28 h-7 bg-black rounded-full mx-auto mb-4"></div>{' '}
                            <div className="flex items-center gap-4 px-8 py-2">
                                <div className="relative">
                                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-lg border border-indigo-100/50 text-2xl">
                                        🦁
                                    </div>

                                    <div className="absolute -right-1 -bottom-1 w-4 h-4 bg-green-500 border-[3px] border-[#F2ECE4] rounded-full shadow-sm"></div>
                                </div>
                                <div className="flex flex-col gap-0.5">
                                    <span className="text-[10px] font-black text-indigo-500/80 uppercase tracking-[0.15em] leading-none">
                                        Saza AI Analyst
                                    </span>
                                    {/* 메인 타이틀: 가독성 높은 폰트 두께와 색상 정제 */}
                                    <span className="text-[17px] font-black text-slate-800 tracking-tight">
                                        사자사주 분석팀
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* 3. 스크롤 가능 영역 (이 부분이 핵심!) */}
                        {/* flex-1과 overflow-y-auto가 만나서 이 영역만 스크롤됩니다 */}
                        <div className="flex-1 overflow-y-auto px-6 py-2 scroll-smooth no-scrollbar">
                            {/* (A) 채팅 스타일 콘텐츠 */}
                            <div className="chat-format">
                                <b>{userQuestion}</b>
                                {parsedResult?.contents?.map((content, index) => <p key={index}>{content}</p>)}
                                <p>{parsedResult?.saza}</p>

                            </div>


                        </div>

                        {/* 4. 하단 홈 인디케이터 (고정) */}
                        <div className="shrink-0 h-8 flex justify-center items-end pb-2 bg-gradient-to-t from-[#FCF9F6] to-transparent">
                            <div className="w-32 h-1.5 bg-black/10 rounded-full"></div>
                        </div>
                    </div>

                    {/* 추가 CSS (Global style이나 Tailwind 전용) */}
                    <style>{`
              /* 1. 전체 컨테이너 설정 */
              .chat-format {
                display: flex !important;
                flex-direction: column !important;
                gap: 20px !important; /* 대화 간격 확보 */
                width: 100%;
                padding: 20px 0;
              }
            
              /* 2. 질문 (사용자): 오른쪽 정렬 */
              .chat-format b {
                display: block !important;
                width: fit-content !important;
                margin-left: auto !important;
                margin-right: 0 !important;
                background-color: #4F46E5; 
                color: white !important;
                padding: 12px 18px;
                border-radius: 20px 20px 4px 20px; /* 말풍선 꼬리 */
                font-size: 0.9rem;
                max-width: 75%;
                box-shadow: 0 4px 15px rgba(244, 117, 33, 0.15);
                font-weight: 700;
                line-height: 1.5;
              }
            
              /* 3. 답변 (사자): 왼쪽 정렬 + 아이콘 추가 */
              .chat-format p {
                display: block !important;
                position: relative !important; /* 아이콘 배치를 위한 기준 */
                width: fit-content !important;
                margin-left: 42px !important; /* 아이콘이 들어갈 공간 확보 (핵심) */
                margin-right: auto !important;
                margin-top: 10px !important;
                margin-bottom:10px !important;
                
                background-color: white; 
                color: #4A3428 !important;
                padding: 14px 18px;
                border-radius: 0 20px 20px 20px; /* 사자쪽 말풍선 꼬리 */
                font-size: 0.95rem;
                line-height: 1.6;
                max-width: 80%;
                border: 1px solid #E8DCCF;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
              }
            
              /* 4. 사자 아이콘 (자동 생성) */
              .chat-format p::before {
                content: '🦁'; /* 아이콘 삽입 */
                position: absolute;
                left: -42px; /* p태그 margin-left만큼 왼쪽으로 보냄 */
                top: 0;
                width: 34px;
                height: 34px;
                background: white;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 18px;
                border: 1px solid #FDF2E9;
                box-shadow: 0 2px 6px rgba(0,0,0,0.05);
              }
            
              /* 다크모드 대응 */
              .dark .chat-format p {
                background-color: #2D3748;
                color: #E2E8F0 !important;
                border: 1px solid #4A5568;
              }
            `}</style>
                </div>
            </div>



        </ShareTemplate>
    );
}
