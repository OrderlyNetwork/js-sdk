// @vitest-environment jsdom
import React from "react";
import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { MarketsItem } from "@orderly.network/hooks";
import { filterMarkets } from "@orderly.network/hooks/src/orderly/markets/marketFilter";
import { MarketsType } from "@orderly.network/hooks/src/orderly/markets/marketTypes";
import { MobileMarketsHeader } from "@orderly.network/markets-core/src/pages/home/marketsHeader/marketsHeader.mobile.ui";
import { useDataSource } from "@orderly.network/markets-core/src/pages/home/marketsHeader/marketsHeader.script";
import { MarketsHeader } from "@orderly.network/markets-core/src/pages/home/marketsHeader/marketsHeader.ui";

const state = vi.hoisted(() => ({
  markets: [] as MarketsItem[],
  isReady: true,
  isLoading: false,
  error: undefined as unknown,
}));

vi.mock("@orderly.network/hooks", async () => {
  const { useLocalStorage } =
    await import("@orderly.network/hooks/src/useLocalStorage");
  return {
    useLocalStorage,
    MarketsType,
    useMarkets: (type: MarketsType) => [
      filterMarkets({
        markets: state.markets,
        favorites: [],
        recent: [],
        newListing: [],
        type,
      }),
      {
        addToHistory: vi.fn(),
        isReady: state.isReady,
        isLoading: state.isLoading,
        error: state.error,
      },
    ],
    useQuery: () => ({ data: { total_holding: 42 } }),
  };
});
vi.mock("@orderly.network/i18n", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));
vi.mock("@orderly.network/ui", () => {
  const Container = ({ children }: any) => <div>{children}</div>;
  const Text = Object.assign(Container, {
    numeral: Container,
    gradient: Container,
  });
  return {
    Box: Container,
    Flex: Container,
    Text,
    Tabs: Container,
    TabPanel: Container,
    Button: ({ children, onClick }: any) => (
      <button onClick={onClick}>{children}</button>
    ),
    EmptyDataState: () => <div data-empty />,
    Spinner: () => <div data-loading />,
    cn: (...classes: string[]) => classes.filter(Boolean).join(" "),
  };
});
vi.mock("@orderly.network/markets-core/src/components/marketsProvider", () => ({
  useMarketsContext: () => ({}),
}));
vi.mock("@orderly.network/markets-core/src/components/symbolDisplay", () => ({
  SymbolDisplay: ({ children }: any) => <span>{children}</span>,
}));
vi.mock("@orderly.network/markets-core/src/icons", () => ({
  OrderlyIcon: () => null,
}));

const storageKey = "orderly_markets_show_low_volume";
const now = 1800000000000;
const day = 86400000;
const market = (
  symbol: string,
  age: number,
  volume: number | null = 1000,
  change = 0,
): MarketsItem =>
  ({
    symbol,
    created_time: now - age * day,
    "24h_amount": volume,
    change,
    openInterest: 10,
  }) as MarketsItem;

let renderer: ReactTestRenderer;
let data: ReturnType<typeof useDataSource>;
function Harness({ View }: { View?: typeof MarketsHeader }) {
  data = useDataSource();
  return View ? <View {...data} /> : null;
}
function mount(View?: typeof MarketsHeader) {
  act(() => {
    renderer = create(<Harness View={View} />);
  });
}

beforeEach(() => {
  localStorage.clear();
  state.markets = [];
  state.isReady = true;
  state.isLoading = false;
  state.error = undefined;
  vi.spyOn(Date, "now").mockReturnValue(now);
});
afterEach(() => {
  if (renderer) act(() => renderer.unmount());
  vi.restoreAllMocks();
});

