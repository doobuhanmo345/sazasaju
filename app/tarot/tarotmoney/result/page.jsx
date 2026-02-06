
import ReportTemplateTarot from '@/app/tarot/ReportTemplateTarot';
import { useAuthContext } from '@/contexts/useAuthContext';
export default function TarotMoneyResultPage() {
    const { userData } = useAuthContext();
    const data = userData?.usageHistory?.tarotMoney?.result;
    return (
        <ReportTemplateTarot storageKey="tarotMoney" data={data} />
    );
}
