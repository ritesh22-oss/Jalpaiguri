package com.myjpg.app.maps

import android.util.Log
import com.google.android.gms.maps.model.LatLng
import com.myjpg.app.BuildConfig
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import org.json.JSONArray
import org.json.JSONObject
import java.io.BufferedReader
import java.io.InputStreamReader
import java.io.OutputStreamWriter
import java.net.HttpURLConnection
import java.net.SocketTimeoutException
import java.net.URL
import java.net.UnknownHostException
import java.util.concurrent.ConcurrentHashMap

data class GeocodeV4Result(
    val kind: LocationKind,
    val title: String,
    val category: String,
    val formattedAddress: String,
    val roadName: String,
    val locality: String,
    val city: String,
    val postalCode: String,
    val placeId: String,
    val primaryLandmarkName: String = "",
    val nearbyLandmarks: List<String> = emptyList()
)

private data class CachedGeocodeEntry(
    val result: GeocodeV4Result,
    val expiresAtMs: Long
)

object JalpaiguriGeocodingClient {
    private const val TAG = "MYJPG_Geocoding"
    private const val SOLUTION_CHANNEL = "gmp_mcp_codeassist_v1_aistudio"
    private const val CACHE_TTL_MS = 30L * 60L * 1000L

    private val cache = ConcurrentHashMap<String, CachedGeocodeEntry>()

    suspend fun reverseGeocode(
        latLng: LatLng,
        languageCode: String = "en"
    ): Result<GeocodeV4Result> = withContext(Dispatchers.IO) {
        val cacheKey = String.format("%.4f,%.4f:%s", latLng.latitude, latLng.longitude, languageCode)
        cache[cacheKey]?.let { entry ->
            if (System.currentTimeMillis() < entry.expiresAtMs) {
                return@withContext Result.success(entry.result)
            }
        }

        val apiKey = BuildConfig.MAPS_API_KEY
        if (apiKey.isNotBlank()) {
            val directResult = callDirectGeocodeV4(latLng, languageCode, apiKey)
            if (directResult.isSuccess) {
                directResult.getOrNull()?.let { res ->
                    cache[cacheKey] = CachedGeocodeEntry(res, System.currentTimeMillis() + CACHE_TTL_MS)
                }
                return@withContext directResult
            }

            val errMsg = directResult.exceptionOrNull()?.message.orEmpty()
            // If Android-restricted key cannot call REST endpoints directly, try backend proxy if configured
            val isAuthError = errMsg.contains("401") || errMsg.contains("403")
            if (!isAuthError || BuildConfig.ROUTES_PROXY_BASE_URL.isBlank()) {
                return@withContext directResult
            }
        }

        val proxyResult = callBackendProxy(latLng, languageCode)
        if (proxyResult.isSuccess) {
            proxyResult.getOrNull()?.let { res ->
                cache[cacheKey] = CachedGeocodeEntry(res, System.currentTimeMillis() + CACHE_TTL_MS)
            }
        }
        proxyResult
    }

