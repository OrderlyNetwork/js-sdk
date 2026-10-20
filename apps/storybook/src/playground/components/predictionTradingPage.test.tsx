import React, { isValidElement, type ReactElement } from "react";
import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { PredictionMarketPanelWidget } from "@orderly.network/prediction/src/prediction/predictionMarketPanel.ui";
import { TradingPage as NextTradingPage } from "@orderly.network/trading-next/src/pages/trading/trading.page";
import { useTradingPageContext as useNextTradingPageContext } from "@orderly.network/trading-next/src/provider/tradingPageContext";
import { TradingPageProvider as NextTradingPageProvider } from "@orderly.network/trading-next/src/provider/tradingPageProvider";
import type { TradingPageState as NextTradingPageState } from "@orderly.network/trading-next/src/types/types";
import type { TradingPageProps } from "@orderly.network/trading-shared";
import { TradingPage } from "@orderly.network/trading/src/pages/trading/trading.page";
import { useTradingPageContext } from "@orderly.network/trading/src/provider/tradingPageContext";
import { TradingPageProvider } from "@orderly.network/trading/src/provider/tradingPageProvider";
import type { TradingPageState } from "@orderly.network/trading/src/types/types";

const mocks = vi.hoisted(() => ({
  featureEnabled: true,
  pageState: {} as TradingPageState,
  nextState: {} as NextTradingPageState,
  account: vi.fn(),
  counts: vi.fn(),
  markets: vi.fn(),
  saveMarket: vi.fn(),
  onRouteChange: vi.fn(),
  routeAvailable: true,
  preferences: { showAllSymbol: false, pnlNotionalDecimalPrecision: 4 },
  state: {
    accountReady: false,
    positionsLoading: true,
    ordersLoading: true,
    positions: [],
    openOrders: [],
    pendingOrdersComplete: false,
  },
  countState: { positions: 0, pending: null as number | null },
}));
vi.mock("@orderly.network/trading/src/hooks/useTradingLocalStorage", () => ({
  useTradingLocalStorage: () => mocks.preferences,
}));
vi.mock("@orderly.network/react-app", () => ({
  useFeatureEnabled: () => mocks.featureEnabled,
  useAppContext: () => ({
    onRouteChange: mocks.routeAvailable ? mocks.onRouteChange : undefined,
  }),
}));

vi.mock(
  "@orderly.network/trading/src/pages/trading/trading.widget",
  async () => {
    const { useTradingPageContext } =
      await import("@orderly.network/trading/src/provider/tradingPageContext");
    return {
      TradingWidget: () => {
        mocks.pageState = useTradingPageContext();
        return null;
      },
    };
  },
);

vi.mock(
  "@orderly.network/trading-next/src/pages/trading/trading.widget",
  async () => {
    const { useTradingPageContext } =
      await import("@orderly.network/trading-next/src/provider/tradingPageContext");
    return {
      TradingWidget: () => {
        mocks.nextState = useTradingPageContext();
        return null;
      },
    };
  },
);

vi.mock("@orderly.network/ui", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@orderly.network/ui")>()),
  injectable: (component: React.ComponentType) => component,
}));
vi.mock("@orderly.network/prediction", async () => ({
  usePredictionAccountData: (
    await import("@orderly.network/prediction/src/prediction/hooks/usePredictionAccountData")
  ).usePredictionAccountData,
  useSharedProductCounts: (
    await import("@orderly.network/prediction/src/prediction/dataPanels/useSharedProductCounts")
  ).useSharedProductCounts,
  usePredictionMarketsDropdown: (
    await import("@orderly.network/prediction/src/prediction/usePredictionMarketsDropdown")
  ).usePredictionMarketsDropdown,
  usePredictionMarketTabs: (
    await import("@orderly.network/prediction/src/prediction/predictionMarketPanel.ui")
  ).usePredictionMarketTabs,
  SharedProductDataPanel: (
    await import("@orderly.network/prediction/src/prediction/dataPanels/sharedProductDataPanel.ui")
  ).SharedProductDataPanel,
  SharedProductOrdersPanel: (
    await import("@orderly.network/prediction/src/prediction/dataPanels/sharedProductOrdersPanel.ui")
  ).SharedProductOrdersPanel,
  MobileSharedProductOrdersPanel: (
    await import("@orderly.network/prediction/src/prediction/dataPanels/sharedProductOrdersPanel.mobile.ui")
  ).MobileSharedProductOrdersPanel,
  MobileSharedProductHistory: (
    await import("@orderly.network/prediction/src/prediction/dataPanels/sharedProductHistory.mobile.ui")
  ).MobileSharedProductHistory,
}));

