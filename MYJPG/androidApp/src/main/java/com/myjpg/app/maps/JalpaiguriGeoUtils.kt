package com.myjpg.app.maps

import com.google.android.gms.maps.model.LatLng
import com.google.android.libraries.places.api.model.AddressComponent
import kotlin.math.atan2
import kotlin.math.cos
import kotlin.math.sin
import kotlin.math.sqrt

enum class LocationKind(val badgeLabel: String) {
    POI("Named Place"),
    ROAD("Road / Street"),
    LOCALITY("Locality / Area"),
    COORDINATES("Coordinates")
}

data class MapPlaceItem(
    val id: String,
    val name: String,
    val address: String,
    val category: String,
    val latLng: LatLng,
    val rating: Double? = null,
    val userRatingCount: Int? = null,
    val googleMapsUri: String? = null,
    val kind: LocationKind = LocationKind.POI,
    val roadName: String = "",
    val locality: String = "",
    val city: String = "Jalpaiguri",
    val postalCode: String = "",
    val distanceMetersFromTap: Int? = null,
    val nearbyPlaces: List<MapPlaceItem> = emptyList()
)

data class AutocompleteSuggestionItem(
    val placeId: String,
    val primaryText: String,
    val secondaryText: String,
    val distanceMeters: Int?
)

data class RouteStepItem(
    val instruction: String,
    val distanceMeters: Int
)

data class ComputedRouteResult(
    val distanceMeters: Int,
    val durationText: String,
    val polylinePoints: List<LatLng>,
    val steps: List<RouteStepItem>,
    val encodedPolyline: String = "",
    val routeDescription: String = ""
)

enum class TravelModeOption(val apiValue: String, val label: String) {
    DRIVE("DRIVE", "Drive"),
    TWO_WHEELER("TWO_WHEELER", "2-Wheeler"),
    WALK("WALK", "Walk"),
    BICYCLE("BICYCLE", "Cycle")
}

data class NearbyCategoryChip(
    val id: String,
    val label: String,
    val includedTypes: List<String>
)

data class ParsedAddressParts(
    val roadName: String = "",
    val locality: String = "",
    val city: String = "",
    val district: String = "",
    val state: String = "",
    val postalCode: String = ""
)

object JalpaiguriGeoUtils {
    val JALPAIGURI_CENTER = LatLng(26.5228, 88.7245)
    val KADAMTALA_HUB = LatLng(26.5218, 88.7289)
    val JALPAIGURI_DISTRICT_SW = LatLng(26.35, 88.45)
    val JALPAIGURI_DISTRICT_NE = LatLng(26.95, 89.05)

    const val MUNICIPALITY_RADIUS_KM = 8.0
    const val DISTRICT_RADIUS_KM = 32.0

    val CATEGORY_CHIPS = listOf(
        NearbyCategoryChip("all", "Explore", emptyList()),
        NearbyCategoryChip("hospitals", "Hospitals", listOf("hospital", "pharmacy")),
        NearbyCategoryChip("schools", "Schools", listOf("school", "university")),
        NearbyCategoryChip("banks", "Banks & ATMs", listOf("bank", "atm")),
        NearbyCategoryChip("temples", "Temples", listOf("hindu_temple", "place_of_worship")),
        NearbyCategoryChip("govt", "Govt Offices", listOf("local_government_office", "police")),
        NearbyCategoryChip("food", "Dining", listOf("restaurant", "cafe"))
    )

    fun extractAddressParts(components: List<AddressComponent>?): ParsedAddressParts {
        if (components.isNullOrEmpty()) return ParsedAddressParts()
        fun find(type: String): String {
            return components.firstOrNull { comp ->
                comp.types.any { it == type }
            }?.name.orEmpty()
        }

        val road = find("route")
        val sublocality = find("sublocality_level_1")
            .ifBlank { find("sublocality_level_2") }
            .ifBlank { find("sublocality") }
            .ifBlank { find("neighborhood") }
        val city = find("locality").ifBlank { "Jalpaiguri" }
        val district = find("administrative_area_level_2")
        val state = find("administrative_area_level_1")
        val postal = find("postal_code")
        return ParsedAddressParts(
            roadName = road,
            locality = sublocality,
            city = city,
            district = district,
            state = state,
            postalCode = postal
        )
    }

    fun haversineKm(a: LatLng, b: LatLng): Double {
        val earthRadiusKm = 6371.0
        val dLat = Math.toRadians(b.latitude - a.latitude)
        val dLng = Math.toRadians(b.longitude - a.longitude)
        val sinLat = sin(dLat / 2.0)
        val sinLng = sin(dLng / 2.0)
        val calc = sinLat * sinLat +
            cos(Math.toRadians(a.latitude)) * cos(Math.toRadians(b.latitude)) *
            sinLng * sinLng
        val c = 2.0 * atan2(sqrt(calc), sqrt(1.0 - calc))
        return earthRadiusKm * c
    }

    fun haversineMeters(a: LatLng, b: LatLng): Int {
        return (haversineKm(a, b) * 1000.0).toInt()
    }

    fun formatDistanceMeters(meters: Int): String {
        return if (meters < 1000) {
            "$meters m"
        } else {
            val km = meters / 1000.0
            String.format("%.1f km", km)
        }
    }

    fun formatDistanceKm(km: Double): String {
        return if (km < 1.0) {
            "${(km * 1000).toInt()} m"
        } else {
            String.format("%.1f km", km)
        }
    }

    fun formatDurationSeconds(rawDuration: String): String {
        val seconds = rawDuration.removeSuffix("s").toIntOrNull() ?: return rawDuration
        if (seconds < 60) return "${seconds}s"
        val minutes = (seconds + 30) / 60
        if (minutes < 60) return "$minutes min"
        val hrs = minutes / 60
        val rem = minutes % 60
        return if (rem > 0) "${hrs}h ${rem}m" else "${hrs}h"
    }

    fun getBoundaryStatusLabel(point: LatLng?): Pair<Boolean, String> {
        if (point == null) return Pair(true, "Jalpaiguri City Hub")
        val distKm = haversineKm(point, JALPAIGURI_CENTER)
        return when {
            distKm <= MUNICIPALITY_RADIUS_KM -> Pair(true, "Jalpaiguri Town")
            distKm <= DISTRICT_RADIUS_KM -> Pair(true, "Jalpaiguri District")
            else -> Pair(false, "${distKm.toInt()} km from Jalpaiguri")
        }
    }

    fun decodeGooglePolyline(encoded: String): List<LatLng> {
        if (encoded.isBlank()) return emptyList()
        val points = ArrayList<LatLng>()
        var index = 0
        val len = encoded.length
        var lat = 0
        var lng = 0

        while (index < len) {
            var b: Int
            var shift = 0
            var result = 0
            do {
                b = encoded[index++].code - 63
                result = result or ((b and 0x1f) shl shift)
                shift += 5
            } while (b >= 0x20 && index < len)
            val dlat = if ((result and 1) != 0) (result shr 1).inv() else result shr 1
            lat += dlat

            shift = 0
            result = 0
            do {
                b = encoded[index++].code - 63
                result = result or ((b and 0x1f) shl shift)
                shift += 5
            } while (b >= 0x20 && index < len)
            val dlng = if ((result and 1) != 0) (result shr 1).inv() else result shr 1
            lng += dlng

            points.add(LatLng(lat / 1E5, lng / 1E5))
        }
        return points
    }
}
