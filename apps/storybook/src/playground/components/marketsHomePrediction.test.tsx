import React, { isValidElement, type ReactElement } from "react";
import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { MarketTabConfig } from "@orderly.network/markets-core";
import {
  MarketsHomePage,
  type MarketsHomePageProps,
} from "@orderly.network/markets/src/pages/home/page";

const mocks = vi.hoisted(() => ({
  BasePage: vi.fn((_props: MarketsHomePageProps) => null),
  markets: vi.fn(),
  navigate: vi.fn(),
  onRouteChange: undefined as undefined | ((options: unknown) => void),
  tabs: [] as MarketTabConfig[],
  favorites: [] as string[],
  toggleFavorite: vi.fn(),
}));
vi.mock("@orderly.network/markets-core", () => ({
  MarketsHomePage: mocks.BasePage,
  useMarketCategories: () => mocks.tabs,
  useMarketsContext: () => ({ searchValue: "" }),
  FavoritesIcon2: () => null,
  UnFavoritesIcon2: () => null,
}));
vi.mock("@orderly.network/react-app", () => ({
  useAppContext: () => ({ onRouteChange: mocks.onRouteChange }),
}));
vi.mock("@orderly.network/prediction", async () => ({
  usePredictionMarketsExtension: (
    await import("@orderly.network/prediction/src/prediction/usePredictionMarketsExtension")
  ).usePredictionMarketsExtension,
}));
vi.mock(
  "@orderly.network/prediction/src/prediction/hooks/usePredictionMarkets",
  () => ({ usePredictionMarkets: mocks.markets }),
);
vi.mock(
  "@orderly.network/prediction/src/prediction/predictionFavorites",
  () => ({
    usePredictionFavorites: () => ({
      favoriteMarketIds: mocks.favorites,
      toggleFavorite: mocks.toggleFavorite,
    }),
  }),
);
vi.mock("@orderly.network/i18n", () => ({
  i18n: {
    t: (key: string, values?: { base: string; period: string }) =>
      key === "prediction.marketName"
        ? `${values?.base} ${values?.period} Up/Down`
        : key,
  },
  useTranslation: () => ({ t: (key: string) => key }),
}));

const predictionTab: MarketTabConfig = {
  id: "prediction",
  name: "Prediction",
  match: () => false,
};
const markets = [
  {
    id: "PERP_BTC5M_USDC",
    base: "BTC",
    period: "5M",
    indexPriceSymbol: "PERP_BTC_USDC",
    currentRow: { symbol: "BTC round/1" },
  },
  {
    id: "PERP_ETH5M_USDC",
    base: "ETH",
    period: "5M",
    indexPriceSymbol: "PERP_ETH_USDC",
    currentRow: { symbol: "ETH round/1" },
  },
];
let root: ReactTestRenderer | undefined;
function mount(props: MarketsHomePageProps = {}) {
  act(() => {
    root = create(<MarketsHomePage {...props} />);
  });
}
function pageProps(): MarketsHomePageProps {
  return mocks.BasePage.mock.calls.at(-1)![0];
}
function panel(node: React.ReactNode) {
  expect(isValidElement(node)).toBe(true);
  return (node as ReactElement).props;
}
beforeEach(() => {
  vi.clearAllMocks();
  mocks.onRouteChange = mocks.navigate;
  mocks.tabs = [{ type: "favorites" }, { type: "crypto" }, { type: "rwa" }];
  mocks.favorites = [];
  mocks.markets.mockImplementation(({ enabled }) => ({
    markets: enabled ? markets : [],
    isLoading: false,
  }));
});
afterEach(() => {
  act(() => root?.unmount());
  root = undefined;
});

