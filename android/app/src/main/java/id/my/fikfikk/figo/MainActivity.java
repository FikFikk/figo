package id.my.fikfikk.figo;

import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        openFiGoUrl(getIntent());
    }

    @Override
    protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        setIntent(intent);
        openFiGoUrl(intent);
    }

    private void openFiGoUrl(Intent intent) {
        Uri data = intent != null ? intent.getData() : null;
        if (data == null || getBridge() == null || getBridge().getWebView() == null) return;
        if ("go.fikfikk.my.id".equalsIgnoreCase(data.getHost())) {
            getBridge().getWebView().loadUrl(data.toString());
        }
    }
}
