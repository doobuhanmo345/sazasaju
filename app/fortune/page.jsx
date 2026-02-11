import FortuneClient from './FortuneClient';

export const metadata = {
    title: '운세보기 | 사자사주',
    description: '사주, 타로, 연애운 등 사자사주의 다양한 운세 항목을 한눈에 확인하세요.',
};

export default function FortunePage() {
    return <FortuneClient />;
}