describe("market header Strict filtering", () => {
  it("keeps listings older than 30 days and sorts by creation time", () => {
    state.markets = [
      market("OLDER", 31),
      market("BOUNDARY", 30),
      market("RECENT", 29.999),
      market("NEWEST", 1),
    ];
    mount();
    expect(data.news.map((item) => item.symbol)).toEqual([
      "NEWEST",
      "RECENT",
      "BOUNDARY",
      "OLDER",
    ]);
    expect(data.newsHiddenByLowVolumeFilter).toBe(false);
  });

  it("filters before taking five and keeps old markets in the gainers and losers", () => {
    state.markets = [
      ...Array.from({ length: 6 }, (_, i) => market(`LOW${i}`, i, 999, 20 - i)),
      ...Array.from({ length: 6 }, (_, i) =>
        market(`VALID${i}`, i + 10, 1000, i),
      ),
      market("OLD_HIGH", 31, 2000, 50),
      market("OLD_LOW", 31, 2000, -50),
      market("MISSING", 1, null, 100),
      market("INVALID", 1, Number.NaN, -100),
    ];
    localStorage.setItem(storageKey, "false");
    mount();
    expect(data.news.map((item) => item.symbol)).toEqual([
      "VALID0",
      "VALID1",
      "VALID2",
      "VALID3",
      "VALID4",
    ]);
    expect(data.gainers.map((item) => item.symbol)).toEqual([
      "OLD_HIGH",
      "VALID5",
      "VALID4",
      "VALID3",
      "VALID2",
    ]);
    expect(data.losers.map((item) => item.symbol)).toEqual([
      "OLD_LOW",
      "VALID0",
      "VALID1",
      "VALID2",
      "VALID3",
    ]);
    expect(data.totalOpenInterest).toBe(state.markets.length * 10);
    expect(data.tvl).toBe(42);
  });

  for (const [name, View] of [
    ["desktop", MarketsHeader],
    ["mobile", MobileMarketsHeader],
  ] as const) {
    it(`${name}: hides empty states until the first request succeeds`, () => {
      state.isReady = false;
      state.isLoading = true;
      mount(View);
      expect(
        renderer.root.findAllByProps({ "data-loading": true }),
      ).toHaveLength(3);
      expect(renderer.root.findAllByProps({ "data-empty": true })).toHaveLength(
        0,
      );
      expect(renderer.root.findAllByType("button")).toHaveLength(0);

      state.isLoading = false;
      state.error = new Error("Request failed");
      act(() => renderer.update(<Harness View={View} />));
      expect(
        renderer.root.findAllByProps({ "data-loading": true }),
      ).toHaveLength(0);
      expect(renderer.root.findAllByProps({ "data-empty": true })).toHaveLength(
        0,
      );

      state.isReady = true;
      state.error = undefined;
      act(() => renderer.update(<Harness View={View} />));
      expect(renderer.root.findAllByProps({ "data-empty": true })).toHaveLength(
        3,
      );

      state.markets = [market("ETH", 31, 1000)];
      act(() => renderer.update(<Harness View={View} />));
      expect(renderer.root.findAllByProps({ "data-empty": true })).toHaveLength(
        0,
      );
      expect(data.news[0].symbol).toBe("ETH");
    });

    it(`${name}: distinguishes a natural empty state from Strict hiding and restores all lists`, () => {
      state.markets = [];
      localStorage.setItem(storageKey, "false");
      mount(View);
      expect(data.newsHiddenByLowVolumeFilter).toBe(false);
      expect(renderer.root.findAllByProps({ "data-empty": true })).toHaveLength(
        3,
      );
      expect(renderer.root.findAllByType("button")).toHaveLength(0);

      state.markets = [market("OLD", 31, 500)];
      act(() => renderer.update(<Harness View={View} />));
      expect(data.newsHiddenByLowVolumeFilter).toBe(true);
      expect(renderer.root.findAllByType("button")).toHaveLength(3);
      act(() => renderer.root.findAllByType("button")[0].props.onClick());
      expect(localStorage.getItem(storageKey)).toBe("true");
      expect(
        [data.news, data.gainers, data.losers].map((list) => list.length),
      ).toEqual([1, 1, 1]);
      expect(renderer.root.findAllByType("button")).toHaveLength(0);
      act(() => renderer.unmount());
      mount(View);
      expect(data.news).toHaveLength(1);
    });
  }

  it("does not change market totals when Strict changes", () => {
    state.markets = [market("LOW", 1, 500), market("HIGH", 1, 1000)];
    mount();
    expect(data.total24Amount).toBe(1500);
    act(() => {
      localStorage.setItem(storageKey, "false");
      window.dispatchEvent(new Event("storage"));
    });
    expect(data.news).toHaveLength(1);
    expect(data.total24Amount).toBe(1500);
    expect(data.totalOpenInterest).toBe(20);
  });
});
