/** Prayer protection types. Matches shared module. */
export type Prayer = "Magic" | "Missiles" | "Melee";

export type GameMode = "Sandbox" | "Progression";

export type FlickResult = "Correct" | "Wrong";

export interface MonsterConfig {
  attackStyle: Prayer;
  cycleLength: number;
  offset: number;
  isReactive?: boolean;
}

export interface Level {
  number: number;
  name: string;
  monsters: MonsterConfig[];
  ticksToSurvive: number;
  description?: string;
  initialPrayerPoints?: number;
}

export interface LevelState {
  currentLevel: Level | null;
  health: number;
  lives: number;
  levelStartTick: number;
  currentTick: number;
  isLevelComplete: boolean;
  isLevelFailed: boolean;
  initialPrayerPoints: number;
  attacksBlocked: number;
  attacksMissed: number;
}

export interface MonsterDisplayInfo {
  attackStyle: Prayer;
  tickInCycle: number;
  cycleLength: number;
  isAttacking: boolean;
  isWallUp: boolean;
}

export interface GameState {
  gameMode: GameMode;
  currentTick: number;
  selectedPrayer: Prayer | null;
  streak: number;
  bestStreak: number;
  lastResult: FlickResult | null;
  isRunning: boolean;
  prayerPoints: number;
  consecutiveTicksWithPrayer: number;
  wasPrayerActiveLastTick: boolean;
  prayerAtTickStart: Prayer | null;
  prayerActivatedThisTick: boolean;
  isMagicWallUp: boolean;
  isRangedWallUp: boolean;
  magicMonsterAttackOffset: number | null;
  rangedMonsterAttackOffset: number | null;
  levelState: LevelState;
  reactiveMonsterAttacks: Record<number, Prayer>;
  /** 1-tick flick helper: when current tick started (ms), marks 0–1 for prayer toggles this tick */
  lastTickTimeMs?: number;
  prayerMarksForTick?: number[];
}
