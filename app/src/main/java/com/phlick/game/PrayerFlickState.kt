package com.phlick.game

/**
 * Game state for the prayer flick trainer.
 * Supports both Sandbox mode (free training) and Progression mode (levels).
 */
data class PrayerFlickState(
    val gameMode: GameMode = GameMode.Sandbox,
    val currentTick: Int = 0,
    val selectedPrayer: Prayer? = null,
    val streak: Int = 0,
    val bestStreak: Int = 0,
    val lastResult: FlickResult? = null,
    val isRunning: Boolean = false,
    // Prayer resource system
    val prayerPoints: Int = 100, // Prayer resource (starts at 100)
    val consecutiveTicksWithPrayer: Int = 0, // Tracks how many ticks prayer has been active (excluding activation tick)
    val wasPrayerActiveLastTick: Boolean = false, // Prayer active at start of tick (for drain)
    val prayerAtTickStart: Prayer? = null, // Which prayer was active at START of this tick (for attack resolution - OSRS)
    val prayerActivatedThisTick: Boolean = false, // Player turned a prayer ON this tick (1-tick flick: no drain this tick)
    // Sandbox mode: walls and manual offsets
    val isMagicWallUp: Boolean = true,
    val isRangedWallUp: Boolean = true,
    val magicMonsterAttackOffset: Int? = null,
    val rangedMonsterAttackOffset: Int? = null,
    // Progression mode: level state
    val levelState: LevelState = LevelState(),
    // Reactive monsters: map from monster index to their chosen attack style
    val reactiveMonsterAttacks: Map<Int, Prayer> = emptyMap()
) {
    /** Delegates to shared [computeRequiredPrayers]. */
    val requiredPrayers: Set<Prayer>
        get() = computeRequiredPrayers(
            gameMode = gameMode,
            currentTick = currentTick,
            currentLevel = levelState.currentLevel,
            reactiveMonsterAttacks = reactiveMonsterAttacks,
            magicMonsterAttackOffset = magicMonsterAttackOffset,
            rangedMonsterAttackOffset = rangedMonsterAttackOffset
        )

    /** Delegates to shared [getActiveMonsters]. */
    fun getActiveMonsters(): List<MonsterDisplayInfo> = getActiveMonsters(
        gameMode = gameMode,
        currentTick = currentTick,
        isRunning = isRunning,
        currentLevel = levelState.currentLevel,
        reactiveMonsterAttacks = reactiveMonsterAttacks,
        magicMonsterAttackOffset = magicMonsterAttackOffset,
        rangedMonsterAttackOffset = rangedMonsterAttackOffset,
        isMagicWallUp = isMagicWallUp,
        isRangedWallUp = isRangedWallUp
    )
}
