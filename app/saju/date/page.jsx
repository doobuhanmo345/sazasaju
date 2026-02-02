import { headers } from 'next/headers';
import DateClient from './DateClient';

export async function generateMetadata() {
  const headersList = await headers();
  const acceptLanguage = headersList.get('accept-language') || '';
  const isKo = acceptLanguage.toLowerCase().includes('ko');

  if (isKo) {
    return {
      title: '연애 및 데이트운 분석 | 완벽한 만남을 위한 조언',
      description: '특별한 만남을 앞두고 계신가요? 두 사람의 조화와 그 날의 기운을 분석하여 최고의 데이트를 위한 팁을 드립니다.',
    };
  }

  return {
    title: 'Date & Romance Luck | Tips for Perfect Meeting',
    description: 'Preparing for a special meeting? We analyze the harmony between two people and the energy of the day to give you tips for the best date.',
  };
}

export default function DatePage() {
  return <DateClient />;
}
