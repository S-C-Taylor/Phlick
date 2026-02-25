import { useState, useEffect, useRef, useCallback } from "react";
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
  loadHighestLevelCompleted,
  saveHighestLevelCompleted,
  getTutorialForLevel,
  type AppSettings,
} from "./core/settings";
import { logEvent } from "./core/analytics";
import { MonsterView } from "./components/MonsterView";
import "./App.css";

type Screen = "home" | "about" | "settings" | "privacy" | "feedback" | "progression-list" | "progression-play";

function AboutScreen({ onBack, onPrivacy, onFeedback }: { onBack: () => void; onPrivacy?: () => void; onFeedback?: () => void }) {
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

      {onFeedback && (
        <button type="button" className="btn btn-outline" style={{ width: "100%", marginBottom: "0.5rem" }} onClick={onFeedback}>
          Feedback
        </button>
      )}
      {onPrivacy && (
        <a
          href="/privacy"
          className="btn btn-outline"
          style={{ width: "100%", marginBottom: "0.5rem", display: "block", textAlign: "center", textDecoration: "none", boxSizing: "border-box" }}
          onClick={(e) => {
            e.preventDefault();
            onPrivacy();
          }}
        >
          Privacy Policy
        </a>
      )}
      <button type="button" className="btn btn-outline" style={{ width: "100%" }} onClick={onBack}>
        Back
      </button>
    </div>
  );
}

