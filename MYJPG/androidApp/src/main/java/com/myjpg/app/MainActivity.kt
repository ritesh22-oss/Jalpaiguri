package com.myjpg.app

import android.Manifest
import android.annotation.SuppressLint
import android.content.pm.PackageManager
import android.graphics.Color
import android.net.Uri
import android.os.Bundle
import android.os.SystemClock
import android.util.Log
import android.view.ViewGroup
import android.webkit.*
import android.widget.FrameLayout
import androidx.activity.ComponentActivity
import androidx.activity.result.contract.ActivityResultContracts
import androidx.core.content.ContextCompat
import androidx.core.splashscreen.SplashScreen.Companion.installSplashScreen
import androidx.core.view.ViewCompat
import androidx.core.view.WindowCompat
import androidx.core.view.WindowInsetsCompat
import androidx.core.view.WindowInsetsControllerCompat
import androidx.lifecycle.lifecycleScope
import androidx.webkit.WebViewAssetLoader
import com.myjpg.app.auth.GoogleAuthManager
import kotlinx.coroutines.launch
import org.json.JSONObject

class MainActivity : ComponentActivity() {

    private lateinit var webView: WebView
    private lateinit var googleAuthManager: GoogleAuthManager
    private lateinit var webViewAssetLoader: WebViewAssetLoader
    private var filePathCallback: ValueCallback<Array<Uri>>? = null

    @Volatile
    private var webContentReady = false
    private var hasTriedHostedFallback = false

    companion object {
        private const val TAG = "MYJPG_MainActivity"
        // Production web app URL hosted on Vercel or local assets
        const val WEB_APP_URL = "https://jalpaiguri-zxml.vercel.app/"
    }

    // App surface color matching React warm background
    private val appSurfaceColor = Color.parseColor("#FAF8F5")

    private val filePickerLauncher = registerForActivityResult(
        ActivityResultContracts.GetMultipleContents()
    ) { uris ->
        filePathCallback?.onReceiveValue(uris.toTypedArray())
        filePathCallback = null
    }

    private val locationPermissionLauncher = registerForActivityResult(
        ActivityResultContracts.RequestMultiplePermissions()
    ) { permissions ->
        val fineGranted = permissions[Manifest.permission.ACCESS_FINE_LOCATION] ?: false
        val coarseGranted = permissions[Manifest.permission.ACCESS_COARSE_LOCATION] ?: false
        if (fineGranted || coarseGranted) {
            Log.d(TAG, "Location permissions granted for WebView Geolocation")
        }
    }

