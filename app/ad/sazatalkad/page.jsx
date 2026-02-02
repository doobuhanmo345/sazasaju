import { headers } from 'next/headers';
import SazaTalkAdClient from './SazaTalkAdClient';

export async function generateMetadata() {
  const headersList = await headers();
  const acceptLanguage = headersList.get('accept-language') || '';
  const isKo = acceptLanguage.toLowerCase().includes('ko');

  if (isKo) {
    return {
      title: '사자톡 인공지능 운세 상담 | 당신의 고민을 해결하는 단 하나의 열쇠',
      description: '어떤 고민이든 괜찮아요. 사자톡의 정교한 명리 알고리즘이 당신의 삶에 명확한 명쾌한 해답을 드립니다.',
    };
  }

  return {
    title: 'SazaTalk AI Counseling | The Key to Your Destiny',
    description: 'Whatever your concern, SazaTalk\'s sophisticated Myeongni algorithm provides clear answers to your life questions.',
  };
}

export default function SazaTalkAdPage() {
  return <SazaTalkAdClient />;
}
