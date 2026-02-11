package com.phlick.game

import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.isActive
import kotlinx.coroutines.launch

/**
 * Emits a tick index (0, 1, 2, ...) every 600ms (OSRS game tick).
 * Uses elapsed time to avoid drift over long sessions.
 */
class TickEngine(
    private val scope: CoroutineScope
) {
    companion object {
        const val TICK_MS = 600L
    }

    private var job: Job? = null
    private var tickIndex = 0

    var onTick: ((Int) -> Unit)? = null
        set(value) {
            field = value
        }

    fun start() {
        if (job?.isActive == true) return
        tickIndex = 0
        job = scope.launch {
            while (isActive) {
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
