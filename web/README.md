# Phlick Web

Browser version of the Phlick prayer flick trainer. Same levels and core gameplay as the Android app.

## Stack

- **Vite** + **React** + **TypeScript**
- No game engine; minimal bundle for fast load
- Core game logic in `src/core/` (TypeScript port of the Kotlin shared module; shared module is the source of truth)

## Run locally

```bash
npm install
npm run dev
```

## Build for production (e.g. AWS Amplify)

```bash
npm run build
```

Output is in `dist/`. Configure Amplify to build with `npm run build` and publish the `dist` directory.

## Game logic

- **Levels**: Same 14 levels as Android (`src/core/levels.ts` mirrors `shared/…/Level.kt`).
- **Tick**: 600ms per tick. Prayer drain, reactive monster decisions, and attack resolution match the shared module.
- **Constants**: `PROGRESSION_WARMUP_TICKS`, `PRAYER_DRAIN_TICKS`, `INITIAL_PRAYER_POINTS` match shared.

Optional later: consume the Kotlin/JS build from the `shared` module instead of the TS port for a single source of truth at runtime.

## Feedback form (optional)

The **Feedback** page (About → Feedback, or `/feedback`) submits to [Formspree](https://formspree.io). Your reply-to email is set only in Formspree’s dashboard, so it never appears in the site or in crawlers.

1. Create a free form at [formspree.io](https://formspree.io) and set your email as the notification address.
2. Copy the form ID from the form’s endpoint (e.g. `https://formspree.io/f/abcxyz` → `abcxyz`).
3. Set `VITE_FEEDBACK_FORM_ID=abcxyz` in your build env (e.g. `.env` or your host’s env). Rebuild.

If `VITE_FEEDBACK_FORM_ID` is not set, the Feedback page shows “Feedback form is not configured” and no email is exposed.
