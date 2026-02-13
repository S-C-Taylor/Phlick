# Add project specific ProGuard rules here.
# By default, the flags in this version of the SDK are used.

# Keep Compose and Kotlin runtime (R8/AGP often keep these; these help if needed)
-keep class androidx.compose.** { *; }
-dontwarn androidx.compose.**

# Keep app entry points
-keep class com.phlick.MainActivity { *; }
-keep class com.phlick.ui.** { *; }
-keep class com.phlick.game.** { *; }
-keep class com.phlick.analytics.** { *; }

# Firebase Crashlytics & Analytics (non-blocking; never on critical path)
-keepattributes *Annotation*
-keepattributes SourceFile,LineNumberTable
-keep public class * extends java.lang.Exception
-keep class com.google.firebase.** { *; }
-dontwarn com.google.firebase.**

# Kotlin
-keep class kotlin.Metadata { *; }
-dontwarn kotlin.**
-keepclassmembers class **$WhenMappings {
    <fields>;
}
-keepclassmembers class kotlin.Metadata {
    public <methods>;
}
