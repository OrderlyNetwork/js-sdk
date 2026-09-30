import React, { useState } from "react";
import { useTranslation } from "@orderly.network/i18n";
import { TabPanel, Tabs } from "@orderly.network/ui";
import { MobilePositionHistoryWidget } from "@orderly.network/ui-positions";
import type { PredictionState } from "../prediction.script";
import { MobilePredictionHistory } from "./predictionMobileCards.ui";
import { MobileSharedProductOrdersPanel } from "./sharedProductOrdersPanel.mobile.ui";
import { useScopedPredictionState } from "./useScopedPredictionState";

type HistoryTab = "perps" | "prediction" | "orders";

export const MobileSharedProductHistory: React.FC<{
  state: PredictionState;
  initialProduct: "perps" | "prediction";
  perpsSymbol?: string;
  predictionUnderlyingSymbol?: string;
}> = ({ state, initialProduct, perpsSymbol, predictionUnderlyingSymbol }) => {
  const { t } = useTranslation();
  const [tab, setTab] = useState<HistoryTab>(initialProduct);
  const scopedState = useScopedPredictionState(
    state,
    predictionUnderlyingSymbol,
  );

  return (
    <Tabs
      value={tab}
      onValueChange={(value) => setTab(value as HistoryTab)}
      size="md"
      classNames={{ tabsList: "oui-bg-base-9 oui-rounded-t-xl oui-p-2" }}
    >
      <TabPanel value="perps" title={t("prediction.history.perps")}>
        <MobilePositionHistoryWidget
          symbol={perpsSymbol}
          productType="PERP"
          classNames={{ cell: "oui-p-2 oui-bg-base-9 oui-rounded-xl" }}
        />
      </TabPanel>
      <TabPanel value="prediction" title={t("prediction.history.prediction")}>
        <MobilePredictionHistory state={scopedState} />
      </TabPanel>
      <TabPanel value="orders" title={t("orders.orderHistory")}>
        <MobileSharedProductOrdersPanel
          state={state}
          mode="history"
          perpsSymbol={perpsSymbol}
          predictionUnderlyingSymbol={predictionUnderlyingSymbol}
        />
      </TabPanel>
    </Tabs>
  );
};
