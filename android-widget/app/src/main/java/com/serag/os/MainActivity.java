package com.serag.os;

import android.app.Activity;
import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.webkit.CookieManager;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

public class MainActivity extends Activity {
    private static final String HOME = "https://serag-os.vercel.app/";
    private WebView webView;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        webView = new WebView(this);
        setContentView(webView);

        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setDatabaseEnabled(true);
        settings.setLoadsImagesAutomatically(true);
        settings.setMediaPlaybackRequiresUserGesture(false);
        settings.setUserAgentString(settings.getUserAgentString() + " SeragOS-Android/0.1");

        CookieManager cookies = CookieManager.getInstance();
        cookies.setAcceptCookie(true);
        cookies.setAcceptThirdPartyCookies(webView, true);

        webView.setWebViewClient(new WebViewClient());
        loadFromIntent(getIntent());
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

    @Override
    @SuppressWarnings("deprecation")
    public void onBackPressed() {
        if (webView != null && webView.canGoBack()) webView.goBack();
        else super.onBackPressed();
    }
}
