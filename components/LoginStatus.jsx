import MyInfoBar from "./MyInfoBar";
import { useAuthContext } from "@/contexts/useAuthContext";
import { useLanguage } from "@/contexts/useLanguageContext";
import { SparklesIcon, ChevronRightIcon } from "@heroicons/react/24/outline";

export default function LoginStatus() {
    const { user, openLoginModal } = useAuthContext();
    const { language } = useLanguage();
    const isKo = language === 'ko';

    return (
        <div>
            {!!user &&
                <div className="w-full max-w-lg mx-auto mb-4 px-1"><MyInfoBar /></div>
            }
            {!user && <div className="w-full max-w-lg mx-auto mb-4 px-1">
                <div className="bg-white/70 dark:bg-slate-800/60 rounded-xl border border-indigo-50 dark:border-indigo-500/20 shadow-sm backdrop-blur-md p-2 px-4 h-[44px] flex items-center">

                    <button
                        onClick={openLoginModal}
                        className="w-full h-full flex items-center justify-between group"
                    >
                        <div className="flex items-center gap-3 text-sm tracking-tight overflow-hidden">
                            <div className="flex items-center gap-2 shrink-0">

                                <span className="font-bold text-slate-400 dark:text-slate-500">
                                    {isKo ? '정보 없음' : 'No Information'}
                                </span>
                            </div>

                            <div className="w-px h-3 bg-slate-200 dark:bg-slate-700 shrink-0"></div>

                            <span className="font-medium text-slate-600 dark:text-slate-300 truncate">
                                {isKo ? '모든 메뉴를 하루 세번 무료로!' : 'Try all menus for free three times a day'}
                            </span>
                        </div>

                        <div className="flex items-center gap-1 text-xs font-bold text-indigo-500 dark:text-indigo-400 opacity-60 group-hover:opacity-100 transition-opacity whitespace-nowrap ml-2">
                            <span>{isKo ? '시작' : 'Start'}</span>
                            <ChevronRightIcon className="w-4 h-4 font-bold" />
                        </div>
                    </button>

                </div>
            </div>}


        </div>

    );
}