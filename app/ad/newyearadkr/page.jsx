import { headers } from 'next/headers';
import NewYearAdKrClient from './NewYearAdKrClient';

export async function generateMetadata() {
  const headersList = await headers();
  const acceptLanguage = headersList.get('accept-language') || '';
  const isKo = acceptLanguage.toLowerCase().includes('ko');

  if (isKo) {
    return {
      title: '2026 병오년 신년운세 | 나의 한 해 운명 총정리',
      description: '붉은 말의 해, 당신에게 찾아올 특별한 기회는? 2026년 신년운세를 사자사주 인공지능이 정밀하게 분석해 드립니다.',
    };
  }

  return {
    title: '2026 Yearly Fortune | Complete Life Forecast',
    description: 'The year of the Red Horse, what special opportunities await you? Saza Saju AI precisely analyzes your 2026 new year fortune.',
  };
}

export default function NewYearAdKrPage() {
  return <NewYearAdKrClient />;
}
