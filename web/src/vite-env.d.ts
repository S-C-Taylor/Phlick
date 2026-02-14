/// <reference types="vite/client" />

declare const __APP_VERSION__: string;

interface ImportMetaEnv {
  readonly VITE_SENTRY_DSN?: string;
  readonly VITE_ANALYTICS_ENDPOINT?: string;
  /** Formspree form ID for feedback (formspree.io). Your reply email is set in Formspree only. */
  readonly VITE_FEEDBACK_FORM_ID?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
