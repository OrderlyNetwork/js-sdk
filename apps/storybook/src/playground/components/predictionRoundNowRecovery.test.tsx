// @vitest-environment jsdom
// OR-7483: after page load the device clock can be adjusted and later
// re-calibrated from server responses; an expired-looking reading must not
// permanently stop the countdown, and a steadily expired leaf must not
// re-render every second. Fake timers drive both window.setInterval (the
// shared heartbeat) and Date.now (getTimestamp with no global offset). Each
// advance is awaited inside async act so React flushes the render between
// ticks instead of lagging one timer window behind the assertions.
import React, { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { useRoundNow } from "@orderly.network/prediction/src/prediction/hooks/useRoundCountdown";

(globalThis as Record<string, unknown>).IS_REACT_ACT_ENVIRONMENT = true;

const OFFSET_KEY = "__ORDERLY_timestamp_offset";
const T0 = 1_800_000_000_000;

// The heartbeat is a module singleton: a probe left mounted after a failed
// assertion would leak its listener and silence the heartbeat for every
// later test in this file, so afterEach force-unmounts the active probe.
let activeProbe: ReturnType<typeof renderProbe> | undefined;

function renderProbe(untilMs: number) {
  const readings: number[] = [];
  const Probe = () => {
    const now = useRoundNow(untilMs);
    readings.push(now);
    return null;
  };
  const container = document.createElement("div");
  document.body.appendChild(container);
  const root = createRoot(container);
  act(() => root.render(<Probe />));
  const advance = async (ms: number) => {
    await act(async () => {
      await vi.advanceTimersByTimeAsync(ms);
    });
  };
  const probe = {
    advance,
    renderCount: () => readings.length,
    last: () => readings[readings.length - 1],
    unmount: () => {
      act(() => root.unmount());
      container.remove();
      if (activeProbe === probe) activeProbe = undefined;
    },
  };
  activeProbe = probe;
  return probe;
}

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(T0);
  delete (globalThis as Record<string, unknown>)[OFFSET_KEY];
});
afterEach(() => {
  activeProbe?.unmount();
  delete (globalThis as Record<string, unknown>)[OFFSET_KEY];
  vi.useRealTimers();
});

it("recovers the countdown after the device clock is restored", async () => {
  const probe = renderProbe(T0 + 10_000);

  // Live round ticking: one reading per second.
  await probe.advance(5_000);
  expect(probe.last()).toBe(T0 + 5_000);

  // Device clock set 5 minutes fast: the tick at T0+301s passes the deadline
  // and the leaf freezes on it.
  vi.setSystemTime(T0 + 300_000);
  await probe.advance(1_000);
  expect(probe.last()).toBe(T0 + 301_000);

  // Steadily expired: React may still render once while bailing out on the
  // first identical state, but the next seconds must cost no renders and no
  // value changes.
  const frozenRenders = probe.renderCount();
  await probe.advance(5_000);
  expect(probe.renderCount() - frozenRenders).toBeLessThanOrEqual(1);
  await probe.advance(5_000);
  expect(probe.renderCount() - frozenRenders).toBeLessThanOrEqual(1);
  expect(probe.last()).toBe(T0 + 301_000);

  // Device clock restored before the true deadline: the next tick resumes.
  vi.setSystemTime(T0 + 6_000);
  await probe.advance(1_000);
  expect(probe.last()).toBe(T0 + 7_000);

  probe.unmount();
});

it("recovers via offset re-calibration while the device clock stays wrong", async () => {
  const probe = renderProbe(T0 + 10_000);

  vi.setSystemTime(T0 + 300_000);
  await probe.advance(1_000);
  expect(probe.last()).toBe(T0 + 301_000);

  // The net layer re-calibrates the global offset from a server timestamp,
  // so getTimestamp() returns server time again despite the wrong clock.
  (globalThis as Record<string, unknown>)[OFFSET_KEY] = -295_000;
  await probe.advance(1_000);
  expect(probe.last()).toBe(T0 + 7_000);

  probe.unmount();
});

it("recovers a leaf that mounted while the clock was already wrong", async () => {
  vi.setSystemTime(T0 + 300_000);
  const probe = renderProbe(T0 + 10_000);
  expect(probe.last()).toBe(T0 + 300_000);

  // Re-calibration brings getTimestamp() back below the deadline; the leaf
  // must start ticking even though it mounted looking expired.
  (globalThis as Record<string, unknown>)[OFFSET_KEY] = -300_000;
  await probe.advance(1_000);
  expect(probe.last()).toBe(T0 + 1_000);

  probe.unmount();
});
