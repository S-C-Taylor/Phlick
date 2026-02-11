import type { GameState, Level, LevelState } from "./types";
import { INITIAL_PRAYER_POINTS } from "./constants";
import { computeRequiredPrayers } from "./requiredPrayers";

export function createInitialState(): GameState {
  return {
    gameMode: "Sandbox",
    currentTick: 0,
    selectedPrayer: null,
    streak: 0,
    bestStreak: 0,
    lastResult: null,
    isRunning: false,
    prayerPoints: 100,
    consecutiveTicksWithPrayer: 0,
    wasPrayerActiveLastTick: false,
    prayerAtTickStart: null,
    prayerActivatedThisTick: false,
    isMagicWallUp: true,
    isRangedWallUp: true,
    magicMonsterAttackOffset: null,
    rangedMonsterAttackOffset: null,
    levelState: {
      currentLevel: null,
      health: 100,
      lives: 3,
      levelStartTick: 0,
      currentTick: 0,
      isLevelComplete: false,
      isLevelFailed: false,
      initialPrayerPoints: 0,
      attacksBlocked: 0,
      attacksMissed: 0,
    },
    reactiveMonsterAttacks: {},
  };
}

export function createSandboxState(): GameState {
  return {
    ...createInitialState(),
    gameMode: "Sandbox",
    isRunning: true,
    prayerPoints: INITIAL_PRAYER_POINTS,
    consecutiveTicksWithPrayer: 0,
    isMagicWallUp: true,
    isRangedWallUp: true,
    magicMonsterAttackOffset: null,
    rangedMonsterAttackOffset: null,
  };
}

export function createProgressionState(level: Level, startImmediately: boolean): GameState {
  const prayerPoints = level.initialPrayerPoints ?? INITIAL_PRAYER_POINTS;
  const levelState: LevelState = {
    currentLevel: level,
    health: 100,
    lives: 3,
    levelStartTick: 0,
    currentTick: 0,
    isLevelComplete: false,
    isLevelFailed: false,
    initialPrayerPoints: prayerPoints,
    attacksBlocked: 0,
    attacksMissed: 0,
  };
  return {
    ...createInitialState(),
    gameMode: "Progression",
    isRunning: startImmediately,
    prayerPoints,
    levelState,
    reactiveMonsterAttacks: {},
  };
}

function calculateHealth(level: Level, ticksElapsed: number): number {
  const total = level.ticksToSurvive;
  if (total === 0) return 100;
  return Math.round(
    Math.max(0, Math.min(100, ((total - ticksElapsed) / total) * 100))
  );
}

export interface TickResult {
  state: GameState;
  feedback?: "Correct" | "Wrong";
  levelComplete?: Level;
  levelFailed?: Level;
}

