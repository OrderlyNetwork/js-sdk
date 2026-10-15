// @vitest-environment jsdom
import React, { act, useState } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { calibrateTimestampOffset } from "@orderly.network/net/src/fetch/timestampOffset";
import type { BinaryInfoRow } from "@orderly.network/prediction/src/prediction/binary/binaryInfo";
import { useBinaryRounds } from "@orderly.network/prediction/src/prediction/binary/useBinaryRounds";
import { useRoundCountdown } from "@orderly.network/prediction/src/prediction/hooks/useRoundCountdown";

vi.mock("@orderly.network/utils", async () => ({
  ...(await vi.importActual("@orderly.network/utils")),
  ...(await import("@orderly.network/utils/src/window")),
}));

const T0 = Date.UTC(2026, 9, 13, 12);
const MOUNT_TIME = T0 + 240_000;
const row: BinaryInfoRow = {
  symbol: "PERP_BTC5M2610131200_USDC",
  product_type: "BINARY",
  fee_model: "BINARY_PROBABILITY",
  status: "ACTIVE",
  activated_at: T0 - 60_000,
  observation_start_at: T0,
  expire_at: T0 + 300_000,
  index_price_symbol: "PERP_BTC_USDC",
  s0: 50_000,
};
const rows = [row];

vi.mock("@orderly.network/hooks", () => ({
  // Keep the exact same snapshot object throughout calibration and clock jumps.
  useQuery: (url: string | null) => ({
    data: url === "/v1/public/binary/info" ? rows : undefined,
    isLoading: false,
  }),
  useLocalStorage: (_key: string, initial: unknown) => useState(initial),
}));

(globalThis as Record<string, unknown>).IS_REACT_ACT_ENVIRONMENT = true;
let state: ReturnType<typeof useBinaryRounds>;
let countdown = 0;
let root: ReturnType<typeof createRoot> | undefined;
let container: HTMLDivElement;
const onSymbolSelect = vi.fn();

function Probe() {
  state = useBinaryRounds({ active: true, symbol: row.symbol, onSymbolSelect });
  countdown = useRoundCountdown(row.expire_at);
  return null;
}

function mount() {
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
  act(() => root!.render(<Probe />));
}

async function advance(ms: number) {
  await act(async () => {
    for (let remaining = ms; remaining > 0; ) {
      const step = Math.min(remaining, 1_000);
      await vi.advanceTimersByTimeAsync(step);
      remaining -= step;
    }
  });
}

beforeEach(() => {
  vi.useFakeTimers({
    toFake: [
      "Date",
      "setInterval",
      "clearInterval",
      "setTimeout",
      "clearTimeout",
    ],
  });
  vi.setSystemTime(MOUNT_TIME);
  delete (globalThis as Record<string, unknown>).__ORDERLY_timestamp_offset;
  delete (globalThis as Record<string, unknown>)
    .__ORDERLY_timestamp_offset_listeners;
  calibrateTimestampOffset({ success: true, timestamp: MOUNT_TIME }, 0);
});
afterEach(() => {
  act(() => root?.unmount());
  root = undefined;
  container?.remove();
  delete (globalThis as Record<string, unknown>).__ORDERLY_timestamp_offset;
  delete (globalThis as Record<string, unknown>)
    .__ORDERLY_timestamp_offset_listeners;
  vi.restoreAllMocks();
  vi.useRealTimers();
});

