import React from "react";
import { useTranslation } from "@orderly.network/i18n";
import type { DataFilterItem } from "@orderly.network/ui";
import { DesktopOrderList } from "@orderly.network/ui-orders";
import type { PredictionState } from "../prediction.script";
import { PredictionOrderCell } from "./orders/predictionOrderCell.ui";
import { PredictionOrdersTable } from "./orders/predictionOrdersTable.widget";
import {
  useAllProductOrdersTableScript,
  useSharedProductOrdersPanelScript,
  type ProductOrderMode,
} from "./sharedProductOrdersPanel.script";

const AllProductOrdersTable: React.FC<{
  state: PredictionState;
  mode: ProductOrderMode;
  includePrediction: boolean;
  productFilterItems: DataFilterItem[];
  onProductFilter: (filter: { name: string; value: unknown }) => void;
}> = ({
  state,
  mode,
  includePrediction,
  productFilterItems,
  onProductFilter,
}) => {
  const { orderListState, predictionOrders } = useAllProductOrdersTableScript({
    state,
    mode,
  });

  return (
    <DesktopOrderList
      {...(orderListState as React.ComponentProps<typeof DesktopOrderList>)}
      additionalFilterItems={productFilterItems}
      onAdditionalFilter={onProductFilter}
      supplementalRows={
        includePrediction
          ? predictionOrders.map((order) => ({
              id: `prediction-${order.id}`,
              timestamp: order.timestamp,
              renderCell: (field) => (
                <PredictionOrderCell
                  state={state}
                  order={order}
                  field={field}
                />
              ),
            }))
          : undefined
      }
    />
  );
};

export const SharedProductOrdersPanel: React.FC<{
  state: PredictionState;
  mode: ProductOrderMode;
}> = ({ state, mode }) => {
  const { t } = useTranslation();
  const { instrument, onProductFilter } = useSharedProductOrdersPanelScript();
  const productFilterItems: DataFilterItem[] = [
    {
      type: "select",
      name: "instrument",
      value: instrument,
      options: [
        { label: t("prediction.filter.allInstruments"), value: "all" },
        { label: t("common.perps"), value: "perps" },
        { label: t("prediction.title"), value: "prediction" },
      ],
    },
  ];

  const content =
    instrument === "prediction" ? (
      <PredictionOrdersTable
        state={state}
        mode={mode}
        leadingFilterItems={productFilterItems}
        onLeadingFilter={onProductFilter}
      />
    ) : (
      <AllProductOrdersTable
        state={state}
        mode={mode}
        includePrediction={instrument === "all"}
        productFilterItems={productFilterItems}
        onProductFilter={onProductFilter}
      />
    );

  // Clip to the tab pane so only DataTable's internal scrollbar appears.
  return (
    <div className="oui-flex oui-h-full oui-min-h-0 oui-flex-col oui-overflow-hidden">
      {content}
    </div>
  );
};
