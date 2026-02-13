package com.phlick.ui

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableFloatStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.unit.dp
import kotlinx.coroutines.delay

private const val TICK_MS = 600L

/**
 * 1-tick flick helper in the spirit of the RuneLite One-Tick Flick plugin:
 * one horizontal bar representing a single 600ms game tick, a sweep flying across it,
 * and small x marks where the player activated/deactivated prayer.
 *
 * @param lastTickTimeMs When the current tick started (System.currentTimeMillis()).
 * @param marks Positions 0–1 within the current tick where prayer was toggled.
 */
@Composable
fun TickBar(
    lastTickTimeMs: Long,
    marks: List<Float>,
    modifier: Modifier = Modifier
) {
    var progress by remember { mutableFloatStateOf(0f) }
    val primary = MaterialTheme.colorScheme.primary
    val onSurface = MaterialTheme.colorScheme.onSurface
    val surfaceVariant = MaterialTheme.colorScheme.surfaceVariant

    LaunchedEffect(lastTickTimeMs) {
        while (true) {
            progress = if (lastTickTimeMs <= 0L) 0f
            else ((System.currentTimeMillis() - lastTickTimeMs) / TICK_MS.toFloat()).coerceIn(0f, 1f)
            delay(50)
        }
    }

    Row(
        modifier = modifier
            .fillMaxWidth()
            .padding(vertical = 4.dp),
        horizontalArrangement = Arrangement.spacedBy(8.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Text(
            text = "Tick",
            style = MaterialTheme.typography.labelSmall,
            color = MaterialTheme.colorScheme.onSurfaceVariant
        )
        Canvas(
            modifier = Modifier
                .height(24.dp)
                .weight(1f)
                .clip(RoundedCornerShape(4.dp))
                .background(surfaceVariant)
        ) {
            val w = size.width
            val h = size.height
            val stroke = 2f
            val sweepW = (w * progress.coerceIn(0f, 1f)).coerceAtLeast(0f)

            // Sweep: filled rect from 0 to progress (flying bar)
            if (sweepW > 0) {
                drawRect(
                    color = primary.copy(alpha = 0.5f),
                    topLeft = Offset(2f, 2f),
                    size = Size(sweepW - 4f, h - 4f)
                )
            }
            // Small x at each prayer toggle position
            val markRadius = 4f
            marks.forEach { pos ->
                val x = (w * pos.coerceIn(0f, 1f)).coerceIn(markRadius, w - markRadius)
                val cy = h / 2f
                val path = Path().apply {
                    moveTo(x - markRadius, cy - markRadius)
                    lineTo(x + markRadius, cy + markRadius)
                    moveTo(x + markRadius, cy - markRadius)
                    lineTo(x - markRadius, cy + markRadius)
                }
                drawPath(path, color = onSurface, style = Stroke(width = stroke))
            }
        }
    }
}
