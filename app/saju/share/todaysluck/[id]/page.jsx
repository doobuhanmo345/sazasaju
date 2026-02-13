import { notFound } from 'next/navigation';
import { kv } from '@vercel/kv';
import TodaysLuckShareTemplate from '../TodaysLuckShareTemplate';
import { headers } from 'next/headers';

// Server Component for /saju/share/todaysluck/[id]
export default async function TodaysLuckShareIdPage({ params, searchParams }) {
    const { id } = await params;
    const { lang } = await searchParams;
    const headerList = await headers();
    const acceptLanguage = headerList.get('accept-language') || '';
    const primaryLang = acceptLanguage.split(',')[0].toLowerCase();
    const browserLang = primaryLang.startsWith('ko') ? 'ko' : 'en';
    const language = (lang === 'ko' || lang === 'en') ? lang : browserLang;
    const isKo = language === 'ko';

    let data;
    try {
        data = await kv.get(`saju:${id}`);
    } catch (e) {
        console.error("KV Fetch Error:", e);
    }

    if (!data) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
                <div className="text-center p-8 bg-white rounded-2xl shadow-sm border border-gray-100 max-w-md w-full">
                    <h1 className="text-xl font-bold text-gray-800 mb-2">{isKo ? '링크가 만료되었거나 존재하지 않습니다.' : 'Link has expired or does not exist.'}</h1>
                    <p className="text-gray-500 mb-6 text-sm">{isKo ? '공유된 사주 결과는 7일간 보관됩니다.' : 'Shared fortune results are stored for 7 days.'}</p>
                    <a href="/" className="inline-block px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition shadow-lg shadow-indigo-200">
                        {isKo ? '새로운 운세 보러가기' : 'Go to New Fortune'}
                    </a>
                </div>
            </div>
        );
    }

    return <TodaysLuckShareTemplate shareData={data} language={language} />;
}
