package id.my.fikfikk.figo;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.Context;
import android.content.Intent;
import android.net.Uri;
import android.widget.RemoteViews;

import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.Date;
import java.util.GregorianCalendar;
import java.util.Locale;
import java.util.TimeZone;

public class CalendarWidgetProvider extends AppWidgetProvider {
    private static final String[] PASARAN = {"Legi", "Pahing", "Pon", "Wage", "Kliwon"};

    @Override
    public void onUpdate(Context context, AppWidgetManager manager, int[] widgetIds) {
        for (int widgetId : widgetIds) updateWidget(context, manager, widgetId);
    }

    @Override
    public void onEnabled(Context context) {
        updateAll(context);
    }

    private static void updateAll(Context context) {
        AppWidgetManager manager = AppWidgetManager.getInstance(context);
        int[] ids = manager.getAppWidgetIds(new android.content.ComponentName(context, CalendarWidgetProvider.class));
        for (int id : ids) updateWidget(context, manager, id);
    }

    private static void updateWidget(Context context, AppWidgetManager manager, int widgetId) {
        Locale indonesia = new Locale("id", "ID");
        Calendar today = Calendar.getInstance();
        Date currentDate = today.getTime();
        String day = new SimpleDateFormat("EEEE", indonesia).format(currentDate);
        String dateLabel = new SimpleDateFormat("d MMMM yyyy", indonesia).format(currentDate);
        int year = today.get(Calendar.YEAR);
        int month = today.get(Calendar.MONTH);
        int date = today.get(Calendar.DAY_OF_MONTH);
        Calendar utcDate = new GregorianCalendar(TimeZone.getTimeZone("UTC"));
        utcDate.clear();
        utcDate.set(year, month, date);
        long julianDay = Math.floorDiv(utcDate.getTimeInMillis(), 86400000L) + 2440588L;
        String pasaran = PASARAN[(int) Math.floorMod(julianDay, 5)];

        RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.widget_calendar);
        views.setTextViewText(R.id.widget_day, day.toUpperCase(indonesia));
        views.setTextViewText(R.id.widget_date, dateLabel);
        views.setTextViewText(R.id.widget_pasaran, day + " " + pasaran);

        Intent intent = new Intent(Intent.ACTION_VIEW, Uri.parse("https://go.fikfikk.my.id/kalender/" + year), context, MainActivity.class);
        PendingIntent pendingIntent = PendingIntent.getActivity(context, 0, intent, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
        views.setOnClickPendingIntent(R.id.widget_root, pendingIntent);
        manager.updateAppWidget(widgetId, views);
    }
}
