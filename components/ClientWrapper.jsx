'use client';

import { useEffect, useState, useCallback } from 'react';
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
import ContactModal from '@/components/ContactModal';
import MessageModal from '@/app/messages/MessageModal';
import AppBanner from '@/components/AppBanner';
import CreditModal from '@/components/CreditModal';
import { useUsageLimit } from '@/contexts/useUsageLimit';
import { useLanguage } from '@/contexts/useLanguageContext';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { NativeBridge } from '@/utils/nativeBridge';

export default function ClientWrapper({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, userData, loadingUser, isLoggingIn, cancelLogin, isLoginModalOpen, closeLoginModal, isContactModalOpen, closeContactModal, msgModalData, closeMessageModal } = useAuthContext();
  const { editCount, MAX_EDIT_COUNT, isLocked } = useUsageLimit();
  const { language } = useLanguage();
  const [showCreditModal, setShowCreditModal] = useState(true);

  const isOutOfCredit = isLocked;

  // Call Push Notification Hook
  const onNavigate = useCallback((path) => {
    router.push(path);
  }, [router]);

  usePushNotifications(onNavigate);

  // Initialize Native Bridge elements
  useEffect(() => {
    NativeBridge.setStatusBarOptions(false); // Default to light mode for now
  }, []);

  const [hasCheckedRedirect, setHasCheckedRedirect] = useState(false);

  // Define paths where we should NOT show Navbar/MenuBar/Footer
  const isSpecialPath = specialPaths.some(
    (path) => pathname === path || pathname.startsWith(path + '/')
  );

  // Special logic for Credit page: Hide Navbar (it has its own) but show MenuBar
  const isNoNavbarPath = isSpecialPath || pathname === '/credit' || pathname.startsWith('/credit/') || pathname === '/mypage' || pathname.startsWith('/mypage/') || pathname.startsWith('/admin/');

  // 2. Redirection logic for missing birthDate
  useEffect(() => {
    if (loadingUser) return;

    // List of paths that are exempt from the birthDate redirection
    const exemptPaths = [...specialPaths, '/nobirthday', '/beforelogin', '/login'];
    const isExempt = exemptPaths.some(
      (path) => pathname === path || pathname.startsWith(path + '/')
    );

    let timer;

    if (user && userData && !userData?.birthDate && !isExempt) {
      // 데이터가 실제 없는지 확인하기 위해 아주 짧은 지연 후 리다이렉트 (깜빡임 방지)
      timer = setTimeout(() => {
        // Double check inside timeout
        if (!userData?.birthDate) {
          console.log('Redirecting to nobirthday: User data exists but birthDate is missing.');
          router.push('/nobirthday');
        }
      }, 500);
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [user, userData, loadingUser, pathname, router]);

  // Determine if we need to redirect (to show Splash instead of content)
  const exemptPaths = [...specialPaths, '/nobirthday', '/beforelogin', '/login'];
  const isExempt = exemptPaths.some(
    (path) => pathname === path || pathname.startsWith(path + '/')
  );
  const shouldRedirect = !loadingUser && user && userData && !userData.birthDate && !isExempt;

  // Initial Loading (Splash) OR Pending Redirect
  // Bypass SplashScreen for specialPaths (e.g., ad pages) to prevent infinite loading in in-app browsers
  const isSpecialPathForLoading = isSpecialPath || isExempt;

  if ((loadingUser && !isSpecialPathForLoading) || shouldRedirect) {
    return <SplashScreen />;
  }

  return (
    <>
      {/* Global Login Loading Overlay */}
      {isLoggingIn && <LoginLoadingOverlay onCancel={cancelLogin} />}

      {/* Conditional Navbar */}
      {!isNoNavbarPath && <Navbar />}

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={closeLoginModal}
      />

      <MessageModal
        isOpen={msgModalData.isOpen}
        onClose={closeMessageModal}
        receiverId={msgModalData.receiverId}
        receiverName={msgModalData.receiverName}
        originalMessageId={msgModalData.originalId}
      />

      {isContactModalOpen && (
        <ContactModal
          onClose={closeContactModal}
          email="doobuhanmo3@gmail.com"
        />
      )}


      <main className={!isNoNavbarPath ? "relative min-h-screen pt-[calc(64px+env(safe-area-inset-top))]" : "min-h-screen"}>
        <div className="w-full mb-8 fixed top-16 z-30 ">
          <AppBanner />
        </div>

        <div className="">{children}</div>

      </main>

      {/* Conditional Footer & MenuBar */}
      {!isSpecialPath && (

        <Footer />

      )}
      {!isSpecialPath && (

        <MenuBar />

      )}

      {/* Kakao SDK v1 (for popup login support on Web) */}
      <Script
        src="https://developers.kakao.com/sdk/js/kakao.min.js"
        strategy="afterInteractive"
        onLoad={() => {
          try {
            if (window.Kakao && !window.Kakao.isInitialized()) {
              window.Kakao.init('344188f5340e9fb502efb20389316a7f');
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

      <CreditModal
        isOpen={isOutOfCredit && showCreditModal}
        onClose={() => setShowCreditModal(false)}
        onWatchAd={() => setShowCreditModal(false)}
        language={language}
      />
    </>
  );
}
