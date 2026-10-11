import React from "react";
import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ExpandMarketsWidget } from "@orderly.network/markets-core/src/components/expandMarkets/expandMarkets.widget";
import { MarketsProvider } from "@orderly.network/markets-core/src/components/marketsProvider";
import { MarketsSheetWidget } from "@orderly.network/markets-core/src/components/marketsSheet/marketsSheet.widget";
import { SideMarketsWidget } from "@orderly.network/markets-core/src/components/sideMarkets/sideMarkets.widget";
import { useMarketsDataListScript } from "@orderly.network/markets-core/src/pages/home/marketsDataList/marketsDataList.script";
import { MarketsHomePage } from "@orderly.network/markets-core/src/pages/home/page";

const mocks = vi.hoisted(() => ({
  sheetState: {
    activeTab: "prediction",
    onTabChange: vi.fn(),
    tabSort: {},
    onTabSort: vi.fn(),
  },
  expandState: {
    activeTab: "prediction",
    onTabChange: vi.fn(),
    tabSort: {},
    onTabSort: vi.fn(),
  },
  sideState: {
    activeTab: "prediction",
    onTabChange: vi.fn(),
    tabSort: {},
    onTabSort: vi.fn(),
    panelSize: "large" as const,
  },
  ExpandMarkets: vi.fn((_props: any) => null),
  MarketsSheet: vi.fn((_props: any) => null),
  SideMarkets: vi.fn((_props: any) => null),
  MarketsDataListWidget: vi.fn((_props: any) => null),
}));

vi.mock(
  "@orderly.network/markets-core/src/components/expandMarkets/expandMarkets.script",
  () => ({ useExpandMarketsScript: () => mocks.expandState }),
);
vi.mock(
  "@orderly.network/markets-core/src/components/expandMarkets/expandMarkets.ui",
  () => ({ ExpandMarkets: mocks.ExpandMarkets }),
);
vi.mock(
  "@orderly.network/markets-core/src/components/marketsSheet/marketsSheet.script",
  () => ({ useMarketsSheetScript: () => mocks.sheetState }),
);
vi.mock(
  "@orderly.network/markets-core/src/components/marketsSheet/marketsSheet.ui",
  () => ({ MarketsSheet: mocks.MarketsSheet }),
);
vi.mock(
  "@orderly.network/markets-core/src/components/sideMarkets/sideMarkets.script",
  () => ({ useSideMarketsScript: () => mocks.sideState }),
);
vi.mock(
  "@orderly.network/markets-core/src/components/sideMarkets/sideMarkets.ui",
  () => ({ SideMarkets: mocks.SideMarkets }),
);
vi.mock(
  "@orderly.network/markets-core/src/components/shared/hooks/useMarketCategories",
  () => ({ useMarketCategories: () => [{ type: "all" }] }),
);
vi.mock(
  "@orderly.network/markets-core/src/pages/home/marketsHeader/marketsHeader.widget",
  () => ({ MarketsHeaderWidget: () => null }),
);
vi.mock("@orderly.network/markets-core/src/pages/home/marketsDataList", () => ({
  MarketsDataListWidget: mocks.MarketsDataListWidget,
}));
vi.mock(
  "@orderly.network/markets-core/src/pages/home/funding/funding.widget",
  () => ({
    FundingWidget: () => null,
  }),
);
// The real ui Tabs need the theme provider's getComponentTheme and useScreen
// reaches window.matchMedia — neither exists in the node env.
vi.mock("@orderly.network/ui", () => {
  const wrapper = ({ children }: { children?: React.ReactNode }) => children;
  return {
    cn: (...args: unknown[]) => args.filter(Boolean).join(" "),
    Box: wrapper,
    Tabs: wrapper,
    TabPanel: wrapper,
    useScreen: () => ({ isMobile: false, isDesktop: true }),
  };
});

vi.mock(
  "@orderly.network/markets-core/src/components/shared/hooks/useTabSort",
  () => ({
    useTabSort: () => ({ tabSort: {}, onTabSort: vi.fn() }),
  }),
);

const predictionTab = {
  id: "prediction",
  name: "Prediction",
  match: () => false,
};

