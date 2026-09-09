package com.serag.os;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.net.Uri;
import android.widget.RemoteViews;

import org.json.JSONArray;
import org.json.JSONObject;

import java.util.Random;

public class SeragWidgetProvider extends AppWidgetProvider {
    private static final String PREFS = "serag_widget";
    private static final String ACTION_NEXT_WORD = "com.serag.os.NEXT_WORD";

    @Override
    public void onUpdate(Context context, AppWidgetManager manager, int[] appWidgetIds) {
        for (int appWidgetId : appWidgetIds) render(context, manager, appWidgetId);
    }

    @Override
    public void onReceive(Context context, Intent intent) {
        super.onReceive(context, intent);
        if (ACTION_NEXT_WORD.equals(intent.getAction())) {
            SharedPreferences prefs = context.getSharedPreferences(PREFS, Context.MODE_PRIVATE);
            try {
                JSONArray words = new JSONArray(prefs.getString("words_json", "[]"));
                int size = words.length();
                if (size > 0) {
                    int current = prefs.getInt("word_index", 0);
                    int next = size == 1 ? 0 : (current + 1 + new Random().nextInt(size - 1)) % size;
                    prefs.edit().putInt("word_index", next).apply();
                }
            } catch (Exception ignored) { }
            refreshAll(context);
        }
    }

    public static void refreshAll(Context context) {
        AppWidgetManager manager = AppWidgetManager.getInstance(context);
        ComponentName component = new ComponentName(context, SeragWidgetProvider.class);
        int[] ids = manager.getAppWidgetIds(component);
        SeragWidgetProvider provider = new SeragWidgetProvider();
        for (int id : ids) provider.render(context, manager, id);
    }

    private void render(Context context, AppWidgetManager manager, int appWidgetId) {
        SharedPreferences prefs = context.getSharedPreferences(PREFS, Context.MODE_PRIVATE);
        RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.widget_serag);

        boolean loggedIn = prefs.getBoolean("logged_in", false);
        int today = prefs.getInt("water_today", 0);
        int target = prefs.getInt("water_target", 2500);
        if (loggedIn) views.setTextViewText(R.id.water_progress, "💧 " + today + " / " + target + " ml اليوم");
        else views.setTextViewText(R.id.water_progress, "💧 افتح Serag OS مرة للمزامنة");

        String word = "Open Serag OS";
        String meaning = "علشان نسحب كلماتك المحفوظة";
        try {
            JSONArray words = new JSONArray(prefs.getString("words_json", "[]"));
            if (words.length() > 0) {
                int index = Math.floorMod(prefs.getInt("word_index", 0), words.length());
                JSONObject item = words.getJSONObject(index);
                word = item.optString("word", word);
                meaning = item.optString("meaning", "");
            }
        } catch (Exception ignored) { }
        views.setTextViewText(R.id.word_text, word);
        views.setTextViewText(R.id.word_meaning, meaning);

        views.setOnClickPendingIntent(R.id.add_250, activityPending(context, "serag://water?amount=250", 250));
        views.setOnClickPendingIntent(R.id.add_500, activityPending(context, "serag://water?amount=500", 500));
        views.setOnClickPendingIntent(R.id.open_voice, activityPending(context, "serag://assistant", 1002));
        views.setOnClickPendingIntent(R.id.next_word, nextWordPending(context));
        manager.updateAppWidget(appWidgetId, views);
    }

    private PendingIntent activityPending(Context context, String uri, int requestCode) {
        Intent intent = new Intent(context, MainActivity.class);
        intent.setAction(Intent.ACTION_VIEW);
        intent.setData(Uri.parse(uri));
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
        return PendingIntent.getActivity(
            context,
            requestCode,
            intent,
            PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );
    }

    private PendingIntent nextWordPending(Context context) {
        Intent intent = new Intent(context, SeragWidgetProvider.class);
        intent.setAction(ACTION_NEXT_WORD);
        return PendingIntent.getBroadcast(
            context,
            2001,
            intent,
            PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );
    }
}
