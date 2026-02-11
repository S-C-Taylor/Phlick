package com.phlick.game

/**
 * Returns the set of prayers required to block all attacks on the current tick.
 * Used for attack resolution and UI.
 */
fun computeRequiredPrayers(
    gameMode: GameMode,
    currentTick: Int,
    currentLevel: Level?,
    reactiveMonsterAttacks: Map<Int, Prayer>,
    magicMonsterAttackOffset: Int?,
    rangedMonsterAttackOffset: Int?
): Set<Prayer> = when (gameMode) {
    GameMode.Progression -> {
        val effectiveTick = currentTick - Levels.PROGRESSION_WARMUP_TICKS
        if (effectiveTick < 0) emptySet()
        else {
            currentLevel?.monsters?.mapNotNull { monster ->
                val offset = monster.offset
                val adjustedTick = currentTick - offset
                if (adjustedTick > 0 && adjustedTick % monster.cycleLength == 0 && effectiveTick >= offset) {
                    if (monster.isReactive) {
                        val monsterIndex = currentLevel.monsters.indexOf(monster)
                        reactiveMonsterAttacks[monsterIndex] ?: monster.attackStyle
                    } else {
                        monster.attackStyle
                    }
                } else null
            }?.toSet() ?: emptySet()
        }
    }
    GameMode.Sandbox -> {
        val magicAttack = magicMonsterAttackOffset?.let { offset ->
            (currentTick - offset) % 4 == 0 && currentTick >= offset
        } ?: false
        val rangedAttack = rangedMonsterAttackOffset?.let { offset ->
            (currentTick - offset) % 4 == 0 && currentTick >= offset
        } ?: false
        buildSet {
            if (magicAttack) add(Prayer.Magic)
            if (rangedAttack) add(Prayer.Missiles)
        }
    }
}
