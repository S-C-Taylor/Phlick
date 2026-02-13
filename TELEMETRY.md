# Crash reporting and analytics

Crash reporting and analytics are **optional**, **non-blocking**, and **offline-safe**. They never block gameplay and do not require internet or special permissions.

## Android (Firebase)

- **Crashlytics**: Uncaught crashes and non-fatal exceptions (via `PhlickAnalytics.recordNonFatal`).
- **Analytics**: Events (`level_started`, `level_completed`, `level_failed`, `tutorial_dismissed`) are logged and sent when the device is online. Firebase batches and uploads in the background.

**Setup (optional):**

1. Create a project in [Firebase Console](https://console.firebase.google.com).
2. Add an Android app with package `com.phlick`, then download `google-services.json`.
3. Place `google-services.json` in the **`app/`** directory (next to `build.gradle.kts`).
4. Rebuild. If the file is present, the Firebase plugins run and Crashlytics/Analytics are active. If the file is missing, the app still builds and runs; analytics/crash reporting are no-ops.

**Usage:** All calls go through `com.phlick.analytics.PhlickAnalytics` (fire-and-forget, off main thread). No code changes needed for gameplay.

## Web

- **Crash reporting (Sentry, optional):** Set `VITE_SENTRY_DSN` to your [Sentry](https://sentry.io) DSN to enable. Errors and unhandled rejections are reported; an Error Boundary catches React errors. Sentry does not block the app.
- **Analytics (optional):** Set `VITE_ANALYTICS_ENDPOINT` to a URL that accepts POST requests with JSON body `{ events: [{ name, props, ts }, ...] }`. Events are queued in `localStorage` and flushed when online. If the endpoint is not set, events are queued but not sent.

**Setup (optional):**

- **Sentry:** In `.env` or your host’s env, set `VITE_SENTRY_DSN=https://...@sentry.io/...`. Rebuild. Leave unset to disable.
- **Analytics:** Set `VITE_ANALYTICS_ENDPOINT=https://your-backend.com/events` (or similar). Your endpoint should accept POST with `Content-Type: application/json` and body `{ events: Array<{ name, props, ts }> }`. Leave unset to disable sending (events still queue locally).

**Events:** `level_started`, `level_completed`, `level_failed`, `tutorial_dismissed`, each with `level_number` and `_v` (app version).

## Summary

| Platform | Crash reporting        | Analytics              | Blocking? | Offline?      |
|----------|------------------------|------------------------|-----------|---------------|
| Android  | Firebase Crashlytics   | Firebase Analytics     | No        | Queued, sent when online |
| Web      | Sentry (if DSN set)    | POST to endpoint (if set) | No    | Queued, flushed when online |

No special permissions are required. Internet is not required to play; reporting and analytics run only when configured and when the device is online.
