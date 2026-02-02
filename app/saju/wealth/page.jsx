import { headers } from 'next/headers';
import WealthClient from './WealthClient';

export async function generateMetadata() {
  const headersList = await headers();
  const acceptLanguage = headersList.get('accept-language') || '';
  const isKo = acceptLanguage.toLowerCase().includes('ko');

  if (isKo) {
    return {
      title: '재물운 분석 | 나의 부와 금전의 흐름',
      description: '타고난 재물 복과 평생의 금전 흐름을 분석합니다. 언제 돈이 모이고 나가는지, 재테크 방향과 성공 전략을 확인하세요.',
    };
  }

  return {
    title: 'Wealth Luck Analysis | Path to Financial Success',
    description: 'Analyze your innate wealth luck and lifelong money flow. Find out when money comes and goes, and check your investment direction and success strategy.',
  };
}

export default function WealthPage() {
  return <WealthClient />;
}
