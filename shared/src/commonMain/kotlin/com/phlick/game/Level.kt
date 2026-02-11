package com.phlick.game

data class Level(
    val number: Int,
    val name: String,
    val monsters: List<MonsterConfig>,
    val ticksToSurvive: Int,
    val description: String = "",
    val initialPrayerPoints: Int? = null
)

class LevelBuilder {
    var number: Int = 1
    var name: String = ""
    private val monsters = mutableListOf<MonsterConfig>()
    var ticksToSurvive: Int = 16
    var description: String = ""
    var initialPrayerPoints: Int? = null

    fun ticks(value: Int) { ticksToSurvive = value }
    fun prayerPoints(value: Int) { initialPrayerPoints = value }

    fun monster(attackStyle: Prayer, cycleLength: Int = 4, offset: Int = 0, isReactive: Boolean = false) {
        monsters.add(MonsterConfig(attackStyle, cycleLength, offset, isReactive))
    }

    fun build(): Level = Level(number, name, monsters, ticksToSurvive, description, initialPrayerPoints)
}

fun level(block: LevelBuilder.() -> Unit): Level = LevelBuilder().apply(block).build()

object Levels {
    const val PROGRESSION_WARMUP_TICKS = 3
    const val PRAYER_DRAIN_TICKS = 5
    const val INITIAL_PRAYER_POINTS = 10

    val level1 = level {
        number = 1
        name = "First Steps"
        description = "Survive a single mage"
        ticks(16)
        monster(Prayer.Magic, cycleLength = 4, offset = 0)
    }

    val level2 = level {
        number = 2
        name = "Dual Threat"
        description = "Mage and ranger attack together"
        ticks(20)
        monster(Prayer.Magic, cycleLength = 4, offset = 0)
        monster(Prayer.Missiles, cycleLength = 4, offset = 1)
    }

    val level3 = level {
        number = 3
        name = "Saving Prayer"
        description = "Only 1 prayer point – turn protection on only when the mage attacks"
        ticks(20)
        prayerPoints(1)
        monster(Prayer.Magic, cycleLength = 4, offset = 0)
    }

    val level4 = level {
        number = 4
        name = "Staggered Line"
        description = "Two mages then a ranger"
        ticks(24)
        monster(Prayer.Magic, cycleLength = 4, offset = 0)
        monster(Prayer.Magic, cycleLength = 4, offset = 1)
        monster(Prayer.Missiles, cycleLength = 4, offset = 2)
    }

    val level5 = level {
        number = 5
        name = "Triple Trouble"
        description = "Three monsters, alternating attacks"
        ticks(24)
        monster(Prayer.Magic, cycleLength = 4, offset = 0)
        monster(Prayer.Missiles, cycleLength = 4, offset = 1)
        monster(Prayer.Magic, cycleLength = 4, offset = 2)
    }

    val level6 = level {
        number = 6
        name = "Two and Two"
        description = "Two mages then two rangers"
        ticks(32)
        monster(Prayer.Magic, cycleLength = 4, offset = 0)
        monster(Prayer.Magic, cycleLength = 4, offset = 1)
        monster(Prayer.Missiles, cycleLength = 4, offset = 2)
        monster(Prayer.Missiles, cycleLength = 4, offset = 3)
    }

    val level7 = level {
        number = 7
        name = "Alternating Wave"
        description = "Mage, Range, Mage, Range pattern"
        ticks(32)
        monster(Prayer.Magic, cycleLength = 4, offset = 0)
        monster(Prayer.Missiles, cycleLength = 4, offset = 1)
        monster(Prayer.Magic, cycleLength = 4, offset = 2)
        monster(Prayer.Missiles, cycleLength = 4, offset = 3)
    }

    val level8 = level {
        number = 8
        name = "The Gauntlet"
        description = "Many monsters with tight timing"
        ticks(40)
        monster(Prayer.Magic, cycleLength = 4, offset = 0)
        monster(Prayer.Missiles, cycleLength = 4, offset = 1)
        monster(Prayer.Magic, cycleLength = 4, offset = 2)
        monster(Prayer.Missiles, cycleLength = 4, offset = 3)
        monster(Prayer.Magic, cycleLength = 4, offset = 4)
        monster(Prayer.Missiles, cycleLength = 4, offset = 5)
    }

    val level9 = level {
        number = 9
        name = "Solo Blob"
        description = "A single reactive blob - learn to control it"
        ticks(36)
        monster(Prayer.Magic, cycleLength = 6, offset = 0, isReactive = true)
    }

    val level10 = level {
        number = 10
        name = "Blob Duo"
        description = "Two reactive blobs offset by one tick"
        ticks(36)
        monster(Prayer.Magic, cycleLength = 6, offset = 0, isReactive = true)
        monster(Prayer.Magic, cycleLength = 6, offset = 1, isReactive = true)
    }

    val level11 = level {
        number = 11
        name = "Manipulate the Blob"
        description = "A mage and a reactive blob – show a prayer 3 ticks before it attacks to make it match the mage"
        ticks(36)
        monster(Prayer.Magic, cycleLength = 6, offset = 0, isReactive = true)
        monster(Prayer.Magic, cycleLength = 4, offset = 1)
    }

    val level12 = level {
        number = 12
        name = "Triple Threat"
        description = "A reactive blob, mage, and ranger - alternate prayers each tick"
        ticks(36)
        monster(Prayer.Magic, cycleLength = 6, offset = 0, isReactive = true)
        monster(Prayer.Magic, cycleLength = 4, offset = 1)
        monster(Prayer.Missiles, cycleLength = 4, offset = 2)
    }

    val level13 = level {
        number = 13
        name = "Prayer Conservation"
        description = "Limited prayer points – only flick on attack ticks"
        ticks(32)
        prayerPoints(3)
        monster(Prayer.Magic, cycleLength = 4, offset = 0)
        monster(Prayer.Missiles, cycleLength = 4, offset = 1)
        monster(Prayer.Magic, cycleLength = 4, offset = 2)
        monster(Prayer.Missiles, cycleLength = 4, offset = 3)
    }

    val level14 = level {
        number = 14
        name = "The Test"
        description = "Ultimate challenge combining all skills"
        ticks(48)
        monster(Prayer.Magic, cycleLength = 6, offset = 0, isReactive = true)
        monster(Prayer.Magic, cycleLength = 4, offset = 1)
        monster(Prayer.Missiles, cycleLength = 4, offset = 2)
        monster(Prayer.Magic, cycleLength = 6, offset = 3, isReactive = true)
        monster(Prayer.Missiles, cycleLength = 4, offset = 4)
    }

    val allLevels = listOf(
        level1, level2, level3, level4, level5, level6, level7, level8,
        level9, level10, level11, level12, level13, level14
    )
}
