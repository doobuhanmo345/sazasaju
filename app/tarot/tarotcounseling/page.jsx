import { headers } from 'next/headers';
import TarotCounselingClient from './TarotCounselingClient';

export async function generateMetadata() {
  const headersList = await headers();
  const acceptLanguage = headersList.get('accept-language') || '';
  const isKo = acceptLanguage.toLowerCase().includes('ko');

  if (isKo) {
    return {
      title: '타로 심층 상담 | 인공지능 타로 마스터와의 대화',
      description: '고민의 실타래를 풀고 싶으신가요? 사자사주 AI 타로 마스터가 당신의 질문에 깊이 있는 통찰과 해답을 드립니다.',
    };
  }

  return {
    title: 'Deep Tarot Counseling | AI Tarot Master Session',
    description: 'Looking to untangle your worries? Saza Saju AI Tarot Master provides deep insights and solutions to your specific questions.',
  };
}

export default function TarotCounselingPage() {
  return <TarotCounselingClient />;
}
