export const MAX_LATENCY_MS = 300;

export interface AppSettings {
  randomLatencyEnabled: boolean;
  randomLatencyMsMin: number;
  randomLatencyMsMax: number;
  showTickBar: boolean;
}

const STORAGE_KEY = "phlick_settings";
const TUTORIAL_SEEN_KEY = "phlick_tutorial_seen";
const HIGHEST_LEVEL_COMPLETED_KEY = "phlick_highest_level_completed";

const defaults: AppSettings = {
  randomLatencyEnabled: false,
  randomLatencyMsMin: 0,
  randomLatencyMsMax: 100,
  showTickBar: false,
};

function clampLatency(n: number): number {
  return Math.max(0, Math.min(MAX_LATENCY_MS, n));
}

export function loadSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...defaults };
    const parsed = JSON.parse(raw) as Partial<AppSettings>;
    return {
      randomLatencyEnabled: parsed.randomLatencyEnabled ?? defaults.randomLatencyEnabled,
      randomLatencyMsMin: clampLatency(parsed.randomLatencyMsMin ?? defaults.randomLatencyMsMin),
      randomLatencyMsMax: clampLatency(parsed.randomLatencyMsMax ?? defaults.randomLatencyMsMax),
      showTickBar: parsed.showTickBar ?? defaults.showTickBar,
    };
  } catch {
    return { ...defaults };
  }
}

export function saveSettings(settings: AppSettings): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // ignore
  }
}

/** Highest progression level number the user has completed (0 = none; level N unlocked when N <= this + 1). */
export function loadHighestLevelCompleted(): number {
  try {
    const raw = localStorage.getItem(HIGHEST_LEVEL_COMPLETED_KEY);
    if (raw == null) return 0;
    const n = parseInt(raw, 10);
    return Number.isFinite(n) && n >= 0 ? n : 0;
  } catch {
    return 0;
  }
}

export function saveHighestLevelCompleted(levelNumber: number): void {
  try {
    const current = loadHighestLevelCompleted();
    if (levelNumber > current) {
      localStorage.setItem(HIGHEST_LEVEL_COMPLETED_KEY, String(levelNumber));
    }
  } catch {
    // ignore
  }
}

/** Level numbers that have a guided tutorial on first playthrough. */
export const TUTORIAL_LEVELS = new Set([1, 3, 9]);

export function loadTutorialSeenLevels(): Set<number> {
  try {
    const raw = localStorage.getItem(TUTORIAL_SEEN_KEY);
    if (!raw) return new Set();
    const arr = JSON.parse(raw) as number[];
    return new Set(Array.isArray(arr) ? arr.filter((n) => typeof n === "number" && n > 0) : []);
  } catch {
    return new Set();
  }
}

export function saveTutorialSeen(levelNumber: number): void {
  try {
    const seen = loadTutorialSeenLevels();
    seen.add(levelNumber);
    localStorage.setItem(TUTORIAL_SEEN_KEY, JSON.stringify([...seen]));
  } catch {
    // ignore
  }
}

export function getTutorialForLevel(levelNumber: number): { title: string; message: string } | null {
  switch (levelNumber) {
    case 1:
      return {
        title: "First steps",
        message:
          "The mage attacks with magic—use Protect from Magic when it attacks. The unfilled rectangles show its attack cycle. You have 3 lives; survive the ticks above to complete the level.",
      };
    case 3:
      return {
        title: "Prayer conservation",
        message:
          "You only have 1 prayer point. Turn the prayer on only the tick you need it—then turn it off. That's 1-tick flicking: no drain when you flick on and off in one tick.",
      };
    case 9:
      return {
        title: "Reactive blob",
        message:
          "This monster is reactive: it checks your prayer a few ticks before attacking and attacks with the opposite style. Show a prayer 3 ticks before it attacks to make it match another monster's timing.",
      };
    default:
      return null;
  }
}
