package com.myjpg.app.auth

import android.content.Context
import android.util.Log
import androidx.credentials.CredentialManager
import androidx.credentials.CustomCredential
import androidx.credentials.GetCredentialRequest
import androidx.credentials.exceptions.GetCredentialCancellationException
import androidx.credentials.exceptions.GetCredentialException
import com.google.android.libraries.identity.googleid.GetGoogleIdOption
import com.google.android.libraries.identity.googleid.GoogleIdTokenCredential
import com.google.firebase.auth.FirebaseAuth

class GoogleAuthManager(private val context: Context) {

    private val credentialManager = CredentialManager.create(context)
    private val auth: FirebaseAuth = FirebaseAuth.getInstance()

    companion object {
        private const val TAG = "MYJPG_GoogleAuth"
        // Web OAuth client generated for this Firebase project.
        const val WEB_CLIENT_ID = "705043772769-j0dvjet1fffgmk55c7kv15deokh7ro03.apps.googleusercontent.com"
    }

    /**
     * Executes Native Google Sign-In using Android Credential Manager API.
     * Displays native OS account chooser bottom sheet, extracts Google ID Token,
     * and returns it to the hosted web app, which exchanges it with Firebase Authentication.
     */
    suspend fun signInWithGoogle(webClientId: String = WEB_CLIENT_ID): Result<String> {
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
                Log.d(TAG, "Successfully received Google ID token")
                Result.success(idToken)
            } else if (credential is GoogleIdTokenCredential) {
                Result.success(credential.idToken)
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
