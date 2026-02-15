

'use client';
import React from 'react';
import { MessageCircle, Sparkles, Heart, Star, Share2 } from 'lucide-react';
import { useLanguage } from '@/contexts/useLanguageContext';
import { useLoading } from '@/contexts/useLoadingContext';
import { useRouter } from 'next/navigation';
import ShareButton from './ShareButton';
import ShareLinkButton from './ShareLinkButton';
import SazatalkLoveBanner from './banner/SazatalkLoveBanner';


export default function AfterReport({ fortuneType = 'basic', storageKey = false, data, saju = null, relation = null }) {
  const { aiResult } = useLoading();
  const { language } = useLanguage();
  const navigate = useRouter();
  const isLove = fortuneType === 'love' || fortuneType === 'match';
  const handleStartSazaTalk = () => {
    const historyData = data ? (typeof data === 'string' ? data : JSON.stringify(data)) : aiResult;
    if (historyData) {
      sessionStorage.setItem('saza_history', historyData);
    }
    navigate.push('/saju/sazatalk');
  };


  return (
    <div className={`w-full py-20 px-6 bg-gradient-to-b from-white ${isLove ? 'via-rose-50/30' : 'via-blue-50/30'} to-white`}>
      <div className="max-w-xl mx-auto text-center space-y-12">
        {/* Share Section - Prominent & Unboxed */}
        <div className={`bg-white/60 backdrop-blur-sm rounded-2xl p-6 border ${isLove ? 'border-rose-100/50' : 'border-blue-100/50'}`}>
          <div className="flex flex-col items-center gap-4">
            <div className={`flex items-center gap-2 ${isLove ? 'text-rose-600' : 'text-blue-600'} font-bold text-sm uppercase tracking-wide`}>
              <Share2 size={16} />
              <span>{language !== 'ko' ? 'Share with friends' : '친구에게 공유하기'}</span>
            </div>
            <div className="flex sm:flex-row flex-col items-center justify-center gap-4">
              <ShareLinkButton fortuneType={fortuneType} storageKey={storageKey} />
              <ShareButton />

            </div>
          </div>
        </div>


        {isLove && (
          <SazatalkLoveBanner saju={saju} relation={relation} />
        )}
        {!isLove && (
          <div>
            {/* Divider with Text */}
            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className={`px-4 bg-gradient-to-b from-white ${isLove ? 'via-rose-50/30' : 'via-blue-50/30'} to-white text-slate-400 font-medium`}>
                  {language !== 'ko' ? 'Or ask Saza' : '또는 사자에게 질문하기'}
                </span>

              </div>

            </div>
            {/* Header Section without Box */}
            <div className="space-y-4">
              <div className={`inline-flex items-center justify-center p-3 ${isLove ? 'bg-rose-100/50' : 'bg-blue-100/50'} rounded-full mb-2 animate-bounce-slow`}>
                <MessageCircle size={24} className={isLove ? 'text-rose-600' : 'text-blue-600'} />
              </div>
              <h3 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight">
                {language !== 'ko' ? 'Curious for More?' : '더 궁금한 점이 있으신가요?'}
              </h3>
              <p className="text-slate-600 text-lg leading-relaxed max-w-md mx-auto">
                {language !== 'ko' ? 'Saza can provide detailed answers to your specific questions.' : '사자(SAZA)가 당신의 질문에 대해\n더 자세하고 명확한 답변을 드릴 수 있어요.'}
              </p>
            </div>

            {/* Action Buttons Group */}
            <div className="space-y-8">



              {/* Primary CTA */}
              <button
                onClick={handleStartSazaTalk}
                className={`w-full sm:w-auto px-10 py-5 bg-gradient-to-r ${isLove ? 'from-rose-500 to-pink-600 shadow-rose-500/25 hover:shadow-rose-500/40' : 'from-blue-600 to-indigo-600 shadow-blue-500/25 hover:shadow-blue-500/40'} text-white rounded-2xl font-bold text-xl shadow-xl  hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-3 mx-auto group`}
              >
                <span>{language !== 'ko' ? 'Start Chat with Saza' : '사자와 채팅 시작하기'}</span>
                <MessageCircle size={22} className="group-hover:rotate-12 transition-transform" />
              </button>




            </div></div>
        )}





        {/* Features - Clean Icons */}
        <div className="grid grid-cols-3 gap-6 pt-6">
          <div className="flex flex-col items-center gap-3 group cursor-default">
            <div className="w-12 h-12 bg-rose-50 rounded-2xl flex items-center justify-center group-hover:bg-rose-100 transition-colors">
              <Heart size={20} className="text-rose-500" />
            </div>
            <span className="text-xs font-bold text-slate-500">{language !== 'ko' ? 'Love' : '연애운'}</span>
          </div>
          <div className="flex flex-col items-center gap-3 group cursor-default">
            <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center group-hover:bg-amber-100 transition-colors">
              <Sparkles size={20} className="text-amber-500" />
            </div>
            <span className="text-xs font-bold text-slate-500">{language !== 'ko' ? 'Success' : '성공운'}</span>
          </div>
          <div className="flex flex-col items-center gap-3 group cursor-default">
            <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center group-hover:bg-indigo-100 transition-colors">
              <Star size={20} className="text-indigo-500" />
            </div>
            <span className="text-xs font-bold text-slate-500">{language !== 'ko' ? 'Future' : '미래운'}</span>
          </div>
        </div>

      </div>
    </div>
  );
}
