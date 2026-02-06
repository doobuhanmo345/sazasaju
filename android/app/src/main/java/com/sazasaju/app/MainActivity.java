package com.sazasaju.app;

import android.os.Bundle;
// 아래 두 줄의 import가 반드시 있어야 에러가 나지 않습니다.
import android.webkit.WebSettings;
import android.webkit.WebView;

import com.getcapacitor.BridgeActivity;
import com.woot.plugins.kakao.CapacitorKakaoPlugin;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // 1. 카카오 플러그인 등록
        registerPlugin(CapacitorKakaoPlugin.class);

        // 2. WebView 설정 로드 (Firebase 인증 및 데이터 연동 필수 설정)
        // super.onCreate 이후에 실행되어야 브릿지가 정상 작동합니다.
        WebView webView = this.getBridge().getWebView();
        WebSettings settings = webView.getSettings();
        
        settings.setDomStorageEnabled(true);       // LocalStorage 활성화
        settings.setJavaScriptEnabled(true);        // 자바스크립트 허용
        settings.setDatabaseEnabled(true);          // 데이터베이스 허용
        
        // 안드로이드 9 이상에서 Mixed Content(HTTP/HTTPS 혼용) 이슈 방지
        settings.setMixedContentMode(WebSettings.MIXED_CONTENT_ALWAYS_ALLOW);
    }
}