package com.phlick.ui

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.phlick.game.GameStateHolder
import com.phlick.game.Prayer
import com.phlick.game.TickEngine
import kotlinx.coroutines.flow.SharedFlow

class PrayerFlickViewModel : ViewModel() {

    private val tickEngine = TickEngine(viewModelScope)
    val gameHolder = GameStateHolder(tickEngine, viewModelScope)

    val state get() = gameHolder.state
    val feedback: SharedFlow<com.phlick.game.FlickResult> = gameHolder.feedback
    val levelComplete: SharedFlow<com.phlick.game.Level> = gameHolder.levelComplete
    val levelFailed: SharedFlow<com.phlick.game.Level> = gameHolder.levelFailed

    fun reset() = gameHolder.reset()
    fun startSandbox() = gameHolder.startSandbox()
    fun selectLevel(level: com.phlick.game.Level) = gameHolder.selectLevel(level)
    fun startLevel(level: com.phlick.game.Level) = gameHolder.startLevel(level)
    fun startSelectedLevel() = gameHolder.startSelectedLevel()
    fun stop() = gameHolder.stop()
    fun quitProgression() = gameHolder.quitProgression()
    fun setPrayer(prayer: Prayer) = gameHolder.setPrayer(prayer)

    override fun onCleared() {
        super.onCleared()
        gameHolder.stop()
    }
}
