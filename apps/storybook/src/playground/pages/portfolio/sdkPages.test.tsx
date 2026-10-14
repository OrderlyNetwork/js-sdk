import React, { createElement, useState } from "react";
import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { OrdersPage } from "@orderly.network/portfolio/src/pages/orders/page";
import { PositionsPage } from "@orderly.network/portfolio/src/pages/positions/page";

const mocks = vi.hoisted(() => ({
  route: vi.fn(),
  routeAvailable: true,
  accountId: "main-1",
  main: true,
  prediction: vi.fn(),
  panels: vi.fn(),
  orders: vi.fn(),
  legacyOrders: vi.fn(),
  positions: vi.fn(),
  history: vi.fn(),
}));
vi.mock("@orderly.network/react-app", () => ({
  useAppContext: () => ({
    onRouteChange: mocks.routeAvailable ? mocks.route : undefined,
  }),
}));
vi.mock("@orderly.network/hooks", () => ({
  useAccount: () => ({
    state: {
      accountId: mocks.accountId,
      subAccounts: [{ id: "sub-1", description: "sub" }],
    },
    isMainAccount: mocks.main,
  }),
}));
vi.mock("@orderly.network/i18n", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));
vi.mock("@orderly.network/ui-assets", () => ({
  AccountType: { ALL: "All accounts", MAIN: "Main accounts" },
}));
vi.mock("@orderly.network/prediction", () => ({
  usePredictionAccountData: () => {
    mocks.prediction();
    return { accountId: mocks.accountId };
  },
  ManagedPredictionPositions: (props: any) => (
    <div>
      {props.selectedAccount}:{mocks.accountId}
    </div>
  ),
  SharedProductDataPanel: (props: any) => {
    mocks.panels(props);
    const [product, setProduct] = useState(props.initialProduct);
    return (
      <div>
        {props.beforeProductSelector}
        {(["perps", "prediction"] as const).map((value) => (
          <button
            key={value}
            onClick={() => {
              setProduct(value);
              props.onProductChange(value);
            }}
          >
            {value}
          </button>
        ))}
        {product === "perps"
          ? props.type === "positions"
            ? props.perpsPositionsContent
            : props.perpsPositionHistoryContent
          : (props.predictionPositionsContent ?? "prediction-data")}
      </div>
    );
  },
}));
vi.mock(
  "@orderly.network/portfolio/src/pages/orders/productOrders.widget",
  () => ({
    ProductOrdersWidget: (props: any) => {
      mocks.orders(props);
      return "mixed-orders";
    },
  }),
);
vi.mock("@orderly.network/ui-orders", () => ({
  TabType: {
    all: "all",
    pending: "pending",
    filled: "filled",
    cancelled: "cancelled",
    rejected: "rejected",
    tp_sl: "tp_sl",
  },
  OrdersWidget: (props: unknown) => {
    mocks.legacyOrders(props);
    return "perps-orders";
  },
}));
vi.mock("@orderly.network/ui-positions", () => ({
  CombinePositionsWidget: (props: any) => {
    mocks.positions(props);
    return "combined-positions";
  },
  PositionsWidget: (props: any) => {
    mocks.positions(props);
    return "perps-positions";
  },
  PositionHistoryWidget: (props: any) => {
    mocks.history(props);
    return "perps-history";
  },
  LiquidationWidget: () => "liquidation",
}));
vi.mock("@orderly.network/ui", () => {
  const container = ({ children }: any) => <div>{children}</div>;
  return {
    Box: container,
    Flex: container,
    Text: container,
    Tooltip: container,
    Divider: () => null,
    InfoCircleIcon: () => null,
    Button: container,
    formatAddress: (id: string) => id,
    Select: {
      options: (props: any) => (
        <select
          data-kind="product"
          value={props.value}
          onChange={(e) => props.onValueChange(e.target.value)}
        />
      ),
    },
    DataFilter: (props: any) => (
      <select
        data-kind="account"
        value={props.items[0].value}
        onChange={(e) =>
          props.onFilter({ name: "account", value: e.target.value })
        }
      />
    ),
    Tabs: (props: any) => (
      <div data-kind="tabs" onChange={props.onValueChange}>
        {React.Children.toArray(props.children).filter(
          (child: any) => child.props.value === props.value,
        )}
      </div>
    ),
    TabPanel: container,
  };
});

let renderer: ReactTestRenderer;
beforeEach(() => {
  vi.clearAllMocks();
  mocks.accountId = "main-1";
  mocks.main = true;
  mocks.routeAvailable = true;
});
afterEach(() => {
  if (renderer) act(() => renderer.unmount());
});
const mount = (component: any, props = {}) =>
  act(() => {
    renderer = create(createElement(component, props));
  });
