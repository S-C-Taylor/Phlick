plugins {
    kotlin("multiplatform")
}

kotlin {
    jvm()
    js(IR) {
        browser()
    }

    sourceSets {
        commonMain.dependencies {
            // No dependencies for pure game logic
        }
        jvmMain.dependencies {}
        jsMain.dependencies {}
    }
}
