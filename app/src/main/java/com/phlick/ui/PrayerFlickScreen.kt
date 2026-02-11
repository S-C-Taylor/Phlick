package com.phlick.ui

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Text
import androidx.compose.ui.draw.clip
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.phlick.game.FlickResult
import com.phlick.game.Prayer

@Composable
fun PrayerFlickScreen(
    viewModel: PrayerFlickViewModel,
    onBackToMenu: () -> Unit = {}
) {
    val state by viewModel.gameHolder.state

    // Ensure we're in sandbox mode
    LaunchedEffect(Unit) {
        if (state.gameMode != com.phlick.game.GameMode.Sandbox && !state.isRunning) {
            // Already in sandbox or will be set when starting
        }
    }

    val activeMonsters = state.getActiveMonsters()

    Column(
        modifier = Modifier
            .fillMaxWidth()
            .background(MaterialTheme.colorScheme.background)
            .padding(16.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        // Title card
        Card(
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(8.dp),
            colors = CardDefaults.cardColors(
                containerColor = MaterialTheme.colorScheme.surfaceVariant
            )
        ) {
            Text(
                text = "Sandbox Mode",
                style = MaterialTheme.typography.headlineSmall,
                color = MaterialTheme.colorScheme.onSurface,
                modifier = Modifier.padding(16.dp)
            )
        }

        // Streak card
        Card(
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(8.dp),
            colors = CardDefaults.cardColors(
                containerColor = MaterialTheme.colorScheme.surfaceVariant
            )
        ) {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(12.dp),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Text(
                    text = "Streak: ${state.streak}",
                    style = MaterialTheme.typography.titleMedium,
                    color = MaterialTheme.colorScheme.onSurface
                )
                Text(
                    text = "Best: ${state.bestStreak}",
                    style = MaterialTheme.typography.titleMedium,
                    color = MaterialTheme.colorScheme.primary
                )
            }
        }

        // Prayer Points
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

        TickCounter(tick = state.currentTick)

        Spacer(modifier = Modifier.height(8.dp))

        // Monster row with labels - dynamically show active monsters
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceEvenly,
            verticalAlignment = Alignment.CenterVertically
        ) {
            activeMonsters.forEach { monsterInfo ->
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    Box(contentAlignment = Alignment.Center) {
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
                        if (monsterInfo.isWallUp) {
                            MonsterWall(
                                isWallUp = true,
                                onClick = {
                                    when (monsterInfo.attackStyle) {
                                        Prayer.Magic -> viewModel.gameHolder.knockDownMagicWall()
                                        Prayer.Missiles -> viewModel.gameHolder.knockDownRangedWall()
                                        Prayer.Melee -> {} // Not implemented yet
                                    }
                                }
                            )
                        }
                    }
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

        // Player prayer indicator
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

        // Prayer buttons with OSRS-style rectangular design
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            Button(
                onClick = { viewModel.setPrayer(Prayer.Magic) },
                modifier = Modifier
                    .weight(1f)
                    .height(56.dp),
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
                modifier = Modifier
                    .weight(1f)
                    .height(56.dp),
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

        Spacer(modifier = Modifier.height(16.dp))

        // Feedback card
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
                        text = "✗ Wrong!",
                        style = MaterialTheme.typography.titleMedium,
                        color = MaterialTheme.colorScheme.error,
                        modifier = Modifier.padding(horizontal = 16.dp, vertical = 8.dp)
                    )
                }
                null -> {}
            }
        }

        Spacer(modifier = Modifier.weight(1f))

        // Control buttons
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            OutlinedButton(
                onClick = {
                    viewModel.gameHolder.reset()
                    onBackToMenu()
                },
                modifier = Modifier.weight(1f).height(56.dp),
                shape = RoundedCornerShape(4.dp)
            ) {
                Text("Back to Menu")
            }
            Button(
                onClick = if (state.isRunning) { { viewModel.stop() } } else { { viewModel.gameHolder.startSandbox() } },
                modifier = Modifier.weight(1f).height(56.dp),
                shape = RoundedCornerShape(4.dp),
                colors = ButtonDefaults.buttonColors(
                    containerColor = if (state.isRunning) 
                        MaterialTheme.colorScheme.error 
                    else 
                        MaterialTheme.colorScheme.primary,
                    contentColor = MaterialTheme.colorScheme.onPrimary
                )
            ) {
                Text(
                    text = if (state.isRunning) "Stop" else "Start",
                    style = MaterialTheme.typography.labelLarge
                )
            }
        }
    }
}
