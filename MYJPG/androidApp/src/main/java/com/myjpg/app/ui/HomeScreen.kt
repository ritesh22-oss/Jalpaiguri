package com.myjpg.app.ui

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.myjpg.app.models.EmergencyContact
import com.myjpg.app.models.Shop
import com.myjpg.app.models.UserProfile

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun HomeScreen(
    user: UserProfile,
    onOpenShopsClick: () -> Unit,
    onOpenAiAssistantClick: () -> Unit,
    onSignOutClick: () -> Unit
) {
    var language by remember { mutableStateOf("English") }

    val emergencyContacts = listOf(
        EmergencyContact("1", "Jalpaiguri Police Control Room", "100", "Police"),
        EmergencyContact("2", "Jalpaiguri District Hospital", "03561-222238", "Hospital"),
        EmergencyContact("3", "Fire & Rescue Station", "101", "Fire"),
        EmergencyContact("4", "Blood Bank Hot Line", "03561-220011", "Ambulance")
    )

    val sampleShops = listOf(
        Shop("s1", "Babu Sweet Stall", "Sweet Shop", "Ashok Roy", "+91 98320 11223", "Kadamtala, Jalpaiguri", "Famous Jalpaiguri Rosogolla & Mishti Doi", 4.9),
        Shop("s2", "Jalpaiguri Central Pharmacy", "Pharmacy", "Dr. S. Das", "+91 94340 55667", "DBC Road, Jalpaiguri", "24x7 Medicines & Emergency Supplies", 4.8),
        Shop("s3", "North Bengal Electronics", "Electronics", "Pritam Ghosh", "+91 97331 44556", "Dinbazar, Jalpaiguri", "Mobiles, Laptops & Home Appliances", 4.7)
    )

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Column {
                        Text("MYJPG", fontWeight = FontWeight.Bold, color = PrimaryBlue)
                        Text(
                            text = "📍 ${user.location.ifEmpty { "Kadamtala, Jalpaiguri" }}",
                            style = MaterialTheme.typography.labelSmall,
                            color = Color.Gray
                        )
                    }
                },
                actions = {
                    TextButton(onClick = { language = if (language == "English") "Bengali" else "English" }) {
                        Text(if (language == "English") "বাংলা" else "ENG", fontWeight = FontWeight.Bold, color = PrimaryBlue)
                    }
                    IconButton(onClick = onSignOutClick) {
                        Surface(
                            shape = CircleShape,
                            color = PrimaryBlue,
                            modifier = Modifier.size(32.dp)
                        ) {
                            Box(contentAlignment = Alignment.Center) {
                                Text(
                                    text = user.name.take(1).uppercase().ifEmpty { "U" },
                                    color = Color.White,
                                    fontWeight = FontWeight.Bold
                                )
                            }
                        }
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = Color.White)
            )
        },
        floatingActionButton = {
            ExtendedFloatingActionButton(
                onClick = onOpenAiAssistantClick,
                containerColor = PrimaryBlue,
                contentColor = Color.White,
                shape = RoundedCornerShape(16.dp)
            ) {
                Text(if (language == "Bengali") "🤖 এআই সহকারী (AI Assistant)" else "🤖 Ask Jalpaiguri AI")
            }
        }
    ) { padding ->
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .padding(horizontal = 16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            item { Spacer(modifier = Modifier.height(8.dp)) }

            // Welcome Card
            item {
                Card(
                    colors = CardDefaults.cardColors(containerColor = LightBlueBg),
                    shape = RoundedCornerShape(16.dp),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Text(
                            text = if (language == "Bengali") "স্বাগতম, ${user.name}!" else "Welcome back, ${user.name}!",
                            style = MaterialTheme.typography.titleMedium,
                            fontWeight = FontWeight.Bold,
                            color = PrimaryBlue
                        )
                        Spacer(modifier = Modifier.height(4.dp))
                        Text(
                            text = if (language == "Bengali") "জলপাইগুড়ি শহরের সরকারি পরিষেবা ও স্থানীয় ডিরেক্টরি" else "Your one-stop digital portal for Jalpaiguri utilities & local business directory",
                            style = MaterialTheme.typography.bodySmall,
                            color = Color.DarkGray
                        )
                    }
                }
            }

            // Emergency Contacts Banner
            item {
                Text(
                    text = if (language == "Bengali") "জরুরি হেল্পলাইন নম্বর" else "Emergency Helplines",
                    style = MaterialTheme.typography.titleSmall,
                    fontWeight = FontWeight.Bold,
                    color = Color.Black
                )
                Spacer(modifier = Modifier.height(8.dp))
                LazyRow(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                    items(emergencyContacts) { contact ->
                        Card(
                            colors = CardDefaults.cardColors(containerColor = Color(0xFFFFF1F2)),
                            shape = RoundedCornerShape(12.dp),
                            modifier = Modifier.width(180.dp)
                        ) {
                            Column(modifier = Modifier.padding(12.dp)) {
                                Text(contact.category.uppercase(), style = MaterialTheme.typography.labelSmall, color = Color(0xFFBE123C))
                                Text(contact.title, fontWeight = FontWeight.Bold, fontSize = 14.sp, maxLines = 1)
                                Spacer(modifier = Modifier.height(4.dp))
                                Text(contact.number, fontWeight = FontWeight.Bold, color = PrimaryBlue, fontSize = 15.sp)
                            }
                        }
                    }
                }
            }

            // Quick Service Hub
            item {
                Text(
                    text = if (language == "Bengali") "নাগরিক পরিষেবা" else "Citizen Utility Services",
                    style = MaterialTheme.typography.titleSmall,
                    fontWeight = FontWeight.Bold,
                    color = Color.Black
                )
                Spacer(modifier = Modifier.height(8.dp))
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    ServiceCard(
                        title = if (language == "Bengali") "বাসের সময়সূচী" else "Bus Timings",
                        subtitle = "Siliguri & Malbazar",
                        iconText = "🚌",
                        modifier = Modifier.weight(1f)
                    )
                    ServiceCard(
                        title = if (language == "Bengali") "ব্লাড ডোনার" else "Blood Donors",
                        subtitle = "Find O+, A+, B+",
                        iconText = "🩸",
                        modifier = Modifier.weight(1f)
                    )
                }
            }

            // Local Business Directory Header
            item {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = if (language == "Bengali") "জলপাইগুড়ি দোকান ডিরেক্টরি" else "Jalpaiguri Local Shops",
                        style = MaterialTheme.typography.titleSmall,
                        fontWeight = FontWeight.Bold
                    )
                    TextButton(onClick = onOpenShopsClick) {
                        Text("View All", color = PrimaryBlue, fontWeight = FontWeight.Bold)
                    }
                }
            }

            items(sampleShops) { shop ->
                Card(
                    colors = CardDefaults.cardColors(containerColor = Color.White),
                    elevation = CardDefaults.cardElevation(defaultElevation = 2.dp),
                    shape = RoundedCornerShape(12.dp),
                    modifier = Modifier
                        .fillMaxWidth()
                        .clickable { onOpenShopsClick() }
                ) {
                    Row(
                        modifier = Modifier.padding(14.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Surface(
                            shape = RoundedCornerShape(8.dp),
                            color = LightBlueBg,
                            modifier = Modifier.size(48.dp)
                        ) {
                            Box(contentAlignment = Alignment.Center) {
                                Text("🛍️", fontSize = 22.sp)
                            }
                        }
                        Spacer(modifier = Modifier.width(12.dp))
                        Column(modifier = Modifier.weight(1f)) {
                            Text(shop.name, fontWeight = FontWeight.Bold, fontSize = 15.sp)
                            Text("${shop.category} • ${shop.location}", style = MaterialTheme.typography.bodySmall, color = Color.Gray)
                        }
                        Text("⭐ ${shop.rating}", fontWeight = FontWeight.Bold, color = AccentGold, fontSize = 14.sp)
                    }
                }
            }

            item { Spacer(modifier = Modifier.height(80.dp)) }
        }
    }
}

@Composable
fun ServiceCard(title: String, subtitle: String, iconText: String, modifier: Modifier = Modifier) {
    Card(
        colors = CardDefaults.cardColors(containerColor = Color.White),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp),
        shape = RoundedCornerShape(12.dp),
        modifier = modifier
    ) {
        Column(modifier = Modifier.padding(14.dp)) {
            Text(iconText, fontSize = 24.sp)
            Spacer(modifier = Modifier.height(8.dp))
            Text(title, fontWeight = FontWeight.Bold, fontSize = 14.sp)
            Text(subtitle, style = MaterialTheme.typography.labelSmall, color = Color.Gray)
        }
    }
}
