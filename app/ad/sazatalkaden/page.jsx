import { headers } from 'next/headers';
import SazaTalkAdEnClient from './SazaTalkAdEnClient';

export async function generateMetadata() {
  const headersList = await headers();
  const acceptLanguage = headersList.get('accept-language') || '';
  const isKo = acceptLanguage.toLowerCase().includes('ko');

  if (isKo) {
    return {
      title: '사자톡 글로벌 서비스 | 외국인을 위한 맞춤 대화형 사주',
      description: '영어로 물어보고 한국 정통 사주 풀이를 받아보세요. 전 세계 어디서나 가능한 스마트 데스티니 상담.',
    };
  }

  return {
    title: 'SazaTalk Global | Interactive AI Saju for International Users',
    description: 'Ask in English and receive traditional Korean Saju interpretations. Smart destiny consulting available worldwide.',
  };
}

export default function SazaTalkAdEnPage() {
  return <SazaTalkAdEnClient />;
}
