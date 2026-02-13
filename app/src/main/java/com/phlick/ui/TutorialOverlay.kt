package com.phlick.ui

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp

/** Level numbers that have a guided tutorial on first playthrough. */
val TUTORIAL_LEVELS = setOf(1, 3, 9)

@Composable
fun TutorialOverlay(
    title: String,
    message: String,
    onDismiss: () -> Unit,
    modifier: Modifier = Modifier
) {
    Box(
        modifier = modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.surface.copy(alpha = 0.55f)),
        contentAlignment = Alignment.Center
    ) {
        Card(
            modifier = Modifier
                .fillMaxWidth()
                .padding(24.dp),
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
                    text = title,
                    style = MaterialTheme.typography.titleLarge,
                    color = MaterialTheme.colorScheme.onSurface
                )
                Text(
                    text = message,
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                    textAlign = TextAlign.Center
                )
                Button(
                    onClick = onDismiss,
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(4.dp),
                    colors = ButtonDefaults.buttonColors(
                        containerColor = MaterialTheme.colorScheme.primary,
                        contentColor = MaterialTheme.colorScheme.onPrimary
                    )
                ) {
                    Text("Got it")
                }
            }
        }
    }
}

/** Returns (title, message) for the guided tutorial for this level, or null if no tutorial. */
fun getTutorialForLevel(levelNumber: Int): Pair<String, String>? = when (levelNumber) {
    1 -> "First steps" to """
        The mage attacks with magic—use Protect from Magic when it attacks.
        The unfilled rectangles show its attack cycle. You have 3 lives; survive the ticks above to complete the level.
    """.trimIndent()
    3 -> "Prayer conservation" to """
        You only have 1 prayer point. Turn the prayer on only the tick you need it—then turn it off.
        That's 1-tick flicking: no drain when you flick on and off in one tick.
    """.trimIndent()
    9 -> "Reactive blob" to """
        This monster is reactive: it checks your prayer a few ticks before attacking and attacks with the opposite style.
        Show a prayer 3 ticks before it attacks to make it match another monster's timing.
    """.trimIndent()
    else -> null
}
