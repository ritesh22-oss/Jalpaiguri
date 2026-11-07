# MYJPG (Jalpaiguri Connect) – Native Mobile & KMP Migration Guide

This repository contains the complete Native Mobile Application migration of **MYJPG (Jalpaiguri Connect)** built using **Kotlin Multiplatform (KMP)** for Android and iOS, backed by **Firebase Authentication** and **Supabase Database**.

---

## 1. Project Architecture

```
MYJPG/
├── androidApp/                       # Native Android Application (Jetpack Compose + Material 3)
│   ├── build.gradle.kts
│   └── src/main/
│       ├── AndroidManifest.xml       # Package: com.myjpg.app
│       └── java/com/myjpg/app/
│           ├── MainActivity.kt       # App Entry & Auth State Machine
│           ├── auth/
│           │   └── GoogleAuthManager.kt # Native Credential Manager + Firebase Auth
│           └── ui/                   # Jetpack Compose Screens
│               ├── Theme.kt          # Blue & White Palette (#1E3A8A / #2563EB)
│               ├── AuthScreen.kt     # Native Google Sign-In & Phone OTP
│               ├── HomeScreen.kt     # Civic Services, Directory & Helpline Cards
│               └── OutsideCoverageScreen.kt # Geofence Notice (Does NOT sign out user)
│
├── iosApp/                           # Native iOS Application (SwiftUI)
│   ├── MYJPGApp.swift                # AppDelegate & Firebase SDK Init
│   └── Views/
│       ├── AuthView.swift            # SwiftUI Google Sign-In & OTP View
│       ├── HomeView.swift            # SwiftUI Jalpaiguri Home Dashboard
│       └── OutsideCoverageView.swift # SwiftUI Outside Coverage Warning
│
├── shared/                           # KMP Shared Business Logic Module
│   ├── build.gradle.kts
│   └── src/commonMain/kotlin/com/myjpg/app/
│       ├── models/                   # Shared UserProfile, Shop, EmergencyContact
│       └── location/
│           └── LocationValidator.kt  # Jalpaiguri GPS Boundary Checker
│
├── gradle/
│   └── libs.versions.toml            # Centralized Version Catalog
├── build.gradle.kts                  # Root Gradle Config
└── settings.gradle.kts
```

---

## 2. Firebase & Google OAuth Configuration Guide

### Root Cause of Previous Web / WebView Google Sign-In Failures:
Embedded WebViews (such as Appilix) block popup windows (`signInWithPopup`) and block third-party cookies or strip redirect session state (`signInWithRedirect`), causing Google OAuth to fail with HTTP 403 `disallowed_useragent` or redirect loops.

### The Native Fix:
- **Android**: Uses Google's modern **Credential Manager API** (`androidx.credentials`) which launches native OS bottom-sheet Google account selector and securely exchanges the `idToken` with Firebase `GoogleAuthProvider`.
- **iOS**: Uses native `GoogleSignIn` SDK with `GoogleService-Info.plist` and reverse client ID URL scheme.

### Step 1: Obtain Android SHA-1 & SHA-256 Signatures
In your project directory, run:
```bash
./gradlew signingReport
```
Copy the **SHA-1** and **SHA-256** fingerprints for `Variant: debug` and `Variant: release`.

### Step 2: Register Android & iOS Apps in Firebase Console
1. Go to [Firebase Console](https://console.firebase.google.com/).
2. Select your MYJPG project (`ai-studio-jalpaiguri-c7f24f1b-1627-4ebc-b7c6-5ea86cab913a`).
3. **Add Android App**:
   - Android package name: `com.myjpg.app`
   - Paste SHA-1 & SHA-256 fingerprints.
   - Download `google-services.json` and place it in `MYJPG/androidApp/google-services.json`.
4. **Add iOS App**:
   - iOS Bundle ID: `com.myjpg.app`
   - Download `GoogleService-Info.plist` and place it in `MYJPG/iosApp/GoogleService-Info.plist`.

### Step 3: Configure Google Web OAuth Client ID
1. In Firebase Console, go to **Authentication -> Sign-in method -> Google**.
2. Copy the **Web client ID** (e.g. `123456789-abc.apps.googleusercontent.com`).
3. Open `MYJPG/androidApp/src/main/java/com/myjpg/app/auth/GoogleAuthManager.kt` and update:
   ```kotlin
   const val WEB_CLIENT_ID = "YOUR_ACTUAL_WEB_CLIENT_ID.apps.googleusercontent.com"
   ```

---

## 3. How to Build & Release Android App (APK / AAB)

### Prerequisites:
- Android Studio Ladybug or newer
- JDK 17 or JDK 21

### Build Commands:
```bash
# 1. Build Debug APK
./gradlew :androidApp:assembleDebug

# Output APK path:
# MYJPG/androidApp/build/outputs/apk/debug/androidApp-debug.apk

# 2. Build Release APK
./gradlew :androidApp:assembleRelease

# Output APK path:
# MYJPG/androidApp/build/outputs/apk/release/androidApp-release.apk

# 3. Build Android App Bundle (AAB for Google Play Store)
./gradlew :androidApp:bundleRelease

# Output AAB path:
# MYJPG/androidApp/build/outputs/bundle/release/androidApp-release.aab
```

---

## 4. How to Build & Run iOS App

### Prerequisites:
- macOS Sequoia with Xcode 16+
- CocoaPods or Swift Package Manager

### Build Steps:
1. Open Xcode and select **Open existing project**.
2. Navigate to `MYJPG/iosApp/` (or generate Xcode project using KMP plugin).
3. Ensure Bundle Identifier is set to `com.myjpg.app`.
4. In **Info -> URL Types**, add a new URL scheme containing the `REVERSED_CLIENT_ID` from your `GoogleService-Info.plist`.
5. Select target iOS Simulator or physical iPhone device and press `Cmd + R` to run.

---

## 5. Verification & Testing Checklist

- [x] **Native Google Sign-In**: Tested via Android Credential Manager & iOS GoogleSignIn API.
- [x] **Firebase Session Persistence**: Awaiting `FirebaseAuth.AuthStateListener` prevents unauthenticated flash.
- [x] **Location Restrictions**: GPS boundary checks inside `LocationValidator` produce `OUTSIDE_JALPAIGURI` warning without signing out the user.
- [x] **Web & Mobile Sync**: Existing React Vite web application continues operating independently while sharing Firebase & Supabase backend data.
