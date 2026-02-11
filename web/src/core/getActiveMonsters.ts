import type { GameMode, Level, MonsterDisplayInfo, Prayer } from "./types";
import { PROGRESSION_WARMUP_TICKS } from "./constants";

export function getActiveMonsters(
  gameMode: GameMode,
  currentTick: number,
  isRunning: boolean,
  currentLevel: Level | null,
  reactiveMonsterAttacks: Record<number, Prayer>,
  magicMonsterAttackOffset: number | null,
  rangedMonsterAttackOffset: number | null,
  isMagicWallUp: boolean,
  isRangedWallUp: boolean
): MonsterDisplayInfo[] {
  if (gameMode === "Progression") {
    if (!isRunning) {
      return (currentLevel?.monsters ?? []).map((m) => ({
        attackStyle: m.attackStyle,
        tickInCycle: -1,
        cycleLength: m.cycleLength,
        isAttacking: false,
        isWallUp: false,
      }));
    }
    const effectiveTick = currentTick - PROGRESSION_WARMUP_TICKS;
    const inWarmup = effectiveTick < 0;
    return (currentLevel?.monsters ?? []).map((monster, index) => {
      const offset = monster.offset;
      const adjustedTick = currentTick - offset;
      const tickInCycle = adjustedTick < 0 ? 0 : adjustedTick % monster.cycleLength;
      const visualCycleComplete = adjustedTick > 0 && adjustedTick % monster.cycleLength === 0;
      const isAttacking = visualCycleComplete && !inWarmup && effectiveTick >= offset;
      const displayAttackStyle = monster.isReactive
        ? reactiveMonsterAttacks[index] ?? monster.attackStyle
        : monster.attackStyle;
      return {
        attackStyle: displayAttackStyle,
        tickInCycle,
        cycleLength: monster.cycleLength,
        isAttacking,
        isWallUp: false,
      };
    });
  }
  // Sandbox
  const result: MonsterDisplayInfo[] = [];
  if (magicMonsterAttackOffset != null || isMagicWallUp) {
    const offset = magicMonsterAttackOffset ?? -1;
    const tickInCycle = offset >= 0 && currentTick >= offset ? (currentTick - offset) % 4 : -1;
    result.push({
      attackStyle: "Magic",
      tickInCycle,
      cycleLength: 4,
      isAttacking: tickInCycle === 0 && offset >= 0 && currentTick >= offset,
      isWallUp: isMagicWallUp,
    });
  }
  if (rangedMonsterAttackOffset != null || isRangedWallUp) {
    const offset = rangedMonsterAttackOffset ?? -1;
    const tickInCycle = offset >= 0 && currentTick >= offset ? (currentTick - offset) % 4 : -1;
    result.push({
      attackStyle: "Missiles",
      tickInCycle,
      cycleLength: 4,
      isAttacking: tickInCycle === 0 && offset >= 0 && currentTick >= offset,
      isWallUp: isRangedWallUp,
    });
  }
  return result;
}
