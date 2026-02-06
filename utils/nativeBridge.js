import { Share } from '@capacitor/share';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Device } from '@capacitor/device';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Capacitor } from '@capacitor/core';

export const NativeBridge = {
  // 1. Share Image (base64)
  shareImage: async (base64Data, fileName = 'saza-result.png', title = 'Saza Saju Result') => {
    if (!Capacitor.isNativePlatform()) {
      // Fallback for web: download image
      const link = document.createElement('a');
      link.href = base64Data;
      link.download = fileName;
      link.click();
      return;
    }

    try {
      // Write file to cache
      const file = await Filesystem.writeFile({
        path: fileName,
        data: base64Data,
        directory: Directory.Cache,
      });

      // Share
      await Share.share({
        title: title,
        text: 'Check my Saju result from Saza Saju!',
        url: file.uri,
        dialogTitle: 'Share your result',
      });
    } catch (err) {
      console.error('Error sharing image:', err);
    }
  },

  // 2. Adjust Status Bar
  setStatusBarOptions: async (isDark = false) => {
    if (!Capacitor.isNativePlatform()) return;

    try {
      await StatusBar.setStyle({
        style: isDark ? Style.Dark : Style.Light,
      });
      // You can also set background color
      // await StatusBar.setBackgroundColor({ color: '#ffffff' });
    } catch (err) {
      console.error('Error setting status bar:', err);
    }
  },

  // 3. Get Device Information
  getDeviceInfo: async () => {
    if (!Capacitor.isNativePlatform()) {
      return { platform: 'web', model: 'Browser' };
    }
    return await Device.getInfo();
  },

  // 4. Biometric Auth Placeholder
  // (Requires @capacitor-community/native-biometric which had install issues)
  isBiometricAvailable: async () => {
    console.warn('Biometric plugin not installed');
    return false;
  },

  // 5. Kakao Login (Updated for SDK v2)
  kakaoLogin: async () => {
    if (!Capacitor.isNativePlatform()) {
      console.warn('Kakao login only works on native platform');
      return null;
    }

    try {
      // registerPlugin을 통해 직접 플러그인 객체 획득
      const plugin = registerPlugin('CapacitorKakao');

      if (!plugin) {
        throw new Error('Kakao plugin not found');
      }

      // Initialize if needed (check plugin docs, usually automatic via config)
      // await CapacitorKakao.initializeKakao({ appKey: "..." });

      const result = await plugin.kakaoLogin();
      // Result structure depends on plugin, usually returns accessToken
      return result;
    } catch (err) {
      console.error('Kakao login error:', err);
      throw err;
    }
  }
};
