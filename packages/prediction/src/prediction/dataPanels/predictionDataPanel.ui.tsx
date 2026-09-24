import React, { useState } from "react";
import { useTranslation } from "@orderly.network/i18n";
import { AssetsModule } from "@orderly.network/portfolio";
import { PerpsPositionsSettings } from "@orderly.network/trading";
import { Box, cn, TabPanel, Tabs, useScreen } from "@orderly.network/ui";
import type { PredictionDataTab, PredictionState } from "../prediction.script";
import type { ProductType } from "./sharedProductDataPanel.script";
import { SharedProductDataPanel } from "./sharedProductDataPanel.ui";
import { MobileSharedProductOrdersPanel } from "./sharedProductOrdersPanel.mobile.ui";
import { SharedProductOrdersPanel } from "./sharedProductOrdersPanel.ui";

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
  const tabCount: Partial<Record<PredictionDataTab, number>> = {
    openOrders: state.openOrders.length,
    predictions: state.positions.length,
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
        value={state.activeTab}
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
        {tabs.map((tab) => (
          <TabPanel
            key={tab}
            value={tab}
            title={
              <>
                {t(`prediction.tab.${tab}`)}
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
  const [positionProduct, setPositionProduct] =
    useState<ProductType>("prediction");

  const tabCount: Partial<Record<PredictionDataTab, number>> = {
    openOrders: state.openOrders.length,
    predictions: state.positions.length,
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
        value={state.activeTab}
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
                {t(`prediction.tab.${tab}`)}
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
