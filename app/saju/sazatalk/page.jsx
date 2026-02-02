import { headers } from 'next/headers';
import SazaTalkClient from './SazaTalkClient';

export async function generateMetadata() {
  const headersList = await headers();
  const acceptLanguage = headersList.get('accept-language') || '';
  const isKo = acceptLanguage.toLowerCase().includes('ko');

  if (isKo) {
    return {
      title: '사자톡 (SazaTalk) | 인공지능 사주 실시간 상담',
      description: '무엇이든 물어보세요! 사자톡 AI가 당신의 사주 명식을 기반으로 실질적이고 구체적인 조언을 해드립니다.',
    };
  }

  return {
    title: 'SazaTalk | AI Saju Consulting',
    description: 'Ask anything! SazaTalk AI provides practical and specific advice based on your Saju destiny.',
  };
}

export default function SazaTalkPage() {
  return <SazaTalkClient />;
}
