// @vitest-environment jsdom
// Column and cell assertions query a real DOM, so this file renders with
// react-dom rather than react-test-renderer.
import React, { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { PredictionMarketPanel } from "@orderly.network/prediction/src/prediction/predictionMarketPanel.ui";

(globalThis as Record<string, unknown>).IS_REACT_ACT_ENVIRONMENT = true;

const mocks = vi.hoisted(() => ({
  searchValue: "",
  isMobile: false,
  // Spy so assertions cover our wiring (human rule + value) without
  // reimplementing the shared formatter's output.
  textNumeral: vi.fn(
    ({ children }: { children?: React.ReactNode }) => children ?? null,
  ),
}));
vi.mock("@orderly.network/i18n", () => ({
  i18n: { t: (key: string) => key },
  useTranslation: () => ({ t: (key: string) => key }),
}));
vi.mock("@orderly.network/markets-core", () => ({
  useMarketCategories: () => [],
  useMarketsContext: () => ({ searchValue: mocks.searchValue }),
  FavoritesIcon: () => null,
  FavoritesIcon2: () => null,
  UnFavoritesIcon: () => null,
  UnFavoritesIcon2: () => null,
}));
vi.mock("@orderly.network/ui", () => ({
  cn: (...args: unknown[]) => args.filter(Boolean).join(" "),
  Spinner: () => null,
  InjectableEmptyDataState: () => null,
  Text: Object.assign(
    ({ children }: { children?: React.ReactNode }) => children,
    { numeral: mocks.textNumeral },
  ),
  TokenIcon: () => null,
  useScreen: () => ({ isMobile: mocks.isMobile }),
}));
vi.mock(
  "@orderly.network/prediction/src/prediction/hooks/useRoundCountdown",
  () => ({ useRoundCountdown: () => 60 }),
);

const market = {
  id: "PERP_BTC5M_USDC",
  base: "BTC",
  period: "5M",
  indexPriceSymbol: "PERP_BTC_USDC",
  currentRow: { symbol: "PERP_BTC5M2609291035_USDC", expire_at: 1 },
  hasLiveRow: true,
};
const bbos = {
  PERP_BTC5M2609291035_USDC: { bestBid: 0.52, bestAsk: 0.54 },
};

let container: HTMLDivElement | undefined;
let root: Root | undefined;
beforeEach(() => {
  mocks.searchValue = "";
  mocks.isMobile = false;
});
function render(node: React.ReactElement) {
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
  act(() => {
    root!.render(node);
  });
}
afterEach(() => {
  act(() => root?.unmount());
  container?.remove();
  container = undefined;
  root = undefined;
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

function panel(
  volumes?: Record<string, number>,
  componentKey = "dropDownMarkets",
) {
  return (
    <PredictionMarketPanel
      markets={[market] as never}
      bbos={bbos}
      volumes={volumes}
      favoriteMarketIds={[]}
      onToggleFavorite={vi.fn()}
      componentKey={componentKey}
    />
  );
}

it("keeps the 4-column layout when ResizeObserver is unavailable", () => {
  render(panel({ PERP_BTC5M2609291035_USDC: 1234 }));
  expect(container!.querySelectorAll("col")).toHaveLength(4);
  // Volume rides the shared perps formatter convention.
  expect(mocks.textNumeral.mock.calls[0][0]).toMatchObject({
    rule: "human",
    dp: 2,
    children: 1234,
  });
});

it("shows a dash when no ticker amount arrived", () => {
  render(panel());
  expect(mocks.textNumeral).not.toHaveBeenCalled();
  expect(container!.querySelectorAll("td")[2].textContent).toBe("--");
});

it("switches to the 3-column two-line layout on compact hosts", () => {
  render(panel({ PERP_BTC5M2609291035_USDC: 1234 }, "expandMarkets"));
  expect(container!.querySelectorAll("col")).toHaveLength(3);
  // The dead volume placeholder is dropped in the compact layout.
  expect(container!.querySelectorAll("td")).toHaveLength(3);
  // Combined single-line headers, perps `Last/24h %` style.
  const headers = Array.from(container!.querySelectorAll("thead th"));
  expect(headers).toHaveLength(3);
  expect(headers[1].textContent).toBe("markets.column.last");
  expect(headers[2].textContent).toBe("prediction.column.time&volume");
  // The last-price cell is single-line now: the stacked Up-probability
  // line is gone, volume rides under the countdown in the trailing column.
  const lastCell = container!.querySelector("tbody tr td:nth-child(2)")!;
  expect(lastCell.textContent).toBe("0.53");
  expect(container!.textContent).not.toContain("53.0%");
  const trailingCell = container!.querySelector("tbody tr td:nth-child(3)")!;
  expect(trailingCell.textContent).toContain("1234");
});

it("renders the loading empty state and swaps in compact columns when markets arrive", () => {
  render(
    <PredictionMarketPanel
      markets={[]}
      loading
      bbos={bbos}
      favoriteMarketIds={[]}
      onToggleFavorite={vi.fn()}
      componentKey="expandMarkets"
    />,
  );
  const element = container!.firstElementChild;
  expect(container!.querySelector("table")).toBeNull();
  act(() => root!.render(panel(undefined, "expandMarkets")));
  expect(container!.firstElementChild).toBe(element);
  expect(container!.querySelectorAll("col")).toHaveLength(3);
});

it("drops the table on an empty search and goes compact on the mobile markets page", () => {
  render(panel());
  const element = container!.firstElementChild;
  mocks.searchValue = "no matching market";
  act(() => root!.render(panel()));
  expect(container!.querySelector("table")).toBeNull();
  mocks.searchValue = "";
  act(() => root!.render(panel()));
  expect(container!.firstElementChild).toBe(element);
  expect(container!.querySelectorAll("col")).toHaveLength(4);
  // The markets page keeps its favorites column on desktop but collapses
  // on mobile.
  act(() => root!.render(panel(undefined, "marketsDataList")));
  expect(container!.querySelectorAll("col")).toHaveLength(5);
  mocks.isMobile = true;
  act(() => root!.render(panel(undefined, "marketsDataList")));
  expect(container!.querySelectorAll("col")).toHaveLength(3);
});
