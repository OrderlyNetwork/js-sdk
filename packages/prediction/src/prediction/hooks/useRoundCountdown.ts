import { useEffect, useState } from "react";
import { getTimestamp } from "@orderly.network/utils";
import { secondsUntil } from "../binary/binaryRoundView";

/** Leaf-local calibrated clock; shared prediction state never ticks every second. */
export const useRoundNow = (untilMs?: number) => {
  const [now, setNow] = useState(() => getTimestamp());
  useEffect(() => {
    setNow(getTimestamp());
    if (untilMs == null || untilMs <= getTimestamp()) return;
    const timer = window.setInterval(() => {
      const timestamp = getTimestamp();
      setNow(timestamp);
      if (timestamp >= untilMs) window.clearInterval(timer);
    }, 1_000);
    return () => window.clearInterval(timer);
  }, [untilMs]);
  return now;
};

export const useRoundCountdown = (expireAtMs?: number) => {
  const now = useRoundNow(expireAtMs);
  return expireAtMs != null ? secondsUntil(expireAtMs, now) : 0;
};
