'use client';

import { Suspense } from 'react';
import InterviewShareTemplate from './InterviewShareTemplate';

export default function SharePage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <InterviewShareTemplate />
        </Suspense>
    );
}
