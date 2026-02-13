import { useState, useEffect, useRef } from "react";
import { createProgressionState } from "./core/state";
import { ALL_LEVELS } from "./core/levels";
import type { Level } from "./core/types";
import { useTickEngine } from "./useTickEngine";
import { getActiveMonsters } from "./core/getActiveMonsters";
import { INITIAL_PRAYER_POINTS } from "./core/constants";
import {
  loadSettings,
  saveSettings,
  MAX_LATENCY_MS,
  TUTORIAL_LEVELS,
  loadTutorialSeenLevels,
  saveTutorialSeen,
  getTutorialForLevel,
  type AppSettings,
} from "./core/settings";
import { logEvent } from "./core/analytics";
import { MonsterView } from "./components/MonsterView";
import "./App.css";

type Screen = "home" | "about" | "settings" | "progression-list" | "progression-play";

function AboutScreen({ onBack }: { onBack: () => void }) {
  return (
    <div className="app">
      <h1 style={{ fontSize: "1.75rem", fontWeight: 600, color: "var(--primary)", margin: "0 0 0.25rem" }}>
        Phlick
      </h1>
      <p style={{ color: "var(--on-surface-variant)", margin: "0 0 0.25rem", fontSize: "1rem" }}>
        Prayer Flick Trainer
      </p>
      <p style={{ color: "var(--on-surface-variant)", margin: "0 0 1.5rem", fontSize: "0.875rem" }}>
        Version {__APP_VERSION__}
      </p>

      <div className="card" style={{ marginBottom: "1rem" }}>
        <h2 className="screen-title" style={{ margin: "0 0 0.5rem" }}>About</h2>
        <p className="card-muted" style={{ margin: 0, textAlign: "center" }}>
          Phlick is an Old School RuneScape–inspired prayer flick trainer. Practice timing protection prayers against magic, ranged, and melee attacks, including 1-tick flicking and reactive type monsters.
        </p>
      </div>

      <div className="card" style={{ marginBottom: "1rem" }}>
        <h2 className="screen-title" style={{ margin: "0 0 0.5rem", fontSize: "1rem" }}>Developer</h2>
        <div className="row">
          <span className="card-muted">Name</span>
          <span>SimilTea</span>
        </div>
      </div>

      <button type="button" className="btn btn-outline" style={{ width: "100%" }} onClick={onBack}>
        Back
      </button>
    </div>
  );
}

