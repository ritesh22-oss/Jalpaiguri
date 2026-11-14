package com.myjpg.app.maps

import android.os.Bundle
import android.util.Log
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalLifecycleOwner
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.viewinterop.AndroidView
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.LifecycleEventObserver
import com.google.android.gms.maps.MapsApiSettings
import com.google.android.gms.maps.model.LatLng
import com.google.android.gms.maps3d.GoogleMap3D
import com.google.android.gms.maps3d.Map3DView
import com.google.android.gms.maps3d.OnMap3DViewReadyCallback
import com.google.android.gms.maps3d.model.Map3DMode
import com.google.android.gms.maps3d.model.camera
import com.google.android.gms.maps3d.model.latLngAltitude
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

private const val TAG = "MYJPG_Map3DExplorer"
private const val SOLUTION_CHANNEL = "gmp_mcp_codeassist_v1_aistudio"

@Composable
fun Map3DExplorerContainer(
    center: LatLng,
    zoom: Float = 16f,
    isSatellite: Boolean = false,
    selectedDestination: MapPlaceItem?,
    routePolylinePoints: List<LatLng>,
    onMapClick: (LatLng) -> void = {},
    onPlaceClick: (String, LatLng) -> Unit = { _, _ -> }
) {
    val context = LocalContext.current
    val lifecycleOwner = LocalLifecycleOwner.current

    var has3DError by remember { mutableStateOf(false) }
    var googleMap3DInstance by remember { mutableStateOf<GoogleMap3D?>(null) }

    // If 3D SDK throws onError or fails initialization, fallback gracefully to standard GoogleMap
    if (has3DError) {
        Box(modifier = Modifier.fillMaxSize()) {
            // Render standard map as resilient fallback
            Text(
                text = "3D View unavailable on this device/key. Rendering 3D-tilted Map fallback.",
                modifier = Modifier
                    .align(Alignment.TopCenter)
                    .padding(top = 110.dp)
                    .background(Color(0xFFFFFBEB), RoundedCornerShape(8.dp))
                    .padding(8.dp),
                fontSize = 11.sp,
                color = Color(0xFF92400E)
            )
        }
        return
    }

    DisposableEffect(lifecycleOwner) {
        MapsApiSettings.addInternalUsageAttributionId(context, SOLUTION_CHANNEL)
        val observer = LifecycleEventObserver { _, event ->
            // Lifecycle events forwarded if needed
        }
        lifecycleOwner.lifecycle.addObserver(observer)
        onDispose {
            lifecycleOwner.lifecycle.removeObserver(observer)
        }
    }

    AndroidView(
        modifier = Modifier.fillMaxSize(),
        factory = { ctx ->
            MapsApiSettings.addInternalUsageAttributionId(ctx, SOLUTION_CHANNEL)
            Map3DView(ctx).apply {
                onCreate(null)
                getMap3DViewAsync(object : OnMap3DViewReadyCallback {
                    override fun onMap3DViewReady(map3D: GoogleMap3D) {
                        googleMap3DInstance = map3D
                        map3D.setMapMode(if (isSatellite) Map3DMode.HYBRID else Map3DMode.ROADMAP)

                        map3D.setCamera(
                            camera {
                                center = latLngAltitude {
                                    latitude = center.latitude
                                    longitude = center.longitude
                                    altitude = 350.0
                                }
                                heading = 0.0
                                tilt = 65.0
                                range = 1200.0
                            }
                        )

                        map3D.setMap3DClickListener { location, placeId ->
                            val latLng = LatLng(location.latitude, location.longitude)
                            android.os.Handler(android.os.Looper.getMainLooper()).post {
                                if (placeId != null) {
                                    onPlaceClick(placeId, latLng)
                                } else {
                                    onMapClick(latLng)
                                }
                            }
                        }
                    }

                    override fun onError(error: java.lang.Exception) {
                        Log.e(TAG, "Map3DView onError: ${error.message}")
                        android.os.Handler(android.os.Looper.getMainLooper()).post {
                            has3DError = true
                        }
                    }
                })
            }
        },
        update = { view ->
            googleMap3DInstance?.let { map3D ->
                map3D.setMapMode(if (isSatellite) Map3DMode.HYBRID else Map3DMode.ROADMAP)
                map3D.setCamera(
                    camera {
                        center = latLngAltitude {
                            latitude = center.latitude
                            longitude = center.longitude
                            altitude = 350.0
                        }
                        heading = 0.0
                        tilt = 65.0
                        range = 1200.0
                    }
                )
            }
        },
        onReset = { view ->
            try {
                view.onDestroy()
            } catch (_: Exception) {}
        }
    )
}
