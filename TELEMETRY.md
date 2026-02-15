# Crash reporting and analytics

Crash reporting and analytics are **optional**, **non-blocking**, and **offline-safe**. They never block gameplay and do not require internet or special permissions.

## Android (Firebase)

- **Crashlytics**: Uncaught crashes and non-fatal exceptions (via `PhlickAnalytics.recordNonFatal`).
- **Analytics**: Events are logged and sent when the device is online. Firebase batches and uploads in the background. See **Events** below.

**Setup (optional):**

1. Create a project in [Firebase Console](https://console.firebase.google.com).
2. Add an Android app with package `com.phlick`, then download `google-services.json`.
3. Place `google-services.json` in the **`app/`** directory (next to `build.gradle.kts`).
4. Rebuild. If the file is present, the Firebase plugins run and Crashlytics/Analytics are active. If the file is missing, the app still builds and runs; analytics/crash reporting are no-ops.

**Usage:** All calls go through `com.phlick.analytics.PhlickAnalytics` (fire-and-forget, off main thread). No code changes needed for gameplay.

## Web

- **Crash reporting (Sentry, optional):** Set `VITE_SENTRY_DSN` to your [Sentry](https://sentry.io) DSN to enable. Errors and unhandled rejections are reported; an Error Boundary catches React errors. Sentry does not block the app.
- **Analytics (optional):** Use **Firebase Analytics** (same project as Android) and/or a custom **VITE_ANALYTICS_ENDPOINT**. Events are sent to Firebase when configured; the custom endpoint still receives queued events when set.

**Setup (optional):**

- **Sentry:** In `.env` or your host’s env, set `VITE_SENTRY_DSN=https://...@sentry.io/...`. Rebuild. Leave unset to disable.
- **Firebase Analytics (web):** In your existing Firebase project, add a **Web** app (Project settings → Your apps → Add app → Web). Copy the `firebaseConfig` object and set these env vars (or put them in `.env`):  
  `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID`, `VITE_FIREBASE_STORAGE_BUCKET`, `VITE_FIREBASE_MESSAGING_SENDER_ID`, `VITE_FIREBASE_APP_ID`, `VITE_FIREBASE_MEASUREMENT_ID`.  
  Rebuild. Events are sent to the same Firebase project as the Android app; you’ll see them in the same Analytics property.
- **Custom endpoint:** Set `VITE_ANALYTICS_ENDPOINT=https://your-backend.com/events` (or similar). Your endpoint should accept POST with `Content-Type: application/json` and body `{ events: Array<{ name, props, ts }> }`. Leave unset to disable (events still queue locally).

**Events:**

| Event | When | Params (Android & Web) |
|-------|------|------------------------|
| `level_started` | User taps Start on a level | `level_number` |
| `level_completed` | User survives the level | `level_number`, `duration_seconds`, `show_tick_bar`, `random_latency_enabled` |
| `level_failed` | User runs out of lives | `level_number`, `duration_seconds`, `show_tick_bar`, `random_latency_enabled` |
| `level_quit` | User quits mid-level (back → Level select) | `level_number`, `lives_left`, `ticks_remaining` |
| `tutorial_dismissed` | User taps Got it on a tutorial | `level_number` |
| `settings_viewed` | User opens Settings screen | `show_tick_bar`, `random_latency_enabled` |

Web events also include `_v` (app version) and `ts` (client timestamp).

## Summary

| Platform | Crash reporting        | Analytics              | Blocking? | Offline?      |
|----------|------------------------|------------------------|-----------|---------------|
| Android  | Firebase Crashlytics   | Firebase Analytics     | No        | Queued, sent when online |
| Web      | Sentry (if DSN set)    | Firebase Analytics and/or POST to endpoint (if set) | No    | Queued / sent when online |

No special permissions are required. Internet is not required to play; reporting and analytics run only when configured and when the device is online.
