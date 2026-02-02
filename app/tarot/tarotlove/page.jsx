import { headers } from 'next/headers';
import TarotLoveClient from './TarotLoveClient';

export async function generateMetadata() {
  const headersList = await headers();
  const acceptLanguage = headersList.get('accept-language') || '';
  const isKo = acceptLanguage.toLowerCase().includes('ko');

  if (isKo) {
    return {
      title: '연애 타로 | 당신의 사랑과 인연의 흐름',
      description: '상대방의 속마음부터 앞으로의 연애운까지. 타로 카드가 들려주는 당신의 설레는 인연 이야기를 확인하세요.',
    };
  }

  return {
    title: 'Love Tarot | Insights into Romance & Connections',
    description: 'From your partner\'s hidden thoughts to your future love fortune. Check the exciting story of your connections told by tarot cards.',
  };
}

export default function TarotLovePage() {
  return <TarotLoveClient />;
}
