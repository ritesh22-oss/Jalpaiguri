package com.myjpg.app.location

object LocationValidator {
    // Jalpaiguri District Approximate Geographic Coordinates Boundary
    const val MIN_LAT = 26.3500
    const val MAX_LAT = 26.7500
    const val MIN_LNG = 88.5000
    const val MAX_LNG = 88.9500

    // Jalpaiguri Town Center Coordinates (Kadamtala / DBC Road)
    const val JALPAIGURI_CENTER_LAT = 26.5225
    const val JALPAIGURI_CENTER_LNG = 88.7194

    /**
     * Validates whether a given latitude and longitude falls within Jalpaiguri district service area.
     * Note: Being outside Jalpaiguri shows the Outside Coverage view, but MUST NEVER sign out the user!
     */
    fun isInsideJalpaiguri(latitude: Double?, longitude: Double?): Boolean {
        if (latitude == null || longitude == null) {
            // Default to true if location is manually set or unverified to prevent locking out citizens
            return true
        }
        return latitude in MIN_LAT..MAX_LAT && longitude in MIN_LNG..MAX_LNG
    }

    /**
     * Calculates distance between user coordinates and Jalpaiguri center in kilometers (Haversine formula).
     */
    fun distanceToJalpaiguriCenterKm(latitude: Double, longitude: Double): Double {
        val r = 6371.0 // Radius of Earth in kilometers
        val dLat = (JALPAIGURI_CENTER_LAT - latitude) * (kotlin.math.PI / 180.0)
        val dLng = (JALPAIGURI_CENTER_LNG - longitude) * (kotlin.math.PI / 180.0)

        val a = kotlin.math.sin(dLat / 2) * kotlin.math.sin(dLat / 2) +
                kotlin.math.cos(latitude * (kotlin.math.PI / 180.0)) *
                kotlin.math.cos(JALPAIGURI_CENTER_LAT * (kotlin.math.PI / 180.0)) *
                kotlin.math.sin(dLng / 2) * kotlin.math.sin(dLng / 2)

        val c = 2 * kotlin.math.atan2(kotlin.math.sqrt(a), kotlin.math.sqrt(1 - a))
        return r * c
    }
}
