package com.myjpg.app.auth

import android.content.Context
import android.util.Log
import androidx.credentials.CredentialManager
import androidx.credentials.GetCredentialRequest
import androidx.credentials.exceptions.GetCredentialCancellationException
import androidx.credentials.exceptions.GetCredentialException
import com.google.android.libraries.identity.googleid.GetGoogleIdOption
import com.google.android.libraries.identity.googleid.GoogleIdTokenCredential
import com.google.firebase.auth.AuthResult
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.auth.GoogleAuthProvider
import kotlinx.coroutines.tasks.await

class GoogleAuthManager(private val context: Context) {

    private val credentialManager = CredentialManager.create(context)
    private val auth: FirebaseAuth = FirebaseAuth.getInstance()

    companion object {
        private const val TAG = "MYJPG_GoogleAuth"
        // Replace with your Web OAuth Client ID from Firebase Console -> Authentication -> Sign-in method -> Google
        const val WEB_CLIENT_ID = "YOUR_WEB_CLIENT_ID.apps.googleusercontent.com"
    }

    /**
     * Executes Native Google Sign-In using Android Credential Manager API.
     * Displays native OS account chooser bottom sheet, extracts Google ID Token,
     * and exchanges it securely with Firebase Authentication.
     */
    async fun signInWithGoogle(webClientId: String = WEB_CLIENT_ID): Result<AuthResult> {
        return try {
            Log.d(TAG, "Initiating Credential Manager Google Sign-In...")

            val googleIdOption = GetGoogleIdOption.Builder()
                .setFilterByAuthorizedAccounts(false)
                .setServerClientId(webClientId)
                .setAutoSelectEnabled(false)
                .build()

            val request = GetCredentialRequest.Builder()
                .addCredentialOption(googleIdOption)
                .build()

            val result = credentialManager.getCredential(
                request = request,
                context = context
            )

            val credential = result.credential
            if (credential is CustomCredential && credential.type == GoogleIdTokenCredential.TYPE_GOOGLE_ID_TOKEN_CREDENTIAL) {
                val googleIdTokenCredential = GoogleIdTokenCredential.createFrom(credential.data)
                val idToken = googleIdTokenCredential.idToken
                Log.d(TAG, "Successfully received Google ID Token. Authenticating with Firebase...")

                val firebaseCredential = GoogleAuthProvider.getCredential(idToken, null)
                val authResult = auth.signInWithCredential(firebaseCredential).await()
                
                Log.d(TAG, "Firebase Authentication successful for user: ${authResult.user?.email}")
                Result.success(authResult)
            } else if (credential is GoogleIdTokenCredential) {
                val idToken = credential.idToken
                val firebaseCredential = GoogleAuthProvider.getCredential(idToken, null)
                val authResult = auth.signInWithCredential(firebaseCredential).await()
                Result.success(authResult)
            } else {
                Log.e(TAG, "Received unexpected credential type: ${credential.type}")
                Result.failure(Exception("Unsupported credential type returned from Google"))
            }
        } catch (e: GetCredentialCancellationException) {
            Log.w(TAG, "User cancelled Google Sign-In prompt")
            Result.failure(Exception("Sign-In cancelled by user"))
        } catch (e: GetCredentialException) {
            Log.e(TAG, "Credential Manager error: ${e.message}", e)
            Result.failure(e)
        } catch (e: Exception) {
            Log.e(TAG, "Firebase Google Auth failed: ${e.message}", e)
            Result.failure(e)
        }
    }

    /**
     * Signs out from Firebase Authentication.
     */
    fun signOut() {
        auth.signOut()
        Log.d(TAG, "User signed out from Firebase")
    }

    /**
     * Returns current Firebase User or null if signed out.
     */
    fun getCurrentUser() = auth.currentUser
}
