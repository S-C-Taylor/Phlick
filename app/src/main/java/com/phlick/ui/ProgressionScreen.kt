package com.phlick.ui

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Text
import androidx.activity.compose.BackHandler
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import com.phlick.settings.AppSettings
import com.phlick.ui.getTutorialForLevel
import com.phlick.ui.TUTORIAL_LEVELS
import com.phlick.ui.TutorialOverlay
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.phlick.game.FlickResult
import com.phlick.game.Prayer

@Composable
fun ProgressionScreen(
    viewModel: PrayerFlickViewModel,
    onBackToMenu: () -> Unit
) {
    val state by viewModel.gameHolder.state
    val settings by viewModel.settings.collectAsState(initial = AppSettings())
    val tutorialSeenLevels by viewModel.tutorialSeenLevels.collectAsState(initial = emptySet())
    val levelState = state.levelState
    val level = levelState.currentLevel
    var tutorialDismissedByUser by remember(level?.number) { mutableStateOf(false) }

    if (level == null) {
        BackHandler { onBackToMenu() }
        LevelSelectionScreen(
            onSelectLevel = { level -> viewModel.selectLevel(level) },
            onBack = onBackToMenu
        )
        return
    }

    var showBackConfirm by remember { mutableStateOf(false) }
    BackHandler {
        showBackConfirm = true
    }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.background)
            .padding(16.dp)
    ) {
        Column(
            modifier = Modifier.fillMaxWidth(),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
        // Level info card
        Card(
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(8.dp),
            colors = CardDefaults.cardColors(
                containerColor = MaterialTheme.colorScheme.surfaceVariant
            )
        ) {
            Column(
                modifier = Modifier.padding(12.dp),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Text(
                    text = "Level ${level.number}: ${level.name}",
                    style = MaterialTheme.typography.titleLarge,
                    color = MaterialTheme.colorScheme.onSurface
                )
                Text(
                    text = level.description,
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
        }

        // Health bar
        Card(
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(8.dp),
            colors = CardDefaults.cardColors(
                containerColor = MaterialTheme.colorScheme.surfaceVariant
            )
        ) {
            Column(
                modifier = Modifier.padding(12.dp),
                verticalArrangement = Arrangement.spacedBy(4.dp)
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Text(
                        text = "Progress",
                        style = MaterialTheme.typography.labelMedium,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                    Text(
                        text = "${levelState.ticksRemaining} ticks remaining",
                        style = MaterialTheme.typography.labelMedium,
                        color = MaterialTheme.colorScheme.primary
                    )
                }
                LinearProgressIndicator(
                    progress = levelState.healthPercent,
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(8.dp)
                        .clip(RoundedCornerShape(4.dp)),
                    color = MaterialTheme.colorScheme.primary,
                    trackColor = MaterialTheme.colorScheme.surfaceVariant
                )
            }
        }

        // Lives and Prayer Points
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            // Lives
            Card(
                modifier = Modifier
                    .weight(1f)
                    .height(64.dp),
                shape = RoundedCornerShape(8.dp),
                colors = CardDefaults.cardColors(
                    containerColor = MaterialTheme.colorScheme.surfaceVariant
                )
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(12.dp),
                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "Lives:",
                        style = MaterialTheme.typography.labelMedium,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                    repeat(3) { index ->
                        Box(
                            modifier = Modifier
                                .size(16.dp)
                                .clip(CircleShape)
                                .background(
                                    if (index < levelState.lives)
                                        MaterialTheme.colorScheme.error
                                    else
                                        MaterialTheme.colorScheme.surfaceVariant
                                )
                        )
                    }
                }
            }

            // Prayer Points
            Card(
                modifier = Modifier
                    .weight(1f)
                    .height(64.dp),
                shape = RoundedCornerShape(8.dp),
                colors = CardDefaults.cardColors(
                    containerColor = MaterialTheme.colorScheme.surfaceVariant
                )
            ) {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(12.dp),
                    verticalArrangement = Arrangement.spacedBy(4.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Text(
                            text = "Prayer:",
                            style = MaterialTheme.typography.labelMedium,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                        Text(
                            text = "${state.prayerPoints}",
                            style = MaterialTheme.typography.labelMedium,
                            color = MaterialTheme.colorScheme.primary
                        )
                    }
                    LinearProgressIndicator(
                        progress = state.prayerPoints.toFloat() / com.phlick.game.Levels.INITIAL_PRAYER_POINTS,
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(6.dp)
                            .clip(RoundedCornerShape(3.dp)),
                        color = MaterialTheme.colorScheme.primary,
                        trackColor = MaterialTheme.colorScheme.surfaceVariant
                    )
                }
            }
        }

        if (settings.showTickBar && state.isRunning) {
            TickBar(
                lastTickTimeMs = state.lastTickTimeMs,
                marks = state.prayerMarksForTick
            )
        }

        Spacer(modifier = Modifier.height(8.dp))

        // Monsters
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceEvenly
        ) {
            state.getActiveMonsters().forEach { monsterInfo ->
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    MonsterView(
                        attackStyle = when (monsterInfo.attackStyle) {
                            Prayer.Magic -> AttackStyle.Magic
                            Prayer.Missiles -> AttackStyle.Ranged
                            Prayer.Melee -> AttackStyle.Melee
                        },
                        isAttacking = monsterInfo.isAttacking,
                        tickInCycle = monsterInfo.tickInCycle,
                        cycleLength = monsterInfo.cycleLength
                    )
                    Text(
                        text = when (monsterInfo.attackStyle) {
                            Prayer.Magic -> "Mage"
                            Prayer.Missiles -> "Range"
                            Prayer.Melee -> "Melee"
                        },
                        style = MaterialTheme.typography.labelSmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                        modifier = Modifier.padding(top = 4.dp)
                    )
                }
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        // Player prayer
        Column(horizontalAlignment = Alignment.CenterHorizontally) {
            PlayerPrayer(prayer = state.selectedPrayer)
            Text(
                text = "Active Prayer",
                style = MaterialTheme.typography.labelSmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
                modifier = Modifier.padding(top = 8.dp)
            )
        }

        Spacer(modifier = Modifier.height(16.dp))

        // Prayer buttons
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            Button(
                onClick = { viewModel.setPrayer(Prayer.Magic) },
                modifier = Modifier.weight(1f).height(56.dp),
                enabled = state.isRunning && state.prayerPoints > 0,
                shape = RoundedCornerShape(4.dp),
                colors = ButtonDefaults.buttonColors(
                    containerColor = if (state.selectedPrayer == Prayer.Magic) 
                        MaterialTheme.colorScheme.primary 
                    else 
                        MaterialTheme.colorScheme.surfaceVariant,
                    contentColor = MaterialTheme.colorScheme.onSurface
                )
            ) {
                Text(
                    text = if (state.selectedPrayer == Prayer.Magic) "Magic ✓" else "Protect Magic",
                    style = MaterialTheme.typography.labelLarge
                )
            }
            Button(
                onClick = { viewModel.setPrayer(Prayer.Missiles) },
                modifier = Modifier.weight(1f).height(56.dp),
                enabled = state.isRunning && state.prayerPoints > 0,
                shape = RoundedCornerShape(4.dp),
                colors = ButtonDefaults.buttonColors(
                    containerColor = if (state.selectedPrayer == Prayer.Missiles) 
                        MaterialTheme.colorScheme.secondary 
                    else 
                        MaterialTheme.colorScheme.surfaceVariant,
                    contentColor = MaterialTheme.colorScheme.onSurface
                )
            ) {
                Text(
                    text = if (state.selectedPrayer == Prayer.Missiles) "Missiles ✓" else "Protect Range",
                    style = MaterialTheme.typography.labelLarge
                )
            }
        }

        // Feedback
        Box(modifier = Modifier.height(40.dp), contentAlignment = Alignment.Center) {
            when (state.lastResult) {
                FlickResult.Correct -> Card(
                    colors = CardDefaults.cardColors(
                        containerColor = MaterialTheme.colorScheme.primary.copy(alpha = 0.2f)
                    ),
                    shape = RoundedCornerShape(4.dp)
                ) {
                    Text(
                        text = "✓ Correct!",
                        style = MaterialTheme.typography.titleMedium,
                        color = MaterialTheme.colorScheme.primary,
                        modifier = Modifier.padding(horizontal = 16.dp, vertical = 8.dp)
                    )
                }
                FlickResult.Wrong -> Card(
                    colors = CardDefaults.cardColors(
                        containerColor = MaterialTheme.colorScheme.error.copy(alpha = 0.2f)
                    ),
                    shape = RoundedCornerShape(4.dp)
                ) {
                    Text(
                        text = "✗ Wrong! -1 Life",
                        style = MaterialTheme.typography.titleMedium,
                        color = MaterialTheme.colorScheme.error,
                        modifier = Modifier.padding(horizontal = 16.dp, vertical = 8.dp)
                    )
                }
                null -> {}
            }
        }

        Spacer(modifier = Modifier.weight(1f))

        // Control buttons (hidden when a dialog is shown)
        if (!levelState.isLevelComplete && !levelState.isLevelFailed) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                OutlinedButton(
                    onClick = {
                        viewModel.gameHolder.quitProgression()
                        onBackToMenu()
                    },
                    modifier = Modifier.weight(1f).height(56.dp),
                    shape = RoundedCornerShape(4.dp)
                ) {
                    Text("Quit")
                }
                if (!state.isRunning) {
                    Button(
                        onClick = { viewModel.startSelectedLevel() },
                        modifier = Modifier.weight(1f).height(56.dp),
                        shape = RoundedCornerShape(4.dp),
                        colors = ButtonDefaults.buttonColors(
                            containerColor = MaterialTheme.colorScheme.primary,
                            contentColor = MaterialTheme.colorScheme.onPrimary
                        )
                    ) {
                        Text("Start")
                    }
                }
            }
        }
        }
    }

    // Level complete/failed dialogs as centered overlays so their buttons are never hidden
    if (levelState.isLevelComplete) {
        Box(
            modifier = Modifier
                .fillMaxSize(),
            contentAlignment = Alignment.Center
        ) {
            LevelCompleteDialog(
                level = level,
                prayerPointsUsed = levelState.prayerPointsUsed(state.prayerPoints),
                initialPrayerPoints = levelState.initialPrayerPoints,
                attacksBlocked = levelState.attacksBlocked,
                attacksMissed = levelState.attacksMissed,
                onNextLevel = {
                    val nextLevel = com.phlick.game.Levels.allLevels.find { it.number == level.number + 1 }
                    if (nextLevel != null) {
                        viewModel.selectLevel(nextLevel)
                    } else {
                        // All levels complete - go back to menu
                        onBackToMenu()
                    }
                },
                onBackToMenu = onBackToMenu
            )
        }
    } else if (levelState.isLevelFailed) {
        Box(
            modifier = Modifier
                .fillMaxSize(),
            contentAlignment = Alignment.Center
        ) {
            LevelFailedDialog(
                level = level,
                onRetry = { viewModel.selectLevel(level) },
                onBackToMenu = onBackToMenu
            )
        }
    }

    // Guided tutorial on first playthrough (Level 1, 3, 9)
    if (level != null &&
        level.number in TUTORIAL_LEVELS &&
        level.number !in tutorialSeenLevels &&
        !tutorialDismissedByUser
    ) {
        getTutorialForLevel(level.number)?.let { (title, message) ->
            TutorialOverlay(
                title = title,
                message = message,
                onDismiss = {
                    tutorialDismissedByUser = true
                    viewModel.markTutorialSeen(level.number)
                }
            )
        }
    }

    // Back button: confirm return to level select when in level (playing or pre-start)
    if (showBackConfirm) {
        Box(
            modifier = Modifier
                .fillMaxSize()
                .background(MaterialTheme.colorScheme.surface.copy(alpha = 0.92f)),
            contentAlignment = Alignment.Center
        ) {
            Card(
                modifier = Modifier.fillMaxWidth().padding(24.dp),
                shape = RoundedCornerShape(12.dp),
                colors = CardDefaults.cardColors(
                    containerColor = MaterialTheme.colorScheme.surfaceVariant
                )
            ) {
                Column(
                    modifier = Modifier.padding(24.dp),
                    horizontalAlignment = Alignment.CenterHorizontally,
                    verticalArrangement = Arrangement.spacedBy(16.dp)
                ) {
                    Text(
                        text = "Return to level select?",
                        style = MaterialTheme.typography.titleMedium,
                        color = MaterialTheme.colorScheme.onSurface
                    )
                    Text(
                        text = "Your progress in this level will be lost.",
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        OutlinedButton(
                            onClick = { showBackConfirm = false },
                            modifier = Modifier.weight(1f)
                        ) {
                            Text("Cancel")
                        }
                        Button(
                            onClick = {
                                showBackConfirm = false
                                viewModel.gameHolder.quitCurrentLevel()
                            },
                            modifier = Modifier.weight(1f),
                            colors = ButtonDefaults.buttonColors(
                                containerColor = MaterialTheme.colorScheme.primary,
                                contentColor = MaterialTheme.colorScheme.onPrimary
                            )
                        ) {
                            Text("Level select")
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun LevelSelectionScreen(
    onSelectLevel: (com.phlick.game.Level) -> Unit,
    onBack: () -> Unit
) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.background)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(
                text = "Select Level",
                style = MaterialTheme.typography.headlineMedium,
                color = MaterialTheme.colorScheme.onSurface
            )
            OutlinedButton(
                onClick = onBack,
                shape = RoundedCornerShape(4.dp)
            ) {
                Text("Back to Menu")
            }
        }
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .weight(1f)
                .verticalScroll(rememberScrollState())
                .padding(horizontal = 16.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
        com.phlick.game.Levels.allLevels.forEach { level ->
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .clickable { onSelectLevel(level) },
                shape = RoundedCornerShape(8.dp),
                colors = CardDefaults.cardColors(
                    containerColor = MaterialTheme.colorScheme.surfaceVariant
                )
            ) {
                Column(
                    modifier = Modifier.padding(16.dp),
                    verticalArrangement = Arrangement.spacedBy(4.dp)
                ) {
                    Text(
                        text = "Level ${level.number}: ${level.name}",
                        style = MaterialTheme.typography.titleMedium,
                        color = MaterialTheme.colorScheme.onSurface
                    )
                    Text(
                        text = level.description,
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                    Text(
                        text = "Survive ${level.ticksToSurvive} ticks • ${level.monsters.size} monster(s)",
                        style = MaterialTheme.typography.labelSmall,
                        color = MaterialTheme.colorScheme.primary
                    )
                }
            }
        }

        OutlinedButton(
            onClick = onBack,
            modifier = Modifier.fillMaxWidth().padding(16.dp).height(56.dp),
            shape = RoundedCornerShape(4.dp)
        ) {
            Text("Back to Menu")
        }
        }
    }
}

@Composable
fun LevelCompleteDialog(
    level: com.phlick.game.Level,
    prayerPointsUsed: Int,
    initialPrayerPoints: Int,
    attacksBlocked: Int,
    attacksMissed: Int,
    onNextLevel: () -> Unit,
    onBackToMenu: () -> Unit
) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.primary
        )
    ) {
        Column(
            modifier = Modifier.padding(24.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            Text(
                text = "Level Complete!",
                style = MaterialTheme.typography.headlineSmall,
                color = MaterialTheme.colorScheme.onPrimary
            )
            Text(
                text = "You survived ${level.name}",
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onPrimary
            )

            // Statistics panel – single column of label/value rows (gold card, light tint panel like web)
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(8.dp),
                colors = CardDefaults.cardColors(
                    containerColor = MaterialTheme.colorScheme.onPrimary.copy(alpha = 0.2f)
                )
            ) {
                Column(
                    modifier = Modifier.padding(16.dp),
                    verticalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    Text(
                        text = "Statistics",
                        style = MaterialTheme.typography.titleSmall,
                        color = MaterialTheme.colorScheme.onPrimary
                    )
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Text(
                            text = "Attacks blocked",
                            style = MaterialTheme.typography.bodyMedium,
                            color = MaterialTheme.colorScheme.onPrimary.copy(alpha = 0.9f)
                        )
                        Text(
                            text = "$attacksBlocked",
                            style = MaterialTheme.typography.bodyMedium,
                            color = MaterialTheme.colorScheme.onPrimary
                        )
                    }
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Text(
                            text = "Attacks missed",
                            style = MaterialTheme.typography.bodyMedium,
                            color = MaterialTheme.colorScheme.onPrimary.copy(alpha = 0.9f)
                        )
                        Text(
                            text = "$attacksMissed",
                            style = MaterialTheme.typography.bodyMedium,
                            color = MaterialTheme.colorScheme.onPrimary
                        )
                    }
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Text(
                            text = "Prayer points used",
                            style = MaterialTheme.typography.bodyMedium,
                            color = MaterialTheme.colorScheme.onPrimary.copy(alpha = 0.9f)
                        )
                        Text(
                            text = "$prayerPointsUsed / $initialPrayerPoints",
                            style = MaterialTheme.typography.bodyMedium,
                            color = MaterialTheme.colorScheme.onPrimary
                        )
                    }
                    if (prayerPointsUsed == 0) {
                        Text(
                            text = "Perfect flicking! ✨",
                            style = MaterialTheme.typography.bodySmall,
                            color = MaterialTheme.colorScheme.onPrimary
                        )
                    }
                }
            }

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                OutlinedButton(
                    onClick = onBackToMenu,
                    modifier = Modifier.weight(1f),
                    colors = ButtonDefaults.outlinedButtonColors(
                        contentColor = MaterialTheme.colorScheme.onPrimary
                    )
                ) {
                    Text("Menu")
                }
                Button(
                    onClick = onNextLevel,
                    modifier = Modifier.weight(1f),
                    colors = ButtonDefaults.buttonColors(
                        containerColor = MaterialTheme.colorScheme.onPrimary,
                        contentColor = MaterialTheme.colorScheme.primary
                    )
                ) {
                    Text("Next Level")
                }
            }
        }
    }
}

@Composable
fun LevelFailedDialog(
    level: com.phlick.game.Level,
    onRetry: () -> Unit,
    onBackToMenu: () -> Unit
) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.errorContainer
        )
    ) {
        Column(
            modifier = Modifier.padding(24.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            Text(
                text = "Level Failed",
                style = MaterialTheme.typography.headlineSmall,
                color = MaterialTheme.colorScheme.onErrorContainer
            )
            Text(
                text = "You ran out of lives",
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onErrorContainer
            )
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                OutlinedButton(
                    onClick = onBackToMenu,
                    modifier = Modifier.weight(1f)
                ) {
                    Text("Menu")
                }
                Button(
                    onClick = onRetry,
                    modifier = Modifier.weight(1f),
                    colors = ButtonDefaults.buttonColors(
                        containerColor = MaterialTheme.colorScheme.error,
                        contentColor = MaterialTheme.colorScheme.onError
                    )
                ) {
                    Text("Retry")
                }
            }
        }
    }
}
