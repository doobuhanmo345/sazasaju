import SajuExpClient from './SajuExpClient';

export const metadata = {
  title: '사주(Saju)란 무엇인가? | 나의 인생 바코드와 운명의 흐름 분석',
  description: '사주는 통계학입니다. 시간의 바코드를 통해 당신의 기질과 잠재력을 확인하고, 다가올 운명의 흐름에 대비하는 전략을 세워보세요. | Saju is a statistical analysis of the energy data. Discover your potential.',
};

export default function SajuExpPage() {
  return <SajuExpClient />;
}
