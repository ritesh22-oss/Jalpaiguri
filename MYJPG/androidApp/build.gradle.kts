import java.util.Properties

plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.android)
    alias(libs.plugins.kotlin.compose)
    alias(libs.plugins.google.services)
}

val localProperties = Properties().apply {
    val propsFile = rootProject.file("local.properties")
    if (propsFile.exists()) {
        propsFile.inputStream().use { load(it) }
    }
}

val mapsApiKey: String = (
    localProperties.getProperty("MAPS_API_KEY")
        ?: System.getenv("MAPS_API_KEY")
        ?: ""
).trim().replace("\"", "\\\"")

val routesProxyBaseUrl: String = (
    localProperties.getProperty("ROUTES_PROXY_BASE_URL")
        ?: System.getenv("ROUTES_PROXY_BASE_URL")
        ?: "https://jalpaiguri-zxml.vercel.app"
).trim().trimEnd('/')

android {
    namespace = "com.myjpg.app"
    compileSdk = 35

    defaultConfig {
        applicationId = "com.myjpg.app"
        minSdk = 24
        targetSdk = 35
        versionCode = 110
        versionName = "1.1.0"

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
        vectorDrawables {
            useSupportLibrary = true
        }

        manifestPlaceholders["MAPS_API_KEY"] = mapsApiKey
        buildConfigField("String", "MAPS_API_KEY", "\"$mapsApiKey\"")
        buildConfigField("String", "ROUTES_PROXY_BASE_URL", "\"$routesProxyBaseUrl\"")
    }

    buildFeatures {
        compose = true
        buildConfig = true
    }

    buildTypes {
        release {
            isMinifyEnabled = true
            isShrinkResources = true
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
        }
    }
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
    kotlinOptions {
        jvmTarget = "17"
    }
    packaging {
        resources {
            excludes += "/META-INF/{AL2.0,LGPL2.1}"
        }
    }
}

// Stage the compiled web app under build/, rather than mutating src/main/assets during an
// Android build. Keeping generated files out of the source asset directory prevents AGP from
// discovering the same web bundle twice and producing an APK with stale assets.
tasks.register<Sync>("syncWebAssets") {
    from(file("../../dist"))
    into(layout.buildDirectory.dir("generated/webAssets/www"))
}

android {
    sourceSets {
        getByName("main") {
            // The web bundle is the only Android asset source. It is generated above on every
            // asset task, so the packaged HTML/JS/CSS always match the current frontend build.
            assets.setSrcDirs(listOf(layout.buildDirectory.dir("generated/webAssets").get().asFile))
        }
    }
}

// Keep APK assets in lockstep with the built web app. `whenTaskAdded` missed tasks that had
// already been registered by the Android plugin, which allowed stale UI bundles into an APK.
tasks.configureEach {
    if (name.startsWith("generate") && name.endsWith("Assets")) {
        dependsOn("syncWebAssets")
    }
}

dependencies {
    implementation(project(":shared"))

    implementation("androidx.core:core-ktx:1.15.0")
    implementation("androidx.core:core-splashscreen:1.0.1")
    implementation("androidx.appcompat:appcompat:1.7.0")
    implementation("androidx.webkit:webkit:1.12.1")

    // Jetpack Compose for Native Google Maps Screen
    implementation(libs.androidx.activity.compose)
    implementation(libs.compose.ui)
    implementation(libs.compose.foundation)
    implementation(libs.compose.material3)
    implementation(libs.compose.material.icons.extended)
    debugImplementation(libs.compose.ui.tooling)

    // Google Maps SDK for Android, Maps Compose & Places SDK (New)
    implementation(libs.play.services.maps)
    implementation(libs.maps.compose)
    implementation(libs.places)
    implementation(libs.play.services.maps3d)

    // Android Credential Manager & Google Auth
    implementation(libs.androidx.credentials)
    implementation(libs.androidx.credentials.play.services.auth)
    implementation(libs.googleid)
    implementation(libs.play.services.auth)
    implementation(libs.play.services.location)

    // Coroutines
    implementation(libs.kotlinx.coroutines.android)
    implementation(libs.kotlinx.coroutines.play.services)

    // Firebase
    implementation(platform(libs.firebase.bom))
    implementation(libs.firebase.auth)
    implementation(libs.firebase.firestore)
}
