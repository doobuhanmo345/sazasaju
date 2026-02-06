'use client'
import ReportTemplateTarot from '@/app/tarot/ReportTemplateTarot';
import { useAuthContext } from '@/contexts/useAuthContext';
export default function TarotCounselingResultPage() {
    const { userData } = useAuthContext();
    const data = userData?.usageHistory?.tarotCounseling?.result;
    return (
        <ReportTemplateTarot storageKey="tarotCounseling" data={data} />
    );
}
