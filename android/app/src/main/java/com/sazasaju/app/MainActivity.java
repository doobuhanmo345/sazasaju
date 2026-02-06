// MainActivity.java
package com.sazasaju.app;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;
import com.woot.plugins.kakao.CapacitorKakaoPlugin; // 정확한 경로

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        // 여기서 CapacitorKakao라는 이름으로 인식되도록 등록됩니다.
        registerPlugin(CapacitorKakaoPlugin.class); 
    }
}