// @vitest-environment jsdom
// The panel's ResizeObserver probe needs a real DOM node: react-test-renderer
// leaves null refs on host elements, so this file renders with react-dom.
import React, { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { PredictionMarketPanel } from "@orderly.network/prediction/src/prediction/predictionMarketPanel.ui";

(globalThis as Record<string, unknown>).IS_REACT_ACT_ENVIRONMENT = true;

const mocks = vi.hoisted(() => ({
  searchValue: "",
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
  FavoritesIcon2: () => null,
  UnFavoritesIcon2: () => null,
}));
vi.mock("@orderly.network/ui", () => ({
  cn: (...args: unknown[]) => args.filter(Boolean).join(" "),
  Spinner: () => null,
  Text: Object.assign(
    ({ children }: { children: React.ReactNode }) => children,
    { numeral: mocks.textNumeral },
  ),
  TokenIcon: () => null,
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

function panel(volumes?: Record<string, number>) {
  return (
    <PredictionMarketPanel
      markets={[market] as never}
      bbos={bbos}
      volumes={volumes}
      favoriteMarketIds={[]}
      onToggleFavorite={vi.fn()}
    />
  );
}

it("keeps the 5-column layout when ResizeObserver is unavailable", () => {
  render(panel({ PERP_BTC5M2609291035_USDC: 1234 }));
  expect(container!.querySelectorAll("col")).toHaveLength(5);
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
  expect(container!.querySelectorAll("td")[3].textContent).toBe("--");
});

it("switches to the 3-column two-line layout in narrow containers", () => {
  class ResizeObserverStub {
    private readonly callback: ResizeObserverCallback;
    constructor(callback: ResizeObserverCallback) {
      this.callback = callback;
    }
    observe() {
      // Side panel width — below the compact threshold.
      this.callback(
        [{ contentRect: { width: 300 } }] as ResizeObserverEntry[],
        this as unknown as ResizeObserver,
      );
    }
    disconnect() {}
    unobserve() {}
  }
  vi.stubGlobal("ResizeObserver", ResizeObserverStub);

  render(panel({ PERP_BTC5M2609291035_USDC: 1234 }));
  expect(container!.querySelectorAll("col")).toHaveLength(3);
  // The dead volume placeholder is dropped in the compact layout.
  expect(container!.querySelectorAll("td")).toHaveLength(3);
  // Combined single-line headers, perps `Last/24h %` style.
  const headers = Array.from(container!.querySelectorAll("thead th"));
  expect(headers).toHaveLength(3);
  expect(headers[1].textContent).toBe("prediction.column.last&probability");
  expect(headers[2].textContent).toBe("prediction.column.time&volume");
  // Chance rides under the last price as the untinted second line (no
  // up/down coloring), volume rides under the countdown in the trailing column.
  const secondLines = Array.from(
    container!.querySelectorAll<HTMLElement>("tbody [class*='oui-text-2xs']"),
  );
  expect(secondLines).toHaveLength(2);
  const chanceLine = secondLines.find((el) => el.textContent === "53.0%");
  expect(chanceLine).toBeDefined();
  expect(chanceLine!.className).not.toContain("oui-text-success");
  expect(chanceLine!.className).not.toContain("oui-text-danger");
  const volumeLine = secondLines.find((el) => el.textContent === "1234");
  expect(volumeLine).toBeDefined();
});

it("observes an initially loading panel and uses compact columns when markets arrive", () => {
  const observe = vi.fn();
  const disconnect = vi.fn();
  class Observer {
    constructor(private callback: ResizeObserverCallback) {}
    observe(element: Element) {
      observe(element);
      this.callback(
        [{ contentRect: { width: 300 } }] as ResizeObserverEntry[],
        this as unknown as ResizeObserver,
      );
    }
    disconnect = disconnect;
  }
  vi.stubGlobal("ResizeObserver", Observer);
  render(
    <PredictionMarketPanel
      markets={[]}
      loading
      bbos={bbos}
      favoriteMarketIds={[]}
      onToggleFavorite={vi.fn()}
    />,
  );
  const element = container!.firstElementChild;
  expect(observe).toHaveBeenCalledWith(element);
  act(() => root!.render(panel()));
  expect(container!.firstElementChild).toBe(element);
  expect(container!.querySelectorAll("col")).toHaveLength(3);
  expect(observe).toHaveBeenCalledTimes(1);
  act(() => root!.unmount());
  root = undefined;
  expect(disconnect).toHaveBeenCalledTimes(1);
});

it("keeps observing through an empty search and responds to later width changes", () => {
  let resize!: (width: number) => void;
  const observe = vi.fn();
  class Observer {
    constructor(callback: ResizeObserverCallback) {
      resize = (width) =>
        callback(
          [{ contentRect: { width } }] as ResizeObserverEntry[],
          this as unknown as ResizeObserver,
        );
    }
    observe(element: Element) {
      observe(element);
      resize(300);
    }
    disconnect() {}
  }
  vi.stubGlobal("ResizeObserver", Observer);
  render(panel());
  const element = container!.firstElementChild;
  mocks.searchValue = "no matching market";
  act(() => root!.render(panel()));
  expect(container!.querySelector("table")).toBeNull();
  act(() => resize(800));
  mocks.searchValue = "";
  act(() => root!.render(panel()));
  expect(container!.firstElementChild).toBe(element);
  expect(container!.querySelectorAll("col")).toHaveLength(5);
  expect(observe).toHaveBeenCalledTimes(1);
  act(() => resize(300));
  expect(container!.querySelectorAll("col")).toHaveLength(3);
});