vi.mock(
  "@orderly.network/prediction/src/prediction/hooks/usePredictionAccountData",
  () => ({ usePredictionAccountData: mocks.account }),
);
vi.mock(
  "@orderly.network/prediction/src/prediction/dataPanels/useSharedProductCounts",
  () => ({ useSharedProductCounts: mocks.counts }),
);
vi.mock(
  "@orderly.network/prediction/src/prediction/hooks/usePredictionMarkets",
  () => ({ usePredictionMarkets: mocks.markets }),
);
vi.mock("@orderly.network/hooks", () => ({
  useLocalStorage: () => [null, mocks.saveMarket],
  useSymbolsInfo: () => new Proxy({}, { get: () => () => 0 }),
}));
vi.mock(
  "@orderly.network/prediction/src/prediction/predictionFavorites",
  () => ({
    usePredictionFavorites: () => ({
      favoriteMarketIds: [],
      toggleFavorite: vi.fn(),
    }),
  }),
);
vi.mock(
  "@orderly.network/prediction/src/prediction/predictionMarketPanel.ui",
  () => ({
    usePredictionMarketTabs: () => [],
    PredictionMarketPanelWidget: () => null,
  }),
);
vi.mock(
  "@orderly.network/prediction/src/prediction/dataPanels/sharedProductDataPanel.ui",
  () => ({ SharedProductDataPanel: () => null }),
);
vi.mock(
  "@orderly.network/prediction/src/prediction/dataPanels/sharedProductOrdersPanel.ui",
  () => ({ SharedProductOrdersPanel: () => null }),
);
vi.mock(
  "@orderly.network/prediction/src/prediction/dataPanels/sharedProductOrdersPanel.mobile.ui",
  () => ({ MobileSharedProductOrdersPanel: () => null }),
);
vi.mock(
  "@orderly.network/prediction/src/prediction/dataPanels/sharedProductHistory.mobile.ui",
  () => ({ MobileSharedProductHistory: () => null }),
);

let root: ReactTestRenderer | undefined;
const props: TradingPageProps = {
  symbol: "PERP_BTC_USDC",
  tradingViewConfig: {
    scriptSRC: "/tradingview/charting_library.js",
    library_path: "/tradingview/",
  },
  onSymbolChange: vi.fn(),
  sharePnLConfig: { backgroundImages: ["https://example.com/pnl.png"] },
  referral: { saveRefCode: true },
  bottomSheetLeading: "Account",
};
function mount(pageProps = props) {
  act(() => {
    root = create(<TradingPage {...pageProps} />);
  });
}
function pageProps() {
  return mocks.pageState as import("@orderly.network/trading/src/types/types").TradingPageState;
}
function element(node: React.ReactNode): ReactElement<Record<string, unknown>> {
  expect(isValidElement(node)).toBe(true);
  return node as ReactElement<Record<string, unknown>>;
}
function slots() {
  const content = pageProps().dataListProductContent!;
  const nativeContent = <div>Native positions</div>;
  if (
    typeof content.positions !== "function" ||
    typeof content.mobile?.positions !== "function"
  ) {
    throw new Error("Positions must wrap native content");
  }
  return {
    nativeContent,
    panels: [
      element(content.positions(nativeContent)),
      element(content.pending),
      element(content.filled),
      element(content.positionHistory),
      element(content.orderHistory),
      element(content.mobile.positions(nativeContent)),
      element(content.mobile.pending),
      element(content.mobile.history),
    ],
  };
}
beforeEach(() => {
  vi.clearAllMocks();
  mocks.featureEnabled = true;
  mocks.routeAvailable = true;
  mocks.preferences.showAllSymbol = false;
  mocks.preferences.pnlNotionalDecimalPrecision = 4;
  mocks.account.mockReturnValue(mocks.state);
  mocks.counts.mockReturnValue(mocks.countState);
  mocks.markets.mockReturnValue({ markets: [], isLoading: true });
});
afterEach(() => {
  act(() => root?.unmount());
  root = undefined;
});

it("automatically adds desktop/mobile panels and forwards host configuration", () => {
  mount();
  const page = pageProps();
  for (const key of [
    "symbol",
    "tradingViewConfig",
    "sharePnLConfig",
    "referral",
    "bottomSheetLeading",
  ] as const) {
    expect(page[key]).toBe(props[key]);
  }
  expect(page).not.toHaveProperty("onPredictionSelect");
  expect(page).not.toHaveProperty("predictionEnabled");
  expect(mocks.account).toHaveBeenLastCalledWith({ enabled: true });
  expect(mocks.markets).toHaveBeenLastCalledWith({ enabled: true });
  expect(page.dataListProductContent?.counts).toBe(mocks.countState);
  const { nativeContent, panels } = slots();
  expect(panels).toHaveLength(8);
  for (const panel of panels) {
    expect(panel.props).toMatchObject({
      state: mocks.state,
      onSymbolChange: pageProps().onSymbolChange,
      sharePnLConfig: props.sharePnLConfig,
      pnlNotionalDecimalPrecision: 4,
    });
  }
  expect(panels[0].props.perpsPositionsContent).toBe(nativeContent);
  expect(panels[5].props.perpsPositionsContent).toBe(nativeContent);
});

