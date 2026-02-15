'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import MaintenancePage from './MaintenancePage';
import { useAuthContext } from '@/contexts/useAuthContext';

export default function MaintenanceGate({ children }) {
    const [isMaintenanceMode, setIsMaintenanceMode] = useState(false);
    const [maintenanceInfo, setMaintenanceInfo] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const pathname = usePathname();
    const { userData, user } = useAuthContext();

    useEffect(() => {
        // Listen to real-time updates of the maintenance setting
        const unsub = onSnapshot(doc(db, 'settings', 'general'), (docSnap) => {
            setIsLoading(false);
            if (docSnap.exists()) {
                const data = docSnap.data();
                setIsMaintenanceMode(data.maintenanceMode || false);
                setMaintenanceInfo({
                    period: data.maintenancePeriod || '',
                    messageKo: data.maintenanceMessageKo || '',
                    messageEn: data.maintenanceMessageEn || ''
                });
            } else {
                setIsMaintenanceMode(false);
                setMaintenanceInfo({});
            }
        }, (error) => {
            console.error("Maintenance check failed:", error);
            setIsLoading(false);
        });

        return () => unsub();
    }, []);

    // 1. Loading state can show content or a spinner. 
    // Showing content prevents flicker if maintenance is off (default).
    // But if maintenance IS on, it might flash content briefly. 
    // Given high availability priority, we default to showing nothing or a spinner if we suspect maintenance?
    // Let's just render children while loading to optimize for uptime, 
    // or use a very lightweight spinner if 'isMaintenanceMode' is critical.
    // For now, we wait for the first snapshot (it's fast).

    if (isLoading) return null; // Or a global loading spinner

    // 2. Define Exemptions
    // - Admin routes: Always allowed so admins can turn it off
    // - Login/Auth routes: Allowed so admins can log in
    const isExemptRoute =
        pathname?.startsWith('/admin') ||
        pathname?.startsWith('/login') ||
        pathname?.startsWith('/credit'); // Maybe allow credit/payment callbacks? No, block them.

    // - Admin Users: If logged in as admin, they bypass maintenance on ALL pages
    const isAdminUser = userData?.role === 'admin' || userData?.role === 'super_admin';

    if (isMaintenanceMode && !isExemptRoute && !isAdminUser) {
        return <MaintenancePage settings={maintenanceInfo} />;
    }

    return <>{children}</>;
}
