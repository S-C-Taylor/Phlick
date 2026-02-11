package com.phlick.game

data class MonsterDisplayInfo(
    val attackStyle: Prayer,
    val tickInCycle: Int,
    val cycleLength: Int,
    val isAttacking: Boolean,
    val isWallUp: Boolean
)

/**
 * Returns active monsters for UI rendering: (attackStyle, tickInCycle, cycleLength, isAttacking, isWallUp).
 */
fun getActiveMonsters(
    gameMode: GameMode,
    currentTick: Int,
    isRunning: Boolean,
    currentLevel: Level?,
    reactiveMonsterAttacks: Map<Int, Prayer>,
    magicMonsterAttackOffset: Int?,
    rangedMonsterAttackOffset: Int?,
    isMagicWallUp: Boolean,
    isRangedWallUp: Boolean
): List<MonsterDisplayInfo> = when (gameMode) {
    GameMode.Progression -> {
        if (!isRunning) {
            currentLevel?.monsters?.map { monster ->
                MonsterDisplayInfo(
                    attackStyle = monster.attackStyle,
                    tickInCycle = -1,
                    cycleLength = monster.cycleLength,
                    isAttacking = false,
                    isWallUp = false
                )
            } ?: emptyList()
        } else {
            val effectiveTick = currentTick - Levels.PROGRESSION_WARMUP_TICKS
            val inWarmup = effectiveTick < 0
            currentLevel?.monsters?.mapIndexed { index, monster ->
                val offset = monster.offset
                val adjustedTick = currentTick - offset
                val tickInCycle = if (adjustedTick < 0) 0 else adjustedTick % monster.cycleLength
                val visualCycleComplete = adjustedTick > 0 && adjustedTick % monster.cycleLength == 0
                val isAttacking = visualCycleComplete && !inWarmup && effectiveTick >= offset
                val displayAttackStyle = if (monster.isReactive) {
                    reactiveMonsterAttacks[index] ?: monster.attackStyle
                } else monster.attackStyle
                MonsterDisplayInfo(
                    attackStyle = displayAttackStyle,
                    tickInCycle = tickInCycle,
                    cycleLength = monster.cycleLength,
                    isAttacking = isAttacking,
                    isWallUp = false
                )
            } ?: emptyList()
        }
    }
    GameMode.Sandbox -> buildList {
        if (magicMonsterAttackOffset != null || isMagicWallUp) {
            val offset = magicMonsterAttackOffset ?: -1
            val tickInCycle = if (offset >= 0 && currentTick >= offset) (currentTick - offset) % 4 else -1
            add(MonsterDisplayInfo(
                attackStyle = Prayer.Magic,
                tickInCycle = tickInCycle,
                cycleLength = 4,
                isAttacking = tickInCycle == 0 && offset >= 0 && currentTick >= offset,
                isWallUp = isMagicWallUp
            ))
        }
        if (rangedMonsterAttackOffset != null || isRangedWallUp) {
            val offset = rangedMonsterAttackOffset ?: -1
            val tickInCycle = if (offset >= 0 && currentTick >= offset) (currentTick - offset) % 4 else -1
            add(MonsterDisplayInfo(
                attackStyle = Prayer.Missiles,
                tickInCycle = tickInCycle,
                cycleLength = 4,
                isAttacking = tickInCycle == 0 && offset >= 0 && currentTick >= offset,
                isWallUp = isRangedWallUp
            ))
        }
    }
}
