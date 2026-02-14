import Image from 'next/image';

export default function HeroBg() {
    return (
        <div className="absolute inset-0 pointer-events-none select-none overflow-hidden">
            <Image
                src="/images/mypage_hero_bg.png"
                alt="Background"
                fill
                className="object-cover object-center opacity-60 dark:opacity-40"
                priority
            />

            {/* 그라데이션 오버레이 */}
            {/* 1. 전체적인 부드러운 안개 레이어 (경계 제거용) */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-50/40 via-[30%] to-slate-50 to-[90%] dark:via-slate-950/40 dark:to-slate-950" />

            {/* 2. 하단부 묵직한 마감 레이어 (텍스트 가독성용) */}
            <div className="absolute inset-x-0 bottom-0 h-[60%] bg-gradient-to-t from-white/40 via-white/80 to-transparent dark:from-slate-950 dark:via-slate-950/80" />
            {/* Tarot Style Gradient Blobs requested by user */}

        </div>
    );
}