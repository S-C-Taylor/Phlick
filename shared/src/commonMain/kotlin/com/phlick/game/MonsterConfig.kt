package com.phlick.game

data class MonsterConfig(
    val attackStyle: Prayer,
    val cycleLength: Int,
    val offset: Int,
    val isReactive: Boolean = false
)
