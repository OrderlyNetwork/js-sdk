import React, { useState } from "react";
import { useTranslation } from "@orderly.network/i18n";
import { AssetsModule } from "@orderly.network/portfolio";
import { PerpsPositionsSettings } from "@orderly.network/trading";
import { Box, cn, TabPanel, Tabs, useScreen } from "@orderly.network/ui";
import type { PredictionDataTab, PredictionState } from "../prediction.script";
import type { ProductType } from "./sharedProductDataPanel.script";
import { SharedProductDataPanel } from "./sharedProductDataPanel.ui";
import { MobileSharedProductHistory } from "./sharedProductHistory.mobile.ui";
import { MobileSharedProductOrdersPanel } from "./sharedProductOrdersPanel.mobile.ui";
import { SharedProductOrdersPanel } from "./sharedProductOrdersPanel.ui";
import { useSharedProductCounts } from "./useSharedProductCounts";

export type PredictionDataPanelProps = {
  state: PredictionState;
  tabs?: PredictionDataTab[];
  className?: string;
  embedded?: boolean;
};

const defaultTabs: PredictionDataTab[] = [
  "predictions",
  "openOrders",
  "filled",
  "predictionHistory",
  "orderHistory",
  "assets",
];
const defaultMobileTabs: PredictionDataTab[] = [
  "predictions",
  "openOrders",
  "history",
  "assets",
];

export const PredictionDataPanel: React.FC<PredictionDataPanelProps> = (
  props,
) => {
  const { isMobile } = useScreen();
  return isMobile ? (
    <MobilePredictionDataPanel {...props} />
  ) : (
    <DesktopPredictionDataPanel {...props} />
  );
};

const MobilePredictionDataPanel: React.FC<PredictionDataPanelProps> = ({
  state,
  tabs = defaultTabs,
  className,
  embedded = false,
}) => {
  const { t } = useTranslation();
  const counts = useSharedProductCounts(state);
  const mobileTabs = tabs === defaultTabs ? defaultMobileTabs : tabs;
  const activeTab = mobileTabs.includes(state.activeTab)
    ? state.activeTab
    : ["filled", "predictionHistory", "orderHistory"].includes(state.activeTab)
      ? "history"
      : "predictions";
  const tabCount: Partial<Record<PredictionDataTab, number | null>> = {
    openOrders: counts.pending,
    predictions: counts.positions,
  };
  const content: Record<PredictionDataTab, React.ReactNode> = {
    predictions: (
      <SharedProductDataPanel
        state={state}
        type="positions"
        initialProduct="prediction"
        mobile
      />
    ),
    openOrders: <MobileSharedProductOrdersPanel state={state} mode="pending" />,
    filled: <MobileSharedProductOrdersPanel state={state} mode="filled" />,
    predictionHistory: (
      <SharedProductDataPanel
        state={state}
        type="positionHistory"
        initialProduct="prediction"
        mobile
      />
    ),
    orderHistory: (
      <MobileSharedProductOrdersPanel state={state} mode="history" />
    ),
    history: (
      <MobileSharedProductHistory state={state} initialProduct="prediction" />
    ),
    assets: <AssetsModule.AssetsWidget />,
  };
  return (
    <div
      className={cn(
        "oui-prediction-dataPanel-mobile oui-w-full oui-rounded-xl oui-bg-base-9",
        className,
      )}
    >
      <Tabs
        value={activeTab}
        onValueChange={(value) =>
          state.setActiveTab(value as PredictionDataTab)
        }
        size="lg"
        classNames={{
          tabsList: cn(
            "oui-hide-scrollbar oui-overflow-x-auto oui-rounded-t-xl oui-bg-base-9 oui-p-2",
            embedded && "!oui-border-none",
          ),
        }}
      >
        {mobileTabs.map((tab) => (
          <TabPanel
            key={tab}
            value={tab}
            title={
              <>
                {tab === "history"
                  ? t("trading.history")
                  : t(`prediction.tab.${tab}`)}
                {(tabCount[tab] ?? 0) > 0 && ` (${tabCount[tab]})`}
              </>
            }
          >
            {content[tab]}
          </TabPanel>
        ))}
      </Tabs>
    </div>
  );
};

const DesktopPredictionDataPanel: React.FC<PredictionDataPanelProps> = ({
  state,
  tabs = defaultTabs,
  className,
  embedded = false,
}) => {
  const { t } = useTranslation();
  const counts = useSharedProductCounts(state);
  const activeTab = tabs.includes(state.activeTab)
    ? state.activeTab
    : state.activeTab === "history"
      ? "predictionHistory"
      : "predictions";
  const [positionProduct, setPositionProduct] =
    useState<ProductType>("prediction");

  const tabCount: Partial<Record<PredictionDataTab, number | null>> = {
    openOrders: counts.pending,
    predictions: counts.positions,
  };

  const tabContent: Record<PredictionDataTab, React.ReactNode> = {
    openOrders: <SharedProductOrdersPanel state={state} mode="pending" />,
    predictions: (
      <SharedProductDataPanel
        state={state}
        type="positions"
        initialProduct="prediction"
        onProductChange={setPositionProduct}
      />
    ),
    filled: <SharedProductOrdersPanel state={state} mode="filled" />,
    predictionHistory: (
      <SharedProductDataPanel
        state={state}
        type="positionHistory"
        initialProduct="prediction"
      />
    ),
    assets: <AssetsModule.AssetsTabWidget />,
    orderHistory: <SharedProductOrdersPanel state={state} mode="history" />,
    history: null,
  };

  return (
    <Box
      intensity={900}
      r={embedded ? undefined : "2xl"}
      p={embedded ? 0 : 2}
      className={cn(
        "oui-prediction-dataPanel-container oui-h-full oui-min-h-0 oui-overflow-hidden",
        "oui-relative",
        className,
      )}
    >
      <Tabs
        className="oui-prediction-dataPanel-tabs oui-h-full oui-min-h-0"
        value={activeTab}
        onValueChange={(value) =>
          state.setActiveTab(value as PredictionDataTab)
        }
        variant={embedded ? undefined : "contained"}
        size={embedded ? undefined : "lg"}
        classNames={{
          tabsList: embedded ? "!oui-border-none oui-pb-1" : undefined,
          trigger: "oui-group oui-dataPanel-tab-btn",
          // Perp DataList parity: fixed content height, no outer overflow.
          // `overflow-x-auto` would also force overflow-y to auto (CSS quirk)
          // and produce the external scrollbar around filters + table.
          tabsContent: embedded
            ? "oui-h-[calc(100%_-_28px)] oui-min-h-0 oui-overflow-hidden"
            : "oui-h-[calc(100%_-_32px)] oui-min-h-0 oui-overflow-hidden",
        }}
      >
        {tabs.map((tab) => (
          <TabPanel
            key={tab}
            value={tab}
            title={
              <>
                {tab === "history"
                  ? t("trading.history")
                  : t(`prediction.tab.${tab}`)}
                {(tabCount[tab] ?? 0) > 0 && ` (${tabCount[tab]})`}
              </>
            }
          >
            {tabContent[tab]}
          </TabPanel>
        ))}
      </Tabs>
      {state.activeTab === "predictions" && positionProduct === "perps" && (
        <div className="oui-absolute oui-end-2 oui-top-2 oui-z-10">
          <PerpsPositionsSettings />
        </div>
      )}
    </Box>
  );
};
