import { headers } from 'next/headers';
import Luck2026Client from './2026LuckClient';

export async function generateMetadata() {
  const headersList = await headers();
  const acceptLanguage = headersList.get('accept-language') || '';
  const isKo = acceptLanguage.toLowerCase().includes('ko');

  if (isKo) {
    return {
      title: '2026년 신년운세 | 병오년 기운으로 보는 나의 한 해',
      description: '2026년 병오년(붉은 말의 해)의 흐름을 미리 확인하세요. 건강, 재물, 연애운의 정밀 분석 리포트.',
    };
  }

  return {
    title: '2026 New Year Fortune | Year of the Red Horse',
    description: 'Check the flow of the 2026 Year of Byeong-o in advance. Precise analysis report on health, wealth, and love.',
  };
}

export default function Luck2026Page() {
  return <Luck2026Client />;
}
