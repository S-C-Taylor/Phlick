package com.phlick.ui

import androidx.compose.animation.core.tween
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp

enum class AttackStyle {
    Magic,   // blue
    Ranged, // green
    Melee   // red
}

private const val SEGMENT_GAP_DP = 2
private const val SEGMENT_HEIGHT_DP = 10
private const val STACK_WIDTH_DP = 32

/**
 * Monster attack cycle shown as stacked segments. One segment fills per tick;
 * when all are full, that tick is the attack (stack highlights).
 * [cycleLength] = number of ticks in the cycle (e.g. 4 for 4-tick).
 * [tickInCycle] = 0 = attack tick, 1..cycleLength-1 = growing, -1 = inactive.
 */
@Composable
fun MonsterView(
    attackStyle: AttackStyle,
    isAttacking: Boolean,
    tickInCycle: Int,
    cycleLength: Int = 4,
    modifier: Modifier = Modifier
) {
    val color = when (attackStyle) {
        AttackStyle.Magic -> Color(0xFF1E88E5)
        AttackStyle.Ranged -> Color(0xFF43A047)
        AttackStyle.Melee -> Color(0xFFE53935)
    }

    val unfilledColor = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.6f)

    // Base filled segments from cycle position:
    // - tickInCycle <= 0 -> 0 segments (empty / pre-cycle)
    // - tickInCycle > 0  -> that many segments, up to cycleLength
    // The actual attack tick is indicated separately via isAttacking, which forces a full stack.
    val baseFilledCount = when {
        tickInCycle <= 0 -> 0
        else -> tickInCycle.coerceAtMost(cycleLength)
    }
    val filledCount = if (isAttacking) cycleLength else baseFilledCount

    val borderColor = if (isAttacking) Color(0xFFFFD700) else MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.3f)

    val totalHeight = (cycleLength * SEGMENT_HEIGHT_DP + (cycleLength - 1) * SEGMENT_GAP_DP).dp

    Box(
        modifier = modifier
            .width(STACK_WIDTH_DP.dp)
            .height(totalHeight + 24.dp), // extra for label
        contentAlignment = Alignment.Center
    ) {
        Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.spacedBy(SEGMENT_GAP_DP.dp)
        ) {
            Box(
                modifier = Modifier
                    .width(STACK_WIDTH_DP.dp)
                    .height(totalHeight)
                    .clip(RoundedCornerShape(4.dp))
                    .border(2.dp, borderColor, RoundedCornerShape(4.dp))
            ) {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(totalHeight),
                    verticalArrangement = Arrangement.spacedBy(SEGMENT_GAP_DP.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    // Segments top to bottom; loop index 0 = top segment, so fill from "bottom" (last drawn) first
                    (0 until cycleLength).forEach { index ->
                        val segmentFilled = (cycleLength - 1 - index) < filledCount
                        Box(
                            modifier = Modifier
                                .width((STACK_WIDTH_DP - 4).dp)
                                .height(SEGMENT_HEIGHT_DP.dp)
                                .clip(RoundedCornerShape(2.dp))
                                .background(
                                    if (segmentFilled) color else unfilledColor
                                )
                        )
                    }
                }
            }
            Text(
                text = when (attackStyle) {
                    AttackStyle.Magic -> "M"
                    AttackStyle.Ranged -> "R"
                    AttackStyle.Melee -> "L"
                },
                color = MaterialTheme.colorScheme.onSurfaceVariant,
                style = MaterialTheme.typography.labelSmall
            )
        }
    }
}
