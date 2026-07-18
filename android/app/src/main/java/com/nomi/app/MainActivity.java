package com.nomi.app;

import android.os.Bundle;
import android.util.Log;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    private static final String TAG = "NomiAndroidMainActivity";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        Log.d(TAG, "[ANDROID MAIN] onCreate started...");
        try {
            Log.d(TAG, "[ANDROID MAIN] Installing core splashscreen...");
            androidx.core.splashscreen.SplashScreen.installSplashScreen(this);
            Log.d(TAG, "[ANDROID MAIN] Core splashscreen installed successfully.");
        } catch (Exception e) {
            Log.e(TAG, "[ANDROID MAIN] Failed to install splashscreen", e);
        }

        Log.d(TAG, "[ANDROID MAIN] Calling super.onCreate()...");
        try {
            super.onCreate(savedInstanceState);
            Log.d(TAG, "[ANDROID MAIN] super.onCreate() completed successfully.");
        } catch (Exception e) {
            Log.e(TAG, "[ANDROID MAIN] super.onCreate() failed with exception!", e);
        }
    }

    @Override
    public void onStart() {
        Log.d(TAG, "[ANDROID MAIN] onStart called.");
        super.onStart();
    }

    @Override
    public void onResume() {
        Log.d(TAG, "[ANDROID MAIN] onResume called.");
        super.onResume();
    }
}
