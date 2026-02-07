'use client';

import { Suspense } from 'react';
import DateShareTemplate from './DateShareTemplate';

export default function SharePage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <DateShareTemplate />
        </Suspense>
    );
}
