package com.myjpg.app.maps

import android.util.Log
import com.google.android.gms.maps.model.LatLng
import com.myjpg.app.BuildConfig
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import org.json.JSONObject
import java.io.BufferedReader
import java.io.InputStreamReader
import java.io.OutputStreamWriter
import java.net.HttpURLConnection
import java.net.SocketTimeoutException
import java.net.URL
import java.net.UnknownHostException

object JalpaiguriRoutesClient {
    private const val TAG = "MYJPG_RoutesClient"
    private const val GOOGLE_ROUTES_ENDPOINT = "https://routes.googleapis.com/directions/v2:computeRoutes"
    private const val SOLUTION_CHANNEL = "gmp_mcp_codeassist_v1_aistudio"
    private const val FIELD_MASK =
        "routes.description,routes.duration,routes.distanceMeters,routes.polyline.encodedPolyline,routes.legs.steps.distanceMeters,routes.legs.steps.navigationInstruction"

    suspend fun computeRoute(
        origin: LatLng,
        destination: LatLng,
        travelMode: TravelModeOption,
        baseUrl: String = BuildConfig.ROUTES_PROXY_BASE_URL
    ): Result<ComputedRouteResult> = withContext(Dispatchers.IO) {
        val apiKey = BuildConfig.MAPS_API_KEY
        if (apiKey.isNotBlank()) {
            val directRes = computeViaGoogleRoutesApi(origin, destination, travelMode, apiKey)
            if (directRes.isSuccess) return@withContext directRes

            val msg = directRes.exceptionOrNull()?.message.orEmpty()
            val canTryProxy = (msg.contains("401") || msg.contains("403")) && baseUrl.isNotBlank()
            if (!canTryProxy) return@withContext directRes
        }

        if (baseUrl.isBlank()) {
            return@withContext Result.failure(
                IllegalStateException("Google Maps API key is not configured for route calculation.")
            )
        }
        computeViaProxy(origin, destination, travelMode, baseUrl)
    }

    private fun computeViaGoogleRoutesApi(
        origin: LatLng,
        destination: LatLng,
        travelMode: TravelModeOption,
        apiKey: String
    ): Result<ComputedRouteResult> {
        var connection: HttpURLConnection? = null
        return try {
            connection = (URL(GOOGLE_ROUTES_ENDPOINT).openConnection() as HttpURLConnection).apply {
                requestMethod = "POST"
                connectTimeout = 15000
                readTimeout = 15000
                doOutput = true
                setRequestProperty("Content-Type", "application/json")
                setRequestProperty("Accept", "application/json")
                setRequestProperty("X-Goog-Api-Key", apiKey)
                setRequestProperty("X-Goog-FieldMask", FIELD_MASK)
                setRequestProperty("X-Goog-Maps-Solution-ID", SOLUTION_CHANNEL)
            }

            val body = JSONObject().apply {
                put("origin", JSONObject().apply {
                    put("location", JSONObject().apply {
                        put("latLng", JSONObject().apply {
                            put("latitude", origin.latitude)
                            put("longitude", origin.longitude)
                        })
                    })
                })
                put("destination", JSONObject().apply {
                    put("location", JSONObject().apply {
                        put("latLng", JSONObject().apply {
                            put("latitude", destination.latitude)
                            put("longitude", destination.longitude)
                        })
                    })
                })
                put("travelMode", travelMode.apiValue)
                if (travelMode == TravelModeOption.DRIVE || travelMode == TravelModeOption.TWO_WHEELER) {
                    put("routingPreference", "TRAFFIC_AWARE")
                }
                put("computeAlternativeRoutes", true)
                put("languageCode", "en-US")
                put("units", "METRIC")
            }

            OutputStreamWriter(connection.outputStream, Charsets.UTF_8).use { writer ->
                writer.write(body.toString())
                writer.flush()
            }

            val status = connection.responseCode
            val stream = if (status in 200..299) connection.inputStream else connection.errorStream
            val responseText = stream?.let {
                BufferedReader(InputStreamReader(it, Charsets.UTF_8)).use { br -> br.readText() }
            }.orEmpty()

            if (status !in 200..299) {
                val msg = formatHttpError(status, responseText)
                Log.e(TAG, "Routes API v2 failed HTTP $status: $msg")
                return Result.failure(IllegalStateException(msg))
            }

            parseRoutesJson(responseText)
        } catch (e: UnknownHostException) {
            Log.e(TAG, "Offline error in computeViaGoogleRoutesApi: ${e.message}")
            Result.failure(IllegalStateException("No internet connection detected. Connect to compute route."))
        } catch (e: SocketTimeoutException) {
            Log.e(TAG, "Timeout in computeViaGoogleRoutesApi")
            Result.failure(IllegalStateException("Route calculation timed out. Please try again."))
        } catch (e: Exception) {
            Log.e(TAG, "Exception in computeViaGoogleRoutesApi: ${e.message}")
            Result.failure(e)
        } finally {
            connection?.disconnect()
        }
    }

