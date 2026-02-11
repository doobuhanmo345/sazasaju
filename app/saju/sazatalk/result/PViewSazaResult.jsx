'use client';

import { useLoading } from '@/contexts/useLoadingContext';
import { aiSajuStyle } from '@/data/aiResultConstants';
import { useRef, useState, useEffect } from 'react';
import { PlusIcon, ClipboardDocumentIcon, CameraIcon } from '@heroicons/react/24/solid';
import { useLanguage } from '@/contexts/useLanguageContext';
import { parseAiResponse } from '@/utils/helpers';
import html2canvas from 'html2canvas';
import ShareButton from '@/components/ShareButton';
import ShareLinkButton from '@/components/ShareLinkButton';
import { useAuthContext } from '@/contexts/useAuthContext';
import { useRouter } from 'next/navigation';
export default function ViewSazaResult({


}) {
  const { userData } = useAuthContext();
  const [data, setData] = useState(null)
  const router = useRouter();
  const scrollElRef = useRef(null);
  const { language } = useLanguage();
  const question = userData?.usageHistory?.Zsazatalk?.question;
  const result = userData?.usageHistory?.Zsazatalk?.result;
  console.log(result)
  useEffect(() => {
    if (result) {
      const parsedData = parseAiResponse(result);
      if (parsedData) {
        setData(parsedData);
      }
    }
  }, [result]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(aiResult);
      alert(language === 'ko' ? '복사되었습니다.' : 'Copied to clipboard.');
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const handleCapture = async () => {
    if (scrollElRef.current) {
      try {
        const canvas = await html2canvas(scrollElRef.current, {
          backgroundColor: '#ffffff',
          scale: 2,
        });
        const link = document.createElement('a');
        link.download = `saza_report_${new Date().toISOString().slice(0, 10)}.png`;
        link.href = canvas.toDataURL();
        link.click();
      } catch (err) {
        console.error('Failed to capture image: ', err);
        alert(language === 'ko' ? '이미지 저장에 실패했습니다.' : 'Failed to save image.');
      }
    }
  };



  return (
    <div ref={scrollElRef} className="max-w-lg m-auto p-4 space-y-6">
      {/* User Question (Right-aligned bubble) */}
      {question && (
        <div className="flex justify-end">
          <div className="max-w-[80%] bg-indigo-600 text-white p-4 rounded-2xl rounded-tr-none shadow-md">
            <p className="text-sm font-bold">{question}</p>
          </div>
        </div>
      )}

      {/* AI Saju Analysis Answer (Left-aligned bubble) */}
      <div className="flex flex-col items-start gap-2">
        <div className="leading-8 w-full bg-white dark:bg-slate-800 p-5 rounded-2xl rounded-tl-none shadow-sm border border-slate-100 dark:border-slate-700">
          {data?.contents && Array.isArray(data?.contents) ? (
            data?.contents.map((i, idx) => {
              if (typeof i === 'object' && i !== null) {
                return (
                  <div key={idx} className="mb-4 last:mb-0">
                    {i.title && <strong className="block text-indigo-700 dark:text-indigo-300 mb-1">{i.title}</strong>}
                    {i.detail && <p className="text-slate-600 dark:text-slate-400">{i.detail}</p>}
                    {!i.title && !i.detail && <p>{JSON.stringify(i)}</p>}
                  </div>
                );
              }
              return <p key={idx} className="mb-2 last:mb-0">{i}</p>;
            })
          ) : (
            <p>{typeof data?.contents === 'string' ? data?.contents : ''}</p>
          )}

          {data?.saza && (
            <div className="mt-4 pt-4 border-t border-slate-50 dark:border-slate-700">
              <strong className="text-indigo-600 dark:text-indigo-400 block mb-1">
                {language === 'en' ? "Saza's Advice" : '사자의 조언'}
              </strong>
              {typeof data?.saza === 'object' ? (
                <div className="text-sm">
                  {data?.saza?.category && (
                    <span className="inline-block px-2 py-0.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded text-[10px] font-bold mr-2">
                      {data?.saza?.category}
                    </span>
                  )}
                  <p className="inline italic">"{data?.saza?.advice}"</p>
                </div>
              ) : (
                <p className="italic">"{data?.saza}"</p>
              )}
            </div>
          )}
        </div>

        {/* Utility buttons (copy / save) */}
        <div className="flex items-center gap-2 mt-2 ml-1">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 text-[10px] sm:text-xs text-slate-400 hover:text-slate-600 transition-colors px-2 py-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <ClipboardDocumentIcon className="w-3 h-3 sm:w-4 sm:h-4" />
            {language === 'ko' ? '텍스트 복사' : 'Copy Text'}
          </button>
          <button
            onClick={handleCapture}
            className="flex items-center gap-1 text-[10px] sm:text-xs text-slate-400 hover:text-slate-600 transition-colors px-2 py-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <CameraIcon className="w-3 h-3 sm:w-4 sm:h-4" />
            {language === 'ko' ? '이미지 저장' : 'Save Image'}
          </button>



        </div>
        <div className="flex items-center gap-2">
          <ShareLinkButton fortuneType="saza" />
          <ShareButton />
        </div>
      </div>


      <div className="flex flex-col gap-2 pt-6">
        <button
          onClick={() => {

            router.push('/saju/sazatalk');
          }}
          className="w-full p-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-slate-200 transition-colors"
        >
          <PlusIcon className="w-5 h-5" />
          {language === 'en' ? 'Ask another question' : '다른 질문하기'}
        </button>

        <p className="text-[11px] text-slate-400 text-center font-medium">
          {language === 'en'
            ? 'Enter a new question to restart the Saju analysis.'
            : '새로운 질문을 입력하면 사주 분석을 다시 시작합니다.'}
        </p>
      </div>


      {/* Style injection */}
      <div dangerouslySetInnerHTML={{ __html: aiSajuStyle }} />
    </div>
  );
}
