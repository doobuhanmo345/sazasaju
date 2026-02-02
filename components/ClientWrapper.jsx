'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthContext } from '@/contexts/useAuthContext';
import { specialPaths } from '@/lib/constants';
import SplashScreen from '@/components/SplashScreen';
import LoginLoadingOverlay from '@/components/LoginLoadingOverlay';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import MenuBar from '@/components/MenuBar';

export default function ClientWrapper({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, userData, loadingUser, isLoggingIn, cancelLogin } = useAuthContext();
  const [hasCheckedRedirect, setHasCheckedRedirect] = useState(false);

  // Define paths where we should NOT show Navbar/MenuBar/Footer
  const isSpecialPath = specialPaths.some(
    (path) => pathname === path || pathname.startsWith(path + '/')
  );

  // 1. In-App Browser Detection & Redirection
  useEffect(() => {
    const userAgent = navigator.userAgent.toLowerCase();
    const urlParams = new URLSearchParams(window.location.search);
    const isTestMode = urlParams.get('test_inapp') === 'true';

    const isInApp =
      isTestMode ||
      userAgent.includes('kakaotalk') ||
      userAgent.includes('instagram') ||
      userAgent.includes('naver') ||
      userAgent.includes('fb') || // Facebook
      userAgent.includes('line');

    const isAlreadyOnGuide = pathname.startsWith('/open-in-browser');
    
    if (isInApp && !isAlreadyOnGuide) {
      router.push('/open-in-browser');
    }
  }, [pathname, router]);

  // 2. Redirection logic for missing birthDate
  useEffect(() => {
    if (loadingUser) return;

    // List of paths that are exempt from the birthDate redirection
    const exemptPaths = [...specialPaths, '/nobirthday', '/beforelogin', '/login', '/open-in-browser'];
    const isExempt = exemptPaths.some(
      (path) => pathname === path || pathname.startsWith(path + '/')
    );

    if (user && userData && !userData.birthDate && !isExempt) {
      router.push('/nobirthday');
    }
  }, [user, userData, loadingUser, pathname, router]);

  // Initial Loading (Splash)
  if (loadingUser) {
    return <SplashScreen />;
  }

  return (
    <>
      {/* Global Login Loading Overlay */}
      {isLoggingIn && <LoginLoadingOverlay onCancel={cancelLogin} />}

      {/* Conditional Navbar */}
      {!isSpecialPath && <Navbar />}

      <main className={!isSpecialPath ? "min-h-screen pt-4" : "min-h-screen"}>
        {children}
      </main>

      {/* Conditional Footer & MenuBar */}
      {!isSpecialPath && (
        <>
          <Footer />
          <MenuBar />
        </>
      )}
    </>
  );
}
