'use client';

import { Suspense } from 'react';
import SelBirthShareTemplate from './SelBirthShareTemplate';

export default function SharePage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <SelBirthShareTemplate />
        </Suspense>
    );
}