    private fun callDirectGeocodeV4(
        latLng: LatLng,
        languageCode: String,
        apiKey: String
    ): Result<GeocodeV4Result> {
        val endpoint =
            "https://geocode.googleapis.com/v4/geocode/location/${latLng.latitude},${latLng.longitude}?languageCode=$languageCode&regionCode=IN"
        var connection: HttpURLConnection? = null
        return try {
            connection = (URL(endpoint).openConnection() as HttpURLConnection).apply {
                requestMethod = "GET"
                connectTimeout = 10000
                readTimeout = 10000
                setRequestProperty("Accept", "application/json")
                setRequestProperty("X-Goog-Api-Key", apiKey)
                setRequestProperty("X-Goog-Maps-Solution-ID", SOLUTION_CHANNEL)
            }

            val status = connection.responseCode
            val stream = if (status in 200..299) connection.inputStream else connection.errorStream
            val body = stream?.let {
                BufferedReader(InputStreamReader(it, Charsets.UTF_8)).use { br -> br.readText() }
            }.orEmpty()

            if (status !in 200..299) {
                val msg = classifyHttpError("Geocode v4", status, body)
                Log.e(TAG, "Geocoding v4 failed HTTP $status (msg=$msg)")
                return Result.failure(IllegalStateException(msg))
            }

            val geoJson = JSONObject(body)
            val results = geoJson.optJSONArray("results") ?: JSONArray()
            var formattedAddress = ""
            var roadName = ""
            var neighborhood = ""
            var sublocality = ""
            var city = ""
            var postalCode = ""
            var geocodePlaceId = ""
            var primaryTypes = emptyList<String>()

            for (i in 0 until results.length()) {
                val r = results.getJSONObject(i)
                val comps = r.optJSONArray("addressComponents")
                if (formattedAddress.isBlank() && r.has("formattedAddress")) {
                    formattedAddress = r.optString("formattedAddress", "")
                    geocodePlaceId = r.optString("placeId", "")
                    val typesArr = r.optJSONArray("types")
                    if (typesArr != null) {
                        primaryTypes = (0 until typesArr.length()).map { idx -> typesArr.optString(idx) }
                    }
                }
                if (roadName.isBlank()) roadName = extractJsonComp(comps, "route")
                if (neighborhood.isBlank()) neighborhood = extractJsonComp(comps, "neighborhood")
                if (sublocality.isBlank()) {
                    sublocality = extractJsonComp(comps, "sublocality_level_1")
                        .ifBlank { extractJsonComp(comps, "sublocality_level_2") }
                        .ifBlank { extractJsonComp(comps, "sublocality") }
                }
                if (city.isBlank()) {
                    city = extractJsonComp(comps, "locality")
                        .ifBlank { r.optJSONObject("postalAddress")?.optString("locality").orEmpty() }
                }
                if (postalCode.isBlank()) {
                    postalCode = extractJsonComp(comps, "postal_code")
                        .ifBlank { r.optJSONObject("postalAddress")?.optString("postalCode").orEmpty() }
                }
            }

            // Enrich with Geocode v4 Destinations for POIs & landmarks when available
            val destSummary = fetchDestinationsSummary(latLng, languageCode, apiKey)
            val locality = sublocality
                .ifBlank { neighborhood }
                .ifBlank { destSummary.containingArea }
                .ifBlank { city }

            val kind: LocationKind
            val title: String
            val category: String
            if (destSummary.primaryPoiName.isNotBlank() &&
                destSummary.primaryPoiType != "street_address" &&
                destSummary.primaryPoiType != "premise"
            ) {
                kind = LocationKind.POI
                title = destSummary.primaryPoiName
                category = destSummary.primaryPoiType.replace('_', ' ').ifBlank { "Landmark" }
            } else if (roadName.isNotBlank()) {
                kind = LocationKind.ROAD
                title = roadName
                category = if (primaryTypes.contains("route")) "Road / Street" else "Street Address"
            } else if (locality.isNotBlank()) {
                kind = LocationKind.LOCALITY
                title = locality
                category = "Locality / Area"
            } else if (destSummary.landmarks.isNotEmpty()) {
                kind = LocationKind.LOCALITY
                title = "Near ${destSummary.landmarks.first()}"
                category = "Area"
            } else {
                kind = LocationKind.COORDINATES
                title = String.format("%.5f, %.5f", latLng.latitude, latLng.longitude)
                category = "Coordinates"
            }

            val finalFormatted = formattedAddress.ifBlank {
                listOf(roadName, locality, city, postalCode).filter { it.isNotBlank() }.joinToString(", ")
            }.ifBlank {
                String.format("%.5f, %.5f", latLng.latitude, latLng.longitude)
            }

            Result.success(
                GeocodeV4Result(
                    kind = kind,
                    title = title,
                    category = category,
                    formattedAddress = finalFormatted,
                    roadName = roadName,
                    locality = locality.ifBlank { city },
                    city = city.ifBlank { "Jalpaiguri" },
                    postalCode = postalCode,
                    placeId = destSummary.primaryPlaceId.ifBlank { geocodePlaceId },
                    primaryLandmarkName = destSummary.primaryPoiName,
                    nearbyLandmarks = destSummary.landmarks
                )
            )
        } catch (e: UnknownHostException) {
            Log.e(TAG, "Offline or DNS error during reverse geocode: ${e.message}")
            Result.failure(IllegalStateException("No internet connection for location lookup."))
        } catch (e: SocketTimeoutException) {
            Log.e(TAG, "Timeout during reverse geocode")
            Result.failure(IllegalStateException("Location lookup timed out. Please tap again."))
        } catch (e: Exception) {
            Log.e(TAG, "Reverse geocode exception: ${e.message}")
            Result.failure(IllegalStateException(e.message ?: "Unable to resolve coordinates."))
        } finally {
            connection?.disconnect()
        }
    }

    private data class DestSummary(
        val primaryPoiName: String = "",
        val primaryPoiType: String = "",
        val primaryPlaceId: String = "",
        val containingArea: String = "",
        val landmarks: List<String> = emptyList()
    )

