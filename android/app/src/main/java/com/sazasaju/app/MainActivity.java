package com.sazasaju.app;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;
import com.codetrixstudio.capacitor.GoogleAuth.GoogleAuth;
import com.vt.kakao.login.KakaoLogin;
import hanhokim.capacitor.naver.login.CapacitorNaverLoginPlugin;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        registerPlugin(GoogleAuth.class);
        registerPlugin(KakaoLogin.class);
        registerPlugin(CapacitorNaverLoginPlugin.class);
    }
}
