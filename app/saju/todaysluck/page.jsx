import TodaysLuckClient from './TodaysLuckClient';

export const metadata = {
  title: '오늘의 운세 (Today Fortune) | 당신만을 위한 행운의 컬러와 조언 - Lucky Color & Daily Advice',
  description: '매일 바뀌는 일진에 따라 나의 에너지를 최적화하세요. | Optimize your energy according to the daily changing celestial flow.',
};

export default function TodaysLuckPage() {
  return <TodaysLuckClient />;
}
