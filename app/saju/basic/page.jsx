import { headers } from 'next/headers';
import BasicClient from './BasicClient';

export async function generateMetadata() {
  const headersList = await headers();
  const acceptLanguage = headersList.get('accept-language') || '';
  const isKo = acceptLanguage.toLowerCase().includes('ko');

  if (isKo) {
    return {
      title: '평생 사주 분석 리포트 | 나의 타고난 명식과 대운 풀이',
      description: '당신의 인생 지도를 확인하세요. 오행의 조화와 10년마다 찾아오는 대운의 흐름을 정밀하게 분석합니다.',
    };
  }

  return {
    title: 'Lifetime Saju Analysis | My Innate Map & Great Luck',
    description: 'Check your life map. We precisely analyze the balance of the five elements and the flow of great luck that comes every 10 years.',
  };
}

export default function BasicPage() {
  return <BasicClient />;
}
