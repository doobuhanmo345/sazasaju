import { headers } from 'next/headers';
import NewYearAdEnClient from './NewYearAdEnClient';

export async function generateMetadata() {
  const headersList = await headers();
  const acceptLanguage = headersList.get('accept-language') || '';
  const isKo = acceptLanguage.toLowerCase().includes('ko');

  if (isKo) {
    return {
      title: '2026 글로벌 신년운세 | 전 세계 어디서나 확인하는 나의 운명',
      description: '한국 정통 사주와 현대 인공지능의 만남. 2026 병오년, 당신의 행운을 영어와 한국어로 동시에 확인하세요.',
    };
  }

  return {
    title: '2026 Global New Year Fortune | Traditional Saju meets AI',
    description: 'The encounter between traditional Korean Saju and modern AI. Check your luck for the 2026 Year of the Red Horse in English.',
  };
}

export default function NewYearAdEnPage() {
  return <NewYearAdEnClient />;
}
