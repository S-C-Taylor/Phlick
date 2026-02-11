package com.phlick.game

import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.test.advanceUntilIdle
import kotlinx.coroutines.test.StandardTestDispatcher
import kotlinx.coroutines.test.runTest
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

/**
 * Integration tests: simulate playing each level with the correct prayer each tick
 * and assert the level can be completed (proving levels are solvable).
 * For levels with reactive monsters, sets prayer at "decision" ticks so the blob
 * attacks with the same style as other monsters on the attack tick.
 */
@OptIn(ExperimentalCoroutinesApi::class)
class LevelSolvabilityTest {

    private val testDispatcher = StandardTestDispatcher()

    /** True when tick is a decision tick for this reactive monster (3 ticks before attack). */
    private fun isReactiveDecisionTick(monster: MonsterConfig, tick: Int): Boolean {
        if (!monster.isReactive) return false
        val adjustedTick = tick - monster.offset
        if (adjustedTick < 0) return false
        return adjustedTick % monster.cycleLength == 3
    }

    /** Attack styles required at tick from non-reactive monsters only. */
    private fun nonReactiveRequiredAtTick(level: Level, tick: Int): Set<Prayer> {
        val effectiveTick = tick - Levels.PROGRESSION_WARMUP_TICKS
        if (effectiveTick < 0) return emptySet()
        return level.monsters
            .filter { !it.isReactive }
            .mapNotNull { monster ->
                val offset = monster.offset
                val adjustedTick = tick - offset
                if (adjustedTick > 0 && adjustedTick % monster.cycleLength == 0 && effectiveTick >= offset)
                    monster.attackStyle
                else null
            }
            .toSet()
    }

    /** Opposite prayer so reactive monster chooses the given style (Magic->Missiles, Missiles->Magic). */
    private fun oppositePrayer(p: Prayer): Prayer = when (p) {
        Prayer.Magic -> Prayer.Missiles
        Prayer.Missiles -> Prayer.Magic
        Prayer.Melee -> Prayer.Magic
    }

    @Test
    fun everyLevelCanBeSolved() = runTest(testDispatcher) {
        val scope = this
        val tickEngine = TickEngine(scope)
        val holder = GameStateHolder(tickEngine, scope)

        for (level in Levels.allLevels) {
            holder.startLevelForTest(level)
            val maxTicks = level.ticksToSurvive + Levels.PROGRESSION_WARMUP_TICKS + 50
            var ticks = 0

            while (ticks < maxTicks) {
                advanceUntilIdle()
                val state = holder.state.value
                if (state.levelState.isLevelComplete) break
                assertFalse(
                    "Level ${level.number} (${level.name}) failed (lives=${state.levelState.lives})",
                    state.levelState.isLevelFailed
                )

                val nextTick = state.currentTick + 1
                var required = state.copy(currentTick = nextTick).requiredPrayers
                var prayerAlreadySet = false

                // Proactively set prayer at reactive decision ticks so the blob matches others on the attack tick.
                if (!prayerAlreadySet && level.monsters.any { isReactiveDecisionTick(it, nextTick) }) {
                    val attackTick = nextTick + 3 // Reactive decides 3 ticks before attack
                    val otherAtAttack = nonReactiveRequiredAtTick(level, attackTick)
                    if (otherAtAttack.size == 1) {
                        val wantReactiveToChoose = otherAtAttack.single()
                        val prayerToSet = oppositePrayer(wantReactiveToChoose)
                        if (state.selectedPrayer != prayerToSet) holder.setPrayer(prayerToSet)
                        prayerAlreadySet = true
                    }
                }

                // If next tick would require multiple prayers and we didn't fix above, fail.
                if (!prayerAlreadySet && required.size > 1) {
                    throw AssertionError(
                        "Level ${level.number} requires multiple different prayers on one tick (unsolvable): $required"
                    )
                }

                if (!prayerAlreadySet && required.size == 1) {
                    val needed = required.single()
                    if (state.selectedPrayer != needed) holder.setPrayer(needed)
                }
                tickEngine.triggerTick()
                ticks++
                advanceUntilIdle()
                holder.state.value.selectedPrayer?.let { current ->
                    holder.setPrayer(current) // Flick off
                }
            }

            advanceUntilIdle()
            val finalState = holder.state.value
            assertTrue(
                "Level ${level.number} (${level.name}) did not complete within $maxTicks ticks",
                finalState.levelState.isLevelComplete
            )
        }
    }
}
