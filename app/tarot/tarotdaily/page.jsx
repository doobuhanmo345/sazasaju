import TarotDailyClient from './TarotDailyClient';

export const metadata = {
  title: '오늘의 타로 (Daily Tarot) | 당신을 위한 하루 가이드 - Your Daily Guidance',
  description: '타로 카드를 통해 오늘의 기운을 확인하세요. | Check today\'s energy through tarot cards.',
};

export default function TarotDailyPage() {
  return <TarotDailyClient />;
}
