import { headers } from 'next/headers';
import SazaTalkAdKrClient from './SazaTalkAdKrClient';

export async function generateMetadata() {
  const headersList = await headers();
  const acceptLanguage = headersList.get('accept-language') || '';
  const isKo = acceptLanguage.toLowerCase().includes('ko');

  if (isKo) {
    return {
      title: '사자톡 프리미엄 상담 | 질문하면 바로 답해주는 인공지능 사주',
      description: '당신의 운명을 가장 명확하게 풀어드리는 사자톡. 연애, 금전, 직업 고민을 지금 바로 해결하세요.',
    };
  }

  return {
    title: 'SazaTalk Premium | Real-time AI Saju Reading',
    description: 'The clearest interpretation of your destiny. Solve your love, money, and career concerns right now.',
  };
}

export default function SazaTalkAdKrPage() {
  return <SazaTalkAdKrClient />;
}
