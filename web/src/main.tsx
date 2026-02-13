import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import * as Sentry from "@sentry/react";
import "./index.css";
import App from "./App.tsx";
import { flushWhenOnline } from "./core/analytics";

const dsn = import.meta.env.VITE_SENTRY_DSN;
if (dsn) {
  Sentry.init({
    dsn,
    environment: import.meta.env.MODE,
    release: `web@${__APP_VERSION__}`,
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration({ maskAllText: true, blockAllMedia: true }),
    ],
    tracesSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
    replaysSessionSampleRate: 0,
  });
}

flushWhenOnline();

const root = createRoot(document.getElementById("root")!);
const RootApp = dsn ? Sentry.withErrorBoundary(App, { fallback: <ErrorFallback /> }) : App;

root.render(
  <StrictMode>
    <RootApp />
  </StrictMode>
);

function ErrorFallback() {
  return (
    <div style={{ padding: 24, textAlign: "center", fontFamily: "sans-serif" }}>
      <h1>Something went wrong</h1>
      <p>The error has been reported. You can refresh to try again.</p>
    </div>
  );
}
