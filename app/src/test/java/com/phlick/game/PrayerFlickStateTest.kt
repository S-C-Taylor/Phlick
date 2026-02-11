package com.phlick.game

import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test

/**
 * Unit tests for [PrayerFlickState] requiredPrayers and progression logic.
 */
class PrayerFlickStateTest {

    @Test
    fun requiredPrayers_emptyDuringWarmup() {
        val level = Levels.level1
        val state = PrayerFlickState(
            gameMode = GameMode.Progression,
            isRunning = true,
            currentTick = 0,
            levelState = LevelState(currentLevel = level)
        )
        assertTrue(state.requiredPrayers.isEmpty())
    }

    @Test
    fun requiredPrayers_level1_firstAttackAtTick4() {
        val level = Levels.level1
        // First attack: adjustedTick=4, effectiveTick=1. currentTick must be 4 (warmup=3).
        val state = PrayerFlickState(
            gameMode = GameMode.Progression,
            isRunning = true,
            currentTick = 4,
            levelState = LevelState(currentLevel = level)
        )
        assertEquals(setOf(Prayer.Magic), state.requiredPrayers)
    }

    @Test
    fun requiredPrayers_level2_dualThreat_differentPrayersOnDifferentTicks() {
        val level = Levels.level2
        // Tick 4: Mage (offset 0). Tick 5: Ranger (offset 1).
        val atTick4 = PrayerFlickState(
            gameMode = GameMode.Progression,
            isRunning = true,
            currentTick = 4,
            levelState = LevelState(currentLevel = level)
        )
        assertEquals(setOf(Prayer.Magic), atTick4.requiredPrayers)

        val atTick5 = PrayerFlickState(
            gameMode = GameMode.Progression,
            isRunning = true,
            currentTick = 5,
            levelState = LevelState(currentLevel = level)
        )
        assertEquals(setOf(Prayer.Missiles), atTick5.requiredPrayers)
    }

    @Test
    fun requiredPrayers_sandbox_respectsOffsets() {
        val state = PrayerFlickState(
            gameMode = GameMode.Sandbox,
            isRunning = true,
            currentTick = 4,
            magicMonsterAttackOffset = 0,
            rangedMonsterAttackOffset = 0
        )
        assertEquals(setOf(Prayer.Magic, Prayer.Missiles), state.requiredPrayers)
    }
}
