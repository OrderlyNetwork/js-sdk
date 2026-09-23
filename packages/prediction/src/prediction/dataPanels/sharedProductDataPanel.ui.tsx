import React from "react";
import { useTranslation } from "@orderly.network/i18n";
import { PerpsPositionsPanel } from "@orderly.network/trading";
import { cn } from "@orderly.network/ui";
import { PositionHistoryWidget } from "@orderly.network/ui-positions";
import type { PredictionState } from "../prediction.script";
import { PredictionHistoryTable } from "./history/predictionHistoryTable.widget";
import { HoldingsTable } from "./holdings/holdingsTable.widget";
import {
  useSharedProductDataPanelScript,
  type ProductDataType,
  type ProductType,
} from "./sharedProductDataPanel.script";

export type SharedProductDataPanelProps = {
  state: PredictionState;
  type: ProductDataType;
  /** The product shown when this panel first opens on a page. */
  initialProduct: ProductType;
  perpsSymbol?: string;
  /** Content rendered before the Perps / Prediction control, such as account filters. */
  beforeProductSelector?: React.ReactNode;
  perpsPositionsContent?: React.ReactNode;
  perpsPositionHistoryContent?: React.ReactNode;
  onProductChange?: (product: ProductType) => void;
};

/**
 * Lets either trading surface inspect Perps and Prediction data without
 * combining their different columns or filters into one table.
 */
export const SharedProductDataPanel: React.FC<SharedProductDataPanelProps> = ({
  state,
  type,
  initialProduct,
  perpsSymbol,
  beforeProductSelector,
  perpsPositionsContent,
  perpsPositionHistoryContent,
  onProductChange,
}) => {
  const { t } = useTranslation();
  const {
    product,
    selectProduct,
    perpsPositionCount,
    predictionPositionCount,
  } = useSharedProductDataPanelScript({
    initialProduct,
    predictionPositionCount: state.positions.length,
    onProductChange,
  });

  const content =
    product === "prediction" ? (
      type === "positions" ? (
        <HoldingsTable state={state} />
      ) : (
        <PredictionHistoryTable state={state} />
      )
    ) : type === "positions" ? (
      (perpsPositionsContent ?? <PerpsPositionsPanel symbol={perpsSymbol} />)
    ) : (
      (perpsPositionHistoryContent ?? <PositionHistoryWidget />)
    );

  return (
    <div className="oui-flex oui-h-full oui-min-h-0 oui-flex-col oui-overflow-hidden">
      {beforeProductSelector}
      <div
        role="tablist"
        aria-label={t("common.positions")}
        className="oui-mt-2 oui-inline-flex oui-w-fit oui-gap-x-[6px]"
      >
        {(["perps", "prediction"] as const).map((item) => {
          const active = product === item;
          return (
            <button
              key={item}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => selectProduct(item)}
              data-state={active ? "active" : "inactive"}
              className={cn(
                "oui-group !oui-rounded-md oui-inline-flex oui-h-7 oui-items-center oui-justify-center oui-gap-x-1 oui-bg-base-7 oui-px-3 oui-text-2xs oui-font-medium oui-text-base-contrast-36 oui-transition-all hover:oui-bg-base-5 hover:oui-text-base-contrast-54 data-[state=active]:oui-bg-base-5 data-[state=active]:oui-text-base-contrast",
              )}
            >
              {item === "perps" ? t("common.perps") : t("prediction.title")} (
              {item === "perps" ? perpsPositionCount : predictionPositionCount})
            </button>
          );
        })}
      </div>
      {/* Remaining height after the product switcher; tables scroll inside. */}
      <div className="oui-min-h-0 oui-flex-1 oui-overflow-hidden">
        {content}
      </div>
    </div>
  );
};
