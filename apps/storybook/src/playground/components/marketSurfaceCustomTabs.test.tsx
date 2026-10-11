import React from "react";
import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ExpandMarkets } from "@orderly.network/markets-core/src/components/expandMarkets/expandMarkets.ui";
import { MarketsProvider } from "@orderly.network/markets-core/src/components/marketsProvider";
import { MarketsSheet } from "@orderly.network/markets-core/src/components/marketsSheet/marketsSheet.ui";
import { SideMarkets } from "@orderly.network/markets-core/src/components/sideMarkets/sideMarkets.ui";
import { MobileMarketsDataList } from "@orderly.network/markets-core/src/pages/home/marketsDataList/marketsDataList.mobile.ui";
import { useMarketsDataListScript } from "@orderly.network/markets-core/src/pages/home/marketsDataList/marketsDataList.script";
import { MarketsDataList } from "@orderly.network/markets-core/src/pages/home/marketsDataList/marketsDataList.ui";
import type { MarketsTabName } from "@orderly.network/markets-core/src/type";
import { TabPanel, Tabs } from "@orderly.network/ui";

// Custom tab keys are runtime-legal (extension slots) while the surface props
// still type as the built-in tab enum; narrow the same way the widgets do.
const predictionActiveTab = "prediction" as MarketsTabName;

const mocks = vi.hoisted(() => ({
  FavoritesListFullWidget: vi.fn((_props: any) => null),
  MarketsListWidget: vi.fn((_props: any): React.ReactElement | null => null),
  MarketsListFullWidget: vi.fn((_props: any) => null),
  ExpandMarketsWidget: vi.fn((_props: any) => null),
  sheetState: {
    tabSort: {},
    onTabSort: vi.fn(),
    activeTab: "prediction",
    onTabChange: vi.fn(),
  },
  expandState: {
    activeTab: "prediction" as MarketsTabName,
    onTabChange: vi.fn(),
    tabSort: {},
    onTabSort: vi.fn(),
  },
  sideState: {
    activeTab: "prediction" as MarketsTabName,
    onTabChange: vi.fn(),
    tabSort: {},
    onTabSort: vi.fn(),
    panelSize: "large" as const,
  },
  dataListState: {
    activeTab: "prediction",
    onTabChange: vi.fn(),
    tabSort: {},
    onTabSort: vi.fn(),
    searchValue: "",
  },
}));

