package com.myjpg.app.maps

import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json
import kotlin.math.roundToInt

object MapsSerialization {
    val json = Json {
        ignoreUnknownKeys = true
        encodeDefaults = true
    }

    fun encodeSavedPlaces(items: List<SavedPlaceRecord>): String {
        return json.encodeToString(items)
    }

    fun decodeSavedPlaces(raw: String?): List<SavedPlaceRecord> {
        if (raw.isNullOrBlank()) return emptyList()
        return runCatching { json.decodeFromString<List<SavedPlaceRecord>>(raw) }.getOrDefault(emptyList())
    }

    fun encodeCachedRoutes(items: List<CachedRouteRecord>): String {
        return json.encodeToString(items)
    }

    fun decodeCachedRoutes(raw: String?): List<CachedRouteRecord> {
        if (raw.isNullOrBlank()) return emptyList()
        return runCatching { json.decodeFromString<List<CachedRouteRecord>>(raw) }.getOrDefault(emptyList())
    }
}

class SpatialValueCache<T>(
    private val maxEntries: Int = 64
) {
    private val entries = LinkedHashMap<String, T>()

    fun spatialKey(lat: Double, lng: Double, suffix: String = ""): String {
        // ~11 meter grid bucket
        val rLat = (lat * 10000.0).roundToInt()
        val rLng = (lng * 10000.0).roundToInt()
        return "$rLat:$rLng:$suffix"
    }

    fun get(key: String): T? = entries[key]

    fun put(key: String, value: T) {
        if (entries.size >= maxEntries && !entries.containsKey(key)) {
            val oldestKey = entries.keys.firstOrNull()
            if (oldestKey != null) {
                entries.remove(oldestKey)
            }
        }
        entries[key] = value
    }

    fun clear() {
        entries.clear()
    }
}
