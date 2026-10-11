import { useEffect, useState } from "react";
import { getTimestamp } from "@orderly.network/utils";
import { secondsUntil } from "../binary/binaryRoundView";

type HeartbeatClock = {
  now: () => number;
  setInterval: (callback: () => void, ms: number) => number;
  clearInterval: (timer: number) => void;
};

type HeartbeatListener = (now: number) => void;

/**
 * Refcounted 1s heartbeat: the interval runs while at least one listener is
 * subscribed, so N countdown leaves share one timer instead of N row-local
 * setIntervals. The clock is injectable to keep the lifecycle unit-testable.
 */
export const createSharedHeartbeat = (clock: HeartbeatClock) => {
  const listeners = new Set<HeartbeatListener>();
  let timer: number | undefined;
  const tick = () => {
    const now = clock.now();
    listeners.forEach((listener) => listener(now));
  };
  const subscribe = (listener: HeartbeatListener) => {
    listeners.add(listener);
    if (listeners.size === 1) {
      timer = clock.setInterval(tick, 1_000);
    }
    return () => {
      listeners.delete(listener);
      if (listeners.size === 0 && timer !== undefined) {
        clock.clearInterval(timer);
        timer = undefined;
      }
    };
  };
  return { subscribe };
};

const sharedHeartbeat = createSharedHeartbeat({
  now: getTimestamp,
  // Referenced lazily: importing this module outside a DOM environment
  // (node tests) must not touch `window`.
  setInterval: (callback, ms) => window.setInterval(callback, ms),
  clearInterval: (timer) => window.clearInterval(timer),
});

/** Leaf-local calibrated clock; shared prediction state never ticks every second. */
export const useRoundNow = (untilMs?: number) => {
  const [now, setNow] = useState(getTimestamp);
  useEffect(() => {
    setNow(getTimestamp());
    if (untilMs == null || untilMs <= getTimestamp()) return;
    // Join the shared heartbeat; leave on unmount or once this leaf's own
    // deadline passes, mirroring the old self-clearing row-local timer.
    const unsubscribe = sharedHeartbeat.subscribe((timestamp) => {
      setNow(timestamp);
      if (timestamp >= untilMs) unsubscribe();
    });
    return unsubscribe;
  }, [untilMs]);
  return now;
};

export const useRoundCountdown = (expireAtMs?: number) => {
  const now = useRoundNow(expireAtMs);
  return expireAtMs != null ? secondsUntil(expireAtMs, now) : 0;
};
