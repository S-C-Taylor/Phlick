package com.phlick.ui

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

// OSRS-inspired color scheme: brown/beige backgrounds, darker tones
private val OsrsColorScheme = darkColorScheme(
    primary = Color(0xFF8B6914), // OSRS gold/brown
    onPrimary = Color(0xFFFFE4B5), // Light beige text
    secondary = Color(0xFF654321), // Darker brown
    onSecondary = Color(0xFFFFE4B5),
    tertiary = Color(0xFF4A3728), // Dark brown
    onTertiary = Color(0xFFFFE4B5),
    background = Color(0xFF2A1810), // Dark brown background (OSRS game background)
    onBackground = Color(0xFFFFE4B5), // Beige text
    surface = Color(0xFF3D2817), // Slightly lighter brown for surfaces
    onSurface = Color(0xFFFFE4B5),
    surfaceVariant = Color(0xFF4A3728), // Variant surface
    onSurfaceVariant = Color(0xFFD4A574), // Lighter beige for secondary text
    error = Color(0xFFCC0000), // Red for errors
    onError = Color.White
)

@Composable
fun Theme(
    content: @Composable () -> Unit
) {
    MaterialTheme(
        colorScheme = OsrsColorScheme,
        content = content
    )
}
