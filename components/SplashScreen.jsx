'use client';

import React from 'react';
import Image from 'next/image';

export default function SplashScreen() {
  return (
    <div className="fixed inset-0 z-[10000] flex flex-col items-center justify-center bg-white dark:bg-slate-950 animate-in fade-in duration-500">
      <div className="relative mb-8 flex justify-center items-center">
        <div className="w-24 h-24 bg-indigo-600 rounded-[2.5rem] flex items-center justify-center shadow-2xl animate-optimize-bounce overflow-visible">
          <Image
            src="/images/splash.webp"
            width={144}
            height={144}
            className="absolute max-w-none object-contain transform"
            alt="splash logo"
            style={{ pointerEvents: 'none' }}
            loading="eager"
          />
        </div>
        {/* Glow Effect */}
        <div className="absolute inset-0 bg-indigo-500/20 blur-3xl rounded-full scale-150 animate-pulse -z-10"></div>
      </div>

      <div className="text-center">
        <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mb-2">
          사자사주
        </h1>
        <div className="w-48 h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mx-auto">
          <div className="h-full bg-indigo-600 animate-loading-bar-fast"></div>
        </div>
        <p className="mt-4 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em]">
          Reading the constellations...
        </p>
      </div>

      <style jsx>{`
        @keyframes optimize-bounce {
          0%, 100% { 
            transform: translateY(0); 
            animation-timing-function: cubic-bezier(0.8, 0, 1, 1);
          }
          50% { 
            transform: translateY(-15%); 
            animation-timing-function: cubic-bezier(0, 0, 0.2, 1);
          }
        }
        .animate-optimize-bounce {
          animation: optimize-bounce 1s infinite;
          will-change: transform;
        }

        @keyframes loading-bar-fast {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-loading-bar-fast {
          width: 100%;
          animation: loading-bar-fast 1.5s infinite linear;
          will-change: transform;
        }
      `}</style>
    </div>
  );
}
