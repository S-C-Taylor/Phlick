package com.phlick.game

import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

/**
 * Unit tests for [Level] definitions and [Levels].
 */
class LevelsTest {

    @Test
    fun allLevels_nonEmpty() {
        assertTrue(Levels.allLevels.isNotEmpty())
    }

    @Test
    fun allLevels_numbersSequential() {
        Levels.allLevels.forEachIndexed { index, level ->
            assertEquals(
                "Level at index $index should have number ${index + 1}",
                index + 1,
                level.number
            )
        }
    }

    @Test
    fun allLevels_eachHasMonstersAndTicks() {
        Levels.allLevels.forEach { level ->
            assertTrue("Level ${level.number} should have at least one monster", level.monsters.isNotEmpty())
            assertTrue("Level ${level.number} should have positive ticksToSurvive", level.ticksToSurvive > 0)
        }
    }

    @Test
    fun level3_hasOnePrayerPoint() {
        val level3 = Levels.allLevels.find { it.number == 3 }!!
        assertEquals(1, level3.initialPrayerPoints)
    }
}
