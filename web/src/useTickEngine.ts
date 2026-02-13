import { useCallback, useEffect, useRef, useState } from "react";
import type { GameState, Level } from "./core/types";
import { processTick } from "./core/state";

const TICK_MS = 600;

export type TickEngineOptions = {
  randomLatencyEnabled: boolean;
  randomLatencyMsMax: number;
};

export function useTickEngine(initialState: GameState, options?: TickEngineOptions) {
  const [state, setState] = useState<GameState>(initialState);
  const [feedback, setFeedback] = useState<"Correct" | "Wrong" | null>(null);
  const [levelComplete, setLevelComplete] = useState<Level | null>(null);
  const [levelFailed, setLevelFailed] = useState<Level | null>(null);
  const tickIndexRef = useRef(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const optionsRef = useRef(options);
  const runningRef = useRef(false);
  optionsRef.current = options;

  const stop = useCallback(() => {
    runningRef.current = false;
    if (intervalRef.current != null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (timeoutRef.current != null) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const runTick = useCallback(() => {
    tickIndexRef.current += 1;
    const newTick = tickIndexRef.current;
    const tickStartMs = Date.now();
    setState((prev) => {
      const result = processTick(prev, newTick);
      if (result.feedback) setFeedback(result.feedback);
      if (result.levelComplete) setLevelComplete(result.levelComplete);
      if (result.levelFailed) setLevelFailed(result.levelFailed);
      if (result.levelComplete || result.levelFailed) stop();
      return {
        ...result.state,
        lastTickTimeMs: tickStartMs,
        prayerMarksForTick: [],
      };
    });
  }, [stop]);

  const start = useCallback(() => {
    stop();
    runningRef.current = true;
    const opts = optionsRef.current;
    const useLatency = opts?.randomLatencyEnabled && (opts.randomLatencyMsMax ?? 0) > 0;

    if (useLatency) {
      const scheduleNext = () => {
        if (!runningRef.current) return;
        const maxMs = Math.min(opts?.randomLatencyMsMax ?? 0, 300);
        const extraMs = Math.floor(Math.random() * (maxMs + 1));
        timeoutRef.current = setTimeout(() => {
          runTick();
          if (runningRef.current) scheduleNext();
        }, TICK_MS + extraMs);
      };
      scheduleNext();
    } else {
      intervalRef.current = setInterval(runTick, TICK_MS);
    }
  }, [stop, runTick]);

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
      const tickMs = prev.lastTickTimeMs ?? 0;
      const markPosition =
        tickMs > 0 && prev.isRunning
          ? Math.max(0, Math.min(1, (Date.now() - tickMs) / 600))
          : null;
      const newMarks =
        markPosition != null
          ? [...(prev.prayerMarksForTick ?? []), markPosition]
          : prev.prayerMarksForTick ?? [];
      return {
        ...prev,
        selectedPrayer: newPrayer,
        prayerActivatedThisTick: prev.prayerActivatedThisTick || activatedThisTick,
        prayerMarksForTick: newMarks,
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
