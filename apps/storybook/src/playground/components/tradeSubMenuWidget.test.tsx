// @vitest-environment jsdom
import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  TradeSubMenu,
  TradeSubMenuWidget,
  type TradeSubMenuItem,
  type TradeSubMenuWidgetProps,
} from "@orderly.network/markets";
import { PERP_SYMBOL_STORAGE_KEY } from "@orderly.network/utils";

const mocks = vi.hoisted(() => ({
  featureEnabled: true,
  route: vi.fn(),
  markets: vi.fn<(props: Record<string, unknown>) => null>(() => null),
}));
vi.mock("@orderly.network/react-app", () => ({
  useFeatureEnabled: () => mocks.featureEnabled,
  useAppContext: () => ({ onRouteChange: mocks.route }),
}));
vi.mock("@orderly.network/markets-core", () => ({
  SubMenuMarketsWidget: mocks.markets,
}));
vi.mock("@orderly.network/prediction", () => ({
  usePredictionMarketsExtension: vi.fn(),
}));
vi.mock("@orderly.network/i18n", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));
vi.mock("@orderly.network/ui", () => ({
  cn: (...classes: unknown[]) => classes.filter(Boolean).join(" "),
  PredictionIcon: () => null,
  TradingActiveIcon: () => null,
  TradingInactiveIcon: () => null,
}));

let root: ReactTestRenderer;

function render(props: TradeSubMenuWidgetProps = {}) {
  act(() => {
    root = create(<TradeSubMenuWidget {...props} />);
  });
}

function menu() {
  return root.root.findByType(TradeSubMenu).props;
}

function item(key: string): TradeSubMenuItem {
  const found = menu().items.find((entry) => entry.key === key);
  if (!found) throw new Error(`missing item ${key}`);
  return found;
}

function marketsProps() {
  return mocks.markets.mock.calls.at(-1)?.[0];
}

function expectHighlightedItem(key: string) {
  const rows = root.root.findAllByProps({ "data-active": true });
  expect(rows).toHaveLength(1);
  expect(rows[0].findByProps({ children: item(key).title })).toBeDefined();
}

beforeEach(() => {
  vi.clearAllMocks();
  mocks.featureEnabled = true;
  localStorage.clear();
});

afterEach(() => act(() => root?.unmount()));

describe("built-in entries", () => {
  it("lists Perps and Prediction with SDK routes", () => {
    render({ symbol: "PERP_BTC_USDC" });
    expect(menu().items.map((entry) => entry.key)).toEqual([
      "perps",
      "prediction",
    ]);
    expect(item("perps").route).toEqual({
      href: "/perp/PERP_BTC_USDC",
      name: "perps",
    });
    expect(item("prediction").route).toEqual({
      href: "/prediction",
      name: "prediction",
    });
  });

  it("omits Prediction when the app feature is disabled", () => {
    mocks.featureEnabled = false;
    render();
    expect(menu().items.map((entry) => entry.key)).toEqual(["perps"]);
  });

  it("falls back to the remembered, then the default perps symbol", () => {
    localStorage.setItem(PERP_SYMBOL_STORAGE_KEY, "PERP_SOL_USDC");
    render();
    expect(item("perps").route?.href).toBe("/perp/PERP_SOL_USDC");
    expect(marketsProps()?.symbol).toBe("PERP_SOL_USDC");

    act(() => root.unmount());
    localStorage.clear();
    render({ defaultSymbol: "PERP_BTC_USDC" });
    expect(item("perps").route?.href).toBe("/perp/PERP_BTC_USDC");
  });

  it("does not show a remembered prediction round in the markets panel", () => {
    localStorage.setItem(PERP_SYMBOL_STORAGE_KEY, "PERP_BTC5M2608271200_USDC");
    render();
    expect(marketsProps()?.symbol).toBe("PERP_ETH_USDC");
  });

  it("ignores a prediction round passed as the page symbol", () => {
    localStorage.setItem(PERP_SYMBOL_STORAGE_KEY, "PERP_SOL_USDC");
    render({ symbol: "PERP_BTC5M2608271200_USDC" });
    expect(item("perps").route?.href).toBe("/perp/PERP_SOL_USDC");
    expect(marketsProps()?.symbol).toBe("PERP_SOL_USDC");
  });

  it("reads the remembered symbol once per mount", () => {
    const getItem = vi.spyOn(Storage.prototype, "getItem");
    localStorage.setItem(PERP_SYMBOL_STORAGE_KEY, "PERP_SOL_USDC");
    render();
    act(() => menu().onItemHover("prediction"));
    act(() => root.update(<TradeSubMenuWidget activeKey="prediction" />));
    expect(getItem).toHaveBeenCalledOnce();
    expect(item("perps").route?.href).toBe("/perp/PERP_SOL_USDC");
    getItem.mockRestore();
  });
});

