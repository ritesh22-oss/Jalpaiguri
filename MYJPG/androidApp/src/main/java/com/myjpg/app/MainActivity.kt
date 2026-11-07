package com.myjpg.app

import android.os.Bundle
import android.widget.Toast
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.lifecycle.lifecycleScope
import com.google.firebase.auth.FirebaseAuth
import com.myjpg.app.auth.GoogleAuthManager
import com.myjpg.app.location.LocationValidator
import com.myjpg.app.models.AuthState
import com.myjpg.app.models.UserProfile
import com.myjpg.app.ui.AuthScreen
import com.myjpg.app.ui.HomeScreen
import com.myjpg.app.ui.MYJPGTheme
import com.myjpg.app.ui.OutsideCoverageScreen
import kotlinx.coroutines.launch

class MainActivity : ComponentActivity() {

    private lateinit var googleAuthManager: GoogleAuthManager
    private val firebaseAuth: FirebaseAuth by lazy { FirebaseAuth.getInstance() }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        googleAuthManager = GoogleAuthManager(this)

        setContent {
            MYJPGTheme {
                var currentAuthState by remember { mutableStateOf(AuthState.AUTH_INITIALIZING) }
                var currentUserProfile by remember { mutableStateOf<UserProfile?>(null) }
                var isLoading by remember { mutableStateOf(false) }
                var errorMessage by remember { mutableStateOf<String?>(null) }

                // Observe Firebase Authentication State Changes
                DisposableEffect(Unit) {
                    val authListener = FirebaseAuth.AuthStateListener { auth ->
                        val user = auth.currentUser
                        if (user != null) {
                            val profile = UserProfile(
                                id = user.uid,
                                name = user.displayName ?: "Citizen of Jalpaiguri",
                                email = user.email ?: "",
                                phone = user.phoneNumber ?: "",
                                location = "Kadamtala, Jalpaiguri"
                            )
                            currentUserProfile = profile

                            // Check GPS Location Boundaries
                            val isInside = LocationValidator.isInsideJalpaiguri(profile.latitude, profile.longitude)
                            currentAuthState = if (isInside) AuthState.INSIDE_JALPAIGURI else AuthState.OUTSIDE_JALPAIGURI
                        } else {
                            currentUserProfile = null
                            currentAuthState = AuthState.SIGNED_OUT
                        }
                    }
                    firebaseAuth.addAuthStateListener(authListener)
                    onDispose {
                        firebaseAuth.removeAuthStateListener(authListener)
                    }
                }

                when (currentAuthState) {
                    AuthState.AUTH_INITIALIZING -> {
                        Box(
                            modifier = Modifier.fillMaxSize(),
                            contentAlignment = Alignment.Center
                        ) {
                            CircularProgressIndicator()
                        }
                    }

                    AuthState.SIGNED_OUT, AuthState.AUTH_ERROR -> {
                        AuthScreen(
                            onGoogleSignInClick = {
                                isLoading = true
                                errorMessage = null
                                lifecycleScope.launch {
                                    val result = googleAuthManager.signInWithGoogle()
                                    isLoading = false
                                    result.onFailure { err ->
                                        errorMessage = err.message ?: "Google Sign-In failed"
                                    }
                                }
                            },
                            onPhoneSignInClick = { phone ->
                                Toast.makeText(this@MainActivity, "Dispatching SMS OTP to +91 $phone...", Toast.LENGTH_SHORT).show()
                            },
                            isLoading = isLoading,
                            errorMessage = errorMessage
                        )
                    }

                    AuthState.INSIDE_JALPAIGURI -> {
                        currentUserProfile?.let { user ->
                            HomeScreen(
                                user = user,
                                onOpenShopsClick = {
                                    Toast.makeText(this@MainActivity, "Opening Jalpaiguri Shop Directory", Toast.LENGTH_SHORT).show()
                                },
                                onOpenAiAssistantClick = {
                                    Toast.makeText(this@MainActivity, "Launching Jalpaiguri AI Assistant", Toast.LENGTH_SHORT).show()
                                },
                                onSignOutClick = {
                                    googleAuthManager.signOut()
                                }
                            )
                        }
                    }

                    AuthState.OUTSIDE_JALPAIGURI -> {
                        OutsideCoverageScreen(
                            user = currentUserProfile,
                            onSelectLocationClick = {
                                currentAuthState = AuthState.INSIDE_JALPAIGURI
                            },
                            onContinueAnywayClick = {
                                currentAuthState = AuthState.INSIDE_JALPAIGURI
                            },
                            onSignOutClick = {
                                googleAuthManager.signOut()
                            }
                        )
                    }

                    else -> {
                        Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                            CircularProgressIndicator()
                        }
                    }
                }
            }
        }
    }
}
