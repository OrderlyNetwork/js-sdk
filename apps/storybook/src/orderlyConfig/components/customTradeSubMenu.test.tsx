// @vitest-environment jsdom
import { MemoryRouter, Route, Routes } from "react-router";
import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { PERP_SYMBOL_STORAGE_KEY } from "@orderly.network/trading-shared";
import { customTradeSubMenuRender } from "./customTradeSubMenu";

vi.mock("@orderly.network/markets", () => ({
  SubMenuMarketsWidget: () => null,
}));
vi.mock("@orderly.network/i18n", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));
vi.mock("@orderly.network/ui", () => ({
  EarnActiveIcon: () => null,
  EarnInactiveIcon: () => null,
  TradingActiveIcon: () => null,
  TradingInactiveIcon: () => null,
  MarketsActiveIcon: () => null,
  MarketsInactiveIcon: () => null,
  PredictionIcon: () => null,
}));
vi.mock("../../components/orderlyProvider/rounteProvider", () => ({
  useRouteContext: () => ({ onRouteChange: vi.fn() }),
}));

function renderSubMenuAt(path: string): ReactTestRenderer {
  const SubMenu = customTradeSubMenuRender();
  let root: ReactTestRenderer;
  act(() => {
    root = create(
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path="/:lang/perp/:symbol" element={<SubMenu />} />
          <Route path="/:lang/prediction/:symbol" element={<SubMenu />} />
          <Route path="/:lang/markets" element={<SubMenu />} />
        </Routes>
      </MemoryRouter>,
    );
  });
  return root!;
}

let root: ReactTestRenderer;

beforeEach(() => {
  localStorage.clear();
});

afterEach(() => act(() => root.unmount()));

it("mirrors the URL symbol into storage on a perps route", () => {
  root = renderSubMenuAt("/en/perp/PERP_BTC_USDC");
  expect(localStorage.getItem(PERP_SYMBOL_STORAGE_KEY)).toBe("PERP_BTC_USDC");
});

it("does not overwrite the remembered symbol with the prediction round symbol", () => {
  localStorage.setItem(PERP_SYMBOL_STORAGE_KEY, "PERP_BTC_USDC");
  root = renderSubMenuAt("/en/prediction/PERP_BTC5M2608271200_USDC");
  expect(localStorage.getItem(PERP_SYMBOL_STORAGE_KEY)).toBe("PERP_BTC_USDC");
});

it("keeps the remembered symbol on routes without a perps symbol param", () => {
  localStorage.setItem(PERP_SYMBOL_STORAGE_KEY, "PERP_BTC_USDC");
  root = renderSubMenuAt("/en/markets");
  expect(localStorage.getItem(PERP_SYMBOL_STORAGE_KEY)).toBe("PERP_BTC_USDC");
});
