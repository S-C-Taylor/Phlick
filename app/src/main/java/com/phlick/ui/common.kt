package com.phlick.ui

import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.tween
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import com.phlick.game.Prayer

@Composable
fun TickCounter(tick: Int) {
    val cycleTick = (tick % 4) + 1
    Card(
        modifier = Modifier.padding(8.dp),
        shape = RoundedCornerShape(8.dp),
        colors = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.surfaceVariant
        )
    ) {
        Row(
            modifier = Modifier.padding(horizontal = 16.dp, vertical = 8.dp),
            horizontalArrangement = Arrangement.spacedBy(8.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(
                text = "Cycle:",
                style = MaterialTheme.typography.labelMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
            Text(
                text = "$cycleTick",
                style = MaterialTheme.typography.headlineSmall,
                color = MaterialTheme.colorScheme.primary
            )
            Text(
                text = "/ 4",
                style = MaterialTheme.typography.labelMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
        }
    }
}

@Composable
fun PlayerPrayer(
    prayer: Prayer?,
    modifier: Modifier = Modifier
) {
    val color = when (prayer) {
        Prayer.Magic -> Color(0xFF1E88E5) // Blue for magic
        Prayer.Missiles -> Color(0xFF43A047) // Green for ranged
        else -> MaterialTheme.colorScheme.surfaceVariant
    }

    Box(
        modifier = modifier.size(72.dp),
        contentAlignment = Alignment.Center
    ) {
        Box(
            modifier = Modifier
                .size(72.dp)
                .clip(CircleShape)
                .background(color)
                .border(
                    2.dp,
                    MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.5f),
                    CircleShape
                )
        )
    }
}

@Composable
fun MonsterWall(
    isWallUp: Boolean,
    onClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    val alpha by animateFloatAsState(
        targetValue = if (isWallUp) 1f else 0f,
        animationSpec = tween(durationMillis = 300)
    )

    if (alpha > 0f) {
        Box(
            modifier = modifier
                .size(80.dp)
                .background(
                    MaterialTheme.colorScheme.surfaceVariant.copy(alpha = alpha * 0.9f),
                    shape = RoundedCornerShape(8.dp)
                )
                .border(
                    2.dp,
                    MaterialTheme.colorScheme.primary.copy(alpha = alpha),
                    RoundedCornerShape(8.dp)
                )
                .clickable { onClick() },
            contentAlignment = Alignment.Center
        ) {
            Text(
                text = "Tap",
                style = MaterialTheme.typography.labelSmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = alpha)
            )
        }
    }
}
