import React, { forwardRef } from "react";
import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { afterEach, expect, it, vi } from "vitest";
import { OrdersWidget } from "@orderly.network/ui-orders/src/components/orders.widget";

vi.mock("@orderly.network/i18n", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));
vi.mock("@orderly.network/hooks", () => ({
  useBadgeBySymbol: () => ({}),
}));
vi.mock("@orderly.network/ui", () => ({
  Tabs: ({ children }: any) => children,
  TabPanel: ({ children }: any) => children,
  Text: {
    symbolBadge: ({ onClick, children }: any) => (
      <button onClick={onClick}>{children}</button>
    ),
  },
}));
vi.mock("@orderly.network/ui-orders/src/components/orderList", async () => {
  const { OrderSymbolCell } = await vi.importActual<
    typeof import("@orderly.network/ui-orders/src/components/orderList/desktop/orderSymbolCell")
  >(
    "@orderly.network/ui-orders/src/components/orderList/desktop/orderSymbolCell",
  );
  return {
    DesktopOrderListWidget: forwardRef<any, any>((props, _ref) => (
      <div data-tab={props.type}>
        <OrderSymbolCell
          symbol="PERP_ETH_USDC"
          onSymbolChange={props.onSymbolChange}
        />
      </div>
    )),
  };
});
let root: ReactTestRenderer;
afterEach(() => act(() => root?.unmount()));
it("forwards legacy widget navigation through all six status tabs and updates the handler", async () => {
  const onSymbolChange = vi.fn();
  await act(async () => {
    root = create(<OrdersWidget onSymbolChange={onSymbolChange} />);
  });
  await act(async () => {
    await import("@orderly.network/ui-orders/src/components/orderList");
  });
  const tabs = root.root.findAll((node) => Boolean(node.props["data-tab"]));
  expect(tabs.map((node) => node.props["data-tab"])).toEqual([
    "all",
    "pending",
    "tp_sl",
    "filled",
    "cancelled",
    "rejected",
  ]);
  const click = (button: any) =>
    button.props.onClick({
      stopPropagation: vi.fn(),
      preventDefault: vi.fn(),
    });
  act(() => root.root.findAllByType("button").forEach(click));
  expect(onSymbolChange).toHaveBeenCalledTimes(6);
  expect(onSymbolChange).toHaveBeenLastCalledWith({ symbol: "PERP_ETH_USDC" });
  const next = vi.fn();
  act(() => root.update(<OrdersWidget onSymbolChange={next} />));
  act(() => click(root.root.findAllByType("button")[0]));
  expect(next).toHaveBeenCalledExactlyOnceWith({ symbol: "PERP_ETH_USDC" });
  expect(onSymbolChange).toHaveBeenCalledTimes(6);
});
