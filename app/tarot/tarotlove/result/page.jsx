'use client';
import ReportTemplateTarot from '@/app/tarot/ReportTemplateTarot';
import { useAuthContext } from '@/contexts/useAuthContext';
export default function TarotLoveResultPage() {
    const { userData } = useAuthContext();
    const data = userData?.usageHistory?.tarotLove?.result;
    return (
        <ReportTemplateTarot storageKey="tarotLove" data={data} />
    );
}
