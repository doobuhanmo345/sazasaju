import { useEffect, useRef } from 'react';
import { PushNotifications } from '@capacitor/push-notifications';
import { App } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';
import { db, messaging } from '@/lib/firebase';
import { doc, setDoc, arrayUnion } from 'firebase/firestore';
import { useAuthContext } from '@/contexts/useAuthContext';
import { getToken, onMessage } from 'firebase/messaging';

export const usePushNotifications = (onNavigate) => {
  const { user } = useAuthContext();
  const navigateRef = useRef(onNavigate);

  // Keep navigation callback reference stable
  useEffect(() => {
    navigateRef.current = onNavigate;
  }, [onNavigate]);

  useEffect(() => {
    if (!user) return;

    // --- Native Platform Logic ---
    if (Capacitor.isNativePlatform()) {
      // 1. App Url Open (Deep Link)
      const appUrlListener = App.addListener('appUrlOpen', (data) => {
        console.log('✅App opened with URL:', data.url);
        const slug = data.url.split('.com').pop() || data.url.split('://').pop();
        if (slug && navigateRef.current) {
          navigateRef.current(slug);
        }
      });

      // 2. Push Registration
      const registerPush = async () => {
        let permStatus = await PushNotifications.checkPermissions();

        if (permStatus.receive === 'prompt') {
          permStatus = await PushNotifications.requestPermissions();
        }

        if (permStatus.receive !== 'granted') {
          console.warn('Push notification permission not granted');
          return;
        }

        await PushNotifications.register();
      };

      const registrationListener = PushNotifications.addListener('registration', async (token) => {
        console.log('✅Push registration success');
        try {
          await setDoc(
            doc(db, 'users', user.uid),
            {
              fcmTokens: arrayUnion(token.value),
              lastTokenUpdate: new Date().toISOString()
            },
            { merge: true }
          );
        } catch (err) {
          console.error('Error saving FCM token:', err);
        }
      });

      PushNotifications.addListener('registrationError', (error) => {
        console.error('Push registration error');
      });

      // 3. Push Actions (Notification Click)
      const actionListener = PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
        console.log('✅Push action performed');
        const data = notification.notification.data;
        if (data && data.url && navigateRef.current) {
          navigateRef.current(data.url);
        }
      });

      registerPush();

      return () => {
        appUrlListener.remove();
        registrationListener.remove();
        actionListener.remove();
        // Don't remove all listeners to avoid affecting other hooks if any
      };
    }

    // --- Web Platform Logic ---
    const setupWebPush = async () => {
      try {
        const msg = await messaging;
        if (!msg) return;

        // Request permission
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') {
          console.log('✅Web notification permission denied');
          return;
        }

        // Get FCM Token
        // NOTE: You must provide your public VAPID key here
        const token = await getToken(msg, {
          vapidKey: process.env.NEXT_PUBLIC_VAPID_KEY
        });

        if (token) {
          console.log('✅Web FCM Token generated');
          await setDoc(
            doc(db, 'users', user.uid),
            {
              fcmTokens: arrayUnion(token),
              lastTokenUpdate: new Date().toISOString()
            },
            { merge: true }
          );
        }

        // Foreground message handling
        const unsubOnMessage = onMessage(msg, (payload) => {
          console.log('✅Foreground message received:', payload);
          // You could show a custom toast here if desired
          if (payload.notification && window.confirm(`${payload.notification.title}\n${payload.notification.body}\n\n이동하시겠습니까?`)) {
            const url = payload.data?.url || payload.fcmOptions?.link;
            if (url && navigateRef.current) {
              navigateRef.current(url);
            }
          }
        });

        return unsubOnMessage;
      } catch (err) {
        console.error('Error setting up Web Push:', err);
      }
    };

    let webUnsub = null;
    setupWebPush().then(unsub => { webUnsub = unsub; });

    return () => {
      if (webUnsub) webUnsub();
    };

  }, [user?.uid]); // Stability: Only re-run if user identity changes
};