it("keeps all panel and count scopes in sync with symbol and preference changes", () => {
  mount();
  for (const [symbol, showAllSymbol] of [
    ["PERP_ETH_USDC", false],
    ["PERP_ETH_USDC", true],
    ["PERP_BTC_USDC", false],
  ] as const) {
    mocks.preferences.showAllSymbol = showAllSymbol;
    mocks.preferences.pnlNotionalDecimalPrecision = 6;
    act(() => root!.update(<TradingPage {...props} symbol={symbol} />));
    const scope = showAllSymbol ? undefined : symbol;
    expect(pageProps().symbol).toBe(symbol);
    expect(mocks.counts).toHaveBeenLastCalledWith({
      product: "all",
      perpsSymbol: scope,
      predictionUnderlyingSymbol: scope,
      enabled: true,
    });
    for (const panel of slots().panels) {
      expect(panel.props.perpsSymbol).toBe(scope);
      expect(panel.props.predictionUnderlyingSymbol).toBe(scope);
      expect(panel.props.pnlNotionalDecimalPrecision).toBe(6);
    }
  }
});

it("starts disabled and supports dynamic enable, disable, and re-enable", () => {
  mocks.featureEnabled = false;
  mount();
  for (const enabled of [false, true, false, true]) {
    mocks.featureEnabled = enabled;
    act(() => root!.update(<TradingPage {...props} />));
    expect(mocks.account).toHaveBeenLastCalledWith({ enabled });
    expect(mocks.markets).toHaveBeenLastCalledWith({ enabled });
    expect(mocks.counts.mock.calls.at(-1)?.[0].enabled).toBe(enabled);
    const page = pageProps();
    if (enabled) {
      expect(page.marketsDropdown).toBeDefined();
      expect(page.dataListProductContent?.mobile).toBeDefined();
    } else {
      expect(page.marketsDropdown).toBeUndefined();
      expect(page.dataListProductContent).toBeUndefined();
    }
    expect(page.symbol).toBe(props.symbol);
    expect(page.onSymbolChange).toBeTypeOf("function");
    expect(page).not.toHaveProperty("predictionEnabled");
  }
});

it("routes Prediction selection through the current app callback with an encoded market ID", () => {
  mount();
  const hide = vi.fn();
  const bridge = element(
    pageProps().marketsDropdown!.renderTabContent!(
      { id: "prediction", name: "Prediction", match: () => false },
      "prediction",
      hide,
    ),
  );
  // The dropdown routes through the bridge component; select from the panel
  // it renders so the hide + routing chain stays covered end to end.
  let bridgeRoot: ReactTestRenderer | undefined;
  act(() => {
    bridgeRoot = create(bridge);
  });
  const panel = bridgeRoot!.root.findByType(PredictionMarketPanelWidget);
  (panel.props.onSelect as (marketId: string) => void)("BTC/5M?round=1");
  expect(mocks.onRouteChange).toHaveBeenCalledWith({
    href: "/prediction/BTC%2F5M%3Fround%3D1",
    name: "prediction",
  });
  expect(props.onSymbolChange).not.toHaveBeenCalled();
  expect(mocks.saveMarket).not.toHaveBeenCalled();
  expect(hide).toHaveBeenCalledOnce();
});

it("uses the host callback for Perp selection without also routing", () => {
  mount();
  pageProps().onSymbolChange?.({ symbol: "PERP_ETH_USDC" } as never);
  expect(props.onSymbolChange).toHaveBeenCalledWith({
    symbol: "PERP_ETH_USDC",
  });
  expect(mocks.onRouteChange).not.toHaveBeenCalled();
  pageProps().onSymbolChange?.({ symbol: props.symbol } as never);
  expect(props.onSymbolChange).toHaveBeenCalledOnce();
});

it("routes Perp selection by default, encodes symbols, and ignores the selected symbol", () => {
  mount({ ...props, onSymbolChange: undefined });
  pageProps().onSymbolChange?.({ symbol: props.symbol } as never);
  expect(mocks.onRouteChange).not.toHaveBeenCalled();
  pageProps().onSymbolChange?.({ symbol: "PERP/ETH?USDC" } as never);
  expect(mocks.onRouteChange).toHaveBeenCalledWith({
    href: "/perp/PERP%2FETH%3FUSDC",
    name: "perps",
  });
  for (const panel of slots().panels) {
    expect(panel.props.onSymbolChange).toBe(pageProps().onSymbolChange);
  }
});

