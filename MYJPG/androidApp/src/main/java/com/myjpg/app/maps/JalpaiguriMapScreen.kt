package com.myjpg.app.maps

import android.content.Intent
import android.net.Uri
import android.util.Log
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardActions
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.automirrored.filled.DirectionsBike
import androidx.compose.material.icons.automirrored.filled.DirectionsWalk
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalFocusManager
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.google.android.gms.common.api.ApiException
import com.google.android.gms.maps.CameraUpdateFactory
import com.google.android.gms.maps.model.BitmapDescriptorFactory
import com.google.android.gms.maps.model.CameraPosition
import com.google.android.gms.maps.model.LatLng
import com.google.android.gms.maps.model.LatLngBounds
import com.google.android.libraries.places.api.Places
import com.google.android.libraries.places.api.model.AutocompleteSessionToken
import com.google.android.libraries.places.api.model.CircularBounds
import com.google.android.libraries.places.api.model.EncodedPolyline
import com.google.android.libraries.places.api.model.Place
import com.google.android.libraries.places.api.model.RectangularBounds
import com.google.android.libraries.places.api.model.RoutingParameters
import com.google.android.libraries.places.api.model.SearchAlongRouteParameters
import com.google.android.libraries.places.api.net.FetchPlaceRequest
import com.google.android.libraries.places.api.net.FindAutocompletePredictionsRequest
import com.google.android.libraries.places.api.net.PlacesClient
import com.google.android.libraries.places.api.net.SearchByTextRequest
import com.google.android.libraries.places.api.net.SearchNearbyRequest
import com.google.maps.android.compose.*
import com.myjpg.app.BuildConfig
import kotlinx.coroutines.CancellationException
import kotlinx.coroutines.Job
import kotlinx.coroutines.async
import kotlinx.coroutines.coroutineScope
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import kotlinx.coroutines.tasks.await

private const val TAG = "MYJPG_MapScreen"
private val BrandBlue = Color(0xFF007AFF)
private val WarmCream = Color(0xFFFAF8F5)
private val DeepSlate = Color(0xFF0F172A)
private val MutedSlate = Color(0xFF64748B)
private val AmberWarnBg = Color(0xFFFFFBEB)
private val AmberWarnText = Color(0xFF92400E)
private val TealAccent = Color(0xFF0F766E)

