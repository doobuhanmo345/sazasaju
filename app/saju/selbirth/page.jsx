import SelBirthClient from './SelBirthClient';

export const metadata = {
  title: '출산 택일 분석 (Birth Selection) | 신생아를 위한 축복의 시간 - Best Time for Newborn',
  description: '오행의 균형이 가장 잘 잡힌 출산 예정일과 시간을 제안해 드립니다. | Suggesting the delivery date and time with the best balance of the five elements.',
};

export default function SelBirthPage() {
  return <SelBirthClient />;
}
