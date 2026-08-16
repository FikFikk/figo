# FiGo Android Widget

FiGo tetap menggunakan Nuxt sebagai aplikasi utama. Folder `android/` adalah shell Capacitor dan widget native Android; tidak diperlukan Flutter.

## Persiapan

- Android Studio dengan Android SDK
- JDK 17 atau lebih baru
- `adb` jika ingin memasang APK ke perangkat fisik
- Server FiGo yang dapat diakses melalui HTTPS

`capacitor.config.ts` menunjuk WebView ke `https://go.fikfikk.my.id`, sehingga update Nuxt tetap dikirim melalui deploy web biasa.

## Build APK debug

```bash
pnpm generate
pnpm android:sync
cd android
gradlew.bat assembleDebug
```

APK akan berada di `android/app/build/outputs/apk/debug/app-debug.apk`.

Pasang ke perangkat Android:

```bash
adb install -r android/app/build/outputs/apk/debug/app-debug.apk
```

Atau buka project `android/` melalui Android Studio dan tekan Run.

## Menambahkan widget

1. Pasang aplikasi FiGo Android.
2. Tekan lama area kosong di home screen.
3. Pilih `Widgets`.
4. Cari `FiGo` lalu seret `FiGo Calendar` ke home screen.
5. Ketuk widget untuk membuka kalender FiGo pada tahun berjalan.

Widget menampilkan hari, tanggal Masehi, dan pasaran. Android akan menyegarkan datanya secara berkala.

## Distribusi

Untuk testing, APK debug dapat dibagikan langsung. Untuk publik, buat release keystore, hasilkan AAB release, lalu unggah ke Google Play Console.
