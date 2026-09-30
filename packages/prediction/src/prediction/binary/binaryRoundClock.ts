import type { BinaryInfoRow } from "./binaryInfo";

type RoundClock = {
  now: () => number;
  setTimeout: (callback: () => void, delay: number) => number;
  clearTimeout: (timer: number) => void;
};

/** Keep round time current at lifecycle boundaries until the observer stops. */
export const startBinaryRoundClock = (
  rows: BinaryInfoRow[],
  onTick: (now: number) => void,
  clock: RoundClock,
) => {
  let timer: number | undefined;
  let stopped = false;

  const tick = () => {
    if (stopped) return;
    const now = clock.now();
    onTick(now);
    const next = Math.min(
      ...rows
        .flatMap((row) => [
          row.observation_start_at,
          row.expire_at - 30_000,
          row.expire_at,
        ])
        .filter((boundary) => boundary > now),
    );
    if (Number.isFinite(next)) {
      // Evaluate just after the boundary, then schedule the following one.
      timer = clock.setTimeout(tick, next + 5 - now);
    }
  };

  // New snapshots and reactivation must catch up even with no future boundary.
  tick();

  return () => {
    stopped = true;
    if (timer !== undefined) clock.clearTimeout(timer);
  };
};
