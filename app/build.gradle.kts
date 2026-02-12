plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
}

// Semantic version (MAJOR.MINOR.PATCH); versionCode is derived for Play Store
val versionMajor = 1
val versionMinor = 0
val versionPatch = 2
val versionNameSemantic = "$versionMajor.$versionMinor.$versionPatch"
val versionCodeSemantic = versionMajor * 10000 + versionMinor * 100 + versionPatch

android {
    namespace = "com.phlick"
    compileSdk = 35

    defaultConfig {
        applicationId = "com.phlick"
        minSdk = 26
        targetSdk = 35
        versionCode = versionCodeSemantic
        versionName = versionNameSemantic
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
    buildFeatures {
        compose = true
    }
    composeOptions {
        kotlinCompilerExtensionVersion = "1.5.5"
    }
    testOptions {
        unitTests {
            isIncludeAndroidResources = false
        }
    }
}

dependencies {
    implementation(project(":shared"))
    implementation(platform("androidx.compose:compose-bom:2024.01.00"))
    implementation("androidx.compose.ui:ui")
    implementation("androidx.compose.ui:ui-graphics")
    implementation("androidx.compose.ui:ui-tooling-preview")
    implementation("androidx.compose.material3:material3")
    implementation("androidx.activity:activity-compose:1.8.2")
    implementation("androidx.lifecycle:lifecycle-runtime-ktx:2.6.2")
    implementation("androidx.lifecycle:lifecycle-viewmodel-compose:2.6.2")
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-android:1.7.3")

    testImplementation("junit:junit:4.13.2")
    testImplementation("org.jetbrains.kotlinx:kotlinx-coroutines-test:1.7.3")
    testImplementation("org.jetbrains.kotlin:kotlin-test-junit:1.9.20")
}
