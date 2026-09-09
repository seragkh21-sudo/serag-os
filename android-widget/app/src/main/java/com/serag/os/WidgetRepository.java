package com.serag.os;

import android.content.Context;
import android.content.SharedPreferences;

import org.json.JSONArray;
import org.json.JSONObject;

import java.io.BufferedReader;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;

public final class WidgetRepository {
    public static final String PREFS = "serag_widget";
    private static final String API_URL = "https://kdfbxcdxdhofqidczbot.supabase.co/rest/v1/rpc/";
    private static final String API_KEY = "sb_publishable_51lY0ST_vE6v0nogH5RGkQ_z8lJ5EAM";

    private WidgetRepository() { }

    public static SharedPreferences prefs(Context context) {
        return context.getSharedPreferences(PREFS, Context.MODE_PRIVATE);
    }

    public static boolean isReady(Context context) {
        SharedPreferences p = prefs(context);
        return p.getBoolean("logged_in", false) && !p.getString("device_token", "").isEmpty();
    }

    public static boolean addWater(Context context, int amount) {
        String token = prefs(context).getString("device_token", "");
        if (token.isEmpty()) return false;
        try {
            JSONObject body = new JSONObject();
            body.put("p_token", token);
            body.put("p_amount", amount);
            JSONObject data = rpc("widget_add_water", body);
            if (!data.optBoolean("ok", false)) return false;
            prefs(context).edit()
                .putInt("water_today", data.optInt("waterToday", prefs(context).getInt("water_today", 0)))
                .putInt("water_target", data.optInt("waterTarget", prefs(context).getInt("water_target", 2500)))
                .putLong("last_sync", System.currentTimeMillis())
                .apply();
            return true;
        } catch (Exception ignored) {
            return false;
        }
    }

    public static boolean refreshSnapshot(Context context) {
        String token = prefs(context).getString("device_token", "");
        if (token.isEmpty()) return false;
        try {
            JSONObject body = new JSONObject();
            body.put("p_token", token);
            JSONObject data = rpc("widget_snapshot", body);
            if (!data.optBoolean("ok", false)) return false;
            SharedPreferences.Editor e = prefs(context).edit()
                .putBoolean("logged_in", true)
                .putInt("water_today", data.optInt("waterToday", 0))
                .putInt("water_target", data.optInt("waterTarget", 2500))
                .putLong("last_sync", System.currentTimeMillis());
            JSONArray words = data.optJSONArray("words");
            if (words != null) e.putString("words_json", words.toString());
            e.apply();
            return true;
        } catch (Exception ignored) {
            return false;
        }
    }

    private static JSONObject rpc(String function, JSONObject body) throws Exception {
        HttpURLConnection connection = (HttpURLConnection) new URL(API_URL + function).openConnection();
        connection.setRequestMethod("POST");
        connection.setConnectTimeout(10000);
        connection.setReadTimeout(12000);
        connection.setDoOutput(true);
        connection.setRequestProperty("apikey", API_KEY);
        connection.setRequestProperty("Content-Type", "application/json");
        connection.setRequestProperty("Accept", "application/json");

        byte[] bytes = body.toString().getBytes(StandardCharsets.UTF_8);
        try (OutputStream out = connection.getOutputStream()) {
            out.write(bytes);
        }

        int code = connection.getResponseCode();
        InputStream stream = code >= 200 && code < 300 ? connection.getInputStream() : connection.getErrorStream();
        StringBuilder text = new StringBuilder();
        if (stream != null) {
            try (BufferedReader reader = new BufferedReader(new InputStreamReader(stream, StandardCharsets.UTF_8))) {
                String line;
                while ((line = reader.readLine()) != null) text.append(line);
            }
        }
        connection.disconnect();
        if (code < 200 || code >= 300) throw new Exception("RPC " + code);
        String raw = text.toString().trim();
        return raw.isEmpty() ? new JSONObject() : new JSONObject(raw);
    }
}
