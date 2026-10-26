// @vitest-environment jsdom
// OR-7483: leaves must resume when an offset correction follows a device-clock jump.
import React, { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { calibrateTimestampOffset } from "@orderly.network/net/src/fetch/timestampOffset";
import { useRoundNow } from "@orderly.network/prediction/src/prediction/hooks/useRoundCountdown";
import { getTimestamp } from "@orderly.network/utils";

vi.mock("@orderly.network/utils", async () => ({
  ...(await vi.importActual("@orderly.network/utils")),
  ...(await import("@orderly.network/utils/src/window")),
}));

(globalThis as Record<string, unknown>).IS_REACT_ACT_ENVIRONMENT = true;

const OFFSET_KEY = "__ORDERLY_timestamp_offset";
const LISTENERS_KEY = "__ORDERLY_timestamp_offset_listeners";
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
      for (let remaining = ms; remaining > 0; ) {
        const step = Math.min(remaining, 1_000);
        await vi.advanceTimersByTimeAsync(step);
        remaining -= step;
      }
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

function calibrate(timestamp: number) {
  calibrateTimestampOffset({ success: true, timestamp }, 0);
}

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(T0);
  delete (globalThis as Record<string, unknown>)[OFFSET_KEY];
  delete (globalThis as Record<string, unknown>)[LISTENERS_KEY];
  calibrate(T0);
});
afterEach(() => {
  activeProbe?.unmount();
  delete (globalThis as Record<string, unknown>)[OFFSET_KEY];
  delete (globalThis as Record<string, unknown>)[LISTENERS_KEY];
  vi.restoreAllMocks();
  vi.useRealTimers();
});

it.each([-300_000, 300_000])(
  "recovers immediately after calibration for a %sms device jump",
  async (jump) => {
    const probe = renderProbe(T0 + 10_000);
    vi.setSystemTime(T0 + jump);
    expect(getTimestamp()).toBe(T0 + jump);
    await probe.advance(1_000);
    expect(probe.last()).toBe(T0 + jump + 1_000);

    act(() => calibrate(T0 + 1_000));
    expect(probe.last()).toBe(T0 + 1_000);
    await probe.advance(1_000);
    expect(probe.last()).toBe(T0 + 2_000);

    // Restoring device time is another jump; its next valid response removes
    // the previous correction without remounting this leaf.
    vi.setSystemTime(T0 + 2_000);
    act(() => calibrate(T0 + 2_000));
    expect(probe.last()).toBe(T0 + 2_000);
    await probe.advance(1_000);
    expect(probe.last()).toBe(T0 + 3_000);
  },
);

it("keeps steadily expired leaves from rendering each second", async () => {
  const probe = renderProbe(T0 + 1_000);
  await probe.advance(1_000);
  const frozenRenders = probe.renderCount();
  await probe.advance(10_000);
  expect(probe.renderCount() - frozenRenders).toBeLessThanOrEqual(1);
  expect(probe.last()).toBe(T0 + 1_000);
});

it("recovers a leaf mounted before calibration with incorrect device time", async () => {
  delete (globalThis as Record<string, unknown>)[OFFSET_KEY];
  vi.setSystemTime(T0 + 300_000);
  const probe = renderProbe(T0 + 10_000);
  expect(probe.last()).toBe(T0 + 300_000);

  act(() => calibrate(T0));
  expect(probe.last()).toBe(T0);
  await probe.advance(1_000);
  expect(probe.last()).toBe(T0 + 1_000);
});

it("unsubscribes from calibration and the heartbeat on unmount", () => {
  const probe = renderProbe(T0 + 10_000);
  const listeners = (globalThis as Record<string, unknown>)[
    LISTENERS_KEY
  ] as Set<() => void>;
  expect(listeners.size).toBe(1);
  const renders = probe.renderCount();
  probe.unmount();
  expect(listeners.size).toBe(0);
  expect(vi.getTimerCount()).toBe(0);
  act(() => calibrate(T0 + 5_000));
  expect(probe.renderCount()).toBe(renders);
});
