import React from "react";
import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { afterEach, expect, it, vi } from "vitest";
import { useBinaryTickerAmounts } from "@orderly.network/prediction/src/prediction/binary/useBinaryTickerAmounts";

const mocks = vi.hoisted(() => {
  // The real useWS returns a stable singleton; a fresh object per render
  // would destabilize the hook's effect deps and loop.
  // Typed params give mock.calls a proper tuple, so tests can index the
  // subscribed handler without casting at every access.
  const subscribe = vi.fn(
    (_topic: string, handlers: { onMessage: (tickers: any) => void }) =>
      vi.fn(),
  );
  return { client: { subscribe }, subscribe };
});
vi.mock("@orderly.network/hooks", () => ({
  useWS: () => mocks.client,
}));

const A = "PERP_BTC5M2610110935_USDC";
const B = "PERP_BTC5M2610111100_USDC";

let root: ReactTestRenderer | undefined;
let amounts: Record<string, number> = {};

function Probe({
  symbols,
  active = true,
}: {
  symbols: string[];
  active?: boolean;
}) {
  amounts = useBinaryTickerAmounts(symbols, active);
  return null;
}
function mount(symbols: string[], active = true) {
  act(() => {
    root = create(<Probe symbols={symbols} active={active} />);
  });
}
function push(tickers: unknown[]) {
  const onMessage = mocks.subscribe.mock.calls.at(-1)![1].onMessage;
  act(() => {
    onMessage(tickers);
  });
}
afterEach(() => {
  act(() => root?.unmount());
  root = undefined;
  amounts = {};
  vi.clearAllMocks();
});

it("subscribes once to the global tickers topic and keeps only wanted symbols", () => {
  mount([A, B]);
  expect(mocks.subscribe).toHaveBeenCalledTimes(1);
  expect(mocks.subscribe.mock.calls[0][0]).toBe("tickers");

  push([
    { symbol: "PERP_BTC_USDC", amount: 471.6 },
    { symbol: A, amount: 12.5 },
  ]);
  expect(amounts).toEqual({ [A]: 12.5 });
});

it("drops pushes without a relevant change so row identities survive broadcasts", () => {
  mount([A]);
  push([{ symbol: A, amount: 12.5 }]);
  // No relevant change → the state reference is preserved (memoized rows
  // skip re-rendering); React may still run the component once on bailout.
  const unchanged = amounts;
  push([
    { symbol: "PERP_ETH_USDC", amount: 2981.7 },
    { symbol: A, amount: 12.5 },
  ]);
  expect(amounts).toBe(unchanged);
  push([{ symbol: A, amount: 13 }]);
  expect(amounts).not.toBe(unchanged);
  expect(amounts).toEqual({ [A]: 13 });
});

it("retains still-subscribed amounts across a round rollover", () => {
  mount([A, B]);
  push([
    { symbol: A, amount: 1 },
    { symbol: B, amount: 2 },
  ]);
  act(() => root!.update(<Probe symbols={[B, "PERP_BTC5M2610111105_USDC"]} />));
  expect(amounts).toEqual({ [B]: 2 });
  push([{ symbol: "PERP_BTC5M2610111105_USDC", amount: 5 }]);
  expect(amounts).toEqual({ [B]: 2, PERP_BTC5M2610111105_USDC: 5 });
});

it("ignores non-finite and negative amounts", () => {
  mount([A]);
  push([
    { symbol: A, amount: Number.NaN },
    { symbol: A, amount: -1 },
  ]);
  expect(amounts).toEqual({});
});

it("resets without subscribing when inactive", () => {
  mount([A], false);
  expect(mocks.subscribe).not.toHaveBeenCalled();
  expect(amounts).toEqual({});
});
