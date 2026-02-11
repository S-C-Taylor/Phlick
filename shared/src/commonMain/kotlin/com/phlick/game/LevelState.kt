package com.phlick.game

data class LevelState(
    val currentLevel: Level? = null,
    val health: Int = 100,
    val lives: Int = 3,
    val levelStartTick: Int = 0,
    val currentTick: Int = 0,
    val isLevelComplete: Boolean = false,
    val isLevelFailed: Boolean = false,
    val initialPrayerPoints: Int = 0,
    val attacksBlocked: Int = 0,
    val attacksMissed: Int = 0
) {
    val healthPercent: Float
        get() = health.coerceIn(0, 100) / 100f

    val ticksRemaining: Int
        get() = currentLevel?.let { level ->
            val effectiveTick = (currentTick - Levels.PROGRESSION_WARMUP_TICKS).coerceAtLeast(0)
            val ticksElapsed = effectiveTick - levelStartTick
            (level.ticksToSurvive - ticksElapsed).coerceAtLeast(0)
        } ?: 0

    val ticksElapsed: Int
        get() {
            val effectiveTick = (currentTick - Levels.PROGRESSION_WARMUP_TICKS).coerceAtLeast(0)
            return (effectiveTick - levelStartTick).coerceAtLeast(0)
        }

    fun prayerPointsUsed(currentPrayerPoints: Int): Int =
        (initialPrayerPoints - currentPrayerPoints).coerceAtLeast(0)
}
