import { useEffect, useState } from "react";
import { getTimestamp } from "@orderly.network/utils";

/**
 * Seconds until the round expires, ticking locally at the leaf that displays
 * it. Keeps the per-second heartbeat OUT of the shared prediction state: the
 * provider/context only re-renders on real data changes, while countdown
 * surfaces (chart, holdings, dropdown rows) self-update. Expired rounds stay
 * static — no interval is scheduled once T1 has passed.
 */
export const useRoundCountdown = (expireAtMs?: number) => {
  const [now, setNow] = useState(() => getTimestamp());

  useEffect(() => {
    if (expireAtMs == null) return;
    // Resync on round switch; the ticking `now` may be stale by one interval.
    setNow(getTimestamp());
    if (expireAtMs <= getTimestamp()) return;
    const timer = window.setInterval(() => {
      const timestamp = getTimestamp();
      // Self-stop once the round expires: the phase/tradability flip arrives
      // via the rounds boundary scheduler, so the leaf can go static instead
      // of ticking a clamped-at-zero countdown forever.
      if (timestamp >= expireAtMs) window.clearInterval(timer);
      setNow(timestamp);
    }, 1_000);
    return () => window.clearInterval(timer);
  }, [expireAtMs]);

  return expireAtMs != null
    ? Math.max(0, Math.ceil((expireAtMs - now) / 1_000))
    : 0;
};
