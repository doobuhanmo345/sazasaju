import { useEffect } from 'react';
import { PushNotifications } from '@capacitor/push-notifications';
import { App } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';
import { db } from '@/lib/firebase';
import { doc, setDoc, arrayUnion } from 'firebase/firestore';
import { useAuthContext } from '@/contexts/useAuthContext';

export const usePushNotifications = (onNavigate) => {
  const { user } = useAuthContext();

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) {
      return;
    }

    // 1. App Url Open (Deep Link / Universal Link)
    App.addListener('appUrlOpen', (data) => {
      console.log('App opened with URL:', data.url);
      // Example: sazasaju://path -> /path
      const slug = data.url.split('.com').pop() || data.url.split('://').pop();
      if (slug && onNavigate) {
        onNavigate(slug);
      }
    });

    if (!user) {
      return;
    }

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

    PushNotifications.addListener('registration', async (token) => {
      console.log('Push registration success, token: ' + token.value);
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
      console.error('Push registration error: ' + JSON.stringify(error));
    });

    // 3. Push Actions (Notification Click)
    PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
      console.log('Push action performed:', notification.notification);
      const data = notification.notification.data;
      if (data && data.url && onNavigate) {
        onNavigate(data.url);
      }
    });

    registerPush();

    return () => {
      PushNotifications.removeAllListeners();
      App.removeAllListeners();
    };
  }, [user, onNavigate]);
};
