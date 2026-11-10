package com.myjpg.app

import android.Manifest
import android.annotation.SuppressLint
import android.content.pm.PackageManager
import android.graphics.Color
import android.net.Uri
import android.os.Bundle
import android.util.Log
import android.view.ViewGroup
import android.webkit.*
import android.widget.FrameLayout
import android.widget.Toast
import androidx.activity.ComponentActivity
import androidx.activity.result.contract.ActivityResultContracts
import androidx.core.content.ContextCompat
import androidx.core.splashscreen.SplashScreen.Companion.installSplashScreen
import androidx.core.view.ViewCompat
import androidx.core.view.WindowCompat
import androidx.core.view.WindowInsetsCompat
import androidx.core.view.WindowInsetsControllerCompat
import androidx.lifecycle.lifecycleScope
import com.google.firebase.auth.FirebaseAuth
import com.myjpg.app.auth.GoogleAuthManager
import kotlinx.coroutines.launch
import org.json.JSONObject

class MainActivity : ComponentActivity() {

    private lateinit var webView: WebView
    private lateinit var googleAuthManager: GoogleAuthManager
    private var filePathCallback: ValueCallback<Array<Uri>>? = null
    private var webContentReady = false

    companion object {
        private const val TAG = "MYJPG_MainActivity"
        // Production web app URL hosted on Vercel or local assets
        const val WEB_APP_URL = "https://jalpaiguri-zxml.vercel.app/"
    }

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
        // Keep the branded system splash visible only until the first web document is ready.
        // This avoids a blank frame and the previous back-to-back splash sequence.
        val splashScreen = installSplashScreen()
        splashScreen.setKeepOnScreenCondition { !webContentReady }
        super.onCreate(savedInstanceState)

    private val appSurfaceColor = Color.parseColor("#FAF8F5")

    @SuppressLint("SetJavaScriptEnabled", "JavascriptInterface")
    override fun onCreate(savedInstanceState: Bundle?) {
        // Keep the branded system splash visible only until the first web document is ready.
        // This avoids a blank frame and the previous back-to-back splash sequence.
        val splashScreen = installSplashScreen()
        splashScreen.setKeepOnScreenCondition { !webContentReady }
        super.onCreate(savedInstanceState)

        configureSystemBars()

        googleAuthManager = GoogleAuthManager(this)

        // Request Location Permissions at Startup
        requestLocationPermissions()

        webView = WebView(this).apply {
            // Match the MYJPG app background surface color seamlessly
            setBackgroundColor(appSurfaceColor)
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
                userAgentString = "${settings.userAgentString} MYJPGNativeApp/1.0.3"
            }

            // JavaScript Interface for Native Google Sign-In via Credential Manager
            addJavascriptInterface(AndroidGoogleAuthInterface(), "AndroidGoogleAuth")

            webViewClient = object : WebViewClient() {
                override fun onPageFinished(view: WebView?, url: String?) {
                    super.onPageFinished(view, url)
                    Log.d(TAG, "WebView page loaded: $url")
                    webContentReady = true
                    applyHostedLayoutCorrection()
                }

                override fun onReceivedError(view: WebView?, request: WebResourceRequest?, error: WebResourceError?) {
                    super.onReceivedError(view, request, error)
                    Log.e(TAG, "WebView error: ${error?.description}")
                    if (request?.isForMainFrame == true) webContentReady = true
                }
            }

            webChromeClient = object : WebChromeClient() {
                // Geolocation Permission Handler for Maps
                override fun onGeolocationPermissionsShowPrompt(origin: String?, callback: GeolocationPermissions.Callback?) {
                    callback?.invoke(origin, true, false)
                }

                // File Upload Picker Handler for Shops & Profile Photos
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
        // Insets can only be requested after the root has been attached to the window.
        applySystemBarInsets(root)

        // Load Local Asset if available, otherwise load live web app
        try {
            val assetManager = assets
            val files = assetManager.list("www")
            if (files != null && files.contains("index.html")) {
                Log.d(TAG, "Loading local offline web app asset file:///android_asset/www/index.html")
                webView.loadUrl("file:///android_asset/www/index.html")
            } else {
                Log.d(TAG, "Loading live web app URL $WEB_APP_URL")
                webView.loadUrl(WEB_APP_URL)
            }
        } catch (e: Exception) {
            Log.d(TAG, "Defaulting to live web app URL $WEB_APP_URL")
            webView.loadUrl(WEB_APP_URL)
        }
    }

    /**
     * Android 15 enforces edge-to-edge for targetSdk 35. The host draws the app surface color,
     * while the WebView is physically laid out within the safe drawing bounds.
     */
    private fun configureSystemBars() {
        WindowCompat.setDecorFitsSystemWindows(window, false)
        window.decorView.setBackgroundColor(appSurfaceColor)
        window.statusBarColor = appSurfaceColor
        window.navigationBarColor = appSurfaceColor

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
        // A post guarantees that the request is made after setContentView attaches the root.
        root.post { ViewCompat.requestApplyInsets(root) }
    }

    /**
     * The hosted page can be deployed independently of this client. Keep its route container
     * content-sized so a sticky header has a real containing block instead of one viewport.
     */
    private fun applyHostedLayoutCorrection() {
        if (!::webView.isInitialized) return

        val script = """
            (function () {
              document.documentElement.setAttribute('data-native-app', 'true');
              var style = document.getElementById('myjpg-hosted-layout-correction');
              if (!style) {
                style = document.createElement('style');
                style.id = 'myjpg-hosted-layout-correction';
                document.head.appendChild(style);
              }

              style.textContent = '#app-root-scroll > main > div > div {' +
                ' min-height: 100% !important; height: auto !important; }';
            })();
        """.trimIndent()

        webView.evaluateJavascript(script, null)
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
        fun getAppVersion(): String = "1.0.0"
    }

    override fun onBackPressed() {
        if (webView.canGoBack()) {
            webView.goBack()
        } else {
            super.onBackPressed()
        }
    }
}
