import { notFound } from 'next/navigation';
import { kv } from '@vercel/kv';
import MatchShareTemplate from '../MatchShareTemplate';

// Server Component for /saju/share/match/[id]
// Fetches data from KV and renders the specific Match template
export default async function MatchShareIdPage({ params }) {
    const { id } = await params;

    // 1. Fetch data
    let data;
    try {
        data = await kv.get(`saju:${id}`);
    } catch (e) {
        console.error("KV Fetch Error:", e);
    }

    // 2. Handle Not Found / Expired
    if (!data) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
                <div className="text-center p-8 bg-white rounded-2xl shadow-sm border border-gray-100 max-w-md w-full">
                    <h1 className="text-xl font-bold text-gray-800 mb-2">링크가 만료되었거나 존재하지 않습니다.</h1>
                    <p className="text-gray-500 mb-6 text-sm">공유된 사주 결과는 7일간 보관됩니다.</p>
                    <a
                        href="/"
                        className="inline-block px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition shadow-lg shadow-indigo-200"
                    >
                        새로운 운세 보러가기
                    </a>
                </div>
            </div>
        );
    }

    // 3. Render Template with props
    // We pass shareData via props. MatchShareTemplate must accept this prop.
    return <MatchShareTemplate shareData={data} language="ko" />;
}