function SettingsScreen({ onBack }: { onBack: () => void }) {
  const [settings, setSettingsState] = useState<AppSettings>(() => loadSettings());

  const update = (patch: Partial<AppSettings>) => {
    const next = { ...settings, ...patch };
    setSettingsState(next);
    saveSettings(next);
  };

  return (
    <div className="app">
      <h1 style={{ fontSize: "1.75rem", fontWeight: 600, color: "var(--primary)", margin: "0 0 1rem" }}>
        Settings
      </h1>

      <div className="card" style={{ marginBottom: "1rem" }}>
        <div className="row" style={{ justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.5rem" }}>
          <div>
            <h2 className="screen-title" style={{ margin: "0 0 0.25rem", fontSize: "1rem" }}>Random latency</h2>
            <p className="card-muted" style={{ margin: 0, fontSize: "0.85rem" }}>
              Add random delay (0–{MAX_LATENCY_MS}ms) each tick to simulate network latency.
            </p>
          </div>
          <label className="row" style={{ alignItems: "center", gap: "0.5rem" }}>
            <input
              type="checkbox"
              checked={settings.randomLatencyEnabled}
              onChange={(e) => update({ randomLatencyEnabled: e.target.checked })}
            />
            <span>On</span>
          </label>
        </div>
        {settings.randomLatencyEnabled && (
          <div style={{ marginTop: "0.75rem" }}>
            <p className="card-muted" style={{ margin: "0 0 0.25rem", fontSize: "0.85rem" }}>
              Max latency: {settings.randomLatencyMsMax} ms
            </p>
            <input
              type="range"
              min={0}
              max={MAX_LATENCY_MS}
              value={settings.randomLatencyMsMax}
              onChange={(e) => update({ randomLatencyMsMax: Math.min(MAX_LATENCY_MS, parseInt(e.target.value, 10) || 0) })}
              style={{ width: "100%" }}
            />
          </div>
        )}
      </div>

      <div className="card" style={{ marginBottom: "1rem" }}>
        <div className="row" style={{ justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.5rem" }}>
          <div>
            <h2 className="screen-title" style={{ margin: "0 0 0.25rem", fontSize: "1rem" }}>1-tick flick helper</h2>
            <p className="card-muted" style={{ margin: 0, fontSize: "0.85rem" }}>
              Show a visual tick bar during progression to help time flicks.
            </p>
          </div>
          <label className="row" style={{ alignItems: "center", gap: "0.5rem" }}>
            <input
              type="checkbox"
              checked={settings.showTickBar}
              onChange={(e) => update({ showTickBar: e.target.checked })}
            />
            <span>On</span>
          </label>
        </div>
      </div>

      <button type="button" className="btn btn-outline" style={{ width: "100%" }} onClick={onBack}>
        Back
      </button>
    </div>
  );
}

function Home({
  onProgression,
  onAbout,
  onSettings,
}: {
  onProgression: () => void;
  onAbout?: () => void;
  onSettings?: () => void;
}) {
  const [showSandboxComingSoon, setShowSandboxComingSoon] = useState(false);

  return (
    <div className="app">
      <h1 style={{ fontSize: "2rem", fontWeight: 600, color: "var(--primary)", margin: "0 0 0.25rem" }}>
        Phlick
      </h1>
      <p style={{ color: "var(--on-surface-variant)", margin: "0 0 1.5rem", fontSize: "1.1rem" }}>
        Prayer Flick Trainer
      </p>

      {/* Progression first (match Android) */}
      <div className="card" style={{ marginBottom: "1rem" }}>
        <h2 className="screen-title" style={{ margin: "0 0 0.5rem" }}>Progression Mode</h2>
        <p className="card-muted" style={{ margin: "0 0 1rem", textAlign: "center" }}>
          Level-by-level progression. Survive increasingly difficult prayer flick challenges. Lose a life on each mistake.
        </p>
        <button type="button" className="btn btn-primary" style={{ width: "100%" }} onClick={onProgression}>
          Start Training
        </button>
      </div>

      <div className="card" style={{ marginBottom: "1rem" }}>
        <h2 className="screen-title" style={{ margin: "0 0 0.5rem" }}>Sandbox Mode</h2>
        <p className="card-muted" style={{ margin: "0 0 1rem", textAlign: "center" }}>
          Free training mode. Set up your own prayer flick scenarios by controlling when monsters start attacking.
        </p>
        <button type="button" className="btn btn-secondary" style={{ width: "100%" }} onClick={() => setShowSandboxComingSoon(true)}>
          Start Training
        </button>
      </div>

      {onSettings && (
        <button type="button" className="btn btn-outline" style={{ width: "100%", marginBottom: "0.5rem" }} onClick={onSettings}>
          Settings
        </button>
      )}
      {onAbout && (
        <button type="button" className="btn btn-outline" style={{ width: "100%" }} onClick={onAbout}>
          About
        </button>
      )}

      {showSandboxComingSoon && (
        <div className="overlay" style={{ position: "fixed" }}>
          <div className="card" style={{ maxWidth: 320 }}>
            <h2 style={{ margin: "0 0 0.5rem" }}>In development</h2>
            <p className="card-muted" style={{ margin: "0 0 1rem" }}>Coming soon.</p>
            <button type="button" className="btn btn-primary" style={{ width: "100%" }} onClick={() => setShowSandboxComingSoon(false)}>
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function ProgressionListScreen({ onSelect, onBack }: { onSelect: (l: Level) => void; onBack: () => void }) {
  return (
    <div className="app">
      <div className="row" style={{ marginBottom: "1rem", flexWrap: "wrap", gap: "0.5rem", alignItems: "center" }}>
        <h1 className="screen-title" style={{ margin: 0, flex: 1 }}>Select Level</h1>
        <button type="button" className="btn btn-outline" onClick={onBack}>
          Back to Menu
        </button>
      </div>
      <ul className="level-list">
        {ALL_LEVELS.map((level) => (
          <li key={level.number}>
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => onSelect(level)}
              style={{ textAlign: "left", alignItems: "flex-start" }}
            >
              <strong>Level {level.number}: {level.name}</strong>
              <span className="level-desc">{level.description}</span>
              <span className="level-meta">
                Survive {level.ticksToSurvive} ticks • {level.monsters.length} monster(s)
              </span>
            </button>
          </li>
        ))}
      </ul>
      <button type="button" className="btn btn-outline" style={{ width: "100%", marginTop: "1rem" }} onClick={onBack}>
        Back to Menu
      </button>
    </div>
  );
}

function LevelCompleteDialog({
  level,
  prayerPointsUsed,
  initialPrayerPoints,
  attacksBlocked,
  attacksMissed,
  onNextLevel,
  onBackToMenu,
}: {
  level: Level;
  prayerPointsUsed: number;
  initialPrayerPoints: number;
  attacksBlocked: number;
  attacksMissed: number;
  onNextLevel: () => void;
  onBackToMenu: () => void;
}) {
  const nextLevel = ALL_LEVELS.find((l) => l.number === level.number + 1);
  return (
    <div className="overlay level-complete-dialog">
      <div className="card">
        <h2>Level Complete!</h2>
        <p className="muted">You survived {level.name}</p>
        <div className="stats-panel" style={{ background: "rgba(255,255,255,0.1)", borderRadius: 8, padding: 16 }}>
          <div className="stat-row">
            <span className="muted">Attacks blocked</span>
            <span>{attacksBlocked}</span>
          </div>
          <div className="stat-row">
            <span className="muted">Attacks missed</span>
            <span>{attacksMissed}</span>
          </div>
          <div className="stat-row">
            <span className="muted">Prayer points used</span>
            <span>{prayerPointsUsed} / {initialPrayerPoints}</span>
          </div>
          {prayerPointsUsed === 0 && (
            <p style={{ margin: "8px 0 0", color: "var(--on-primary)", fontSize: "0.9rem" }}>Perfect flicking! ✨</p>
          )}
        </div>
        <div className="dialog-buttons">
          <button type="button" className="btn btn-outline" onClick={onBackToMenu} style={{ borderColor: "var(--on-primary)", color: "var(--on-primary)" }}>
            Menu
          </button>
          <button type="button" className="btn btn-primary" style={{ background: "var(--on-primary)", color: "var(--primary)" }} onClick={onNextLevel}>
            {nextLevel ? "Next Level" : "Menu"}
          </button>
        </div>
      </div>
    </div>
  );
}

function LevelFailedDialog({
  onRetry,
  onBackToMenu,
}: {
  onRetry: () => void;
  onBackToMenu: () => void;
}) {
  return (
    <div className="overlay level-failed-dialog">
      <div className="card">
        <h2>Level Failed</h2>
        <p className="muted">You ran out of lives</p>
        <div className="dialog-buttons">
          <button type="button" className="btn btn-outline" onClick={onBackToMenu} style={{ borderColor: "var(--on-error)", color: "var(--on-error)" }}>
            Menu
          </button>
          <button type="button" className="btn btn-danger" onClick={onRetry}>
            Retry
          </button>
        </div>
      </div>
    </div>
  );
}

/** Guided tutorial overlay (first playthrough only). Level visible behind for context. */
function TutorialOverlay({
  title,
  message,
  onDismiss,
}: {
  title: string;
  message: string;
  onDismiss: () => void;
}) {
  return (
    <div className="overlay tutorial-overlay">
      <div className="card" style={{ maxWidth: 360 }}>
        <h2 style={{ margin: "0 0 0.5rem" }}>{title}</h2>
        <p className="card-muted" style={{ margin: "0 0 1rem", textAlign: "center" }}>
          {message}
        </p>
        <button type="button" className="btn btn-primary" style={{ width: "100%" }} onClick={onDismiss}>
          Got it
        </button>
      </div>
    </div>
  );
}

/** One 600ms tick bar with flying sweep and x marks for prayer toggles (RuneLite 1-Tick Flick style). */
function TickBar({
  lastTickTimeMs,
  marks,
}: {
  lastTickTimeMs: number;
  marks: number[];
}) {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    if (lastTickTimeMs <= 0) {
      setProgress(0);
      return;
    }
    const id = setInterval(() => {
      const p = Math.max(0, Math.min(1, (Date.now() - lastTickTimeMs) / 600));
      setProgress(p);
    }, 50);
    return () => clearInterval(id);
  }, [lastTickTimeMs]);

  return (
    <div className="tick-bar" style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
      <span className="card-muted" style={{ fontSize: "0.8rem" }}>Tick</span>
      <div
        style={{
          position: "relative",
          flex: 1,
          height: 24,
          background: "var(--surface-variant)",
          borderRadius: 4,
          overflow: "hidden",
        }}
      >
        {/* Flying sweep */}
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 2,
            bottom: 2,
            width: `${progress * 100}%`,
            background: "var(--primary)",
            opacity: 0.5,
            borderRadius: 2,
          }}
        />
        {/* X marks at prayer toggle positions */}
        {(marks ?? []).map((pos, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              left: `${Math.max(0, Math.min(100, pos * 100))}%`,
              top: "50%",
              transform: "translate(-50%, -50%)",
              width: 8,
              height: 8,
              color: "var(--on-surface)",
              fontSize: 10,
              fontWeight: "bold",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            ×
          </div>
        ))}
      </div>
    </div>
  );
}

function ProgressionPlayScreen({
  level,
  onLevelCompleteNext,
  onLevelFailedRetry,
  onBack,
}: {
  level: Level;
  onLevelCompleteNext: (nextLevel: Level | null) => void;
  onLevelFailedRetry: () => void;
  onBack: () => void;
}) {
  const settings = useState(() => loadSettings())[0];
  const [showTutorial, setShowTutorial] = useState(() =>
    TUTORIAL_LEVELS.has(level.number) && !loadTutorialSeenLevels().has(level.number)
  );
  const engine = useTickEngine(createProgressionState(level, false), {
    randomLatencyEnabled: settings.randomLatencyEnabled,
    randomLatencyMsMax: settings.randomLatencyMsMax,
  });
  const { state, setPrayer, start, levelComplete, levelFailed } = engine;

  const activeMonsters = getActiveMonsters(
    state.gameMode,
    state.currentTick,
    state.isRunning,
    state.levelState.currentLevel,
    state.reactiveMonsterAttacks,
    null,
    null,
    false,
    false
  );

  const prayerPoints = level.initialPrayerPoints ?? INITIAL_PRAYER_POINTS;
  const ls = state.levelState;
  const ticksRemaining = Math.max(0, level.ticksToSurvive - (Math.max(0, state.currentTick - 3) - ls.levelStartTick));

  const completedLogged = useRef(false);
  const failedLogged = useRef(false);
  useEffect(() => {
    if (levelComplete && !completedLogged.current) {
      completedLogged.current = true;
      logEvent("level_completed", { level_number: levelComplete.number });
    }
  }, [levelComplete]);
  useEffect(() => {
    if (levelFailed && !failedLogged.current) {
      failedLogged.current = true;
      logEvent("level_failed", { level_number: level.number });
    }
  }, [levelFailed, level.number]);

  if (levelComplete) {
    return (
      <LevelCompleteDialog
        level={level}
        prayerPointsUsed={Math.max(0, ls.initialPrayerPoints - state.prayerPoints)}
        initialPrayerPoints={ls.initialPrayerPoints}
        attacksBlocked={ls.attacksBlocked}
        attacksMissed={ls.attacksMissed}
        onNextLevel={() => {
          const next = ALL_LEVELS.find((l) => l.number === level.number + 1);
          if (next) onLevelCompleteNext(next);
          else onBack();
        }}
        onBackToMenu={onBack}
      />
    );
  }
  if (levelFailed) {
    return (
      <LevelFailedDialog
        onRetry={onLevelFailedRetry}
        onBackToMenu={onBack}
      />
    );
  }

  const startLevel = () => {
    logEvent("level_started", { level_number: level.number });
    engine.resetTickIndex();
    engine.setState(createProgressionState(level, true));
    start();
  };

  return (
    <div className="app" style={{ position: "relative" }}>
      <div className="card">
        <h2 style={{ margin: "0 0 4px", fontSize: "1.1rem" }}>Level {level.number}: {level.name}</h2>
        <p className="card-muted" style={{ margin: 0, fontSize: "0.85rem" }}>{level.description}</p>
      </div>

      {/* Progress bar – "Progress" + "X ticks remaining" (match Android) */}
      <div className="card">
        <div className="row">
          <span className="card-muted">Progress</span>
          <span style={{ color: "var(--primary)" }}>{ticksRemaining} ticks remaining</span>
        </div>
        <div className="progress-bar tall">
          <div
            className="progress-bar-fill"
            style={{ width: `${ls.health}%` }}
          />
        </div>
      </div>

      {/* Lives + Prayer in one row (match Android) */}
      <div className="row" style={{ gap: 12, marginBottom: "0.75rem" }}>
        <div className="card" style={{ flex: 1, marginBottom: 0 }}>
          <div className="row" style={{ marginBottom: 4 }}>
            <span className="card-muted">Lives:</span>
            <div className="lives-row">
              {[0, 1, 2].map((i) => (
                <div key={i} className={`life-dot ${i < ls.lives ? "filled" : ""}`} />
              ))}
            </div>
          </div>
        </div>
        <div className="card" style={{ flex: 1, marginBottom: 0 }}>
          <div className="row">
            <span className="card-muted">Prayer:</span>
            <span style={{ color: "var(--primary)" }}>{state.prayerPoints}</span>
          </div>
          <div className="progress-bar">
            <div
              className="progress-bar-fill"
              style={{ width: `${(state.prayerPoints / prayerPoints) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {settings.showTickBar && state.isRunning && (
        <TickBar
          lastTickTimeMs={state.lastTickTimeMs ?? 0}
          marks={state.prayerMarksForTick ?? []}
        />
      )}

      <div className="monsters-row">
        {activeMonsters.map((m, i) => (
          <div key={i} className="monster-column">
            <MonsterView
              attackStyle={m.attackStyle}
              isAttacking={m.isAttacking}
              tickInCycle={m.tickInCycle}
              cycleLength={m.cycleLength}
            />
            <span className="monster-label">
              {m.attackStyle === "Magic" ? "Mage" : m.attackStyle === "Missiles" ? "Range" : "Melee"}
            </span>
          </div>
        ))}
      </div>

      <div className="player-prayer-wrap">
        <div
          className={`player-prayer-circle ${state.selectedPrayer ? state.selectedPrayer.toLowerCase() : ""}`}
        />
        <span className="player-prayer-label">Active Prayer</span>
      </div>

      <div className="prayer-buttons" style={{ display: "flex", gap: "12px", width: "100%" }}>
        <button
          type="button"
          className={`prayer-btn magic ${state.selectedPrayer === "Magic" ? "active" : ""}`}
          onClick={() => setPrayer("Magic")}
          disabled={!state.isRunning || state.prayerPoints <= 0}
        >
          {state.selectedPrayer === "Magic" ? "Magic ✓" : "Protect Magic"}
        </button>
        <button
          type="button"
          className={`prayer-btn missiles ${state.selectedPrayer === "Missiles" ? "active" : ""}`}
          onClick={() => setPrayer("Missiles")}
          disabled={!state.isRunning || state.prayerPoints <= 0}
        >
          {state.selectedPrayer === "Missiles" ? "Missiles ✓" : "Protect Range"}
        </button>
      </div>

      <div className="feedback-box">
        {state.lastResult === "Correct" && (
          <div className="feedback-card correct">✓ Correct!</div>
        )}
        {state.lastResult === "Wrong" && (
          <div className="feedback-card wrong">✗ Wrong! -1 Life</div>
        )}
      </div>

      {!ls.isLevelComplete && !ls.isLevelFailed && (
        <div className="row-buttons">
          <button type="button" className="btn btn-outline" onClick={onBack}>
            Quit
          </button>
          {!state.isRunning ? (
            <button type="button" className="btn btn-primary" onClick={startLevel}>
              Start
            </button>
          ) : null}
        </div>
      )}

      {/* Tutorial overlay on top of level so player has context (semi-transparent) */}
      {showTutorial && (() => {
        const c = getTutorialForLevel(level.number);
        return c ? (
          <TutorialOverlay
            title={c.title}
            message={c.message}
            onDismiss={() => {
              logEvent("tutorial_dismissed", { level_number: level.number });
              saveTutorialSeen(level.number);
              setShowTutorial(false);
            }}
          />
        ) : null;
      })()}
    </div>
  );
}

export default function App() {
  const [screen, setScreen] = useState<Screen>("home");
  const [selectedLevel, setSelectedLevel] = useState<Level | null>(null);
  const [progressionKey, setProgressionKey] = useState(0);

  return (
    <>
      {screen === "home" && (
        <Home
          onProgression={() => setScreen("progression-list")}
          onAbout={() => setScreen("about")}
          onSettings={() => setScreen("settings")}
        />
      )}
      {screen === "about" && (
        <AboutScreen onBack={() => setScreen("home")} />
      )}
      {screen === "settings" && (
        <SettingsScreen onBack={() => setScreen("home")} />
      )}
      {screen === "progression-list" && (
        <ProgressionListScreen
          onSelect={(l) => {
            setSelectedLevel(l);
            setProgressionKey((k) => k + 1);
            setScreen("progression-play");
          }}
          onBack={() => setScreen("home")}
        />
      )}
      {screen === "progression-play" && selectedLevel && (
        <ProgressionPlayScreen
          key={`${selectedLevel.number}-${progressionKey}`}
          level={selectedLevel}
          onLevelCompleteNext={(next) => {
            if (next) {
              setSelectedLevel(next);
              setProgressionKey((k) => k + 1);
              setScreen("progression-play");
            } else {
              setSelectedLevel(null);
              setScreen("progression-list");
            }
          }}
          onLevelFailedRetry={() => {
            setProgressionKey((k) => k + 1);
            setScreen("progression-play");
          }}
          onBack={() => {
            setSelectedLevel(null);
            setScreen("progression-list");
          }}
        />
      )}
    </>
  );
}
