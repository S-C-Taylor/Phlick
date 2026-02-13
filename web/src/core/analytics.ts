/**
 * Non-blocking analytics. Events are queued and sent when online.
 * Never on the critical path; does not require network or block gameplay.
 * Set VITE_ANALYTICS_ENDPOINT to enable (e.g. your backend or a logging service).
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

/** Log an event. Fire-and-forget; never blocks. */
export function logEvent(name: string, props: Record<string, unknown> = {}): void {
  const item: EventItem = { name, props: { ...props, _v: __APP_VERSION__ }, ts: Date.now() };
  const queue = getQueue();
  queue.push(item);
  setQueue(queue);
  if (navigator.onLine && ENDPOINT) {
    setTimeout(flush, 0);
  }
}

/** Call when app loads to flush any queued events from a previous session. */
export function flushWhenOnline(): void {
  if (navigator.onLine) setTimeout(flush, 500);
  if (typeof window !== "undefined") {
    window.addEventListener("online", () => setTimeout(flush, 200));
  }
}
