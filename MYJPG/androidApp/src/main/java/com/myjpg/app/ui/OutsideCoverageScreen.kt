package com.myjpg.app.ui

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.myjpg.app.models.UserProfile

@Composable
fun OutsideCoverageScreen(
    user: UserProfile?,
    onSelectLocationClick: () -> Unit,
    onContinueAnywayClick: () -> Unit,
    onSignOutClick: () -> Unit
) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.background)
            .padding(24.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        Card(
            colors = CardDefaults.cardColors(containerColor = Color(0xFFFEF3C7)),
            shape = RoundedCornerShape(16.dp),
            modifier = Modifier.fillMaxWidth()
        ) {
            Column(
                modifier = Modifier.padding(20.dp),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Text(
                    text = "📍 Outside Jalpaiguri District",
                    fontSize = 18.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color(0xFF92400E)
                )

                Spacer(modifier = Modifier.height(8.dp))

                Text(
                    text = "Welcome ${user?.name ?: "Citizen"}! We detected that your current GPS location is outside Jalpaiguri. MYJPG is tailored for Jalpaiguri civic utilities, local bus timings, and municipal emergency services.",
                    style = MaterialTheme.typography.bodyMedium,
                    color = Color(0xFF78350F),
                    textAlign = TextAlign.Center
                )
            }
        }

        Spacer(modifier = Modifier.height(24.dp))

        Text(
            text = "Your account session remains active.",
            style = MaterialTheme.typography.bodySmall,
            color = Color.Gray
        )

        Spacer(modifier = Modifier.height(16.dp))

        // Option 1: Select Jalpaiguri Locality Manually
        Button(
            onClick = onSelectLocationClick,
            colors = ButtonDefaults.buttonColors(containerColor = PrimaryBlue),
            shape = RoundedCornerShape(12.dp),
            modifier = Modifier
                .fillMaxWidth()
                .height(48.dp)
        ) {
            Text("Select Jalpaiguri Locality Manually", fontWeight = FontWeight.Bold)
        }

        Spacer(modifier = Modifier.height(12.dp))

        // Option 2: Browse Directory Anyway
        OutlinedButton(
            onClick = onContinueAnywayClick,
            shape = RoundedCornerShape(12.dp),
            modifier = Modifier
                .fillMaxWidth()
                .height(48.dp)
        ) {
            Text("Explore Directory & Emergency Numbers")
        }

        Spacer(modifier = Modifier.height(24.dp))

        TextButton(onClick = onSignOutClick) {
            Text("Switch Account / Sign Out", color = Color.Red)
        }
    }
}