    private fun fetchDestinationsSummary(
        latLng: LatLng,
        languageCode: String,
        apiKey: String
    ): DestSummary {
        var connection: HttpURLConnection? = null
        return try {
            val url = URL("https://geocode.googleapis.com/v4/geocode/destinations")
            connection = (url.openConnection() as HttpURLConnection).apply {
                requestMethod = "POST"
                connectTimeout = 6000
                readTimeout = 6000
                doOutput = true
                setRequestProperty("Content-Type", "application/json")
                setRequestProperty("X-Goog-Api-Key", apiKey)
                setRequestProperty("X-Goog-FieldMask", "destinations.primary,destinations.containingPlaces,destinations.landmarks")
                setRequestProperty("X-Goog-Maps-Solution-ID", SOLUTION_CHANNEL)
            }
            val reqBody = JSONObject().apply {
                put("locationQuery", JSONObject().apply {
                    put("location", JSONObject().apply {
                        put("latitude", latLng.latitude)
                        put("longitude", latLng.longitude)
                    })
                })
                put("languageCode", languageCode)
            }
            OutputStreamWriter(connection.outputStream, Charsets.UTF_8).use { w ->
                w.write(reqBody.toString())
                w.flush()
            }
            if (connection.responseCode !in 200..299) {
                return DestSummary()
            }
            val text = BufferedReader(InputStreamReader(connection.inputStream, Charsets.UTF_8)).use { it.readText() }
            val json = JSONObject(text)
            val firstDest = json.optJSONArray("destinations")?.optJSONObject(0) ?: return DestSummary()
            val primary = firstDest.optJSONObject("primary")
            val primaryName = primary?.optJSONObject("displayName")?.optString("text").orEmpty()
            val primaryType = primary?.optString("primaryType").orEmpty()
            val primaryPlaceId = primary?.optString("placeId").orEmpty()
            val containingArea = firstDest.optJSONArray("containingPlaces")
                ?.optJSONObject(0)
                ?.optJSONObject("displayName")
                ?.optString("text")
                .orEmpty()
            val landmarksArr = firstDest.optJSONArray("landmarks")
            val landmarks = ArrayList<String>()
            if (landmarksArr != null) {
                for (i in 0 until landmarksArr.length()) {
                    val lName = landmarksArr.optJSONObject(i)
                        ?.optJSONObject("place")
                        ?.optJSONObject("displayName")
                        ?.optString("text")
                        .orEmpty()
                    if (lName.isNotBlank()) landmarks.add(lName)
                }
            }
            DestSummary(primaryName, primaryType, primaryPlaceId, containingArea, landmarks)
        } catch (_: Exception) {
            DestSummary()
        } finally {
            connection?.disconnect()
        }
    }

    private fun callBackendProxy(latLng: LatLng, languageCode: String): Result<GeocodeV4Result> {
        val baseUrl = BuildConfig.ROUTES_PROXY_BASE_URL.trimEnd('/')
        if (baseUrl.isBlank()) {
            return Result.failure(IllegalStateException("Google Maps API key or backend proxy not configured."))
        }
        val endpoint = "$baseUrl/api/location/reverse-geocode?lat=${latLng.latitude}&lng=${latLng.longitude}&language=$languageCode"
        var connection: HttpURLConnection? = null
        return try {
            connection = (URL(endpoint).openConnection() as HttpURLConnection).apply {
                requestMethod = "GET"
                connectTimeout = 10000
                readTimeout = 10000
                setRequestProperty("Accept", "application/json")
            }
            val status = connection.responseCode
            val stream = if (status in 200..299) connection.inputStream else connection.errorStream
            val body = stream?.let {
                BufferedReader(InputStreamReader(it, Charsets.UTF_8)).use { br -> br.readText() }
            }.orEmpty()
            if (status !in 200..299) {
                return Result.failure(IllegalStateException(classifyHttpError("Location lookup", status, body)))
            }
            val json = JSONObject(body)
            val kind = when (json.optString("kind")) {
                "poi" -> LocationKind.POI
                "road" -> LocationKind.ROAD
                "locality" -> LocationKind.LOCALITY
                else -> LocationKind.COORDINATES
            }
            Result.success(
                GeocodeV4Result(
                    kind = kind,
                    title = json.optString("title", json.optString("name", "")),
                    category = json.optString("category", "Location"),
                    formattedAddress = json.optString("name", ""),
                    roadName = json.optString("road", ""),
                    locality = json.optString("locality", ""),
                    city = json.optString("city", "Jalpaiguri"),
                    postalCode = json.optString("pincode", ""),
                    placeId = json.optString("placeId", "")
                )
            )
        } catch (e: Exception) {
            Log.e(TAG, "Proxy reverse geocode error: ${e.message}")
            Result.failure(IllegalStateException(e.message ?: "Location lookup failed."))
        } finally {
            connection?.disconnect()
        }
    }

    private fun extractJsonComp(components: JSONArray?, type: String): String {
        if (components == null) return ""
        for (i in 0 until components.length()) {
            val comp = components.optJSONObject(i) ?: continue
            val types = comp.optJSONArray("types") ?: continue
            for (t in 0 until types.length()) {
                if (types.optString(t) == type) {
                    return comp.optString("longText")
                        .ifBlank { comp.optString("shortText") }
                }
            }
        }
        return ""
    }

    private fun classifyHttpError(service: String, status: Int, body: String): String {
        val apiMsg = try {
            JSONObject(body).optJSONObject("error")?.optString("message").orEmpty()
        } catch (_: Exception) {
            ""
        }
        return when (status) {
            400 -> "$service invalid parameters (400)"
            401, 403 -> "$service authorization/restriction error ($status): ${apiMsg.ifBlank { "Check Geocoding API enablement" }}"
            404 -> "$service endpoint not found (404)"
            429 -> "$service quota limit reached (429). Please retry later."
            in 500..599 -> "$service temporary service error ($status)"
            else -> "$service failed ($status)"
        }
    }
}
