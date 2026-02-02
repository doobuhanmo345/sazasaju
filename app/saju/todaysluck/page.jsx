import { headers } from 'next/headers';
import TodaysLuckClient from './TodaysLuckClient';

export async function generateMetadata() {
  const headersList = await headers();
  const acceptLanguage = headersList.get('accept-language') || '';
  const isKo = acceptLanguage.toLowerCase().includes('ko');

  if (isKo) {
    return {
      title: '오늘의 운세 | 당신만을 위한 행운의 컬러와 조언',
      description: '매일 바뀌는 일진에 따라 나의 에너지를 최적화하세요. 행운의 아이템과 주의해야 할 점을 알려드립니다.',
    };
  }

  return {
    title: 'Todays Fortune | Lucky Color & Daily Advice',
    description: 'Optimize your energy according to the daily changing celestial flow. We tell you the lucky items and things to watch out for.',
  };
}

export default function TodaysLuckPage() {
  return <TodaysLuckClient />;
}
