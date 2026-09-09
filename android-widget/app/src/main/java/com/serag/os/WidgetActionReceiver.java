package com.serag.os;

import android.app.PendingIntent;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;

import org.json.JSONArray;

import java.util.Random;

public class WidgetActionReceiver extends BroadcastReceiver {
    public static final String ACTION_ADD_WATER = "com.serag.os.ADD_WATER";
    public static final String ACTION_NEXT_WORD = "com.serag.os.NEXT_WORD";

    @Override
    public void onReceive(Context context, Intent intent) {
        if (intent == null) return;
        String action = intent.getAction();
        if (ACTION_NEXT_WORD.equals(action)) {
            nextWord(context);
            WordWidgetProvider.refreshAll(context);
            return;
        }
        if (ACTION_ADD_WATER.equals(action)) {
            int amount = intent.getIntExtra("amount", 250);
            if (amount != 500) amount = 250;
            final int safeAmount = amount;
            final PendingResult pending = goAsync();
            final SharedPreferences prefs = WidgetRepository.prefs(context);
            final int before = prefs.getInt("water_today", 0);

            prefs.edit().putInt("water_today", before + safeAmount).apply();
            WaterWidgetProvider.refreshAll(context);

            new Thread(() -> {
                boolean ok = WidgetRepository.addWater(context, safeAmount);
                if (!ok) {
                    int current = prefs.getInt("water_today", before + safeAmount);
                    prefs.edit().putInt("water_today", Math.max(0, current - safeAmount)).apply();
                }
                WaterWidgetProvider.refreshAll(context);
                pending.finish();
            }, "serag-widget-water").start();
        }
    }

    private void nextWord(Context context) {
        SharedPreferences prefs = WidgetRepository.prefs(context);
        try {
            JSONArray words = new JSONArray(prefs.getString("words_json", "[]"));
            int size = words.length();
            if (size <= 0) return;
            int current = Math.floorMod(prefs.getInt("word_index", 0), size);
            int next = size == 1 ? 0 : (current + 1 + new Random().nextInt(size - 1)) % size;
            prefs.edit().putInt("word_index", next).apply();
        } catch (Exception ignored) { }
    }

    public static PendingIntent waterPending(Context context, int amount) {
        Intent intent = new Intent(context, WidgetActionReceiver.class);
        intent.setAction(ACTION_ADD_WATER);
        intent.putExtra("amount", amount);
        return PendingIntent.getBroadcast(
            context,
            amount,
            intent,
            PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );
    }

    public static PendingIntent nextWordPending(Context context) {
        Intent intent = new Intent(context, WidgetActionReceiver.class);
        intent.setAction(ACTION_NEXT_WORD);
        return PendingIntent.getBroadcast(
            context,
            9001,
            intent,
            PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );
    }
}
