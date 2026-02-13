package com.phlick.game

import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.isActive
import kotlinx.coroutines.launch
import kotlin.random.Random

/**
 * Emits a tick index (0, 1, 2, ...) every 600ms (OSRS game tick).
 * Uses elapsed time to avoid drift over long sessions.
 * Optional random latency (min..max ms) can be applied each tick to simulate network jitter.
 */
class TickEngine(
    private val scope: CoroutineScope
) {
    companion object {
        const val TICK_MS = 600L
    }

    private var job: Job? = null
    private var tickIndex = 0

    /** Extra delay range (min, max) in ms applied each tick; (0, 0) = no latency. */
    @Volatile
    var latencyMsMin: Int = 0
    @Volatile
    var latencyMsMax: Int = 0

    var onTick: ((Int) -> Unit)? = null
        set(value) {
            field = value
        }

    fun start() {
        if (job?.isActive == true) return
        tickIndex = 0
        job = scope.launch {
            while (isActive) {
                val extraMs = when {
                    latencyMsMax <= 0 -> 0L
                    else -> Random.nextLong(latencyMsMin.toLong(), (latencyMsMax + 1).toLong())
                }
                if (extraMs > 0) delay(extraMs)
                onTick?.invoke(tickIndex)
                tickIndex++
                delay(TICK_MS)
            }
        }
    }

    fun stop() {
        job?.cancel()
        job = null
    }

    fun isRunning(): Boolean = job?.isActive == true

    /** Resets tick index to 0. Used by tests before simulating ticks. */
    fun resetTickIndex() {
        tickIndex = 0
    }

    /** Fires one tick and increments. Used by tests to drive the game without the timer loop. */
    fun triggerTick() {
        onTick?.invoke(tickIndex)
        tickIndex++
    }
}
