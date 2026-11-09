package com.myjpg.app

import android.Manifest
import android.annotation.SuppressLint
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Bundle
import android.util.Log
import android.webkit.*
import android.widget.Toast
import androidx.activity.ComponentActivity
import androidx.activity.result.contract.ActivityResultContracts
import androidx.core.content.ContextCompat
import androidx.lifecycle.lifecycleScope
import com.google.firebase.auth.FirebaseAuth
import com.myjpg.app.auth.GoogleAuthManager
import kotlinx.coroutines.launch

class MainActivity : ComponentActivity() {

    private lateinit var webView: WebView
    private lateinit var googleAuthManager: GoogleAuthManager
    private var filePathCallback: ValueCallback<Array<Uri>>? = null

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
        super.onCreate(savedInstanceState)

        googleAuthManager = GoogleAuthManager(this)

        // Request Location Permissions at Startup
        requestLocationPermissions()

        webView = WebView(this).apply {
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
                userAgentString = "${settings.userAgentString} MYJPGNativeApp/1.0.0"
            }

            // JavaScript Interface for Native Google Sign-In via Credential Manager
            addJavascriptInterface(AndroidGoogleAuthInterface(), "AndroidGoogleAuth")

            webViewClient = object : WebViewClient() {
                override fun onPageFinished(view: WebView?, url: String?) {
                    super.onPageFinished(view, url)
                    Log.d(TAG, "WebView page loaded: $url")
                }

                override fun onReceivedError(view: WebView?, request: WebResourceRequest?, error: WebResourceError?) {
                    super.onReceivedError(view, request, error)
                    Log.e(TAG, "WebView error: ${error?.description}")
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

        setContentView(webView)

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
                result.onSuccess { authResult ->
                    val user = authResult.user
                    user?.getIdToken(false)?.addOnSuccessListener { tokenResult ->
                        val idToken = tokenResult.token ?: ""
                        runOnUiThread {
                            webView.evaluateJavascript("if(window.onAndroidGoogleSignInSuccess) window.onAndroidGoogleSignInSuccess('$idToken');", null)
                        }
                    }?.addOnFailureListener { e ->
                        runOnUiThread {
                            webView.evaluateJavascript("if(window.onAndroidGoogleSignInError) window.onAndroidGoogleSignInError('${e.message}');", null)
                        }
                    }
                }.onFailure { err ->
                    val errorMsg = err.message ?: "Google Sign-In failed"
                    runOnUiThread {
                        webView.evaluateJavascript("if(window.onAndroidGoogleSignInError) window.onAndroidGoogleSignInError('$errorMsg');", null)
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
