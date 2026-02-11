'use client';

import React, { useState } from 'react';
import {
  Zap,
  Brain,
  ChevronRight,
  Search,
  Database,
  Users,
} from 'lucide-react';
import FloatingHomeButton from '@/components/FloatingHomeButton';

import AdHid from '../AdHid'
import AdReview from '@/app/ad/AdReview';


export default function NewYearKr({ setStep }) {
  const handleSubmit = (e) => {
    setStep(1);
  };
  const [activeMonth, setActiveMonth] = useState(1);

  return (
    <div className="min-h-screen bg-indigo-50 text-slate-900 font-sans pb-20">
      <FloatingHomeButton language="ko" />

      <>
        <div className="w-full min-h-screen bg-indigo-50 text-slate-900 font-sans flex flex-col items-center">
          <div className=" w-full max-w-4xl py-10 flex flex-col items-center">
            {/* 1. 상단 로고 */}
            <div className="flex items-center gap-1.5 mb-8">
              <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-xl">
                🦁
              </div>
              <span className="text-xl font-bold tracking-tight text-slate-900">사자사주</span>
            </div>
            {/* 2. 메인 타이틀 */}
            <div className="text-center mb-10">
              <h1 className="text-[28px] font-black leading-tight mb-4 break-keep text-slate-900">
                2026년 병오년
                <br />
                당신의 한 해를 분석해 드립니다.
              </h1>
              <p className="text-sm text-slate-600 font-medium leading-relaxed break-keep px-4">
                2026년 당신의 운세를
                <br />
                사자사주에서 무료로 봐드려요!
              </p>
            </div>
            <div className="w-full flex justify-center">
              <img
                src="/images/adImage/newyear/newyear_main_clay.jpeg"
                className="w-full max-w-4xl h-[500px] my-6 object-cover [mask-image:linear-gradient(to_bottom,transparent_0%,black_15%,black_85%,transparent_100%)]"
                alt="사자사주 메인"
              />
            </div>
            <div className="w-full p-6">
              <button
                type="submit"
                onClick={handleSubmit}
                className="w-full bg-indigo-600 text-white font-bold py-5 rounded-full text-lg shadow-lg flex items-center justify-center gap-1 active:scale-[0.98] transition-all hover:bg-indigo-700"
              >
                2026년 전체 흐름 보기 <ChevronRight size={22} strokeWidth={3} />
              </button>
            </div>
            {/* 5. 하단 3단 정보 바 */}
            <div className="w-full flex items-center mt-12 px-2 py-4 border-t border-indigo-100">
              <div className="flex-1 flex flex-col items-center gap-1.5 opacity-70">
                <Users size={18} className="text-indigo-600" />
                <span className="text-xs font-black text-slate-500 leading-tight text-center">
                  27명 명리학자 참여
                  <br />
                  <span className="font-medium text-[9px]">직접 검증 데이터 기반</span>
                </span>
              </div>

              <div className="h-8 w-[1px] bg-slate-200 shrink-0"></div>

              <div className="flex-1 flex flex-col items-center gap-1.5 opacity-70">
                <Database size={18} className="text-indigo-600" />
                <span className="text-xs font-black text-slate-500 leading-tight text-center">
                  수만 건 해석 데이터 구조화
                  <br />
                  <span className="font-medium text-[9px]">방대한 DB 활용 분석</span>
                </span>
              </div>

              <div className="h-8 w-[1px] bg-slate-200 shrink-0"></div>

              <div className="flex-1 flex flex-col items-center gap-1.5 opacity-70">
                <Brain size={18} className="text-indigo-600" />
                <span className="text-xs font-black text-slate-500 leading-tight text-center">
                  질문 맞춤
                  <br />
                  <span className="font-bold">AI 분석</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </>

      {/* 더미포멧 */}
      <div className="mx-6">
        {/* 세련된 안내 배너 디자인 */}
        <div className="mx-4  my-10 flex flex-col items-center">
          <div className="flex items-center gap-2 px-3 py-1 rounded-full border border-indigo-200 bg-indigo-50/50 mb-3">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
            </span>
            <span className="text-sm font-bold text-indigo-600 tracking-tight uppercase">
              Preview Mode
            </span>
          </div>

          <div className="text-center">
            <h3 className="text-lg font-bold text-slate-800 mb-2">
              사자의 눈으로 바라본 2026년 프리뷰
            </h3>

            <div className="space-y-3">
              <p className="text-sm text-slate-500 leading-relaxed">
                2026년에 작용할 운의 흐름과 <br />
                주요 포인트를 간단히 요약해드려요
              </p>

              <div className="flex items-center justify-center gap-3">
                <div className="h-[1px] w-8 bg-slate-200"></div>
                <p className="text-sm font-medium text-indigo-600 bg-indigo-50 px-3 py-1 rounded-md">
                  본 페이지에서 신청하는 신년 운세는 맛보기 버전입니다. <br />
                  월별 운세와 놓치기 아쉬운 디테일 등 정식 리포트는
                  <br />
                  <span className="text-slate-800 font-semibold underline underline-offset-4 decoration-indigo-300">
                    사자사주 페이지
                  </span>
                  에서 확인해보세요
                </p>
                <div className="h-[1px] w-8 bg-slate-200"></div>
              </div>
            </div>
          </div>
        </div>
        <div className="backdrop-blur-sm rounded-3xl border border-indigo-50 shadow-sm mx-4 mb-20">
          <div></div>
          <header className="pt-12 pb-8 px-4 text-center bg-gradient-to-b from-indigo-50/50 to-transparent rounded-t-3xl">
            <h1 className="text-2xl font-black mb-2 tracking-tight text-slate-900">2026년 병오년 종합 리포트</h1>

            <p className="text-sm text-slate-500 my-6 leading-relaxed px-4 break-keep">
              병오년은 불의 기운이 강하게 작동하는 해로, 선택과 속도가 삶의 흐름을 좌우하는
              시기입니다. 본 페이지는 실제 개인 맞춤 리포트의 일부 흐름을 체험할 수 있는 무료 맛보기
              리포트입니다.
            </p>

            <div className="inline-flex items-center bg-white border border-indigo-100 rounded-full px-4 py-1.5 text-xs text-indigo-600 font-bold shadow-sm">1분 핵심 요약</div>
          </header>
          <section className="relative mb-12 px-6 max-w-3xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-xl font-bold text-indigo-900 mb-2">책임과 도전 속에서 빛나는 성장과 변화의 해</h2>
              <p className="text-sm font-bold text-slate-700 leading-snug break-keep">
                열정적인 불꽃이 두부한모삼님을 단련하여 새로운 가치를 창조하는 한 해가 될 것입니다.
              </p>
            </div>

            <div className="grid gap-4">
              <div className="bg-white rounded-2xl p-6 text-center border border-indigo-100 shadow-sm hover:shadow-md transition-shadow">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" className="mx-auto mb-3">
                  <path
                    d="M12 2C12 2 7 8 7 12C7 14.7614 9.23858 17 12 17C14.7614 17 17 14.7614 17 12C17 8 12 2 12 2Z"
                    fill="#4F46E5"
                  />
                  <path
                    d="M12 6C12 6 9 10 9 13C9 14.6569 10.3431 16 12 16C13.6569 16 15 14.6569 15 13C15 10 12 6 12 6Z"
                    fill="#818CF8"
                  />
                </svg>
                <div className="font-bold text-lg mb-1 text-slate-800">속도</div>
                <div className="text-xs text-slate-500 break-keep leading-relaxed">
                  병오년은 기회가 빠르게 지나가며, 망설임이 곧 손실이 되는 흐름을 만듭니다.
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 text-center border border-indigo-100 shadow-sm hover:shadow-md transition-shadow">
                <svg
                  width="48"
                  height="48"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#475569"
                  strokeWidth="1.2"
                  className="mx-auto mb-3"
                >
                  <path d="M3 7h18M12 3v18M7 7l-2 10h4l-2-10zm12 0l-2 10h4l-2-10z" />
                </svg>
                <div className="font-bold text-lg mb-1 text-slate-800">선택</div>
                <div className="text-xs text-slate-500 break-keep leading-relaxed">
                  여러 갈래가 동시에 열리지만, 모든 길을 다 잡을 수는 없습니다.
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 text-center border border-indigo-100 shadow-sm hover:shadow-md transition-shadow">
                <svg
                  width="48"
                  height="48"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#4338CA"
                  strokeWidth="1.2"
                  className="mx-auto mb-3"
                >
                  <circle cx="12" cy="12" r="9" />
                  <path
                    d="M16.2426 7.75736L10.5858 10.5858L7.75736 16.2426L13.4142 13.4142L16.2426 7.75736Z"
                    fill="#4338CA"
                  />
                </svg>
                <div className="font-bold text-lg mb-1 text-slate-800">방향성</div>
                <div className="text-xs text-slate-500 break-keep leading-relaxed">
                  올해의 핵심은 노력보다 '어디로 가는가'에 있습니다.
                </div>
              </div>
            </div>
            <AdHid
              title={
                <>
                  2026년 병오년을 관통하는 <span className="text-indigo-600">세개의 키워드</span>
                </>
              }
              des={
                <>
                  병오년의 강렬한 에너지가 삶에 작용하여 만들어낼 올해. <br />
                  당신의 올 해의 운세를 세개의 키워드로 정리해 드려요.
                </>
              }
              badge={['1', '키워드']}
            />
          </section>

          <div className="max-w-3xl mx-auto px-6 pb-10">
            <section className="relative mb-12">
              <div className="text-center mb-6">
                <h2 className="text-xl font-bold text-indigo-900 mb-1">2026년 병오년 종합 분석</h2>
              </div>

              <div className="bg-indigo-50 rounded-full py-2.5 px-6 text-center text-xs text-indigo-600 mb-8 border border-indigo-100 font-bold break-keep">
                불의 기운은 기회를 만들지만, 동시에 과열과 소진을 부릅니다.
              </div>

              <div className="bg-white border border-indigo-100 rounded-2xl p-6 shadow-sm">
                <div className="space-y-6">
                  <div className="">
                    <div className="flex items-center text-sm font-bold mb-3 text-slate-800">🔥 성장의 키워드</div>
                    <ul className="list-none p-0 m-0 text-sm text-slate-600 space-y-2">
                      <li>결단력</li>
                      <li>속도감</li>
                    </ul>
                  </div>

                  <div className="h-[1px] bg-slate-100 w-full" />

                  <div className="">
                    <div className="flex items-center text-sm font-bold mb-3 text-slate-800">💡 활용할 요소</div>
                    <ul className="list-none p-0 m-0 text-sm text-slate-600 space-y-2">
                      <li className="flex items-center">
                        <span className="text-indigo-500 mr-1.5 font-bold">✓</span> 빠른 판단
                      </li>
                      <li className="flex items-center">
                        <span className="text-indigo-500 mr-1.5 font-bold">✓</span> 우선순위 설정
                      </li>
                    </ul>
                  </div>

                  <div className="h-[1px] bg-slate-100 w-full" />

                  <div className="">
                    <div className="flex items-center text-sm font-bold mb-3 text-slate-800">⚠️ 주의할 요소</div>
                    <ul className="list-none p-0 m-0 text-sm text-slate-600 space-y-2">
                      <li className="flex items-center">
                        <span className="text-amber-500 mr-1.5 text-xs">▲</span> 과도한 확장
                      </li>
                      <li className="flex items-center">
                        <span className="text-amber-500 mr-1.5 text-xs">▲</span> 감정적 결정
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              <div>
                <p className="text-sm text-slate-600 my-8 leading-relaxed break-keep px-2">
                  이 요약은 병오년의 전체적인 분위기와 흐름만을 담고 있습니다. 실제 리포트에서는
                  개인의 사주 구조에 따라 작용 시점과 강도가 달라집니다. 지금 느껴지는 공기감이
                  있다면, 그것이 올해의 핵심 신호입니다.
                </p>
              </div>
              <AdHid
                title={
                  <>
                    연간 운세에서
                    <span className="text-indigo-600"> 전체 흐름</span>을 종합 분석
                  </>
                }
                des={
                  <>
                    올해의 키워드·운세 활용법·주의 요소와 올해의 총운을 전체적으로 정리해 드려요.
                    연애와 금전, 직장/사업운의 디테일까지 꼼꼼하게 챙겨보세요.
                  </>
                }
                badge={['2', '종합분석']}
              />

              {/* 3. 테마 분석 Section */}
              <div className="mt-16 relative">
                <div className="px-6 select-none pointer-events-none opacity-40 grayscale contrast-75">
                  <div className="text-center mb-6">
                    <h2 className="text-xl font-bold text-[#a68b7c] mb-1">테마별 상세 분석</h2>
                  </div>
                  <div className="space-y-4 mb-6">
                    <div>
                      <h3 className="text-lg text-[#8c7a70] mb-3 border-l-4 border-indigo-600 pl-2.5 font-bold mt-6">재물/투자운</h3>
                      <p className="text-sm text-slate-600 leading-relaxed break-keep">
                        올해 당신의 재물운은 큰 흐름에서 상승곡선을 그리고 있습니다. 특히 상반기보다는 하반기에 투자의 결실이 맺힐 가능성이 높으며...
                      </p>
                    </div>
                    <div>
                      <h3 className="text-lg text-[#8c7a70] mb-3 border-l-4 border-indigo-600 pl-2.5 font-bold mt-6">직장/사업운</h3>
                      <p className="text-sm text-slate-600 leading-relaxed break-keep">
                        승진의 기회, 이직의 타이밍, 혹은 새로운 사업을 시작하기에 적합한 달을 짚어드립니다. 사회적 위치가 한 단계 격상될 수 있는 핵심적인 처세술을 사주 기반으로 제안합니다...
                      </p>
                    </div>
                    <div>
                      <h3 className="text-lg text-[#8c7a70] mb-3 border-l-4 border-indigo-600 pl-2.5 font-bold mt-6">건강/웰니스</h3>
                      <p className="text-sm text-slate-600 leading-relaxed break-keep">
                        사주 오행상 취약해지기 쉬운 신체 부위를 사전에 예방하고, 한 해 동안 최상의 컨디션을 유지하기 위한 맞춤형 생활 습관과 운동법을 추천해 드립니다...
                      </p>
                    </div>
                  </div>
                </div>
                <AdHid
                  title={
                    <>
                      인생의 <span className="text-indigo-600">4대 핵심 영역</span> 진단
                    </>
                  }
                  des={
                    <>
                      재물, 애정, 건강, 직장운까지 당신이 가장 궁금해하는 모든 것을 공개합니다.
                    </>
                  }
                  badge={['3', '테마분석']}
                  hClass="h-[600px]"
                  mClass="mt-[-300px]"
                />
              </div>

              {/* 4. 주의할 점 Section */}
              <div className="mt-16 relative">
                <div className="px-6 select-none pointer-events-none opacity-40 grayscale contrast-75">
                  <div className="text-center mb-6">
                    <h2 className="text-xl font-bold text-[#a68b7c] mb-1">특별히 주의해야 할 기간</h2>
                  </div>
                  <div className="grid grid-cols-2 gap-3 mb-6">
                    <div className="bg-[#eef2ff] p-4 rounded-xl border border-indigo-100">
                      <div className="font-bold text-indigo-700 text-xs uppercase mb-1">기운이 복돋는 달</div>
                      <p className="text-xs mt-2 text-slate-500">2월, 6월, 10월</p>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                      <div className="font-bold text-slate-700 text-xs uppercase mb-1">신중함이 필요한 달</div>
                      <p className="text-xs mt-2 text-slate-500">4월, 8월, 12월</p>
                    </div>
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed break-keep">
                    특정 오행의 기운이 충돌하거나 과해지는 시기에는 평소보다 차분한 대응이 필요합니다. 특히 병오년의 화기운이 정점에 달하는 여름철에는...
                  </p>
                </div>
                <AdHid
                  title={
                    <>
                      절대 놓치면 안 될 <span className="text-indigo-600">핵심 터닝포인트</span>
                    </>
                  }
                  des={
                    <>
                      한 해 중 운이 가장 폭발하는 시기와 반대로 자중하며 내실을 다져야 할 시기를 정확히 짚어드립니다.
                    </>
                  }
                  badge={['4', '주의기간']}
                  hClass="h-[500px]"
                  mClass="mt-[-250px]"
                />
              </div>
            </section>
          </div>
        </div>
      </div>
      <AdReview />
      {/* 전송 버튼 */}
      <div className="w-full px-6">
        <button
          type="submit"
          onClick={handleSubmit}
          className="w-full bg-indigo-600 text-white font-bold py-5 rounded-full text-lg shadow-lg flex items-center justify-center gap-1 active:scale-[0.98] transition-all hover:bg-indigo-700"
        >
          2026년 전체 흐름 보기 <ChevronRight size={22} strokeWidth={3} />
        </button>
      </div>

    </div>
  );
}
