package com.serag.os;

import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.ComponentName;
import android.content.Context;
import android.content.SharedPreferences;
import android.widget.RemoteViews;

import java.util.Locale;

public class WaterWidgetProvider extends AppWidgetProvider {
    @Override
    public void onUpdate(Context context, AppWidgetManager manager, int[] appWidgetIds) {
        for (int id : appWidgetIds) render(context, manager, id);
    }

    public static void refreshAll(Context context) {
        AppWidgetManager manager = AppWidgetManager.getInstance(context);
        ComponentName component = new ComponentName(context, WaterWidgetProvider.class);
        for (int id : manager.getAppWidgetIds(component)) render(context, manager, id);
    }

    private static void render(Context context, AppWidgetManager manager, int appWidgetId) {
        SharedPreferences prefs = WidgetRepository.prefs(context);
        RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.widget_water);
        boolean ready = WidgetRepository.isReady(context);
        int today = Math.max(0, prefs.getInt("water_today", 0));
        int target = Math.max(1, prefs.getInt("water_target", 2500));
        int percent = Math.min(100, Math.round((today * 100f) / target));

        views.setTextViewText(R.id.water_amount, formatLiters(today));
        views.setTextViewText(R.id.water_target, "/ " + formatLiters(target));
        views.setTextViewText(R.id.water_percent, percent + "%");
        views.setProgressBar(R.id.water_bar, 100, percent, false);
        views.setTextViewText(R.id.water_caption, ready ? "Hydration" : "افتح Serag OS مرة للمزامنة");
        views.setOnClickPendingIntent(R.id.water_add_250, WidgetActionReceiver.waterPending(context, 250));
        views.setOnClickPendingIntent(R.id.water_add_500, WidgetActionReceiver.waterPending(context, 500));
        manager.updateAppWidget(appWidgetId, views);
    }

    private static String formatLiters(int ml) {
        if (ml < 1000) return ml + " ml";
        double liters = ml / 1000.0;
        if (ml % 1000 == 0) return String.format(Locale.US, "%.0f L", liters);
        if (ml % 100 == 0) return String.format(Locale.US, "%.1f L", liters);
        return String.format(Locale.US, "%.2f L", liters);
    }
}
