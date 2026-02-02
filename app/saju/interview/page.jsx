import { headers } from 'next/headers';
import InterviewClient from './InterviewClient';

export async function generateMetadata() {
  const headersList = await headers();
  const acceptLanguage = headersList.get('accept-language') || '';
  const isKo = acceptLanguage.toLowerCase().includes('ko');

  if (isKo) {
    return {
      title: '면접 및 합격운 분석 | 나의 경쟁력 확인하기',
      description: '중요한 면접을 앞두고 계신가요? 당신의 기운과 면접일의 조화를 분석하여 합격 가능성을 높이는 전략을 제안합니다.',
    };
  }

  return {
    title: 'Interview & Success Luck | Boosting Your Career',
    description: 'Preparing for an important interview? We analyze the harmony between your energy and the interview date to suggest strategies that increase your chances of passing.',
  };
}

export default function InterviewPage() {
  return <InterviewClient />;
}