describe("built-in Markets Prediction", () => {
  it("adds Prediction after Crypto and routes the exact round symbol", () => {
    mount();
    const props = pageProps();
    expect(
      props.tabs?.map((tab) => ("type" in tab ? tab.type : tab.id)),
    ).toEqual(["favorites", "crypto", "prediction", "rwa"]);
    expect(mocks.markets).toHaveBeenLastCalledWith({ enabled: true });
    const content = panel(
      props.renderTabContent!(predictionTab, "prediction", vi.fn()),
    );
    content.onPredictionSelect("BTC round/1");
    expect(mocks.navigate).toHaveBeenCalledWith({
      href: "/prediction/BTC%20round%2F1",
      name: "prediction",
    });
  });

  it.each(["disabled", "no navigation"])(
    "does not enable resources with %s",
    (reason) => {
      if (reason === "no navigation") mocks.onRouteChange = undefined;
      mount(reason === "disabled" ? { predictionEnabled: false } : {});
      expect(mocks.markets).toHaveBeenLastCalledWith({ enabled: false });
      expect(pageProps().tabs).toBeUndefined();
      expect(
        pageProps().renderTabContent!(predictionTab, "prediction", vi.fn()),
      ).toBeUndefined();
      expect(pageProps().renderTabAfterContent).toBeUndefined();
    },
  );

  it("uses a custom selection callback without application navigation", () => {
    mocks.onRouteChange = undefined;
    const onPredictionSelect = vi.fn();
    mount({ onPredictionSelect });
    const content = panel(
      pageProps().renderTabContent!(predictionTab, "prediction", vi.fn()),
    );
    content.onPredictionSelect("round");
    expect(onPredictionSelect).toHaveBeenCalledWith("round");
    expect(mocks.navigate).not.toHaveBeenCalled();
  });

  it("preserves supplied tabs exactly and removes duplicate Prediction defaults", () => {
    mocks.tabs = [{ type: "crypto" }, predictionTab, predictionTab];
    mount();
    expect(
      pageProps().tabs?.filter((tab) => "id" in tab && tab.id === "prediction"),
    ).toHaveLength(1);
    const tabs: MarketTabConfig[] = [{ type: "all" }];
    act(() => root!.update(<MarketsHomePage tabs={tabs} />));
    expect(pageProps().tabs).toBe(tabs);
  });

  it("falls back only for undefined custom content and honours null", () => {
    const custom = <div data-testid="custom" />;
    const renderTabContent = vi.fn().mockReturnValue(custom);
    mount({ renderTabContent });
    const render = pageProps().renderTabContent!;
    expect(render(predictionTab, "prediction", vi.fn())).toBe(custom);
    renderTabContent.mockReturnValue(null);
    expect(render(predictionTab, "prediction", vi.fn())).toBeNull();
    renderTabContent.mockReturnValue(undefined);
    expect(panel(render(predictionTab, "prediction", vi.fn())).markets).toEqual(
      markets,
    );
    expect(
      render(
        { id: "custom", name: "Custom", match: () => true },
        "custom",
        vi.fn(),
      ),
    ).toBeUndefined();
  });

  it("appends only starred families and updates when a favorite is removed", () => {
    mocks.favorites = [markets[0].id];
    mount();
    const favoritesTab: MarketTabConfig = { type: "favorites" };
    const content = panel(
      pageProps().renderTabAfterContent!(favoritesTab, "favorites", vi.fn()),
    );
    expect(content.markets).toEqual([markets[0]]);
    expect(content.onToggleFavorite).toBe(mocks.toggleFavorite);
    mocks.favorites = [];
    act(() => root!.update(<MarketsHomePage />));
    expect(
      pageProps().renderTabAfterContent!(favoritesTab, "favorites", vi.fn()),
    ).toBeNull();
  });

  it("preserves an externally supplied after-content renderer", () => {
    const renderTabAfterContent = vi.fn(() => null);
    mount({ renderTabAfterContent });
    expect(pageProps().renderTabAfterContent).toBe(renderTabAfterContent);
  });
});

it.each([
  [undefined, markets],
  ["", markets],
  ["  5m  ", markets],
  ["btc 5m up/down", [markets[0]]],
  ["perp_btc5m_usdc", [markets[0]]],
  ["perp_eth_usdc", [markets[1]]],
  ["nonexistent", []],
])("filters All Prediction markets for %s", (searchValue, expected) => {
  mount();
  const content = pageProps().renderTabAfterContent!(
    { type: "all" },
    "all",
    vi.fn(),
    { searchValue },
  );
  if (!expected.length) {
    expect(content).toBeNull();
  } else {
    expect(panel(content).markets).toEqual(expected);
    expect(panel(content).onToggleFavorite).toBe(mocks.toggleFavorite);
  }
});

it("preserves All selection routing and the host close callback", () => {
  mount();
  const hide = vi.fn();
  const content = panel(
    pageProps().renderTabAfterContent!({ type: "all" }, "all", hide),
  );
  expect(content.hide).toBe(hide);
  content.onPredictionSelect("BTC round/1");
  expect(mocks.navigate).toHaveBeenCalledWith({
    href: "/prediction/BTC%20round%2F1",
    name: "prediction",
  });
});

it("does not append Prediction to other categories or unmatched favorites", () => {
  mocks.favorites = [markets[0].id];
  mount();
  const render = pageProps().renderTabAfterContent!;
  for (const type of [
    "crypto",
    "rwa",
    "recent",
    "newListing",
    "preTge",
    "community",
  ] as const) {
    expect(render({ type }, type, vi.fn())).toBeNull();
  }
  expect(
    render({ type: "favorites" }, "favorites", vi.fn(), { searchValue: "ETH" }),
  ).toBeNull();
});