const clickProduct = (product: string) =>
  act(() =>
    renderer.root
      .findAllByType("button")
      .find((button) => button.children[0] === product)!
      .props.onClick(),
  );
const tab = (value: string) =>
  act(() =>
    renderer.root.findByProps({ "data-kind": "tabs" }).props.onChange(value),
  );

describe("Portfolio SDK default integration", () => {
  it("enables All orders without additional props and preserves sharing configuration", () => {
    const sharePnLConfig = { backgroundImages: ["custom.png"] };
    mount(OrdersPage, { sharePnLConfig });
    expect(mocks.orders).toHaveBeenLastCalledWith(
      expect.objectContaining({ product: "all", type: "all", sharePnLConfig }),
    );
    expect(mocks.legacyOrders).not.toHaveBeenCalled();
    act(() =>
      renderer.root
        .findByProps({ "data-kind": "product" })
        .props.onChange({ target: { value: "prediction" } }),
    );
    expect(mocks.orders).toHaveBeenLastCalledWith(
      expect.objectContaining({ product: "prediction" }),
    );
    expect(JSON.stringify(renderer.toJSON())).toContain(
      "prediction.currentAccount",
    );
  });
  it("uses the original Orders widget when predictionEnabled is false", () => {
    mount(OrdersPage, { predictionEnabled: false });
    expect(mocks.orders).not.toHaveBeenCalled();
    expect(mocks.legacyOrders).toHaveBeenCalledWith(
      expect.objectContaining({ productType: "PERP" }),
    );
    expect(renderer.root.findAllByType("select")).toHaveLength(0);
  });
  it("defaults positions to Perps and preserves account filtering across products", () => {
    const sharePnLConfig = { backgroundImages: ["custom.png"] };
    const onSymbolChange = vi.fn();
    mount(PositionsPage, {
      sharePnLConfig,
      onSymbolChange,
      calcMode: "markPrice",
    });
    expect(mocks.panels).toHaveBeenLastCalledWith(
      expect.objectContaining({
        initialProduct: "perps",
        showPositionCounts: false,
      }),
    );
    act(() =>
      renderer.root
        .findByProps({ "data-kind": "account" })
        .props.onChange({ target: { value: "sub-1" } }),
    );
    expect(mocks.positions).toHaveBeenLastCalledWith(
      expect.objectContaining({
        selectedAccount: "sub-1",
        sharePnLConfig,
        onSymbolChange,
        calcMode: "markPrice",
      }),
    );
    clickProduct("prediction");
    expect(
      renderer.root.findAllByProps({ "data-kind": "account" }),
    ).toHaveLength(1);
    expect(
      renderer.root.findByProps({ "data-kind": "account" }).props.value,
    ).toBe("sub-1");
    expect(JSON.stringify(renderer.toJSON())).not.toContain(
      "prediction.currentAccount",
    );
    clickProduct("perps");
    expect(
      renderer.root.findByProps({ "data-kind": "account" }).props.value,
    ).toBe("sub-1");
  });
  it("integrates Prediction history while keeping liquidation Perps-only", () => {
    mount(PositionsPage);
    tab("Position history");
    expect(mocks.panels).toHaveBeenLastCalledWith(
      expect.objectContaining({
        type: "positionHistory",
        initialProduct: "perps",
      }),
    );
    expect(mocks.history).toHaveBeenLastCalledWith(
      expect.objectContaining({ productType: "PERP" }),
    );
    mocks.prediction.mockClear();
    tab("Liquidation");
    expect(mocks.prediction).not.toHaveBeenCalled();
    expect(JSON.stringify(renderer.toJSON())).toContain("liquidation");
    expect(renderer.root.findAllByType("button")).toHaveLength(0);
  });
  it("honors custom slots and the disable switch without mounting Prediction queries", () => {
    const slot = vi.fn(() => "custom-positions");
    const historySlot = vi.fn(() => "custom-history");
    mount(PositionsPage, {
      positionProductContent: slot,
      positionHistoryProductContent: historySlot,
    });
    expect(slot).toHaveBeenCalled();
    expect(mocks.prediction).not.toHaveBeenCalled();
    tab("Position history");
    expect(historySlot).toHaveBeenCalled();
    expect(mocks.prediction).not.toHaveBeenCalled();
    act(() =>
      renderer.update(
        createElement(PositionsPage, { predictionEnabled: false }),
      ),
    );
    expect(mocks.prediction).not.toHaveBeenCalled();
    expect(mocks.history).toHaveBeenCalled();
  });
  it("remounts Prediction state on account changes and supports a logged-in subaccount", () => {
    mount(PositionsPage);
    clickProduct("prediction");
    mocks.accountId = "sub-1";
    mocks.main = false;
    act(() => renderer.update(createElement(PositionsPage)));
    expect(JSON.stringify(renderer.toJSON())).not.toContain("prediction-data");
    expect(renderer.root.findAllByType("select")).toHaveLength(0);
    clickProduct("prediction");
    expect(JSON.stringify(renderer.toJSON())).toContain("sub-1");
  });
});

