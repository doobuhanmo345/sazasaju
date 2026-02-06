package com.sazasaju.app;

import android.app.Application;
import com.woot.plugins.kakao.CapacitorKakaoPlugin;

public class GlobalApplication extends Application {

    @Override
    public void onCreate() {
        super.onCreate();
        // Kakao SDK 초기화
        CapacitorKakaoPlugin.initKakaoSdk(
            this,
            getString(R.string.kakao_app_key)
        );
    }
}
