package com.myjpg.app.maps

import kotlinx.serialization.Serializable

@Serializable
data class GeoPoint(
    val lat: Double,
    val lng: Double
)

enum class MapViewMode(val labelEn: String, val labelBn: String) {
    STANDARD("Standard", "স্ট্যান্ডার্ড"),
    SATELLITE("Satellite", "স্যাটেলাইট"),
    THREE_D("3D", "৩ডি")
}

enum class SharedLocationKind(val badgeEn: String, val badgeBn: String) {
    POI("Place / POI", "স্থান"),
    ROAD("Road / Street", "রাস্তা"),
    LOCALITY("Locality", "এলাকা"),
    COORDINATES("Location Pin", "পিন")
}

enum class SharedTravelMode(val apiValue: String, val labelEn: String, val labelBn: String) {
    DRIVE("DRIVE", "Drive", "গাড়ি"),
    TWO_WHEELER("TWO_WHEELER", "2-Wheeler", "বাইক"),
    WALK("WALK", "Walk", "হাঁটা"),
    BICYCLE("BICYCLE", "Cycle", "সাইকেল")
}

enum class MapsUiLanguage(val code: String, val shortLabel: String) {
    EN("en", "EN"),
    BN("bn", "বাং")
}

enum class MapsErrorKind {
    NETWORK_OFFLINE,
    TIMEOUT,
    PROXY_NOT_DEPLOYED_404,
    AUTH_OR_RESTRICTION_403,
    BAD_REQUEST_400,
    RATE_LIMIT_429,
    SERVER_ERROR_5XX,
    EMPTY_RESULTS,
    PARSE_ERROR,
    UNKNOWN
}

data class MapsFailure(
    val kind: MapsErrorKind,
    val userMessage: String,
    val technicalHint: String = "",
    val httpStatus: Int? = null
)

@Serializable
data class SharedPlaceSummary(
    val id: String,
    val name: String,
    val address: String,
    val category: String,
    val lat: Double,
    val lng: Double,
    val roadName: String = "",
    val locality: String = "",
    val city: String = "Jalpaiguri",
    val postalCode: String = "",
    val rating: Double? = null,
    val userRatingCount: Int? = null,
    val phoneNumber: String = "",
    val websiteUri: String = "",
    val photoUrls: List<String> = emptyList()
)

@Serializable
data class SharedRouteStep(
    val instruction: String,
    val distanceMeters: Int,
    val durationText: String = "",
    val roadName: String = "",
    val maneuver: String = "",
    val startLat: Double? = null,
    val startLng: Double? = null,
    val endLat: Double? = null,
    val endLng: Double? = null
)

@Serializable
data class SharedRouteAlternative(
    val routeIndex: Int,
    val label: String,
    val distanceMeters: Int,
    val durationText: String,
    val encodedPolyline: String,
    val steps: List<SharedRouteStep> = emptyList()
)

@Serializable
data class StreetViewAvailability(
    val available: Boolean,
    val status: String,
    val panoId: String? = null,
    val lat: Double? = null,
    val lng: Double? = null,
    val date: String? = null,
    val copyright: String? = null,
    val distanceFromQueryMeters: Int? = null,
    val error: String? = null
)

@Serializable
data class JourneyPreviewStop(
    val stopIndex: Int,
    val label: String,
    val role: String, // "START", "WAYPOINT", "DESTINATION"
    val lat: Double,
    val lng: Double,
    val panoLat: Double? = null,
    val panoLng: Double? = null,
    val panoId: String? = null,
    val streetViewAvailable: Boolean = false,
    val headingDegrees: Double = 0.0,
    val captureDate: String? = null,
    val distanceFromStartMeters: Int = 0
)

@Serializable
data class SavedPlaceRecord(
    val id: String,
    val name: String,
    val address: String,
    val category: String,
    val lat: Double,
    val lng: Double,
    val roadName: String = "",
    val savedAtEpochMs: Long = 0L
)

@Serializable
data class CachedRouteRecord(
    val cacheKey: String,
    val originLabel: String,
    val destinationLabel: String,
    val travelMode: String,
    val distanceMeters: Int,
    val durationText: String,
    val encodedPolyline: String,
    val steps: List<SharedRouteStep> = emptyList(),
    val savedAtEpochMs: Long = 0L
)
