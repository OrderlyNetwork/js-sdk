import React, { type ReactElement } from "react";
import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { afterEach, expect, it, vi } from "vitest";
import {
  PredictionOrderSymbol,
  RoundSymbol,
} from "@orderly.network/prediction/src/prediction/cells/cells.ui";
import { PredictionHistoryTable } from "@orderly.network/prediction/src/prediction/dataPanels/history/predictionHistoryTable.widget";
import { HoldingsTableUI } from "@orderly.network/prediction/src/prediction/dataPanels/holdings/holdingsTable.ui";
import { PredictionOrderCell } from "@orderly.network/prediction/src/prediction/dataPanels/orders/predictionOrderCell.ui";
import { PredictionAccountPanel } from "@orderly.network/prediction/src/prediction/dataPanels/predictionAccountPanel.widget";
import { MobilePredictionHistory } from "@orderly.network/prediction/src/prediction/dataPanels/predictionMobileCards.ui";
import * as tableModule from "@orderly.network/prediction/src/prediction/dataPanels/table";
import {
  usePredictionIntegration,
  type PredictionIntegrationOptions,
} from "@orderly.network/trading/src/hooks/usePredictionIntegration";
import type { PredictionIntegrationState } from "@orderly.network/trading/src/types/predictionIntegration";
import type { API } from "@orderly.network/types";

// OR-7482: data-panel row symbols navigate to their round contract, with the
// same clickable scope as the Perps panels (positions, orders, history).

