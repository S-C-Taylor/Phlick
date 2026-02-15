/**
 * Non-blocking analytics. Events are queued and sent when online.
 * Never on the critical path; does not require network or block gameplay.
 *
 * Optional backends:
 * - VITE_ANALYTICS_ENDPOINT: POST { events } to your backend
 * - VITE_FIREBASE_*: send events to Firebase Analytics (same project as Android)
 */

const QUEUE_KEY = "phlick_analytics_queue";
const MAX_QUEUE = 100;
const ENDPOINT = import.meta.env.VITE_ANALYTICS_ENDPOINT as string | undefined;

type EventItem = { name: string; props: Record<string, unknown>; ts: number };

function getQueue(): EventItem[] {
  try {
    const raw = localStorage.getItem(QUEUE_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw) as unknown;
    return Array.isArray(arr) ? arr.slice(-MAX_QUEUE) : [];
  } catch {
    return [];
  }
}

function setQueue(q: EventItem[]) {
  try {
    localStorage.setItem(QUEUE_KEY, JSON.stringify(q.slice(-MAX_QUEUE)));
  } catch {
    // ignore
  }
}

function flush() {
  if (!ENDPOINT || !navigator.onLine) return;
  const queue = getQueue();
  if (queue.length === 0) return;
  setQueue([]);
  const payload = JSON.stringify({ events: queue });
  try {
    fetch(ENDPOINT, {
      method: "POST",
      body: payload,
      headers: { "Content-Type": "application/json" },
      keepalive: true,
    }).catch(() => {
      const again = getQueue();
      setQueue([...again, ...queue].slice(-MAX_QUEUE));
    });
  } catch {
    const again = getQueue();
    setQueue([...again, ...queue].slice(-MAX_QUEUE));
  }
}

/** Firebase Analytics instance (lazy-inited when config env vars are set). */
let firebaseAnalytics: import("firebase/analytics").Analytics | null = null;
let firebaseInitPromise: Promise<import("firebase/analytics").Analytics | null> | null = null;

function getFirebaseConfig(): Record<string, string> | null {
  const apiKey = import.meta.env.VITE_FIREBASE_API_KEY as string | undefined;
  const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID as string | undefined;
  const appId = import.meta.env.VITE_FIREBASE_APP_ID as string | undefined;
  const measurementId = import.meta.env.VITE_FIREBASE_MEASUREMENT_ID as string | undefined;
  if (!apiKey || !projectId || !appId || !measurementId) return null;
  return {
    apiKey,
    authDomain: (import.meta.env.VITE_FIREBASE_AUTH_DOMAIN as string) || `${projectId}.firebaseapp.com`,
    projectId,
    storageBucket: (import.meta.env.VITE_FIREBASE_STORAGE_BUCKET as string) || `${projectId}.appspot.com`,
    messagingSenderId: (import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID as string) || "",
    appId,
    measurementId,
  };
}

async function getFirebaseAnalytics(): Promise<import("firebase/analytics").Analytics | null> {
  if (firebaseAnalytics) return firebaseAnalytics;
  if (firebaseInitPromise) return firebaseInitPromise;
  const config = getFirebaseConfig();
  if (!config) return null;
  firebaseInitPromise = (async () => {
    try {
      const { initializeApp } = await import("firebase/app");
      const { getAnalytics } = await import("firebase/analytics");
      const app = initializeApp(config);
      const analytics = getAnalytics(app);
      firebaseAnalytics = analytics;
      return analytics;
    } catch {
      return null;
    }
  })();
  return firebaseInitPromise;
}

function sendToFirebase(name: string, props: Record<string, unknown>): void {
  getFirebaseAnalytics().then(async (analytics) => {
    if (!analytics) return;
    try {
      const { logEvent: firebaseLogEvent } = await import("firebase/analytics");
      // Firebase expects string/number params; flatten props
      const params: Record<string, string | number> = {};
      for (const [k, v] of Object.entries(props)) {
        if (typeof v === "string" || typeof v === "number") params[k] = v;
        else if (typeof v === "boolean") params[k] = v ? 1 : 0;
        else if (v != null) params[k] = String(v);
      }
      firebaseLogEvent(analytics, name, params);
    } catch {
      // best-effort; never break the app
    }
  });
}

/** Log an event. Fire-and-forget; never blocks. */
export function logEvent(name: string, props: Record<string, unknown> = {}): void {
  const item: EventItem = { name, props: { ...props, _v: __APP_VERSION__ }, ts: Date.now() };
  const queue = getQueue();
  queue.push(item);
  setQueue(queue);
  if (navigator.onLine && ENDPOINT) {
    setTimeout(flush, 0);
  }
  if (getFirebaseConfig()) {
    sendToFirebase(name, item.props);
  }
}

/** Call when app loads to flush any queued events from a previous session. */
export function flushWhenOnline(): void {
  if (navigator.onLine) setTimeout(flush, 500);
  if (typeof window !== "undefined") {
    window.addEventListener("online", () => setTimeout(flush, 200));
  }
}
