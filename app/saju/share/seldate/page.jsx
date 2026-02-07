'use client';

import { Suspense } from 'react';
import SelDateShareTemplate from './SelDateShareTemplate';

export default function SharePage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <SelDateShareTemplate />
        </Suspense>
    );
}
