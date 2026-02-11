import HistoryClient from './HistoryClient';

export const metadata = {
    title: '상담 내역 | 사자사주',
    description: '내가 본 사주 분석 및 운세 기록을 확인하세요.',
};

export default function HistoryPage() {
    return <HistoryClient />;
}
