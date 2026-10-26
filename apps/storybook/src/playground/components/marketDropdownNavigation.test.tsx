import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { afterEach, expect, it, vi } from "vitest";
import { DropDownMarkets } from "@orderly.network/markets-core/src/components/dropDownMarkets/dropDownMarkets.ui";
import { DropDownMarketsWidget } from "@orderly.network/markets-core/src/components/dropDownMarkets/dropDownMarkets.widget";
import { MarketsProvider } from "@orderly.network/markets-core/src/components/marketsProvider";

const mocks = vi.hoisted(() => ({ hide: vi.fn() }));
vi.mock(
  "@orderly.network/markets-core/src/components/dropDownMarkets/dropDownMarkets.script",
  () => ({
    useDropDownMarketsScript: () => ({ activeTab: "all", hide: mocks.hide }),
  }),
);
vi.mock(
  "@orderly.network/markets-core/src/components/shared/hooks/useMarketCategories",
  () => ({ useMarketCategories: () => [] }),
);
vi.mock("@orderly.network/markets-core/src/components/shared/tabUtils", () => ({
  tabKey: (tab: { id?: string; type?: string }) => tab.id ?? tab.type,
}));
vi.mock(
  "@orderly.network/markets-core/src/components/dropDownMarkets/dropDownMarkets.ui",
  () => ({ DropDownMarkets: () => null }),
);
vi.mock("@orderly.network/markets-core/src/components/marketsProvider", () => ({
  MarketsProvider: ({ children }: { children: React.ReactNode }) => children,
}));
let root: ReactTestRenderer;
afterEach(() => act(() => root?.unmount()));
it("shows the remaining Prediction tab when the stored cross-product tab is hidden", () => {
  act(() => {
    root = create(
      <DropDownMarketsWidget
        tabs={[{ id: "prediction", name: "Prediction", match: () => false }]}
      />,
    );
  });
  expect(root.root.findByType(DropDownMarkets).props.activeTab).toBe(
    "prediction",
  );
  expect(
    root.root.findByType(MarketsProvider).props.onSymbolChange,
  ).toBeUndefined();
});
it("retains a visible stored tab and closes the dropdown before notifying a Perp selection", () => {
  const onSymbolChange = vi.fn();
  act(() => {
    root = create(
      <DropDownMarketsWidget
        tabs={[{ id: "all", name: "All", match: () => true }]}
        onSymbolChange={onSymbolChange}
      />,
    );
  });
  expect(root.root.findByType(DropDownMarkets).props.activeTab).toBe("all");
  root.root
    .findByType(MarketsProvider)
    .props.onSymbolChange({ symbol: "PERP_ETH_USDC" });
  expect(mocks.hide).toHaveBeenCalled();
  expect(onSymbolChange).toHaveBeenCalledExactlyOnceWith({
    symbol: "PERP_ETH_USDC",
  });
});
