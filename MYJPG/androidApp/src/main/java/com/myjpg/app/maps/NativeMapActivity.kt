package com.myjpg.app.maps

import android.Manifest
import android.annotation.SuppressLint
import android.content.pm.PackageManager
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.material3.MaterialTheme
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.core.content.ContextCompat
import com.google.android.gms.location.FusedLocationProviderClient
import com.google.android.gms.location.LocationServices
import com.google.android.gms.location.Priority
import com.google.android.gms.maps.MapsApiSettings
import com.google.android.gms.maps.model.LatLng
import com.google.android.libraries.places.api.Places
import com.myjpg.app.BuildConfig

class NativeMapActivity : ComponentActivity() {

    companion object {
        const val EXTRA_CENTER_LAT = "extra_center_lat"
        const val EXTRA_CENTER_LNG = "extra_center_lng"
        const val EXTRA_DEST_LAT = "extra_dest_lat"
        const val EXTRA_DEST_LNG = "extra_dest_lng"
        const val EXTRA_DEST_NAME = "extra_dest_name"
        const val EXTRA_INITIAL_QUERY = "extra_initial_query"
        private const val GMP_SOLUTION_CHANNEL = "gmp_mcp_codeassist_v1_aistudio"
    }

    private lateinit var fusedLocationClient: FusedLocationProviderClient

    private var userGpsLocation by mutableStateOf<LatLng?>(null)
    private var hasLocationPermission by mutableStateOf(false)

    private val locationPermissionLauncher = registerForActivityResult(
        ActivityResultContracts.RequestMultiplePermissions()
    ) { permissions ->
        val granted = (permissions[Manifest.permission.ACCESS_FINE_LOCATION] == true) ||
            (permissions[Manifest.permission.ACCESS_COARSE_LOCATION] == true)
        hasLocationPermission = granted
        if (granted) {
            fetchDeviceGps()
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        enableEdgeToEdge()
        super.onCreate(savedInstanceState)

        // Configure Google Maps SDK & Places SDK (New) usage attribution before rendering map
        MapsApiSettings.addInternalUsageAttributionId(this, GMP_SOLUTION_CHANNEL)
        val mapsKey = BuildConfig.MAPS_API_KEY
        if (mapsKey.isNotBlank() && !Places.isInitialized()) {
            Places.initializeWithNewPlacesApiEnabled(applicationContext, mapsKey)
        }
        Places.addInternalUsageAttributionId(GMP_SOLUTION_CHANNEL)

        fusedLocationClient = LocationServices.getFusedLocationProviderClient(this)
        hasLocationPermission = checkLocationPermission()
        if (hasLocationPermission) {
            fetchDeviceGps()
        } else {
            requestLocationPermissions()
        }

        val centerLat = intent.getDoubleExtra(EXTRA_CENTER_LAT, JalpaiguriGeoUtils.JALPAIGURI_CENTER.latitude)
        val centerLng = intent.getDoubleExtra(EXTRA_CENTER_LNG, JalpaiguriGeoUtils.JALPAIGURI_CENTER.longitude)
        val initialCenter = LatLng(centerLat, centerLng)

        val initialDestination = if (intent.hasExtra(EXTRA_DEST_LAT) && intent.hasExtra(EXTRA_DEST_LNG)) {
            MapPlaceItem(
                id = "intent-dest",
                name = intent.getStringExtra(EXTRA_DEST_NAME) ?: "Selected Destination",
                address = "Jalpaiguri, West Bengal",
                category = "Destination",
                latLng = LatLng(
                    intent.getDoubleExtra(EXTRA_DEST_LAT, centerLat),
                    intent.getDoubleExtra(EXTRA_DEST_LNG, centerLng)
                )
            )
        } else {
            null
        }

        val initialQuery = intent.getStringExtra(EXTRA_INITIAL_QUERY)

        setContent {
            MaterialTheme {
                JalpaiguriMapScreen(
                    initialCenter = initialCenter,
                    initialDestination = initialDestination,
                    initialQuery = initialQuery,
                    userGpsLocation = userGpsLocation,
                    hasLocationPermission = hasLocationPermission,
                    onRequestLocationPermission = { requestLocationPermissions() },
                    onRecenterGps = { fetchDeviceGps() },
                    onBack = { finish() }
                )
            }
        }
    }

    private fun checkLocationPermission(): Boolean {
        val fine = ContextCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION) ==
            PackageManager.PERMISSION_GRANTED
        val coarse = ContextCompat.checkSelfPermission(this, Manifest.permission.ACCESS_COARSE_LOCATION) ==
            PackageManager.PERMISSION_GRANTED
        return fine || coarse
    }

    private fun requestLocationPermissions() {
        locationPermissionLauncher.launch(
            arrayOf(
                Manifest.permission.ACCESS_FINE_LOCATION,
                Manifest.permission.ACCESS_COARSE_LOCATION
            )
        )
    }

    @SuppressLint("MissingPermission")
    private fun fetchDeviceGps() {
        if (!checkLocationPermission()) return
        fusedLocationClient.getCurrentLocation(Priority.PRIORITY_HIGH_ACCURACY, null)
            .addOnSuccessListener { loc ->
                if (loc != null) {
                    userGpsLocation = LatLng(loc.latitude, loc.longitude)
                }
            }
    }
}