let root: ReactTestRenderer | undefined;
// Lazy children (SideMarkets, MarketsDataListWidget) need a microtask flush
// to swap in from the Suspense fallback.
async function mount(node: React.ReactElement) {
  await act(async () => {
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

describe("MarketsSheetWidget", () => {
  it("honours extension tabs, threads renderers, and maps onRequestClose to hide", () => {
    const onRequestClose = vi.fn();
    const renderTabContent = vi.fn();
    const renderTabAfterContent = vi.fn();
    act(() => {
      root = create(
        <MarketsSheetWidget
          symbol="PERP_BTC_USDC"
          tabs={[{ type: "all" }, predictionTab]}
          renderTabContent={renderTabContent}
          renderTabAfterContent={renderTabAfterContent}
          onRequestClose={onRequestClose}
        />,
      );
    });
    expect(root!.root.findByType(MarketsProvider).props.tabs).toEqual([
      { type: "all" },
      predictionTab,
    ]);
    const sheetProps = mocks.MarketsSheet.mock.calls[0][0];
    expect(sheetProps.renderTabContent).toBe(renderTabContent);
    expect(sheetProps.renderTabAfterContent).toBe(renderTabAfterContent);
    expect(sheetProps.hide).toBe(onRequestClose);
    // The persisted "prediction" tab still exists, so it stays active.
    expect(sheetProps.activeTab).toBe("prediction");
  });

  it("falls back to the first tab when the persisted tab is gone", () => {
    act(() => {
      root = create(<MarketsSheetWidget tabs={[{ type: "all" }]} />);
    });
    expect(mocks.MarketsSheet.mock.calls[0][0].activeTab).toBe("all");
  });

  it("defaults to the registry tabs when no extension tabs are given", () => {
    act(() => {
      root = create(<MarketsSheetWidget />);
    });
    expect(root!.root.findByType(MarketsProvider).props.tabs).toEqual([
      { type: "all" },
    ]);
  });
});

describe("ExpandMarketsWidget", () => {
  it("falls back to the first tab when the active tab is gone", () => {
    act(() => {
      root = create(<ExpandMarketsWidget tabs={[{ type: "all" }]} />);
    });
    expect(mocks.ExpandMarkets.mock.calls[0][0].activeTab).toBe("all");
    expect(mocks.ExpandMarkets.mock.calls[0][0].tabSort).toBe(
      mocks.expandState.tabSort,
    );
  });

  it("keeps the active tab and threads renderers when the tab still exists", () => {
    const renderTabContent = vi.fn();
    act(() => {
      root = create(
        <ExpandMarketsWidget
          tabs={[{ type: "all" }, predictionTab]}
          renderTabContent={renderTabContent}
        />,
      );
    });
    const expandProps = mocks.ExpandMarkets.mock.calls[0][0];
    expect(expandProps.activeTab).toBe("prediction");
    expect(expandProps.renderTabContent).toBe(renderTabContent);
    expect(root!.root.findByType(MarketsProvider).props.tabs).toEqual([
      { type: "all" },
      predictionTab,
    ]);
  });
});

describe("SideMarketsWidget", () => {
  it("forwards extension tabs and renderers to the side markets UI", async () => {
    const renderTabContent = vi.fn();
    await mount(
      <SideMarketsWidget
        symbol="PERP_BTC_USDC"
        panelSize="large"
        tabs={[{ type: "all" }, predictionTab]}
        renderTabContent={renderTabContent}
      />,
    );
    const sideProps = mocks.SideMarkets.mock.calls[0][0];
    expect(sideProps.tabs).toEqual([{ type: "all" }, predictionTab]);
    expect(sideProps.renderTabContent).toBe(renderTabContent);
    expect(sideProps.panelSize).toBe("large");
  });
});

describe("MarketsHomePage", () => {
  it("honours extension tabs and threads renderTabContent to the data list", async () => {
    const renderTabContent = vi.fn();
    await mount(
      <MarketsHomePage
        tabs={[{ type: "all" }, predictionTab]}
        renderTabContent={renderTabContent}
      />,
    );
    expect(root!.root.findByType(MarketsProvider).props.tabs).toEqual([
      { type: "all" },
      predictionTab,
    ]);
    expect(mocks.MarketsDataListWidget).toHaveBeenCalled();
    expect(mocks.MarketsDataListWidget.mock.calls[0][0].renderTabContent).toBe(
      renderTabContent,
    );
  });

  it("falls back to the marketsDataList registry tabs by default", async () => {
    await mount(<MarketsHomePage />);
    expect(root!.root.findByType(MarketsProvider).props.tabs).toEqual([
      { type: "all" },
    ]);
  });
});

describe("Markets data list selection", () => {
  it("recovers when the selected custom tab is removed", async () => {
    let state!: ReturnType<typeof useMarketsDataListScript>;
    function Consumer() {
      state = useMarketsDataListScript();
      return null;
    }
    const view = (tabs) => (
      <MarketsProvider tabs={tabs}>
        <Consumer />
      </MarketsProvider>
    );
    await mount(view([{ type: "all" }, predictionTab]));
    act(() => state.onTabChange("prediction"));
    expect(state.activeTab).toBe("prediction");
    act(() => root!.update(view([{ type: "crypto" }])));
    expect(state.activeTab).toBe("crypto");
  });
});
