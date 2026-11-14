plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.android)
    alias(libs.plugins.google.services)
}

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

val isWindows = System.getProperty("os.name").lowercase().contains("windows")

val buildWebAssets = tasks.register<Exec>("buildWebAssets") {
    workingDir = file("../..")
    val currentPath = System.getenv("PATH") ?: ""
    val enhancedPath = if (!isWindows) {
        listOf("/usr/local/bin", "/opt/homebrew/bin", "/usr/bin", "/bin")
            .filter { !currentPath.contains(it) }
            .joinToString(":") + (if (currentPath.isNotEmpty()) ":$currentPath" else "")
    } else {
        currentPath
    }
    environment("PATH", enhancedPath)

    if (isWindows) {
        commandLine("cmd", "/c", "npm", "run", "build")
    } else {
        commandLine("npm", "run", "build")
    }
    inputs.dir(file("../../src"))
    inputs.file(file("../../index.html"))
    inputs.file(file("../../package.json"))
    inputs.file(file("../../vite.config.ts"))
    outputs.dir(file("../../dist"))
}

// Stage the compiled web app under build/, rather than mutating src/main/assets during an
// Android build. Keeping generated files out of the source asset directory prevents AGP from
// discovering the same web bundle twice and producing an APK with stale assets.
tasks.register<Sync>("syncWebAssets") {
    dependsOn(buildWebAssets)
    from(file("../../dist"))
    into(layout.buildDirectory.dir("generated/webAssets/www"))
    doLast {
        copy {
            from(file("../../dist"))
            into(file("src/main/assets/www"))
        }
    }
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

    // Android Credential Manager & Google Auth
    implementation(libs.androidx.credentials)
    implementation(libs.androidx.credentials.play.services.auth)
    implementation(libs.googleid)
    implementation(libs.play.services.auth)
    implementation(libs.play.services.location)

    // Firebase
    implementation(platform(libs.firebase.bom))
    implementation(libs.firebase.auth)
    implementation(libs.firebase.firestore)
}
