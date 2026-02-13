package com.phlick.game

import androidx.compose.runtime.MutableState
import androidx.compose.runtime.mutableStateOf
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.flow.MutableSharedFlow
import kotlinx.coroutines.flow.SharedFlow
import kotlinx.coroutines.flow.asSharedFlow
import kotlinx.coroutines.launch

/**
 * Holds game state and evaluates prayer on each tick.
 * Subscribes to TickEngine and updates state; exposes state for UI.
 */
class GameStateHolder(
    private val tickEngine: TickEngine,
    private val scope: CoroutineScope
) {
    private val _state = mutableStateOf(PrayerFlickState())
    val state: MutableState<PrayerFlickState> get() = _state

    private val _feedback = MutableSharedFlow<FlickResult>(replay = 0, extraBufferCapacity = 1)
    val feedback: SharedFlow<FlickResult> = _feedback.asSharedFlow()

    private val _levelComplete = MutableSharedFlow<Level>(replay = 0, extraBufferCapacity = 1)
    val levelComplete: SharedFlow<Level> = _levelComplete.asSharedFlow()

    private val _levelFailed = MutableSharedFlow<Level>(replay = 0, extraBufferCapacity = 1)
    val levelFailed: SharedFlow<Level> = _levelFailed.asSharedFlow()

    fun reset() {
        tickEngine.stop()
        tickEngine.onTick = null
        _state.value = PrayerFlickState()
    }

    fun startSandbox() {
        // Stop any existing game first
        tickEngine.stop()
        // Reset to clean sandbox state
        _state.value = PrayerFlickState(
            gameMode = GameMode.Sandbox,
            isRunning = true,
            prayerPoints = Levels.INITIAL_PRAYER_POINTS,
            consecutiveTicksWithPrayer = 0
        )
        tickEngine.onTick = ::onTick
        tickEngine.start()
    }

    fun selectLevel(level: Level) {
        // Stop any existing game first
        tickEngine.stop()
        // Set the level but don't start the tick engine yet
        val prayerPoints = level.initialPrayerPoints ?: Levels.INITIAL_PRAYER_POINTS
        _state.value = PrayerFlickState(
            gameMode = GameMode.Progression,
            isRunning = false, // Not running until user clicks Start
            prayerPoints = prayerPoints,
            consecutiveTicksWithPrayer = 0,
            levelState = LevelState(
                currentLevel = level,
                health = 100,
                lives = 3,
                levelStartTick = 0,
                currentTick = 0,
                initialPrayerPoints = prayerPoints
            ),
            reactiveMonsterAttacks = emptyMap() // Reset reactive monster decisions
        )
    }

    fun startLevel(level: Level) {
        // Stop any existing game first
        tickEngine.stop()
        // Reset to clean progression state with warmup period and start immediately
        val prayerPoints = level.initialPrayerPoints ?: Levels.INITIAL_PRAYER_POINTS
        _state.value = PrayerFlickState(
            gameMode = GameMode.Progression,
            isRunning = true,
            prayerPoints = prayerPoints,
            consecutiveTicksWithPrayer = 0,
            levelState = LevelState(
                currentLevel = level,
                health = 100,
                lives = 3,
                levelStartTick = 0,
                currentTick = 0,
                initialPrayerPoints = prayerPoints
            ),
            reactiveMonsterAttacks = emptyMap() // Reset reactive monster decisions
        )
        tickEngine.onTick = ::onTick
        tickEngine.start()
    }

    /**
     * Sets up progression state for a level without starting the tick loop.
     * Used by tests to simulate levels by calling setPrayer() and tickEngine.triggerTick() in a loop.
     */
    fun startLevelForTest(level: Level) {
        tickEngine.stop()
        tickEngine.resetTickIndex()
        val prayerPoints = level.initialPrayerPoints ?: Levels.INITIAL_PRAYER_POINTS
        _state.value = PrayerFlickState(
            gameMode = GameMode.Progression,
            isRunning = true,
            prayerPoints = prayerPoints,
            consecutiveTicksWithPrayer = 0,
            levelState = LevelState(
                currentLevel = level,
                health = 100,
                lives = 3,
                levelStartTick = 0,
                currentTick = 0,
                initialPrayerPoints = prayerPoints
            ),
            reactiveMonsterAttacks = emptyMap()
        )
        tickEngine.onTick = ::onTick
    }

    fun startSelectedLevel() {
        // Start the currently selected level
        val currentLevel = _state.value.levelState.currentLevel
        if (currentLevel != null && !_state.value.isRunning) {
            _state.value = _state.value.copy(isRunning = true)
            tickEngine.onTick = ::onTick
            tickEngine.start()
        }
    }

    fun stop() {
        tickEngine.stop()
        tickEngine.onTick = null
        _state.value = _state.value.copy(isRunning = false)
    }

    /** Quit current level and return to level select (stays in Progression). */
    fun quitCurrentLevel() {
        tickEngine.stop()
        tickEngine.onTick = null
        _state.value = PrayerFlickState(
            gameMode = GameMode.Progression,
            isRunning = false,
            levelState = LevelState() // Empty level state
        )
    }

    fun quitProgression() {
        tickEngine.stop()
        tickEngine.onTick = null
        // Clear level state so level selection screen shows
        _state.value = PrayerFlickState(
            gameMode = GameMode.Progression,
            isRunning = false,
            levelState = LevelState() // Empty level state
        )
    }

    fun setPrayer(prayer: Prayer) {
        val currentState = _state.value
        
        // If prayer points are 0, disable any active prayer and prevent activating new ones
        if (currentState.prayerPoints <= 0) {
            _state.value = currentState.copy(selectedPrayer = null, prayerActivatedThisTick = false)
            return
        }
        
        // Toggle off if clicking the same prayer that's already active
        val newPrayer = if (currentState.selectedPrayer == prayer) {
            null // Turn off
        } else {
            prayer // Turn on (or switch to another prayer)
        }
        // OSRS 1-tick flicking: only "off → on" counts as activation (no drain). Switching Magic→Missiles
        // is not activation; true 1-tick flick is disable then re-enable the same prayer on the same tick.
        val activatedThisTick = newPrayer != null && currentState.selectedPrayer == null
        // 1-tick flick helper: record position (0–1) within current tick when prayer toggled
        val markPosition = if (currentState.lastTickTimeMs > 0L && currentState.isRunning) {
            val elapsed = (System.currentTimeMillis() - currentState.lastTickTimeMs) / 600f
            elapsed.coerceIn(0f, 1f)
        } else null
        val newMarks = if (markPosition != null) currentState.prayerMarksForTick + markPosition else currentState.prayerMarksForTick
        _state.value = currentState.copy(
            selectedPrayer = newPrayer,
            prayerActivatedThisTick = currentState.prayerActivatedThisTick || activatedThisTick,
            prayerMarksForTick = newMarks
        )
    }

    fun knockDownMagicWall() {
        if (_state.value.gameMode == GameMode.Sandbox && _state.value.isMagicWallUp) {
            _state.value = _state.value.copy(
                isMagicWallUp = false,
                magicMonsterAttackOffset = _state.value.currentTick + 1
            )
        }
    }

    fun knockDownRangedWall() {
        if (_state.value.gameMode == GameMode.Sandbox && _state.value.isRangedWallUp) {
            _state.value = _state.value.copy(
                isRangedWallUp = false,
                rangedMonsterAttackOffset = _state.value.currentTick + 1
            )
        }
    }

    private fun onTick(tickIndex: Int) {
        val tickStartMs = System.currentTimeMillis()
        val currentState = _state.value
        val newTick = tickIndex
        // Prayer used for attack resolution: state when we begin this tick (includes any user click since last tick).
        // Using currentState.selectedPrayer so turning prayer on "this tick" before we process counts as correct.
        val prayerForAttackResolution = currentState.selectedPrayer

        // Handle prayer drain: OSRS 1-tick prayer flicking
        // - Attack resolution uses prayer state at the START of the tick (wasPrayerActiveLastTick + which prayer)
        // - Drain: "the game does not drain prayer for prayers on the tick they are activated"
        // - So: if the player turned a prayer ON at any point this tick (prayerActivatedThisTick), no drain this tick
        val wasPrayerActiveAtTickStart = currentState.wasPrayerActiveLastTick
        val isPrayerActiveNow = currentState.selectedPrayer != null
        val activatedThisTick = currentState.prayerActivatedThisTick
        
        // Consecutive counter only increments when prayer was active at start AND still active AND not "just activated" this tick
        // 1-tick flick: every tick the player does off->on, so activatedThisTick is true every tick → never drain
        val newConsecutiveTicks = when {
            activatedThisTick -> 0 // Prayer was activated this tick: no drain (OSRS 1-tick flick)
            wasPrayerActiveAtTickStart && isPrayerActiveNow -> currentState.consecutiveTicksWithPrayer + 1
            else -> 0
        }
        
        // Drain when counter reaches 5 (prayer active for 5 full ticks without being "re-activated")
        val (newPrayerPoints, finalConsecutiveTicks) = if (newConsecutiveTicks >= Levels.PRAYER_DRAIN_TICKS) {
            val drainedPoints = (currentState.prayerPoints - 1).coerceAtLeast(0)
            Pair(drainedPoints, 0)
        } else {
            Pair(currentState.prayerPoints, newConsecutiveTicks)
        }
        
        // If prayer points reached 0, disable any active prayer
        val prayerDisabled = newPrayerPoints <= 0 && currentState.selectedPrayer != null
        val prayerAfterDrain = if (prayerDisabled) null else currentState.selectedPrayer
        
        // Update state: clear prayerActivatedThisTick; prayer at start of NEXT tick = current prayer now
        // 1-tick flick helper: record tick start time and clear marks for new tick
        val prayerActiveForNextTick = prayerAfterDrain != null
        val stateWithPrayerDrain = currentState.copy(
            currentTick = newTick,
            prayerPoints = newPrayerPoints,
            consecutiveTicksWithPrayer = if (prayerDisabled) 0 else finalConsecutiveTicks,
            selectedPrayer = prayerAfterDrain,
            wasPrayerActiveLastTick = prayerActiveForNextTick,
            prayerAtTickStart = prayerAfterDrain, // Next tick's "start" = current prayer (set at end of this tick)
            prayerActivatedThisTick = false,
            lastTickTimeMs = tickStartMs,
            prayerMarksForTick = emptyList()
        )

        when (stateWithPrayerDrain.gameMode) {
            GameMode.Progression -> {
                val levelState = stateWithPrayerDrain.levelState
                val level = levelState.currentLevel ?: return

                // Update level tick and calculate health
                // Account for warmup period in health calculation
                val effectiveTick = (newTick - Levels.PROGRESSION_WARMUP_TICKS).coerceAtLeast(0)
                val ticksElapsed = effectiveTick - levelState.levelStartTick
                val health = calculateHealth(levelState.currentLevel, ticksElapsed)
                val updatedLevelState = levelState.copy(
                    currentTick = newTick,
                    health = health
                )

                // Handle reactive monsters: check player's prayer 3 ticks before attack
                // Decision happens at tickInCycle == 3 (for 6-tick cycle), which is mid-cycle
                var updatedReactiveAttacks = stateWithPrayerDrain.reactiveMonsterAttacks.toMutableMap()
                level.monsters.forEachIndexed { index, monster ->
                    if (monster.isReactive) {
                        val offset = monster.offset
                        // Use currentTick (not effectiveTick) to match visual cycle
                        val adjustedTick = newTick - offset
                        val tickInCycle = if (adjustedTick < 0) {
                            0
                        } else {
                            adjustedTick % monster.cycleLength
                        }
                        // Decision happens at tickInCycle == 3 (3 ticks before attack at tickInCycle == 0)
                        // For 6-tick cycle: decision at tickInCycle 3, then attack at tickInCycle 0
                        if (adjustedTick >= 0 && tickInCycle == 3) {
                            // Monster checks player's prayer and chooses opposite attack style
                            val playerPrayer = stateWithPrayerDrain.selectedPrayer
                            val chosenAttack = when (playerPrayer) {
                                Prayer.Magic -> Prayer.Missiles // If praying Magic, attack with Range
                                Prayer.Missiles -> Prayer.Magic // If praying Range, attack with Magic
                                Prayer.Melee -> Prayer.Magic // If praying Melee, attack with Magic
                                null -> Prayer.Magic // If no prayer, default to Magic (or could be random)
                            }
                            updatedReactiveAttacks[index] = chosenAttack
                        }
                    }
                }

                val stateWithReactiveDecisions = stateWithPrayerDrain.copy(
                    levelState = updatedLevelState,
                    reactiveMonsterAttacks = updatedReactiveAttacks
                )

                // Check for attacks (requiredPrayers already accounts for warmup and reactive monsters)
                val required = stateWithReactiveDecisions.requiredPrayers
                if (required.isNotEmpty()) {
                    val selected = prayerForAttackResolution
                    // Player can only have one prayer active, so:
                    // - If multiple different prayers are required, it's wrong (can't block all)
                    // - If one prayer is required, check if player has that prayer active
                    // - If same prayer required multiple times (e.g., 2 Magic monsters), one prayer can block all
                    val result = when {
                        required.size > 1 -> FlickResult.Wrong // Multiple different prayers required - can't block all
                        selected == required.firstOrNull() -> FlickResult.Correct
                        else -> FlickResult.Wrong
                    }

                    val (newLives, newHealth, isFailed) = if (result == FlickResult.Wrong) {
                        val newLives = (updatedLevelState.lives - 1).coerceAtLeast(0)
                        val failed = newLives == 0
                        Triple(newLives, updatedLevelState.health, failed)
                    } else {
                        Triple(updatedLevelState.lives, updatedLevelState.health, false)
                    }

                    val finalLevelState = updatedLevelState.copy(
                        lives = newLives,
                        isLevelFailed = isFailed,
                        attacksBlocked = updatedLevelState.attacksBlocked + if (result == FlickResult.Correct) 1 else 0,
                        attacksMissed = updatedLevelState.attacksMissed + if (result == FlickResult.Wrong) 1 else 0
                    )

                    // Level complete when we've survived all ticks (accounting for warmup)
                    val effectiveTick = (newTick - Levels.PROGRESSION_WARMUP_TICKS).coerceAtLeast(0)
                    val ticksElapsedForCompletion = effectiveTick - levelState.levelStartTick
                    val isComplete = ticksElapsedForCompletion >= level.ticksToSurvive && !isFailed

                    val finalState = stateWithReactiveDecisions.copy(
                        levelState = finalLevelState.copy(
                            currentTick = newTick,
                            isLevelComplete = isComplete
                        ),
                        lastResult = result,
                        streak = if (result == FlickResult.Correct) stateWithReactiveDecisions.streak + 1 else 0,
                        isRunning = !isComplete && !isFailed // Stop if complete or failed
                    )

                    _state.value = finalState

                    scope.launch {
                        _feedback.emit(result)
                        if (isComplete) {
                            tickEngine.stop()
                            _levelComplete.emit(level)
                        }
                        if (isFailed) {
                            tickEngine.stop()
                            _levelFailed.emit(level)
                        }
                    }
                } else {
                    // Check for level completion even when no attack this tick
                    val effectiveTick = (newTick - Levels.PROGRESSION_WARMUP_TICKS).coerceAtLeast(0)
                    val ticksElapsedForCompletion = effectiveTick - levelState.levelStartTick
                    val isComplete = ticksElapsedForCompletion >= level.ticksToSurvive && !updatedLevelState.isLevelFailed
                    val finalLevelState = updatedLevelState.copy(
                        currentTick = newTick,
                        isLevelComplete = isComplete
                    )

                    _state.value = stateWithReactiveDecisions.copy(
                        levelState = finalLevelState,
                        lastResult = null,
                        isRunning = !isComplete && !finalLevelState.isLevelFailed,
                        reactiveMonsterAttacks = updatedReactiveAttacks // Ensure reactive decisions are preserved
                    )

                    if (isComplete) {
                        scope.launch {
                            tickEngine.stop()
                            _levelComplete.emit(level)
                        }
                    }
                }
            }

            GameMode.Sandbox -> {
                val required = stateWithPrayerDrain.requiredPrayers

                if (required.isNotEmpty()) {
                    val selected = prayerForAttackResolution
                    val result = when {
                        required.size > 1 -> FlickResult.Wrong
                        selected == required.firstOrNull() -> FlickResult.Correct
                        else -> FlickResult.Wrong
                    }
                    val newStreak = if (result == FlickResult.Correct) stateWithPrayerDrain.streak + 1 else 0
                    val newBest = maxOf(stateWithPrayerDrain.bestStreak, newStreak)

                    _state.value = stateWithPrayerDrain.copy(
                        streak = newStreak,
                        bestStreak = newBest,
                        lastResult = result
                    )
                    scope.launch {
                        _feedback.emit(result)
                    }
                } else {
                    _state.value = stateWithPrayerDrain.copy(
                        lastResult = null
                    )
                }
            }
        }
    }

    private fun calculateHealth(level: Level?, ticksElapsed: Int): Int {
        val ticksTotal = level?.ticksToSurvive ?: return 100
        if (ticksTotal == 0) return 100
        // Health goes from 100 to 0 as ticks progress
        val health = ((ticksTotal - ticksElapsed).toFloat() / ticksTotal * 100f).coerceIn(0f, 100f).toInt()
        return health
    }
}
