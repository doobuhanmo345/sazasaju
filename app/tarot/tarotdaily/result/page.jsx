'use client';
import ReportTemplateTarot from '@/app/tarot/ReportTemplateTarot';
import { useAuthContext } from '@/contexts/useAuthContext';
export default function TarotDailyResultPage() {
    const { userData } = useAuthContext();
    const data = userData?.usageHistory?.tarotDaily?.result;
    return (
        <ReportTemplateTarot storageKey="tarotDaily" data={data} />
    );
}
