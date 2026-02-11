import { ChevronLeftIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';
export default function BackButton() {
    const router = useRouter();
    return (
        <button
            onClick={() => router.back()}
            className="absolute top-10 left-6 p-2.5 hover:scale-105 active:scale-95 transition-all text-slate-900 dark:text-white z-30 flex items-center justify-center"
        >
            <ChevronLeftIcon className="w-6 h-6" />
        </button>
    );
};