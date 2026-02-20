package com.phlick.ui

import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.viewModelScope
import com.phlick.analytics.PhlickAnalytics
import com.phlick.game.GameStateHolder
import com.phlick.game.Prayer
import com.phlick.game.TickEngine
import com.phlick.settings.AppSettings
import com.phlick.settings.SettingsRepository
import kotlinx.coroutines.flow.SharedFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch

class PrayerFlickViewModel(
    private val settingsRepository: SettingsRepository
) : ViewModel() {

    private val tickEngine = TickEngine(viewModelScope)
    val gameHolder = GameStateHolder(tickEngine, viewModelScope)

    val settings: StateFlow<AppSettings> = settingsRepository.settings
        .stateIn(viewModelScope, kotlinx.coroutines.flow.SharingStarted.WhileSubscribed(5000), AppSettings())

    val tutorialSeenLevels: StateFlow<Set<Int>> = settingsRepository.tutorialSeenLevels
        .stateIn(viewModelScope, kotlinx.coroutines.flow.SharingStarted.WhileSubscribed(5000), emptySet())

    val highestLevelCompleted: StateFlow<Int> = settingsRepository.highestLevelCompleted
        .stateIn(viewModelScope, kotlinx.coroutines.flow.SharingStarted.WhileSubscribed(5000), 0)

    private var levelStartTimeMs: Long = 0L

    init {
        viewModelScope.launch {
            gameHolder.levelComplete.collect { level ->
                viewModelScope.launch { settingsRepository.setHighestLevelCompleted(level.number) }
                val durationSeconds = ((System.currentTimeMillis() - levelStartTimeMs) / 1000).toInt().coerceAtLeast(0)
                val s = settings.value
                PhlickAnalytics.logEvent(
                    "level_completed",
                    mapOf(
                        "level_number" to level.number,
                        "duration_seconds" to durationSeconds,
                        "show_tick_bar" to s.showTickBar,
                        "random_latency_enabled" to s.randomLatencyEnabled
                    )
                )
            }
        }
        viewModelScope.launch {
            gameHolder.levelFailed.collect { level ->
                val durationSeconds = ((System.currentTimeMillis() - levelStartTimeMs) / 1000).toInt().coerceAtLeast(0)
                val s = settings.value
                PhlickAnalytics.logEvent(
                    "level_failed",
                    mapOf(
                        "level_number" to level.number,
                        "duration_seconds" to durationSeconds,
                        "show_tick_bar" to s.showTickBar,
                        "random_latency_enabled" to s.randomLatencyEnabled
                    )
                )
            }
        }
    }

    fun markTutorialSeen(levelNumber: Int) {
        PhlickAnalytics.logEvent("tutorial_dismissed", mapOf("level_number" to levelNumber))
        viewModelScope.launch { settingsRepository.setTutorialSeen(levelNumber) }
    }

    val state get() = gameHolder.state
    val feedback: SharedFlow<com.phlick.game.FlickResult> = gameHolder.feedback
    val levelComplete: SharedFlow<com.phlick.game.Level> = gameHolder.levelComplete
    val levelFailed: SharedFlow<com.phlick.game.Level> = gameHolder.levelFailed

    private fun applyLatencyFromSettings() {
        val s = settings.value
        tickEngine.latencyMsMin = if (s.randomLatencyEnabled) s.randomLatencyMsMin.coerceIn(0, AppSettings.MAX_LATENCY_MS) else 0
        tickEngine.latencyMsMax = if (s.randomLatencyEnabled) s.randomLatencyMsMax.coerceIn(0, AppSettings.MAX_LATENCY_MS) else 0
    }

    fun reset() = gameHolder.reset()
    fun startSandbox() {
        applyLatencyFromSettings()
        gameHolder.startSandbox()
    }
    fun selectLevel(level: com.phlick.game.Level) = gameHolder.selectLevel(level)
    fun startLevel(level: com.phlick.game.Level) {
        applyLatencyFromSettings()
        gameHolder.startLevel(level)
    }
    fun startSelectedLevel() {
        levelStartTimeMs = System.currentTimeMillis()
        applyLatencyFromSettings()
        val level = gameHolder.state.value.levelState.currentLevel
        gameHolder.startSelectedLevel()
        level?.let { PhlickAnalytics.logEvent("level_started", mapOf("level_number" to it.number)) }
    }
    fun stop() = gameHolder.stop()
    fun quitProgression() = gameHolder.quitProgression()
    fun setPrayer(prayer: Prayer) = gameHolder.setPrayer(prayer)

    override fun onCleared() {
        super.onCleared()
        gameHolder.stop()
    }
}

class PhlickViewModelFactory(
    private val settingsRepository: SettingsRepository
) : ViewModelProvider.Factory {
    @Suppress("UNCHECKED_CAST")
    override fun <T : ViewModel> create(modelClass: Class<T>): T {
        if (modelClass != PrayerFlickViewModel::class.java) {
            throw IllegalArgumentException("Unknown ViewModel class")
        }
        return PrayerFlickViewModel(settingsRepository) as T
    }
}