it("disables Perp selection when neither a callback nor router is configured", () => {
  mocks.routeAvailable = false;
  mount({ ...props, onSymbolChange: undefined });
  expect(pageProps().onSymbolChange).toBeUndefined();
});

it("keeps account panels but omits the automatic market dropdown without a router", () => {
  mocks.routeAvailable = false;
  mount();
  expect(pageProps().marketsDropdown).toBeUndefined();
  expect(pageProps().dataListProductContent?.mobile).toBeDefined();
  expect(mocks.account).toHaveBeenLastCalledWith({ enabled: true });
  expect(mocks.markets).toHaveBeenLastCalledWith({ enabled: false });
  mocks.routeAvailable = true;
  act(() => root!.update(<TradingPage {...props} />));
  expect(pageProps().marketsDropdown).toBeDefined();
  expect(mocks.markets).toHaveBeenLastCalledWith({ enabled: true });
});

function TradingStateReader() {
  mocks.pageState = useTradingPageContext();
  return null;
}
function NextStateReader() {
  mocks.nextState = useNextTradingPageContext();
  return null;
}

const marketSurfaces = [
  "marketsDropdown",
  "marketsSheet",
  "sideMarkets",
] as const;
describe.each([
  ["trading", TradingPage, TradingPageProvider, () => mocks.pageState],
  [
    "trading-next",
    NextTradingPage,
    NextTradingPageProvider,
    () => mocks.nextState,
  ],
] as const)(
  "%s automatic integration",
  (packageName, Page, Provider, readState) => {
    it("routes every market surface to the exact Prediction contract", () => {
      act(() => {
        root = create(<Page {...props} />);
      });
      const state = readState();
      for (const surface of marketSurfaces) {
        const hide = vi.fn();
        let panelRoot!: ReactTestRenderer;
        act(() => {
          panelRoot = create(
            element(
              state[surface]!.renderTabContent!(
                { id: "prediction", name: "Prediction", match: () => false },
                "prediction",
                hide,
              ),
            ),
          );
        });
        try {
          panelRoot.root
            .findByType(PredictionMarketPanelWidget)
            .props.onSelect("BTC/round");
          expect(hide).toHaveBeenCalledOnce();
          expect(mocks.onRouteChange).toHaveBeenLastCalledWith({
            href: "/prediction/BTC%2Fround",
            name: "prediction",
          });
        } finally {
          act(() => panelRoot.unmount());
        }
      }
    });

    it.each(["disabled", "no router"])(
      "omits all market surfaces with %s",
      (reason) => {
        mocks.featureEnabled = reason !== "disabled";
        mocks.routeAvailable = reason !== "no router";
        act(() => {
          root = create(<Page {...props} />);
        });
        for (const surface of marketSurfaces)
          expect(readState()[surface]).toBeUndefined();
        expect(mocks.markets).toHaveBeenLastCalledWith({ enabled: false });
      },
    );

    it("the public provider also builds the default integration without page-only inputs", () => {
      act(() => {
        root = create(
          <Provider {...props}>
            {packageName === "trading" ? (
              <TradingStateReader />
            ) : (
              <NextStateReader />
            )}
          </Provider>,
        );
      });
      expect(mocks.markets).toHaveBeenLastCalledWith({ enabled: true });
      for (const surface of marketSurfaces)
        expect(readState()[surface]?.renderTabContent).toBeTypeOf("function");
      if (packageName === "trading")
        expect(mocks.pageState.dataListProductContent?.mobile).toBeDefined();
    });

    it("does not accept removed runtime overrides", () => {
      const removed = {
        marketsDropdown: {},
        marketsSheet: {},
        sideMarkets: {},
        dataListProductContent: {},
      };
      act(() => {
        root = create(<Page {...props} {...removed} />);
      });
      for (const surface of marketSurfaces)
        expect(readState()[surface]).not.toBe(removed[surface]);
      if (packageName === "trading")
        expect(mocks.pageState.dataListProductContent).not.toBe(
          removed.dataListProductContent,
        );
      mocks.featureEnabled = false;
      act(() => root!.update(<Page {...props} {...removed} />));
      for (const surface of marketSurfaces)
        expect(readState()[surface]).toBeUndefined();
      if (packageName === "trading")
        expect(mocks.pageState.dataListProductContent).toBeUndefined();
    });
  },
);
