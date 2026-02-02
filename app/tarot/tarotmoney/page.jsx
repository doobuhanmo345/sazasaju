import { headers } from 'next/headers';
import TarotMoneyClient from './TarotMoneyClient';

export async function generateMetadata() {
  const headersList = await headers();
  const acceptLanguage = headersList.get('accept-language') || '';
  const isKo = acceptLanguage.toLowerCase().includes('ko');

  if (isKo) {
    return {
      title: '금전 타로 | 부의 흐름과 금전적 성공 가이드',
      description: '나의 금전적 기운은 지금 어떨까요? 타로 카드를 통해 재물운의 흐름과 현명한 투자, 자산 관리를 위한 팁을 확인하세요.',
    };
  }

  return {
    title: 'Wealth Tarot | Guide to Financial Success',
    description: 'What is your current financial energy? Check the flow of wealth, wise investment tips, and asset management guidance through tarot cards.',
  };
}

export default function TarotMoneyPage() {
  return <TarotMoneyClient />;
}
