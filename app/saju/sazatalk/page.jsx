import SazaTalkClient from './SazaTalkClient';

export const metadata = {
  title: '사자톡 (SazaTalk) | AI 사주 실시간 상담 - Saju Consulting',
  description: '사자톡 AI가 당신의 사주 명식을 기반으로 실질적이고 구체적인 조언을 해드립니다. | Ask anything! SazaTalk AI provides practical and specific advice based on your Saju destiny.',
};

export default function SazaTalkPage() {
  return <SazaTalkClient />;
}