describe("selection", () => {
  it("keeps the default highlight until the host updates activeKey after navigation", () => {
    render();
    act(() => menu().onItemClick(item("prediction")));
    expect(mocks.route).toHaveBeenCalledExactlyOnceWith({
      href: "/prediction",
      name: "prediction",
    });
    expectHighlightedItem("perps");
    expect(menu().marketsOpen).toBe(true);

    act(() => root.update(<TradeSubMenuWidget activeKey="prediction" />));
    expectHighlightedItem("prediction");
    expect(menu().marketsOpen).toBe(false);
  });

  it("follows activeKey when the host route changes", () => {
    render({ activeKey: "prediction" });
    expectHighlightedItem("prediction");
    act(() => root.update(<TradeSubMenuWidget activeKey="perps" />));
    expectHighlightedItem("perps");
    expect(menu().marketsOpen).toBe(true);
  });

  it("keeps the controlled highlight when a click does not update the host route", () => {
    render({ activeKey: "prediction" });
    act(() => menu().onItemClick(item("perps")));
    expect(mocks.route).toHaveBeenCalledExactlyOnceWith({
      href: "/perp/PERP_ETH_USDC",
      name: "perps",
    });
    expectHighlightedItem("prediction");
    expect(menu().marketsOpen).toBe(false);
  });

  it("opens the markets panel while Perps or the panel is hovered", () => {
    render({ activeKey: "prediction" });
    act(() => menu().onItemHover("perps"));
    expect(menu().marketsOpen).toBe(true);
    act(() => menu().onItemHover("prediction"));
    expect(menu().marketsOpen).toBe(false);
    act(() => menu().onItemHover("perps"));
    act(() => menu().onMarketsHover());
    expect(menu().marketsOpen).toBe(true);
    expectHighlightedItem("prediction");
    act(() => menu().onMenuLeave());
    expect(menu().marketsOpen).toBe(false);
  });

  it("hides the active Perps panel when Prediction is hovered and reopens it on Perps hover", () => {
    render({ activeKey: "perps" });
    expect(menu().marketsOpen).toBe(true);

    act(() =>
      root.root.findByProps({ "data-active": false }).props.onMouseEnter(),
    );
    expect(menu().marketsOpen).toBe(false);
    expect(root.root.findAllByProps({ "data-state": "closed" })).toHaveLength(
      2,
    );
    expectHighlightedItem("perps");

    act(() =>
      root.root.findByProps({ "data-active": true }).props.onMouseEnter(),
    );
    expect(menu().marketsOpen).toBe(true);
    expect(root.root.findAllByProps({ "data-state": "open" })).toHaveLength(2);
    expectHighlightedItem("perps");
  });

  it("restores the active Perps panel after leaving a hover over another entry", () => {
    render({ activeKey: "perps" });
    act(() => menu().onItemHover("prediction"));
    expect(menu().marketsOpen).toBe(false);
    act(() =>
      root.root
        .findByProps({ onMouseLeave: menu().onMenuLeave })
        .props.onMouseLeave(),
    );
    expect(menu().marketsOpen).toBe(true);
    expectHighlightedItem("perps");
  });
});

describe("markets panel", () => {
  it("routes picked markets to the perps page by default", () => {
    render({ symbol: "PERP_BTC_USDC" });
    expect(marketsProps()?.symbol).toBe("PERP_BTC_USDC");
    act(() =>
      (marketsProps()?.onSymbolChange as (s: { symbol: string }) => void)({
        symbol: "PERP/ETH?USDC",
      }),
    );
    expect(mocks.route).toHaveBeenCalledExactlyOnceWith({
      href: "/perp/PERP%2FETH%3FUSDC",
      name: "perps",
    });
  });

  it("lets the host override market selection", () => {
    const onSymbolChange = vi.fn();
    render({ onSymbolChange });
    const market = { symbol: "PERP_BTC_USDC" };
    act(() =>
      (marketsProps()?.onSymbolChange as (s: typeof market) => void)(market),
    );
    expect(onSymbolChange).toHaveBeenCalledExactlyOnceWith(market);
    expect(mocks.route).not.toHaveBeenCalled();
  });
});

describe("custom entries", () => {
  it("runs a custom click handler instead of navigating", () => {
    const onClick = vi.fn();
    render({
      items: (builtins) => [
        ...builtins,
        {
          key: "spot",
          title: "Spot",
          activeIcon: null,
          inactiveIcon: null,
          onClick,
        },
      ],
    });
    act(() => menu().onItemClick(item("spot")));
    expect(onClick).toHaveBeenCalledOnce();
    expect(mocks.route).not.toHaveBeenCalled();
    expectHighlightedItem("perps");
  });

  it("drops the markets panel when Perps is removed", () => {
    render({
      items: (builtins) => builtins.filter((entry) => entry.key !== "perps"),
    });
    expect(menu().hasMarkets).toBe(false);
    expect(menu().marketsOpen).toBe(false);
    expect(mocks.markets).not.toHaveBeenCalled();
  });
});
