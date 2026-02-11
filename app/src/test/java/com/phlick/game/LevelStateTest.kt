package com.phlick.game

import org.junit.Assert.assertEquals
import org.junit.Test

/**
 * Unit tests for [LevelState].
 */
class LevelStateTest {

    @Test
    fun prayerPointsUsed_fullUsage() {
        val state = LevelState(initialPrayerPoints = 10)
        assertEquals(7, state.prayerPointsUsed(3))
    }

    @Test
    fun prayerPointsUsed_noneUsed() {
        val state = LevelState(initialPrayerPoints = 10)
        assertEquals(0, state.prayerPointsUsed(10))
    }

    @Test
    fun prayerPointsUsed_neverGoesNegative() {
        val state = LevelState(initialPrayerPoints = 5)
        assertEquals(5, state.prayerPointsUsed(0))
    }
}