    @SuppressLint("SetJavaScriptEnabled", "JavascriptInterface")
    override fun onCreate(savedInstanceState: Bundle?) {
        // Keep the branded system splash visible until the React app reports its first paint.
        // Loading the HTML document alone is not enough: its module bundle can still be loading.
        val splashScreen = installSplashScreen()
        splashScreen.setKeepOnScreenCondition { !webContentReady }

        super.onCreate(savedInstanceState)
        configureSystemBars()

        googleAuthManager = GoogleAuthManager(this)
        webViewAssetLoader = WebViewAssetLoader.Builder()
            .addPathHandler("/assets/", WebViewAssetLoader.AssetsPathHandler(this))
            .build()

        // Request Location Permissions at Startup
        requestLocationPermissions()

        webView = WebView(this).apply {
            setBackgroundColor(appSurfaceColor)
            clearCache(true)
            settings.apply {
                javaScriptEnabled = true
                domStorageEnabled = true
                databaseEnabled = true
                allowFileAccess = true
                allowContentAccess = true
                useWideViewPort = true
                loadWithOverviewMode = true
                setSupportZoom(false)
                builtInZoomControls = false
                mediaPlaybackRequiresUserGesture = false
                mixedContentMode = WebSettings.MIXED_CONTENT_ALWAYS_ALLOW
                cacheMode = WebSettings.LOAD_NO_CACHE
                userAgentString = "${settings.userAgentString} MYJPGNativeApp/1.1.0"
            }

            addJavascriptInterface(AndroidGoogleAuthInterface(), "AndroidGoogleAuth")

            webViewClient = object : WebViewClient() {
                override fun shouldInterceptRequest(
                    view: WebView?,
                    request: WebResourceRequest?
                ): WebResourceResponse? {
                    return request?.url?.let(webViewAssetLoader::shouldInterceptRequest)
                }

                @Deprecated("Deprecated in Java")
                override fun shouldInterceptRequest(view: WebView?, url: String?): WebResourceResponse? {
                    return url?.let(Uri::parse)?.let(webViewAssetLoader::shouldInterceptRequest)
                }

                override fun onPageFinished(view: WebView?, url: String?) {
                    super.onPageFinished(view, url)
                    Log.d(TAG, "WebView page loaded: $url")
                    markNativeWebView()
                }

                override fun onReceivedError(view: WebView?, request: WebResourceRequest?, error: WebResourceError?) {
                    super.onReceivedError(view, request, error)
                    Log.e(TAG, "WebView error: ${error?.description}")
                    if (request?.isForMainFrame == true) {
                        loadHostedFallbackOrShowFailure()
                    }
                }
            }

            webChromeClient = object : WebChromeClient() {
                override fun onConsoleMessage(consoleMessage: ConsoleMessage?): Boolean {
                    consoleMessage?.let {
                        Log.e(TAG, "WebView console ${it.messageLevel()}: ${it.message()} (${it.sourceId()}:${it.lineNumber()})")
                    }
                    return super.onConsoleMessage(consoleMessage)
                }

                override fun onGeolocationPermissionsShowPrompt(origin: String?, callback: GeolocationPermissions.Callback?) {
                    callback?.invoke(origin, true, false)
                }

                override fun onShowFileChooser(
                    webView: WebView?,
                    filePathCallback: ValueCallback<Array<Uri>>?,
                    fileChooserParams: FileChooserParams?
                ): Boolean {
                    this@MainActivity.filePathCallback = filePathCallback
                    filePickerLauncher.launch("*/*")
                    return true
                }
            }
        }

        val root = FrameLayout(this).apply {
            setBackgroundColor(appSurfaceColor)
            addView(
                webView,
                FrameLayout.LayoutParams(
                    ViewGroup.LayoutParams.MATCH_PARENT,
                    ViewGroup.LayoutParams.MATCH_PARENT
                )
            )
        }

        setContentView(root)
        applySystemBarInsets(root)

        // Fallback for unexpected WebView or JS loading failure
        root.postDelayed({
            if (!webContentReady) loadHostedFallbackOrShowFailure()
        }, 10_000)

        // Initialize and load bundled web app in background while animation runs
        try {
            val files = assets.list("www")
            if (files != null && files.contains("index.html")) {
                Log.d(TAG, "Loading local web app through WebViewAssetLoader")
                webView.loadUrl("https://appassets.androidplatform.net/assets/www/index.html")
            } else {
                Log.d(TAG, "Loading live web app URL $WEB_APP_URL")
                webView.loadUrl(WEB_APP_URL)
            }
        } catch (e: Exception) {
            Log.d(TAG, "Defaulting to live web app URL $WEB_APP_URL: ${e.message}")
            webView.loadUrl(WEB_APP_URL)
        }
    }

    private fun configureSystemBars() {
        WindowCompat.setDecorFitsSystemWindows(window, false)
        window.decorView.setBackgroundColor(appSurfaceColor)
        window.statusBarColor = Color.TRANSPARENT
        window.navigationBarColor = Color.TRANSPARENT

        WindowInsetsControllerCompat(window, window.decorView).apply {
            isAppearanceLightStatusBars = true
            isAppearanceLightNavigationBars = true
        }
    }

