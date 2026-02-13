package com.phlick.settings

/**
 * User preferences for the app.
 * Persisted via DataStore (Android) / localStorage (Web).
 */
data class AppSettings(
    val randomLatencyEnabled: Boolean = false,
    val randomLatencyMsMin: Int = 0,
    val randomLatencyMsMax: Int = 100,
    val showTickBar: Boolean = false
) {
    fun latencyRangeMs(): IntRange =
        randomLatencyMsMin.coerceIn(0, MAX_LATENCY_MS)..randomLatencyMsMax.coerceIn(0, MAX_LATENCY_MS)

    companion object {
        const val MAX_LATENCY_MS = 300
    }
}
