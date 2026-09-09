package com.serag.os;

import android.app.Activity;
import android.content.SharedPreferences;
import android.os.Bundle;
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

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        FrameLayout root = new FrameLayout(this);
        webView = createWebView();
        root.addView(webView, new FrameLayout.LayoutParams(
            FrameLayout.LayoutParams.MATCH_PARENT,
            FrameLayout.LayoutParams.MATCH_PARENT
        ));
        setContentView(root);

        webView.addJavascriptInterface(new WidgetBridge(), "SeragAndroid");
        webView.setWebViewClient(new WebViewClient() {
            @Override
            public void onPageFinished(WebView view, String url) {
                super.onPageFinished(view, url);
                ensureWidgetSyncFrame(false);
            }
        });

        webView.loadUrl(HOME);
    }

    private WebView createWebView() {
        WebView view = new WebView(this);
        WebSettings settings = view.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setDatabaseEnabled(true);
        settings.setLoadsImagesAutomatically(true);
        settings.setMediaPlaybackRequiresUserGesture(false);
        settings.setUserAgentString(settings.getUserAgentString() + " SeragOS-Android/0.3.1");

        CookieManager cookies = CookieManager.getInstance();
        cookies.setAcceptCookie(true);
        cookies.setAcceptThirdPartyCookies(view, true);
        return view;
    }

    private void ensureWidgetSyncFrame(boolean forceReload) {
        if (webView == null) return;
        String syncUrl = HOME + "android-sync.html?t=" + System.currentTimeMillis();
        String quotedUrl = JSONObject.quote(syncUrl);
        String js = "(function(){try{" +
            "var id='__serag_widget_sync_frame';" +
            "var f=document.getElementById(id);" +
            "if(!f){" +
                "f=document.createElement('iframe');" +
                "f.id=id;" +
                "f.setAttribute('aria-hidden','true');" +
                "f.style.cssText='display:none!important;width:0;height:0;border:0';" +
                "f.src=" + quotedUrl + ";" +
                "(document.body||document.documentElement).appendChild(f);" +
            "}else if(" + forceReload + "){f.src=" + quotedUrl + ";}" +
        "}catch(e){}})();";
        webView.evaluateJavascript(js, null);
    }

    private class WidgetBridge {
        @JavascriptInterface
        public void requestWidgetSync() {
            runOnUiThread(() -> ensureWidgetSyncFrame(true));
        }

        @JavascriptInterface
        public void syncSnapshot(String json) {
            runOnUiThread(() -> {
                try {
                    JSONObject data = new JSONObject(json);
                    SharedPreferences.Editor editor = WidgetRepository.prefs(MainActivity.this).edit();

                    if (data.has("error")) {
                        editor.putString("last_sync_error", data.optString("error", "sync error"));
                        editor.apply();
                        return;
                    }

                    editor.remove("last_sync_error");
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
    protected void onResume() {
        super.onResume();
        if (webView != null) {
            webView.postDelayed(() -> ensureWidgetSyncFrame(true), 700);
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
        super.onDestroy();
    }
}
