import { headers } from 'next/headers';
import SelBirthClient from './SelBirthClient';

export async function generateMetadata() {
  const headersList = await headers();
  const acceptLanguage = headersList.get('accept-language') || '';
  const isKo = acceptLanguage.toLowerCase().includes('ko');

  if (isKo) {
    return {
      title: '출산 택일 분석 | 신생아를 위한 축복의 시간',
      description: '아이의 평생 운을 좌우하는 소중한 선택. 오행의 균형이 가장 잘 잡힌 출산 예정일과 시간을 제안해 드립니다.',
    };
  }

  return {
    title: 'Auspicious Birth Selection | Best Time for Newborn',
    description: 'A precious choice that influences a child\'s lifelong fortune. We suggest the delivery date and time with the best balance of the five elements.',
  };
}

export default function SelBirthPage() {
  return <SelBirthClient />;
}
