import { headers } from 'next/headers';
import TarotDailyClient from './TarotDailyClient';

export async function generateMetadata() {
  const headersList = await headers();
  const acceptLanguage = headersList.get('accept-language') || '';
  const isKo = acceptLanguage.toLowerCase().includes('ko');

  if (isKo) {
    return {
      title: '오늘의 타로 | 당신을 위한 하루 가이드',
      description: '오늘 나에게 필요한 조언은 무엇일까요? 타로 카드를 통해 오늘의 기운과 주의해야 할 점을 확인하세요.',
    };
  }

  return {
    title: 'Daily Tarot | Your Daily Guidance',
    description: 'What advice do you need today? Check today\'s energy and things to watch out for through tarot cards.',
  };
}

export default function TarotDailyPage() {
  return <TarotDailyClient />;
}
