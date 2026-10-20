// @vitest-environment jsdom
import { MemoryRouter, Route, Routes } from "react-router";
import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { afterEach, expect, it, vi } from "vitest";
import type {
  TradeSubMenuItem,
  TradeSubMenuWidgetProps,
} from "@orderly.network/markets";
import { customTradeSubMenuRender } from "./customTradeSubMenu";

const mocks = vi.hoisted(() => ({
  widget: vi.fn<(props: TradeSubMenuWidgetProps) => null>(() => null),
}));

vi.mock("@orderly.network/markets", () => ({
  PERPS_TRADE_SUB_MENU_KEY: "perps",
  PREDICTION_TRADE_SUB_MENU_KEY: "prediction",
  TradeSubMenuWidget: mocks.widget,
}));
vi.mock("@orderly.network/i18n", async (importActual) => ({
  ...(await importActual<typeof import("@orderly.network/i18n")>()),
  useTranslation: () => ({ t: (key: string) => key }),
}));
vi.mock("@orderly.network/ui", () => ({
  MarketsActiveIcon: () => null,
  MarketsInactiveIcon: () => null,
}));

let root: ReactTestRenderer;

afterEach(() => act(() => root.unmount()));

function renderAt(path: string): TradeSubMenuWidgetProps {
  act(() => {
    root = create(
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route
            path="/:lang/perp/:symbol"
            element={customTradeSubMenuRender()}
          />
          <Route
            path="/:lang/rwa/:symbol"
            element={customTradeSubMenuRender()}
          />
          <Route
            path="/:lang/prediction/:symbol"
            element={customTradeSubMenuRender()}
          />
          <Route path="/:lang/swap" element={customTradeSubMenuRender()} />
          <Route path="/:lang/markets" element={customTradeSubMenuRender()} />
        </Routes>
      </MemoryRouter>,
    );
  });
  return mocks.widget.mock.calls.at(-1)![0];
}

it.each([
  ["/en/perp/PERP_BTC_USDC", "perps", "PERP_BTC_USDC"],
  ["/en/rwa/PERP_XAU_USDC", "rwa", "PERP_XAU_USDC"],
  // Host passes the route param; the widget drops binary/prediction symbols.
  [
    "/en/prediction/PERP_BTC5M2608271200_USDC",
    "prediction",
    "PERP_BTC5M2608271200_USDC",
  ],
  ["/en/swap", "spot", undefined],
  ["/en/markets", "perps", undefined],
])("derives the active entry and perps symbol at %s", (path, key, symbol) => {
  const props = renderAt(path);
  expect(props.activeKey).toBe(key);
  expect(props.symbol).toBe(symbol);
});

it("appends RWA after the built-in SDK entries", () => {
  const builtins = [
    { key: "perps", title: "common.perps" },
    { key: "prediction", title: "common.predictions" },
  ] as TradeSubMenuItem[];
  const items = renderAt("/en/markets").items!(builtins);
  expect(items.map((entry) => entry.key)).toEqual([
    "perps",
    "prediction",
    "rwa",
  ]);
  expect(items[0]).toBe(builtins[0]);
  expect(items[1]).toBe(builtins[1]);
});