function PrivacyScreen({ onBack }: { onBack: () => void }) {
  return (
    <div className="app">
      <h1 style={{ fontSize: "1.75rem", fontWeight: 600, color: "var(--primary)", margin: "0 0 0.25rem" }}>
        Privacy Policy
      </h1>
      <p style={{ color: "var(--on-surface-variant)", margin: "0 0 1rem", fontSize: "0.875rem" }}>
        Last updated: February 2025
      </p>

      <div className="card" style={{ marginBottom: "1rem" }}>
        <h2 className="screen-title" style={{ margin: "0 0 0.5rem", fontSize: "1rem" }}>1. Introduction</h2>
        <p className="card-muted" style={{ margin: 0, fontSize: "0.9rem" }}>
          Phlick (“we”, “our”, or “the app”) is a prayer flick trainer (Android app and web app) developed by SimilTea. This Privacy Policy describes how we handle information when you use the Phlick Android application and the Phlick website (together, “the service”). We do not collect personal information that identifies you by name or contact details. The service is designed to work offline; any optional data collection is non-blocking and does not affect gameplay.
        </p>
      </div>

      <div className="card" style={{ marginBottom: "1rem" }}>
        <h2 className="screen-title" style={{ margin: "0 0 0.5rem", fontSize: "1rem" }}>2. Data we may collect</h2>
        <p className="card-muted" style={{ margin: "0 0 0.5rem", fontSize: "0.9rem" }}>
          <strong>Android app</strong>
        </p>
        <ul className="card-muted" style={{ margin: 0, paddingLeft: "1.25rem", fontSize: "0.9rem" }}>
          <li><strong>Crash and diagnostics (optional):</strong> If you have the version of the app that includes Firebase, we may receive crash reports and non-fatal error logs (e.g. stack traces, device model, OS version) via Google Firebase Crashlytics. This helps us fix bugs. No account or personal identity is required.</li>
          <li><strong>Usage events (optional):</strong> If Firebase is enabled, we may receive anonymized events such as “level started”, “level completed”, “level failed”, and “tutorial dismissed” (with level number and app version) via Google Firebase Analytics. This helps us understand how the app is used. Events are sent only when the device is online and are not linked to your identity.</li>
        </ul>
        <p className="card-muted" style={{ margin: "0.75rem 0 0.5rem", fontSize: "0.9rem" }}>
          <strong>Web app</strong>
        </p>
        <ul className="card-muted" style={{ margin: 0, paddingLeft: "1.25rem", fontSize: "0.9rem" }}>
          <li><strong>Crash reporting (optional):</strong> If the site operator configures Sentry, error reports (e.g. stack traces, browser info) may be sent to Sentry. This is optional and controlled by the deployment.</li>
          <li><strong>Analytics (optional):</strong> If an analytics endpoint is configured, anonymized events (e.g. level started/completed/failed, tutorial dismissed) may be sent when you are online. Events are stored locally until sent and are not tied to your identity.</li>
        </ul>
        <p className="card-muted" style={{ margin: "0.75rem 0 0", fontSize: "0.9rem" }}>
          <strong>Stored on your device only:</strong> Settings (e.g. latency, tick bar preference), tutorial “seen” state, and (on web) queued analytics events may be stored locally on your device. We do not upload this to our servers except as part of optional crash/analytics described above.
        </p>
      </div>

      <div className="card" style={{ marginBottom: "1rem" }}>
        <h2 className="screen-title" style={{ margin: "0 0 0.5rem", fontSize: "1rem" }}>3. How we use data</h2>
        <p className="card-muted" style={{ margin: 0, fontSize: "0.9rem" }}>
          We use crash and diagnostics data to improve stability and fix errors. We use usage/analytics data only in aggregate to understand feature usage and improve the app. We do not sell your data or use it for advertising. We do not create user profiles that identify you.
        </p>
      </div>

      <div className="card" style={{ marginBottom: "1rem" }}>
        <h2 className="screen-title" style={{ margin: "0 0 0.5rem", fontSize: "1rem" }}>4. Third parties</h2>
        <p className="card-muted" style={{ margin: 0, fontSize: "0.9rem" }}>
          The Android app may use Google Firebase (Crashlytics and Analytics) when that integration is included in the build. Their privacy practices apply to data processed by Google: <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" style={{ color: "var(--primary)" }}>Google Privacy Policy</a>. The web app may use Sentry and/or a custom analytics endpoint if configured by the site operator. We do not control those third-party services; their terms and privacy policies apply.
        </p>
      </div>

      <div className="card" style={{ marginBottom: "1rem" }}>
        <h2 className="screen-title" style={{ margin: "0 0 0.5rem", fontSize: "1rem" }}>5. Data retention and security</h2>
        <p className="card-muted" style={{ margin: 0, fontSize: "0.9rem" }}>
          Crash and analytics data are retained according to the policies of the providers (e.g. Firebase, Sentry). Local data on your device (settings, progress) remains on your device until you clear app data or uninstall. We do not transmit or store passwords or other sensitive personal data; the app does not require an account.
        </p>
      </div>

      <div className="card" style={{ marginBottom: "1rem" }}>
        <h2 className="screen-title" style={{ margin: "0 0 0.5rem", fontSize: "1rem" }}>6. Children and region</h2>
        <p className="card-muted" style={{ margin: 0, fontSize: "0.9rem" }}>
          The service is not directed at children under 13. We do not knowingly collect personal information from children. The app may be used globally; by using it, you consent to the processing described in this policy.
        </p>
      </div>

      <div className="card" style={{ marginBottom: "1rem" }}>
        <h2 className="screen-title" style={{ margin: "0 0 0.5rem", fontSize: "1rem" }}>7. Changes and contact</h2>
        <p className="card-muted" style={{ margin: 0, fontSize: "0.9rem" }}>
          We may update this Privacy Policy from time to time. The “Last updated” date at the top will be revised when we do. Continued use of the app after changes constitutes acceptance. For questions about this policy or the app, you can contact the developer (SimilTea) via the app store listing or the Phlick website.
        </p>
      </div>

      <button type="button" className="btn btn-outline" style={{ width: "100%" }} onClick={onBack}>
        Back
      </button>
    </div>
  );
}

const FEEDBACK_FORM_ID = import.meta.env.VITE_FEEDBACK_FORM_ID;