vi.mock("@orderly.network/markets-core/src/components/marketsList", () => ({
  MarketsListWidget: mocks.MarketsListWidget,
}));
vi.mock(
  "@orderly.network/markets-core/src/components/sideMarkets/column",
  () => ({ useSideMarketsColumns: () => [] }),
);
vi.mock("@orderly.network/markets-core/src/components/marketsListFull", () => ({
  MarketsListFullWidget: mocks.MarketsListFullWidget,
}));
vi.mock(
  "@orderly.network/markets-core/src/components/favoritesListFull",
  () => ({
    FavoritesListFullWidget: mocks.FavoritesListFullWidget,
  }),
);
vi.mock(
  "@orderly.network/markets-core/src/components/communityBrokerTabs",
  () => ({
    CommunityBrokerTabs: () => null,
  }),
);
vi.mock(
  "@orderly.network/markets-core/src/components/rwaSubcategoryTabs",
  () => ({
    RwaSubcategoryTabs: () => null,
    createRwaSubcategoryFilter: () => () => [],
  }),
);
vi.mock("@orderly.network/markets-core/src/components/expandMarkets", () => ({
  ExpandMarketsWidget: mocks.ExpandMarketsWidget,
}));
vi.mock("@orderly.network/markets-core/src/components/searchInput", () => ({
  SearchInput: () => null,
}));
vi.mock(
  "@orderly.network/markets-core/src/components/shared/showLowVolumeFilter",
  () => ({ ShowLowVolumeFilter: () => null }),
);
vi.mock(
  "@orderly.network/markets-core/src/components/shared/hooks/useTabSort",
  () => ({
    useTabSort: () => ({ tabSort: {}, onTabSort: () => vi.fn() }),
  }),
);
vi.mock(
  "@orderly.network/markets-core/src/components/shared/hooks/useFavoritesExtraProps",
  () => ({
    useFavoritesProps: () => ({
      getFavoritesProps: () => ({}),
      renderEmptyView: () => null,
    }),
  }),
);
vi.mock("@orderly.network/hooks", async (importOriginal) => {
  const mod = await importOriginal<typeof import("@orderly.network/hooks")>();
  return {
    ...mod,
    useLocalStorage: () => [null, vi.fn()],
    useRwaSymbolsInfoStore: () => ({}),
  };
});
// The real ui Tabs need the theme provider's getComponentTheme, unavailable in
// the node env; this mock keeps the active-tab gating that drives the
// assertions (inactive panels must not render).
vi.mock("@orderly.network/ui", async () => {
  const React = await import("react");
  const TabsValueContext = React.createContext("");
  const wrapper = ({ children }: { children?: React.ReactNode }) => children;
  const Tabs = ({
    value,
    children,
  }: {
    value?: string;
    children?: React.ReactNode;
  }) =>
    React.createElement(
      TabsValueContext.Provider,
      { value: value ?? "" },
      children,
    );
  const TabPanel = ({
    value,
    children,
  }: {
    value?: string;
    children?: React.ReactNode;
  }) => {
    const activeValue = React.useContext(TabsValueContext);
    return activeValue === value
      ? React.createElement(React.Fragment, null, children)
      : null;
  };
  return {
    cn: (...args: unknown[]) => args.filter(Boolean).join(" "),
    Box: wrapper,
    Flex: wrapper,
    Text: wrapper,
    DataTable: ({ dataSource, emptyView }) =>
      React.createElement(
        "div",
        { "data-testid": "perps-table" },
        dataSource.length
          ? dataSource.map((row) =>
              React.createElement("div", { key: row.symbol }, row.symbol),
            )
          : emptyView,
      ),
    Tabs,
    TabPanel,
  };
});

const predictionTab = {
  id: "prediction",
  name: "Prediction",
  match: () => false,
};
const predictionPanel = (tab: unknown, key: string) =>
  key === "prediction" ? <div data-testid="prediction-panel" /> : undefined;

let root: ReactTestRenderer | undefined;
function mount(node: React.ReactElement) {
  act(() => {
    root = create(node);
  });
}
afterEach(() => {
  act(() => root?.unmount());
  root = undefined;
});
beforeEach(() => {
  vi.clearAllMocks();
});