it.each(["all", "pending", "tp_sl", "filled", "cancelled", "rejected"])(
  "routes both products from Portfolio orders tab %s",
  (status) => {
    mount(OrdersPage);
    tab(status);
    const props = mocks.orders.mock.calls.at(-1)![0];
    props.onSymbolChange({ symbol: "PERP_ETH_USDC" });
    expect(mocks.route).toHaveBeenLastCalledWith({
      href: "/perp/PERP_ETH_USDC",
      name: "perps",
    });
    props.onPredictionSelect("PERP_ETH5M2610141200_USDC");
    expect(mocks.route).toHaveBeenLastCalledWith({
      href: "/prediction/PERP_ETH5M2610141200_USDC",
      name: "prediction",
    });
  },
);
it("routes legacy Perps orders and encodes symbols", () => {
  mount(OrdersPage, { predictionEnabled: false });
  mocks.legacyOrders.mock.calls
    .at(-1)![0]
    .onSymbolChange({ symbol: "PERP/ETH?USDC" });
  expect(mocks.route).toHaveBeenCalledExactlyOnceWith({
    href: "/perp/PERP%2FETH%3FUSDC",
    name: "perps",
  });
});
it("preserves host callbacks and leaves navigation absent without a router", () => {
  const onSymbolChange = vi.fn();
  const onPredictionSelect = vi.fn();
  mount(OrdersPage, { onSymbolChange, onPredictionSelect });
  expect(mocks.orders.mock.calls.at(-1)![0]).toEqual(
    expect.objectContaining({ onSymbolChange, onPredictionSelect }),
  );
  mocks.routeAvailable = false;
  act(() => renderer.update(<OrdersPage />));
  expect(mocks.orders.mock.calls.at(-1)![0].onSymbolChange).toBeUndefined();
  expect(mocks.orders.mock.calls.at(-1)![0].onPredictionSelect).toBeUndefined();
});

it("routes both products from Portfolio positions", () => {
  mount(PositionsPage);
  mocks.positions.mock.calls
    .at(-1)![0]
    .onSymbolChange({ symbol: "PERP_ETH_USDC" });
  expect(mocks.route).toHaveBeenLastCalledWith({
    href: "/perp/PERP_ETH_USDC",
    name: "perps",
  });
  mocks.panels.mock.calls
    .at(-1)![0]
    .state.onSelectRoundSymbol("PERP_ETH5M2610141200_USDC");
  expect(mocks.route).toHaveBeenLastCalledWith({
    href: "/prediction/PERP_ETH5M2610141200_USDC",
    name: "prediction",
  });
  tab("Position history");
  mocks.history.mock.calls
    .at(-1)![0]
    .onSymbolChange({ symbol: "PERP/ETH?USDC" });
  expect(mocks.route).toHaveBeenLastCalledWith({
    href: "/perp/PERP%2FETH%3FUSDC",
    name: "perps",
  });
  mocks.panels.mock.calls
    .at(-1)![0]
    .state.onSelectRoundSymbol("PERP_BTC5M2610141200_USDC");
  expect(mocks.route).toHaveBeenLastCalledWith({
    href: "/prediction/PERP_BTC5M2610141200_USDC",
    name: "prediction",
  });
});
it("preserves host positions callbacks and leaves navigation absent without a router", () => {
  const onSymbolChange = vi.fn();
  const onPredictionSelect = vi.fn();
  mount(PositionsPage, { onSymbolChange, onPredictionSelect });
  expect(mocks.positions.mock.calls.at(-1)![0].onSymbolChange).toBe(
    onSymbolChange,
  );
  expect(mocks.panels.mock.calls.at(-1)![0].state.onSelectRoundSymbol).toBe(
    onPredictionSelect,
  );
  mocks.routeAvailable = false;
  act(() => renderer.update(<PositionsPage />));
  expect(mocks.positions.mock.calls.at(-1)![0].onSymbolChange).toBeUndefined();
  expect(
    mocks.panels.mock.calls.at(-1)![0].state.onSelectRoundSymbol,
  ).toBeUndefined();
});
