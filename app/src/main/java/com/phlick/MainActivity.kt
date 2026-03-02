package com.phlick

import android.os.Bundle
import android.graphics.Color
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.WindowInsets
import androidx.compose.foundation.layout.asPaddingValues
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.safeDrawing
import androidx.compose.material3.Surface
import androidx.compose.ui.Modifier
import androidx.core.view.WindowCompat
import com.phlick.settings.SettingsRepository
import com.phlick.ui.AppNavigation
import com.phlick.ui.Theme

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        // Make system bars match our dark OSRS theme (avoid garish white bars).
        WindowCompat.setDecorFitsSystemWindows(window, false)
        WindowCompat.getInsetsController(window, window.decorView).apply {
            isAppearanceLightStatusBars = false
            isAppearanceLightNavigationBars = false
        }
        val statusBarColor = 0xFF2A1810.toInt() // Theme background dark brown
        window.statusBarColor = statusBarColor
        window.navigationBarColor = statusBarColor
        val settingsRepository = SettingsRepository(applicationContext)
        setContent {
            Theme {
                Surface(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(WindowInsets.safeDrawing.asPaddingValues())
                ) {
                    AppNavigation(settingsRepository = settingsRepository)
                }
            }
        }
    }
}