describe("MarketsSheet", () => {
  it("renders the custom panel for the prediction tab instead of the perps list", () => {
    mount(
      <MarketsProvider tabs={[{ type: "favorites" }, predictionTab]}>
        <MarketsSheet
          {...mocks.sheetState}
          activeTab="prediction"
          renderTabContent={predictionPanel}
          hide={vi.fn()}
        />
      </MarketsProvider>,
    );
    expect(
      root!.root.findByProps({ "data-testid": "prediction-panel" }),
    ).toBeDefined();
    expect(mocks.MarketsListWidget).not.toHaveBeenCalled();
  });

  it("appends the after-content section under the favorites list with content-sized layout", () => {
    mount(
      <MarketsProvider tabs={[{ type: "favorites" }]}>
        <MarketsSheet
          {...mocks.sheetState}
          activeTab="favorites"
          renderTabContent={predictionPanel}
          renderTabAfterContent={(_, key) =>
            key === "favorites" ? (
              <div data-testid="prediction-favorites" />
            ) : null
          }
          hide={vi.fn()}
        />
      </MarketsProvider>,
    );
    expect(
      root!.root.findByProps({ "data-testid": "prediction-favorites" }),
    ).toBeDefined();
    expect(mocks.MarketsListWidget).toHaveBeenCalledTimes(1);
    const listProps = mocks.MarketsListWidget.mock.calls[0][0];
    // Supplemental layout: the list sizes to content instead of the fixed
    // calc height so the appended section stays reachable.
    expect(listProps.tableClassNames.scroll).toContain("!oui-h-auto");
    expect(listProps.tableClassNames.root).toContain("!oui-h-auto");
  });

  it("keeps the favorites header, hides an empty Perps table, and restores it after the last Prediction favorite is removed", async () => {
    const { MarketsList } =
      await import("@orderly.network/markets-core/src/components/marketsList/marketsList.ui");
    const renderTabAfterContent = vi.fn(
      (): React.ReactNode => <div data-testid="prediction-favorites" />,
    );
    let dataSource: { symbol: string }[] = [];
    mocks.MarketsListWidget.mockImplementation((props) => (
      <MarketsList
        {...props}
        favorite={{} as never}
        isFavoritesList
        dataSource={dataSource}
        loading={false}
        isHiddenByLowVolumeFilter={false}
        onSort={vi.fn()}
        renderHeader={() => <div data-testid="favorites-header" />}
        emptyView={<div data-testid="add-favorites" />}
      />
    ));
    const view = () => (
      <MarketsProvider tabs={[{ type: "favorites" }]}>
        <MarketsSheet
          {...mocks.sheetState}
          activeTab="favorites"
          renderTabAfterContent={renderTabAfterContent}
        />
      </MarketsProvider>
    );
    try {
      mount(view());
      expect(
        root!.root.findAllByProps({ "data-testid": "favorites-header" }),
      ).toHaveLength(1);
      expect(
        root!.root.findAllByProps({ "data-testid": "perps-table" }),
      ).toHaveLength(0);
      expect(
        root!.root.findAllByProps({ "data-testid": "prediction-favorites" }),
      ).toHaveLength(1);

      dataSource = [{ symbol: "PERP_BTC_USDC" }];
      act(() => root!.update(view()));
      expect(
        root!.root.findByProps({ "data-testid": "perps-table" }).children,
      ).toHaveLength(1);
      expect(
        root!.root.findAllByProps({ "data-testid": "prediction-favorites" }),
      ).toHaveLength(1);

      dataSource = [];
      renderTabAfterContent.mockReturnValue(null);
      act(() => root!.update(view()));
      expect(
        root!.root.findAllByProps({ "data-testid": "add-favorites" }),
      ).toHaveLength(1);
      expect(
        root!.root.findAllByProps({ "data-testid": "prediction-favorites" }),
      ).toHaveLength(0);
    } finally {
      mocks.MarketsListWidget.mockReset();
      mocks.MarketsListWidget.mockImplementation(() => null);
    }
  });
});

describe("ExpandMarkets", () => {
  it("renders the custom panel for the prediction tab instead of the perps list", () => {
    mount(
      <MarketsProvider tabs={[predictionTab]}>
        <ExpandMarkets
          {...mocks.expandState}
          activeTab={predictionActiveTab}
          renderTabContent={predictionPanel}
        />
      </MarketsProvider>,
    );
    expect(
      root!.root.findByProps({ "data-testid": "prediction-panel" }),
    ).toBeDefined();
    expect(mocks.MarketsListWidget).not.toHaveBeenCalled();
  });
});

describe("MarketsDataList", () => {
  it("renders the custom panel for the prediction tab instead of the full perps table", () => {
    mount(
      <MarketsProvider tabs={[{ type: "all" }, predictionTab]}>
        <MarketsDataList
          {...mocks.dataListState}
          activeTab="prediction"
          renderTabContent={predictionPanel}
        />
      </MarketsProvider>,
    );
    expect(
      root!.root.findByProps({ "data-testid": "prediction-panel" }),
    ).toBeDefined();
    expect(mocks.MarketsListFullWidget).not.toHaveBeenCalled();
  });
});