export function processTick(
  currentState: GameState,
  newTick: number
): TickResult {
  const prayerForAttackResolution = currentState.selectedPrayer;

  // Prayer drain (1-tick flick: activation = no drain)
  const wasPrayerActiveAtTickStart = currentState.wasPrayerActiveLastTick;
  const isPrayerActiveNow = currentState.selectedPrayer != null;
  const activatedThisTick = currentState.prayerActivatedThisTick;
  let newConsecutiveTicks: number;
  if (activatedThisTick) newConsecutiveTicks = 0;
  else if (wasPrayerActiveAtTickStart && isPrayerActiveNow)
    newConsecutiveTicks = currentState.consecutiveTicksWithPrayer + 1;
  else newConsecutiveTicks = 0;

  const drain = newConsecutiveTicks >= 5;
  const newPrayerPoints = drain
    ? Math.max(0, currentState.prayerPoints - 1)
    : currentState.prayerPoints;
  const finalConsecutiveTicks = drain ? 0 : newConsecutiveTicks;
  const prayerDisabled = newPrayerPoints <= 0 && currentState.selectedPrayer != null;
  const prayerAfterDrain = prayerDisabled ? null : currentState.selectedPrayer;
  const prayerActiveForNextTick = prayerAfterDrain != null;

  const stateWithPrayerDrain: GameState = {
    ...currentState,
    currentTick: newTick,
    prayerPoints: newPrayerPoints,
    consecutiveTicksWithPrayer: prayerDisabled ? 0 : finalConsecutiveTicks,
    selectedPrayer: prayerAfterDrain,
    wasPrayerActiveLastTick: prayerActiveForNextTick,
    prayerAtTickStart: prayerAfterDrain,
    prayerActivatedThisTick: false,
  };

  if (stateWithPrayerDrain.gameMode === "Progression") {
    const levelState = stateWithPrayerDrain.levelState;
    const level = levelState.currentLevel;
    if (!level) return { state: stateWithPrayerDrain };

    const effectiveTick = Math.max(0, newTick - 3);
    const ticksElapsed = effectiveTick - levelState.levelStartTick;
    const health = calculateHealth(level, ticksElapsed);
    const updatedLevelState: LevelState = {
      ...levelState,
      currentTick: newTick,
      health,
    };

    // Reactive monsters: decide at tickInCycle === 3
    const updatedReactive: Record<number, "Magic" | "Missiles" | "Melee"> = {
      ...stateWithPrayerDrain.reactiveMonsterAttacks,
    };
    level.monsters.forEach((monster, index) => {
      if (!monster.isReactive) return;
      const offset = monster.offset;
      const adjustedTick = newTick - offset;
      const tickInCycle = adjustedTick < 0 ? 0 : adjustedTick % monster.cycleLength;
      if (adjustedTick >= 0 && tickInCycle === 3) {
        const playerPrayer = stateWithPrayerDrain.selectedPrayer;
        updatedReactive[index] =
          playerPrayer === "Magic"
            ? "Missiles"
            : playerPrayer === "Missiles"
              ? "Magic"
              : "Magic";
      }
    });

    const stateWithReactive: GameState = {
      ...stateWithPrayerDrain,
      levelState: updatedLevelState,
      reactiveMonsterAttacks: updatedReactive,
    };

    const required = computeRequiredPrayers(
      "Progression",
      newTick,
      level,
      updatedReactive,
      null,
      null
    );

    if (required.size > 0) {
      const requiredArr = Array.from(required);
      const result =
        requiredArr.length > 1
          ? ("Wrong" as const)
          : prayerForAttackResolution === requiredArr[0]
            ? ("Correct" as const)
            : ("Wrong" as const);

      const newLives = Math.max(0, updatedLevelState.lives - (result === "Wrong" ? 1 : 0));
      const isFailed = newLives === 0;
      const finalLevelState: LevelState = {
        ...updatedLevelState,
        lives: newLives,
        isLevelFailed: isFailed,
        attacksBlocked: updatedLevelState.attacksBlocked + (result === "Correct" ? 1 : 0),
        attacksMissed: updatedLevelState.attacksMissed + (result === "Wrong" ? 1 : 0),
      };

      const ticksElapsedForCompletion = effectiveTick - levelState.levelStartTick;
      const isComplete = ticksElapsedForCompletion >= level.ticksToSurvive && !isFailed;

      const finalState: GameState = {
        ...stateWithReactive,
        levelState: { ...finalLevelState, currentTick: newTick, isLevelComplete: isComplete },
        lastResult: result,
        streak: result === "Correct" ? stateWithReactive.streak + 1 : 0,
        isRunning: !isComplete && !isFailed,
      };

      return {
        state: finalState,
        feedback: result,
        ...(isComplete && { levelComplete: level }),
        ...(isFailed && { levelFailed: level }),
      };
    }

    const ticksElapsedForCompletion = effectiveTick - levelState.levelStartTick;
    const isComplete =
      ticksElapsedForCompletion >= level.ticksToSurvive && !updatedLevelState.isLevelFailed;
    const finalLevelState: LevelState = {
      ...updatedLevelState,
      currentTick: newTick,
      isLevelComplete: isComplete,
    };

    const finalState: GameState = {
      ...stateWithReactive,
      levelState: finalLevelState,
      lastResult: null,
      isRunning: !isComplete && !finalLevelState.isLevelFailed,
      reactiveMonsterAttacks: updatedReactive,
    };

    return {
      state: finalState,
      ...(isComplete && { levelComplete: level }),
    };
  }

  // Sandbox
  const required = computeRequiredPrayers(
    "Sandbox",
    newTick,
    null,
    {},
    stateWithPrayerDrain.magicMonsterAttackOffset,
    stateWithPrayerDrain.rangedMonsterAttackOffset
  );

  if (required.size > 0) {
    const requiredArr = Array.from(required);
    const result =
      requiredArr.length > 1
        ? ("Wrong" as const)
        : prayerForAttackResolution === requiredArr[0]
          ? ("Correct" as const)
          : ("Wrong" as const);
    const newStreak = result === "Correct" ? stateWithPrayerDrain.streak + 1 : 0;
    const newBest = Math.max(stateWithPrayerDrain.bestStreak, newStreak);
    return {
      state: {
        ...stateWithPrayerDrain,
        streak: newStreak,
        bestStreak: newBest,
        lastResult: result,
      },
      feedback: result,
    };
  }

  return {
    state: { ...stateWithPrayerDrain, lastResult: null },
  };
}
