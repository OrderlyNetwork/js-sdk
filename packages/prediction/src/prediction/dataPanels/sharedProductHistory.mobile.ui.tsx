import React, { useState } from "react";
import { useTranslation } from "@orderly.network/i18n";
import { TabPanel, Tabs } from "@orderly.network/ui";
import { MobilePositionHistoryWidget } from "@orderly.network/ui-positions";
import type { PredictionAccountPanelState } from "../prediction.types";
import type { PredictionPerpsPanelProps } from "./perpsPanel.types";
import { MobilePredictionHistory } from "./predictionMobileCards.ui";
import { MobileSharedProductOrdersPanel } from "./sharedProductOrdersPanel.mobile.ui";
import { useScopedPredictionAccount } from "./useScopedPredictionAccount";

type HistoryTab = "perps" | "prediction" | "orders";

export interface MobileSharedProductHistoryProps extends PredictionPerpsPanelProps {
  state: PredictionAccountPanelState;
  initialProduct: "perps" | "prediction";
  perpsSymbol?: string;
  predictionUnderlyingSymbol?: string;
}

export const MobileSharedProductHistory: React.FC<
  MobileSharedProductHistoryProps
> = ({
  state,
  initialProduct,
  perpsSymbol,
  predictionUnderlyingSymbol,
  onSymbolChange,
  sharePnLConfig,
  pnlNotionalDecimalPrecision,
}) => {
  const { t } = useTranslation();
  const [tab, setTab] = useState<HistoryTab>(initialProduct);
  const scopedState = useScopedPredictionAccount(
    state,
    predictionUnderlyingSymbol,
  );

  const perpsProps = {
    onSymbolChange,
    sharePnLConfig,
    pnlNotionalDecimalPrecision,
  };

  return (
    <Tabs
      value={tab}
      onValueChange={(value) => setTab(value as HistoryTab)}
      size="md"
      classNames={{ tabsList: "oui-bg-base-9 oui-rounded-t-xl oui-p-2" }}
    >
      <TabPanel value="perps" title={t("prediction.history.perps")}>
        <MobilePositionHistoryWidget
          {...perpsProps}
          symbol={perpsSymbol}
          productType="PERP"
          classNames={{ cell: "oui-p-2 oui-bg-base-9 oui-rounded-xl" }}
        />
      </TabPanel>
      <TabPanel value="prediction" title={t("prediction.history.prediction")}>
        <MobilePredictionHistory
          state={scopedState}
          predictionUnderlyingSymbol={predictionUnderlyingSymbol}
        />
      </TabPanel>
      <TabPanel value="orders" title={t("orders.orderHistory")}>
        <MobileSharedProductOrdersPanel
          {...perpsProps}
          state={state}
          mode="history"
          perpsSymbol={perpsSymbol}
          predictionUnderlyingSymbol={predictionUnderlyingSymbol}
        />
      </TabPanel>
    </Tabs>
  );
};
