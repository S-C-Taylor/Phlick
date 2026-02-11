import { useCallback, useEffect, useRef, useState } from "react";
import type { GameState, Level } from "./core/types";
import { processTick } from "./core/state";

const TICK_MS = 600;

export function useTickEngine(initialState: GameState) {
  const [state, setState] = useState<GameState>(initialState);
  const [feedback, setFeedback] = useState<"Correct" | "Wrong" | null>(null);
  const [levelComplete, setLevelComplete] = useState<Level | null>(null);
  const [levelFailed, setLevelFailed] = useState<Level | null>(null);
  const tickIndexRef = useRef(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stop = useCallback(() => {
    if (intervalRef.current != null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const start = useCallback(() => {
    stop();
    intervalRef.current = setInterval(() => {
      tickIndexRef.current += 1;
      const newTick = tickIndexRef.current;
      setState((prev) => {
        const result = processTick(prev, newTick);
        if (result.feedback) setFeedback(result.feedback);
        if (result.levelComplete) setLevelComplete(result.levelComplete);
        if (result.levelFailed) setLevelFailed(result.levelFailed);
        if (result.levelComplete || result.levelFailed) stop();
        return result.state;
      });
    }, TICK_MS);
  }, [stop]);

  useEffect(() => {
    return () => stop();
  }, [stop]);

  const resetTickIndex = useCallback(() => {
    tickIndexRef.current = 0;
  }, []);

  const setPrayer = useCallback((prayer: "Magic" | "Missiles" | "Melee") => {
    setState((prev) => {
      if (prev.prayerPoints <= 0) {
        return { ...prev, selectedPrayer: null, prayerActivatedThisTick: false };
      }
      const newPrayer = prev.selectedPrayer === prayer ? null : prayer;
      const activatedThisTick = newPrayer != null && prev.selectedPrayer == null;
      return {
        ...prev,
        selectedPrayer: newPrayer,
        prayerActivatedThisTick: prev.prayerActivatedThisTick || activatedThisTick,
      };
    });
  }, []);

  const knockDownMagicWall = useCallback(() => {
    setState((prev) => {
      if (prev.gameMode !== "Sandbox" || !prev.isMagicWallUp) return prev;
      return {
        ...prev,
        isMagicWallUp: false,
        magicMonsterAttackOffset: prev.currentTick + 1,
      };
    });
  }, []);

  const knockDownRangedWall = useCallback(() => {
    setState((prev) => {
      if (prev.gameMode !== "Sandbox" || !prev.isRangedWallUp) return prev;
      return {
        ...prev,
        isRangedWallUp: false,
        rangedMonsterAttackOffset: prev.currentTick + 1,
      };
    });
  }, []);

  return {
    state,
    setState,
    setPrayer,
    feedback,
    setFeedback,
    levelComplete,
    setLevelComplete,
    levelFailed,
    setLevelFailed,
    start,
    stop,
    resetTickIndex,
    knockDownMagicWall,
    knockDownRangedWall,
  };
}
