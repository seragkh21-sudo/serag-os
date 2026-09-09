package com.serag.os;

import android.app.Activity;
import android.content.Intent;
import android.content.SharedPreferences;
import android.net.Uri;
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
    private static final String PREFS = "serag_widget";
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

        loadFromIntent(getIntent());
    }

    private WebView createWebView(boolean hidden) {
        WebView view = new WebView(this);
        WebSettings settings = view.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setDatabaseEnabled(true);
        settings.setLoadsImagesAutomatically(!hidden);
        settings.setMediaPlaybackRequiresUserGesture(false);
        settings.setUserAgentString(settings.getUserAgentString() + " SeragOS-Android/0.2");

        CookieManager cookies = CookieManager.getInstance();
        cookies.setAcceptCookie(true);
        cookies.setAcceptThirdPartyCookies(view, true);
        return view;
    }

    private void syncWidgetData() {
        if (syncWebView == null) return;
        syncWebView.loadUrl(HOME + "android-sync.html?t=" + System.currentTimeMillis());
    }

    @Override
    protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        setIntent(intent);
        loadFromIntent(intent);
    }

    private void loadFromIntent(Intent intent) {
        String target = HOME;
        Uri data = intent != null ? intent.getData() : null;
        if (data != null && "serag".equals(data.getScheme())) {
            String host = data.getHost() == null ? "" : data.getHost();
            if ("water".equals(host)) {
                String amount = data.getQueryParameter("amount");
                if (!"500".equals(amount)) amount = "250";
                target = HOME + "quick-action.html?action=water&amount=" + amount;
            } else if ("word".equals(host)) {
                target = HOME + "quick-action.html?action=random-word";
            } else if ("today".equals(host)) {
                target = HOME + "quick-action.html?action=today";
            } else if ("assistant".equals(host)) {
                target = HOME + "assistant.html";
            }
        }
        webView.loadUrl(target);
    }

    private class WidgetBridge {
        @JavascriptInterface
        public void syncSnapshot(String json) {
            runOnUiThread(() -> {
                try {
                    JSONObject data = new JSONObject(json);
                    SharedPreferences.Editor editor = getSharedPreferences(PREFS, MODE_PRIVATE).edit();
                    editor.putBoolean("logged_in", data.optBoolean("loggedIn", false));
                    if (data.optBoolean("loggedIn", false)) {
                        editor.putInt("water_today", data.optInt("waterToday", 0));
                        editor.putInt("water_target", data.optInt("waterTarget", 2500));
                        if (data.has("words")) editor.putString("words_json", data.getJSONArray("words").toString());
                        editor.putLong("last_sync", System.currentTimeMillis());
                    }
                    editor.apply();
                    SeragWidgetProvider.refreshAll(MainActivity.this);
                } catch (Exception ignored) { }
            });
        }

        @JavascriptInterface
        public void waterAdded(int amount) {
            runOnUiThread(() -> {
                SharedPreferences prefs = getSharedPreferences(PREFS, MODE_PRIVATE);
                int current = prefs.getInt("water_today", 0);
                prefs.edit().putInt("water_today", current + Math.max(0, amount)).apply();
                SeragWidgetProvider.refreshAll(MainActivity.this);
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
