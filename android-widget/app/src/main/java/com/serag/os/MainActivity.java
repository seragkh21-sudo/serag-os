package com.serag.os;

import android.app.Activity;
import android.content.SharedPreferences;
import android.os.Bundle;
import android.view.View;
import android.webkit.CookieManager;
import android.webkit.JavascriptInterface;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.FrameLayout;

import org.json.JSONObject;

public class MainActivity extends Activity {
    private static final String HOME = "https://serag-os.vercel.app/";
    private WebView webView;
    private WebView syncWebView;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        FrameLayout root = new FrameLayout(this);
        webView = createWebView(false);
        syncWebView = createWebView(true);
        syncWebView.setVisibility(View.GONE);

        root.addView(webView, new FrameLayout.LayoutParams(
            FrameLayout.LayoutParams.MATCH_PARENT,
            FrameLayout.LayoutParams.MATCH_PARENT
        ));
        root.addView(syncWebView, new FrameLayout.LayoutParams(1, 1));
        setContentView(root);

        WidgetBridge bridge = new WidgetBridge();
        webView.addJavascriptInterface(bridge, "SeragAndroid");
        syncWebView.addJavascriptInterface(bridge, "SeragAndroid");

        webView.setWebViewClient(new WebViewClient() {
            @Override
            public void onPageFinished(WebView view, String url) {
                super.onPageFinished(view, url);
                syncWidgetData();
            }
        });

        webView.loadUrl(HOME);
    }

    private WebView createWebView(boolean hidden) {
        WebView view = new WebView(this);
        WebSettings settings = view.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setDatabaseEnabled(true);
        settings.setLoadsImagesAutomatically(!hidden);
        settings.setMediaPlaybackRequiresUserGesture(false);
        settings.setUserAgentString(settings.getUserAgentString() + " SeragOS-Android/0.3");

        CookieManager cookies = CookieManager.getInstance();
        cookies.setAcceptCookie(true);
        cookies.setAcceptThirdPartyCookies(view, true);
        return view;
    }

    private void syncWidgetData() {
        if (syncWebView == null) return;
        syncWebView.loadUrl(HOME + "android-sync.html?t=" + System.currentTimeMillis());
    }

    private class WidgetBridge {
        @JavascriptInterface
        public void syncSnapshot(String json) {
            runOnUiThread(() -> {
                try {
                    JSONObject data = new JSONObject(json);
                    SharedPreferences.Editor editor = WidgetRepository.prefs(MainActivity.this).edit();
                    boolean loggedIn = data.optBoolean("loggedIn", false);
                    editor.putBoolean("logged_in", loggedIn);
                    if (loggedIn) {
                        editor.putInt("water_today", data.optInt("waterToday", 0));
                        editor.putInt("water_target", data.optInt("waterTarget", 2500));
                        String deviceToken = data.optString("deviceToken", "");
                        if (!deviceToken.isEmpty()) editor.putString("device_token", deviceToken);
                        if (data.has("words")) editor.putString("words_json", data.getJSONArray("words").toString());
                        editor.putLong("last_sync", System.currentTimeMillis());
                    } else {
                        editor.remove("device_token");
                        editor.remove("words_json");
                        editor.putInt("water_today", 0);
                        editor.putInt("word_index", 0);
                    }
                    editor.apply();
                    WaterWidgetProvider.refreshAll(MainActivity.this);
                    WordWidgetProvider.refreshAll(MainActivity.this);
                } catch (Exception ignored) { }
            });
        }
    }

    @Override
    @SuppressWarnings("deprecation")
    public void onBackPressed() {
        if (webView != null && webView.canGoBack()) webView.goBack();
        else super.onBackPressed();
    }

    @Override
    protected void onDestroy() {
        if (webView != null) webView.destroy();
        if (syncWebView != null) syncWebView.destroy();
        super.onDestroy();
    }
}
