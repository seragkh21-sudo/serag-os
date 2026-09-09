package com.serag.os;

import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.ComponentName;
import android.content.Context;
import android.content.SharedPreferences;
import android.widget.RemoteViews;

import org.json.JSONArray;
import org.json.JSONObject;

public class WordWidgetProvider extends AppWidgetProvider {
    @Override
    public void onUpdate(Context context, AppWidgetManager manager, int[] appWidgetIds) {
        for (int id : appWidgetIds) render(context, manager, id);
    }

    public static void refreshAll(Context context) {
        AppWidgetManager manager = AppWidgetManager.getInstance(context);
        ComponentName component = new ComponentName(context, WordWidgetProvider.class);
        for (int id : manager.getAppWidgetIds(component)) render(context, manager, id);
    }

    private static void render(Context context, AppWidgetManager manager, int appWidgetId) {
        SharedPreferences prefs = WidgetRepository.prefs(context);
        RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.widget_word);

        String word = "Open Serag OS";
        String meaning = "افتح التطبيق مرة واحدة للمزامنة";
        String example = "";
        try {
            JSONArray words = new JSONArray(prefs.getString("words_json", "[]"));
            if (words.length() > 0) {
                int index = Math.floorMod(prefs.getInt("word_index", 0), words.length());
                JSONObject item = words.getJSONObject(index);
                word = item.optString("word", word);
                meaning = item.optString("meaning", meaning);
                example = item.optString("example", "");
            }
        } catch (Exception ignored) { }

        views.setTextViewText(R.id.word_title, word);
        views.setTextViewText(R.id.word_meaning, meaning);
        views.setTextViewText(R.id.word_example, example.isEmpty() ? "A new word at your fingertips." : example);
        views.setOnClickPendingIntent(R.id.word_next, WidgetActionReceiver.nextWordPending(context));
        manager.updateAppWidget(appWidgetId, views);
    }
}
