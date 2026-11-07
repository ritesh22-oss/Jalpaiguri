package com.myjpg.app.ui

import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

@Composable
fun AuthScreen(
    onGoogleSignInClick: () -> Unit,
    onPhoneSignInClick: (String) -> Unit,
    isLoading: Boolean,
    errorMessage: String? = null
) {
    var phoneInput by remember { mutableStateOf("") }
    var selectedLanguage by remember { mutableStateOf("English") }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.background)
            .padding(24.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        // App Header & Branding
        Surface(
            modifier = Modifier.size(80.dp),
            shape = RoundedCornerShape(20.dp),
            color = PrimaryBlue
        ) {
            Box(contentAlignment = Alignment.Center) {
                Text(
                    text = "JPG",
                    color = Color.White,
                    fontWeight = FontWeight.Bold,
                    fontSize = 24.sp
                )
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        Text(
            text = if (selectedLanguage == "Bengali") "মাইজলপাইগুড়ি কানেক্ট" else "MYJPG - Jalpaiguri Connect",
            style = MaterialTheme.typography.headlineSmall,
            fontWeight = FontWeight.Bold,
            color = PrimaryBlue,
            textAlign = TextAlign.Center
        )

        Text(
            text = if (selectedLanguage == "Bengali") "জলপাইগুড়ির নিজস্ব ডিজিটাল নাগরিক পোর্টাল" else "Your Civic Utility & Local Community Portal",
            style = MaterialTheme.typography.bodyMedium,
            color = Color.Gray,
            textAlign = TextAlign.Center,
            modifier = Modifier.padding(top = 4.dp, bottom = 24.dp)
        )

        // Error Banner
        errorMessage?.let { msg ->
            Card(
                colors = CardDefaults.cardColors(containerColor = Color(0xFFFEE2E2)),
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(bottom = 16.dp)
            ) {
                Text(
                    text = msg,
                    color = Color(0xFF991B1B),
                    modifier = Modifier.padding(12.dp),
                    style = MaterialTheme.typography.bodySmall
                )
            }
        }

        // Native Google Sign-In Button (Credential Manager)
        Button(
            onClick = onGoogleSignInClick,
            enabled = !isLoading,
            colors = ButtonDefaults.buttonColors(containerColor = PrimaryBlue),
            shape = RoundedCornerShape(12.dp),
            modifier = Modifier
                .fillMaxWidth()
                .height(52.dp)
        ) {
            if (isLoading) {
                CircularProgressIndicator(
                    color = Color.White,
                    modifier = Modifier.size(24.dp)
                )
            } else {
                Text(
                    text = if (selectedLanguage == "Bengali") "Google দিয়ে সাইন-ইন করুন" else "Sign in with Google",
                    fontWeight = FontWeight.Bold,
                    fontSize = 16.sp
                )
            }
        }

        Spacer(modifier = Modifier.height(20.dp))

        Row(
            verticalAlignment = Alignment.CenterVertically,
            modifier = Modifier.padding(vertical = 12.dp)
        ) {
            HorizontalDivider(modifier = Modifier.weight(1f))
            Text(
                text = "  OR  ",
                style = MaterialTheme.typography.labelSmall,
                color = Color.Gray
            )
            HorizontalDivider(modifier = Modifier.weight(1f))
        }

        // Phone OTP Input Section
        OutlinedTextField(
            value = phoneInput,
            onValueChange = { if (it.length <= 10) phoneInput = it.filter { c -> c.isDigit() } },
            label = { Text(if (selectedLanguage == "Bengali") "১০ ডিজিটের মোবাইল নম্বর" else "10-digit Mobile Number") },
            prefix = { Text("+91 ") },
            singleLine = true,
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(12.dp)
        )

        Spacer(modifier = Modifier.height(12.dp))

        OutlinedButton(
            onClick = { if (phoneInput.length == 10) onPhoneSignInClick(phoneInput) },
            enabled = phoneInput.length == 10 && !isLoading,
            modifier = Modifier
                .fillMaxWidth()
                .height(48.dp),
            shape = RoundedCornerShape(12.dp)
        ) {
            Text(if (selectedLanguage == "Bengali") "ওটিপি (OTP) পাঠান" else "Send Phone OTP")
        }

        Spacer(modifier = Modifier.height(32.dp))

        // Language Switcher Toggle
        Row(
            horizontalArrangement = Arrangement.Center,
            verticalAlignment = Alignment.CenterVertically
        ) {
            TextButton(onClick = { selectedLanguage = "English" }) {
                Text(
                    text = "English",
                    fontWeight = if (selectedLanguage == "English") FontWeight.Bold else FontWeight.Normal,
                    color = if (selectedLanguage == "English") PrimaryBlue else Color.Gray
                )
            }
            Text(text = "|", color = Color.LightGray)
            TextButton(onClick = { selectedLanguage = "Bengali" }) {
                Text(
                    text = "বাংলা",
                    fontWeight = if (selectedLanguage == "Bengali") FontWeight.Bold else FontWeight.Normal,
                    color = if (selectedLanguage == "Bengali") PrimaryBlue else Color.Gray
                )
            }
        }
    }
}
