import type { GameMode, Level, Prayer } from "./types";
import { PROGRESSION_WARMUP_TICKS } from "./constants";

export function computeRequiredPrayers(
  gameMode: GameMode,
  currentTick: number,
  currentLevel: Level | null,
  reactiveMonsterAttacks: Record<number, Prayer>,
  magicMonsterAttackOffset: number | null,
  rangedMonsterAttackOffset: number | null
): Set<Prayer> {
  if (gameMode === "Progression") {
    const effectiveTick = currentTick - PROGRESSION_WARMUP_TICKS;
    if (effectiveTick < 0) return new Set();
    if (!currentLevel) return new Set();
    const required = new Set<Prayer>();
    currentLevel.monsters.forEach((monster, index) => {
      const offset = monster.offset;
      const adjustedTick = currentTick - offset;
      if (adjustedTick > 0 && adjustedTick % monster.cycleLength === 0 && effectiveTick >= offset) {
        const style = monster.isReactive
          ? reactiveMonsterAttacks[index] ?? monster.attackStyle
          : monster.attackStyle;
        required.add(style);
      }
    });
    return required;
  }
  // Sandbox
  const magicAttack =
    magicMonsterAttackOffset != null &&
    (currentTick - magicMonsterAttackOffset) % 4 === 0 &&
    currentTick >= magicMonsterAttackOffset;
  const rangedAttack =
    rangedMonsterAttackOffset != null &&
    (currentTick - rangedMonsterAttackOffset) % 4 === 0 &&
    currentTick >= rangedMonsterAttackOffset;
  const set = new Set<Prayer>();
  if (magicAttack) set.add("Magic");
  if (rangedAttack) set.add("Missiles");
  return set;
}
