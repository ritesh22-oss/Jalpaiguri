package com.myjpg.app.maps

import kotlin.math.PI
import kotlin.math.atan2
import kotlin.math.cos
import kotlin.math.roundToInt
import kotlin.math.sin
import kotlin.math.sqrt

object GeoAlgorithms {
    val JALPAIGURI_TOWN_CENTER = GeoPoint(26.5228, 88.7245)
    val KADAMTALA_HUB = GeoPoint(26.5218, 88.7289)

    private val HIGHWAY_NOISE_REGEX = Regex("^(nh|sh)\\s*-?\\d+[a-z0-9]*$", RegexOption.IGNORE_CASE)
    private val PLUS_CODE_REGEX = Regex("^[A-Z0-9]{4,8}\\+[A-Z0-9]{2,4}$", RegexOption.IGNORE_CASE)

    private val MINOR_RESIDENTIAL_TYPES = setOf(
        "premise",
        "subpremise",
        "street_address",
        "apartment_building",
        "apartment_complex",
        "housing_complex",
        "condominium_complex",
        "parking",
        "parking_garage"
    )

    fun toRadians(deg: Double): Double = deg * PI / 180.0
    fun toDegrees(rad: Double): Double = rad * 180.0 / PI

    fun haversineKm(a: GeoPoint, b: GeoPoint): Double {
        val r = 6371.0
        val dLat = toRadians(b.lat - a.lat)
        val dLng = toRadians(b.lng - a.lng)
        val sinLat = sin(dLat / 2.0)
        val sinLng = sin(dLng / 2.0)
        val h = sinLat * sinLat +
            cos(toRadians(a.lat)) * cos(toRadians(b.lat)) * sinLng * sinLng
        val c = 2.0 * atan2(sqrt(h), sqrt(1.0 - h))
        return r * c
    }

    fun haversineMeters(a: GeoPoint, b: GeoPoint): Int {
        return (haversineKm(a, b) * 1000.0).roundToInt()
    }

    fun bearingDegrees(from: GeoPoint, to: GeoPoint): Double {
        val lat1 = toRadians(from.lat)
        val lat2 = toRadians(to.lat)
        val dLng = toRadians(to.lng - from.lng)
        val y = sin(dLng) * cos(lat2)
        val x = cos(lat1) * sin(lat2) - sin(lat1) * cos(lat2) * cos(dLng)
        val deg = toDegrees(atan2(y, x))
        return (deg + 360.0) % 360.0
    }

    fun cleanLocalityToken(raw: String?): String {
        val trimmed = raw?.trim().orEmpty()
        if (trimmed.isBlank()) return ""
        val firstPart = trimmed.split(",").firstOrNull()?.trim().orEmpty()
        if (HIGHWAY_NOISE_REGEX.matches(trimmed) || HIGHWAY_NOISE_REGEX.matches(firstPart)) return ""
        if (trimmed.contains("Nh31", ignoreCase = true) && trimmed.length < 20) return ""
        if (PLUS_CODE_REGEX.matches(firstPart)) return ""
        return trimmed
    }

    fun isPlusCode(text: String?): Boolean {
        val first = text?.trim()?.split(" ")?.firstOrNull().orEmpty()
        return PLUS_CODE_REGEX.matches(first)
    }

    fun isGenericResidentialOrMinorPlace(types: List<String>, name: String): Boolean {
        val lowerName = name.trim().lowercase()
        if (lowerName.startsWith("house of ") || lowerName.contains("apartment") || lowerName.contains("niwas")) {
            return true
        }
        return types.any { it in MINOR_RESIDENTIAL_TYPES }
    }

    fun decodePolyline(encoded: String): List<GeoPoint> {
        if (encoded.isBlank()) return emptyList()
        val points = mutableListOf<GeoPoint>()
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

            points.add(GeoPoint(lat / 1E5, lng / 1E5))
        }
        return points
    }

    /**
     * Samples ordered points along a decoded route polyline for Street View Journey Preview.
     * Always includes START and END, plus intermediate stops spaced by at least [minSpacingMeters].
     */
    fun sampleRoutePoints(
        points: List<GeoPoint>,
        targetStops: Int = 8,
        minSpacingMeters: Int = 220
    ): List<Pair<GeoPoint, Int>> {
        if (points.isEmpty()) return emptyList()
        if (points.size == 1) return listOf(points.first() to 0)

        var totalMeters = 0
        val cumulative = IntArray(points.size)
        for (i in 1 until points.size) {
            totalMeters += haversineMeters(points[i - 1], points[i])
            cumulative[i] = totalMeters
        }

        val cappedStops = targetStops.coerceIn(2, 10)
        val interval = maxOf(minSpacingMeters, totalMeters / (cappedStops - 1))
        val selected = mutableListOf<Pair<GeoPoint, Int>>()
        selected.add(points.first() to 0)

        var nextThreshold = interval
        for (i in 1 until points.size - 1) {
            if (cumulative[i] >= nextThreshold && selected.size < cappedStops - 1) {
                selected.add(points[i] to cumulative[i])
                nextThreshold = cumulative[i] + interval
            }
        }

        val last = points.last()
        val lastDist = cumulative.last()
        val prev = selected.last().first
        if (haversineMeters(prev, last) >= 20 || selected.size == 1) {
            selected.add(last to lastDist)
        } else {
            selected[selected.lastIndex] = last to lastDist
        }

        return selected
    }
}
