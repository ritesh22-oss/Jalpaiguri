package com.myjpg.app.models

import kotlinx.serialization.Serializable

@Serializable
data class Shop(
    val id: String,
    val name: String,
    val category: String, // "Groceries", "Electronics", "Pharmacy", "Garments", "Sweet Shop", "Restaurant"
    val ownerName: String,
    val phone: String,
    val location: String, // e.g. "DBC Road, Jalpaiguri"
    val description: String,
    val rating: Double = 4.8,
    val isOpen: Boolean = true,
    val verified: Boolean = true,
    val imageUrl: String = "",
    val latitude: Double? = 26.5225,
    val longitude: Double? = 88.7194
)

@Serializable
data class CitizenService(
    val id: String,
    val title: String,
    val category: String,
    val provider: String,
    val contact: String,
    val description: String,
    val iconName: String = "info"
)

@Serializable
data class EmergencyContact(
    val id: String,
    val title: String,
    val number: String,
    val category: String, // "Police", "Hospital", "Fire", "Ambulance", "Municipality"
    val location: String = "Jalpaiguri"
)
