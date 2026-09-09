package com.serag.os;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.Context;
import android.content.Intent;
import android.net.Uri;
import android.widget.RemoteViews;

public class SeragWidgetProvider extends AppWidgetProvider {
    @Override
    public void onUpdate(Context context, AppWidgetManager manager, int[] appWidgetIds) {
        for (int appWidgetId : appWidgetIds) {
            RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.widget_serag);
            views.setOnClickPendingIntent(R.id.add_250, pending(context, "serag://water?amount=250", 250));
            views.setOnClickPendingIntent(R.id.add_500, pending(context, "serag://water?amount=500", 500));
            views.setOnClickPendingIntent(R.id.random_word, pending(context, "serag://word", 1001));
            views.setOnClickPendingIntent(R.id.open_voice, pending(context, "serag://assistant", 1002));
            manager.updateAppWidget(appWidgetId, views);
        }
    }

    private PendingIntent pending(Context context, String uri, int requestCode) {
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
}
