import { notFound } from 'next/navigation';
import { kv } from '@vercel/kv';
import BasicShareTemplate from '../BasicShareTemplate';

// Server Component for /saju/share/basic/[id]
export default async function BasicShareIdPage({ params }) {
    const { id } = await params;

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
                    <h1 className="text-xl font-bold text-gray-800 mb-2">링크가 만료되었거나 존재하지 않습니다.</h1>
                    <p className="text-gray-500 mb-6 text-sm">공유된 사주 결과는 7일간 보관됩니다.</p>
                    <a href="/" className="inline-block px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition shadow-lg shadow-indigo-200">
                        새로운 운세 보러가기
                    </a>
                </div>
            </div>
        );
    }

    return <BasicShareTemplate shareData={data} />;
}
