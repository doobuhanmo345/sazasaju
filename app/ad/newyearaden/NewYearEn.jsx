'use client';

import React, { useState } from 'react';
import {
  Zap,
  Brain,
  ChevronRight,
  Search,
  Database,
  Users,
  Heart,
  Sparkles,
} from 'lucide-react';
import AdHid from '../AdHid'
import AdReviewEn from '@/app/ad/AdReviewEn';

export default function NewYearEn({ setStep }) {
  const handleSubmit = (e) => {
    setStep(1);
  };
  const [activeMonth, setActiveMonth] = useState(1);
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FFF8F3] via-[#FFF0E8] to-[#FFE8E0] text-[#5C4B51] font-serif pb-20">
      <>
        <div className="w-full min-h-screen bg-gradient-to-br from-[#FFFAF7] to-[#FFF0EB] text-[#5C4B51] font-serif flex flex-col items-center">
          <div className=" w-full py-12 flex flex-col items-center">
            {/* 1. Logo */}
            <div className="flex items-center gap-2 mb-10">
              <div className="w-10 h-10 bg-gradient-to-br from-[#FFD4B8] to-[#FFC4A3] rounded-full flex items-center justify-center text-2xl shadow-lg shadow-orange-200/50">
                ✨
              </div>
              <span className="text-2xl font-bold tracking-wide text-[#8B6F5C] italic">
                Cosmic Insights
              </span>
            </div>
            {/* 2. Main Title */}
            <div className="text-center mb-12 px-6">
              <h1
                className="text-[32px] font-bold leading-tight mb-6 break-keep text-[#7A5C52]"
                style={{ fontFamily: 'Georgia, serif' }}
              >
                Your 2026
                <br />
                Year of Transformation
              </h1>
              <p className="text-[16px] text-[#A08B82] font-light leading-relaxed break-keep">
                Discover what the stars have aligned
                <br />
                for your journey ahead ✨
              </p>
            </div>
            <div className="w-full px-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-t from-[#FFF8F3] via-transparent to-[#FFF8F3] z-10 pointer-events-none"></div>
                <img
                  src="images/adImage/newyear/main.png"
                  className="w-full my-8 object-cover rounded-3xl shadow-2xl shadow-orange-200/30"
                  alt="Mystical imagery"
                />
              </div>
            </div>
            <div className="w-full px-6 mt-4">
              <button
                type="submit"
                onClick={handleSubmit}
                className="w-full bg-gradient-to-r from-[#E8B4A0] to-[#D4A088] text-white font-semibold py-6 rounded-full text-[17px] shadow-xl shadow-orange-200/40 flex items-center justify-center gap-2 active:scale-[0.97] transition-all hover:shadow-2xl hover:shadow-orange-200/50"
                style={{ fontFamily: 'Georgia, serif' }}
              >
                Unlock Your 2026 Reading <Heart size={20} className="fill-white" />
              </button>
            </div>
            {/* 5. Bottom info bar */}
            <div className="w-full flex items-center mt-16 px-6 py-6 border-t border-[#F5E6DD] bg-gradient-to-r from-[#FFF9F5] to-[#FFF5F0]">
              <div className="flex-1 flex flex-col items-center gap-2 opacity-80">
                <Users size={20} className="text-[#D4A088]" strokeWidth={1.5} />
                <span className="text-[11px] font-medium text-[#8B7B73] leading-tight text-center">
                  Expert Astrologers
                  <br />
                  <span className="font-light text-[10px] text-[#A69188]">Verified insights</span>
                </span>
              </div>

              <div className="h-10 w-[1px] bg-gradient-to-b from-transparent via-[#F0DDD0] to-transparent shrink-0"></div>

              <div className="flex-1 flex flex-col items-center gap-2 opacity-80">
                <Database size={20} className="text-[#D4A088]" strokeWidth={1.5} />
                <span className="text-[11px] font-medium text-[#8B7B73] leading-tight text-center">
                  Thousands of Readings
                  <br />
                  <span className="font-light text-[10px] text-[#A69188]">
                    Data-backed analysis
                  </span>
                </span>
              </div>

              <div className="h-10 w-[1px] bg-gradient-to-b from-transparent via-[#F0DDD0] to-transparent shrink-0"></div>

              <div className="flex-1 flex flex-col items-center gap-2 opacity-80">
                <Sparkles size={20} className="text-[#D4A088]" strokeWidth={1.5} />
                <span className="text-[11px] font-medium text-[#8B7B73] leading-tight text-center">
                  Personalized
                  <br />
                  <span className="font-semibold text-[#7A5C52]">AI Insights</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </>

      {/* Preview Banner */}
      <div className="mx-6">
        <div className="mx-4 my-12 flex flex-col items-center">
          <div className="flex items-center gap-2 px-4 py-2 rounded-full border border-[#F5D4C4] bg-gradient-to-r from-[#FFF5F0] to-[#FFEEE5] mb-4 shadow-sm">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#E8B4A0] opacity-60"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#D4A088]"></span>
            </span>
            <span
              className="text-[12px] font-semibold text-[#C49B87] tracking-wide uppercase"
              style={{ fontFamily: 'Georgia, serif' }}
            >
              Preview Edition
            </span>
          </div>

          <div className="text-center">
            <h3
              className="text-xl font-bold text-[#7A5C52] mb-3"
              style={{ fontFamily: 'Georgia, serif' }}
            >
              A Glimpse Into Your 2026
            </h3>

            <div className="space-y-4">
              <p className="text-sm text-[#9B8B82] leading-relaxed font-light">
                Explore the cosmic energies that will shape <br />
                your path in the year ahead
              </p>

              <div className="flex items-center justify-center gap-3">
                <div className="h-[1px] w-10 bg-gradient-to-r from-transparent to-[#E8D4C8]"></div>
                <p className="text-[13px] font-light text-[#9B8B82] bg-gradient-to-r from-[#FFF9F5] to-[#FFF5F0] px-4 py-2 rounded-xl border border-[#F5E6DD]">
                  This is a sample reading. <br />
                  For your complete monthly insights & personalized details,
                  <br />
                  <span className="text-[#7A5C52] font-semibold italic">visit our full portal</span>
                </p>
                <div className="h-[1px] w-10 bg-gradient-to-l from-transparent to-[#E8D4C8]"></div>
              </div>
            </div>
          </div>
        </div>
        <div className="sjsj-report-container">
          <div></div>
          <header className="sjsj-header bg-gradient-to-br from-[#FFF9F5] to-[#FFF0EB] rounded-3xl p-8 mb-8 shadow-lg border border-[#F5E6DD]">
            <h1
              className="text-3xl font-bold text-[#7A5C52] mb-4"
              style={{ fontFamily: 'Georgia, serif' }}
            >
              2026 Cosmic Report
            </h1>

            <p className="text-[15px] text-[#9B8B82] leading-relaxed font-light">
              2026 brings powerful transformative energy, where choices and timing shape your
              destiny. This preview offers a taste of what your personalized reading reveals.
            </p>

            <div className="inline-block mt-6 px-4 py-2 bg-gradient-to-r from-[#FFE8DD] to-[#FFE0D0] rounded-full text-[#C49B87] text-sm font-semibold shadow-sm">
              ✨ 1-Minute Overview
            </div>
          </header>
          <section className="relative sjsj-section">
            <div className="sjsj-section-label bg-gradient-to-r from-[#FFF5F0] to-transparent p-6 rounded-2xl mb-6">
              <h2
                className="text-2xl font-bold text-[#7A5C52] mb-3"
                style={{ fontFamily: 'Georgia, serif' }}
              >
                Growth Through Challenge & Beautiful Change
              </h2>
              <p className="text-[15px] text-[#9B8B82] font-light leading-relaxed">
                Passionate energy will refine you, creating new value and meaning throughout this
                transformative year.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-5 mb-8">
              <div className="bg-gradient-to-br from-white to-[#FFF9F5] p-6 rounded-2xl shadow-lg border border-[#F5E6DD]">
                <div className="flex items-center gap-4 mb-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#FFD4B8] to-[#FFC4A3] rounded-full flex items-center justify-center shadow-md">
                    <Zap className="text-white" size={24} />
                  </div>
                  <div
                    className="text-xl font-bold text-[#7A5C52]"
                    style={{ fontFamily: 'Georgia, serif' }}
                  >
                    Momentum
                  </div>
                </div>
                <div className="text-sm text-[#9B8B82] leading-relaxed font-light">
                  Opportunities move quickly this year — hesitation equals loss in this energetic
                  flow.
                </div>
              </div>

              <div className="bg-gradient-to-br from-white to-[#FFF9F5] p-6 rounded-2xl shadow-lg border border-[#F5E6DD]">
                <div className="flex items-center gap-4 mb-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#E8C4B8] to-[#D4B4A8] rounded-full flex items-center justify-center shadow-md">
                    <Heart className="text-white" size={24} />
                  </div>
                  <div
                    className="text-xl font-bold text-[#7A5C52]"
                    style={{ fontFamily: 'Georgia, serif' }}
                  >
                    Choices
                  </div>
                </div>
                <div className="text-sm text-[#9B8B82] leading-relaxed font-light">
                  Multiple paths will open simultaneously, but you can't walk them all at once.
                </div>
              </div>

              <div className="bg-gradient-to-br from-white to-[#FFF9F5] p-6 rounded-2xl shadow-lg border border-[#F5E6DD]">
                <div className="flex items-center gap-4 mb-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#D4A8A0] to-[#C49890] rounded-full flex items-center justify-center shadow-md">
                    <Sparkles className="text-white" size={24} />
                  </div>
                  <div
                    className="text-xl font-bold text-[#7A5C52]"
                    style={{ fontFamily: 'Georgia, serif' }}
                  >
                    Direction
                  </div>
                </div>
                <div className="text-sm text-[#9B8B82] leading-relaxed font-light">
                  This year's essence isn't about effort, but about "where you're headed."
                </div>
              </div>
            </div>
            <AdHid
              title={
                <>
                  Three Guiding <span className="text-[#D4A088]">Keywords</span> for 2026
                </>
              }
              des={
                <>
                  Powerful cosmic energy will shape your year ahead. <br />
                  We've distilled your forecast into three essential keywords.
                </>
              }
              badge={['1', 'Keywords']}
            />
          </section>

          <div className="sjsj-content-inner">
            <section className="relative sjsj-section">
              <div className="sjsj-section-label bg-gradient-to-r from-[#FFF5F0] to-transparent p-6 rounded-2xl mb-6">
                <h2
                  className="text-2xl font-bold text-[#7A5C52]"
                  style={{ fontFamily: 'Georgia, serif' }}
                >
                  2026 Comprehensive Analysis
                </h2>
              </div>

              <div className="bg-gradient-to-r from-[#FFE8DD] to-[#FFE0D0] p-5 rounded-2xl mb-6 border border-[#F5D4C4]">
                <p className="text-sm text-[#8B7066] text-center font-light italic">
                  Fiery energy creates opportunities, but also brings intensity and the need for
                  balance.
                </p>
              </div>

              <div className="bg-gradient-to-br from-white to-[#FFF9F5] p-6 rounded-2xl shadow-lg border border-[#F5E6DD] mb-6">
                <div className="">
                  <div className="mb-5">
                    <div className="flex items-center gap-2 mb-3">
                      <div
                        className="text-lg font-bold text-[#D4A088]"
                        style={{ fontFamily: 'Georgia, serif' }}
                      >
                        🌟 Growth Keywords
                      </div>
                    </div>
                    <ul className="space-y-2">
                      <li className="text-[#9B8B82] text-sm flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-[#D4A088] rounded-full"></span>
                        Decisiveness
                      </li>
                      <li className="text-[#9B8B82] text-sm flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-[#D4A088] rounded-full"></span>
                        Swift action
                      </li>
                    </ul>
                  </div>

                  <div className="mb-5">
                    <div className="flex items-center gap-2 mb-3">
                      <div
                        className="text-lg font-bold text-[#B89B88]"
                        style={{ fontFamily: 'Georgia, serif' }}
                      >
                        💫 Elements to Embrace
                      </div>
                    </div>
                    <ul className="space-y-2">
                      <li className="text-[#9B8B82] text-sm flex items-center gap-2">
                        <span className="text-[#D4A088]">✓</span> Quick judgment
                      </li>
                      <li className="text-[#9B8B82] text-sm flex items-center gap-2">
                        <span className="text-[#D4A088]">✓</span> Priority setting
                      </li>
                    </ul>
                  </div>

                  <div className="">
                    <div className="flex items-center gap-2 mb-3">
                      <div
                        className="text-lg font-bold text-[#A88B7A]"
                        style={{ fontFamily: 'Georgia, serif' }}
                      >
                        ⚠️ Gentle Cautions
                      </div>
                    </div>
                    <ul className="space-y-2">
                      <li className="text-[#9B8B82] text-sm flex items-center gap-2">
                        <span className="text-[#C49B87]">△</span> Over-expansion
                      </li>
                      <li className="text-[#9B8B82] text-sm flex items-center gap-2">
                        <span className="text-[#C49B87]">△</span> Emotional decisions
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              <div>
                <p className="text-[15px] text-[#9B8B82] leading-relaxed font-light p-6 bg-gradient-to-br from-[#FFF9F5] to-white rounded-2xl border border-[#F5E6DD]">
                  This overview captures the general atmosphere and flow of 2026. In your complete
                  reading, timing and intensity vary based on your unique chart. If you're sensing a
                  particular energy now, that's your key signal for the year.
                </p>
              </div>
              <AdHid
                title={
                  <>
                    Annual Forecast with
                    <span className="text-[#D4A088]"> Complete Analysis</span>
                  </>
                }
                des={
                  <>
                    Your year's keywords, how to work with cosmic energy, cautions, and overall
                    fortune compiled comprehensively. Explore detailed insights into love, finances,
                    and career paths.
                  </>
                }
                badge={['2', 'Full Analysis']}
              />
            </section>
          </div>
        </div>
      </div>
      <AdReviewEn />
      {/* Submit Button */}
      <div className="w-full px-6 mt-8">
        <button
          type="submit"
          onClick={handleSubmit}
          className="w-full bg-gradient-to-r from-[#E8B4A0] to-[#D4A088] text-white font-semibold py-6 rounded-full text-[17px] shadow-xl shadow-orange-200/40 flex items-center justify-center gap-2 active:scale-[0.97] transition-all hover:shadow-2xl hover:shadow-orange-200/50"
          style={{ fontFamily: 'Georgia, serif' }}
        >
          Discover Your Complete 2026 Journey <Heart size={20} className="fill-white" />
        </button>
      </div>
    </div>
  );
}
