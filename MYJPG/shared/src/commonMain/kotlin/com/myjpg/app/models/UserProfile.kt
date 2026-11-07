package com.myjpg.app.models

import kotlinx.serialization.Serializable

@Serializable
data class UserProfile(
    val id: String = "",
    val name: String = "",
    val email: String = "",
    val phone: String = "",
    val bloodGroup: String = "O+",
    val location: String = "Kadamtala, Jalpaiguri",
    val role: String = "citizen", // "citizen" or "admin"
    val language: String = "English", // "English" or "Bengali"
    val isBloodDonor: Boolean = true,
    val isVolunteer: Boolean = false,
    val tourCompleted: Boolean = false,
    val latitude: Double? = null,
    val longitude: Double? = null,
    val createdAt: String = ""
)

enum class AuthState {
    AUTH_INITIALIZING,
    SIGNED_OUT,
    AUTHENTICATED_PROFILE_LOADING,
    PROFILE_INCOMPLETE,
    INSIDE_JALPAIGURI,
    OUTSIDE_JALPAIGURI,
    AUTH_ERROR
}