describe("SideMarkets", () => {
  it("forwards extension tabs and renderers to the expanded panel", () => {
    mount(
      <MarketsProvider tabs={[{ type: "all" }, predictionTab]}>
        <SideMarkets
          {...mocks.sideState}
          panelSize="large"
          tabs={[{ type: "all" }, predictionTab]}
          renderTabContent={predictionPanel}
        />
      </MarketsProvider>,
    );
    expect(mocks.ExpandMarketsWidget).toHaveBeenCalledTimes(1);
    const expandProps = mocks.ExpandMarketsWidget.mock.calls[0][0];
    expect(expandProps.tabs).toEqual([{ type: "all" }, predictionTab]);
    expect(expandProps.renderTabContent).toBe(predictionPanel);
  });

  it("falls back to the All list in collapsed mode when a custom tab was persisted", () => {
    mount(
      <MarketsProvider tabs={[{ type: "all" }, predictionTab]}>
        <SideMarkets {...mocks.sideState} panelSize="middle" />
      </MarketsProvider>,
    );
    expect(mocks.MarketsListWidget).toHaveBeenCalledTimes(1);
    expect(mocks.MarketsListWidget.mock.calls[0][0].type).toBe("all");
  });
});

describe.each([
  ["desktop", MarketsDataList],
  ["mobile", MobileMarketsDataList],
] as const)("%s Markets New listings", (surface, DataList) => {
  it.each(["click", "fallback"])(
    "renders New listings when selected by %s",
    async (selection) => {
      let state!: ReturnType<typeof useMarketsDataListScript>;
      function Consumer() {
        state = useMarketsDataListScript();
        return <DataList {...state} />;
      }
      await act(async () => {
        root = create(
          <MarketsProvider
            tabs={
              selection === "click"
                ? [
                    { type: "favorites" },
                    { type: "all" },
                    { type: "newListing" },
                  ]
                : [{ type: "newListing" }]
            }
          >
            <Consumer />
          </MarketsProvider>,
        );
      });
      if (selection === "click") {
        vi.clearAllMocks();
        const triggerValue = root!.root.findAllByType(TabPanel).at(-1)!.props
          .value;
        await act(async () => {
          root!.root.findByType(Tabs).props.onValueChange(triggerValue);
        });
      }
      expect(state.activeTab).toBe("newListing");
      const list =
        surface === "desktop"
          ? mocks.MarketsListFullWidget
          : mocks.MarketsListWidget;
      expect(list).toHaveBeenCalled();
      expect(list.mock.calls.at(-1)![0].type).toBe(
        surface === "desktop" ? "new" : "newListing",
      );
    },
  );
});

describe.each([
  ["desktop", MarketsDataList],
  ["mobile", MobileMarketsDataList],
] as const)("%s Markets favorites", (surface, DataList) => {
  it("appends Prediction and hides the empty Perps table until the last star is removed", async () => {
    const renderTabAfterContent = vi.fn(
      (): React.ReactNode => <div data-testid="prediction-favorites" />,
    );
    const view = () => (
      <MarketsProvider tabs={[{ type: "favorites" }]}>
        <DataList
          {...mocks.dataListState}
          activeTab="favorites"
          renderTabAfterContent={renderTabAfterContent}
        />
      </MarketsProvider>
    );
    await act(async () => {
      root = create(view());
    });
    expect(
      root!.root.findByProps({ "data-testid": "prediction-favorites" }),
    ).toBeDefined();
    const list =
      surface === "desktop"
        ? mocks.FavoritesListFullWidget
        : mocks.MarketsListWidget;
    expect(list.mock.calls.at(-1)![0].hideEmptyTable).toBe(true);
    renderTabAfterContent.mockReturnValue(null);
    await act(async () => {
      root!.update(view());
    });
    expect(list.mock.calls.at(-1)![0].hideEmptyTable).toBe(false);
    expect(
      root!.root.findAllByProps({ "data-testid": "prediction-favorites" }),
    ).toHaveLength(0);
  });
});
