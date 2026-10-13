import React, { isValidElement, type ReactElement } from "react";
import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { PredictionMarketPanelWidget } from "@orderly.network/prediction/src/prediction/predictionMarketPanel.ui";
import { usePredictionMarketsDropdown } from "@orderly.network/prediction/src/prediction/usePredictionMarketsDropdown";
import {
  usePredictionTradingExtension,
  type PredictionTradingExtensionOptions,
  type PredictionTradingExtensionProps,
} from "@orderly.network/prediction/src/prediction/usePredictionTradingExtension";

const mocks = vi.hoisted(() => ({
  account: vi.fn(),
  counts: vi.fn(),
  markets: vi.fn(),
  saveMarket: vi.fn(),
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
    usePredictionMarketTabs: (key = "dropDownMarkets") => [
      { id: `tabs-${key}` },
    ],
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
let result: PredictionTradingExtensionProps;
const options: PredictionTradingExtensionOptions = {
  symbol: "PERP_BTC_USDC",
  showAllSymbol: false,
  onPredictionSelect: vi.fn(),
};
function Consumer(props: PredictionTradingExtensionOptions) {
  result = usePredictionTradingExtension(props);
  return null;
}
function mount(props = options) {
  act(() => {
    root = create(<Consumer {...props} />);
  });
}
function element(node: React.ReactNode): ReactElement<Record<string, unknown>> {
  expect(isValidElement(node)).toBe(true);
  return node as ReactElement<Record<string, unknown>>;
}
function allSlots() {
  const content = result.dataListProductContent!;
  const nativeContent = <div>Native positions</div>;
  if (
    typeof content.positions !== "function" ||
    typeof content.mobile?.positions !== "function"
  ) {
    throw new Error("Positions must wrap native content");
  }
  return {
    nativeContent,
    slots: [
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
  mocks.account.mockReturnValue(mocks.state);
  mocks.counts.mockReturnValue(mocks.countState);
  mocks.markets.mockReturnValue({ markets: [], isLoading: true });
  mocks.countState.pending = null;
});
afterEach(() => {
  act(() => root?.unmount());
  root = undefined;
});

it("assembles all desktop/mobile slots and preserves native positions and incomplete counts", () => {
  mount();
  expect(mocks.account).toHaveBeenLastCalledWith({ enabled: true });
  expect(result.dataListProductContent?.counts).toBe(mocks.countState);
  expect(result.dataListProductContent?.counts?.pending).toBeNull();
  const { nativeContent, slots } = allSlots();
  expect(
    slots.map((slot) => slot.props.mode ?? slot.props.type ?? "history"),
  ).toEqual([
    "positions",
    "pending",
    "filled",
    "positionHistory",
    "history",
    "positions",
    "pending",
    "history",
  ]);
  for (const slot of slots) {
    // Panels receive the account state extended with round navigation
    // (OR-7482: row symbol clicks route through onPredictionSelect).
    expect(slot.props.state).toEqual({
      ...mocks.state,
      onSelectRoundSymbol: options.onPredictionSelect,
    });
    expect(slot.props.perpsSymbol).toBe(options.symbol);
    expect(slot.props.predictionUnderlyingSymbol).toBe(options.symbol);
  }
  for (const index of [0, 3, 5, 7]) {
    expect(slots[index].props.initialProduct).toBe("perps");
  }
  expect(slots[0].props.perpsPositionsContent).toBe(nativeContent);
  expect(slots[5].props.perpsPositionsContent).toBe(nativeContent);
  expect(slots[5].props.mobile).toBe(true);
});

it("updates every slot and the counts scope together on symbol and preference changes", () => {
  mount();
  for (const props of [
    { ...options, symbol: "PERP_ETH_USDC" },
    { ...options, symbol: "PERP_ETH_USDC", showAllSymbol: true },
    options,
  ]) {
    act(() => root!.update(<Consumer {...props} />));
    const scope = props.showAllSymbol ? undefined : props.symbol;
    expect(mocks.counts).toHaveBeenLastCalledWith({
      product: "all",
      perpsSymbol: scope,
      predictionUnderlyingSymbol: scope,
      enabled: true,
    });
    for (const slot of allSlots().slots) {
      expect(slot.props.perpsSymbol).toBe(scope);
      expect(slot.props.predictionUnderlyingSymbol).toBe(scope);
    }
  }
});

it("disables each resource consumer, removes extensions, and supports re-enabling", () => {
  mount();
  act(() => root!.update(<Consumer {...options} enabled={false} />));
  expect(result).toEqual({});
  expect(mocks.account).toHaveBeenLastCalledWith({ enabled: false });
  expect(mocks.counts.mock.calls.at(-1)?.[0].enabled).toBe(false);
  expect(mocks.markets).toHaveBeenLastCalledWith({ enabled: false });
  act(() => root!.update(<Consumer {...options} />));
  expect(result.dataListProductContent).toBeDefined();
  expect(mocks.markets).toHaveBeenLastCalledWith({ enabled: true });
});

it.each([
  [true, true],
  [true, false],
  [false, true],
  [false, false],
])(
  "independently enables markets=%s and account panels=%s, subject to the master switch",
  (marketsEnabled, accountPanelsEnabled) => {
    mount();
    for (const enabled of [true, false, true]) {
      act(() =>
        root!.update(
          <Consumer
            {...options}
            enabled={enabled}
            marketsEnabled={marketsEnabled}
            accountPanelsEnabled={accountPanelsEnabled}
          />,
        ),
      );
      expect(mocks.markets).toHaveBeenLastCalledWith({
        enabled: enabled && marketsEnabled,
      });
      expect(mocks.account).toHaveBeenLastCalledWith({
        enabled: enabled && accountPanelsEnabled,
      });
      expect(mocks.counts.mock.calls.at(-1)?.[0].enabled).toBe(
        enabled && accountPanelsEnabled,
      );
      expect(Object.hasOwn(result, "marketsDropdown")).toBe(
        enabled && marketsEnabled,
      );
      expect(Object.hasOwn(result, "marketsSheet")).toBe(
        enabled && marketsEnabled,
      );
      expect(Object.hasOwn(result, "sideMarkets")).toBe(
        enabled && marketsEnabled,
      );
      expect(Object.hasOwn(result, "dataListProductContent")).toBe(
        enabled && accountPanelsEnabled,
      );
      if (!enabled || (!marketsEnabled && !accountPanelsEnabled)) {
        expect(result).toEqual({});
      }
    }
  },
);

it("reports selection to the host without persisting it and dismisses the dropdown", () => {
  mount();
  const hide = vi.fn();
  const bridge = element(
    result.marketsDropdown!.renderTabContent!(
      { id: "prediction", name: "Prediction", match: () => false },
      "prediction",
      hide,
    ),
  );
  // The dropdown routes through the bridge component; select from the panel
  // it renders so the hide + report chain stays covered end to end.
  let bridgeRoot: ReactTestRenderer | undefined;
  act(() => {
    bridgeRoot = create(bridge);
  });
  const select = bridgeRoot!.root.findByType(PredictionMarketPanelWidget).props
    .onSelect as (id: string) => void;
  select("PERP_BTC5M2609291035_USDC");
  expect(mocks.saveMarket).not.toHaveBeenCalled();
  expect(hide).toHaveBeenCalledOnce();
  expect(options.onPredictionSelect).toHaveBeenCalledWith(
    "PERP_BTC5M2609291035_USDC",
  );
});

it("exposes sheet and side-panel slots that reuse the dropdown renderers with their own tabs", () => {
  mount();
  expect(result.marketsSheet).toBeDefined();
  expect(result.sideMarkets).toBeDefined();
  // One data pipeline: the renderers are shared identities across surfaces.
  expect(result.marketsSheet!.renderTabContent).toBe(
    result.marketsDropdown!.renderTabContent,
  );
  expect(result.marketsSheet!.renderTabAfterContent).toBe(
    result.marketsDropdown!.renderTabAfterContent,
  );
  expect(result.sideMarkets!.renderTabContent).toBe(
    result.marketsDropdown!.renderTabContent,
  );
  expect(result.sideMarkets!.renderTabAfterContent).toBe(
    result.marketsDropdown!.renderTabAfterContent,
  );
  // Tabs are derived per surface's default category set.
  expect(result.marketsDropdown!.tabs).toEqual([
    { id: "tabs-dropDownMarkets" },
  ]);
  expect(result.marketsSheet!.tabs).toEqual([{ id: "tabs-marketsSheet" }]);
  expect(result.sideMarkets!.tabs).toEqual([{ id: "tabs-expandMarkets" }]);
});

it("keeps zero-argument and callback-only market dropdown consumers compatible", () => {
  function LegacyConsumer() {
    usePredictionMarketsDropdown();
    usePredictionMarketsDropdown(options.onPredictionSelect);
    return null;
  }
  act(() => {
    root = create(<LegacyConsumer />);
  });
  expect(mocks.markets.mock.calls).toEqual([[{}], [{}]]);
});
