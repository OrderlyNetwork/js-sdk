import React from "react";
import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { afterEach, describe, expect, it, vi } from "vitest";
import { FavoritesListFull } from "@orderly.network/markets-core/src/components/favoritesListFull/favoritesListFull.ui";
import { MarketsList } from "@orderly.network/markets-core/src/components/marketsList/marketsList.ui";

vi.mock("@orderly.network/markets-core/src/components/marketsProvider", () => ({
  useMarketsContext: () => ({}),
}));
vi.mock("@orderly.network/markets-core/src/components/favoritesTabs", () => ({
  FavoritesTabWidget: () => <div data-testid="favorites-header" />,
}));
vi.mock(
  "@orderly.network/markets-core/src/components/marketsListFull/column",
  () => ({
    useMarketsListFullColumns: () => [],
  }),
);
vi.mock(
  "@orderly.network/markets-core/src/components/sideMarkets/column",
  () => ({
    useSideMarketsColumns: () => [],
  }),
);
vi.mock("@orderly.network/markets-core/src/components/collapseMarkets", () => ({
  CollapseMarkets: () => null,
}));
vi.mock(
  "@orderly.network/markets-core/src/components/shared/lowVolumeEmptyView",
  () => ({
    LowVolumeEmptyView: () => null,
  }),
);
vi.mock("@orderly.network/i18n", () => ({ Trans: () => null }));
vi.mock("@orderly.network/ui", () => ({
  cn: (...args: unknown[]) => args.filter(Boolean).join(" "),
  Flex: ({ children }) => children,
  DataTable: ({ dataSource }) => (
    <div data-testid="perps-table" data-rows={dataSource.length} />
  ),
}));

let root: ReactTestRenderer | undefined;
afterEach(() => {
  act(() => root?.unmount());
  root = undefined;
});

describe.each([
  ["desktop", FavoritesListFull],
  ["mobile", MarketsList],
] as const)("%s favorites empty state", (_, List) => {
  function mount(overrides = {}) {
    act(() => {
      root = create(
        <List
          {...({
            dataSource: [],
            loading: false,
            favorite: {},
            isFavoritesList: true,
            renderHeader: () => <div data-testid="favorites-header" />,
            ...overrides,
          } as any)}
        />,
      );
    });
  }
  it("keeps the header and hides an empty table when another product has favorites", () => {
    mount({ hideEmptyTable: true });
    expect(
      root!.root.findAllByProps({ "data-testid": "perps-table" }),
    ).toHaveLength(0);
    expect(
      root!.root.findAllByProps({ "data-testid": "favorites-header" }),
    ).toHaveLength(1);
  });
  it("shows the original empty state when neither product has favorites", () => {
    mount();
    expect(
      root!.root.findByProps({ "data-testid": "perps-table" }).props[
        "data-rows"
      ],
    ).toBe(0);
  });
  it("keeps Perps rows when both products have favorites", () => {
    mount({ hideEmptyTable: true, dataSource: [{ symbol: "PERP_BTC_USDC" }] });
    expect(
      root!.root.findByProps({ "data-testid": "perps-table" }).props[
        "data-rows"
      ],
    ).toBe(1);
  });
});