it.each([-300_000, 300_000])(
  "restores countdown and round boundaries after calibrating a %sms device change",
  async (jump) => {
    mount();
    expect(countdown).toBe(60);
    expect(state.roundPhase).toBe("trading");
    expect(state.isRoundTradable).toBe(true);
    vi.setSystemTime(MOUNT_TIME + jump);
    await advance(31_000);
    if (jump > 0) {
      expect(countdown).toBe(0);
      expect(state.roundPhase).toBe("closed");
      expect(state.isRoundTradable).toBe(false);
      expect(vi.getTimerCount()).toBe(1); // Only the shared heartbeat survives.
    } else {
      expect(countdown).toBeGreaterThan(60);
      expect(state.roundPhase).toBe("trading");
    }

    // The REST envelope updates only the offset; the rows identity is unchanged.
    act(() =>
      calibrateTimestampOffset(
        { success: true, timestamp: MOUNT_TIME + 31_000 },
        0,
      ),
    );
    expect(countdown).toBe(29);
    expect(state.roundPhase).toBe("closingSoon");
    expect(state.isRoundTradable).toBe(true);
    expect(state.markets[0].hasLiveRow).toBe(true);
    expect(state.rows).toBe(rows);
    await advance(30_000);
    expect(countdown).toBe(0);
    expect(state.roundPhase).toBe("closed");
    expect(state.isRoundTradable).toBe(false);
    expect(state.markets[0].hasLiveRow).toBe(false);
    expect(state.now).toBeGreaterThanOrEqual(row.expire_at);
  },
);

it("removes the previous offset and reschedules boundaries after device time is restored", async () => {
  vi.setSystemTime(MOUNT_TIME + 300_000);
  mount();
  expect(state.roundPhase).toBe("closed");
  act(() =>
    calibrateTimestampOffset({ success: true, timestamp: MOUNT_TIME }, 0),
  );
  expect(countdown).toBe(60);
  expect(state.roundPhase).toBe("trading");
  expect(state.isRoundTradable).toBe(true);
  expect(state.rows).toBe(rows);

  vi.setSystemTime(MOUNT_TIME);
  act(() =>
    calibrateTimestampOffset({ success: true, timestamp: MOUNT_TIME }, 0),
  );
  expect(
    (globalThis as Record<string, unknown>).__ORDERLY_timestamp_offset,
  ).toBe(0);
  expect(countdown).toBe(60);
  await advance(61_000);
  expect(state.roundPhase).toBe("closed");
  expect(state.isRoundTradable).toBe(false);
});

it("cleans up both boundary observers and the countdown on unmount", () => {
  mount();
  const listeners = (globalThis as Record<string, unknown>)
    .__ORDERLY_timestamp_offset_listeners as Set<() => void>;
  expect(listeners.size).toBe(3);
  act(() => root!.unmount());
  root = undefined;
  expect(listeners.size).toBe(0);
  expect(vi.getTimerCount()).toBe(0);
  act(() => {
    window.dispatchEvent(new Event("focus"));
    document.dispatchEvent(new Event("visibilitychange"));
  });
  expect(vi.getTimerCount()).toBe(0);
});

it.each(["focus", "visibilitychange"])(
  "wakes stopped boundaries on %s when restored device time leaves the offset unchanged",
  async (event) => {
    mount();
    vi.setSystemTime(MOUNT_TIME + 300_000);
    await advance(31_000);
    expect(state.roundPhase).toBe("closed");
    expect(state.isRoundTradable).toBe(false);
    expect(vi.getTimerCount()).toBe(1);
    const listener = vi.fn();
    const { subscribeTimestampOffset } =
      await import("@orderly.network/net/src/fetch/timestampOffset");
    const unsubscribe = subscribeTimestampOffset(listener);

    vi.setSystemTime(MOUNT_TIME + 31_000);
    act(() => {
      if (event === "focus") window.dispatchEvent(new Event(event));
      else document.dispatchEvent(new Event(event));
      calibrateTimestampOffset(
        { success: true, timestamp: MOUNT_TIME + 31_000 },
        0,
      );
    });
    expect(listener).not.toHaveBeenCalled();
    expect(countdown).toBe(29);
    expect(state.roundPhase).toBe("closingSoon");
    expect(state.isRoundTradable).toBe(true);
    expect(vi.getTimerCount()).toBe(3);
    expect(state.rows).toBe(rows);
    unsubscribe();
    await advance(30_000);
    expect(state.isRoundTradable).toBe(false);
  },
);
