import { useState } from "react";
import { createProgressionState } from "./core/state";
import { ALL_LEVELS } from "./core/levels";
import type { Level } from "./core/types";
import { useTickEngine } from "./useTickEngine";
import { getActiveMonsters } from "./core/getActiveMonsters";
import { INITIAL_PRAYER_POINTS } from "./core/constants";
import { MonsterView } from "./components/MonsterView";
import "./App.css";

type Screen = "home" | "about" | "progression-list" | "progression-play";

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

function Home({
  onProgression,
  onAbout,
}: {
  onProgression: () => void;
  onAbout?: () => void;
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
  const engine = useTickEngine(createProgressionState(level, false));
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
    engine.resetTickIndex();
    engine.setState(createProgressionState(level, true));
    start();
  };

  return (
    <div className="app">
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
        />
      )}
      {screen === "about" && (
        <AboutScreen onBack={() => setScreen("home")} />
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
