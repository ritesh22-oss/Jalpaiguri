# Keep WebView JavaScript Interface bridge intact in release builds
-keepclassmembers class com.myjpg.app.MainActivity$AndroidGoogleAuthInterface {
    @android.webkit.JavascriptInterface <methods>;
}

# Keep native Maps Compose & Routes models
-keep class com.myjpg.app.maps.** { *; }
