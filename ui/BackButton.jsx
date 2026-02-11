'use client';

import { useState, useEffect } from 'react';
import { ChevronLeftIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';

export default function BackButton({ title }) {
    const router = useRouter();
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            const offset = window.scrollY || document.documentElement.scrollTop;
            // Use 80px as a clean, intentional threshold. 
            // Any value < 80 will keep it transparent.
            const isScrolled = offset > 180;
            setScrolled(prev => prev !== isScrolled ? isScrolled : prev);
        };

        handleScroll(); // Check on mount
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${scrolled
            ? 'bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl border-b border-slate-100 dark:border-white/5 py-3 shadow-sm'
            : 'bg-transparent border-b border-transparent py-5'
            }`}>
            <div className="max-w-lg mx-auto px-6 relative flex items-center justify-between">
                <button
                    onClick={() => router.back()}
                    className="relative z-10 p-2 hover:scale-110 active:scale-95 transition-all text-slate-900 dark:text-white flex items-center justify-center rounded-xl"
                >
                    <ChevronLeftIcon className="w-6 h-6 stroke-[2.5]" />
                </button>

                <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-center">
                    <span className={`text-sm font-black uppercase tracking-[0.3em] text-slate-900 dark:text-white transition-all duration-500 ${scrolled ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 -translate-y-2 scale-95'
                        }`}>
                        {title || ''}
                    </span>
                </div>

                <div className="w-10" />
            </div>
        </div>
    );
};