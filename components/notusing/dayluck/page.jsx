import { headers } from 'next/headers';
import DayLuckClient from './DayLuckClient';

export async function generateMetadata() {
  const headersList = await headers();
  const acceptLanguage = headersList.get('accept-language') || '';
  const isKo = acceptLanguage.toLowerCase().includes('ko');

  if (isKo) {
    return {
      title: '일진 및 택일 분석 | 나에게 맞는 최적의 날 찾기',
      description: '중요한 결정을 앞두고 계신가요? 오행의 흐름을 분석하여 당신의 기운과 가장 잘 맞는 날짜를 추천해 드립니다.',
    };
  }

  return {
    title: 'Daily Energy & Selection | Finding Your Best Day',
    description: 'Preparing for an important decision? We analyze the flow of the five elements and recommend the date that best matches your energy.',
  };
}

export default function DayLuckPage() {
  return <DayLuckClient />;
}