@Composable
fun JalpaiguriMapScreen(
    initialCenter: LatLng,
    initialDestination: MapPlaceItem?,
    initialQuery: String?,
    userGpsLocation: LatLng?,
    hasLocationPermission: Boolean,
    onRequestLocationPermission: () -> Unit,
    onRecenterGps: () -> Unit,
    onBack: () -> Unit
) {
    val context = LocalContext.current
    val focusManager = LocalFocusManager.current
    val scope = rememberCoroutineScope()

    val mapsKeyConfigured = remember { BuildConfig.MAPS_API_KEY.isNotBlank() }
    val placesClient: PlacesClient? = remember(mapsKeyConfigured) {
        if (mapsKeyConfigured && Places.isInitialized()) {
            Places.createClient(context)
        } else {
            null
        }
    }

    val cameraPositionState = rememberCameraPositionState {
        position = CameraPosition.fromLatLngZoom(initialCenter, 15f)
    }

    var searchQuery by remember { mutableStateOf(initialQuery.orEmpty()) }
    var suppressNextAutocomplete by remember { mutableStateOf(false) }
    var sessionToken by remember { mutableStateOf(AutocompleteSessionToken.newInstance()) }
    var autocompleteSuggestions by remember { mutableStateOf<List<AutocompleteSuggestionItem>>(emptyList()) }
    var isAutocompleting by remember { mutableStateOf(false) }

    var selectedCategoryId by remember { mutableStateOf("all") }
    var mapType by remember { mutableStateOf(MapType.NORMAL) }
    var isTrafficEnabled by remember { mutableStateOf(false) }

    var searchPlaces by remember { mutableStateOf<List<MapPlaceItem>>(emptyList()) }
    var selectedPlace by remember { mutableStateOf<MapPlaceItem?>(initialDestination) }
    var isSearchingPlaces by remember { mutableStateOf(false) }
    var isResolvingTap by remember { mutableStateOf(false) }
    var statusMessage by remember { mutableStateOf<String?>(null) }

    var travelMode by remember { mutableStateOf(TravelModeOption.DRIVE) }
    var routeResult by remember { mutableStateOf<ComputedRouteResult?>(null) }
    var alongRoutePlaces by remember { mutableStateOf<List<MapPlaceItem>>(emptyList()) }
    var isComputingRoute by remember { mutableStateOf(false) }
    var isLoadingAlongRoute by remember { mutableStateOf(false) }
    var showSteps by remember { mutableStateOf(false) }

    var tapLookupJob by remember { mutableStateOf<Job?>(null) }
    var routeJob by remember { mutableStateOf<Job?>(null) }

    val (isInsideJalpaiguri, regionLabel) = remember(userGpsLocation) {
        JalpaiguriGeoUtils.getBoundaryStatusLabel(userGpsLocation)
    }

    // Compatible with Places SDK for Android 4.2.0
    val placeFields = remember {
        listOf(
            Place.Field.ID,
            Place.Field.DISPLAY_NAME,
            Place.Field.FORMATTED_ADDRESS,
            Place.Field.SHORT_FORMATTED_ADDRESS,
            Place.Field.ADDRESS_COMPONENTS,
            Place.Field.LOCATION,
            Place.Field.PRIMARY_TYPE,
            Place.Field.PRIMARY_TYPE_DISPLAY_NAME,
            Place.Field.TYPES,
            Place.Field.RATING,
            Place.Field.USER_RATING_COUNT,
            Place.Field.GOOGLE_MAPS_URI
        )
    }

    fun formatPlacesError(prefix: String, e: Exception): String {
        return when (e) {
            is ApiException -> "$prefix (${e.statusCode}): ${e.localizedMessage ?: "Check Places API (New) & key"}"
            else -> "$prefix: ${e.localizedMessage ?: "Network error"}"
        }
    }

    fun Place.toMapPlaceItem(tapOrigin: LatLng? = null): MapPlaceItem? {
        val loc = location ?: return null
        val parts = JalpaiguriGeoUtils.extractAddressParts(addressComponents?.asList())
        return MapPlaceItem(
            id = id ?: "${loc.latitude},${loc.longitude}",
            name = displayName ?: "Jalpaiguri Place",
            address = formattedAddress ?: shortFormattedAddress ?: "Jalpaiguri, West Bengal",
            category = primaryTypeDisplayName ?: primaryType?.replace('_', ' ') ?: "Place",
            latLng = loc,
            rating = rating,
            userRatingCount = userRatingCount,
            googleMapsUri = googleMapsUri?.toString(),
            kind = LocationKind.POI,
            roadName = parts.roadName,
            locality = parts.locality.ifBlank { parts.city },
            city = parts.city.ifBlank { "Jalpaiguri" },
            postalCode = parts.postalCode,
            distanceMetersFromTap = tapOrigin?.let { JalpaiguriGeoUtils.haversineMeters(it, loc) }
        )
    }

    fun inspectPlaceById(
        placeId: String,
        fallbackName: String? = null,
        tokenToUse: AutocompleteSessionToken? = null,
        fallbackLatLng: LatLng? = null
    ) {
        if (placesClient == null) {
            statusMessage = "Configure MAPS_API_KEY in MYJPG/local.properties to inspect Google Places."
            return
        }

        tapLookupJob?.cancel()
        tapLookupJob = scope.launch {
            isResolvingTap = true
            statusMessage = null
            if (fallbackLatLng != null) {
                selectedPlace = MapPlaceItem(
                    id = placeId,
                    name = fallbackName ?: "Identifying place...",
                    address = "Loading Place Details...",
                    category = "Point of Interest",
                    latLng = fallbackLatLng,
                    kind = LocationKind.POI
                )
            }
            try {
                coroutineScope {
                    val fetchDeferred = async {
                        val reqBuilder = FetchPlaceRequest.builder(placeId, placeFields)
                        if (tokenToUse != null) {
                            reqBuilder.setSessionToken(tokenToUse)
                        }
                        placesClient.fetchPlace(reqBuilder.build()).await()
                    }
                    val nearbyDeferred = if (fallbackLatLng != null) {
                        async {
                            val nReq = SearchNearbyRequest.builder(
                                CircularBounds.newInstance(fallbackLatLng, 180.0),
                                placeFields
                            )
                                .setMaxResultCount(6)
                                .setRankPreference(SearchNearbyRequest.RankPreference.DISTANCE)
                                .build()
                            placesClient.searchNearby(nReq).await()
                        }
                    } else {
                        null
                    }

                    val place = fetchDeferred.await().place
                    if (tokenToUse != null) {
                        sessionToken = AutocompleteSessionToken.newInstance()
                    }

                    val mapped = place.toMapPlaceItem(fallbackLatLng)
                    val nearbyList = try {
                        nearbyDeferred?.await()?.places
                            ?.mapNotNull { it.toMapPlaceItem(fallbackLatLng) }
                            ?.filter { it.id != mapped?.id }
                            .orEmpty()
                    } catch (_: Exception) {
                        emptyList()
                    }

                    if (mapped != null) {
                        selectedPlace = mapped.copy(nearbyPlaces = nearbyList)
                        routeResult = null
                        alongRoutePlaces = emptyList()
                        cameraPositionState.animate(
                            CameraUpdateFactory.newLatLngZoom(mapped.latLng, 16.5f),
                            420
                        )
                    } else {
                        statusMessage = "Place coordinates not available for this selection."
                    }
                }
            } catch (ce: CancellationException) {
                throw ce
            } catch (e: Exception) {
                Log.e(TAG, "inspectPlaceById error: ${e.message}")
                statusMessage = formatPlacesError("Unable to load place details", e)
            } finally {
                isResolvingTap = false
            }
        }
    }

    fun inspectTappedCoordinates(clickedLatLng: LatLng) {
        tapLookupJob?.cancel()
        tapLookupJob = scope.launch {
            isResolvingTap = true
            statusMessage = null
            routeResult = null
            alongRoutePlaces = emptyList()

            selectedPlace = MapPlaceItem(
                id = "tap-${clickedLatLng.latitude}-${clickedLatLng.longitude}",
                name = "Identifying road or place...",
                address = String.format("%.5f, %.5f", clickedLatLng.latitude, clickedLatLng.longitude),
                category = "Resolving Location",
                latLng = clickedLatLng,
                kind = LocationKind.COORDINATES
            )

            try {
                coroutineScope {
                    val geocodeDeferred = async {
                        JalpaiguriGeocodingClient.reverseGeocode(clickedLatLng)
                    }
                    val nearbyDeferred = if (placesClient != null) {
                        async {
                            val req = SearchNearbyRequest.builder(
                                CircularBounds.newInstance(clickedLatLng, 180.0),
                                placeFields
                            )
                                .setMaxResultCount(8)
                                .setRankPreference(SearchNearbyRequest.RankPreference.DISTANCE)
                                .build()
                            placesClient.searchNearby(req).await()
                        }
                    } else {
                        null
                    }

                    val geocodeResult = geocodeDeferred.await()
                    val nearbyItems = try {
                        nearbyDeferred?.await()?.places
                            ?.mapNotNull { it.toMapPlaceItem(clickedLatLng) }
                            ?.sortedBy { it.distanceMetersFromTap ?: Int.MAX_VALUE }
                            .orEmpty()
                    } catch (e: Exception) {
                        Log.w(TAG, "Nearby lookup during tap failed: ${e.message}")
                        emptyList()
                    }

                    val geo = geocodeResult.getOrNull()
                    val closestPoi = nearbyItems.firstOrNull()
                    val tapWithinPoi = closestPoi != null && (closestPoi.distanceMetersFromTap ?: Int.MAX_VALUE) <= 45

                    val finalItem = when {
                        tapWithinPoi && closestPoi != null -> {
                            closestPoi.copy(
                                kind = LocationKind.POI,
                                roadName = closestPoi.roadName.ifBlank { geo?.roadName.orEmpty() },
                                locality = closestPoi.locality.ifBlank { geo?.locality.orEmpty() },
                                city = closestPoi.city.ifBlank { geo?.city ?: "Jalpaiguri" },
                                postalCode = closestPoi.postalCode.ifBlank { geo?.postalCode.orEmpty() },
                                nearbyPlaces = nearbyItems.filter { it.id != closestPoi.id }
                            )
                        }
                        geo != null -> {
                            MapPlaceItem(
                                id = geo.placeId.ifBlank { "geo-${clickedLatLng.latitude}-${clickedLatLng.longitude}" },
                                name = geo.title,
                                address = geo.formattedAddress,
                                category = geo.category,
                                latLng = clickedLatLng,
                                kind = geo.kind,
                                roadName = geo.roadName,
                                locality = geo.locality,
                                city = geo.city,
                                postalCode = geo.postalCode,
                                nearbyPlaces = nearbyItems
                            )
                        }
                        closestPoi != null -> {
                            closestPoi.copy(
                                nearbyPlaces = nearbyItems.filter { it.id != closestPoi.id }
                            )
                        }
                        else -> {
                            val errMsg = geocodeResult.exceptionOrNull()?.message
                            if (!errMsg.isNullOrBlank()) statusMessage = errMsg
                            MapPlaceItem(
                                id = "coords-${clickedLatLng.latitude}-${clickedLatLng.longitude}",
                                name = String.format("%.5f, %.5f", clickedLatLng.latitude, clickedLatLng.longitude),
                                address = "Exact coordinates (no road/place details available)",
                                category = "Coordinates",
                                latLng = clickedLatLng,
                                kind = LocationKind.COORDINATES,
                                nearbyPlaces = nearbyItems
                            )
                        }
                    }

                    selectedPlace = finalItem
                }
            } catch (ce: CancellationException) {
                throw ce
            } catch (e: Exception) {
                Log.e(TAG, "inspectTappedCoordinates failed: ${e.message}")
                statusMessage = e.localizedMessage ?: "Failed to identify tapped location."
            } finally {
                isResolvingTap = false
            }
        }
    }

    // Debounced Programmatic Places Autocomplete (300ms)
    LaunchedEffect(searchQuery, placesClient) {
        if (suppressNextAutocomplete) {
            suppressNextAutocomplete = false
            return@LaunchedEffect
        }
        val trimmed = searchQuery.trim()
        if (trimmed.length < 2 || placesClient == null) {
            autocompleteSuggestions = emptyList()
            isAutocompleting = false
            return@LaunchedEffect
        }

        delay(300)
        isAutocompleting = true
        try {
            val bounds = RectangularBounds.newInstance(
                JalpaiguriGeoUtils.JALPAIGURI_DISTRICT_SW,
                JalpaiguriGeoUtils.JALPAIGURI_DISTRICT_NE
            )
            val origin = userGpsLocation ?: JalpaiguriGeoUtils.JALPAIGURI_CENTER
            val req = FindAutocompletePredictionsRequest.builder()
                .setQuery(trimmed)
                .setLocationRestriction(bounds)
                .setOrigin(origin)
                .setCountries(listOf("IN"))
                .setSessionToken(sessionToken)
                .build()

            val response = placesClient.findAutocompletePredictions(req).await()
            autocompleteSuggestions = response.autocompletePredictions.map { pred ->
                AutocompleteSuggestionItem(
                    placeId = pred.placeId,
                    primaryText = pred.getPrimaryText(null).toString(),
                    secondaryText = pred.getSecondaryText(null).toString(),
                    distanceMeters = pred.distanceMeters
                )
            }
        } catch (ce: CancellationException) {
            throw ce
        } catch (e: Exception) {
            Log.e(TAG, "Autocomplete failed: ${e.message}")
            autocompleteSuggestions = emptyList()
        } finally {
            isAutocompleting = false
        }
    }

    fun runTextSearch(queryText: String) {
        val trimmed = queryText.trim()
        if (trimmed.isEmpty()) return
        focusManager.clearFocus()
        autocompleteSuggestions = emptyList()

        if (placesClient == null) {
            statusMessage = "Configure MAPS_API_KEY in MYJPG/local.properties to search Google Places."
            return
        }

        val scopedQuery = if (trimmed.contains("jalpaiguri", ignoreCase = true) || trimmed.contains("জলপাইগুড়ি")) {
            trimmed
        } else {
            "$trimmed, Jalpaiguri"
        }

        scope.launch {
            isSearchingPlaces = true
            statusMessage = null
            try {
                val request = SearchByTextRequest.builder(scopedQuery, placeFields)
                    .setLocationBias(CircularBounds.newInstance(JalpaiguriGeoUtils.JALPAIGURI_CENTER, 8000.0))
                    .setRegionCode("IN")
                    .setMaxResultCount(10)
                    .build()

                val response = placesClient.searchByText(request).await()
                val mapped = response.places.mapNotNull { it.toMapPlaceItem() }
                searchPlaces = mapped
                if (mapped.isEmpty()) {
                    statusMessage = "No Google Places matched \"$trimmed\" in Jalpaiguri."
                } else {
                    val first = mapped.first()
                    selectedPlace = first
                    routeResult = null
                    alongRoutePlaces = emptyList()
                    cameraPositionState.animate(
                        CameraUpdateFactory.newLatLngZoom(first.latLng, 16f),
                        450
                    )
                }
            } catch (e: Exception) {
                Log.e(TAG, "TextSearch failed: ${e.message}")
                statusMessage = formatPlacesError("Places search unavailable", e)
            } finally {
                isSearchingPlaces = false
            }
        }
    }

    fun runNearbyCategory(chip: NearbyCategoryChip) {
        selectedCategoryId = chip.id
        if (chip.includedTypes.isEmpty()) {
            searchPlaces = emptyList()
            return
        }
        if (placesClient == null) {
            statusMessage = "Configure MAPS_API_KEY in MYJPG/local.properties to search nearby Google Places."
            return
        }

        scope.launch {
            isSearchingPlaces = true
            statusMessage = null
            try {
                val anchor = cameraPositionState.position.target
                val request = SearchNearbyRequest.builder(
                    CircularBounds.newInstance(anchor, 5000.0),
                    placeFields
                )
                    .setIncludedTypes(chip.includedTypes)
                    .setMaxResultCount(12)
                    .setRankPreference(SearchNearbyRequest.RankPreference.DISTANCE)
                    .build()

                val response = placesClient.searchNearby(request).await()
                val mapped = response.places.mapNotNull { it.toMapPlaceItem(anchor) }
                searchPlaces = mapped
                if (mapped.isEmpty()) {
                    statusMessage = "No ${chip.label} found within 5 km of this map view."
                } else {
                    selectedPlace = mapped.first()
                    routeResult = null
                    alongRoutePlaces = emptyList()
                }
            } catch (e: Exception) {
                Log.e(TAG, "Nearby category failed: ${e.message}")
                statusMessage = formatPlacesError("Nearby search unavailable", e)
            } finally {
                isSearchingPlaces = false
            }
        }
    }

    fun computeRouteTo(dest: MapPlaceItem, mode: TravelModeOption) {
        val origin = userGpsLocation ?: JalpaiguriGeoUtils.JALPAIGURI_CENTER
        routeJob?.cancel()
        routeJob = scope.launch {
            isComputingRoute = true
            statusMessage = null
            alongRoutePlaces = emptyList()

            val res = JalpaiguriRoutesClient.computeRoute(origin, dest.latLng, mode)
            res.onSuccess { route ->
                routeResult = route
                if (route.polylinePoints.size >= 2) {
                    val boundsBuilder = LatLngBounds.builder()
                    route.polylinePoints.forEach { boundsBuilder.include(it) }
                    cameraPositionState.animate(
                        CameraUpdateFactory.newLatLngBounds(boundsBuilder.build(), 120),
                        500
                    )
                }

                // Identify real places & landmarks along the computed route polyline
                if (placesClient != null && route.encodedPolyline.isNotBlank()) {
                    isLoadingAlongRoute = true
                    try {
                        val encodedPolyline = EncodedPolyline.newInstance(route.encodedPolyline)
                        val alongParams = SearchAlongRouteParameters.builder()
                            .setPolyline(encodedPolyline)
                            .build()
                        val routingParams = RoutingParameters.builder()
                            .setOrigin(origin)
                            .build()
                        val alongReq = SearchByTextRequest.builder(
                            "hospital school temple bank pharmacy market restaurant",
                            placeFields
                        )
                            .setMaxResultCount(8)
                            .setRoutingParameters(routingParams)
                            .setSearchAlongRouteParameters(alongParams)
                            .build()

                        val alongResp = placesClient.searchByText(alongReq).await()
                        alongRoutePlaces = alongResp.places
                            .mapNotNull { it.toMapPlaceItem(origin) }
                            .filter { it.id != dest.id }
                    } catch (e: Exception) {
                        Log.w(TAG, "Search along route unavailable: ${e.message}")
                    } finally {
                        isLoadingAlongRoute = false
                    }
                }
            }.onFailure { err ->
                routeResult = null
                alongRoutePlaces = emptyList()
                statusMessage = err.message ?: "Unable to calculate route."
            }
            isComputingRoute = false
        }
    }

    LaunchedEffect(initialQuery) {
        if (!initialQuery.isNullOrBlank()) {
            suppressNextAutocomplete = true
            runTextSearch(initialQuery)
        }
    }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(WarmCream)
    ) {
        if (!mapsKeyConfigured) {
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .statusBarsPadding()
                    .navigationBarsPadding()
                    .padding(24.dp),
                verticalArrangement = Arrangement.Center,
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Icon(
                    imageVector = Icons.Default.Map,
                    contentDescription = null,
                    tint = BrandBlue,
                    modifier = Modifier.size(48.dp)
                )
                Spacer(Modifier.height(12.dp))
                Text(
                    text = "Google Maps API Key Not Configured",
                    fontWeight = FontWeight.ExtraBold,
                    fontSize = 18.sp,
                    color = DeepSlate
                )
                Spacer(Modifier.height(8.dp))
                Text(
                    text = "Add MAPS_API_KEY=your_key to MYJPG/local.properties and rebuild the APK to render native Google Maps.",
                    fontSize = 13.sp,
                    color = MutedSlate
                )
                Spacer(Modifier.height(16.dp))
                Button(onClick = onBack, colors = ButtonDefaults.buttonColors(containerColor = BrandBlue)) {
                    Text("Back to MYJPG")
                }
            }
            return@Box
        }

        // Official Google Maps Compose Surface with full POI click + Map click reverse geocoding
        GoogleMap(
            modifier = Modifier.fillMaxSize(),
            cameraPositionState = cameraPositionState,
            properties = MapProperties(
                mapType = mapType,
                isBuildingEnabled = true,
                isTrafficEnabled = isTrafficEnabled,
                isMyLocationEnabled = hasLocationPermission
            ),
            uiSettings = MapUiSettings(
                zoomControlsEnabled = false,
                zoomGesturesEnabled = true,
                scrollGesturesEnabled = true,
                rotationGesturesEnabled = true,
                tiltGesturesEnabled = true,
                compassEnabled = true,
                myLocationButtonEnabled = false
            ),
            mapColorScheme = ComposeMapColorScheme.FOLLOW_SYSTEM,
            onPOIClick = { poi ->
                autocompleteSuggestions = emptyList()
                focusManager.clearFocus()
                inspectPlaceById(
                    placeId = poi.placeId,
                    fallbackName = poi.name,
                    fallbackLatLng = poi.latLng
                )
            },
            onMapClick = { clickedLatLng ->
                autocompleteSuggestions = emptyList()
                focusManager.clearFocus()
                inspectTappedCoordinates(clickedLatLng)
            }
        ) {
            val activeRoute = routeResult
            if (activeRoute != null && activeRoute.polylinePoints.size >= 2) {
                Polyline(
                    points = activeRoute.polylinePoints,
                    color = BrandBlue,
                    width = 14f,
                    geodesic = true
                )
            }

            // Places Along Active Route Markers
            alongRoutePlaces.forEach { alongPlace ->
                key("along-${alongPlace.id}") {
                    val mState = remember(alongPlace.id, alongPlace.latLng) { MarkerState(position = alongPlace.latLng) }
                    Marker(
                        state = mState,
                        title = alongPlace.name,
                        snippet = "${alongPlace.category} (Along route)",
                        icon = BitmapDescriptorFactory.defaultMarker(BitmapDescriptorFactory.HUE_AZURE),
                        onClick = {
                            inspectPlaceById(alongPlace.id, alongPlace.name, fallbackLatLng = alongPlace.latLng)
                            false
                        }
                    )
                }
            }

            searchPlaces.forEach { place ->
                key(place.id) {
                    val markerState = remember(place.id, place.latLng) { MarkerState(position = place.latLng) }
                    Marker(
                        state = markerState,
                        title = place.name,
                        snippet = place.category,
                        onClick = {
                            selectedPlace = place
                            routeResult = null
                            alongRoutePlaces = emptyList()
                            false
                        }
                    )
                }
            }

            selectedPlace?.let { dest ->
                if (searchPlaces.none { it.id == dest.id }) {
                    key(dest.id) {
                        val destState = remember(dest.id, dest.latLng) { MarkerState(position = dest.latLng) }
                        Marker(
                            state = destState,
                            title = dest.name,
                            snippet = dest.address
                        )
                    }
                }
            }
        }

        // Top Search & Category Bar (Respects Android Status Bar Insets)
        Column(
            modifier = Modifier
                .align(Alignment.TopCenter)
                .fillMaxWidth()
                .statusBarsPadding()
                .padding(horizontal = 12.dp, vertical = 8.dp),
            verticalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            Surface(
                shape = RoundedCornerShape(20.dp),
                color = Color.White.copy(alpha = 0.96f),
                shadowElevation = 6.dp
            ) {
                Column(modifier = Modifier.padding(8.dp), verticalArrangement = Arrangement.spacedBy(6.dp)) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(6.dp)
                    ) {
                        IconButton(onClick = onBack, modifier = Modifier.size(36.dp)) {
                            Icon(
                                imageVector = Icons.AutoMirrored.Filled.ArrowBack,
                                contentDescription = "Back",
                                tint = DeepSlate
                            )
                        }

                        OutlinedTextField(
                            value = searchQuery,
                            onValueChange = { searchQuery = it },
                            placeholder = {
                                Text("Search Kadamtala, hospitals, schools...", fontSize = 13.sp, maxLines = 1)
                            },
                            singleLine = true,
                            keyboardOptions = KeyboardOptions(imeAction = ImeAction.Search),
                            keyboardActions = KeyboardActions(onSearch = { runTextSearch(searchQuery) }),
                            modifier = Modifier.weight(1f),
                            shape = RoundedCornerShape(14.dp),
                            trailingIcon = {
                                if (isSearchingPlaces || isAutocompleting) {
                                    CircularProgressIndicator(modifier = Modifier.size(16.dp), strokeWidth = 2.dp)
                                } else if (searchQuery.isNotEmpty()) {
                                    IconButton(onClick = {
                                        searchQuery = ""
                                        autocompleteSuggestions = emptyList()
                                    }) {
                                        Icon(Icons.Default.Close, contentDescription = "Clear", modifier = Modifier.size(18.dp))
                                    }
                                }
                            }
                        )

                        FilledIconButton(
                            onClick = { runTextSearch(searchQuery) },
                            colors = IconButtonDefaults.filledIconButtonColors(containerColor = BrandBlue),
                            modifier = Modifier.size(40.dp)
                        ) {
                            Icon(Icons.Default.Search, contentDescription = "Search", tint = Color.White)
                        }
                    }

                    // Autocomplete Suggestions Dropdown
                    if (autocompleteSuggestions.isNotEmpty()) {
                        Surface(
                            shape = RoundedCornerShape(14.dp),
                            color = WarmCream,
                            tonalElevation = 1.dp
                        ) {
                            LazyColumn(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .heightIn(max = 200.dp)
                            ) {
                                items(autocompleteSuggestions, key = { it.placeId }) { item ->
                                    Row(
                                        modifier = Modifier
                                            .fillMaxWidth()
                                            .clickable {
                                                focusManager.clearFocus()
                                                suppressNextAutocomplete = true
                                                searchQuery = item.primaryText
                                                autocompleteSuggestions = emptyList()
                                                inspectPlaceById(
                                                    placeId = item.placeId,
                                                    fallbackName = item.primaryText,
                                                    tokenToUse = sessionToken
                                                )
                                            }
                                            .padding(horizontal = 12.dp, vertical = 10.dp),
                                        horizontalArrangement = Arrangement.SpaceBetween,
                                        verticalAlignment = Alignment.CenterVertically
                                    ) {
                                        Column(modifier = Modifier.weight(1f)) {
                                            Text(
                                                text = item.primaryText,
                                                fontSize = 13.sp,
                                                fontWeight = FontWeight.Bold,
                                                color = DeepSlate,
                                                maxLines = 1,
                                                overflow = TextOverflow.Ellipsis
                                            )
                                            if (item.secondaryText.isNotBlank()) {
                                                Text(
                                                    text = item.secondaryText,
                                                    fontSize = 11.sp,
                                                    color = MutedSlate,
                                                    maxLines = 1,
                                                    overflow = TextOverflow.Ellipsis
                                                )
                                            }
                                        }
                                        item.distanceMeters?.let { distM ->
                                            Text(
                                                text = JalpaiguriGeoUtils.formatDistanceMeters(distM),
                                                fontSize = 11.sp,
                                                fontWeight = FontWeight.Bold,
                                                color = BrandBlue,
                                                modifier = Modifier.padding(start = 8.dp)
                                            )
                                        }
                                    }
                                    HorizontalDivider(color = Color(0xFFE8E4DA))
                                }
                            }
                        }
                    }

                    // Regional Boundary & Map Controls Row
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Surface(
                            shape = RoundedCornerShape(10.dp),
                            color = if (isInsideJalpaiguri) Color(0xFFEFF6FF) else AmberWarnBg
                        ) {
                            Row(
                                modifier = Modifier.padding(horizontal = 10.dp, vertical = 4.dp),
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.spacedBy(4.dp)
                            ) {
                                Box(
                                    modifier = Modifier
                                        .size(7.dp)
                                        .clip(CircleShape)
                                        .background(if (isInsideJalpaiguri) BrandBlue else Color(0xFFD97706))
                                )
                                Text(
                                    text = regionLabel,
                                    fontSize = 11.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = if (isInsideJalpaiguri) BrandBlue else AmberWarnText
                                )
                            }
                        }

                        Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                            FilterChip(
                                selected = isTrafficEnabled,
                                onClick = { isTrafficEnabled = !isTrafficEnabled },
                                label = { Text("Traffic", fontSize = 11.sp) }
                            )
                            FilterChip(
                                selected = mapType != MapType.NORMAL,
                                onClick = {
                                    mapType = when (mapType) {
                                        MapType.NORMAL -> MapType.HYBRID
                                        MapType.HYBRID -> MapType.TERRAIN
                                        else -> MapType.NORMAL
                                    }
                                },
                                label = {
                                    Text(
                                        text = when (mapType) {
                                            MapType.HYBRID -> "Hybrid"
                                            MapType.TERRAIN -> "Terrain"
                                            else -> "Standard"
                                        },
                                        fontSize = 11.sp
                                    )
                                }
                            )
                        }
                    }
                }
            }

            // Category Discovery Chips
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .horizontalScroll(rememberScrollState()),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                JalpaiguriGeoUtils.CATEGORY_CHIPS.forEach { chip ->
                    val selected = selectedCategoryId == chip.id
                    Surface(
                        shape = RoundedCornerShape(14.dp),
                        color = if (selected) BrandBlue else Color.White.copy(alpha = 0.95f),
                        shadowElevation = 3.dp,
                        modifier = Modifier.clickable { runNearbyCategory(chip) }
                    ) {
                        Text(
                            text = chip.label,
                            modifier = Modifier.padding(horizontal = 14.dp, vertical = 8.dp),
                            fontSize = 12.sp,
                            fontWeight = FontWeight.Bold,
                            color = if (selected) Color.White else DeepSlate
                        )
                    }
                }
            }

            statusMessage?.let { msg ->
                Surface(
                    shape = RoundedCornerShape(14.dp),
                    color = AmberWarnBg,
                    shadowElevation = 3.dp
                ) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(horizontal = 12.dp, vertical = 8.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Text(
                            text = msg,
                            fontSize = 12.sp,
                            color = AmberWarnText,
                            modifier = Modifier.weight(1f)
                        )
                        IconButton(onClick = { statusMessage = null }, modifier = Modifier.size(24.dp)) {
                            Icon(Icons.Default.Close, contentDescription = "Dismiss", tint = AmberWarnText, modifier = Modifier.size(16.dp))
                        }
                    }
                }
            }
        }

        // Right-side Zoom & Recenter FAB Column
        Column(
            modifier = Modifier
                .align(Alignment.CenterEnd)
                .padding(end = 12.dp),
            verticalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            SmallFloatingActionButton(
                onClick = {
                    scope.launch { cameraPositionState.animate(CameraUpdateFactory.zoomIn(), 250) }
                },
                containerColor = Color.White,
                contentColor = DeepSlate
            ) {
                Icon(Icons.Default.Add, contentDescription = "Zoom in")
            }
            SmallFloatingActionButton(
                onClick = {
                    scope.launch { cameraPositionState.animate(CameraUpdateFactory.zoomOut(), 250) }
                },
                containerColor = Color.White,
                contentColor = DeepSlate
            ) {
                Icon(Icons.Default.Remove, contentDescription = "Zoom out")
            }
            SmallFloatingActionButton(
                onClick = {
                    if (!hasLocationPermission) {
                        onRequestLocationPermission()
                    } else {
                        onRecenterGps()
                        val target = userGpsLocation ?: JalpaiguriGeoUtils.JALPAIGURI_CENTER
                        scope.launch {
                            cameraPositionState.animate(CameraUpdateFactory.newLatLngZoom(target, 16f), 450)
                        }
                    }
                },
                containerColor = Color.White,
                contentColor = BrandBlue
            ) {
                Icon(Icons.Default.MyLocation, contentDescription = "Recenter on My Location")
            }
            SmallFloatingActionButton(
                onClick = {
                    scope.launch {
                        cameraPositionState.animate(
                            CameraUpdateFactory.newLatLngZoom(JalpaiguriGeoUtils.JALPAIGURI_CENTER, 14.5f),
                            450
                        )
                    }
                },
                containerColor = Color.White,
                contentColor = DeepSlate
            ) {
                Icon(Icons.Default.Explore, contentDescription = "Center Jalpaiguri Hub")
            }
        }

        // Bottom Interactive Place Details + Nearby Places + Google Routes Card
        selectedPlace?.let { place ->
            Surface(
                modifier = Modifier
                    .align(Alignment.BottomCenter)
                    .fillMaxWidth()
                    .navigationBarsPadding()
                    .padding(12.dp),
                shape = RoundedCornerShape(24.dp),
                color = Color.White,
                shadowElevation = 10.dp
            ) {
                Column(
                    modifier = Modifier.padding(16.dp),
                    verticalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.Top
                    ) {
                        Column(modifier = Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(2.dp)) {
                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.spacedBy(6.dp)
                            ) {
                                Surface(
                                    shape = RoundedCornerShape(6.dp),
                                    color = Color(0xFFEFF6FF)
                                ) {
                                    Text(
                                        text = place.kind.badgeLabel.uppercase(),
                                        fontSize = 10.sp,
                                        fontWeight = FontWeight.ExtraBold,
                                        color = BrandBlue,
                                        modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                                    )
                                }
                                Text(
                                    text = place.category,
                                    fontSize = 11.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = MutedSlate,
                                    maxLines = 1,
                                    overflow = TextOverflow.Ellipsis
                                )
                            }

                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.spacedBy(6.dp)
                            ) {
                                if (isResolvingTap) {
                                    CircularProgressIndicator(modifier = Modifier.size(14.dp), strokeWidth = 2.dp)
                                }
                                Text(
                                    text = place.name,
                                    fontSize = 16.sp,
                                    fontWeight = FontWeight.ExtraBold,
                                    color = DeepSlate,
                                    maxLines = 2,
                                    overflow = TextOverflow.Ellipsis
                                )
                            }

                            if (place.roadName.isNotBlank()) {
                                Text(
                                    text = "Road: ${place.roadName}",
                                    fontSize = 12.sp,
                                    fontWeight = FontWeight.SemiBold,
                                    color = DeepSlate
                                )
                            }

                            val areaSummary = listOf(place.locality, place.city, place.postalCode)
                                .filter { it.isNotBlank() }
                                .joinToString(", ")
                            if (areaSummary.isNotBlank()) {
                                Text(
                                    text = areaSummary,
                                    fontSize = 11.sp,
                                    color = MutedSlate
                                )
                            }

                            Text(
                                text = place.address,
                                fontSize = 11.sp,
                                color = MutedSlate,
                                maxLines = 2,
                                overflow = TextOverflow.Ellipsis
                            )

                            val refPoint = userGpsLocation ?: JalpaiguriGeoUtils.JALPAIGURI_CENTER
                            val distText = JalpaiguriGeoUtils.formatDistanceKm(
                                JalpaiguriGeoUtils.haversineKm(refPoint, place.latLng)
                            )
                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.spacedBy(8.dp),
                                modifier = Modifier.padding(top = 2.dp)
                            ) {
                                Text(
                                    text = "$distText away • ${String.format("%.5f, %.5f", place.latLng.latitude, place.latLng.longitude)}",
                                    fontSize = 11.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = BrandBlue
                                )
                                place.rating?.let { r ->
                                    Text(
                                        text = "★ ${String.format("%.1f", r)} (${place.userRatingCount ?: 0})",
                                        fontSize = 11.sp,
                                        fontWeight = FontWeight.Bold,
                                        color = Color(0xFFD97706)
                                    )
                                }
                            }
                        }

                        IconButton(onClick = {
                            tapLookupJob?.cancel()
                            routeJob?.cancel()
                            selectedPlace = null
                            routeResult = null
                            alongRoutePlaces = emptyList()
                            showSteps = false
                        }) {
                            Icon(Icons.Default.Close, contentDescription = "Close")
                        }
                    }

                    // Clickable Nearby Places Identified Around Tapped Location
                    if (place.nearbyPlaces.isNotEmpty() && routeResult == null) {
                        Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
                            Text(
                                text = "NEARBY PLACES (${place.nearbyPlaces.size})",
                                fontSize = 10.sp,
                                fontWeight = FontWeight.ExtraBold,
                                color = MutedSlate
                            )
                            Row(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .horizontalScroll(rememberScrollState()),
                                horizontalArrangement = Arrangement.spacedBy(6.dp)
                            ) {
                                place.nearbyPlaces.take(6).forEach { np ->
                                    Surface(
                                        shape = RoundedCornerShape(10.dp),
                                        color = WarmCream,
                                        modifier = Modifier.clickable {
                                            inspectPlaceById(np.id, np.name, fallbackLatLng = np.latLng)
                                        }
                                    ) {
                                        Column(modifier = Modifier.padding(horizontal = 10.dp, vertical = 6.dp)) {
                                            Text(
                                                text = np.name,
                                                fontSize = 11.sp,
                                                fontWeight = FontWeight.Bold,
                                                color = DeepSlate,
                                                maxLines = 1,
                                                overflow = TextOverflow.Ellipsis
                                            )
                                            val distM = np.distanceMetersFromTap?.let { " • ${it}m" }.orEmpty()
                                            Text(
                                                text = "${np.category}$distM",
                                                fontSize = 10.sp,
                                                color = MutedSlate,
                                                maxLines = 1
                                            )
                                        }
                                    }
                                }
                            }
                        }
                    }

                    // Travel Mode Selector
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        TravelModeOption.entries.forEach { mode ->
                            val isSelected = travelMode == mode
                            val icon = when (mode) {
                                TravelModeOption.DRIVE -> Icons.Default.DirectionsCar
                                TravelModeOption.WALK -> Icons.AutoMirrored.Filled.DirectionsWalk
                                TravelModeOption.BICYCLE -> Icons.AutoMirrored.Filled.DirectionsBike
                            }
                            OutlinedButton(
                                onClick = {
                                    travelMode = mode
                                    computeRouteTo(place, mode)
                                },
                                modifier = Modifier.weight(1f),
                                shape = RoundedCornerShape(12.dp),
                                colors = ButtonDefaults.outlinedButtonColors(
                                    containerColor = if (isSelected) BrandBlue else WarmCream,
                                    contentColor = if (isSelected) Color.White else DeepSlate
                                )
                            ) {
                                Icon(icon, contentDescription = mode.label, modifier = Modifier.size(16.dp))
                                Spacer(Modifier.width(4.dp))
                                Text(mode.label, fontSize = 12.sp, fontWeight = FontWeight.Bold)
                            }
                        }
                    }

                    if (travelMode == TravelModeOption.WALK || travelMode == TravelModeOption.BICYCLE) {
                        Surface(
                            shape = RoundedCornerShape(12.dp),
                            color = AmberWarnBg
                        ) {
                            Text(
                                text = "Walking and bicycling routes are in beta and might sometimes be missing sidewalks, pedestrian paths, or bike paths.",
                                modifier = Modifier.padding(horizontal = 10.dp, vertical = 6.dp),
                                fontSize = 11.sp,
                                color = AmberWarnText
                            )
                        }
                    }

                    // Action Buttons Row
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(8.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Button(
                            onClick = { computeRouteTo(place, travelMode) },
                            enabled = !isComputingRoute,
                            modifier = Modifier.weight(1f),
                            shape = RoundedCornerShape(14.dp),
                            colors = ButtonDefaults.buttonColors(containerColor = BrandBlue)
                        ) {
                            if (isComputingRoute) {
                                CircularProgressIndicator(
                                    color = Color.White,
                                    modifier = Modifier.size(16.dp),
                                    strokeWidth = 2.dp
                                )
                            } else {
                                Icon(Icons.Default.Directions, contentDescription = null, modifier = Modifier.size(18.dp))
                                Spacer(Modifier.width(6.dp))
                                Text("Route Here", fontWeight = FontWeight.ExtraBold)
                            }
                        }

                        place.googleMapsUri?.let { uriStr ->
                            OutlinedButton(
                                onClick = {
                                    context.startActivity(Intent(Intent.ACTION_VIEW, Uri.parse(uriStr)))
                                },
                                shape = RoundedCornerShape(14.dp)
                            ) {
                                Text("Open Maps", fontSize = 12.sp, fontWeight = FontWeight.Bold)
                            }
                        }
                    }

                    routeResult?.let { route ->
                        Surface(
                            shape = RoundedCornerShape(14.dp),
                            color = Color(0xFFEFF6FF)
                        ) {
                            Column(modifier = Modifier.padding(10.dp), verticalArrangement = Arrangement.spacedBy(6.dp)) {
                                if (route.routeDescription.isNotBlank()) {
                                    Text(
                                        text = "Via ${route.routeDescription}",
                                        fontSize = 11.sp,
                                        fontWeight = FontWeight.Bold,
                                        color = BrandBlue,
                                        maxLines = 1,
                                        overflow = TextOverflow.Ellipsis
                                    )
                                }

                                Row(
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .clickable { showSteps = !showSteps },
                                    horizontalArrangement = Arrangement.SpaceBetween,
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Text(
                                        text = "${route.durationText} • ${JalpaiguriGeoUtils.formatDistanceMeters(route.distanceMeters)}",
                                        fontSize = 13.sp,
                                        fontWeight = FontWeight.ExtraBold,
                                        color = DeepSlate
                                    )
                                    if (route.steps.isNotEmpty()) {
                                        Text(
                                            text = if (showSteps) "Hide steps" else "${route.steps.size} road steps",
                                            fontSize = 12.sp,
                                            fontWeight = FontWeight.Bold,
                                            color = BrandBlue
                                        )
                                    }
                                }

                                if (showSteps && route.steps.isNotEmpty()) {
                                    LazyColumn(
                                        modifier = Modifier.heightIn(max = 130.dp),
                                        verticalArrangement = Arrangement.spacedBy(6.dp)
                                    ) {
                                        items(route.steps) { step ->
                                            Row(
                                                modifier = Modifier.fillMaxWidth(),
                                                horizontalArrangement = Arrangement.SpaceBetween
                                            ) {
                                                Text(
                                                    text = "• ${step.instruction}",
                                                    fontSize = 11.sp,
                                                    color = DeepSlate,
                                                    modifier = Modifier.weight(1f)
                                                )
                                                Text(
                                                    text = JalpaiguriGeoUtils.formatDistanceMeters(step.distanceMeters),
                                                    fontSize = 11.sp,
                                                    fontWeight = FontWeight.Bold,
                                                    color = MutedSlate
                                                )
                                            }
                                        }
                                    }
                                }

                                if (isLoadingAlongRoute || alongRoutePlaces.isNotEmpty()) {
                                    Text(
                                        text = if (isLoadingAlongRoute) {
                                            "Finding places along route..."
                                        } else {
                                            "ALONG THIS ROUTE (${alongRoutePlaces.size})"
                                        },
                                        fontSize = 10.sp,
                                        fontWeight = FontWeight.ExtraBold,
                                        color = TealAccent
                                    )
                                    if (alongRoutePlaces.isNotEmpty()) {
                                        Row(
                                            modifier = Modifier
                                                .fillMaxWidth()
                                                .horizontalScroll(rememberScrollState()),
                                            horizontalArrangement = Arrangement.spacedBy(6.dp)
                                        ) {
                                            alongRoutePlaces.forEach { ap ->
                                                Surface(
                                                    shape = RoundedCornerShape(10.dp),
                                                    color = Color.White,
                                                    modifier = Modifier.clickable {
                                                        inspectPlaceById(ap.id, ap.name, fallbackLatLng = ap.latLng)
                                                    }
                                                ) {
                                                    Column(modifier = Modifier.padding(horizontal = 10.dp, vertical = 6.dp)) {
                                                        Text(
                                                            text = ap.name,
                                                            fontSize = 11.sp,
                                                            fontWeight = FontWeight.Bold,
                                                            color = DeepSlate,
                                                            maxLines = 1
                                                        )
                                                        Text(
                                                            text = ap.category,
                                                            fontSize = 10.sp,
                                                            color = TealAccent,
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
                }
            }
        }
    }
}
