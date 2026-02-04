import FortuneCookieClient from './FortuneCookieClient';

export const metadata = {
  title: '포춘쿠키 (Fortune Cookie) | 오늘 당신의 행운 메시지와 보너스 크레딧',
  description: '매일 하나씩 열어보는 오늘의 격언과 행운. 포춘쿠키를 통해 추가 크레딧을 획득하세요. | Daily wisdom and luck. Get extra credits through fortune cookies.',
};

export default function FortuneCookiePage() {
  return <FortuneCookieClient />;
}