    private fun computeViaProxy(
        origin: LatLng,
        destination: LatLng,
        travelMode: TravelModeOption,
        baseUrl: String
    ): Result<ComputedRouteResult> {
        val endpoint = "${baseUrl.trimEnd('/')}/api/routes/compute"
        var connection: HttpURLConnection? = null
        return try {
            connection = (URL(endpoint).openConnection() as HttpURLConnection).apply {
                requestMethod = "POST"
                connectTimeout = 15000
                readTimeout = 15000
                doOutput = true
                setRequestProperty("Content-Type", "application/json")
                setRequestProperty("Accept", "application/json")
            }

            val body = JSONObject().apply {
                put("origin", JSONObject().apply {
                    put("lat", origin.latitude)
                    put("lng", origin.longitude)
                })
                put("destination", JSONObject().apply {
                    put("lat", destination.latitude)
                    put("lng", destination.longitude)
                })
                put("travelMode", travelMode.apiValue)
            }

            OutputStreamWriter(connection.outputStream, Charsets.UTF_8).use { writer ->
                writer.write(body.toString())
                writer.flush()
            }

            val status = connection.responseCode
            val stream = if (status in 200..299) connection.inputStream else connection.errorStream
            val responseText = stream?.let {
                BufferedReader(InputStreamReader(it, Charsets.UTF_8)).use { br -> br.readText() }
            }.orEmpty()

            if (status !in 200..299) {
                val msg = formatHttpError(status, responseText)
                Log.e(TAG, "Proxy route failed HTTP $status: $msg")
                return Result.failure(IllegalStateException(msg))
            }

            parseRoutesJson(responseText)
        } catch (e: Exception) {
            Log.e(TAG, "Proxy route exception: ${e.message}")
            Result.failure(e)
        } finally {
            connection?.disconnect()
        }
    }

    private fun parseRoutesJson(responseText: String): Result<ComputedRouteResult> {
        val json = JSONObject(responseText)
        val routes = json.optJSONArray("routes")
        if (routes == null || routes.length() == 0) {
            return Result.failure(
                IllegalStateException("No route found between these coordinates.")
            )
        }

        val routeObj = routes.getJSONObject(0)
        val distanceMeters = routeObj.optInt("distanceMeters", 0)
        val durationRaw = routeObj.optString("duration", "0s")
        val routeDescription = routeObj.optString("description", "")
        val encodedPolyline = routeObj.optJSONObject("polyline")?.optString("encodedPolyline").orEmpty()
        val polylinePoints = JalpaiguriGeoUtils.decodeGooglePolyline(encodedPolyline)

        val stepsList = ArrayList<RouteStepItem>()
        val legs = routeObj.optJSONArray("legs")
        if (legs != null && legs.length() > 0) {
            val steps = legs.getJSONObject(0).optJSONArray("steps")
            if (steps != null) {
                for (i in 0 until steps.length()) {
                    val step = steps.getJSONObject(i)
                    val nav = step.optJSONObject("navigationInstruction")
                    val instr = nav?.optString("instructions")?.takeIf { it.isNotBlank() } ?: "Continue"
                    val stepDist = step.optInt("distanceMeters", 0)
                    stepsList.add(RouteStepItem(instr, stepDist))
                }
            }
        }

        return Result.success(
            ComputedRouteResult(
                distanceMeters = distanceMeters,
                durationText = JalpaiguriGeoUtils.formatDurationSeconds(durationRaw),
                polylinePoints = polylinePoints,
                steps = stepsList,
                encodedPolyline = encodedPolyline,
                routeDescription = routeDescription
            )
        )
    }

    private fun formatHttpError(status: Int, responseText: String): String {
        val googleMsg = try {
            JSONObject(responseText).optJSONObject("error")?.optString("message").orEmpty()
        } catch (_: Exception) {
            ""
        }
        return when (status) {
            400 -> "Invalid route coordinates (400)"
            401, 403 -> "Routes API authorization error ($status): ${googleMsg.ifBlank { "Check Routes API enablement & key restrictions" }}"
            404 -> "Route endpoint not found (404)"
            429 -> "Google Maps route quota limit reached (429). Please try again later."
            in 500..599 -> "Google Routes service unavailable ($status)"
            else -> "Route request failed ($status)"
        }
    }
}