    private fun applySystemBarInsets(root: FrameLayout) {
        ViewCompat.setOnApplyWindowInsetsListener(root) { _, windowInsets ->
            val safeInsets = windowInsets.getInsets(
                WindowInsetsCompat.Type.statusBars() or
                    WindowInsetsCompat.Type.navigationBars() or
                    WindowInsetsCompat.Type.displayCutout()
            )
            val layoutParams = webView.layoutParams as FrameLayout.LayoutParams
            if (
                layoutParams.leftMargin != safeInsets.left ||
                layoutParams.topMargin != safeInsets.top ||
                layoutParams.rightMargin != safeInsets.right ||
                layoutParams.bottomMargin != safeInsets.bottom
            ) {
                layoutParams.setMargins(
                    safeInsets.left,
                    safeInsets.top,
                    safeInsets.right,
                    safeInsets.bottom
                )
                webView.layoutParams = layoutParams
            }
            windowInsets
        }
        root.post { ViewCompat.requestApplyInsets(root) }
    }

    private fun markNativeWebView() {
        if (!::webView.isInitialized) return

        val script = """
            (function () {
              document.documentElement.setAttribute('data-native-app', 'true');
            })();
        """.trimIndent()

        webView.evaluateJavascript(script, null)
    }

    private fun showStartupFailure() {
        if (webContentReady) return
        webContentReady = true
        webView.loadDataWithBaseURL(
            null,
            """
                <!doctype html><html><body style="margin:0;background:#FAF8F5;color:#11241C;font-family:sans-serif;display:grid;min-height:100vh;place-items:center;padding:24px;box-sizing:border-box;text-align:center">
                <main><h1 style="margin:0 0 12px">MYJPG could not start</h1><p style="margin:0 0 20px;line-height:1.5">Please check your connection and reopen the app.</p><button style="border:0;border-radius:12px;background:#007AFF;color:#fff;font-weight:700;padding:12px 18px" onclick="location.reload()">Try again</button></main>
                </body></html>
            """.trimIndent(),
            "text/html",
            "UTF-8",
            null
        )
    }

    private fun loadHostedFallbackOrShowFailure() {
        if (webContentReady) return
        if (hasTriedHostedFallback) {
            showStartupFailure()
            return
        }

        hasTriedHostedFallback = true
        Log.w(TAG, "Bundled web app did not start; loading hosted fallback")
        webView.loadUrl(WEB_APP_URL)
        webView.postDelayed({
            if (!webContentReady) showStartupFailure()
        }, 10_000)
    }

    private fun requestLocationPermissions() {
        if (ContextCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION) != PackageManager.PERMISSION_GRANTED) {
            locationPermissionLauncher.launch(
                arrayOf(
                    Manifest.permission.ACCESS_FINE_LOCATION,
                    Manifest.permission.ACCESS_COARSE_LOCATION
                )
            )
        }
    }

    // Native JavaScript Interface Bridge
    inner class AndroidGoogleAuthInterface {
        @JavascriptInterface
        fun reportWebAppReady() {
            runOnUiThread {
                Log.d(TAG, "React application rendered and reported ready")
                webContentReady = true
            }
        }

        @JavascriptInterface
        fun reportWebAppError(message: String?) {
            Log.e(TAG, "Web application startup error: $message")
            runOnUiThread {
                loadHostedFallbackOrShowFailure()
            }
        }

        @JavascriptInterface
        fun requestGoogleSignIn() {
            Log.d(TAG, "Received JavaScript call: AndroidGoogleAuth.requestGoogleSignIn()")
            lifecycleScope.launch {
                val result = googleAuthManager.signInWithGoogle()
                result.onSuccess { googleIdToken ->
                    runOnUiThread {
                        webView.evaluateJavascript(
                            "if(window.onAndroidGoogleSignInSuccess) window.onAndroidGoogleSignInSuccess(${JSONObject.quote(googleIdToken)});",
                            null
                        )
                    }
                }.onFailure { err ->
                    val errorMsg = err.message ?: "Google Sign-In failed"
                    runOnUiThread {
                        webView.evaluateJavascript(
                            "if(window.onAndroidGoogleSignInError) window.onAndroidGoogleSignInError(${JSONObject.quote(errorMsg)});",
                            null
                        )
                    }
                }
            }
        }

        @JavascriptInterface
        fun getAppVersion(): String = "1.1.0"
    }

    override fun onBackPressed() {
        if (webView.canGoBack()) {
            webView.goBack()
        } else {
            super.onBackPressed()
        }
    }
}
