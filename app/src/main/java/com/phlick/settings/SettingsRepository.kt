package com.phlick.settings

import android.content.Context
import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.Preferences
import androidx.datastore.preferences.core.booleanPreferencesKey
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.intPreferencesKey
import androidx.datastore.preferences.core.stringSetPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map

private val Context.dataStore: DataStore<Preferences> by preferencesDataStore(name = "phlick_settings")

private val KEY_HIGHEST_LEVEL_COMPLETED = intPreferencesKey("highest_level_completed")
private val KEY_TUTORIAL_SEEN_LEVELS = stringSetPreferencesKey("tutorial_seen_levels")
private val KEY_RANDOM_LATENCY_ENABLED = booleanPreferencesKey("random_latency_enabled")
private val KEY_RANDOM_LATENCY_MS_MIN = intPreferencesKey("random_latency_ms_min")
private val KEY_RANDOM_LATENCY_MS_MAX = intPreferencesKey("random_latency_ms_max")
private val KEY_SHOW_TICK_BAR = booleanPreferencesKey("show_tick_bar")

class SettingsRepository(private val context: Context) {

    val settings: Flow<AppSettings> = context.dataStore.data.map { prefs ->
        AppSettings(
            randomLatencyEnabled = prefs[KEY_RANDOM_LATENCY_ENABLED] ?: false,
            randomLatencyMsMin = prefs[KEY_RANDOM_LATENCY_MS_MIN] ?: 0,
            randomLatencyMsMax = prefs[KEY_RANDOM_LATENCY_MS_MAX] ?: 100,
            showTickBar = prefs[KEY_SHOW_TICK_BAR] ?: false
        )
    }

    suspend fun setRandomLatencyEnabled(enabled: Boolean) {
        context.dataStore.edit { it[KEY_RANDOM_LATENCY_ENABLED] = enabled }
    }

    suspend fun setRandomLatencyRange(minMs: Int, maxMs: Int) {
        context.dataStore.edit {
            it[KEY_RANDOM_LATENCY_MS_MIN] = minMs.coerceIn(0, AppSettings.MAX_LATENCY_MS)
            it[KEY_RANDOM_LATENCY_MS_MAX] = maxMs.coerceIn(0, AppSettings.MAX_LATENCY_MS)
        }
    }

    suspend fun setShowTickBar(show: Boolean) {
        context.dataStore.edit { it[KEY_SHOW_TICK_BAR] = show }
    }

    /** Highest progression level number the user has completed (0 = none; level N unlocked when N <= this + 1). */
    val highestLevelCompleted: Flow<Int> = context.dataStore.data.map { prefs ->
        prefs[KEY_HIGHEST_LEVEL_COMPLETED] ?: 0
    }

    suspend fun setHighestLevelCompleted(levelNumber: Int) {
        context.dataStore.edit {
            val current = it[KEY_HIGHEST_LEVEL_COMPLETED] ?: 0
            it[KEY_HIGHEST_LEVEL_COMPLETED] = maxOf(current, levelNumber)
        }
    }

    /** Level numbers for which the guided tutorial has been shown (e.g. 1, 3, 9). */
    val tutorialSeenLevels: Flow<Set<Int>> = context.dataStore.data.map { prefs ->
        (prefs[KEY_TUTORIAL_SEEN_LEVELS] ?: emptySet())
            .mapNotNull { it.toIntOrNull() }
            .filter { it > 0 }
            .toSet()
    }

    suspend fun setTutorialSeen(levelNumber: Int) {
        context.dataStore.edit {
            val current = it[KEY_TUTORIAL_SEEN_LEVELS] ?: emptySet()
            it[KEY_TUTORIAL_SEEN_LEVELS] = current + levelNumber.toString()
        }
    }

    suspend fun updateSettings(block: (AppSettings) -> AppSettings) {
        context.dataStore.edit { prefs ->
            val current = AppSettings(
                randomLatencyEnabled = prefs[KEY_RANDOM_LATENCY_ENABLED] ?: false,
                randomLatencyMsMin = prefs[KEY_RANDOM_LATENCY_MS_MIN] ?: 0,
                randomLatencyMsMax = prefs[KEY_RANDOM_LATENCY_MS_MAX] ?: 100,
                showTickBar = prefs[KEY_SHOW_TICK_BAR] ?: false
            )
            val next = block(current)
            prefs[KEY_RANDOM_LATENCY_ENABLED] = next.randomLatencyEnabled
            prefs[KEY_RANDOM_LATENCY_MS_MIN] = next.randomLatencyMsMin
            prefs[KEY_RANDOM_LATENCY_MS_MAX] = next.randomLatencyMsMax
            prefs[KEY_SHOW_TICK_BAR] = next.showTickBar
        }
    }
}
