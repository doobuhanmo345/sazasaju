import { headers } from 'next/headers';
import SelDateClient from './SelDateClient';

export async function generateMetadata() {
  const headersList = await headers();
  const acceptLanguage = headersList.get('accept-language') || '';
  const isKo = acceptLanguage.toLowerCase().includes('ko');

  if (isKo) {
    return {
      title: '좋은 날 택일 분석 | 성공을 위한 완벽한 타이밍',
      description: '이사, 개업, 계약 등 인생의 중요한 순간을 위한 최고의 날짜를 제안합니다. 당신의 기운이 극대화되는 시점을 확인하세요.',
    };
  }

  return {
    title: 'Auspicious Date Selection | Perfect Timing for Success',
    description: 'Suggesting the best dates for important life moments like moving, opening a business, or signing contracts. Find out when your energy is maximized.',
  };
}

export default function SelDatePage() {
  return <SelDateClient />;
}
