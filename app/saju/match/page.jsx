import { headers } from 'next/headers';
import MatchClient from './MatchClient';

export async function generateMetadata() {
  const headersList = await headers();
  const acceptLanguage = headersList.get('accept-language') || '';
  const isKo = acceptLanguage.toLowerCase().includes('ko');

  if (isKo) {
    return {
      title: '정밀 궁합 분석 | 두 사람의 오행 조화와 인연',
      description: '단순한 점이 아닌, 서로의 기운이 어떻게 작용하는지 과학적으로 분석합니다. 연인, 부부, 친구와의 깊은 인연을 확인하세요.',
    };
  }

  return {
    title: 'Compatibility Analysis | Harmony of Spirits',
    description: 'Not just a simple fortune telling, but a scientific analysis of how each other\'s energies interact. Check your deep connection with lovers, spouses, and friends.',
  };
}

export default function MatchPage() {
  return <MatchClient />;
}
