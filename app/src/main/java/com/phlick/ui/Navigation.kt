package com.phlick.ui

import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue

enum class Screen {
    Landing,
    Progression,
    About,
    Settings
}

@Composable
fun AppNavigation(settingsRepository: com.phlick.settings.SettingsRepository) {
    var currentScreen by remember { mutableStateOf(Screen.Landing) }
    val viewModel: PrayerFlickViewModel = androidx.lifecycle.viewmodel.compose.viewModel(
        factory = PhlickViewModelFactory(settingsRepository)
    )

    when (currentScreen) {
        Screen.Landing -> LandingScreen(
            onStartProgression = {
                viewModel.gameHolder.reset() // Reset state before switching
                currentScreen = Screen.Progression
            },
            onAbout = { currentScreen = Screen.About },
            onSettings = { currentScreen = Screen.Settings }
        )
        Screen.Progression -> ProgressionScreen(
            viewModel = viewModel,
            onBackToMenu = {
                viewModel.gameHolder.quitProgression() // Clear level state
                currentScreen = Screen.Landing
            }
        )
        Screen.About -> AboutScreen(
            onBack = { currentScreen = Screen.Landing }
        )
        Screen.Settings -> SettingsScreen(
            settingsRepository = settingsRepository,
            onBack = { currentScreen = Screen.Landing }
        )
    }
}