// Stable identities (real i18next caches t; unstable mocks would bust the
// history table's row memo every render and hide stale-closure bugs).
const stableI18n = vi.hoisted(() => {
  const t = (key: string) => key;
  return { t };
});
vi.mock("@orderly.network/i18n", () => ({
  useTranslation: () => ({ t: stableI18n.t }),
  i18n: { t: stableI18n.t },
}));
vi.mock("@orderly.network/ui", async () => {
  const { parseNumber } =
    await import("@orderly.network/ui/src/typography/utils");
  const { createElement, Fragment } = await import("react");
  const wrapper = ({ children }: { children?: React.ReactNode }) =>
    createElement(Fragment, null, children);
  const Text: any = (props: any) =>
    createElement("span", null, props?.children);
  Text.numeral = () => null;
  Text.pnl = () => null;
  Text.symbolBadge = () => null;
  return {
    parseNumber,
    Badge: (props: any) => createElement("span", null, props?.children),
    Button: (props: any) =>
      createElement("button", { disabled: props?.disabled }, props?.children),
    Divider: () => null,
    EmptyDataState: () => null,
    Input: () => null,
    PopoverRoot: wrapper,
    PopoverTrigger: wrapper,
    PopoverContent: wrapper,
    Text,
    cn: (...classes: unknown[]) => classes.filter(Boolean).join(" "),
  };
});
vi.mock("@orderly.network/ui-connector", () => ({
  useAuthGuard: () => true,
  AuthGuardEmpty: () => null,
}));
const stableFormatters = vi.hoisted(() => ({
  formatRoundBadge: (round: number) => `round-${round}`,
  formatTableTime: (ms: number) => String(ms),
}));
vi.mock(
  "@orderly.network/prediction/src/prediction/predictionShared",
  async (importOriginal) => ({
    ...(await importOriginal<object>()),
    formatCountdown: () => "--",
    usePredictionFormatters: () => stableFormatters,
  }),
);
vi.mock(
  "@orderly.network/prediction/src/prediction/hooks/usePredictionAccountData",
  () => ({ usePredictionAccountData: () => ({}) }),
);
vi.mock(
  "@orderly.network/prediction/src/prediction/hooks/useRoundCountdown",
  () => ({
    useRoundCountdown: () => 0,
  }),
);
vi.mock(
  "@orderly.network/prediction/src/prediction/orderEntry/sellPosition",
  () => ({ SellPosition: () => null }),
);
vi.mock(
  "@orderly.network/prediction/src/prediction/dataPanels/filters/predictionFilters.ui",
  () => ({ PredictionFilters: () => null }),
);
vi.mock("@orderly.network/prediction/src/prediction/dataPanels/table", () => ({
  PredictionDataTable: () => null,
  tableColumn: (title: unknown, width: unknown, opts: object = {}) => ({
    title,
    width,
    ...opts,
  }),
}));
const holdingsRows = vi.hoisted(() => [
  {
    id: "row-with-symbol",
    position: {
      symbol: "PERP_BTC5M2601011200_USDC",
      round: 1767278400,
      outcome: "up",
      quantity: 10,
      averagePrice: 0.4,
    },
    isSelectedRound: false,
    lastPrice: 0.5,
    uPnL: 1.2,
    availableQuantity: 10,
  },
  {
    id: "row-without-symbol",
    position: {
      round: 1767278400,
      outcome: "down",
      quantity: 5,
      averagePrice: 0.6,
    },
    isSelectedRound: false,
    lastPrice: 0.5,
    uPnL: -0.2,
    availableQuantity: 5,
  },
]);
vi.mock(
  "@orderly.network/prediction/src/prediction/dataPanels/holdings/holdingsTable.script",
  () => ({
    useHoldingsTableScript: () => ({ filters: {} }),
    useHoldingsPositionRows: () => holdingsRows,
  }),
);
const historyRecords = vi.hoisted(() => [
  {
    recordKey: "history-1",
    symbol: "PERP_BTC5M2601011200_USDC",
    round: 1767278400,
    outcome: "up",
    quantity: 10,
    averagePrice: 0.4,
    settlementPrice: 0.55,
    result: "up",
    pnl: 1.5,
    settledAt: 1767282000000,
  },
]);
vi.mock(
  "@orderly.network/prediction/src/prediction/dataPanels/history/predictionHistoryTable.script",
  () => ({
    usePredictionHistoryTableScript: () => ({
      filters: {},
      historyState: { displayRecords: historyRecords },
    }),
  }),
);
const panelMocks = vi.hoisted(() => ({ dataPanel: vi.fn() }));
vi.mock(
  "@orderly.network/prediction/src/prediction/dataPanels/predictionDataPanel.ui",
  () => ({
    PredictionDataPanel: (props: unknown) => {
      panelMocks.dataPanel(props);
      return null;
    },
  }),
);
// Trading-page extension graph: panels are stubbed because the slots carry the
// injected state as element props, which need no mounting to assert.
vi.mock(
  "@orderly.network/prediction/src/prediction/dataPanels/useSharedProductCounts",
  () => ({ useSharedProductCounts: () => ({ positions: 0, pending: 0 }) }),
);
vi.mock(
  "@orderly.network/prediction/src/prediction/usePredictionMarketsDropdown",
  () => ({
    usePredictionMarketsDropdown: () => ({
      renderTabContent: () => null,
      renderTabAfterContent: () => null,
    }),
  }),
);
vi.mock(
  "@orderly.network/prediction/src/prediction/predictionMarketPanel.ui",
  () => ({ usePredictionMarketTabs: () => [] }),
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

const symbolA = "PERP_BTC5M2601011200_USDC";
const order = {
  order_id: 7,
  symbol: symbolA,
  side: "BUY",
  type: "LIMIT",
  client_order_id: "client-7",
  order_tag: "tag",
  reduce_only: false,
  price: 0.4,
  quantity: 10,
  total_executed_quantity: 0,
  created_time: 0,
  status: "NEW",
} as API.Order;

let root: ReactTestRenderer | undefined;
function mount(node: React.ReactElement) {
  if (root) act(() => root!.unmount());
  act(() => {
    root = create(node);
  });
  return root!;
}
function clickableNodes(renderer: ReactTestRenderer) {
  // Restrict to host divs; the wrapping function component's own props also
  // carry the handler and would otherwise match the predicate.
  return renderer.root.findAll(
    (node) => node.type === "div" && typeof node.props.onClick === "function",
  );
}

afterEach(() => {
  act(() => root?.unmount());
  root = undefined;
});

it("RoundSymbol becomes clickable with a cursor and stops propagation", () => {
  const onSelectRoundSymbol = vi.fn();
  mount(
    <RoundSymbol
      round={1}
      outcome="up"
      symbol={symbolA}
      onSelectRoundSymbol={onSelectRoundSymbol}
    />,
  );
  const clickable = clickableNodes(root!);
  expect(clickable).toHaveLength(1);
  expect(clickable[0].props.className).toContain("oui-cursor-pointer");
  const stopPropagation = vi.fn();
  act(() => clickable[0].props.onClick({ stopPropagation }));
  expect(onSelectRoundSymbol).toHaveBeenCalledTimes(1);
  expect(onSelectRoundSymbol).toHaveBeenCalledWith(symbolA);
  expect(stopPropagation).toHaveBeenCalledTimes(1);
});

it("RoundSymbol stays plain display without a handler", () => {
  mount(<RoundSymbol round={1} outcome="up" symbol={symbolA} />);
  expect(clickableNodes(root!)).toHaveLength(0);
  expect(
    root!.root.findAll((node) =>
      String(node.props.className ?? "").includes("oui-cursor-pointer"),
    ),
  ).toHaveLength(0);
});

it("RoundSymbol stays plain display without a symbol to open", () => {
  mount(<RoundSymbol round={1} outcome="up" onSelectRoundSymbol={vi.fn()} />);
  expect(clickableNodes(root!)).toHaveLength(0);
});

it("PredictionOrderSymbol becomes clickable with a handler", () => {
  const onSelectRoundSymbol = vi.fn();
  mount(
    <PredictionOrderSymbol
      order={order}
      onSelectRoundSymbol={onSelectRoundSymbol}
    />,
  );
  const clickable = clickableNodes(root!);
  expect(clickable).toHaveLength(1);
  expect(clickable[0].props.className).toContain("oui-cursor-pointer");
  act(() => clickable[0].props.onClick({ stopPropagation: vi.fn() }));
  expect(onSelectRoundSymbol).toHaveBeenCalledWith(symbolA);
});

it("PredictionOrderCell opens the order's round symbol", () => {
  const onSelectRoundSymbol = vi.fn();
  const state = {
    isRegionRestricted: false,
    isOrderTradable: () => true,
    onSelectRoundSymbol,
  };
  mount(
    <PredictionOrderCell state={state as any} order={order} field="symbol" />,
  );
  const clickable = clickableNodes(root!);
  expect(clickable).toHaveLength(1);
  act(() => clickable[0].props.onClick({ stopPropagation: vi.fn() }));
  expect(onSelectRoundSymbol).toHaveBeenCalledWith(symbolA);
});

it("PredictionOrderCell stays plain when navigation is unavailable", () => {
  const state = { isRegionRestricted: false, isOrderTradable: () => true };
  mount(
    <PredictionOrderCell state={state as any} order={order} field="symbol" />,
  );
  expect(clickableNodes(root!)).toHaveLength(0);
});

it("filled order symbols stay clickable, matching Perps order history", () => {
  const filledOrder = {
    ...order,
    order_id: 8,
    status: "FILLED",
  } as typeof order;
  mount(
    <PredictionOrderSymbol order={filledOrder} onSelectRoundSymbol={vi.fn()} />,
  );
  expect(clickableNodes(root!)).toHaveLength(1);
});

it("HoldingsTableUI passes the row navigation to every row's symbol cell", () => {
  const onSelectRoundSymbol = vi.fn();
  mount(
    <HoldingsTableUI
      state={{ onSelectRoundSymbol } as any}
      filters={{} as any}
    />,
  );
  const dataTable = root!.root.findAllByType(
    tableModule.PredictionDataTable,
  )[0];
  const rows: Array<{ cells: Array<ReactElement> }> = dataTable.props.rows;
  expect(rows).toHaveLength(2);
  // The missing-symbol guard lives inside RoundSymbol, so both rows receive
  // the handler and the cell decides clickability.
  for (const row of rows) {
    expect(row.cells[0].props.onSelectRoundSymbol).toBe(onSelectRoundSymbol);
  }
});

it("PredictionHistoryTable passes round navigation to history rows", () => {
  const onSelectRoundSymbol = vi.fn();
  mount(<PredictionHistoryTable state={{ onSelectRoundSymbol } as any} />);
  const dataTable = root!.root.findAllByType(
    tableModule.PredictionDataTable,
  )[0];
  const rows: Array<{ cells: Array<ReactElement> }> = dataTable.props.rows;
  expect(rows).toHaveLength(1);
  expect(rows[0].cells[0].props.onSelectRoundSymbol).toBe(onSelectRoundSymbol);
});

it("mobile history cards navigate from the round symbol", () => {
  const onSelectRoundSymbol = vi.fn();
  mount(<MobilePredictionHistory state={{ onSelectRoundSymbol } as any} />);
  const clickable = clickableNodes(root!);
  expect(clickable).toHaveLength(1);
  act(() => clickable[0].props.onClick({ stopPropagation: vi.fn() }));
  expect(onSelectRoundSymbol).toHaveBeenCalledWith(symbolA);
});

it("history rows re-bind when the navigation handler changes", () => {
  // Round switches swap the prediction page's selectRoundSymbol identity while
  // displayRecords stays memoized; the row cells must not keep the stale one.
  const first = vi.fn();
  const second = vi.fn();
  mount(
    <PredictionHistoryTable state={{ onSelectRoundSymbol: first } as any} />,
  );
  act(() => {
    root!.update(
      <PredictionHistoryTable state={{ onSelectRoundSymbol: second } as any} />,
    );
  });
  const dataTable = root!.root.findAllByType(
    tableModule.PredictionDataTable,
  )[0];
  expect(dataTable.props.rows[0].cells[0].props.onSelectRoundSymbol).toBe(
    second,
  );
});

it("PredictionAccountPanel merges onSelectRoundSymbol into the panel state", () => {
  const onSelectRoundSymbol = vi.fn();
  mount(
    <PredictionAccountPanel
      activeTab="openOrders"
      setActiveTab={vi.fn()}
      isSubmitting={false}
      isRegionRestricted={false}
      onSelectRoundSymbol={onSelectRoundSymbol}
    />,
  );
  const state = panelMocks.dataPanel.mock.calls.at(-1)?.[0].state;
  expect(state.onSelectRoundSymbol).toBe(onSelectRoundSymbol);
  mount(
    <PredictionAccountPanel
      activeTab="openOrders"
      setActiveTab={vi.fn()}
      isSubmitting={false}
      isRegionRestricted={false}
    />,
  );
  expect(
    panelMocks.dataPanel.mock.calls.at(-1)?.[0].state.onSelectRoundSymbol,
  ).toBeUndefined();
});

it("the trading-page extension routes row clicks through onPredictionSelect", () => {
  const onPredictionSelect = vi.fn();
  let result!: PredictionIntegrationState;
  function Consumer(props: PredictionIntegrationOptions) {
    result = usePredictionIntegration(props);
    return null;
  }
  mount(
    <Consumer
      symbol="PERP_BTC_USDC"
      showAllSymbol={true}
      onPredictionSelect={onPredictionSelect}
    />,
  );
  const content = result.dataListProductContent!;
  const pending = content.pending as ReactElement<{
    state: { onSelectRoundSymbol?: unknown };
  }>;
  expect(pending.props.state.onSelectRoundSymbol).toBe(onPredictionSelect);
  const positions = (
    content.positions as (children: React.ReactNode) => ReactElement<{
      state: { onSelectRoundSymbol?: unknown };
    }>
  )(<div />);
  expect(positions.props.state.onSelectRoundSymbol).toBe(onPredictionSelect);
  const mobilePending = content.mobile!.pending as ReactElement<{
    state: { onSelectRoundSymbol?: unknown };
  }>;
  expect(mobilePending.props.state.onSelectRoundSymbol).toBe(
    onPredictionSelect,
  );
});

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
