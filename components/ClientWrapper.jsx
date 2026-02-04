'use client';

import { useEffect, useState } from 'react';
import Script from 'next/script';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthContext } from '@/contexts/useAuthContext';
import { specialPaths } from '@/lib/constants';
import SplashScreen from '@/components/SplashScreen';
import LoginLoadingOverlay from '@/components/LoginLoadingOverlay';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import MenuBar from '@/components/MenuBar';
import LoginModal from '@/components/LoginModal';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { NativeBridge } from '@/utils/nativeBridge';

export default function ClientWrapper({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, userData, loadingUser, isLoggingIn, cancelLogin, isLoginModalOpen, closeLoginModal } = useAuthContext();
  
  // Call Push Notification Hook
  usePushNotifications((path) => {
    router.push(path);
  });

  // Initialize Native Bridge elements
  useEffect(() => {
    NativeBridge.setStatusBarOptions(false); // Default to light mode for now
  }, []);

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

  // Determine if we need to redirect (to show Splash instead of content)
  const exemptPaths = [...specialPaths, '/nobirthday', '/beforelogin', '/login', '/open-in-browser'];
  const isExempt = exemptPaths.some(
    (path) => pathname === path || pathname.startsWith(path + '/')
  );
  const shouldRedirect = !loadingUser && user && userData && !userData.birthDate && !isExempt;

  // Initial Loading (Splash) OR Pending Redirect
  if (loadingUser || shouldRedirect) {
    return <SplashScreen />;
  }

  return (
    <>
      {/* Global Login Loading Overlay */}
      {isLoggingIn && <LoginLoadingOverlay onCancel={cancelLogin} />}

      {/* Conditional Navbar */}
      {!isSpecialPath && <Navbar />}

      <LoginModal 
        isOpen={isLoginModalOpen} 
        onClose={closeLoginModal} 
      />

      <main className={!isSpecialPath ? "min-h-screen" : "min-h-screen"}>
        {children}
      </main>

      {/* Conditional Footer & MenuBar */}
      {!isSpecialPath && (
        <>
          <Footer />
          <MenuBar />
        </>
      )}

      {/* Kakao SDK v1 (for popup login support on Web) */}
      <Script
        src="https://developers.kakao.com/sdk/js/kakao.min.js"
        strategy="afterInteractive"
        onLoad={() => {
          try {
            if (window.Kakao && !window.Kakao.isInitialized()) {
              window.Kakao.init('344188f5340e9fb502efb20389316a7f');
              console.log('Kakao SDK v1 Initialized successfully');
            }
          } catch (e) {
            console.error('Kakao SDK Init Error:', e);
          }
        }}
      />

      {/* Naver SDK */}
      <Script
        src="https://static.nid.naver.com/js/naveridlogin_js_sdk_2.0.2.js"
        strategy="lazyOnload"
      />
    </>
  );
}
