"use client";

import { useEffect, useState } from "react";

/* Work that can wait until the screen exists.
 *
 * The couple's dashboard fires ten requests on mount — activity, announcements,
 * benchmark, budget, gifts-log, tasks, timeline, vault, vendors — alongside the
 * two that carry what they came for: their guests and their answers. Measured
 * across every wedding, most of those ten return nothing: tasks is empty on all
 * five, budget holds an untouched skeleton on four, gifts is empty, and vendors
 * has no table at all.
 *
 * So the screen waits on ten answers to show one. Nothing is removed here —
 * a couple who does use the budget still gets it — the secondary calls simply
 * stop competing with the first paint.
 *
 * requestIdleCallback where it exists, a frame plus a tick where it does not
 * (Safari, which is most of these couples). Either way the guest list is on
 * screen before anything else is asked for.
 */
export function useAfterPaint(): boolean {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const go = () => { if (!cancelled) setReady(true); };

    const w = window as Window & {
      requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number;
      cancelIdleCallback?: (h: number) => void;
    };

    if (typeof w.requestIdleCallback === "function") {
      /* A timeout, because an idle moment is not guaranteed on a busy phone and
         a card that never loads is worse than one that loads late. */
      const h = w.requestIdleCallback(go, { timeout: 1500 });
      return () => { cancelled = true; w.cancelIdleCallback?.(h); };
    }

    const raf = requestAnimationFrame(() => setTimeout(go, 0));
    return () => { cancelled = true; cancelAnimationFrame(raf); };
  }, []);

  return ready;
}