function FeedbackScreen({ onBack }: { onBack: () => void }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!FEEDBACK_FORM_ID || !message.trim()) return;
    setStatus("sending");
    try {
      const res = await fetch(`https://formspree.io/f/${FEEDBACK_FORM_ID}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim() || undefined,
          _replyto: email.trim() || undefined,
          message: message.trim(),
        }),
      });
      if (res.ok) {
        setStatus("success");
        setName("");
        setEmail("");
        setMessage("");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  };

  if (!FEEDBACK_FORM_ID) {
    return (
      <div className="app">
        <h1 style={{ fontSize: "1.75rem", fontWeight: 600, color: "var(--primary)", margin: "0 0 1rem" }}>
          Feedback
        </h1>
        <div className="card" style={{ marginBottom: "1rem" }}>
          <p className="card-muted" style={{ margin: 0 }}>
            Feedback form is not configured. Please contact the site owner.
          </p>
        </div>
        <button type="button" className="btn btn-outline" style={{ width: "100%" }} onClick={onBack}>
          Back
        </button>
      </div>
    );
  }

  return (
    <div className="app">
      <h1 style={{ fontSize: "1.75rem", fontWeight: 600, color: "var(--primary)", margin: "0 0 0.25rem" }}>
        Feedback
      </h1>
      <p style={{ color: "var(--on-surface-variant)", margin: "0 0 1rem", fontSize: "0.875rem" }}>
        Send a message to the developer. Your email is never shown on the site.
      </p>

      {status === "success" ? (
        <div className="card" style={{ marginBottom: "1rem" }}>
          <p style={{ margin: 0, color: "var(--primary)", fontWeight: 600 }}>Thanks for your feedback.</p>
          <p className="card-muted" style={{ margin: "0.5rem 0 0" }}>We&apos;ll get back to you if you left an email.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="card" style={{ marginBottom: "1rem" }}>
          <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.9rem" }}>
            Name <span className="card-muted">(optional)</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{ width: "100%", padding: "0.5rem", marginBottom: "0.75rem", borderRadius: 4, border: "1px solid var(--surface-variant)", background: "var(--background)", color: "var(--on-background)", boxSizing: "border-box" }}
            placeholder="Your name"
          />
          <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.9rem" }}>
            Email <span className="card-muted">(optional, for reply)</span>
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ width: "100%", padding: "0.5rem", marginBottom: "0.75rem", borderRadius: 4, border: "1px solid var(--surface-variant)", background: "var(--background)", color: "var(--on-background)", boxSizing: "border-box" }}
            placeholder="your@email.com"
          />
          <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.9rem" }}>
            Message <span style={{ color: "var(--error)" }}>*</span>
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
            rows={4}
            style={{ width: "100%", padding: "0.5rem", marginBottom: "0.75rem", borderRadius: 4, border: "1px solid var(--surface-variant)", background: "var(--background)", color: "var(--on-background)", resize: "vertical", boxSizing: "border-box" }}
            placeholder="Your feedback or question..."
          />
          {status === "error" && (
            <p style={{ margin: "0 0 0.75rem", color: "var(--error)", fontSize: "0.85rem" }}>
              Something went wrong. Please try again later.
            </p>
          )}
          <div style={{ display: "flex", gap: 12 }}>
            <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={onBack}>
              Back
            </button>
            <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={status === "sending" || !message.trim()}>
              {status === "sending" ? "Sending…" : "Send"}
            </button>
          </div>
        </form>
      )}

      {status !== "success" && (
        <button type="button" className="btn btn-outline" style={{ width: "100%" }} onClick={onBack}>
          Back
        </button>
      )}
    </div>
  );
}

function SettingsScreen({ onBack }: { onBack: () => void }) {
  const [settings, setSettingsState] = useState<AppSettings>(() => loadSettings());

  useEffect(() => {
    logEvent("settings_viewed", {
      show_tick_bar: settings.showTickBar,
      random_latency_enabled: settings.randomLatencyEnabled,
    });
  }, []);

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

function ProgressionListScreen({
  highestLevelCompleted,
  onSelect,
  onBack,
}: {
  highestLevelCompleted: number;
  onSelect: (l: Level) => void;
  onBack: () => void;
}) {
  return (
    <div className="app">
      <div className="row" style={{ marginBottom: "1rem", flexWrap: "wrap", gap: "0.5rem", alignItems: "center" }}>
        <h1 className="screen-title" style={{ margin: 0, flex: 1 }}>Select Level</h1>
        <button type="button" className="btn btn-outline" onClick={onBack}>
          Back to Menu
        </button>
      </div>
      <ul className="level-list">
        {ALL_LEVELS.map((level) => {
          const isUnlocked = level.number <= highestLevelCompleted + 1;
          return (
            <li key={level.number} className={isUnlocked ? undefined : "level-item--locked"}>
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => isUnlocked && onSelect(level)}
                disabled={!isUnlocked}
                style={{ textAlign: "left", alignItems: "flex-start" }}
              >
                <span style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
                  <strong>Level {level.number}: {level.name}</strong>
                  {!isUnlocked && <span className="level-locked-label">Locked</span>}
                </span>
                <span className="level-desc">{level.description}</span>
                <span className="level-meta">
                  Survive {level.ticksToSurvive} ticks • {level.monsters.length} monster(s)
                </span>
              </button>
            </li>
          );
        })}
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
        {nextLevel && (
          <p style={{ margin: "0 0 0.5rem", color: "var(--on-primary)", fontSize: "1rem" }}>
            Level {nextLevel.number} unlocked!
          </p>
        )}
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
  const [feedbackToShow, setFeedbackToShow] = useState<"Correct" | "Wrong" | null>(null);
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

  const levelStartTimeMsRef = useRef(0);
  const completedLogged = useRef(false);
  const failedLogged = useRef(false);
  useEffect(() => {
    if (levelComplete && !completedLogged.current) {
      completedLogged.current = true;
      const durationSeconds = Math.max(0, Math.round((Date.now() - levelStartTimeMsRef.current) / 1000));
      logEvent("level_completed", {
        level_number: levelComplete.number,
        duration_seconds: durationSeconds,
        show_tick_bar: settings.showTickBar,
        random_latency_enabled: settings.randomLatencyEnabled,
      });
    }
  }, [levelComplete, settings.showTickBar, settings.randomLatencyEnabled]);
  useEffect(() => {
    if (levelFailed && !failedLogged.current) {
      failedLogged.current = true;
      const durationSeconds = Math.max(0, Math.round((Date.now() - levelStartTimeMsRef.current) / 1000));
      logEvent("level_failed", {
        level_number: level.number,
        duration_seconds: durationSeconds,
        show_tick_bar: settings.showTickBar,
        random_latency_enabled: settings.randomLatencyEnabled,
      });
    }
  }, [levelFailed, level.number, settings.showTickBar, settings.randomLatencyEnabled]);

  useEffect(() => {
    if (state.lastResult === "Correct" || state.lastResult === "Wrong") {
      setFeedbackToShow(state.lastResult);
      const t = setTimeout(() => setFeedbackToShow(null), 1200);
      return () => clearTimeout(t);
    }
  }, [state.lastResult]);

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
    levelStartTimeMsRef.current = Date.now();
    logEvent("level_started", { level_number: level.number });
    engine.resetTickIndex();
    engine.setState(createProgressionState(level, true));
    start();
  };

  return (
    <div className="app app--play" style={{ position: "relative" }}>
      <div className="app--play-scroll">
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
          {feedbackToShow === "Correct" && (
            <div className="feedback-card correct">✓ Correct!</div>
          )}
          {feedbackToShow === "Wrong" && (
            <div className="feedback-card wrong">✗ Wrong! -1 Life</div>
          )}
        </div>
      </div>

      {!ls.isLevelComplete && !ls.isLevelFailed && (
        <div className="app--play-footer">
          <div className="row-buttons">
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => {
                logEvent("level_quit", {
                  level_number: level.number,
                  lives_left: ls.lives,
                  ticks_remaining: ticksRemaining,
                });
                onBack();
              }}
            >
              Quit
            </button>
            {!state.isRunning ? (
              <button type="button" className="btn btn-primary" onClick={startLevel}>
                Start
              </button>
            ) : null}
          </div>
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

type HistoryState = { screen: Screen; levelNumber?: number } | null;

function pathForScreen(screen: Screen, levelNumber?: number): string {
  if (screen === "privacy") return "/privacy";
  if (screen === "feedback") return "/feedback";
  if (screen === "about") return "/about";
  if (screen === "settings") return "/settings";
  if (screen === "progression-play" && levelNumber != null) return "/play/" + levelNumber;
  if (screen === "progression-list") return "/levels";
  return "/";
}

function parsePath(pathname: string): { screen: Screen; levelNumber?: number } {
  const p = pathname.replace(/\/$/, "") || "/";
  if (p === "/privacy") return { screen: "privacy" };
  if (p === "/feedback") return { screen: "feedback" };
  if (p === "/about") return { screen: "about" };
  if (p === "/settings") return { screen: "settings" };
  const playMatch = p.match(/^\/play\/(\d+)$/);
  if (playMatch) return { screen: "progression-play", levelNumber: parseInt(playMatch[1], 10) };
  if (p === "/levels") return { screen: "progression-list" };
  return { screen: "home" };
}

function pushState(screen: Screen, levelNumber?: number) {
  const path = pathForScreen(screen, levelNumber);
  window.history.pushState({ screen, levelNumber }, "", path);
}

export default function App() {
  const [screen, setScreen] = useState<Screen>("home");
  const [selectedLevel, setSelectedLevel] = useState<Level | null>(null);
  const [progressionKey, setProgressionKey] = useState(0);
  const [showBackConfirm, setShowBackConfirm] = useState(false);
  const [highestLevelCompleted, setHighestLevelCompleted] = useState(loadHighestLevelCompleted);
  const pendingBackRef = useRef<HistoryState>(null);

  const navigateTo = useCallback((s: Screen) => {
    setScreen(s);
    if (s === "home" || s === "progression-list") setSelectedLevel(null);
    pushState(s);
  }, []);

  useEffect(() => {
    const pathname = window.location.pathname;
    const state = window.history.state as HistoryState;
    if (state?.screen != null) {
      const path = pathForScreen(state.screen, state.levelNumber);
      if (pathname !== path) window.history.replaceState(state, "", path);
      return;
    }
    const { screen: initialScreen, levelNumber } = parsePath(pathname);
    setScreen(initialScreen);
    if (initialScreen === "progression-play" && levelNumber != null) {
      const level = ALL_LEVELS.find((l) => l.number === levelNumber);
      if (level) setSelectedLevel(level);
    }
    window.history.replaceState(
      { screen: initialScreen, levelNumber: initialScreen === "progression-play" ? levelNumber : undefined },
      "",
      pathname
    );
  }, []);

  useEffect(() => {
    const onPopState = (e: PopStateEvent) => {
      const state = e.state as HistoryState;
      const target = state?.screen ?? "home";
      if (screen === "progression-play" && (target === "progression-list" || target === "home")) {
        setShowBackConfirm(true);
        pendingBackRef.current = state;
      } else {
        setScreen(target);
        if (target === "progression-list" || target === "home") setSelectedLevel(null);
      }
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, [screen]);

  const confirmBack = useCallback(() => {
    const state = pendingBackRef.current;
    setShowBackConfirm(false);
    pendingBackRef.current = null;
    if (state?.screen) {
      setScreen(state.screen);
      if (state.screen === "progression-list" || state.screen === "home") setSelectedLevel(null);
    }
  }, []);

  const cancelBack = useCallback(() => {
    setShowBackConfirm(false);
    pendingBackRef.current = null;
    if (screen === "progression-play" && selectedLevel)
      pushState("progression-play", selectedLevel.number);
  }, [screen, selectedLevel]);

  return (
    <>
      {screen === "home" && (
        <Home
          onProgression={() => navigateTo("progression-list")}
          onAbout={() => navigateTo("about")}
          onSettings={() => navigateTo("settings")}
        />
      )}
      {screen === "about" && (
        <AboutScreen onBack={() => navigateTo("home")} onPrivacy={() => navigateTo("privacy")} onFeedback={() => navigateTo("feedback")} />
      )}
      {screen === "privacy" && (
        <PrivacyScreen onBack={() => navigateTo("about")} />
      )}
      {screen === "feedback" && (
        <FeedbackScreen onBack={() => navigateTo("about")} />
      )}
      {screen === "settings" && (
        <SettingsScreen onBack={() => navigateTo("home")} />
      )}
      {screen === "progression-list" && (
        <ProgressionListScreen
          highestLevelCompleted={highestLevelCompleted}
          onSelect={(l) => {
            setSelectedLevel(l);
            setProgressionKey((k) => k + 1);
            setScreen("progression-play");
            pushState("progression-play", l.number);
          }}
          onBack={() => navigateTo("home")}
        />
      )}
      {screen === "progression-play" && selectedLevel && (
        <>
          <ProgressionPlayScreen
            key={`${selectedLevel.number}-${progressionKey}`}
            level={selectedLevel}
            onLevelCompleteNext={(next) => {
              const completedLevel = selectedLevel;
              if (completedLevel) {
                saveHighestLevelCompleted(completedLevel.number);
                setHighestLevelCompleted((prev) => Math.max(prev, completedLevel.number));
              }
              if (next) {
                setSelectedLevel(next);
                setProgressionKey((k) => k + 1);
                setScreen("progression-play");
                pushState("progression-play", next.number);
              } else {
                setSelectedLevel(null);
                setScreen("progression-list");
                pushState("progression-list");
              }
            }}
            onLevelFailedRetry={() => {
              setProgressionKey((k) => k + 1);
              setScreen("progression-play");
            }}
            onBack={() => {
              setSelectedLevel(null);
              setScreen("progression-list");
              pushState("progression-list");
            }}
          />
          {showBackConfirm && (
            <div className="overlay" style={{ alignItems: "center", justifyContent: "center" }}>
              <div className="card" style={{ maxWidth: 320 }}>
                <h2 style={{ margin: "0 0 0.5rem" }}>Return to level select?</h2>
                <p className="card-muted" style={{ margin: "0 0 1rem" }}>
                  Your progress in this level will be lost.
                </p>
                <div className="dialog-buttons">
                  <button type="button" className="btn btn-outline" onClick={cancelBack}>
                    Cancel
                  </button>
                  <button type="button" className="btn btn-primary" onClick={confirmBack}>
                    Level select
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </>
  );
}
