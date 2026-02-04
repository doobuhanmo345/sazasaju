import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.sazasaju.app',
  appName: 'Saza Saju',
  webDir: 'out',
  plugins: {
    GoogleAuth: {
      scopes: ["profile", "email"],
      serverClientId: "680410565024-o2s75du508jtpuqpbh235bdljmbi9m5e.apps.googleusercontent.com",
      forceCodeForRefreshToken: true,
    },
    KakaoLogin: {
      kakaoAppKey: "53e86f26ac229299b6ac49e202e118ee"
    },
    CapacitorNaverLogin: {
      client_id: "YOUR_NAVER_CLIENT_ID",
      client_secret: "YOUR_NAVER_CLIENT_SECRET",
      app_name: "Saza Saju"
    }
  },
};

export default config;
