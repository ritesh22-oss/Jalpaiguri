package com.myjpg.app.maps

import android.os.Bundle
import android.util.Log
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalLifecycleOwner
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.viewinterop.AndroidView
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.LifecycleEventObserver
import com.google.android.gms.maps.MapsApiSettings
import com.google.android.gms.maps.OnStreetViewPanoramaReadyCallback
import com.google.android.gms.maps.StreetViewPanorama
import com.google.android.gms.maps.StreetViewPanoramaView
import com.google.android.gms.maps.model.LatLng
import com.google.android.gms.maps.model.StreetViewSource
import com.google.maps.android.compose.GoogleMap
import com.google.maps.android.compose.MapProperties
import com.google.maps.android.compose.MapUiSettings
import com.google.maps.android.compose.Marker
import com.google.maps.android.compose.MarkerState
import com.google.maps.android.compose.rememberCameraPositionState
import com.google.android.gms.maps.model.CameraPosition

private const val TAG = "MYJPG_StreetExplorer"
private const val SOLUTION_CHANNEL = "gmp_mcp_codeassist_v1_aistudio"

@Composable
fun StreetExplorerOverlay(
    targetLatLng: LatLng,
    placeName: String,
    address: String,
    journeyStops: List<JourneyPreviewStop> = emptyList(),
    onClose: () -> Unit
) {
    val context = LocalContext.current
    val lifecycleOwner = LocalLifecycleOwner.current

    var panoramaViewRef by remember { mutableStateOf<StreetViewPanoramaView?>(null) }
    var activePanorama by remember { mutableStateOf<StreetViewPanorama?>(null) }
    var currentPanoramaLatLng by remember { mutableStateOf(targetLatLng) }
    var isCoverageAvailable by remember { mutableStateOf<Boolean?>(null) }
    var currentHeading by remember { mutableStateOf(0f) }
    var currentPitch by remember { mutableStateOf(0f) }
    var selectedStopIndex by remember { mutableStateOf(0) }

    DisposableEffect(lifecycleOwner) {
        MapsApiSettings.addInternalUsageAttributionId(context, SOLUTION_CHANNEL)
        val observer = LifecycleEventObserver { _, event ->
            when (event) {
                Lifecycle.Event.ON_RESUME -> panoramaViewRef?.onResume()
                Lifecycle.Event.ON_PAUSE -> panoramaViewRef?.onPause()
                Lifecycle.Event.ON_DESTROY -> panoramaViewRef?.onDestroy()
                else -> {}
            }
        }
        lifecycleOwner.lifecycle.addObserver(observer)
        onDispose {
            lifecycleOwner.lifecycle.removeObserver(observer)
            try {
                panoramaViewRef?.onDestroy()
            } catch (_: Exception) {}
        }
    }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(Color.Black)
    ) {
        // Native StreetViewPanoramaView Android Component
        AndroidView(
            modifier = Modifier.fillMaxSize(),
            factory = { ctx ->
                MapsApiSettings.addInternalUsageAttributionId(ctx, SOLUTION_CHANNEL)
                StreetViewPanoramaView(ctx).apply {
                    onCreate(null)
                    panoramaViewRef = this
                    getStreetViewPanoramaAsync(object : OnStreetViewPanoramaReadyCallback {
                        onStreetViewPanoramaReady(panorama: StreetViewPanorama) {
                            activePanorama = panorama
                            panorama.isUserNavigationEnabled = true
                            panorama.isPanningGesturesEnabled = true
                            panorama.isZoomGesturesEnabled = true
                            panorama.isStreetNamesEnabled = true

                            // Try outdoor source first within 100m radius
                            panorama.setPosition(targetLatLng, 100, StreetViewSource.OUTDOOR)

                            panorama.setOnStreetViewPanoramaChangeListener { location ->
                                if (location != null && location.panoId != null) {
                                    isCoverageAvailable = true
                                    currentPanoramaLatLng = LatLng(
                                        location.position.latitude,
                                        location.position.longitude
                                    )
                                } else {
                                    // Fallback to default source
                                    panorama.setPosition(targetLatLng, 200, StreetViewSource.DEFAULT)
                                    // If still null after check, mark unavailable
                                    if (location == null) {
                                        isCoverageAvailable = false
                                    }
                                }
                            }
                        }
                    })
                }
            },
            update = { view ->
                // Handle dynamic jump if user selected a different journey stop
                if (journeyStops.isNotEmpty() && selectedStopIndex < journeyStops.size) {
                    val stop = journeyStops[selectedStopIndex]
                    val stopLatLng = LatLng(stop.lat, stop.lng)
                    activePanorama?.setPosition(stopLatLng, 100, StreetViewSource.OUTDOOR)
                    currentPanoramaLatLng = stopLatLng
                }
            }
        )

        // Top Header & Place Info Card
        Column(
            modifier = Modifier
                .align(Alignment.TopCenter)
                .fillMaxWidth()
                .statusBarsPadding()
                .padding(12.dp),
            verticalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            Surface(
                shape = RoundedCornerShape(18.dp),
                color = Color.White.copy(alpha = 0.95f),
                shadowElevation = 8.dp
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(12.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(10.dp),
                        modifier = Modifier.weight(1f)
                    ) {
                        IconButton(
                            onClick = onClose,
                            modifier = Modifier
                                .size(36.dp)
                                .background(Color(0xFFEFF6FF), CircleShape)
                        ) {
                            Icon(
                                imageVector = Icons.AutoMirrored.Filled.ArrowBack,
                                contentDescription = "Back to Map",
                                tint = Color(0xFF007AFF)
                            )
                        }

                        Column(verticalArrangement = Arrangement.spacedBy(2.dp)) {
                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.spacedBy(6.dp)
                            ) {
                                Surface(
                                    shape = RoundedCornerShape(4.dp),
                                    color = Color(0xFF0F766E)
                                ) {
                                    Text(
                                        text = "360° STREET EXPLORER",
                                        fontSize = 9.sp,
                                        fontWeight = FontWeight.ExtraBold,
                                        color = Color.White,
                                        modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                                    )
                                }
                                Text(
                                    text = "Google Street View",
                                    fontSize = 11.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = Color(0xFF64748B)
                                )
                            }
                            Text(
                                text = placeName,
                                fontSize = 15.sp,
                                fontWeight = FontWeight.ExtraBold,
                                color = Color(0xFF0F172A),
                                maxLines = 1,
                                overflow = TextOverflow.Ellipsis
                            )
                            Text(
                                text = address,
                                fontSize = 11.sp,
                                color = Color(0xFF64748B),
                                maxLines = 1,
                                overflow = TextOverflow.Ellipsis
                            )
                        }
                    }

                    IconButton(onClick = onClose) {
                        Icon(Icons.Default.Close, contentDescription = "Close", tint = Color(0xFF0F172A))
                    }
                }
            }

            // Coverage Warning if Street View unavailable
            if (isCoverageAvailable == false) {
                Surface(
                    shape = RoundedCornerShape(12.dp),
                    color = Color(0xFFFFFBEB),
                    shadowElevation = 4.dp
                ) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(12.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Text(
                            text = "Street View is not available at this location. Showing nearest available panoramic imagery.",
                            fontSize = 11.sp,
                            color = Color(0xFF92400E),
                            modifier = Modifier.weight(1f)
                        )
                        TextButton(onClick = {
                            activePanorama?.setPosition(targetLatLng, 500, StreetViewSource.DEFAULT)
                        }) {
                            Text("Retry", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = Color(0xFF007AFF))
                        }
                    }
                }
            }
        }

        // Bottom Journey Preview Timeline (if launched from route preview) or Mini-map
        if (journeyStops.isNotEmpty()) {
            Surface(
                modifier = Modifier
                    .align(Alignment.BottomCenter)
                    .fillMaxWidth()
                    .navigationBarsPadding()
                    .padding(12.dp),
                shape = RoundedCornerShape(20.dp),
                color = Color.White.copy(alpha = 0.96f),
                shadowElevation = 8.dp
            ) {
                Column(
                    modifier = Modifier.padding(12.dp),
                    verticalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            text = "PREVIEW JOURNEY PANORAMAS (${journeyStops.size} STOPS)",
                            fontSize = 11.sp,
                            fontWeight = FontWeight.ExtraBold,
                            color = Color(0xFF007AFF)
                        )
                        Text(
                            text = "Stop ${selectedStopIndex + 1} of ${journeyStops.size}",
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Bold,
                            color = Color(0xFF64748B)
                        )
                    }

                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .horizontalScroll(rememberScrollState()),
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        journeyStops.forEachIndexed { idx, stop ->
                            val isSelected = selectedStopIndex == idx
                            Surface(
                                shape = RoundedCornerShape(12.dp),
                                color = if (isSelected) Color(0xFF007AFF) else Color(0xFFFAF8F5),
                                shadowElevation = 2.dp,
                                modifier = Modifier.clickable {
                                    selectedStopIndex = idx
                                    val newLatLng = LatLng(stop.lat, stop.lng)
                                    currentPanoramaLatLng = newLatLng
                                    activePanorama?.setPosition(newLatLng, 100, StreetViewSource.OUTDOOR)
                                }
                            ) {
                                Column(
                                    modifier = Modifier.padding(horizontal = 12.dp, vertical = 8.dp),
                                    verticalArrangement = Arrangement.spacedBy(2.dp)
                                ) {
                                    Text(
                                        text = stop.role,
                                        fontSize = 9.sp,
                                        fontWeight = FontWeight.ExtraBold,
                                        color = if (isSelected) Color.White.copy(alpha = 0.8f) else Color(0xFF64748B)
                                    )
                                    Text(
                                        text = stop.label,
                                        fontSize = 12.sp,
                                        fontWeight = FontWeight.Bold,
                                        color = if (isSelected) Color.White else Color(0xFF0F172A),
                                        maxLines = 1
                                    )
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}
